import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { validate } from '../middlewares/validate-middleware.js';
import { 
  createCharacterSchema, 
} from '../schemas/character-schema.js';
import { CharacterController } from '../controllers/character-controller.js';

const characterRoutes = Router();
const characterController = new CharacterController();

characterRoutes.post('/create', validate(createCharacterSchema), characterController.createCharacter.bind(characterController));

export { characterRoutes };