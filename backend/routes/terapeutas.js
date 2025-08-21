const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota para buscar todos os terapeutas
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nome, email, especialidades, crf, avatar FROM terapeutas');
        res.json({ data: result.rows });
    } catch (error) {
        next(error);
    }
});

// Rota para buscar um terapeuta por ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, nome, email, especialidades, crf, avatar FROM terapeutas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Terapeuta não encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
