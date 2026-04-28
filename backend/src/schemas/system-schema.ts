import { z } from 'zod';

// ==========================================
// Parâmetros de URL
// ==========================================
export const systemIdParamSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "O ID do sistema inválido." }),
  }),
});

// ==========================================
// Criar Sistema (POST)
// ==========================================
export const createSystemSchema = z.object({
  body: z.object({
    name: z.string().min(2, "O nome do sistema precisa ter no mínimo 2 caracteres."),
    description: z.string().optional(),
  }),
});

// ==========================================
// Atualizar Sistema (PATCH)
// ==========================================
export const updateSystemSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "O ID do sistema inválido." }),
  }),
  body: z.object({
    name: z.string().min(2, "O nome do sistema precisa ter no mínimo 2 caracteres.").optional(),
    description: z.string().optional(),
  }),
});

// Extração de Tipos
export type CreateSystemInput = z.infer<typeof createSystemSchema>['body'];
export type UpdateSystemInput = z.infer<typeof updateSystemSchema>['body'];