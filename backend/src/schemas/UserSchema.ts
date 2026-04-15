import { z } from 'zod';

// ==========================================
// Schema Principal / Cadastro
// ==========================================
export const UserSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
    firstName: z.string().min(1, "Nome obrigatório"),
    lastName: z.string().min(1, "Sobrenome obrigatório"),
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
  })
});

// Tipagem para o Controller de Cadastro
export type RegisterUserInput = z.infer<typeof UserSchema>['body'];


// ==========================================
// Schema Login
// ==========================================
export const loginSchema = z.object({
  body: z.object({
    // O usuário pode digitar tanto o e-mail quanto o username aqui
    login: z.string().min(1, "Informe seu e-mail ou nome de usuário."),
    password: UserSchema.shape.body.shape.password
  })
});

// Tipagem para o Controller de Login
export type LoginUserInput = z.infer<typeof loginSchema>['body'];