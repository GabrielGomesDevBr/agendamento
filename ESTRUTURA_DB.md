# 📋 ESTRUTURA DO BANCO DE DADOS
## Sistema de Agendamento de Clínica de Terapia Infantil

---

## 🏗️ VISÃO GERAL DA ARQUITETURA

O banco de dados **`agendamento_db`** é estruturado para gerenciar um sistema completo de clínica de terapia infantil, com **6 tabelas principais** que cobrem todo o fluxo operacional:

- **👥 Gestão de Usuários:** supervisores, terapeutas, pacientes
- **📅 Agendamento:** agendamentos, disponibilidades  
- **🏥 Configuração:** tipos_terapia

---

## 📊 TABELAS DETALHADAS

### 1. 👑 **SUPERVISORES** (9 colunas)
**Função:** Gerentes/administradores da clínica

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **nome** | `varchar` | ✅ | - | Nome completo |
| **email** | `varchar` | ✅ | - | Email único (login) |
| **senha_hash** | `varchar` | ✅ | - | Senha criptografada |
| **telefone** | `varchar` | ❌ | - | Contato |
| **avatar** | `varchar` | ❌ | - | URL da foto |
| **status** | `varchar` | ❌ | `'ativo'` | Status do usuário |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |
| **updated_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data atualização |

---

### 2. 👨‍⚕️ **TERAPEUTAS** (12 colunas)
**Função:** Profissionais que atendem os pacientes

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **nome** | `varchar` | ✅ | - | Nome completo |
| **email** | `varchar` | ✅ | - | Email único (login) |
| **senha_hash** | `varchar` | ✅ | - | Senha criptografada |
| **telefone** | `varchar` | ❌ | - | Contato |
| **crf** | `varchar` | ❌ | - | Registro profissional |
| **especialidades** | `ARRAY` | ❌ | - | **Lista** de especialidades |
| **avatar** | `varchar` | ❌ | - | URL da foto |
| **horario_trabalho** | `jsonb` | ❌ | - | **JSON** com horários disponíveis |
| **status** | `varchar` | ❌ | `'ativo'` | Status do profissional |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |
| **updated_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data atualização |

---

### 3. 👶 **PACIENTES** (23 colunas)
**Função:** Crianças que recebem atendimento

#### **Dados Pessoais**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **nome** | `varchar` | ✅ | - | Nome completo da criança |
| **data_nascimento** | `date` | ❌ | - | Data de nascimento |
| **genero** | `varchar` | ❌ | - | Gênero da criança |
| **cpf** | `varchar` | ✅ | - | CPF único |
| **rg** | `varchar` | ❌ | - | RG |

#### **Endereço e Contato**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **endereco** | `varchar` | ❌ | - | Endereço completo |
| **cidade** | `varchar` | ❌ | - | Cidade |
| **estado** | `varchar` | ❌ | - | Estado |
| **cep** | `varchar` | ❌ | - | CEP |
| **telefone** | `varchar` | ❌ | - | Telefone de contato |
| **email** | `varchar` | ✅ | - | Email para acesso |
| **senha_hash** | `varchar` | ✅ | - | Senha para portal paciente |

#### **Responsáveis**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **nome_responsavel** | `varchar` | ❌ | - | Nome do responsável |
| **contato_responsavel** | `varchar` | ❌ | - | Contato do responsável |

#### **Plano de Saúde**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **plano_saude** | `varchar` | ❌ | - | Nome do plano |
| **numero_carteirinha** | `varchar` | ❌ | - | Número da carteirinha |

#### **Médico e Controle**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **historico_medico** | `text` | ❌ | - | Histórico médico |
| **terapeuta_responsavel_id** | `integer` | ❌ | - | FK para terapeutas |
| **supervisor_responsavel_id** | `integer` | ❌ | - | FK para supervisores |
| **status** | `varchar` | ❌ | `'ativo'` | Status do paciente |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |
| **updated_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data atualização |

---

### 4. 🏥 **TIPOS_TERAPIA** (7 colunas)
**Função:** Configuração dos tipos de atendimento

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **nome** | `varchar` | ✅ | - | Nome do tipo de terapia |
| **descricao** | `text` | ❌ | - | Descrição detalhada |
| **duracao_sessao** | `integer` | ❌ | `60` | Duração em minutos |
| **valor_sessao** | `numeric(10,2)` | ❌ | - | **Valor** da sessão |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |
| **updated_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data atualização |

---

### 5. 📅 **AGENDAMENTOS** (11 colunas)
**Função:** Sessões agendadas entre paciente e terapeuta

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **paciente_id** | `integer` | ❌ | - | FK para pacientes |
| **terapeuta_id** | `integer` | ❌ | - | FK para terapeutas |
| **data_hora** | `timestamp` | ✅ | - | **Data e hora** da sessão |
| **duracao** | `integer` | ❌ | `60` | Duração em minutos |
| **tipo_terapia** | `varchar` | ❌ | - | Tipo de terapia |
| **local** | `varchar` | ❌ | - | Local do atendimento |
| **observacoes** | `text` | ❌ | - | Observações da sessão |
| **status** | `varchar` | ❌ | `'agendado'` | Status do agendamento |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |
| **updated_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data atualização |

---

### 6. ⏰ **DISPONIBILIDADES** (6 colunas)
**Função:** Horários livres dos terapeutas

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| **id** | `integer` | ✅ | auto_increment | Chave primária |
| **terapeuta_id** | `integer` | ❌ | - | FK para terapeutas |
| **data_hora** | `timestamp` | ✅ | - | **Data e hora** disponível |
| **duracao** | `integer` | ❌ | `60` | Duração em minutos |
| **status** | `varchar` | ❌ | `'disponivel'` | Status da disponibilidade |
| **created_at** | `timestamp` | ❌ | `CURRENT_TIMESTAMP` | Data criação |

---

## 🔗 RELACIONAMENTOS

```
SUPERVISORES (1) ←→ (N) PACIENTES
    ↓
TERAPEUTAS (1) ←→ (N) PACIENTES
    ↓
TERAPEUTAS (1) ←→ (N) AGENDAMENTOS ←→ (1) PACIENTES
    ↓
TERAPEUTAS (1) ←→ (N) DISPONIBILIDADES
```

### **Foreign Keys:**
- `pacientes.terapeuta_responsavel_id` → `terapeutas.id`
- `pacientes.supervisor_responsavel_id` → `supervisores.id`
- `agendamentos.paciente_id` → `pacientes.id`
- `agendamentos.terapeuta_id` → `terapeutas.id`
- `disponibilidades.terapeuta_id` → `terapeutas.id`

---

## 🔑 CAMPOS ESPECIAIS

### **Campos JSON/Array:**
- **`terapeutas.especialidades`**: Array de strings 
  ```json
  ["ABA", "Terapia Ocupacional", "Fonoaudiologia"]
  ```
- **`terapeutas.horario_trabalho`**: JSON com horários de trabalho
  ```json
  {
    "segunda": "08:00-17:00",
    "terca": "09:00-18:00",
    "quarta": "08:00-17:00",
    "quinta": "09:00-18:00",
    "sexta": "08:00-16:00"
  }
  ```

### **Campos de Valores:**
- **`tipos_terapia.valor_sessao`**: Decimal com 2 casas decimais `NUMERIC(10,2)`
  - Exemplo: `150.00`, `200.50`

### **Status Padrões:**
- **Usuários**: `'ativo'` (supervisores, terapeutas, pacientes)
- **Agendamentos**: `'agendado'`  
- **Disponibilidades**: `'disponivel'`

### **Possíveis Status:**
#### Agendamentos:
- `'agendado'` - Sessão marcada
- `'realizado'` - Sessão concluída
- `'cancelado'` - Sessão cancelada
- `'faltou'` - Paciente não compareceu

#### Disponibilidades:
- `'disponivel'` - Horário livre
- `'ocupado'` - Horário reservado
- `'bloqueado'` - Horário indisponível

---

## 📈 ÍNDICES E PERFORMANCE

### **Chaves Primárias:**
Todas as tabelas têm `id` auto-incremento com índice único

### **Campos Únicos:**
- `supervisores.email`
- `terapeutas.email`  
- `pacientes.email`
- `pacientes.cpf`

### **Índices Recomendados:**
```sql
-- Performance para consultas frequentes
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_terapeuta ON agendamentos(terapeuta_id);
CREATE INDEX idx_disponibilidades_terapeuta ON disponibilidades(terapeuta_id);
CREATE INDEX idx_disponibilidades_data ON disponibilidades(data_hora);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
```

---

## 🚀 CASOS DE USO

### **Fluxo Principal:**
1. **Cadastro de Supervisor**: Administrador principal da clínica
2. **Cadastro de Terapeutas**: Supervisor cadastra profissionais
3. **Definição de Especialidades**: Terapeutas definem suas áreas
4. **Cadastro de Pacientes**: Supervisor/Terapeuta cadastra crianças
5. **Configuração de Tipos de Terapia**: Definir valores e durações
6. **Gestão de Disponibilidades**: Terapeutas definem horários livres
7. **Agendamento de Sessões**: Associar paciente + terapeuta + horário
8. **Controle de Sessões**: Marcar como realizada/cancelada/falta
9. **Relatórios**: Análise de performance e faturamento

### **Consultas Comuns:**
```sql
-- Agendamentos do dia
SELECT * FROM agendamentos 
WHERE DATE(data_hora) = CURRENT_DATE;

-- Pacientes de um terapeuta
SELECT p.* FROM pacientes p 
WHERE p.terapeuta_responsavel_id = 1;

-- Disponibilidades da semana
SELECT * FROM disponibilidades 
WHERE data_hora BETWEEN '2025-08-25' AND '2025-08-31'
AND status = 'disponivel';

-- Relatório de sessões realizadas
SELECT COUNT(*) as sessoes_realizadas, 
       t.nome as terapeuta
FROM agendamentos a
JOIN terapeutas t ON a.terapeuta_id = t.id
WHERE a.status = 'realizado'
AND DATE(a.data_hora) >= '2025-08-01'
GROUP BY t.nome;
```

---

## 🛠️ COMANDOS ÚTEIS

### **Backup do Banco:**
```bash
pg_dump -h localhost -U postgres -d agendamento_db > backup_$(date +%Y%m%d).sql
```

### **Restaurar Backup:**
```bash
psql -h localhost -U postgres -d agendamento_db < backup_20250821.sql
```

### **Verificar Integridade:**
```sql
-- Verificar FKs órfãs
SELECT COUNT(*) FROM pacientes p 
LEFT JOIN terapeutas t ON p.terapeuta_responsavel_id = t.id 
WHERE p.terapeuta_responsavel_id IS NOT NULL AND t.id IS NULL;
```

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Senhas**: Todas armazenadas como hash (bcrypt)
2. **Timestamps**: Sempre em UTC, conversão no frontend
3. **Arrays PostgreSQL**: `especialidades` usa array nativo do PostgreSQL
4. **JSONB**: `horario_trabalho` permite consultas e índices JSON
5. **Soft Delete**: Use campo `status` em vez de DELETE físico
6. **Auditoria**: `created_at` e `updated_at` em todas as tabelas principais

---

---

## 🔐 **CREDENCIAIS DE TESTE**

### **Supervisores:**
```
Email: mariana.costa@clinica.com
Senha: TempPassword123!
Role: supervisor

Email: roberto.silva@clinica.com  
Senha: TempPassword123!
Role: supervisor
```

### **Terapeutas:**
```
Email: ana.sousa@clinica.com
Senha: TempPassword123!
Role: terapeuta

Email: carlos.lima@clinica.com
Senha: TempPassword123!
Role: terapeuta

Email: marina.santos@clinica.com
Senha: TempPassword123!
Role: terapeuta

Email: joao.oliveira@clinica.com
Senha: TempPassword123!
Role: terapeuta

Email: fernanda.costa@clinica.com
Senha: TempPassword123!
Role: terapeuta

Email: beatriz.almeida@clinica.com
Senha: TempPassword123!
Role: terapeuta
```

### **⚠️ IMPORTANTE - SEGURANÇA:**
- 🔐 **ALTERE IMEDIATAMENTE** as senhas após primeiro login
- 🚫 **NÃO use essas credenciais em produção**
- 📝 Configure `DEFAULT_SEED_PASSWORD` no `.env` para personalizar
- 🛡️ Senhas são armazenadas com **bcrypt (salt 12)**

### **🧪 Como Testar a Aplicação:**
```bash
# 1. Fazer login como supervisor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mariana.costa@clinica.com","password":"TempPassword123!"}'

# 2. Usar o token JWT retornado para acessar endpoints protegidos
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/pacientes

# 3. Verificar saúde da API
curl http://localhost:3000/api/health

# 4. Listar terapeutas (público)
curl http://localhost:3000/api/terapeutas
```

---

## ✅ **STATUS DA APLICAÇÃO - TESTADO E FUNCIONAL**

### **🎯 Testes Realizados (21/08/2025):**
- ✅ **Migração:** Scripts executados com sucesso
- ✅ **Seed:** Dados inseridos corretamente (2 supervisores, 6 terapeutas, 7 pacientes)
- ✅ **APIs:** Todos endpoints respondendo (health, auth, terapeutas, pacientes, estatísticas)
- ✅ **Autenticação:** JWT funcionando, login supervisor/terapeuta OK
- ✅ **Frontend:** Carregando e funcional
- ✅ **Banco:** Estrutura alinhada 100% com aplicação

### **📊 Dados Atuais no Sistema:**
- **Tipos de Terapia:** 8 configurados
- **Supervisores:** 2 ativos  
- **Terapeutas:** 6 ativos com especialidades
- **Pacientes:** 7 cadastrados
- **Agendamentos:** 0 (sistema pronto para uso)
- **Disponibilidades:** 0 (aguardando configuração)

### **🌐 Endpoints da API Funcionais:**
```
GET  /api/health              - Health check (público)
POST /api/auth/login          - Login (público)
GET  /api/terapeutas          - Listar terapeutas (público)
GET  /api/pacientes           - Listar pacientes (autenticado)
GET  /api/agendamentos        - Listar agendamentos (autenticado)
GET  /api/agendamentos/estatisticas - Estatísticas (autenticado)
GET  /api/disponibilidades    - Listar disponibilidades (autenticado)
```

### **🚀 Dados de Teste Disponíveis:**
- **8 tipos de terapia** configurados com valores
- **2 supervisores** cadastrados (Mariana Costa, Roberto Silva)
- **6 terapeutas** ativos com especialidades definidas
- **7 pacientes** cadastrados com dados completos
- **Senha padrão:** `TempPassword123!` (alterar após primeiro login)

---

**📅 Última atualização:** 21/08/2025  
**🏥 Sistema:** CliniAgende v4  
**💾 Banco:** PostgreSQL 13+  
**🔄 Status:** Totalmente funcional e testado