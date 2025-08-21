const pool = require('../config/database');

// Listar disponibilidades
const getAllDisponibilidades = async (req, res) => {
  try {
    const { terapeuta_id, data_inicio, data_fim } = req.query;

    let query = `
      SELECT 
        d.id, d.terapeuta_id, d.data_hora, d.duracao, d.status, d.created_at,
        t.nome as terapeuta_nome
      FROM disponibilidades d
      JOIN terapeutas t ON d.terapeuta_id = t.id
      WHERE d.status = 'disponivel'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (terapeuta_id) {
      query += ` AND d.terapeuta_id = $${paramIndex}`;
      params.push(terapeuta_id);
      paramIndex++;
    }

    if (data_inicio && data_fim) {
      query += ` AND d.data_hora BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(data_inicio, data_fim);
      paramIndex += 2;
    }

    // Se for terapeuta, só mostrar suas próprias disponibilidades
    if (req.user.role === 'terapeuta') {
      query += ` AND d.terapeuta_id = $${paramIndex}`;
      params.push(req.user.id);
    }

    query += ' ORDER BY d.data_hora ASC';

    const { rows } = await pool.query(query, params);

    res.json({
      message: 'Disponibilidades listadas com sucesso',
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Erro ao listar disponibilidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar nova disponibilidade
const createDisponibilidade = async (req, res) => {
  try {
    const { terapeuta_id, data_hora, duracao = 60 } = req.body;

    // Se for terapeuta, só pode criar para si mesmo
    if (req.user.role === 'terapeuta' && terapeuta_id !== req.user.id) {
      return res.status(403).json({
        error: 'Você só pode criar disponibilidades para si mesmo',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Verificar se terapeuta existe
    const { rows: terapeuta } = await pool.query(
      'SELECT id FROM terapeutas WHERE id = $1 AND status = $2',
      [terapeuta_id, 'ativo']
    );

    if (terapeuta.length === 0) {
      return res.status(404).json({
        error: 'Terapeuta não encontrado ou inativo',
        code: 'THERAPIST_NOT_FOUND'
      });
    }

    // Verificar se já existe disponibilidade ou agendamento no mesmo horário
    const { rows: conflitos } = await pool.query(`
      SELECT 'disponibilidade' as tipo FROM disponibilidades 
      WHERE terapeuta_id = $1 AND data_hora = $2
      UNION
      SELECT 'agendamento' as tipo FROM agendamentos 
      WHERE terapeuta_id = $1 AND data_hora = $2 AND status != 'cancelado'
    `, [terapeuta_id, data_hora]);

    if (conflitos.length > 0) {
      return res.status(400).json({
        error: 'Já existe uma disponibilidade ou agendamento para este horário',
        code: 'TIME_CONFLICT'
      });
    }

    // Criar disponibilidade
    const { rows } = await pool.query(`
      INSERT INTO disponibilidades (terapeuta_id, data_hora, duracao, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [terapeuta_id, data_hora, duracao, 'disponivel']);

    res.status(201).json({
      message: 'Disponibilidade criada com sucesso',
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Remover disponibilidade
const deleteDisponibilidade = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se disponibilidade existe
    const { rows: disponibilidade } = await pool.query(
      'SELECT id, terapeuta_id FROM disponibilidades WHERE id = $1',
      [id]
    );

    if (disponibilidade.length === 0) {
      return res.status(404).json({
        error: 'Disponibilidade não encontrada',
        code: 'AVAILABILITY_NOT_FOUND'
      });
    }

    // Verificar permissões
    if (req.user.role === 'terapeuta' && disponibilidade[0].terapeuta_id !== req.user.id) {
      return res.status(403).json({
        error: 'Você só pode remover suas próprias disponibilidades',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Remover disponibilidade
    await pool.query('DELETE FROM disponibilidades WHERE id = $1', [id]);

    res.json({
      message: 'Disponibilidade removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover disponibilidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  getAllDisponibilidades,
  createDisponibilidade,
  deleteDisponibilidade
};