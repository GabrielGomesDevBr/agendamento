const Joi = require('joi');

// Middleware para validar dados de entrada
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errorMessages
      });
    }
    
    next();
  };
};

// Schemas de validação
const schemas = {
  // Login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  // Paciente
  paciente: Joi.object({
    nome: Joi.string().min(3).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    cpf: Joi.string().pattern(/^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$/).required().messages({
      'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
      'any.required': 'CPF é obrigatório'
    }),
    data_nascimento: Joi.date().max('now').required().messages({
      'date.max': 'Data de nascimento não pode ser futura',
      'any.required': 'Data de nascimento é obrigatória'
    }),
    sexo: Joi.string().valid('Masculino', 'Feminino').required().messages({
      'any.only': 'Sexo deve ser Masculino ou Feminino',
      'any.required': 'Sexo é obrigatório'
    }),
    telefone: Joi.string().pattern(/^\\(\\d{2}\\) \\d{4,5}-\\d{4}$/).required().messages({
      'string.pattern.base': 'Telefone deve estar no formato (00) 00000-0000',
      'any.required': 'Telefone é obrigatório'
    }),
    email_responsavel: Joi.string().email().required().messages({
      'string.email': 'Email do responsável deve ter um formato válido',
      'any.required': 'Email do responsável é obrigatório'
    }),
    endereco: Joi.object({
      rua: Joi.string().required(),
      bairro: Joi.string().required(),
      cidade: Joi.string().required(),
      cep: Joi.string().pattern(/^\\d{5}-\\d{3}$/).required()
    }).required(),
    responsavel: Joi.object({
      nome: Joi.string().min(3).required(),
      cpf: Joi.string().pattern(/^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$/).required(),
      parentesco: Joi.string().required()
    }).required(),
    diagnostico_principal: Joi.string().min(3).required().messages({
      'string.min': 'Diagnóstico principal deve ter pelo menos 3 caracteres',
      'any.required': 'Diagnóstico principal é obrigatório'
    }),
    tipo_terapia: Joi.string().required().messages({
      'any.required': 'Tipo de terapia é obrigatório'
    }),
    frequencia_recomendada: Joi.string().required().messages({
      'any.required': 'Frequência recomendada é obrigatória'
    }),
    escola: Joi.string().allow('').optional(),
    medicacoes: Joi.array().items(Joi.string()).optional(),
    alergias: Joi.array().items(Joi.string()).optional(),
    preferencias: Joi.array().items(Joi.string()).optional(),
    gatilhos: Joi.array().items(Joi.string()).optional(),
    observacoes: Joi.string().allow('').optional()
  }),

  // Agendamento
  agendamento: Joi.object({
    paciente_id: Joi.number().integer().positive().required(),
    terapeuta_id: Joi.number().integer().positive().required(),
    data_hora: Joi.date().min('now').required().messages({
      'date.min': 'Data/hora do agendamento deve ser futura'
    }),
    tipo_terapia: Joi.string().required(),
    local: Joi.string().required(),
    observacoes: Joi.string().allow('').optional()
  }),

  // Disponibilidade
  disponibilidade: Joi.object({
    terapeuta_id: Joi.number().integer().positive().required(),
    data_hora: Joi.date().min('now').required().messages({
      'date.min': 'Data/hora da disponibilidade deve ser futura'
    }),
    duracao: Joi.number().integer().min(30).max(180).default(60)
  }),

  // Atualização de status
  statusUpdate: Joi.object({
    status: Joi.string().valid('agendado', 'realizado', 'cancelado', 'faltou').required()
  })
};

module.exports = {
  validate,
  schemas
};