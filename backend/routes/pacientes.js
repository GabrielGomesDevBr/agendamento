const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/pacientes
router.get('/', pacientesController.getAllPacientes);

// GET /api/pacientes/search
router.get('/search', pacientesController.searchPacientes);

// GET /api/pacientes/:id
router.get('/:id', pacientesController.getPacienteById);

// POST /api/pacientes (apenas supervisores)
router.post('/', requireSupervisor, validate(schemas.paciente), pacientesController.createPaciente);

// PUT /api/pacientes/:id (apenas supervisores)
router.put('/:id', requireSupervisor, validate(schemas.paciente), pacientesController.updatePaciente);

// DELETE /api/pacientes/:id (apenas supervisores - soft delete)
router.delete('/:id', requireSupervisor, pacientesController.deactivatePaciente);

module.exports = router;