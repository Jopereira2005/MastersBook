import { Router } from 'express';
import { userRoutes } from './user-routes.js'; 
import { characterRoutes } from './character-routes.js';
import { friendshipRoutes } from './friendship-routes.js';

const router = Router();

// Tudo que vier de userRoutes terá o prefixo '/users'
router.use('/users', userRoutes);
router.use('/characters', characterRoutes);
router.use('/friendships', friendshipRoutes);

// Futuramente:
// router.use('/tables', tableRoutes);

export { router };