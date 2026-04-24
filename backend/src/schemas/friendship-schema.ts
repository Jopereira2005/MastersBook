import { z } from 'zod';

export const sendInviteSchema = z.object({
  body: z.object({
    senderId: z.uuid({ message: "O ID do usuário inválido." }),
    // Aceita tanto email quanto username, por isso não usamos .email() aqui
    receiverIdentifier: z.string().min(3, "O username ou email deve ter no mínimo 3 caracteres."),
  }),
});

export type SendInviteInput = z.infer<typeof sendInviteSchema>['body'];