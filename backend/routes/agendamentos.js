const express = require('express');
const router = express.Router();
const agendamentosController = require('../controllers/agendamentosController');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/agendamentos
router.get('/', agendamentosController.getAllAgendamentos);

// GET /api/agendamentos/estatisticas
router.get('/estatisticas', agendamentosController.getEstatisticas);

// GET /api/agendamentos/:id
router.get('/:id', agendamentosController.getAgendamentoById);

// POST /api/agendamentos (apenas supervisores)
router.post('/', requireSupervisor, validate(schemas.agendamento), agendamentosController.createAgendamento);

// PATCH /api/agendamentos/:id/status
router.patch('/:id/status', validate(schemas.statusUpdate), agendamentosController.updateAgendamentoStatus);

module.exports = router;