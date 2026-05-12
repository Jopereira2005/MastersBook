import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';
import { io } from '../app.js';
import type { CreateMessageInput, UpdateMessageInput } from '../schemas/message-schema.js';

export class MessageController {
  // Listar mensagens de uma mesa (Get All by Table)
  async getMessagesByTable(req: Request, res: Response) {
    try {
      const tableId = String(req.params.tableId);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: { tableId },
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          character: { select: { firstName: true, avatarUrl: true } }
        }
      });

      // Retornamos invertido para o chat exibir da mais antiga para a mais nova
      res.status(200).json(messages.reverse());
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: 'Erro interno ao buscar mensagens.' });
    }
  }

  // Deletar Todas as Mensagens (Debug)
  async deleteAllMessages(req: Request, res: Response) {
    try {
      const deleted = await prisma.message.deleteMany();
      res.status(200).json({ message: 'Limpeza de chat concluída!', deletedCount: deleted.count });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao limpar chat.' });
    }
  }

  // Criar Mensagem (Post)
  async createMessage(req: Request<{}, {}, CreateMessageInput>, res: Response) {
    try {
      const data = req.body;

      const newMessage = await prisma.message.create({
        data,
        include: {
          user: { select: { username: true, avatarUrl: true } },
          character: { select: { firstName: true, avatarUrl: true } }
        }
      });

      // 📢 Sincroniza via Socket
      io.to(data.tableId).emit('new_message', newMessage);

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      res.status(500).json({ error: 'Erro interno ao enviar mensagem.' });
    }
  }

  // Atualizar Mensagem (Patch)
  async updateMessage(req: Request<{ id: string }, {}, UpdateMessageInput>, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const updated = await prisma.message.update({
        where: { id },
        data: { content },
        include: {
          user: { select: { username: true } },
          character: { select: { firstName: true } }
        }
      });

      // 📢 Avisa a mesa que uma mensagem foi editada
      io.to(updated.tableId).emit('message_updated', updated);

      res.status(200).json({ message: 'Mensagem editada!', updated });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao editar mensagem.' });
    }
  }

  // Excluir Mensagem (Delete)
  async deleteMessage(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      
      const message = await prisma.message.delete({ where: { id } });

      // 📢 Avisa a mesa para remover a mensagem da tela
      io.to(message.tableId).emit('message_deleted', { id });

      res.status(200).json({ message: 'Mensagem removida com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao excluir mensagem.' });
    }
  }
}