import dotenv from 'dotenv';
import { httpServer, io } from './app.js';
import { prisma } from './database/prisma.js';

// 👇 1. Importação do nosso motor de física (dados)
import { rollDice } from './utils/dice-roller.js'; 

dotenv.config();

const PORT = process.env.PORT || 3000;

// ==========================================
// Lógica de WebSockets (Ouvintes)
// ==========================================
io.on('connection', (socket) => {
  console.log(`🟢 [Socket] Novo cliente conectado: ${socket.id}`);

  // 1. Entrar na Sala da Mesa
  socket.on('join_table', (tableId: string) => {
    socket.join(tableId);
    console.log(`🚪 [Socket] Cliente ${socket.id} entrou na mesa (Room): ${tableId}`);
    
    socket.to(tableId).emit('system_message', { 
      message: 'Um novo jogador conectou-se ao tabuleiro.' 
    });
  });

  // 2. Sistema de Chat e Logs (STORY, OOC, DICE, LOG)
  socket.on('send_message', async (data: { 
    tableId: string, 
    userId: string, 
    content: string, 
    type: 'STORY' | 'OOC' | 'DICE' | 'LOG', 
    characterId?: string 
  }) => {
    try {
      // Salva a mensagem no Banco de Dados via Prisma
      const newMessage = await prisma.message.create({
        data: {
          tableId: data.tableId,
          userId: data.userId,
          content: data.content,
          type: data.type,
          characterId: data.characterId || null
        },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          character: { select: { firstName: true, avatarUrl: true } }
        }
      });

      // 📢 Emite a mensagem para todos os conectados na sala da mesa
      io.to(data.tableId).emit('new_message', newMessage);
      
    } catch (error) {
      console.error('❌ [Socket] Erro ao processar mensagem:', error);
    }
  });

  // 👇 3. NOVO: Sistema de Rolagem de Dados (DICE)
  socket.on('roll_dice', async (data: { 
    tableId: string, 
    userId: string, 
    characterId?: string, 
    notation: string 
  }) => {
    try {
      // O Backend faz a rolagem real chamando o utilitário
      const diceResult = rollDice(data.notation);

      // Salva o resultado no banco como uma mensagem do tipo DICE
      const diceMessage = await prisma.message.create({
        data: {
          tableId: data.tableId,
          userId: data.userId,
          characterId: data.characterId || null,
          content: diceResult.content, // Ex: "Rolou 1d20+5: **18** [13]"
          type: 'DICE'
        },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          character: { select: { firstName: true, avatarUrl: true } }
        }
      });

      // 📢 Envia o resultado para toda a mesa ver ao mesmo tempo!
      io.to(data.tableId).emit('new_message', diceMessage);

    } catch (error: any) {
      // Se a notação for inválida, devolve um erro apenas para quem tentou rolar
      // O Front-end pode ouvir esse evento e disparar um Toast de erro
      socket.emit('system_error', { message: error.message || 'Erro ao rolar dados.' });
    }
  });

  // ==========================================
  // MOTOR DE COMBATE: Iniciar/Parar Combate
  // ==========================================
  socket.on('toggle_combat', async (data: { tableId: string, isActive: boolean, turnOrder: string[] }) => {
    try {
      // 1. Atualiza o Estado da Mesa
      const updatedState = await prisma.tableState.upsert({
        where: { tableId: data.tableId },
        update: {
          isCombatActive: data.isActive,
          turnOrder: data.isActive ? data.turnOrder : [],
          currentTurn: 0 // Zera o turno
        },
        create: {
          tableId: data.tableId,
          isCombatActive: data.isActive,
          turnOrder: data.isActive ? data.turnOrder : [],
          currentTurn: 0
        }
      });

      // 2. Avisa o Frontend para atualizar o visual da mesa (abrir o Tracker de Iniciativa)
      io.to(data.tableId).emit('state_updated', updatedState);

      // 3. Cria a mensagem de LOG para o Chat
      const table = await prisma.table.findUnique({ where: { id: data.tableId }, select: { gmId: true } });
      
      if (table) {
        const logContent = data.isActive ? "⚔️ **O Combate Começou!** Preparem-se." : "🛡️ **O Combate terminou.** A poeira baixa.";
        
        const logMessage = await prisma.message.create({
          data: {
            tableId: data.tableId,
            userId: table.gmId, // Usamos o ID do mestre como o autor do aviso de sistema
            content: logContent,
            type: 'LOG'
          },
          include: {
            user: { select: { username: true, avatarUrl: true } },
            character: { select: { firstName: true, avatarUrl: true } }
          }
        });

        // 4. Dispara a nova mensagem para o chat de todo o mundo
        io.to(data.tableId).emit('new_message', logMessage);
      }
    } catch (error) {
      console.error('❌ Erro ao alternar estado do combate:', error);
    }
  });

  // ==========================================
  // MOTOR DE COMBATE: Passar o Turno
  // ==========================================
  socket.on('next_turn', async (data: { tableId: string }) => {
    try {
      // 1. Busca o estado atual
      const state = await prisma.tableState.findUnique({
        where: { tableId: data.tableId }
      });

      // 2. Verifica se o combate está ativo e se existe ordem de turnos
      if (state && state.isCombatActive && state.turnOrder && state.turnOrder.length > 0) {
        
        // 3. A matemática perfeita do Next Index usando Módulo
        const nextIndex = (state.currentTurn + 1) % state.turnOrder.length;

        // 4. Atualiza o banco
        const updatedState = await prisma.tableState.update({
          where: { tableId: data.tableId },
          data: { currentTurn: nextIndex }
        });

        // 5. Avisa todos que o turno mudou (O Frontend pisca o card do próximo jogador)
        io.to(data.tableId).emit('state_updated', updatedState);
      }
    } catch (error) {
      console.error('❌ Erro ao passar o turno:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 [Socket] Cliente desconectado: ${socket.id}`);
  });
});

// ==========================================
// Inicialização do Servidor
// ==========================================

httpServer.listen(PORT, () => {
  console.log('====================================');
  console.log('📄 Documentação do Swagger disponível');
  console.log(`Acesse Local: http://localhost:${PORT}/api-docs`);
  console.log(`Acesse Produção: https://mastersbook-api.onrender.com/api-docs`);
  console.log('------------------------------------');
  console.log(`🚀 API e WebSockets rodando na porta ${PORT}`);
  console.log(`Acesse Local: http://localhost:${PORT}/api`);
  console.log(`Acesse Produção: https://mastersbook-api.onrender.com/api`);
  console.log('====================================');
});