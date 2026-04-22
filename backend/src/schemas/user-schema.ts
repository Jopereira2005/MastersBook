import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
    firstName: z.string().min(1, "Nome obrigatório"),
    lastName: z.string().min(1, "Sobrenome obrigatório"),
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
  })
});

// Tipagem para o Controller de Cadastro
export type RegisterUserInput = z.infer<typeof registerSchema>['body'];

export const loginSchema = z.object({
  body: z.object({
    // O usuário pode digitar tanto o e-mail quanto o username aqui
    login: z.string().min(1, "Informe seu e-mail ou nome de usuário."),
    password: registerSchema.shape.body.shape.password
  })
});

// Tipagem para o Controller de Login
export type LoginUserInput = z.infer<typeof loginSchema>['body'];

export const getProfileSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "ID inválido." }),
  }),
});

export const updateProfileSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "ID inválido." }),
  }),
  body: z.object({
    username: z.string().min(3, "Username precisa de no mínimo 3 caracteres.").optional(),
    firstName: z.string().min(2, "Nome precisa de no mínimo 2 caracteres.").optional(),
    lastName: z.string().min(2, "Sobrenome precisa de no mínimo 2 caracteres.").optional(),
    avatarUrl: z.url("URL inválida da imagem.").optional(),
  }),
});

// Tipagem para o Controller de Atualização de Perfil
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

export const deleteProfileSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "ID inválido." }),
  }),
  body: z.object({
    password: z.string().min(1, "A senha é obrigatória para confirmar a exclusão do perfil."),
  }),
});

// Tipagem para o Controller de Exclusão de Perfil
export type DeleteProfileInput = z.infer<typeof deleteProfileSchema>['body'];