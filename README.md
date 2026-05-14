# 🐉 MastersBook - Virtual Tabletop & RPG Manager

![MastersBook Banner](https://via.placeholder.com/1200x300.png?text=MastersBook+-+Sua+Aventura+Começa+Aqui)

O **MastersBook** é uma plataforma Full-Stack moderna para gerenciamento de fichas de RPG e Virtual Tabletop (VTT). Criado para oferecer uma experiência fluida, imersiva e em tempo real, ele conecta Mestres (GMs) e Jogadores em campanhas sincronizadas através de um motor robusto de WebSockets.

---

## 🌟 Principais Funcionalidades

### 👤 Social e Gestão
* **Autenticação e Perfis**: Cadastro seguro e personalização de avatares.
* **Sistema de Amizades**: Adicione amigos, aceite convites e construa seu grupo de jogo.
* **Gerenciador de Fichas (Characters)**: Criação flexível de fichas. Atributos baseados em JSON dinâmico, suportando qualquer sistema de RPG (D&D, Ordem Paranormal, Tormenta, etc.).

### 🗺️ VTT e Mesas de Jogo
* **Salas (Tables)**: Criação de campanhas com códigos de convite únicos.
* **Motor de Combate em Tempo Real**:
  * Tracker de Iniciativa e ordem de turnos.
  * Alteração visual imediata na tela de todos os jogadores.
  * Edição dinâmica de HP, Condições e Atributos pela ficha ou pelo mestre.
* **Mundo Sincronizado**: O Mestre pode alterar Clima, Cenário (Exploração/Combate) e Localização, e o React atualiza a UI instantaneamente.

### 🎲 Chat e Rolagem de Dados
* **Parser de Dados no Backend**: Validação anti-trapaça. O backend calcula as rolagens (ex: `/r 1d20+5`) e distribui o resultado com destaque visual (`**Crítico**`).
* **Categorias de Chat**: Mensagens filtradas por `STORY` (Interpretação), `OOC` (Off-topic), `LOG` (Sistema) e `DICE` (Dados).
* **Moderação**: Edição e exclusão de mensagens em tempo real.

---

## 🛠️ Tecnologias e Arquitetura

O projeto adota uma separação estrita de responsabilidades (Separation of Concerns) entre a lógica visual e as regras de negócio.

### 💻 Frontend (Client-side)
* **[React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)**: Renderização ultrarrápida e build otimizado.
* **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária e design responsivo.
* **[Axios](https://axios-http.com/)**: Camada de `Services` isolada para consumo da API REST.
* **[Socket.io-client](https://socket.io/)**: Ouvintes (`socket.on`) para reatividade instantânea ao estado do combate e mensagens.
* **TypeScript**: Interfaces espelhadas exatamente com o *Schema* do Prisma para type-safety de ponta a ponta.

### ⚙️ Backend (Server-side)
* **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)**: Servidor RESTful modular (Rotas, Controllers, Middlewares).
* **[Prisma ORM](https://www.prisma.io/)**: Interação declarativa e tipada com o banco de dados.
* **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados relacional (otimizado para o Render).
* **[Socket.io](https://socket.io/)**: Servidor acoplado ao `httpServer` para broadcast de eventos do VTT.
* **[Zod](https://zod.dev/)**: Validação rigorosa dos *payloads* no middleware HTTP.
* **[Swagger](https://swagger.io/)**: Documentação viva acessível na rota `/api-docs`.

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
* Node.js (v16 ou superior)
* PostgreSQL rodando localmente ou na nuvem
* Git

### 1. Configurando o Backend

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/mastersbook.git](https://github.com/seu-usuario/mastersbook.git)
cd mastersbook/backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a sua DATABASE_URL do PostgreSQL

# Execute as migrações do banco de dados (Cria as tabelas)
npx prisma migrate dev

# Inicie o servidor
npm run dev
# A API estará rodando em http://localhost:3000/api
```

### 1. Configurando o Frontend

```bash
# Em um novo terminal, vá para a pasta frontend
cd mastersbook/frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Certifique-se de definir VITE_API_URL=http://localhost:3000

# Inicie a aplicação React
npm run dev
# O app estará disponível em http://localhost:5173
```