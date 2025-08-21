const express = require('express');
const router = express.Router();
const disponibilidadesController = require('../controllers/disponibilidadesController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/disponibilidades
router.get('/', disponibilidadesController.getAllDisponibilidades);

// POST /api/disponibilidades
router.post('/', validate(schemas.disponibilidade), disponibilidadesController.createDisponibilidade);

// DELETE /api/disponibilidades/:id
router.delete('/:id', disponibilidadesController.deleteDisponibilidade);

module.exports = router;