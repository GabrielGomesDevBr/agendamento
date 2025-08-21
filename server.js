const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: 'Muitas tentativas, tente novamente em 15 minutos',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware para servir arquivos estáticos (frontend)
app.use(express.static('.', {
  index: 'index.html',
  dotfiles: 'ignore'
}));

// Importar rotas
const authRoutes = require('./backend/routes/auth');
const pacientesRoutes = require('./backend/routes/pacientes');
const agendamentosRoutes = require('./backend/routes/agendamentos');
const disponibilidadesRoutes = require('./backend/routes/disponibilidades');

// Usar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/disponibilidades', disponibilidadesRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CliniAgende API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware para capturar rotas não encontradas da API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Middleware para servir o frontend em qualquer rota não-API
app.get('*', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'index.html'));
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    const pool = require('./backend/config/database');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    app.listen(PORT, () => {
      console.log('🚀 Servidor CliniAgende iniciado');
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend disponível em: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento graceful de shutdown
process.on('SIGTERM', () => {
  console.log('👋 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

startServer();