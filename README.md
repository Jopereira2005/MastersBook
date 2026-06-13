# 🐉 MastersBook - Virtual Tabletop & RPG Manager


O **MastersBook** é uma plataforma Full-Stack moderna para gerenciamento de fichas de RPG e Virtual Tabletop (VTT). Criado para oferecer uma experiência fluida, imersiva e em tempo real, ele conecta Mestres (GMs) e Jogadores em campanhas sincronizadas através de um motor robusto de WebSockets.

> [!NOTE]
> **Projeto Acadêmico**
> Este projeto foi desenvolvido como instrumento de avaliação para a disciplina de **Desenvolvimento Web** do curso de **Engenharia da Computação** do **Centro Universitário Facens** (Sorocaba, SP - 2026), sob orientação do Prof. **Deivison Takatu**.
> 
> **Desenvolvido por:**
> - João Augusto Pereira Vieira
> - Gabriel Moreira Nazareno
> - Rui Anderson Cruzeiro Prado Pereira
> - Victor Rafael Soares Otacílio

---

## 🌟 Principais Funcionalidades

### 👤 Social e Gestão
* **Autenticação e Perfis**: Cadastro seguro com criptografia (`bcrypt`), personalização de perfis e avatares.
* **Sistema de Amizades**: Adicione amigos, aceite convites (estados: Pendente, Aceito, Recusado, Bloqueado) e construa seu grupo de jogo.
* **Gerenciador de Fichas (Characters)**: Criação flexível de fichas com atributos baseados em JSON dinâmico. Suporta múltiplos sistemas de RPG pré-configurados, permitindo adaptar qualquer regra.

### 🗺️ VTT e Mesas de Jogo
* **Salas (Tables)**: Criação de campanhas isoladas com códigos de convite únicos.
* **Estado de Jogo em Tempo Real (TableState)**:
  * **Exploração vs Combate**: Alternância dinâmica de cenas.
  * **Motor de Combate**: Tracker de Iniciativa, controle rigoroso de ordem de turnos.
  * **Ambiente**: O Mestre pode alterar Clima, Cenário, Data in-game e Localização, refletindo na tela de todos instantaneamente via WebSocket.
* **Gestão de Jogadores na Mesa**: Controle individual de HP (Atributos Atuais vs Temporários), condições e anotações privadas.

### 🎲 Chat e Rolagem de Dados
* **Categorias de Chat Avançadas**:
  * `STORY`: Interpretação (In-Character).
  * `OOC`: Conversas fora do personagem (Out-of-Character).
  * `LOG`: Registros do sistema (clima, alterações de estado).
  * `DICE`: Resultados de rolagens.
* **Reatividade Instantânea**: Mensagens processadas e distribuídas em milissegundos.

---

## 🛠️ Tecnologias e Arquitetura

O projeto adota uma arquitetura modular, com separação estrita de responsabilidades entre cliente e servidor.

### 💻 Frontend (Client-side)
* **[React.js 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)**: Renderização ultrarrápida e build otimizado.
* **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática rigorosa.
* **[Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)**: Estilização utilitária, design responsivo e componentes acessíveis (Radix UI).
* **[TanStack React Query](https://tanstack.com/query/latest)**: Gerenciamento de estado assíncrono e cache inteligente.
* **[React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)**: Formulários performáticos com validação de schemas.
* **[Socket.io-client](https://socket.io/)**: Ouvintes (`socket.on`) para reatividade instantânea ao estado do combate e mensagens.
* **[Axios](https://axios-http.com/)**: Camada de `Services` isolada para consumo da API REST.

### ⚙️ Backend (Server-side)
* **[Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)**: Servidor RESTful modular (Rotas, Controllers, Middlewares).
* **[TypeScript](https://www.typescriptlang.org/)**: Type-safety de ponta a ponta, compartilhando modelos com o frontend.
* **[Prisma ORM](https://www.prisma.io/)**: Interação declarativa e tipada com o banco de dados.
* **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados relacional robusto.
* **[Socket.io](https://socket.io/)**: Servidor acoplado ao `httpServer` para broadcast de eventos do VTT.
* **[Zod](https://zod.dev/)**: Validação rigorosa dos *payloads* no middleware HTTP.
* **[Swagger](https://swagger.io/)**: Documentação viva acessível na rota `/api-docs`.

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
* Node.js (v18 ou superior)
* PostgreSQL rodando localmente ou na nuvem
* Git

### 1. Configurando o Backend

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mastersbook.git
cd mastersbook/backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a sua DATABASE_URL do PostgreSQL

# Execute as migrações do banco de dados (Cria as tabelas)
npx prisma migrate dev

# Inicie o servidor em modo de desenvolvimento
npm run dev

# A API estará rodando em http://localhost:3000/api
# Acesse o Swagger em http://localhost:3000/api-docs
```

### 2. Configurando o Frontend

```bash
# Em um novo terminal, vá para a pasta frontend
cd mastersbook/frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Certifique-se de definir a URL da API no .env, por exemplo:
# VITE_API_URL=http://localhost:3000

# Inicie a aplicação React
npm run dev

# O app estará disponível em http://localhost:5173
```

---

## 📂 Estrutura do Projeto

```text
mastersbook/
├── backend/
│   ├── prisma/          # Schema do banco de dados e migrations
│   ├── src/
│   │   ├── controllers/ # Lógica de negócios e regras de requisição
│   │   ├── middlewares/ # Autenticação, validação (Zod) e tratamento de erros
│   │   ├── routes/      # Definição dos endpoints REST (Express)
│   │   └── utils/       # Funções auxiliares
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Componentes reutilizáveis (Shadcn UI e personalizados)
    │   ├── hooks/       # Custom hooks (React Query, WebSocket)
    │   ├── pages/       # Telas principais (Home, Mesas, EmMesa, Fichas, Perfil, etc)
    │   └── services/    # Configuração do Axios e chamadas à API
    └── package.json
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir *Issues* relatando bugs, ou submeter *Pull Requests* com melhorias e novas funcionalidades.