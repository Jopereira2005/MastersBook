import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validate } from '../middlewares/ValidateMiddleware.js';
import { loginSchema, UserSchema } from '../schemas/UserSchema.js';

const userRoutes = Router();
const userController = new UserController();


userRoutes.post('/register', validate(UserSchema), userController.register.bind(userController));
userRoutes.post('/login', validate(loginSchema), userController.login.bind(userController));

export { userRoutes };