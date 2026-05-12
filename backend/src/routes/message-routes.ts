import { Router } from 'express';
import { MessageController } from '../controllers/message-controller.js';
import { validate } from '../middlewares/validate-middleware.js';
import { 
  createMessageSchema, 
  getMessagesQuerySchema, 
  updateMessageSchema,
  messageIdParamSchema 
} from '../schemas/message-schema.js';

const messageRoutes = Router();
const messageController = new MessageController();

// Rotas de Teste/Limpeza
messageRoutes.delete('/delete-all', messageController.deleteAllMessages.bind(messageController));

// Rotas Principais
messageRoutes.get('/table/:tableId', validate(getMessagesQuerySchema), messageController.getMessagesByTable.bind(messageController));
messageRoutes.post('/create', validate(createMessageSchema), messageController.createMessage.bind(messageController));
messageRoutes.patch('/update/:id', validate(updateMessageSchema), messageController.updateMessage.bind(messageController));
messageRoutes.delete('/delete/:id', validate(messageIdParamSchema), messageController.deleteMessage.bind(messageController));

export { messageRoutes };