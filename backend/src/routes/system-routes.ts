import { Router } from 'express';
import { SystemController } from '../controllers/system-controller.js';
import { validate } from '../middlewares/validate-middleware.js';

import { 
  createSystemSchema, 
  updateSystemSchema, 
  systemIdParamSchema 
} from '../schemas/system-schema.js';

const systemRoutes = Router();
const systemController = new SystemController();

// Rotas de Teste
systemRoutes.get('/get-all', systemController.getAllSystems.bind(systemController));
systemRoutes.delete('/delete-all', systemController.deleteAllSystems.bind(systemController));

systemRoutes.post('/create', validate(createSystemSchema), systemController.createSystem.bind(systemController));
systemRoutes.get('/get/:id', validate(systemIdParamSchema), systemController.getSystemById.bind(systemController));
systemRoutes.patch('/update/:id', validate(updateSystemSchema), systemController.updateSystem.bind(systemController));
systemRoutes.delete('/delete/:id', validate(systemIdParamSchema), systemController.deleteSystem.bind(systemController));

export { systemRoutes };