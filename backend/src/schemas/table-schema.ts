import { z } from 'zod';

// Parâmetros de URL (IDs)
export const tableIdParamSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "O ID da mesa inválido." }),
  }),
});

export const gmIdParamSchema = z.object({
  params: z.object({
    gmId: z.uuid({ message: "O ID do Mestre (GM) inválido." }),
  }),
});

// Criar Mesa (POST)
export const createTableSchema = z.object({
  body: z.object({
    name: z.string().min(3, "O nome da campanha precisa ter no mínimo 3 caracteres."),
    description: z.string().optional(),
    gmId: z.uuid({ message: "O ID do Mestre é obrigatório e deve ser válido." }),
    systemId: z.uuid({ message: "O ID do Sistema de RPG é obrigatório e deve ser válido." }),
  }),
});

// Atualizar Mesa (PATCH)
export const updateTableSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "O ID da mesa inválido." }),
  }),
  body: z.object({
    name: z.string().min(3, "O nome da campanha precisa ter no mínimo 3 caracteres.").optional(),
    description: z.string().optional(),
  }),
});

// Entrar na Mesa (POST)
export const joinTableSchema = z.object({
  body: z.object({
    inviteCode: z.string().length(6, "O código de convite deve ter exatamente 6 caracteres."),
    userId: z.uuid({ message: "O ID do jogador é obrigatório e deve ser válido." }),
    characterId: z.uuid({ message: "O ID da ficha (personagem) é obrigatório e deve ser válido." }),
  }),
});

// Remover/Sair da Mesa (DELETE)
export const removePlayerSchema = z.object({
  params: z.object({
    tableId: z.uuid({ message: "ID da mesa inválido." }),
    playerId: z.uuid({ message: "ID do jogador (que será removido) inválido." }),
  }),
  body: z.object({
    requesterId: z.uuid({ message: "O ID de quem está a fazer a requisição é obrigatório para validação de segurança." }),
  }),
});

// Parâmetro de ID de Usuário para Listagens
export const tableUserIdParamSchema = z.object({
  params: z.object({
    userId: z.uuid({ message: "O ID do usuário inválido." }),
  }),
});

// Atualizar Estado Global (Mundo/Sessão)
export const updateTableStateSchema = z.object({
  params: z.object({
    id: z.uuid("ID da mesa inválido."),
  }),
  body: z.object({
    currentLocation: z.string().optional(),
    inGameDate: z.string().optional(),
    weather: z.string().optional(),
    activeScene: z.string().optional(),
    initiativeOrder: z.any().optional(), // Aceita o array JSON da iniciativa
    publicNotes: z.string().optional(),
  }),
});

// Atualizar Status Temporário do Jogador (HP/Mana/Condições)
export const updatePlayerStatusSchema = z.object({
  params: z.object({
    tableId: z.uuid("ID da mesa inválido."),
    playerId: z.uuid("ID do jogador inválido."),
  }),
  body: z.object({
    currentAttributes: z.any().optional(),
    temporaryAttributes: z.any().optional(),
    conditions: z.any().optional(),
  }),
});

// Atualizar Notas Privadas do Jogador
export const updatePlayerNotesSchema = z.object({
  params: z.object({
    tableId: z.uuid("ID da mesa inválido."),
    playerId: z.uuid("ID do jogador inválido."),
  }),
  body: z.object({
    privateNotes: z.string().optional(),
  }),
});

// Extração de Tipos
export type UpdateTableStateInput = z.infer<typeof updateTableStateSchema>['body'];
export type UpdatePlayerStatusInput = z.infer<typeof updatePlayerStatusSchema>['body'];
export type UpdatePlayerNotesInput = z.infer<typeof updatePlayerNotesSchema>['body'];
export type CreateTableInput = z.infer<typeof createTableSchema>['body'];
export type UpdateTableInput = z.infer<typeof updateTableSchema>['body'];
export type JoinTableInput = z.infer<typeof joinTableSchema>['body'];
export type RemovePlayerInput = z.infer<typeof removePlayerSchema>['body'];