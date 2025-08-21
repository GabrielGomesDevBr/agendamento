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
    data_nascimento DATE,
    genero VARCHAR(255),
    cpf VARCHAR(255) NOT NULL UNIQUE,
    rg VARCHAR(255),
    endereco VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255),
    cep VARCHAR(255),
    telefone VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome_responsavel VARCHAR(255),
    contato_responsavel VARCHAR(255),
    plano_saude VARCHAR(255),
    numero_carteirinha VARCHAR(255),
    historico_medico TEXT,
    status VARCHAR(255) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    terapeuta_responsavel_id INTEGER,
    supervisor_responsavel_id INTEGER
  )`,

  // Tabela de tipos de terapia
  `CREATE TABLE IF NOT EXISTS tipos_terapia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_sessao INTEGER DEFAULT 60,
    valor_sessao NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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