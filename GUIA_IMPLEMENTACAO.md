# 🛠️ GUIA DE IMPLEMENTAÇÃO - MASTERSBOOK

**Versão:** 1.0  
**Status:** Pronto para implementação  
**Data:** 30/04/2026

---

## 📋 ÍNDICE
1. [Implementar JWT Authentication](#-implementar-jwt-authentication)
2. [Refatorar Controllers com Auth](#-refatorar-controllers-com-auth)
3. [Conectar Frontend à API](#-conectar-frontend-à-api)
4. [Configurar Testes](#-configurar-testes)
5. [Melhorias de Validação](#-melhorias-de-validação)

---

## 🔐 IMPLEMENTAR JWT AUTHENTICATION

### Step 1: Instalar Dependências

```bash
cd backend
npm install jsonwebtoken cookie-parser
npm install -D @types/jsonwebtoken
```

### Step 2: Criar Arquivo de Tipos JWT

**backend/src/types/auth.ts**
```typescript
import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
```

### Step 3: Criar Serviço de Token

**backend/src/utils/token-service.ts**
```typescript
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-chave-aqui';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'seu-refresh-secret';
const JWT_EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN = '7d';

export class TokenService {
  static generateAccessToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    });
  }

  static verifyAccessToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  }

  static generateTokenPair(userId: string, email: string, username: string) {
    const accessToken = this.generateAccessToken({ userId, email, username });
    const refreshToken = this.generateRefreshToken(userId);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hora em segundos
    };
  }
}
```

### Step 4: Criar Middleware de Autenticação

**backend/src/middlewares/auth-middleware.ts**
```typescript
import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../utils/token-service.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Procura token no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    
    try {
      const decoded = TokenService.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro ao validar token',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware opcional para verificar se é admin
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  // TODO: Implementar verificação de role/admin no banco
  // Por enquanto, apenas verifica se token é válido
  next();
};
```

### Step 5: Atualizar User Controller

**backend/src/controllers/user-controller.ts** (alterar métodos de login/register)

```typescript
import { TokenService } from '../utils/token-service.js';

export class UserController {
  // ... métodos anteriores ...

  async login(req: Request<{}, {}, LoginUserInput>, res: Response) {
    try {
      const { login, password } = req.body;
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: login }, { username: login }] }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas.',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // ✨ NOVO: Gerar tokens JWT
      const { accessToken, refreshToken, expiresIn } = TokenService.generateTokenPair(
        user.id,
        user.email,
        user.username
      );

      // TODO: Salvar refreshToken no banco (opcional para revogação)
      // await prisma.refreshToken.create({
      //   data: { token: refreshToken, userId: user.id }
      // });

      res.status(200).json({
        message: 'Login realizado com sucesso!',
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType: 'Bearer'
        },
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async register(req: Request<{}, {}, RegisterUserInput>, res: Response) {
    try {
      const { username, firstName, lastName, email, password } = req.body;

      const emailExists = await prisma.user.findUnique({ where: { email } });
      const usernameInUse = await prisma.user.findFirst({ where: { username } });

      if (emailExists) {
        return res.status(409).json({ 
          error: 'Email já está em uso.',
          code: 'EMAIL_EXISTS'
        });
      }

      if (usernameInUse) {
        return res.status(409).json({ 
          error: 'Username já está em uso.',
          code: 'USERNAME_EXISTS'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: { 
          username, 
          firstName, 
          lastName, 
          email, 
          password: hashedPassword 
        },
      });

      // ✨ NOVO: Gerar tokens JWT também no registro
      const { accessToken, refreshToken, expiresIn } = TokenService.generateTokenPair(
        newUser.id,
        newUser.email,
        newUser.username
      );

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType: 'Bearer'
        },
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // ✨ NOVO: Endpoint para refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não fornecido' });
      }

      const decoded = TokenService.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
        TokenService.generateTokenPair(user.id, user.email, user.username);

      res.status(200).json({
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
          tokenType: 'Bearer'
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Refresh token inválido' });
    }
  }
}
```

### Step 6: Atualizar Rotas

**backend/src/routes/user-routes.ts**
```typescript
import { authMiddleware } from '../middlewares/auth-middleware.js';

const userRoutes = Router();
const userController = new UserController();

// Rotas públicas (sem autenticação)
userRoutes.post('/register', validate(registerSchema), userController.register.bind(userController));
userRoutes.post('/login', validate(loginSchema), userController.login.bind(userController));
userRoutes.post('/refresh-token', userController.refreshToken.bind(userController));

// Rotas protegidas (com autenticação)
userRoutes.get('/profile/:id', authMiddleware, validate(getProfileSchema), userController.getProfileById.bind(userController));
userRoutes.patch('/update/:id', authMiddleware, validate(updateProfileSchema), userController.updateProfile.bind(userController));
userRoutes.delete('/delete/:id', authMiddleware, validate(deleteProfileSchema), userController.deleteProfile.bind(userController));

// ❌ REMOVER OU PROTEGER:
// userRoutes.get('/get-all', authMiddleware, adminMiddleware, userController.getAll.bind(userController));
// userRoutes.delete('/delete-all', authMiddleware, adminMiddleware, userController.deleteAll.bind(userController));

export { userRoutes };
```

### Step 7: Adicionar Variáveis de Ambiente

**.env**
```
JWT_SECRET=sua-chave-secreta-super-segura-aqui-min-32-caracteres
JWT_REFRESH_SECRET=outra-chave-secreta-para-refresh-token
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 🔒 REFATORAR CONTROLLERS COM AUTH

### Character Controller - Verificar Ownership

**backend/src/controllers/character-controller.ts**
```typescript
export class CharacterController {
  // ... métodos anteriores ...

  async updateCharacter(req: Request<{ id: string }, {}, UpdateCharacterInput>, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = req.body;

      // Buscar a ficha
      const character = await prisma.character.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!character) {
        return res.status(404).json({ 
          error: 'Ficha não encontrada.',
          code: 'CHARACTER_NOT_FOUND'
        });
      }

      // ✨ NOVO: Verificar se o usuário é o dono
      if (character.userId !== req.user?.userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar esta ficha.',
          code: 'FORBIDDEN'
        });
      }

      // Resto da lógica...
      const updatedCharacter = await prisma.character.update({
        where: { id },
        data: dataToUpdate
      });

      res.status(200).json({
        message: 'Ficha atualizada com sucesso!',
        character: updatedCharacter
      });
    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async deleteCharacter(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const character = await prisma.character.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!character) {
        return res.status(404).json({ error: 'Ficha não encontrada.' });
      }

      // ✨ Verificar ownership
      if (character.userId !== req.user?.userId) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      await prisma.character.delete({ where: { id } });

      res.status(200).json({
        message: 'Ficha deletada com sucesso!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async getCharactersByUserId(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;

      // ✨ Usuário só pode ver suas próprias fichas (ou admin)
      if (userId !== req.user?.userId) {
        return res.status(403).json({ 
          error: 'Você só pode ver suas próprias fichas.',
          code: 'FORBIDDEN'
        });
      }

      const characters = await prisma.character.findMany({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          race: true,
          class: true,
          level: true,
          bio: true,
          avatarUrl: true,
          system: { select: { id: true, name: true } }
        }
      });

      res.status(200).json(characters);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}
```

### Table Controller - Proteger Operações

**backend/src/controllers/table-controller.ts**
```typescript
export class TableController {
  async createTable(req: Request<{}, {}, CreateTableInput>, res: Response) {
    try {
      const { name, description, systemId } = req.body;

      // ✨ NOVO: gmId vem do usuário autenticado, não do request
      const gmId = req.user?.userId;

      if (!gmId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newTable = await prisma.table.create({
        data: {
          name,
          description,
          inviteCode,
          gmId,
          systemId
        },
        include: {
          gm: { select: { username: true } },
          system: { select: { name: true } }
        }
      });

      res.status(201).json({
        message: 'Mesa criada com sucesso!',
        table: newTable
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao criar mesa.' });
    }
  }

  async deleteTable(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const table = await prisma.table.findUnique({
        where: { id },
        select: { gmId: true }
      });

      if (!table) {
        return res.status(404).json({ error: 'Mesa não encontrada.' });
      }

      // ✨ Apenas o Mestre pode deletar a mesa
      if (table.gmId !== req.user?.userId) {
        return res.status(403).json({ 
          error: 'Apenas o Mestre pode deletar a mesa.',
          code: 'FORBIDDEN'
        });
      }

      await prisma.table.delete({ where: { id } });

      res.status(200).json({ message: 'Mesa deletada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao deletar mesa.' });
    }
  }

  async removePlayer(req: Request<{ tableId: string; playerId: string }, {}, { requesterId: string }>, res: Response) {
    try {
      const { tableId, playerId } = req.params;
      const { requesterId } = req.body;

      // ✨ Verificar se quem está removendo é o Mestre
      const table = await prisma.table.findUnique({
        where: { id: tableId },
        select: { gmId: true }
      });

      if (!table) {
        return res.status(404).json({ error: 'Mesa não encontrada.' });
      }

      if (table.gmId !== requesterId) {
        return res.status(403).json({ 
          error: 'Apenas o Mestre pode remover jogadores.',
          code: 'FORBIDDEN'
        });
      }

      // Remover o jogador
      await prisma.tablePlayer.deleteMany({
        where: {
          tableId,
          userId: playerId
        }
      });

      res.status(200).json({ message: 'Jogador removido da mesa!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao remover jogador.' });
    }
  }
}
```

---

## 🔌 CONECTAR FRONTEND À API

### Step 1: Criar API Service Baseado

**frontend/src/services/api-client.ts**
```typescript
export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_URL) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  private getHeaders(contentType = 'application/json'): HeadersInit {
    const headers: any = { 'Content-Type': contentType };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options.headers?.['Content-Type'] as string);

    let response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    // Se receber 401 e tem refresh token, tenta renovar
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      
      if (refreshed) {
        const newHeaders = this.getHeaders();
        response = await fetch(url, {
          ...options,
          headers: { ...newHeaders, ...options.headers }
        });
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### Step 2: Atualizar Auth Service

**frontend/src/services/auth.ts**
```typescript
import { apiClient } from './api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export const authService = {
  current(): User | null {
    const data = localStorage.getItem('rpg_current_user');
    return data ? JSON.parse(data) : null;
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const data = await apiClient.post('/users/login', { login: email, password });
      
      // Salvar tokens
      apiClient.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      
      // Salvar dados do usuário
      const user: User = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        avatarUrl: data.user.avatarUrl
      };
      
      localStorage.setItem('rpg_current_user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  },

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<User> {
    try {
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
      
      const data = await apiClient.post('/users/register', {
        username,
        firstName,
        lastName,
        email,
        password
      });
      
      // Salvar tokens
      apiClient.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      
      const user: User = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName
      };
      
      localStorage.setItem('rpg_current_user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao registrar');
    }
  },

  logout() {
    apiClient.clearTokens();
    localStorage.removeItem('rpg_current_user');
  },

  update(user: User) {
    localStorage.setItem('rpg_current_user', JSON.stringify(user));
  }
};
```

### Step 3: Configurar Variáveis de Ambiente Frontend

**frontend/.env**
```
VITE_API_URL=http://localhost:3000/api
```

**frontend/.env.production**
```
VITE_API_URL=https://mastersbook-api.onrender.com/api
```

### Step 4: Conectar Página de Mesas

**frontend/src/pages/Mesas.tsx**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface Table {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  gm: { id: string; username: string; avatarUrl?: string };
  players: Array<{
    id: string;
    user: { id: string; username: string };
    character: { id: string; firstName: string; lastName: string };
  }>;
}

interface System {
  id: string;
  name: string;
  description?: string;
}

export default function Mesas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemId: ''
  });

  // Buscar mesas
  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables'],
    queryFn: () => apiClient.get<Table[]>('/tables/get-all'),
    enabled: !!user // Só carrega se autenticado
  });

  // Buscar sistemas RPG
  const { data: systems = [] } = useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient.get<System[]>('/systems')
  });

  // Criar mesa
  const createTableMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post('/tables/create', {
        ...data,
        gmId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa criada com sucesso!');
      setFormData({ name: '', description: '', systemId: '' });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar mesa');
    }
  });

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.systemId) {
      toast.error('Preencha nome e sistema');
      return;
    }

    createTableMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Carregando mesas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Erro ao carregar mesas. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Mesas de Jogo</h1>
          <p className="text-gray-600 mt-2">
            {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'} disponível(is)
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Mesa</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Campanha</label>
                <Input
                  placeholder="Ex: Profecia das Sombras"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  placeholder="Descreva sua campanha..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sistema de RPG</label>
                <select
                  value={formData.systemId}
                  onChange={(e) => setFormData({ ...formData, systemId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecione um sistema</option>
                  {systems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createTableMutation.isPending}
                >
                  {createTableMutation.isPending ? 'Criando...' : 'Criar Mesa'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {tables.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhuma mesa encontrada</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <div key={table.id} className="p-4 border rounded-lg hover:shadow-lg transition">
              <h3 className="font-bold text-lg">{table.name}</h3>
              {table.description && (
                <p className="text-sm text-gray-600 mt-2">{table.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mestre: {table.gm.username}
                </span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {table.inviteCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {table.players.length} {table.players.length === 1 ? 'jogador' : 'jogadores'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 CONFIGURAR TESTES

### Backend - Jest Setup

**backend/package.json** - adicionar scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.7",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.12"
  }
}
```

**backend/jest.config.js**
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
```

**backend/src/__tests__/user.controller.test.ts**
```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../database/prisma';

describe('UserController', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tokens.accessToken');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'user1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123'
      };

      // Primeiro registro
      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/users/register')
        .send({ ...userData, username: 'differentuser' });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('Email');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: '123' // Muito curto
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          login: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tokens.accessToken');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          login: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('inválidas');
    });
  });
});
```

### Frontend - Vitest Setup

**frontend/vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**frontend/src/test/setup.ts**
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;
```

**frontend/src/__tests__/hooks/useAuth.test.tsx**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  it('should return null user initially', async () => {
    let authValue;

    function TestComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(authValue.user).toBeNull();
  });

  it('should handle login', async () => {
    let authValue;

    function TestComponent() {
      authValue = useAuth();
      return (
        <button onClick={() => authValue.login('test@example.com', 'password')}>
          Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Mock da chamada de login
    const button = screen.getByText('Login');
    // button.click();

    // Esperar que user seja definido
    // await waitFor(() => {
    //   expect(authValue.user).toBeDefined();
    // });
  });
});
```

---

## ✅ MELHORIAS DE VALIDAÇÃO

### Atualizar Schemas com Validações Mais Rigorosas

**backend/src/schemas/user-schema.ts**
```typescript
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Senha deve conter maiúsculas, minúsculas, números e caracteres especiais"
  );

const usernameSchema = z
  .string()
  .min(3, "Username deve ter no mínimo 3 caracteres")
  .max(20, "Username deve ter no máximo 20 caracteres")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username pode conter apenas letras, números, underscore e hífen"
  );

export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    firstName: z.string().min(2, "Nome obrigatório").max(50),
    lastName: z.string().min(2, "Sobrenome obrigatório").max(50),
    email: z.string().email("E-mail inválido"),
    password: passwordSchema
  })
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string().min(3, "E-mail ou usuário obrigatório"),
    password: z.string().min(1, "Senha obrigatória")
  })
});

export type RegisterUserInput = z.infer<typeof registerSchema>['body'];
export type LoginUserInput = z.infer<typeof loginSchema>['body'];
```

**backend/src/schemas/character-schema.ts**
```typescript
import { z } from 'zod';

// Schema validado por tipo de RPG
const d5AttributesSchema = z.object({
  hp: z.number().int().positive(),
  mana: z.number().int().nonnegative().optional(),
  ac: z.number().int().min(0).max(20).optional(),
  // ... outros atributos D&D 5e
}).strict();

export const createCharacterSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    race: z.string().min(2).max(30),
    class: z.string().min(2).max(30),
    level: z.number().int().min(1).max(20).default(1),
    attributes: z.record(z.string(), z.any()), // TODO: validar por sistema
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    userId: z.string().uuid(),
    systemId: z.string().uuid()
  })
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>['body'];
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1
- [ ] Implementar JWT Authentication
- [ ] Criar Authentication Middleware
- [ ] Remover endpoints /delete-all desprotegidos
- [ ] Adicionar verificação de ownership em Character & Table

### Semana 2
- [ ] Conectar Mesas.tsx à API
- [ ] Conectar Fichas.tsx à API
- [ ] Conectar Amigos.tsx à API
- [ ] Implementar React Query mutations

### Semana 3
- [ ] Setup de testes backend (Jest)
- [ ] Criar testes para UserController
- [ ] Setup de testes frontend (Vitest)
- [ ] Criar testes para componentes críticos

### Semana 4
- [ ] Implementar email verification
- [ ] Adicionar rate limiting
- [ ] Melhorar validações Zod
- [ ] Implementar soft deletes

---

**Última atualização:** 30/04/2026
