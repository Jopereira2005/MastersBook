import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { validate } from '../middlewares/validate-middleware.js';

import { 
  createCharacterSchema,
  updateCharacterSchema, 
  getDeleteCharacterIdSchema,
  getCharacterUserIdSchema

} from '../schemas/character-schema.js';

import { CharacterController } from '../controllers/character-controller.js';

const characterRoutes = Router();
const characterController = new CharacterController();

characterRoutes.post('/create', validate(createCharacterSchema), characterController.createCharacter.bind(characterController));
characterRoutes.patch('/update/:id', validate(updateCharacterSchema), characterController.updateCharacter.bind(characterController));
characterRoutes.get('/:id', validate(getDeleteCharacterIdSchema), characterController.getCharacterById.bind(characterController));
characterRoutes.get('/user/:userId', validate(getCharacterUserIdSchema), characterController.getCharactersByUserId.bind(characterController));
characterRoutes.delete('/delete/:id', validate(getDeleteCharacterIdSchema), characterController.deleteCharacter.bind(characterController));

export { characterRoutes };
