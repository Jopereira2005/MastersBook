import { Router } from 'express';
import { validate } from '../middlewares/validate-middleware.js';
import { FriendshipController } from '../controllers/friendship-controller.js';

import { 
  friendshipIdParamSchema, 
  friendshipUserIdParamSchema, 
  sendInviteSchema 
} from '../schemas/friendship-schema.js';

const friendshipRoutes = Router();
const friendshipController = new FriendshipController();

// Rotas de Teste
friendshipRoutes.get('/get-all', friendshipController.getAll.bind(friendshipController));
friendshipRoutes.delete('/delete-all', friendshipController.deleteAll.bind(friendshipController));

friendshipRoutes.post('/invite', validate(sendInviteSchema), friendshipController.sendInvite.bind(friendshipController));
friendshipRoutes.get('/pending/:userId', validate(friendshipUserIdParamSchema), friendshipController.getPendingInvites.bind(friendshipController));
friendshipRoutes.get('/friends/:userId', validate(friendshipUserIdParamSchema), friendshipController.getFriendsList.bind(friendshipController));
friendshipRoutes.patch('/accept/:id', validate(friendshipIdParamSchema), friendshipController.acceptInvite.bind(friendshipController));
friendshipRoutes.delete('/decline/:id', validate(friendshipIdParamSchema), friendshipController.declineInvite.bind(friendshipController));
friendshipRoutes.delete('/remove-friend/:id', validate(friendshipIdParamSchema), friendshipController.removeFriend.bind(friendshipController));
export { friendshipRoutes };