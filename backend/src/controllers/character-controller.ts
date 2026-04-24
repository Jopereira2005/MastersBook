import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';

import type { 
  CreateCharacterInput,
  UpdateCharacterInput
} from '../schemas/character-schema.js';

export class CharacterController {
  async getAll(req: Request, res: Response) {
    try {
      const allCharacters = await prisma.character.findMany({
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          race: true,
          class: true,
          level: true,
          attributes: true,
          bio: true,
          avatarUrl: true,
          userId: true,
          systemId: true
        }
      });

      res.status(200).json({
        message: 'Todos as fichas foram listados com sucesso!',
        characters: allCharacters
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      await prisma.character.deleteMany({
        where: {}, // Sem filtro, apaga todos as fichas
      });

      res.status(200).json({
        message: 'Todos as fichas foram deletados com sucesso!',
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async createCharacter(req: Request<{}, {}, CreateCharacterInput>, res: Response) {
    try {
      const {
        firstName,
        lastName,
        race,
        class: characterClass, // ALIAS: Renomeamos 'class' para 'characterClass' apenas na memória do Node
        level,
        attributes,
        bio,
        avatarUrl,
        userId,
        systemId
      } = req.body;

      // Verifica se o Jogador (User) realmente existe
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      // Verifica se o Sistema de RPG (System) realmente existe
      const systemExists = await prisma.system.findUnique({ where: { id: systemId } });
      if (!systemExists) {
        res.status(404).json({ error: 'Sistema de RPG não encontrado no catálogo.' });
        return;
      }

      // Cria a ficha no banco de dados
      const newCharacter = await prisma.character.create({
        data: {
          firstName,
          lastName,
          race,
          class: characterClass,
          level: level ?? 1,
          attributes,
          bio: bio ?? null,
          avatarUrl: avatarUrl ?? null,
          userId,
          systemId
        }
      });

      // 4. Retorna sucesso (Status 201 - Created)
      res.status(201).json({
        message: 'Ficha criada com sucesso!',
        character: newCharacter
      });

    } catch (error) {
      console.error('Erro ao criar ficha:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar criar a ficha.' });
    }
  }

  async updateCharacter(req: Request<{ id: string }, {}, UpdateCharacterInput>, res: Response) {
    try {
      const { id } = req.params;
      
      // Separamos "class" (com alias) e "attributes". O resto fica na variável "...restBody"
      const { class: characterClass, attributes, ...restBody } = req.body;

      // Verifica se a ficha existe e traz os dados atuais dela
      const characterExists = await prisma.character.findUnique({ where: { id } });
      
      if (!characterExists) {
        res.status(404).json({ error: 'Ficha não encontrada.' });
        return;
      }

      // Mesclar atributos antigos com os novos
      let mergedAttributes = characterExists.attributes;
      if (attributes) {
        // Pega os atributos que já estão no banco e junta com os que vieram na requisição
        mergedAttributes = {
          ...(characterExists.attributes as Record<string, any>),
          ...attributes,
        };
      }

      // Montar o objeto com os dados novos
      const rawDataToUpdate = {
        ...restBody, // Puxa firstName, lastName, level, etc...
        class: characterClass,
        attributes: mergedAttributes,
      };

      // Limpar os 'undefined' (Aquele truque para o TypeScript não dar erro)
      const cleanDataToUpdate = Object.fromEntries(
        Object.entries(rawDataToUpdate).filter(([_, value]) => value !== undefined)
      );

      // Salva no banco de dados
      const updatedCharacter = await prisma.character.update({
        where: { id },
        data: cleanDataToUpdate,
      });

      res.status(200).json({
        message: 'Ficha atualizada com sucesso!',
        character: updatedCharacter
      });

    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar atualizar a ficha.' });
    }
  }

  async getCharacterById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // O "include" é a magia do Prisma para trazer dados das tabelas relacionadas (JOIN)
      const character = await prisma.character.findUnique({
        where: { id },
        include: {
          system: { select: { name: true } }, // Traz o nome do sistema de RPG
          user: { select: { username: true } } // Traz o dono da ficha
        }
      });

      if (!character) {
        res.status(404).json({ error: 'Ficha não encontrada.' });
        return;
      }

      res.status(200).json(character);
    } catch (error) {
      console.error('Erro ao buscar ficha:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async getCharactersByUserId(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      const characters = await prisma.character.findMany({
        where: { userId },
        include: {
          system: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' } // Traz as mais recentes primeiro
      });

      res.status(200).json(characters); // Retorna um Array [] vazio se ele não tiver fichas
    } catch (error) {
      console.error('Erro ao buscar fichas do jogador:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async deleteCharacter(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const characterExists = await prisma.character.findUnique({ where: { id } });

      if (!characterExists) {
        res.status(404).json({ error: 'Ficha não encontrada.' });
        return;
      }

      await prisma.character.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Ficha apagada com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar ficha:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar apagar a ficha.' });
    }
  }
}
