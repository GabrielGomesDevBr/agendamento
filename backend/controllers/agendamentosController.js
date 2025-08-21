const pool = require('../config/database');

// Listar agendamentos com filtros
const getAllAgendamentos = async (req, res) => {
  try {
    const { 
      terapeuta_id, 
      paciente_id, 
      status, 
      data_inicio, 
      data_fim 
    } = req.query;

    let query = `
      SELECT 
        a.id, a.paciente_id, a.terapeuta_id, a.data_hora, a.duracao,
        a.tipo_terapia, a.local, a.observacoes, a.status, a.created_at, a.updated_at,
        p.nome as paciente_nome,
        t.nome as terapeuta_nome
      FROM agendamentos a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN terapeutas t ON a.terapeuta_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (terapeuta_id) {
      query += ` AND a.terapeuta_id = $${paramIndex}`;
      params.push(terapeuta_id);
      paramIndex++;
    }

    if (paciente_id) {
      query += ` AND a.paciente_id = $${paramIndex}`;
      params.push(paciente_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (data_inicio && data_fim) {
      query += ` AND a.data_hora BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(data_inicio, data_fim);
      paramIndex += 2;
    }

    // Se for terapeuta, só mostrar seus próprios agendamentos
    if (req.user.role === 'terapeuta') {
      query += ` AND a.terapeuta_id = $${paramIndex}`;
      params.push(req.user.id);
    }

    query += ' ORDER BY a.data_hora ASC';

    const { rows } = await pool.query(query, params);

    res.json({
      message: 'Agendamentos listados com sucesso',
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar agendamento por ID
const getAgendamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(`
      SELECT 
        a.id, a.paciente_id, a.terapeuta_id, a.data_hora, a.duracao,
        a.tipo_terapia, a.local, a.observacoes, a.status, a.created_at, a.updated_at,
        p.nome as paciente_nome, p.telefone as paciente_telefone,
        p.diagnostico_principal, p.preferencias, p.gatilhos,
        t.nome as terapeuta_nome, t.telefone as terapeuta_telefone
      FROM agendamentos a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN terapeutas t ON a.terapeuta_id = t.id
      WHERE a.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Agendamento não encontrado',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Verificar permissões
    const agendamento = rows[0];
    if (req.user.role === 'terapeuta' && agendamento.terapeuta_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso não autorizado',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    res.json({
      message: 'Agendamento encontrado',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar novo agendamento
const createAgendamento = async (req, res) => {
  try {
    const {
      paciente_id,
      terapeuta_id,
      data_hora,
      duracao = 60,
      tipo_terapia,
      local,
      observacoes
    } = req.body;

    // Verificar se paciente existe
    const { rows: paciente } = await pool.query(
      'SELECT id, nome FROM pacientes WHERE id = $1 AND status = $2',
      [paciente_id, 'ativo']
    );

    if (paciente.length === 0) {
      return res.status(404).json({
        error: 'Paciente não encontrado ou inativo',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Verificar se terapeuta existe
    const { rows: terapeuta } = await pool.query(
      'SELECT id, nome FROM terapeutas WHERE id = $1 AND status = $2',
      [terapeuta_id, 'ativo']
    );

    if (terapeuta.length === 0) {
      return res.status(404).json({
        error: 'Terapeuta não encontrado ou inativo',
        code: 'THERAPIST_NOT_FOUND'
      });
    }

    // Verificar se existe disponibilidade
    const { rows: disponibilidade } = await pool.query(
      'SELECT id FROM disponibilidades WHERE terapeuta_id = $1 AND data_hora = $2 AND status = $3',
      [terapeuta_id, data_hora, 'disponivel']
    );

    if (disponibilidade.length === 0) {
      return res.status(400).json({
        error: 'Horário não disponível',
        code: 'TIME_NOT_AVAILABLE'
      });
    }

    // Verificar conflitos
    const { rows: conflitos } = await pool.query(
      'SELECT id FROM agendamentos WHERE terapeuta_id = $1 AND data_hora = $2 AND status != $3',
      [terapeuta_id, data_hora, 'cancelado']
    );

    if (conflitos.length > 0) {
      return res.status(400).json({
        error: 'Já existe um agendamento para este horário',
        code: 'TIME_CONFLICT'
      });
    }

    // Criar agendamento
    const { rows } = await pool.query(`
      INSERT INTO agendamentos (
        paciente_id, terapeuta_id, data_hora, duracao, tipo_terapia, local, observacoes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [paciente_id, terapeuta_id, data_hora, duracao, tipo_terapia, local, observacoes, 'agendado']);

    // Remover disponibilidade
    await pool.query(
      'DELETE FROM disponibilidades WHERE terapeuta_id = $1 AND data_hora = $2',
      [terapeuta_id, data_hora]
    );

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Atualizar status do agendamento
const updateAgendamentoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar se agendamento existe
    const { rows: agendamento } = await pool.query(
      'SELECT id, terapeuta_id, data_hora, status as current_status FROM agendamentos WHERE id = $1',
      [id]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({
        error: 'Agendamento não encontrado',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Verificar permissões
    if (req.user.role === 'terapeuta' && agendamento[0].terapeuta_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso não autorizado',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Atualizar status
    const { rows } = await pool.query(`
      UPDATE agendamentos 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    // Se cancelado, recriar disponibilidade
    if (status === 'cancelado' && agendamento[0].current_status !== 'cancelado') {
      await pool.query(`
        INSERT INTO disponibilidades (terapeuta_id, data_hora, duracao, status)
        VALUES ($1, $2, 60, 'disponivel')
        ON CONFLICT DO NOTHING
      `, [agendamento[0].terapeuta_id, agendamento[0].data_hora]);
    }

    res.json({
      message: 'Status do agendamento atualizado com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Estatísticas de agendamentos
const getEstatisticas = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Estatísticas gerais
    const queries = [
      pool.query('SELECT COUNT(*) as total FROM agendamentos WHERE status = $1', ['agendado']),
      pool.query('SELECT COUNT(*) as total FROM agendamentos WHERE status = $1 AND data_hora BETWEEN $2 AND $3', ['realizado', startOfMonth, endOfMonth]),
      pool.query('SELECT COUNT(*) as total FROM agendamentos WHERE status = $1', ['cancelado']),
      pool.query('SELECT COUNT(*) as total FROM disponibilidades WHERE status = $1', ['disponivel']),
      pool.query('SELECT COUNT(*) as total FROM pacientes WHERE status = $1', ['ativo']),
      pool.query('SELECT COUNT(*) as total FROM terapeutas WHERE status = $1', ['ativo'])
    ];

    const results = await Promise.all(queries);

    const estatisticas = {
      agendamentosAgendados: parseInt(results[0].rows[0].total),
      sessoesRealizadasMes: parseInt(results[1].rows[0].total),
      agendamentosCancelados: parseInt(results[2].rows[0].total),
      disponibilidadesLivres: parseInt(results[3].rows[0].total),
      totalPacientes: parseInt(results[4].rows[0].total),
      totalTerapeutas: parseInt(results[5].rows[0].total)
    };

    // Taxa de comparecimento
    const totalSessoes = estatisticas.sessoesRealizadasMes + estatisticas.agendamentosCancelados;
    estatisticas.taxaComparecimento = totalSessoes > 0 ? 
      Math.round((estatisticas.sessoesRealizadasMes / totalSessoes) * 100) : 0;

    res.json({
      message: 'Estatísticas geradas com sucesso',
      data: estatisticas
    });
  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  getAllAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamentoStatus,
  getEstatisticas
};