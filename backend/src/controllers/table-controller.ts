import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';
// Importe a instância do io que deixámos pronta no app.ts
import { io } from '../app.js';
import { logGameAction } from '../utils/game-logger.js';

import type { 
  CreateTableInput, 
  UpdateTableInput,
  JoinTableInput,
  RemovePlayerInput,
  UpdateTableStateInput,
  UpdatePlayerStatusInput,
  UpdatePlayerNotesInput
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

  // Entrar na Mesa (Join) com Inicialização de Status
  async joinTable(req: Request<{}, {}, JoinTableInput>, res: Response) {
    try {
      const { inviteCode, userId, characterId } = req.body;

      // 1. Busca a mesa pelo código de convite
      const table = await prisma.table.findUnique({
        where: { inviteCode }
      });

      if (!table) {
        res.status(404).json({ error: 'Código de convite inválido ou mesa não encontrada.' });
        return;
      }

      // 2. Trava: O Mestre não pode "entrar" como jogador na própria mesa
      if (table.gmId === userId) {
        res.status(400).json({ error: 'Você já é o Mestre desta mesa.' });
        return;
      }

      // 3. Verifica a Ficha (Character)
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

      // 4. Verifica se o jogador já está na mesa
      const alreadyInTable = await prisma.tablePlayer.findFirst({
        where: { tableId: table.id, userId }
      });

      if (alreadyInTable) {
        res.status(409).json({ error: 'Você já está a participar desta mesa.' });
        return;
      }

      // ==========================================
      // ✨ A MÁGICA ACONTECE AQUI ✨
      // Criamos o TablePlayer copiando os atributos base da ficha 
      // para os atributos "atuais" da sessão.
      // ==========================================
      const tablePlayer = await prisma.tablePlayer.create({
        data: {
          tableId: table.id,
          userId,
          characterId,
          currentAttributes: character.attributes ?? {},
        },
        // 👇 IMPORTANTE: Adicione este include aqui para enviar os dados completos via Socket!
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          character: { select: { id: true, firstName: true, race: true, class: true, avatarUrl: true } }
        }
      });

      // 📢 BROADCAST: Avisa todos na mesa que um novo jogador sentou na cadeira!
      // O evento 'player_joined' envia os dados do usuário e da ficha para o Front renderizar o novo card/token
      io.to(table.id).emit('player_joined', tablePlayer);
      await logGameAction(
        table.id, 
        userId, 
        `${character.firstName} juntou-se à aventura!`
      );

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

      // 📢 BROADCAST: Avisa que o jogador saiu
      io.to(tableId).emit('player_left', { playerId: playerId });

      const logText = isSelf 
        ? "Um jogador arrumou as suas coisas e abandonou a mesa." 
        : "O Mestre expulsou um jogador da sessão.";
      await logGameAction(tableId, requesterId, logText);

      const actionMessage = isSelf ? 'Você saiu da mesa.' : 'Jogador expulso com sucesso.';
      res.status(200).json({ message: actionMessage });

    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      res.status(500).json({ error: 'Erro interno ao tentar remover o jogador da mesa.', detail: error });
    }
  }

  // Listar Mesas que o Usuário JÁ PARTICIPA (Como Jogador)
  async getPlayerTables(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      const tables = await prisma.table.findMany({
        where: {
          // Magia Prisma: Traz mesas onde existe "algum" jogador com este userId
          players: { some: { userId: userId } }
        },
        include: {
          gm: { select: { username: true, avatarUrl: true } },
          system: { select: { name: true } },
          _count: { select: { players: true } },
          // Trazemos também o registro específico DESTE jogador para o Front-end saber qual ficha ele está usando
          players: {
            where: { userId: userId },
            include: {
              character: { select: { id: true, firstName: true, lastName: true, class: true, level: true, race: true, avatarUrl: true } }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json(tables);
    } catch (error) {
      console.error('Erro ao buscar mesas do jogador:', error);
      res.status(500).json({ error: 'Erro interno ao buscar as mesas do jogador.' });
    }
  }

  // Listar Mesas Disponíveis para Entrar (Lobby / Taverna)
  async getAvailableTables(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      const availableTables = await prisma.table.findMany({
        where: {
          gmId: { not: userId }, // O usuário não pode ser o Mestre
          players: { none: { userId: userId } } // O usuário "nenhum" registro de TablePlayer nesta mesa
        },
        include: {
          gm: { select: { username: true, avatarUrl: true } },
          system: { select: { name: true } },
          _count: { select: { players: true } }
          // Nota: Não trazemos as fichas dos outros jogadores aqui para manter a listagem leve!
        },
        orderBy: { name: 'asc' }
      });
      console.log("Mesas disponíveis para o usuário", userId, availableTables);
      res.status(200).json(availableTables);
    } catch (error) {
      console.error('Erro ao buscar mesas disponíveis:', error);
      res.status(500).json({ error: 'Erro interno ao listar mesas disponíveis.' });
    }
  }

  // Buscar Detalhes de uma Mesa (Carregar o Jogo / VTT)
  async getTableById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const table = await prisma.table.findUnique({
        where: { id },
        include: {
          // 1. Traz os dados básicos do Mestre
          gm: { 
            select: { id: true, username: true, avatarUrl: true } 
          },
          
          // 2. Traz o nome do Sistema
          system: { 
            select: { id: true, name: true } 
          },

          // 3. Traz o Estado Global do Mundo (Clima, Cena, Iniciativa)
          state: true,
          
          // 4. Traz a lista completa de jogadores sentados na mesa e o status de cada um
          players: {
            include: {
              user: { 
                select: { id: true, username: true, avatarUrl: true } 
              },
              character: { 
                select: { 
                  id: true, 
                  firstName: true, 
                  lastName: true, 
                  race: true, 
                  class: true, 
                  level: true, 
                  avatarUrl: true, 
                  bio: true,
                  attributes: true
                } 
              }
            }
          },
          messages: {
            take: 50, // Pega as últimas 50 mensagens
            orderBy: { createdAt: 'desc' }, // Traz da mais nova para a mais velha (para o limite funcionar certo)
            include: {
              user: { select: { username: true, avatarUrl: true } },
              character: { select: { firstName: true, avatarUrl: true } }
            }
          }
        }
      });

      if (!table) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }

      if (table.messages) {
        table.messages = table.messages.reverse();
      }

      res.status(200).json(table);
    } catch (error) {
      console.error('Erro ao buscar detalhes da mesa:', error);
      res.status(500).json({ error: 'Erro interno ao carregar a mesa.' });
    }
  }

  // Atualizar Estado da Sessão (Clima, Cena, Iniciativa)
  async updateTableState(req: Request<{ id: string }, {}, UpdateTableStateInput>, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedState = await prisma.tableState.upsert({
        where: { tableId: id },
        update: data,
        create: {
          tableId: id,
          ...data
        }
      });

      // 📢 BROADCAST: Avisa todos na sala (tableId) que o estado do mundo mudou
      io.to(id).emit('state_updated', updatedState);

      let logText = "O Mestre alterou o estado do mundo.";
      if (data.weather) logText = `O clima mudou repentinamente para: ${data.weather}.`;
      if (data.activeScene) logText = `A cena mudou para: ${data.activeScene === 'COMBAT' ? '⚔️ Combate!' : 'Exploração'}.`;
      if (data.currentLocation) logText = `O grupo viajou para: ${data.currentLocation}.`;

      // Busca rápida para descobrir quem é o GM desta mesa
      const table = await prisma.table.findUnique({
        where: { id },
        select: { gmId: true }
      });

      if (table) {
        await logGameAction(id, table.gmId, logText);
      }

      res.status(200).json({ message: 'Estado da mesa atualizado.', state: updatedState });
    } catch (error) {
      console.error('Erro ao atualizar estado da mesa:', error);
      res.status(500).json({ error: 'Erro interno ao atualizar estado.' });
    }
  }

  // Atualizar Status do Jogador (HP, Condições)
  async updatePlayerStatus(req: Request<{ tableId: string, playerId: string }, {}, UpdatePlayerStatusInput>, res: Response) {
    try {
      const { tableId, playerId } = req.params;
      const data = req.body;

      const tablePlayer = await prisma.tablePlayer.findFirst({
        where: { tableId, userId: playerId }
      });

      if (!tablePlayer) {
        res.status(404).json({ error: 'Jogador não encontrado nesta mesa.' });
        return;
      }

      const updatedPlayer = await prisma.tablePlayer.update({
        where: { id: tablePlayer.id },
        data,
        include: {character: { select: { firstName: true } }}
      });

      // 📢 BROADCAST: Avisa a sala que a vida/status deste jogador específico mudou
      io.to(tableId).emit('player_status_updated', {
        playerId: playerId,
        newStatus: updatedPlayer
      });

      const charName = updatedPlayer.character?.firstName || "Um herói";
      let statusLogText = `Os status de ${charName} foram atualizados.`;
      
      if (data.conditions) {
        statusLogText = `${charName} recebeu novas condições: ${data.conditions.join(', ')}.`;
      } else if (data.currentAttributes) {
        statusLogText = `Os atributos de ${charName} sofreram alterações.`;
      }

      await logGameAction(tableId, playerId, statusLogText);

      res.status(200).json({ message: 'Status do jogador atualizado.', status: updatedPlayer });
    } catch (error) {
      console.error('Erro ao atualizar status do jogador:', error);
      res.status(500).json({ error: 'Erro interno ao atualizar status.' });
    }
  }

  // Atualizar Notas Privadas do Jogador
  async updatePlayerNotes(req: Request<{ tableId: string, playerId: string }, {}, UpdatePlayerNotesInput>, res: Response) {
    try {
      const { tableId, playerId } = req.params;
      const { privateNotes } = req.body;

      const tablePlayer = await prisma.tablePlayer.findFirst({
        where: { tableId, userId: playerId }
      });

      if (!tablePlayer) {
        res.status(404).json({ error: 'Jogador não encontrado nesta mesa.' });
        return;
      }

      await prisma.tablePlayer.update({
        where: { id: tablePlayer.id },
        data: { privateNotes }
      });

      res.status(200).json({ message: 'Anotações salvas com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar notas do jogador:', error);
      res.status(500).json({ error: 'Erro interno ao salvar notas.' });
    }
  }
}