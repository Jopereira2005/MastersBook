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
        receiver.firstName,
        sender.username      
      );

      // Retorna sucesso imediato para o Front-end
      res.status(201).json({
        message: `Convite enviado com sucesso para ${receiver.username}!`,
        friendship: newFriendship
      });

    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async declineInvite(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Verifica se o convite existe
      const friendship = await prisma.friendship.findUnique({
        where: { id }
      });

      if (!friendship) {
        res.status(404).json({ error: 'Convite não encontrado.' });
        return;
      }

      // Trava de Segurança: Só permitimos recusar convites que ainda estejam pendentes
      if (friendship.status !== 'PENDING') {
        res.status(400).json({ error: 'Este convite já foi processado ou não está pendente.' });
        return;
      }

      // Apaga a amizade/convite permanentemente da base de dados
      await prisma.friendship.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Convite recusado com sucesso.' });

    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async getPendingInvites(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      const pendingInvites = await prisma.friendship.findMany({
        where: {
          user2Id: userId, // O usuário atual é quem recebeu o convite
          status: 'PENDING' // Apenas convites que ainda não foram aceitos/recusados
        },
        include: {
          // Trazemos os dados do remetente para mostrar na interface ("João enviou um convite")
          user1: { 
            select: { 
              id: true, 
              username: true, 
              avatarUrl: true 
            } 
          }
        },
        orderBy: {
          createdAt: 'desc' // Mostra os convites mais recentes primeiro
        }
      });

      res.status(200).json(pendingInvites);

    } catch (error) {
      console.error('Erro ao buscar convites pendentes:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async getFriendsList(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      // Busca todas as amizades onde o status é ACCEPTED
      // E o nosso usuário é o user1 OU o user2
      const friendships = await prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        },
        include: {
          // Trazemos os dados básicos de ambos para podermos filtrar no passo 2
          user1: { select: { id: true, username: true, avatarUrl: true } },
          user2: { select: { id: true, username: true, avatarUrl: true } }
        },
      });

      // A MÁGICA DA LIMPEZA DE DADOS
      // O Front-end não quer saber quem é o user1 ou user2. Ele só quer uma lista de "Amigos".
      // Vamos mapear a resposta para devolver apenas os dados da OUTRA pessoa.
      const cleanFriendsList = friendships.map(friendship => {
        // Se o usuário atual for o user1, o amigo dele é o user2. E vice-versa.
        const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
        
        return {
          friendshipId: friendship.id, // Útil caso o Front-end precise de chamar a rota de deletar/desfazer amizade
          friendId: friend.id,
          username: friend.username,
          avatarUrl: friend.avatarUrl,
        };
      });

      res.status(200).json(cleanFriendsList); // Retorna o array limpo e direto!

    } catch (error) {
      console.error('Erro ao buscar lista de amigos:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error});
    }
  }

  async removeFriend(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Busca a relação de amizade na base de dados
      const friendship = await prisma.friendship.findUnique({
        where: { id }
      });

      if (!friendship) {
        res.status(404).json({ error: 'Amizade não encontrada.' });
        return;
      }

      // Trava de Segurança: Garante que só estamos a remover amizades ativas.
      // (Para remover convites pendentes, o utilizador deve usar a rota de 'decline').
      if (friendship.status !== 'ACCEPTED') {
        res.status(400).json({ error: 'Esta amizade não está ativa ou ainda está pendente.' });
        return;
      }

      // Apaga permanentemente a relação, quebrando a amizade entre os dois
      await prisma.friendship.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Amizade desfeita com sucesso.' });

    } catch (error) {
      console.error('Erro ao desfazer amizade:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar remover amigo.' });
    }
  }

  async acceptInvite(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Busca o convite na base de dados trazendo os dados essenciais
      const friendship = await prisma.friendship.findUnique({
        where: { id },
        include: {
          user1: { select: { email: true, username: true, firstName: true } }, // Remetente (quem vai receber o e-mail de aviso)
          user2: { select: { username: true, firstName: true } }               // Quem está clicando em "Aceitar"
        }
      });

      if (!friendship) {
        res.status(404).json({ error: 'Convite não encontrado.' });
        return;
      }

      // Trava de Segurança: Verifica se o convite realmente está pendente
      if (friendship.status !== 'PENDING') {
        res.status(400).json({ error: 'Este convite já foi processado ou não está mais pendente.' });
        return;
      }

      // Atualiza o status no banco de dados para ACCEPTED
      const updatedFriendship = await prisma.friendship.update({
        where: { id },
        data: { status: 'ACCEPTED' }
      });

      // Disparo do E-mail de Notificação (Background)
      // Lembra da regra de ouro? Sem o "await" para não travar a tela de quem clicou em "Aceitar"!
      emailService.sendInviteAcceptedEmail(
        friendship.user1.email,    // Para quem vai o e-mail (Remetente original)
        friendship.user1.firstName, // Nome de quem recebe o e-mail ("Boas notícias, João!")
        friendship.user2.username  // Nome de quem aceitou ("Maria aceitou o seu pedido")
      );

      // Retorna sucesso para o Front-end
      res.status(200).json({
        message: `${friendship.user1.firstName} e ${friendship.user2.firstName} agora são amigos!`,
        friendship: updatedFriendship
      });

    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', details: error });
    }
  }
}