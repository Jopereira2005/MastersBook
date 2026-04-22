import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';

import type { CreateCharacterInput } from '../schemas/character-schema.js';

export class CharacterController {
  
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
}
