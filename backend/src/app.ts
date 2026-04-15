import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes/router.js';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// Carrega o documento Swagger a partir do arquivo YAML
const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Configura a rota para servir a documentação do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', router);

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.send('API funcionando corretamente!');
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Not Found 404' });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error 500', message: err.message });
});

export { app };