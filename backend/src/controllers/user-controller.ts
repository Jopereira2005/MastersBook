import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../database/prisma.js';
import type { RegisterUserInput, LoginUserInput, UpdateProfileInput, DeleteProfileInput } from '../schemas/user-schema.js';

export class UserController {
  async register(req: Request<{}, {}, RegisterUserInput>, res: Response) {
    try {
      const { username, firstName, lastName, email, password } = req.body;

      const emailExists = await prisma.user.findUnique({ where: { email } });
      const usernameInUse = await prisma.user.findFirst({ where: { username } });

      if (emailExists) {
        res.status(409).json({ error: 'Este email não existe ou já está em uso.' });
        return;
      }

      if (usernameInUse) {
        res.status(409).json({ error: 'Este username não existe oujá está em uso.' });
        return;
      }

      // Hash da senha usando bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: { username, firstName, lastName, email, password: hashedPassword },
      });

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email 
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async login(req: Request<{}, {}, LoginUserInput>, res: Response) {
    try {
      const { login, password } = req.body;
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: login }, { username: login }] }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async getProfileById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Busca o usuário, mas seleciona apenas os campos seguros
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async updateProfile(req: Request<{ id: string }, {}, UpdateProfileInput>, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = req.body;

      const userExists = await prisma.user.findUnique({ where: { id } });
      
      if(!userExists) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      if(dataToUpdate.username) {
        const usernameInUse = await prisma.user.findFirst({
          where: { 
            username: dataToUpdate.username,
            id: { not: id } // Busca usernames iguais, mas ignora o próprio dono
          }
        });

        if (usernameInUse) {
          res.status(409).json({ error: 'Este username já está em uso.' });
          return;
        }
      }

      // Limpa o objeto removendo qualquer chave que tenha valor 'undefined'
      const cleanDataToUpdate = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, value]) => value !== undefined)
      );

      // Trava de Segurança 1: Se o objeto estiver vazio (não mandou nada)
      if (Object.keys(cleanDataToUpdate).length === 0) {
        res.status(200).json({ message: 'Nenhum dado válido foi enviado para atualização.' });
        return;
      }

      // Trava de Segurança 2: Verifica se houve mudanças REAIS
      let hasChanges = false;
      for (const [key, value] of Object.entries(cleanDataToUpdate)) {
        // Compara o valor novo com o valor antigo salvo no banco de dados
        if (userExists[key as keyof typeof userExists] !== value) {
          hasChanges = true;
          break; // Achou pelo menos UMA diferença, já pode prosseguir com o update
        }
      }

      // Se não houve NENHUMA mudança, não gastamos processamento do banco de dados!
      if (!hasChanges) {
        res.status(200).json({
          message: 'Os dados enviados são idênticos aos atuais.',
          // Retornamos os dados antigos limpos (sem a senha, para segurança)
          user: {
            id: userExists.id,
            username: userExists.username,
            firstName: userExists.firstName,
            lastName: userExists.lastName,
            email: userExists.email,
            avatarUrl: userExists.avatarUrl,
            createdAt: userExists.createdAt,
          }
        });
        return;
      }

      // Atualiza os dados no Prisma (Só chega aqui se tiver dados novos MESMO)
      const updatedUser = await prisma.user.update({
        where: { id },
        data: cleanDataToUpdate,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        message: 'Perfil atualizado com sucesso!',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', detail: error });
    }
  }

  async deleteProfile(req: Request<{ id: string }, {}, DeleteProfileInput>, res: Response) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      // Verifica se o utilizador existe
      const userExists = await prisma.user.findUnique({ where: { id } });
      
      if (!userExists) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      // Compara a senha enviada com a senha do banco
      const isPasswordValid = await bcrypt.compare(password, userExists.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return;
      }

      // Apaga o utilizador na base de dados
      await prisma.user.delete({
        where: { id }
      });

      res.status(200).json({
        message: 'Perfil apagado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao apagar perfil:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao tentar apagar o perfil.' });
    }
  }
}