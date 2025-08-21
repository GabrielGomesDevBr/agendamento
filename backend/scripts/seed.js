const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Função para ler arquivos JSON
function readJsonFile(filename) {
  const filePath = path.join(__dirname, '../../data', filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await pool.query('TRUNCATE TABLE agendamentos, disponibilidades, pacientes, terapeutas, supervisores, tipos_terapia RESTART IDENTITY CASCADE');
    console.log('🧹 Dados existentes removidos');

    // 1. Seed dos tipos de terapia
    const tiposTerapia = readJsonFile('tipos_terapia.json');
    if (tiposTerapia.length > 0) {
      for (const tipo of tiposTerapia) {
        await pool.query(
          'INSERT INTO tipos_terapia (nome, descricao, duracao_sessao, valor_sessao) VALUES ($1, $2, $3, $4)',
          [tipo.nome, tipo.descricao, tipo.duracao_sessao || 60, tipo.valor_sessao || 150.00]
        );
      }
      console.log(`✅ ${tiposTerapia.length} tipos de terapia inseridos`);
    }

    // 2. Seed dos supervisores
    const supervisores = readJsonFile('supervisores.json');
    const defaultPassword = process.env.DEFAULT_SEED_PASSWORD || 'TempPassword123!'; // Senha temporária mais segura
    
    if (supervisores.length > 0) {
      for (const supervisor of supervisores) {
        const senhaHash = await bcrypt.hash(defaultPassword, 12); // Salt mais forte
        await pool.query(
          'INSERT INTO supervisores (nome, email, senha_hash, telefone, avatar, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            supervisor.nome,
            supervisor.email || `${supervisor.nome.toLowerCase().replace(/\\s+/g, '.')}@cliniagende.com`,
            senhaHash,
            supervisor.telefone || '(11) 99999-9999',
            supervisor.avatar,
            'ativo'
          ]
        );
      }
      console.log(`✅ ${supervisores.length} supervisores inseridos`);
      console.log(`⚠️  AVISO: Altere as senhas padrão após o primeiro login!`);
    }

    // 3. Seed dos terapeutas
    const terapeutas = readJsonFile('terapeutas.json');
    if (terapeutas.length > 0) {
      for (const terapeuta of terapeutas) {
        const senhaHash = await bcrypt.hash(defaultPassword, 12); // Salt mais forte
        await pool.query(
          'INSERT INTO terapeutas (nome, email, senha_hash, telefone, crf, especialidades, avatar, horario_trabalho, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [
            terapeuta.nome,
            terapeuta.email || `${terapeuta.nome.toLowerCase().replace(/\\s+/g, '.')}@cliniagende.com`,
            senhaHash,
            terapeuta.telefone || '(11) 99999-9999',
            terapeuta.crf,
            terapeuta.especialidades,
            terapeuta.avatar,
            JSON.stringify(terapeuta.horario_trabalho),
            terapeuta.status
          ]
        );
      }
      console.log(`✅ ${terapeutas.length} terapeutas inseridos`);
    }

    // 4. Seed dos pacientes
    const pacientes = readJsonFile('pacientes.json');
    if (pacientes.length > 0) {
      for (const paciente of pacientes) {
        const senhaHash = await bcrypt.hash(defaultPassword, 12);
        await pool.query(
          `INSERT INTO pacientes (
            nome, data_nascimento, genero, cpf, rg, endereco, cidade, estado, cep,
            telefone, email, senha_hash, nome_responsavel, contato_responsavel,
            plano_saude, numero_carteirinha, historico_medico, status,
            terapeuta_responsavel_id, supervisor_responsavel_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
          [
            paciente.nome,
            paciente.data_nascimento,
            paciente.genero || paciente.sexo,
            paciente.cpf,
            paciente.rg,
            paciente.endereco,
            paciente.cidade,
            paciente.estado,
            paciente.cep,
            paciente.telefone,
            paciente.email || `${paciente.nome.toLowerCase().replace(/\\s+/g, '.')}@paciente.com`,
            senhaHash,
            paciente.nome_responsavel || paciente.responsavel?.nome,
            paciente.contato_responsavel || paciente.responsavel?.telefone,
            paciente.plano_saude,
            paciente.numero_carteirinha,
            paciente.historico_medico,
            paciente.status || 'ativo',
            paciente.terapeuta_responsavel_id || null,
            paciente.supervisor_responsavel_id || null
          ]
        );
      }
      console.log(`✅ ${pacientes.length} pacientes inseridos`);
    }

    // 5. Gerar disponibilidades simuladas
    const { rows: terapeutasDb } = await pool.query('SELECT id, horario_trabalho FROM terapeutas WHERE status = $1', ['ativo']);
    
    const disponibilidades = [];
    const hoje = new Date();
    
    for (const terapeuta of terapeutasDb) {
      const horarioTrabalho = terapeuta.horario_trabalho;
      
      // Gerar para as próximas 4 semanas
      for (let semana = 0; semana < 4; semana++) {
        for (let dia = 1; dia <= 5; dia++) { // Segunda a sexta
          const data = new Date(hoje);
          data.setDate(data.getDate() + (semana * 7) + dia);
          
          const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
          const diaTrabalho = diasSemana[data.getDay()];
          
          if (horarioTrabalho && horarioTrabalho[diaTrabalho]) {
            const [inicioHora] = horarioTrabalho[diaTrabalho][0].split(':').map(Number);
            const [fimHora] = horarioTrabalho[diaTrabalho][1].split(':').map(Number);
            
            for (let hora = inicioHora; hora < fimHora; hora++) {
              if (Math.random() > 0.3) { // 70% de chance de disponibilidade
                const dataHora = new Date(data);
                dataHora.setHours(hora, 0, 0, 0);
                
                await pool.query(
                  'INSERT INTO disponibilidades (terapeuta_id, data_hora, duracao, status) VALUES ($1, $2, $3, $4)',
                  [terapeuta.id, dataHora, 60, 'disponivel']
                );
                disponibilidades.push(dataHora);
              }
            }
          }
        }
      }
    }
    
    console.log(`✅ ${disponibilidades.length} disponibilidades geradas`);

    // 6. Gerar alguns agendamentos simulados
    const { rows: pacientesDb } = await pool.query('SELECT id FROM pacientes LIMIT 3');
    const { rows: disponibilidadesDb } = await pool.query('SELECT id, terapeuta_id, data_hora FROM disponibilidades ORDER BY RANDOM() LIMIT 5');
    
    let agendamentosCriados = 0;
    for (let i = 0; i < Math.min(pacientesDb.length, disponibilidadesDb.length); i++) {
      const paciente = pacientesDb[i];
      const disponibilidade = disponibilidadesDb[i];
      
      await pool.query(
        'INSERT INTO agendamentos (paciente_id, terapeuta_id, data_hora, tipo_terapia, local, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [paciente.id, disponibilidade.terapeuta_id, disponibilidade.data_hora, 'ABA', 'Clínica', 'agendado']
      );
      
      // Remover disponibilidade
      await pool.query('DELETE FROM disponibilidades WHERE id = $1', [disponibilidade.id]);
      agendamentosCriados++;
    }
    
    console.log(`✅ ${agendamentosCriados} agendamentos simulados criados`);
    
    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('⚠️  IMPORTANTE - SEGURANÇA:');
    console.log(`📝 Senha temporária para TODOS os usuários: ${defaultPassword}`);
    console.log('🔐 ALTERE IMEDIATAMENTE as senhas após o primeiro login!');
    console.log('🚫 NÃO use essas credenciais em produção!');
    console.log('');
    
    const { rows: allSupervisores } = await pool.query('SELECT nome, email FROM supervisores');
    const { rows: allTerapeutas } = await pool.query('SELECT nome, email FROM terapeutas');
    
    console.log('👥 Supervisores:');
    allSupervisores.forEach(s => console.log(`   ${s.nome} - ${s.email}`));
    
    console.log('👩‍⚕️ Terapeutas:');
    allTerapeutas.forEach(t => console.log(`   ${t.nome} - ${t.email}`));
    
    console.log('');
    console.log('🔒 Para máxima segurança:');
    console.log('1. Configure DEFAULT_SEED_PASSWORD no .env');
    console.log('2. Use senhas únicas para cada usuário');
    console.log('3. Implemente troca obrigatória de senha no primeiro login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };