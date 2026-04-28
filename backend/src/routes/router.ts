import { Router } from 'express';
import { userRoutes } from './user-routes.js'; 
import { characterRoutes } from './character-routes.js';
import { friendshipRoutes } from './friendship-routes.js';
import { tableRoutes } from './table-routes.js';
import { systemRoutes } from './system-routes.js';

const router = Router();

// Tudo que vier de userRoutes terá o prefixo '/users'
router.use('/users', userRoutes);
router.use('/characters', characterRoutes);
router.use('/friendships', friendshipRoutes);
router.use('/tables', tableRoutes);
router.use('/systems', systemRoutes);

export { router };