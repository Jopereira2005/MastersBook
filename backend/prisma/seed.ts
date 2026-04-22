import { prisma } from '../src/database/prisma.js'; // Ajuste o caminho se necessário
import bcrypt from 'bcrypt';

// Usamos uma nova instância simples do Prisma apenas para o seed

async function main() {
  console.log('🌱 Iniciando o seeder...');

  console.log('👥 Criando 5 sistemas de teste...');

  await prisma.system.createMany({
    data: [
      {
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5ª Edição - O maior RPG de fantasia medieval.',
      },
      {
        name: 'Ordem Paranormal',
        description: 'RPG de investigação e terror baseado no universo de Cellbit.',
      },
      {
        name: 'Tormenta20',
        description: 'O maior RPG de fantasia do Brasil. Um mundo de heróis, deuses e ameaças.',
      },
      {
        name: 'Call of Cthulhu',
        description: 'RPG de horror cósmico investigativo focado em desvendar mistérios e manter a sanidade.',
      },
      {
        name: 'Vampiro: A Máscara',
        description: 'RPG de horror pessoal e intriga política onde os jogadores interpretam vampiros na sociedade moderna.',
      }
    ],
    skipDuplicates: true, // Ignora se o sistema já existir no banco (evita erros ao rodar o seeder várias vezes)
  });

  console.log('👥 Criando 5 utilizadores de teste...');
  
  const hashedPassword = await bcrypt.hash('senha123', 10);
  const usersToCreate = [
    { username: 'mestre_supremo', firstName: 'João', lastName: 'Mestre', email: 'mestre@rpg.com' },
    { username: 'elfo_noturno', firstName: 'Lucas', lastName: 'Silva', email: 'lucas@rpg.com' },
    { username: 'anao_furioso', firstName: 'Gimli', lastName: 'Montanha', email: 'anao@rpg.com' },
    { username: 'mago_implacavel', firstName: 'Gandalf', lastName: 'Branco', email: 'mago@rpg.com' },
    { username: 'ladina_furtiva', firstName: 'Arya', lastName: 'Stark', email: 'ladina@rpg.com' }
  ];

  for (const user of usersToCreate) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {}, // Se já existir, não faz nada
      create: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
      },
    });
  }

  console.log('✅ Seeder finalizado com sucesso!');
  console.log('🎲 5 Sistemas carregados no catálogo.');
  console.log('👥 5 Utilizadores prontos! Todos usam a senha: "senha123"');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Desconecta do banco quando terminar
    await prisma.$disconnect();
  });