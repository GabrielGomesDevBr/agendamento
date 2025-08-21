const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota para buscar todos os supervisores
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nome, email, avatar FROM supervisores');
        res.json({ data: result.rows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
