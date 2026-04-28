import { Router } from 'express';
import { TableController } from '../controllers/table-controller.js';
import { validate } from '../middlewares/validate-middleware.js';

import { 
  createTableSchema, 
  updateTableSchema, 
  tableIdParamSchema, 
  gmIdParamSchema,
  joinTableSchema,
  removePlayerSchema
} from '../schemas/table-schema.js';

const tableRoutes = Router();
const tableController = new TableController();

// Rotas de Teste
tableRoutes.get('/get-all', tableController.getAllTables.bind(tableController));
tableRoutes.delete('/delete-all', tableController.deleteAllTables.bind(tableController));

// Rotas Base (Mestre)
tableRoutes.post('/create', validate(createTableSchema), tableController.createTable.bind(tableController));
tableRoutes.get('/get-by-gm/:gmId', validate(gmIdParamSchema), tableController.getTablesByGm.bind(tableController));
tableRoutes.patch('/update/:id', validate(updateTableSchema), tableController.updateTable.bind(tableController));
tableRoutes.patch('/regenerate-code/:id', validate(tableIdParamSchema), tableController.regenerateInviteCode.bind(tableController));
tableRoutes.delete('/delete/:id', validate(tableIdParamSchema), tableController.deleteTable.bind(tableController));

// Rotas de Jogadores
tableRoutes.post('/join', validate(joinTableSchema), tableController.joinTable.bind(tableController));
tableRoutes.delete('/:tableId/players/:playerId', validate(removePlayerSchema), tableController.removePlayer.bind(tableController));

export { tableRoutes };