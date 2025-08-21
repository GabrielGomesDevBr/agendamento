# CliniAgende - Sistema de Agendamento para Terapia Infantil

## 🎯 Sobre o Projeto

**CliniAgende** é uma aplicação full-stack moderna para gerenciamento de agendamentos de terapia infantil. Desenvolvido como MVP com backend Node.js, PostgreSQL e frontend responsivo.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Joi** para validação de dados
- **Helmet** e Rate Limiting para segurança

### Frontend
- **HTML5**, **CSS3** e **JavaScript** vanilla
- **Tailwind CSS** para estilização
- **Lucide Icons** para ícones
- **Fetch API** para comunicação com backend

## 🏗️ Arquitetura

```
agendamento_clinica/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuração PostgreSQL
│   ├── controllers/
│   │   ├── authController.js    # Autenticação
│   │   ├── pacientesController.js
│   │   ├── agendamentosController.js
│   │   └── disponibilidadesController.js
│   ├── middleware/
│   │   ├── auth.js             # Middleware JWT
│   │   └── validation.js       # Validação Joi
│   ├── models/                 # Migrations SQL
│   ├── routes/                 # Rotas da API
│   └── scripts/
│       ├── migrate.js          # Criação das tabelas
│       └── seed.js             # Popular com dados
├── js/
│   ├── api.js                  # Cliente da API
│   ├── data-api.js            # Gerenciamento de dados
│   ├── app.js                 # Aplicação principal
│   └── utils.js               # Utilitários
├── css/                       # Estilos
├── data/                      # Dados JSON originais
├── .env                       # Variáveis de ambiente
├── server.js                  # Servidor Express
└── package.json
```

## 📊 Banco de Dados

### Tabelas Principais:
- **supervisores** - Usuários supervisores
- **terapeutas** - Usuários terapeutas
- **pacientes** - Dados completos dos pacientes
- **agendamentos** - Sessões agendadas
- **disponibilidades** - Horários disponíveis
- **tipos_terapia** - Tipos de terapia oferecidos

## 🔐 Autenticação e Segurança

- **JWT Tokens** com expiração de 24h
- **Senhas hasheadas** com bcryptjs (salt 10)
- **Rate limiting** (100 req/15min por IP)
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** rigorosa de dados de entrada

## 🚀 Como Executar

### 1. Pré-requisitos
```bash
# Node.js 18+ e PostgreSQL 12+
node --version
psql --version
```

### 2. Configurar Banco
```bash
# Criar banco PostgreSQL
createdb agendamento_db
```

### 3. Configurar Ambiente
```bash
# Editar .env com suas credenciais
DB_PASSWORD=sua_senha_postgresql
```

### 4. Instalar e Executar
```bash
# Instalar dependências
npm install

# Executar migrations
npm run migrate

# Popular com dados de exemplo
npm run seed

# Iniciar servidor
npm start
```

### 5. Acessar Aplicação
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 👤 Credenciais de Acesso

### Supervisores:
- **mariana.costa@clinica.com** / senha: `123456`
- **roberto.silva@clinica.com** / senha: `123456`

### Terapeutas:
- **ana.sousa@clinica.com** / senha: `123456`
- **carlos.lima@clinica.com** / senha: `123456`
- **marina.santos@clinica.com** / senha: `123456`
- **joao.oliveira@clinica.com** / senha: `123456`
- **fernanda.costa@clinica.com** / senha: `123456`
- **beatriz.almeida@clinica.com** / senha: `123456`

## 🔧 Scripts NPM

```bash
npm start        # Iniciar servidor de produção
npm run dev      # Iniciar servidor de desenvolvimento (com nodemon)
npm run migrate  # Executar migrations do banco
npm run seed     # Popular banco com dados de exemplo
```

## 📋 Funcionalidades

### 👥 **Para Supervisores:**
- ✅ Login seguro com JWT
- ✅ Dashboard com estatísticas em tempo real
- ✅ **Cadastro completo de pacientes** (NEW!)
- ✅ Visualização de todos os pacientes
- ✅ Gestão de agendamentos
- ✅ Controle da equipe de terapeutas
- ✅ Relatórios e exportação de dados

### 👩‍⚕️ **Para Terapeutas:**
- ✅ Login seguro com JWT
- ✅ Agenda personalizada
- ✅ Visualização dos próprios pacientes
- ✅ Controle de disponibilidades
- ✅ Atualização de status de sessões

### 🛡️ **Recursos de Segurança:**
- ✅ Autenticação JWT com middleware
- ✅ Validação rigorosa de dados (Joi)
- ✅ Rate limiting por IP
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Senhas hasheadas com bcryptjs

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/change-password` - Trocar senha

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `GET /api/pacientes/:id` - Buscar paciente
- `POST /api/pacientes` - Criar paciente (supervisor)
- `PUT /api/pacientes/:id` - Atualizar paciente (supervisor)
- `GET /api/pacientes/search` - Buscar com filtros

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/:id` - Buscar agendamento
- `POST /api/agendamentos` - Criar agendamento (supervisor)
- `PATCH /api/agendamentos/:id/status` - Atualizar status
- `GET /api/agendamentos/estatisticas` - Estatísticas

### Disponibilidades
- `GET /api/disponibilidades` - Listar disponibilidades
- `POST /api/disponibilidades` - Criar disponibilidade
- `DELETE /api/disponibilidades/:id` - Remover disponibilidade

## 🆕 Principais Melhorias Implementadas

1. **🔐 Sistema de Autenticação Completo**
   - Login real com email/senha
   - JWT tokens seguros
   - Middleware de autenticação

2. **💾 Banco de Dados PostgreSQL**
   - Estrutura normalizada
   - Migrations automáticas
   - Relacionamentos consistentes

3. **📝 Cadastro de Pacientes Avançado**
   - Formulário completo com validações
   - Máscaras automáticas (CPF, telefone, CEP)
   - Integração com API

4. **🛡️ Segurança Profissional**
   - Rate limiting
   - Validação de dados
   - Headers de segurança

5. **🔧 Arquitetura Escalável**
   - Separação de responsabilidades
   - Controllers, middlewares e rotas organizados
   - API RESTful padronizada

## 📈 Próximos Passos (Roadmap)

- [ ] Dashboard com gráficos avançados
- [ ] Sistema de notificações em tempo real
- [ ] Upload de documentos de pacientes
- [ ] Integração com calendário Google
- [ ] App mobile React Native
- [ ] Relatórios PDF automatizados
- [ ] Sistema de backup automático

## 🤝 Contribuição

Este projeto foi desenvolvido como MVP funcional para demonstração de um sistema completo de agendamento clínico.

---

**Desenvolvido com ❤️ para a comunidade de terapia infantil**

*Versão: 2.0 Full-Stack - PostgreSQL + Node.js + JWT*