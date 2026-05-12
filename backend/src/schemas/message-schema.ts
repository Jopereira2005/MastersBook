import { z } from 'zod';

// Criar Mensagem
export const createMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, "A mensagem não pode estar vazia."),
    type: z.enum(['STORY', 'OOC', 'LOG', 'DICE']),
    userId: z.uuid("ID de usuário inválido."),
    tableId: z.uuid("ID de mesa inválido."),
    characterId: z.uuid().optional().nullable(),
  }),
});

// Buscar Mensagens da Mesa (Paginação)
export const getMessagesQuerySchema = z.object({
  params: z.object({
    tableId: z.uuid("ID da mesa inválido."),
  }),
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
  }),
});

// Atualizar Mensagem (Edição de texto)
export const updateMessageSchema = z.object({
  params: z.object({
    id: z.uuid("ID da mensagem inválido."),
  }),
  body: z.object({
    content: z.string().min(1, "O conteúdo não pode estar vazio."),
  }),
});

// Parâmetro de ID único
export const messageIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("ID inválido."),
  }),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>['body'];
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>['body'];