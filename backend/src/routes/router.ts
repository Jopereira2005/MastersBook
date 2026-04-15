import { Router } from 'express';
import { userRoutes } from './user-routes.js'; 

const router = Router();

// Tudo que vier de userRoutes terá o prefixo '/users'
router.use('/users', userRoutes);

// Futuramente:
// router.use('/characters', characterRoutes);
// router.use('/tables', tableRoutes);

export { router };