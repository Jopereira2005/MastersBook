import { response, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../database/prisma.js';
import type { RegisterUserInput, LoginUserInput } from '../schemas/UserSchema.js';

export class UserController {
  async register(req: Request<{}, {}, RegisterUserInput>, res: Response) {
    try {
      const { username, firstName, lastName, email, password } = req.body;
      const userExists = await prisma.user.findUnique({ where: { email } });

      if (userExists) {
        res.status(409).json({ error: 'Este e-mail já está em uso.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: { username, firstName, lastName, email, password: hashedPassword },
      });

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.', response: error });
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
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // async getProfileID(req: Request, res: Response) {
    
  // }
}