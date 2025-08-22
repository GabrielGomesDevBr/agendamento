const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');

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

// POST /terapeutas - Criar novo terapeuta (apenas supervisores)
router.post('/', authenticateToken, async (req, res, next) => {
    try {
        // Verificar se é supervisor
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({
                error: 'Apenas supervisores podem cadastrar terapeutas',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const {
            nome, email, telefone, crf, senha_hash,
            especialidades, horario_trabalho, avatar, status = 'ativo'
        } = req.body;

        // Verificar se email já existe
        const existingUser = await pool.query(
            'SELECT id FROM terapeutas WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'Email já cadastrado',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        // Criptografar senha
        const hashedPassword = await bcrypt.hash(senha_hash, 12);

        // Inserir terapeuta
        const result = await pool.query(`
            INSERT INTO terapeutas (
                nome, email, senha_hash, telefone, crf, 
                especialidades, avatar, horario_trabalho, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nome, email, telefone, crf, especialidades, avatar, status, created_at
        `, [
            nome, email, hashedPassword, telefone, crf,
            especialidades, avatar, JSON.stringify(horario_trabalho), status
        ]);

        res.status(201).json({
            message: 'Terapeuta cadastrado com sucesso',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao cadastrar terapeuta:', error);
        next(error);
    }
});

// PUT /terapeutas/:id - Atualizar terapeuta (apenas supervisores)
router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        // Verificar se é supervisor
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({
                error: 'Apenas supervisores podem editar terapeutas',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const { id } = req.params;
        const {
            nome, email, telefone, crf, senha_hash,
            especialidades, horario_trabalho
        } = req.body;

        // Verificar se terapeuta existe
        const existingTherapist = await pool.query(
            'SELECT id, email FROM terapeutas WHERE id = $1',
            [id]
        );

        if (existingTherapist.rows.length === 0) {
            return res.status(404).json({
                error: 'Terapeuta não encontrado',
                code: 'THERAPIST_NOT_FOUND'
            });
        }

        // Verificar se email já existe (para outro terapeuta)
        if (email !== existingTherapist.rows[0].email) {
            const emailCheck = await pool.query(
                'SELECT id FROM terapeutas WHERE email = $1 AND id != $2',
                [email, id]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    error: 'Email já está sendo usado por outro terapeuta',
                    code: 'EMAIL_ALREADY_EXISTS'
                });
            }
        }

        // Preparar query de atualização
        let updateQuery = `
            UPDATE terapeutas SET 
                nome = $1, email = $2, telefone = $3, crf = $4,
                especialidades = $5, horario_trabalho = $6, updated_at = CURRENT_TIMESTAMP
        `;
        let queryParams = [
            nome, email, telefone, crf,
            especialidades, JSON.stringify(horario_trabalho)
        ];

        // Adicionar senha se fornecida
        if (senha_hash && senha_hash.length >= 6) {
            const hashedPassword = await bcrypt.hash(senha_hash, 12);
            updateQuery += `, senha_hash = $${queryParams.length + 1}`;
            queryParams.push(hashedPassword);
        }

        updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, nome, email, telefone, crf, especialidades, avatar, status, updated_at`;
        queryParams.push(id);

        // Executar atualização
        const result = await pool.query(updateQuery, queryParams);

        res.json({
            message: 'Terapeuta atualizado com sucesso',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar terapeuta:', error);
        next(error);
    }
});

module.exports = router;
