const pool = require('../config/database');

const migrations = [
  // Tabela de supervisores
  `CREATE TABLE IF NOT EXISTS supervisores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    avatar VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabela de terapeutas
  `CREATE TABLE IF NOT EXISTS terapeutas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    crf VARCHAR(50),
    especialidades TEXT[],
    avatar VARCHAR(500),
    horario_trabalho JSONB,
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabela de pacientes
  `CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    telefone VARCHAR(20),
    email_responsavel VARCHAR(255),
    endereco JSONB,
    responsavel JSONB,
    diagnostico_principal VARCHAR(500),
    diagnosticos_secundarios TEXT[],
    medicacoes TEXT[],
    alergias TEXT[],
    tipo_terapia VARCHAR(100),
    frequencia_recomendada VARCHAR(50),
    preferencias TEXT[],
    gatilhos TEXT[],
    estrategias_eficazes TEXT[],
    observacoes TEXT,
    escola VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabela de tipos de terapia
  `CREATE TABLE IF NOT EXISTS tipos_terapia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao_sessao INTEGER DEFAULT 60,
    cor VARCHAR(7) DEFAULT '#3b82f6',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabela de disponibilidades
  `CREATE TABLE IF NOT EXISTS disponibilidades (
    id SERIAL PRIMARY KEY,
    terapeuta_id INTEGER REFERENCES terapeutas(id) ON DELETE CASCADE,
    data_hora TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'disponivel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabela de agendamentos
  `CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    terapeuta_id INTEGER REFERENCES terapeutas(id) ON DELETE CASCADE,
    data_hora TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 60,
    tipo_terapia VARCHAR(100),
    local VARCHAR(100),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Índices para performance
  `CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf)`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora)`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id)`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_terapeuta ON agendamentos(terapeuta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_disponibilidades_terapeuta ON disponibilidades(terapeuta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_disponibilidades_data ON disponibilidades(data_hora)`
];

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migração do banco de dados...');
    
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Executando migração ${i + 1}/${migrations.length}...`);
      await pool.query(migrations[i]);
    }
    
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };