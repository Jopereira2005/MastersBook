import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes/router.js';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import dotenv from 'dotenv';

// 👇 1. Importamos as ferramentas nativas do Node e do Socket.io
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();

// 👇 2. Centralizamos o CORS para garantir que API e Socket aceitem a mesma origem
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Permite envio de cookies/tokens se necessário
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// 👇 3. Criamos o Servidor HTTP bruto englobando o Express
const httpServer = createServer(app);

// 👇 4. Iniciamos o Socket.io preso a este servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error 500', message: err.message });
});

// 👇 5. Exportamos o httpServer e o io (O app vai junto caso precise)
export { app, httpServer, io };