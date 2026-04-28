import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma.js';

import type { 
  CreateSystemInput, 
  UpdateSystemInput 
} from '../schemas/system-schema.js';

export class SystemController {
    // Listar Todos os Sistemas (Get All)
  async getAllSystems(req: Request, res: Response) {
    try {
      // Trazemos os sistemas ordenados por nome
      const systems = await prisma.system.findMany({
        orderBy: { name: 'asc' }
      });
      
      res.status(200).json(systems);
    } catch (error) {
      console.error('Erro ao listar sistemas:', error);
      res.status(500).json({ error: 'Erro interno ao buscar sistemas.' });
    }
  }

  // Deletar Todos os Sistemas
  async deleteAllSystems(req: Request, res: Response) {
    try {
      const deleted = await prisma.system.deleteMany();

      res.status(200).json({ 
        message: 'Atenção: Botão de limpeza acionado!', 
        deletedCount: deleted.count
      });
    } catch (error) {
      console.error('Erro ao limpar sistemas:', error);
      res.status(500).json({ error: 'Erro interno ao tentar limpar os sistemas.' });
    }
  }

  // Criar Sistema
  async createSystem(req: Request<{}, {}, CreateSystemInput>, res: Response) {
    try {
      const { name, description } = req.body;

      const newSystem = await prisma.system.create({
        data: { name, description }
      });

      res.status(201).json({ message: 'Sistema criado com sucesso!', system: newSystem });
    } catch (error) {
      console.error('Erro ao criar sistema:', error);
      res.status(500).json({ error: 'Erro interno ao tentar criar o sistema.' });
    }
  }

  // Buscar Sistema por ID
  async getSystemById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const system = await prisma.system.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tables: true, characters: true } // Mostra quantas mesas e fichas usam este sistema!
          }
        }
      });

      if (!system) {
        res.status(404).json({ error: 'Sistema não encontrado.' });
        return;
      }

      res.status(200).json(system);
    } catch (error) {
      console.error('Erro ao buscar sistema:', error);
      res.status(500).json({ error: 'Erro interno ao buscar o sistema.' });
    }
  }

  // Atualizar Sistema
  async updateSystem(req: Request<{ id: string }, {}, UpdateSystemInput>, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = req.body;

      const systemExists = await prisma.system.findUnique({ where: { id } });

      if (!systemExists) {
        res.status(404).json({ error: 'Sistema não encontrado.' });
        return;
      }

      const updatedSystem = await prisma.system.update({
        where: { id },
        data: dataToUpdate
      });

      res.status(200).json({ message: 'Sistema atualizado com sucesso!', system: updatedSystem });
    } catch (error) {
      console.error('Erro ao atualizar sistema:', error);
      res.status(500).json({ error: 'Erro interno ao atualizar o sistema.' });
    }
  }

  // Excluir Sistema
  async deleteSystem(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const systemExists = await prisma.system.findUnique({ where: { id } });

      if (!systemExists) {
        res.status(404).json({ error: 'Sistema não encontrado.' });
        return;
      }

      await prisma.system.delete({ where: { id } });

      res.status(200).json({ message: 'Sistema excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir sistema:', error);
      res.status(500).json({ error: 'Erro interno ao excluir o sistema.' });
    }
  }
}