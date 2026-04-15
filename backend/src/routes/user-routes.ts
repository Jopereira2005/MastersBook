import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { validate } from '../middlewares/validate-middleware.js';
import { loginSchema, UserSchema } from '../schemas/user-schema.js';

const userRoutes = Router();
const userController = new UserController();


userRoutes.post('/register', validate(UserSchema), userController.register.bind(userController));
userRoutes.post('/login', validate(loginSchema), userController.login.bind(userController));

export { userRoutes };