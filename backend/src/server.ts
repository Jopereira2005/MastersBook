import dotenv from 'dotenv';
import { app } from './app.js';
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('📄 Documentação do Swagger disponivel');
  console.log('Acesse: http://localhost:3000/api-docs');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/api`);
});