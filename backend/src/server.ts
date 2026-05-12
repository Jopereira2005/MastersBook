import dotenv from 'dotenv';
// 👇 1. Mudamos a importação: Trazemos o httpServer e o io, e não mais o app
import { httpServer, io } from './app.js';
dotenv.config();

const PORT = process.env.PORT || 3000;

// ==========================================
// Lógica de WebSockets (Ouvintes)
// ==========================================
io.on('connection', (socket) => {
  console.log(`🟢 [Socket] Novo cliente conectado: ${socket.id}`);

  // 👇 2. Ouvinte do evento 'join_table' para isolar os jogadores
  socket.on('join_table', (tableId: string) => {
    // Insere este usuário numa "Sala" exclusiva daquela mesa
    socket.join(tableId);
    
    console.log(`🚪 [Socket] Cliente ${socket.id} entrou na mesa (Room): ${tableId}`);
    
    // (Opcional) Dispara uma notificação para TODOS OS OUTROS na mesa avisando que ele chegou
    socket.to(tableId).emit('system_message', { 
      message: 'Um novo jogador conectou-se ao tabuleiro.' 
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 [Socket] Cliente desconectado: ${socket.id}`);
  });
});

// ==========================================
// Inicialização do Servidor
// ==========================================

// 👇 3. O detalhe de ouro: Usamos o httpServer.listen em vez de app.listen!
httpServer.listen(PORT, () => {
  console.log('====================================');
  console.log('📄 Documentação do Swagger disponível');
  console.log(`Acesse: http://localhost:${PORT}/api-docs`)
  console.log(`Acesse: https://mastersbook-api.onrender.com/api`);
  console.log('------------------------------------');
  console.log(`🚀 API e WebSockets rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/api`);
  console.log(`Acesse: https://mastersbook-api.onrender.com/api`);
  console.log('====================================');
});