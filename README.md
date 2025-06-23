# 📡 API Portal (Node.js + Express)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-%5E4.18-lightgrey)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

API desenvolvida com **Node.js** e **Express**, que atua como camada de backend da aplicação `app-portal`. Essa API realiza a ponte entre a interface React e o banco de dados relacional (MySQL ou equivalente), fornecendo serviços REST para consulta, cadastro e atualização de dados.

---

## 📑 Sumário

- [🚀 Objetivo](#-objetivo)
- [🧱 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Instalação](#️-instalação)
- [🌐 Endpoints](#-endpoints)
- [🪪 Licença](#-licença)
- [📬 Contato](#-contato)

---

## 🚀 Objetivo

Centralizar e padronizar a comunicação entre o front-end (`app-portal`) e o banco de dados, garantindo segurança, consistência e escalabilidade.

---

## 🧱 Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript
- **Express.js** – Framework para criação de servidores
- **MySQL** – Banco de dados relacional
- **Dotenv** – Variáveis de ambiente
- **Cors** – Middleware para controle de acesso
- **Body-parser** – Parser de requisições JSON
- **Nodemon** (dev) – Hot reload em desenvolvimento

---

## 📂 Estrutura do Projeto

api-portal/
├── controllers/ # Lógica de negócio (ex: navios, metas, ocorrências)
├── models/ # Conexão e queries com o banco de dados
├── routes/ # Rotas da API organizadas por recurso
├── db/ # Conexão com o SQL
├── .env # Variáveis de ambiente (não versionado)
├── .gitignore # Arquivos e pastas ignoradas pelo Git
├── index.js # Ponto de entrada da aplicação
├── package.json # Scripts e dependências
└── README.md # Documentação do projeto

---

## ⚙️ Instalação

1. **Clone o repositório:**
**bash**
git clone https://github.com/ronneyrv/api-portal.git
cd api-portal
npm install

---

## 🌐 **Endpoints**

**markdown**
## 🌐 Endpoints

A API segue o padrão REST. Alguns exemplos de rotas disponíveis:

| Método | Rota                    | Descrição                          |
|--------|-------------------------|------------------------------------|
| GET    | `/navios`               | Lista todos os navios              |
| POST   | `/descarregamentos`     | Cadastra novo descarregamento      |
| PUT    | `/arqueacoes/:id`       | Atualiza a arqueação de um navio   |
| DELETE | `/ocorrencias/:id`      | Remove uma ocorrência registrada   |

> Os endpoints são definidos dentro da pasta `routes/`.
🪪 Licença
Este projeto está licenciado sob a Licença MIT.
Consulte o arquivo LICENSE para mais detalhes.

📬 Contato
Desenvolvido por Ronney Rocha
📧 ronneyrv@email.com
📧 ronney.rocha@energiapecem.com
📎 Projeto Frontend: app-portal
