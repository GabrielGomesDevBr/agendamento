const pool = require('../config/database');

// Listar todos os pacientes
const getAllPacientes = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id, nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
        endereco, responsavel, diagnostico_principal, diagnosticos_secundarios,
        medicacoes, alergias, tipo_terapia, frequencia_recomendada,
        preferencias, gatilhos, estrategias_eficazes, observacoes, escola, status,
        created_at, updated_at
      FROM pacientes 
      ORDER BY nome ASC
    `);

    res.json({
      message: 'Pacientes listados com sucesso',
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar paciente por ID
const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(`
      SELECT 
        id, nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
        endereco, responsavel, diagnostico_principal, diagnosticos_secundarios,
        medicacoes, alergias, tipo_terapia, frequencia_recomendada,
        preferencias, gatilhos, estrategias_eficazes, observacoes, escola, status,
        created_at, updated_at
      FROM pacientes 
      WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Paciente encontrado',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar novo paciente
const createPaciente = async (req, res) => {
  try {
    const {
      nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
      endereco, responsavel, diagnostico_principal, diagnosticos_secundarios,
      medicacoes, alergias, tipo_terapia, frequencia_recomendada,
      preferencias, gatilhos, estrategias_eficazes, observacoes, escola
    } = req.body;

    // Verificar se CPF já existe
    const { rows: existingPaciente } = await pool.query(
      'SELECT id FROM pacientes WHERE cpf = $1',
      [cpf]
    );

    if (existingPaciente.length > 0) {
      return res.status(400).json({
        error: 'Já existe um paciente cadastrado com este CPF',
        code: 'CPF_ALREADY_EXISTS'
      });
    }

    // Inserir novo paciente
    const { rows } = await pool.query(`
      INSERT INTO pacientes (
        nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
        endereco, responsavel, diagnostico_principal, diagnosticos_secundarios,
        medicacoes, alergias, tipo_terapia, frequencia_recomendada,
        preferencias, gatilhos, estrategias_eficazes, observacoes, escola, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
      JSON.stringify(endereco), JSON.stringify(responsavel), diagnostico_principal,
      diagnosticos_secundarios || [], medicacoes || [], alergias || [],
      tipo_terapia, frequencia_recomendada, preferencias || [],
      gatilhos || [], estrategias_eficazes || [], observacoes, escola, 'ativo'
    ]);

    res.status(201).json({
      message: 'Paciente cadastrado com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Atualizar paciente
const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
      endereco, responsavel, diagnostico_principal, diagnosticos_secundarios,
      medicacoes, alergias, tipo_terapia, frequencia_recomendada,
      preferencias, gatilhos, estrategias_eficazes, observacoes, escola, status
    } = req.body;

    // Verificar se paciente existe
    const { rows: existingPaciente } = await pool.query(
      'SELECT id FROM pacientes WHERE id = $1',
      [id]
    );

    if (existingPaciente.length === 0) {
      return res.status(404).json({
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Verificar se CPF já existe em outro paciente
    if (cpf) {
      const { rows: cpfExists } = await pool.query(
        'SELECT id FROM pacientes WHERE cpf = $1 AND id != $2',
        [cpf, id]
      );

      if (cpfExists.length > 0) {
        return res.status(400).json({
          error: 'Já existe outro paciente cadastrado com este CPF',
          code: 'CPF_ALREADY_EXISTS'
        });
      }
    }

    // Atualizar paciente
    const { rows } = await pool.query(`
      UPDATE pacientes SET
        nome = COALESCE($2, nome),
        cpf = COALESCE($3, cpf),
        data_nascimento = COALESCE($4, data_nascimento),
        sexo = COALESCE($5, sexo),
        telefone = COALESCE($6, telefone),
        email_responsavel = COALESCE($7, email_responsavel),
        endereco = COALESCE($8, endereco),
        responsavel = COALESCE($9, responsavel),
        diagnostico_principal = COALESCE($10, diagnostico_principal),
        diagnosticos_secundarios = COALESCE($11, diagnosticos_secundarios),
        medicacoes = COALESCE($12, medicacoes),
        alergias = COALESCE($13, alergias),
        tipo_terapia = COALESCE($14, tipo_terapia),
        frequencia_recomendada = COALESCE($15, frequencia_recomendada),
        preferencias = COALESCE($16, preferencias),
        gatilhos = COALESCE($17, gatilhos),
        estrategias_eficazes = COALESCE($18, estrategias_eficazes),
        observacoes = COALESCE($19, observacoes),
        escola = COALESCE($20, escola),
        status = COALESCE($21, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, nome, cpf, data_nascimento, sexo, telefone, email_responsavel,
      endereco ? JSON.stringify(endereco) : null,
      responsavel ? JSON.stringify(responsavel) : null,
      diagnostico_principal, diagnosticos_secundarios, medicacoes, alergias,
      tipo_terapia, frequencia_recomendada, preferencias, gatilhos,
      estrategias_eficazes, observacoes, escola, status
    ]);

    res.json({
      message: 'Paciente atualizado com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Desativar paciente (soft delete)
const deactivatePaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`
      UPDATE pacientes 
      SET status = 'inativo', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nome, status
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Paciente desativado com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar paciente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar pacientes com filtros
const searchPacientes = async (req, res) => {
  try {
    const { nome, cpf, tipo_terapia, status = 'ativo' } = req.query;
    
    let query = 'SELECT * FROM pacientes WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (nome) {
      query += ` AND nome ILIKE $${paramIndex}`;
      params.push(`%${nome}%`);
      paramIndex++;
    }

    if (cpf) {
      query += ` AND cpf = $${paramIndex}`;
      params.push(cpf);
      paramIndex++;
    }

    if (tipo_terapia) {
      query += ` AND tipo_terapia = $${paramIndex}`;
      params.push(tipo_terapia);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY nome ASC';

    const { rows } = await pool.query(query, params);

    res.json({
      message: 'Busca realizada com sucesso',
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Erro na busca de pacientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  getAllPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deactivatePaciente,
  searchPacientes
};