import dotenv from 'dotenv';
import { httpServer, io } from './app.js';
import { prisma } from './database/prisma.js';
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