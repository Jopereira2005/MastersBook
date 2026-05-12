import { Router } from 'express';
import { TableController } from '../controllers/table-controller.js';
import { validate } from '../middlewares/validate-middleware.js';

import { 
  createTableSchema, 
  updateTableSchema, 
  tableIdParamSchema, 
  gmIdParamSchema,
  joinTableSchema,
  removePlayerSchema,
  tableUserIdParamSchema,
  updateTableStateSchema,
  updatePlayerStatusSchema,
  updatePlayerNotesSchema
} from '../schemas/table-schema.js';

const tableRoutes = Router();
const tableController = new TableController();

// Rotas de Teste
tableRoutes.get('/get-all', tableController.getAllTables.bind(tableController));
tableRoutes.delete('/delete-all', tableController.deleteAllTables.bind(tableController));

// Rotas Base (Mestre)
tableRoutes.post('/create', validate(createTableSchema), tableController.createTable.bind(tableController));
tableRoutes.patch('/update/:id', validate(updateTableSchema), tableController.updateTable.bind(tableController));
tableRoutes.patch('/regenerate-code/:id', validate(tableIdParamSchema), tableController.regenerateInviteCode.bind(tableController));
tableRoutes.delete('/delete/:id', validate(tableIdParamSchema), tableController.deleteTable.bind(tableController));

// Rotas de Usuários
tableRoutes.get('/get-by-gm/:gmId', validate(gmIdParamSchema), tableController.getTablesByGm.bind(tableController));
tableRoutes.get('/player/:userId', validate(tableUserIdParamSchema), tableController.getPlayerTables.bind(tableController));
tableRoutes.get('/available/:userId', validate(tableUserIdParamSchema), tableController.getAvailableTables.bind(tableController));
tableRoutes.post('/join', validate(joinTableSchema), tableController.joinTable.bind(tableController));

// Rotas de Jogadores
tableRoutes.delete('/:tableId/players/:playerId', validate(removePlayerSchema), tableController.removePlayer.bind(tableController));
// 1. Carregar a Mesa Inteira (Quando o jogador ou GM abre a tela de jogo)
tableRoutes.get('/get/:id', validate(tableIdParamSchema), tableController.getTableById.bind(tableController));

// 2. Atualizar o Estado do Mundo (Mestre)
tableRoutes.patch('/state/:id', validate(updateTableStateSchema), tableController.updateTableState.bind(tableController));

// 3. Atualizar Vida/Sanidade e Notas (Jogadores / Mestre)
tableRoutes.patch('/:tableId/players/:playerId/status', validate(updatePlayerStatusSchema), tableController.updatePlayerStatus.bind(tableController));
tableRoutes.patch('/:tableId/players/:playerId/notes', validate(updatePlayerNotesSchema), tableController.updatePlayerNotes.bind(tableController));

export { tableRoutes };