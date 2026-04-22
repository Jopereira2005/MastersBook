import { z } from 'zod';

export const createCharacterSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "O primeiro nome precisa ter no mínimo 2 caracteres."),
    lastName: z.string().min(2, "O sobrenome precisa ter no mínimo 2 caracteres."),
    race: z.string().min(2, "A raça é obrigatória."),
    class: z.string().min(2, "A classe é obrigatória."),
    level: z.number().int("O nível deve ser um número inteiro.").min(1).optional(),
    
    // O Json flexível do Prisma mapeado pelo Zod
    attributes: z.record(z.string(), z.any(), {
      message: "Os atributos devem ser um objeto JSON válido."
    }),
    
    bio: z.string().optional(),
    avatarUrl: z.url("URL do avatar inválida.").optional(),
    
    // IDs das relações
    userId: z.uuid({ message: "ID do usuário inválido." }),
    systemId: z.uuid({ message: "ID do sistema de RPG inválido." })
  })
});

// Extrai o Type para usarmos no Controller
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>['body'];