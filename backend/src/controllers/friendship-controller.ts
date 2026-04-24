import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';
import { EmailSender } from '../utils/email-sender.js';

// Instanciamos o serviço de e-mail fora da classe para ser reaproveitado
const emailService = new EmailSender();
import type { 
  SendInviteInput 
} from '../schemas/friendship-schema.js';

export class FriendshipController {
  async getAll(req: Request, res: Response) {
    try {
      const allFriendships = await prisma.friendship.findMany({
        select: {
          id: true,
          user1Id: true,
          user2Id: true,
          status: true,
        }
      });

      res.status(200).json({
        message: 'Todos os convites foram listados com sucesso!',
        friendships: allFriendships
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      await prisma.friendship.deleteMany({
        where: {}, // Sem filtro, apaga todos os convites
      });

      res.status(200).json({
        message: 'Todos os convites foram deletados com sucesso!',
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async sendInvite(req: Request<{}, {}, SendInviteInput>, res: Response) {
    try {
      const { senderId, receiverIdentifier } = req.body;

      // O Prisma procura por E-mail OU Username.
      // Se achar, ele traz a linha completa do banco (incluindo o e-mail real da pessoa).
      const receiver = await prisma.user.findFirst({
        where: {
          OR: [
            { email: receiverIdentifier },
            { username: receiverIdentifier }
          ]
        }
      });

      if (!receiver) {
        res.status(404).json({ error: 'Nenhum jogador encontrado com esse e-mail ou username.' });
        return;
      }

      // Busca os dados de quem enviou (Precisamos do username dele para escrever no e-mail)
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { username: true } // Otimização: trazemos apenas a coluna username
      });

      if (!sender) {
        res.status(404).json({ error: 'Remetente não encontrado no banco de dados.' });
        return;
      }

      // Trava de Segurança 1: Não pode adicionar a si mesmo
      if (senderId === receiver.id) {
        res.status(400).json({ error: 'Você não pode enviar um convite de amizade para si mesmo.' });
        return;
      }

      // Trava de Segurança 2: Verifica se já existe convite pendente ou amizade aceita
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { user1Id: senderId, user2Id: receiver.id },
            { user1Id: receiver.id, user2Id: senderId }
          ]
        }
      });

      if (existingFriendship) {
        res.status(409).json({ error: 'Já existe um convite ou amizade em andamento entre vocês.' });
        return;
      }

      // Salva o convite no banco de dados (O Enum PENDING entra automaticamente)
      const newFriendship = await prisma.friendship.create({
        data: {
          user1Id: senderId,
          user2Id: receiver.id,
        }
      });

      // Como o "receiver" veio completo, temos a garantia de que receiver.email existe.
      // Não usamos "await" aqui para a resposta da API ser instantânea para o jogador.
      emailService.sendFriendRequestEmail(
        receiver.email,
        receiver.username,
        sender.username      
      );

      // Retorna sucesso imediato para o Front-end
      res.status(201).json({
        message: `Convite enviado com sucesso para ${receiver.username}!`,
        friendship: newFriendship
      });

    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar enviar convite.' });
    }
  }
}