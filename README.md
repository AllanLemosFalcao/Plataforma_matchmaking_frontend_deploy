# caisUp — Frontend

Plataforma PWA (Progressive Web App) de matchmaking corporativo que conecta de forma inteligente Startups em busca de captação e Investidores procurando as melhores oportunidades de negócio.

---

## 👨‍💻 Desenvolvedor

**Nome do Projeto:** CAISUP

| Nome | Papel | GitHub |
|------|-------|--------|
| Allan Harrison Lemos de Barros Falcão | Full-Stack | [AllanLemosFalcao](https://github.com/AllanLemosFalcao) |

---

## 🔗 Links do Projeto

| Recurso | Link |
|---------|------|
| 🌐 Aplicação em Produção | [plataforma-matchmaking-frontend-dep.vercel.app](https://plataforma-matchmaking-frontend-dep.vercel.app/) |
| 🎨 Repositório Front-End | [Plataforma_matchmaking_frontend_deploy](https://github.com/AllanLemosFalcao/Plataforma_matchmaking_frontend_deploy) |
| ⚙️ Repositório Back-End | [Plataforma_matchmaking_backend-banco_deploy](https://github.com/AllanLemosFalcao/Plataforma_matchmaking_backend-banco_deploy) |

### 🔑 Credenciais para Teste (Live Demo)
Acesse a plataforma utilizando qualquer um dos e-mails abaixo.
**Senha padrão para todas as contas:** `123456`

* `teste@teste.com`
* `deals@venturelog.com`
* `contato@agrosmart.com`
* `ceo@saudeplus.com`
* `admin@finpay.com`
* `contato@educafacil.com`
* `ops@logisfast.com`
* `dealflow@bossanova.com`
* `contato@agroventures.com`
* `invest@capitalhealth.com`
* `joao.anjo@gmail.com`

---

## 🚀 Sobre o Projeto (Front-End)

O frontend do **caisUp** é uma aplicação moderna, rápida e responsiva. Ele gerencia as jornadas isoladas para Startups e Investidores, oferecendo dashboards analíticos, tela de busca avançada (Matchmaking com base em *score*), visualização de perfil detalhada e um chat em tempo real alimentado por WebSockets.

---

## ✅ Funcionalidades

- 🔐 **Autenticação**: Registro e login dinâmicos direcionados ao perfil de atuação.
- 📊 **Dashboard Interativo**: Resumo de interesses recebidos, enviados e histórico de matches.
- 🔍 **Busca Avançada**: Filtros por segmento, estágio e localização, com tags de compatibilidade geradas pelo algoritmo do backend.
- ❤️ **Sistema de Matches**: Registrar interesse, receber notificações e aceitar/recusar convites.
- 💬 **Conversas em Tempo Real**: Chat persistente em salas exclusivas utilizando Socket.io.
- 📱 **PWA Integrado**: Suporte *offline-first* e instalável nativamente em dispositivos móveis e desktops.

---

## 🛠️ Tecnologias

- **React 19**
- **TypeScript** para tipagem estática segura
- **Tailwind CSS v4** para estilização utilitária e design responsivo
- **React Router 8** para roteamento protegido (SPA)
- **Socket.io-client** para conexão com o chat em tempo real
- **Vite** como bundler ultrarrápido
- **Vite PWA Plugin** para configuração do Progressive Web App

---

## 📦 Como Rodar Localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- NPM ou Yarn
- A [API do Backend](https://github.com/AllanLemosFalcao/Plataforma_matchmaking_backend-banco_deploy) rodando localmente (caso não queira consumir a API de produção).

### 2. Clonar o Repositório

```bash
git clone https://github.com/AllanLemosFalcao/Plataforma_matchmaking_frontend_deploy.git
cd Plataforma_matchmaking_frontend_deploy
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=https://url-do-seu-backend-no-render.com
```
*(Se deixado vazio, a configuração padrão em `api.ts` apontará para `http://localhost:3000`)*

### 5. Executar o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/      # Componentes de UI genéricos e de Layout
│   ├── contexts/        # AuthProvider e gerenciamento de estado de usuário
│   ├── mocks/           # Fallback local (localStorage) em data.ts
│   ├── pages/           # Telas (Buscar, Cadastro, Conversas, Dashboard, Perfil, etc)
│   ├── services/        # api.ts (Camada de acesso a dados / Fetch HTTP)
│   ├── utils/           # Formatadores e utilitários visuais
│   ├── App.tsx          # Componente Raiz
│   ├── routes.tsx       # Mapeamento do React Router (Rotas Protegidas e Públicas)
│   └── types.ts         # Tipagens TypeScript (Perfil, Mensagens, Matches)
├── public/              # Assets estáticos e ícones do manifesto PWA
├── tailwind.config.js   # Configurações de tema e cores
└── vite.config.ts       # Configurações do Vite e plugin PWA
```

---

## 🚀 Deploy na Vercel

A aplicação está configurada para deploy contínuo na Vercel. Certifique-se de configurar a variável de ambiente `VITE_API_URL` nas configurações do painel da Vercel para que a comunicação com a API ocorra corretamente em produção.

---

## 📝 Licença

Projeto de código aberto desenvolvido para fins educacionais e de portfólio.
