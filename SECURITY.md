# Política de Segurança - CliniAgende

## 🚨 Reportar Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. **Envie um email** para: security@cliniagende.com (ou crie uma issue privada)
3. **Inclua** detalhes da vulnerabilidade e passos para reprodução
4. **Aguarde** resposta em até 48 horas

## 🔒 Práticas de Segurança Implementadas

### Autenticação e Autorização
- ✅ **JWT Tokens** com expiração configurável
- ✅ **Senhas hasheadas** com bcryptjs (salt 12)
- ✅ **Middleware de autenticação** em todas as rotas protegidas
- ✅ **Controle de acesso** baseado em roles (supervisor/terapeuta)

### Proteção Contra Ataques
- ✅ **SQL Injection**: Queries parametrizadas com prepared statements
- ✅ **XSS**: Sanitização automática de entrada
- ✅ **CSRF**: Headers de segurança configurados
- ✅ **Rate Limiting**: 100 requests por 15 minutos por IP
- ✅ **Headers de Segurança**: Helmet.js configurado

### Validação de Dados
- ✅ **Joi Schemas**: Validação rigorosa de entrada
- ✅ **Tipos de dados**: Verificação de tipos PostgreSQL
- ✅ **Tamanho de payload**: Limitação de 10MB
- ✅ **Formato de CPF/Email**: Regex e algoritmos específicos

### Configuração Segura
- ✅ **Variáveis de ambiente**: Dados sensíveis protegidos
- ✅ **CORS**: Configurado apenas para domínios autorizados
- ✅ **HTTPS**: Recomendado para produção
- ✅ **Logs de auditoria**: Registros de ações críticas

## ⚠️ Vulnerabilidades Conhecidas e Mitigações

### Ambiente de Desenvolvimento
- **Issue**: Senhas padrão fracas em seeds
- **Mitigação**: Senhas temporárias com aviso de alteração obrigatória
- **Status**: ✅ Documentado e alertado

### Configuração Inicial
- **Issue**: JWT_SECRET fraco em .env.example
- **Mitigação**: Instruções para gerar chave robusta
- **Status**: ✅ Documentado no README

## 🛡️ Checklist de Segurança para Produção

### Obrigatório Antes do Deploy:
- [ ] Alterar TODAS as senhas padrão
- [ ] Gerar JWT_SECRET robusta (64+ caracteres aleatórios)
- [ ] Configurar HTTPS/SSL obrigatório
- [ ] Definir NODE_ENV=production
- [ ] Configurar CORS apenas para domínios reais
- [ ] Remover logs de debug em produção
- [ ] Configurar backup automático do banco
- [ ] Implementar monitoramento de tentativas de acesso
- [ ] Configurar rate limiting mais restritivo se necessário
- [ ] Auditar todas as dependências (npm audit)

### Recomendado:
- [ ] Implementar 2FA para administradores
- [ ] Logs centralizados (ELK Stack ou similar)
- [ ] Monitoramento de performance e ataques
- [ ] Testes de penetração periódicos
- [ ] Rotação automática de chaves JWT
- [ ] Backup criptografado do banco de dados

## 🔧 Comandos de Segurança

### Gerar JWT Secret Segura:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# Linux/Mac
head -c 64 /dev/urandom | base64
```

### Auditoria de Dependências:
```bash
npm audit
npm audit fix
```

### Verificar Configurações:
```bash
# Verificar se .env não está sendo commitado
git ls-files | grep -E "\.env$" && echo "⚠️ ERRO: .env está sendo commitado!"

# Verificar força da senha JWT
node -e "console.log(process.env.JWT_SECRET.length >= 64 ? '✅ JWT forte' : '⚠️ JWT fraca')"
```

## 📋 Logs de Auditoria

### Eventos Monitorados:
- ✅ Tentativas de login (sucesso/falha)
- ✅ Criação/modificação de usuários
- ✅ Acesso a dados sensíveis de pacientes
- ✅ Alterações de permissões
- ✅ Falhas de autenticação repetidas

### Estrutura de Log:
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "info|warn|error",
  "event": "login_attempt|data_access|permission_change",
  "user_id": "123",
  "ip_address": "192.168.1.100",
  "user_agent": "...",
  "details": {
    "success": true,
    "resource": "patient_data",
    "action": "read|write|delete"
  }
}
```

## 🔍 Monitoramento de Ameaças

### Alertas Automáticos:
- 🚨 Mais de 5 tentativas de login falhadas em 10 minutos
- 🚨 Acesso a dados de pacientes fora do horário comercial
- 🚨 Tentativas de SQL injection detectadas
- 🚨 Múltiplos acessos simultâneos da mesma conta
- 🚨 Mudanças de configuração críticas

### Métricas de Segurança:
- Taxa de tentativas de login falhadas
- Número de tokens expirados/inválidos por hora
- Frequência de acessos por IP/usuário
- Tempo médio de sessão por tipo de usuário

## 📞 Contato de Segurança

Para questões relacionadas à segurança:
- **Email**: security@cliniagende.com
- **Resposta**: Até 48 horas úteis
- **Urgente**: Inclua "CRITICAL" no assunto

---

**Última atualização**: Agosto 2025 
**Versão**: 2.0  
**Responsável**: Equipe de Desenvolvimento CliniAgende