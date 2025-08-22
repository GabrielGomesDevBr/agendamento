const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Gerar token JWT
const generateToken = (user, role) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar em supervisores
    let { rows: supervisores } = await pool.query(
      'SELECT id, nome, email, senha_hash, avatar, status FROM supervisores WHERE email = $1',
      [email]
    );

    let user = null;
    let role = null;

    if (supervisores.length > 0) {
      user = supervisores[0];
      role = 'supervisor';
    } else {
      // Buscar em terapeutas
      let { rows: terapeutas } = await pool.query(
        'SELECT id, nome, email, senha_hash, avatar, status FROM terapeutas WHERE email = $1',
        [email]
      );

      if (terapeutas.length > 0) {
        user = terapeutas[0];
        role = 'terapeuta';
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (user.status !== 'ativo') {
      return res.status(401).json({
        error: 'Usuário inativo',
        code: 'USER_INACTIVE'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Gerar token
    const token = generateToken(user, role);

    // Resposta de sucesso
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        avatar: user.avatar,
        role: role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    // Se chegou até aqui, o token é válido (middleware auth já verificou)
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Obter perfil do usuário logado
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Buscar dados completos do usuário
    const table = userRole === 'supervisor' ? 'supervisores' : 'terapeutas';
    let query = `SELECT id, nome, email, telefone, avatar, status, created_at, updated_at FROM ${table} WHERE id = $1`;
    
    // Para terapeutas, incluir campos específicos
    if (userRole === 'terapeuta') {
      query = `SELECT id, nome, email, telefone, crf, especialidades, avatar, horario_trabalho, status, created_at, updated_at FROM ${table} WHERE id = $1`;
    }

    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = rows[0];
    
    res.json({
      user: {
        ...user,
        role: userRole,
        senha_hash: undefined // Nunca retornar hash da senha
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Trocar senha (funcionalidade futura)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Buscar usuário atual
    const table = userRole === 'supervisor' ? 'supervisores' : 'terapeutas';
    const { rows } = await pool.query(
      `SELECT senha_hash FROM ${table} WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(currentPassword, rows[0].senha_hash);
    if (!senhaValida) {
      return res.status(400).json({
        error: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(newPassword, 10);

    // Atualizar no banco
    await pool.query(
      `UPDATE ${table} SET senha_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [novaSenhaHash, userId]
    );

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  login,
  verifyToken,
  changePassword,
  getProfile
};