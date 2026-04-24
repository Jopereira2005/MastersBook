import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { validate } from '../middlewares/validate-middleware.js';
import { 
  getProfileSchema, 
  loginSchema, 
  registerSchema,
  updateProfileSchema,
  deleteProfileSchema
} from '../schemas/user-schema.js';

const userRoutes = Router();
const userController = new UserController();

// Rotas de Teste
userRoutes.get('/get-all', userController.getAll.bind(userController));
userRoutes.delete('/delete-all', userController.deleteAll.bind(userController));

userRoutes.post('/register', validate(registerSchema), userController.register.bind(userController));
userRoutes.post('/login', validate(loginSchema), userController.login.bind(userController));
userRoutes.get('/profile/:id', validate(getProfileSchema), userController.getProfileById.bind(userController));
userRoutes.patch('/update/:id', validate(updateProfileSchema), userController.updateProfile.bind(userController));
userRoutes.delete('/delete/:id', validate(deleteProfileSchema), userController.deleteProfile.bind(userController));

export { userRoutes };