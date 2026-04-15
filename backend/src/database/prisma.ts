import 'dotenv/config'; // Garantia dupla de que as variáveis foram lidas
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js'; 

const connectionString = process.env.DATABASE_URL;

// O Alarme: Se a URL estiver vazia, trava o servidor na hora com uma mensagem clara
if (!connectionString) {
  throw new Error('⚠️ ERRO CRÍTICO: A variável DATABASE_URL não foi encontrada pelo Node.js. Verifique se o arquivo .env existe e se o caminho está correto.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}