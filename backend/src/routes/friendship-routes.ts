import { Router } from 'express';
import { validate } from '../middlewares/validate-middleware.js';
import { FriendshipController } from '../controllers/friendship-controller.js';
import { sendInviteSchema } from '../schemas/friendship-schema.js';

const friendshipRoutes = Router();
const friendshipController = new FriendshipController();

// Rotas de Teste
friendshipRoutes.get('/get-all', friendshipController.getAll.bind(friendshipController));
friendshipRoutes.delete('/delete-all', friendshipController.deleteAll.bind(friendshipController));

friendshipRoutes.post('/invite', validate(sendInviteSchema), friendshipController.sendInvite.bind(friendshipController));

export { friendshipRoutes };