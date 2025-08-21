const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário ainda existe no banco
    let user;
    if (decoded.role === 'supervisor') {
      const { rows } = await pool.query(
        'SELECT id, nome, email, status FROM supervisores WHERE id = $1 AND status = $2',
        [decoded.id, 'ativo']
      );
      user = rows[0];
    } else if (decoded.role === 'terapeuta') {
      const { rows } = await pool.query(
        'SELECT id, nome, email, status FROM terapeutas WHERE id = $1 AND status = $2',
        [decoded.id, 'ativo']
      );
      user = rows[0];
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware para verificar se é supervisor
const requireSupervisor = (req, res, next) => {
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ 
      error: 'Acesso restrito a supervisores',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

// Middleware para verificar se é terapeuta
const requireTerapeuta = (req, res, next) => {
  if (req.user.role !== 'terapeuta') {
    return res.status(403).json({ 
      error: 'Acesso restrito a terapeutas',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

// Middleware para verificar se é supervisor ou terapeuta específico
const requireSupervisorOrOwnTerapeuta = (req, res, next) => {
  const terapeutaId = parseInt(req.params.terapeutaId || req.body.terapeutaId);
  
  if (req.user.role === 'supervisor' || 
      (req.user.role === 'terapeuta' && req.user.id === terapeutaId)) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Acesso não autorizado',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
};

module.exports = {
  authenticateToken,
  requireSupervisor,
  requireTerapeuta,
  requireSupervisorOrOwnTerapeuta
};