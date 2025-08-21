// Data management module for CliniAgende v4

class DataManager {
    constructor() {
        this.data = {
            terapeutas: [],
            supervisores: [],
            pacientes: [],
            tiposTerapia: [],
            disponibilidades: [],
            agendamentos: [],
            configuracoes: {}
        };
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            Utils.showLoading(true);
            await this.loadAllData();
            this.generateMockSchedules();
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar dados:', error);
            Utils.showToast('Erro ao carregar dados do sistema', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    async loadAllData() {
        const dataFiles = [
            { key: 'terapeutas', file: 'data/terapeutas.json' },
            { key: 'supervisores', file: 'data/supervisores.json' },
            { key: 'pacientes', file: 'data/pacientes.json' },
            { key: 'tiposTerapia', file: 'data/tipos_terapia.json' }
        ];

        for (const { key, file } of dataFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                this.data[key] = await response.json();
                console.log(`✓ Carregado ${key}:`, this.data[key].length, 'itens');
            } catch (error) {
                console.warn(`❌ Falha ao carregar ${file}:`, error);
                this.data[key] = [];
            }
        }
    }

    generateMockSchedules() {
        // Gerar disponibilidades simuladas para as próximas 4 semanas
        this.data.disponibilidades = this.generateAvailabilities();
        
        // Gerar agendamentos simulados
        this.data.agendamentos = this.generateAppointments();
    }

    generateAvailabilities() {
        const disponibilidades = [];
        const hoje = new Date();
        
        // Para cada terapeuta
        this.data.terapeutas.forEach(terapeuta => {
            // Para as próximas 4 semanas
            for (let semana = 0; semana < 4; semana++) {
                // Para cada dia da semana
                for (let dia = 1; dia <= 5; dia++) { // Segunda a sexta
                    const data = new Date(hoje);
                    data.setDate(data.getDate() + (semana * 7) + dia);
                    data.setHours(0, 0, 0, 0);

                    // Horários de trabalho do terapeuta
                    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                    const diaTrabalho = diasSemana[data.getDay()];
                    const horarioTrabalho = terapeuta.horario_trabalho[diaTrabalho];

                    if (horarioTrabalho) {
                        const [inicioHora, inicioMin] = horarioTrabalho[0].split(':').map(Number);
                        const [fimHora, fimMin] = horarioTrabalho[1].split(':').map(Number);
                        
                        // Gerar slots de 1 hora
                        for (let hora = inicioHora; hora < fimHora; hora++) {
                            // 70% de chance de ter disponibilidade
                            if (Math.random() > 0.3) {
                                const horario = new Date(data);
                                horario.setHours(hora, 0, 0, 0);
                                
                                disponibilidades.push({
                                    id: disponibilidades.length + 1,
                                    terapeutaId: terapeuta.id,
                                    datetime: horario.getTime(),
                                    duracao: 60,
                                    status: 'disponivel'
                                });
                            }
                        }
                    }
                }
            }
        });

        return disponibilidades;
    }

    generateAppointments() {
        const agendamentos = [];
        const disponibilidadesDisponiveis = [...this.data.disponibilidades];
        
        // Para cada paciente, criar alguns agendamentos
        this.data.pacientes.forEach(paciente => {
            const numAgendamentos = Math.floor(Math.random() * 3) + 1; // 1-3 agendamentos
            
            for (let i = 0; i < numAgendamentos; i++) {
                if (disponibilidadesDisponiveis.length === 0) break;
                
                // Pegar uma disponibilidade aleatória
                const index = Math.floor(Math.random() * disponibilidadesDisponiveis.length);
                const disponibilidade = disponibilidadesDisponiveis.splice(index, 1)[0];
                
                if (disponibilidade) {
                    const terapeuta = this.data.terapeutas.find(t => t.id === disponibilidade.terapeutaId);
                    const dataAgendamento = new Date(disponibilidade.datetime);
                    const hoje = new Date();
                    
                    // Determinar status baseado na data
                    let status = 'agendado';
                    if (dataAgendamento < hoje) {
                        status = Math.random() > 0.1 ? 'realizado' : 'cancelado'; // 90% realizados, 10% cancelados
                    }
                    
                    // Determinar local baseado no tipo de terapia
                    const locais = ['Clínica', 'Escola', 'Residência', 'Online'];
                    const local = locais[Math.floor(Math.random() * locais.length)];
                    
                    agendamentos.push({
                        id: agendamentos.length + 1001,
                        pacienteId: paciente.id,
                        terapeutaId: disponibilidade.terapeutaId,
                        datetime: disponibilidade.datetime,
                        duracao: 60,
                        tipoTerapia: paciente.tipo_terapia,
                        local: local,
                        observacoes: this.generateSessionNotes(paciente),
                        status: status,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }
            }
        });

        return agendamentos;
    }

    generateSessionNotes(paciente) {
        const notas = [
            `Paciente gosta de ${paciente.preferencias ? paciente.preferencias[0] : 'atividades variadas'}`,
            `Importante: ${paciente.gatilhos ? paciente.gatilhos[0] : 'observar reações'}`,
            `Estratégia eficaz: ${paciente.estrategias_eficazes ? paciente.estrategias_eficazes[0] : 'reforço positivo'}`,
            'Sessão individual focada no desenvolvimento',
            'Trabalhar habilidades sociais',
            'Exercícios de coordenação motora'
        ];
        return notas[Math.floor(Math.random() * notas.length)];
    }

    // Métodos de consulta
    getTerapeutas() {
        return this.data.terapeutas;
    }

    getSupervisores() {
        return this.data.supervisores;
    }

    getPacientes() {
        return this.data.pacientes;
    }

    getTiposTerapia() {
        return this.data.tiposTerapia;
    }

    getDisponibilidades(filtros = {}) {
        let disponibilidades = this.data.disponibilidades;
        
        if (filtros.terapeutaId) {
            disponibilidades = disponibilidades.filter(d => d.terapeutaId === filtros.terapeutaId);
        }
        
        if (filtros.dataInicio && filtros.dataFim) {
            const inicio = new Date(filtros.dataInicio).getTime();
            const fim = new Date(filtros.dataFim).getTime();
            disponibilidades = disponibilidades.filter(d => d.datetime >= inicio && d.datetime <= fim);
        }
        
        return disponibilidades;
    }

    getAgendamentos(filtros = {}) {
        let agendamentos = this.data.agendamentos;
        
        if (filtros.terapeutaId) {
            agendamentos = agendamentos.filter(a => a.terapeutaId === filtros.terapeutaId);
        }
        
        if (filtros.pacienteId) {
            agendamentos = agendamentos.filter(a => a.pacienteId === filtros.pacienteId);
        }
        
        if (filtros.status) {
            agendamentos = agendamentos.filter(a => a.status === filtros.status);
        }
        
        if (filtros.dataInicio && filtros.dataFim) {
            const inicio = new Date(filtros.dataInicio).getTime();
            const fim = new Date(filtros.dataFim).getTime();
            agendamentos = agendamentos.filter(a => a.datetime >= inicio && a.datetime <= fim);
        }
        
        return agendamentos.sort((a, b) => a.datetime - b.datetime);
    }

    // Métodos de busca específica
    getTerapeutaById(id) {
        return this.data.terapeutas.find(t => t.id === id);
    }

    getPacienteById(id) {
        return this.data.pacientes.find(p => p.id === id);
    }

    getSupervisorById(id) {
        return this.data.supervisores.find(s => s.id === id);
    }

    // Métodos de manipulação de dados
    adicionarDisponibilidade(disponibilidade) {
        const novaDisponibilidade = {
            ...disponibilidade,
            id: Math.max(...this.data.disponibilidades.map(d => d.id), 0) + 1,
            status: 'disponivel'
        };
        this.data.disponibilidades.push(novaDisponibilidade);
        return novaDisponibilidade;
    }

    adicionarAgendamento(agendamento) {
        const novoAgendamento = {
            ...agendamento,
            id: Math.max(...this.data.agendamentos.map(a => a.id), 1000) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.data.agendamentos.push(novoAgendamento);
        
        // Remove a disponibilidade correspondente
        this.data.disponibilidades = this.data.disponibilidades.filter(
            d => !(d.terapeutaId === agendamento.terapeutaId && d.datetime === agendamento.datetime)
        );
        
        return novoAgendamento;
    }

    atualizarStatusAgendamento(id, novoStatus) {
        const agendamento = this.data.agendamentos.find(a => a.id === id);
        if (agendamento) {
            agendamento.status = novoStatus;
            agendamento.updated_at = new Date().toISOString();
            return agendamento;
        }
        return null;
    }

    // Métodos de estatísticas
    getEstatisticas() {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        const agendamentosMes = this.getAgendamentos({
            dataInicio: inicioMes,
            dataFim: fimMes
        });

        return {
            totalPacientes: this.data.pacientes.length,
            totalTerapeutas: this.data.terapeutas.length,
            agendamentosAgendados: this.data.agendamentos.filter(a => a.status === 'agendado').length,
            sessõesRealizadasMês: agendamentosMes.filter(a => a.status === 'realizado').length,
            disponibilidadesLivres: this.data.disponibilidades.length,
            pacientesSemAgendamento: this.data.pacientes.filter(p => 
                !this.data.agendamentos.some(a => a.pacienteId === p.id && a.status === 'agendado')
            ).length
        };
    }

    // Método para simular persistência
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            this.data = JSON.parse(jsonData);
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }
}

// Instância global
const dataManager = new DataManager();