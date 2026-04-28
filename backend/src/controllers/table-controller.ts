import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';

import type { 
  CreateTableInput, 
  UpdateTableInput,
  JoinTableInput,
  RemovePlayerInput
} from '../schemas/table-schema.js';

export class TableController {
  // [TESTE] Listar Todas as Mesas (Get All)
  async getAllTables(req: Request, res: Response) {
    try {
      const tables = await prisma.table.findMany({
        include: {
          // Traz os dados do Mestre da mesa
          gm: { 
            select: { id: true, username: true, avatarUrl: true } 
          },
          // Traz os jogadores da mesa e seus personagens
          players: {
            include: {
              user: { select: { id: true, username: true } },
              character: { select: { id: true, firstName: true, lastName: true, class: true, level: true } }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json(tables);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao tentar listar todas as mesas.', detail: error });
    }
  }

  // [TESTE] Deletar Todas as Mesas (Delete All)
  async deleteAllTables(req: Request, res: Response) {
    try {
      // O Prisma retorna um objeto com a propriedade 'count' mostrando quantas linhas foram apagadas
      const deleted = await prisma.table.deleteMany();

      res.status(200).json({ 
        message: 'Atenção: Botão de autodestruição acionado!', 
        deletedCount: deleted.count,
        details: `Foram apagadas ${deleted.count} mesas da base de dados.`
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao tentar limpar as mesas.', detail: error });
    }
  }

  // Criar Mesa
  async createTable(req: Request<{}, {}, CreateTableInput>, res: Response) {
    try {
      const { name, description, gmId, systemId } = req.body;

      // Gera um código de convite aleatório de 6 caracteres (Alfanumérico Maiúsculo)
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newTable = await prisma.table.create({
        data: {
          name,
          description,
          inviteCode,
          gmId,
          systemId
        }
      });

      res.status(201).json({
        message: 'Mesa criada com sucesso!',
        table: newTable
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao tentar criar a mesa.', detail: error });
    }
  }

  // Atualizar Mesa
  async updateTable(req: Request<{ id: string }, {}, UpdateTableInput>, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = req.body;

      const tableExists = await prisma.table.findUnique({ where: { id } });

      if (!tableExists) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }

      const updatedTable = await prisma.table.update({
        where: { id },
        data: dataToUpdate
      });

      res.status(200).json({
        message: 'Mesa atualizada com sucesso!',
        table: updatedTable
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao atualizar a mesa.', detail: error });
    }
  }

  // Excluir Mesa
  async deleteTable(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const tableExists = await prisma.table.findUnique({ where: { id } });

      if (!tableExists) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }

      // Graças ao onDelete: Cascade, isto vai apagar os registros da tabela TablePlayer automaticamente!
      await prisma.table.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Mesa encerrada e excluída com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao excluir a mesa.', detail: error  });
    }
  }

  // Listar as Mesas de um Mestre (Com contagem e dados filtrados das Fichas)
  async getTablesByGm(req: Request<{ gmId: string }>, res: Response) {
    try {
      const { gmId } = req.params;

      const tables = await prisma.table.findMany({
        where: { gmId },
        include: {
          system: { select: { name: true, description: true} }, // Traz o nome do sistema de RPG
          
          // Conta quantos jogadores existem na tabela intermediária (TablePlayer)
          _count: {
            select: { players: true }
          },

          // Traz os jogadores e filtra exatamente os dados da ficha
          players: {
            include: {
              user: {
                select: { 
                  id: true,
                  username: true 
                }
              },
              character: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  level: true,
                  class: true,
                  race: true,
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json(tables);
    } catch (error) {
      console.log("Erro ao listar mesas", error)
      res.status(500).json({ error: 'Erro interno ao buscar as mesas do mestre.', detail: error });
    }
  }

  // Regenerar Código de Convite da Mesa
  async regenerateInviteCode(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Verifica se a mesa existe
      const tableExists = await prisma.table.findUnique({ where: { id } });

      if (!tableExists) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }

      // Gera um novo código aleatório de 6 caracteres
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 3. Atualiza a mesa no banco de dados
      const updatedTable = await prisma.table.update({
        where: { id },
        data: { inviteCode: newInviteCode }
      });

      res.status(200).json({
        message: 'Código de convite regenerado com sucesso!',
        newInviteCode: updatedTable.inviteCode
      });
    } catch (error) {
      console.error('Erro ao regenerar código de convite:', error);
      res.status(500).json({ error: 'Erro interno ao tentar atualizar o código da mesa.', detail: error });
    }
  }

  // Entrar na Mesa (Join)
  async joinTable(req: Request<{}, {}, JoinTableInput>, res: Response) {
    try {
      const { inviteCode, userId, characterId } = req.body;

      // Busca a mesa pelo código de convite
      const table = await prisma.table.findUnique({
        where: { inviteCode }
      });

      if (!table) {
        res.status(404).json({ error: 'Código de convite inválido ou mesa não encontrada.' });
        return;
      }

      // Trava: O Mestre não pode "entrar" como jogador na própria mesa
      if (table.gmId === userId) {
        res.status(400).json({ error: 'Você já é o Mestre desta mesa.' });
        return;
      }

      // Verifica a Ficha (Character)
      const character = await prisma.character.findUnique({
        where: { id: characterId }
      });

      if (!character) {
        res.status(404).json({ error: 'Ficha não encontrada.' });
        return;
      }

      if (character.userId !== userId) {
        res.status(403).json({ error: 'Você não pode usar a ficha de outro jogador.' });
        return;
      }

      if (character.systemId !== table.systemId) {
        res.status(400).json({ error: 'O sistema da sua ficha é incompatível com o sistema da mesa.' });
        return;
      }

      // Verifica se o jogador já está na mesa
      const alreadyInTable = await prisma.tablePlayer.findFirst({
        where: { tableId: table.id, userId }
      });

      if (alreadyInTable) {
        res.status(409).json({ error: 'Você já está a participar desta mesa.' });
        return;
      }

      //  Adiciona o jogador e a ficha à mesa
      const tablePlayer = await prisma.tablePlayer.create({
        data: {
          tableId: table.id,
          userId,
          characterId
        }
      });

      res.status(200).json({
        message: 'Entrou na mesa com sucesso!',
        tableId: table.id,
        player: tablePlayer
      });

    } catch (error) {
      console.error('Erro ao entrar na mesa:', error);
      res.status(500).json({ error: 'Erro interno ao tentar entrar na mesa.', detail: error });
    }
  }

  // Sair ou Expulsar Jogador da Mesa
  async removePlayer(req: Request<{ tableId: string, playerId: string }, {}, RemovePlayerInput>, res: Response) {
    try {
      const { tableId, playerId } = req.params;
      const { requesterId } = req.body;

      // Busca a mesa para saber quem é o GM
      const table = await prisma.table.findUnique({
        where: { id: tableId }
      });

      if (!table) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }

      //  A SUA TRAVA DE SEGURANÇA (Apenas o próprio jogador ou o GM podem fazer isto)
      const isGM = table.gmId === requesterId;
      const isSelf = playerId === requesterId;

      if (!isGM && !isSelf) {
        res.status(403).json({ error: 'Sem permissão. Apenas o Mestre da mesa ou o próprio jogador podem realizar esta ação.' });
        return;
      }

      // Deleta o registro de TablePlayer
      // Usamos deleteMany porque não temos o 'id' específico do TablePlayer, mas sabemos a mesa e o usuário
      const deleted = await prisma.tablePlayer.deleteMany({
        where: {
          tableId: tableId,
          userId: playerId
        }
      });

      if (deleted.count === 0) {
        res.status(404).json({ error: 'Este jogador não está na mesa.' });
        return;
      }

      const actionMessage = isSelf ? 'Você saiu da mesa.' : 'Jogador expulso com sucesso.';
      res.status(200).json({ message: actionMessage });

    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      res.status(500).json({ error: 'Erro interno ao tentar remover o jogador da mesa.', detail: error });
    }
  }
}