import { prisma } from '../database/prisma.js';
import { io } from '../app.js';

/**
 * Registra um evento automático do sistema no chat da mesa e emite via WebSocket.
 * * @param tableId O ID da mesa onde o evento ocorreu.
 * @param triggerUserId O ID do usuário que disparou a ação (GM ou Jogador).
 * @param content O texto descrevendo o que aconteceu.
 */
export const logGameAction = async (tableId: string, triggerUserId: string, content: string) => {
  try {
    const logMessage = await prisma.message.create({
      data: {
        tableId,
        userId: triggerUserId,
        content,
        type: 'LOG',
        // characterId fica nulo (null) porque a mensagem é "do sistema" e não do personagem falando
      },
      include: {
        // Trazemos os dados para o Front-end conseguir mostrar quem causou o log
        user: { select: { username: true, avatarUrl: true } },
        character: { select: { firstName: true, avatarUrl: true } }
      }
    });

    // 📢 Emite a mensagem imediatamente para a aba do chat de todo o mundo na mesa
    io.to(tableId).emit('new_message', logMessage);
  } catch (error) {
    console.error("❌ Erro interno ao tentar gerar Log do Sistema:", error);
  }
};