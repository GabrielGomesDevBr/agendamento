// Data management module for CliniAgende v4 - API Integration

class DataManagerAPI {
    constructor() {
        this.authenticated = false;
        this.currentUser = null;
        this.data = {
            terapeutas: [],
            pacientes: [],
            disponibilidades: [],
            agendamentos: []
        };
    }

    async init() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await apiClient.verifyToken();
                this.authenticated = true;
                this.currentUser = response.user;
                
                // Carregar dados básicos para cache
                try {
                    this.data.terapeutas = await this.getTerapeutas();
                    this.data.pacientes = await this.getPacientes();
                } catch (error) {
                    console.warn('Erro ao carregar dados básicos:', error);
                }
            } catch (error) {
                apiClient.setToken(null);
            }
        }
    }

    async login(email, password) {
        const response = await apiClient.login(email, password);
        this.authenticated = true;
        this.currentUser = response.user;
        return response;
    }

    logout() {
        apiClient.logout();
        this.authenticated = false;
        this.currentUser = null;
    }

    async getPacientes() {
        const response = await apiClient.getPacientes();
        return response.data;
    }

    async getPacienteById(id) {
        const response = await apiClient.getPacienteById(id);
        return response.data;
    }

    async addPaciente(pacienteData) {
        const response = await apiClient.createPaciente(pacienteData);
        return response.data;
    }

    async updatePaciente(id, pacienteData) {
        const response = await apiClient.updatePaciente(id, pacienteData);
        return response.data;
    }

    async getAgendamentos(filtros = {}) {
        const response = await apiClient.getAgendamentos(filtros);
        return response.data.map(a => ({
            ...a,
            datetime: new Date(a.data_hora).getTime(),
            pacienteId: a.paciente_id,
            terapeutaId: a.terapeuta_id,
        }));
    }

    async updateAgendamentoStatus(id, status) {
        const response = await apiClient.updateAgendamentoStatus(id, status);
        return response.data;
    }

    async getDisponibilidades(filtros = {}) {
        const response = await apiClient.getDisponibilidades(filtros);
        return response.data.map(d => ({
            ...d,
            datetime: new Date(d.data_hora).getTime(),
        }));
    }


    async getEstatisticas() {
        const response = await apiClient.getEstatisticas();
        return response.data;
    }

    async getTerapeutas() {
        // This should be an API call
        return apiClient.request('/terapeutas').then(res => res.data);
    }

    async getSupervisores() {
        // This should be an API call
        return apiClient.request('/supervisores').then(res => res.data);
    }

    async addTerapeuta(terapeutaData) {
        const response = await apiClient.createTerapeuta(terapeutaData);
        return response.data;
    }

    async updateTerapeuta(id, terapeutaData) {
        const response = await apiClient.updateTerapeuta(id, terapeutaData);
        return response.data;
    }

    async getTerapeutaById(id) {
        return apiClient.request(`/terapeutas/${id}`).then(res => res.data);
    }

    isAuthenticated() {
        return this.authenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Métodos síncronos para compatibilidade com código existente
    getTiposTerapia() {
        // Por enquanto retorna tipos fixos, poderia ser carregado da API futuramente
        return [
            { id: 1, nome: 'ABA', valor: 150.00 },
            { id: 2, nome: 'Terapia Ocupacional', valor: 120.00 },
            { id: 3, nome: 'Fonoaudiologia', valor: 110.00 },
            { id: 4, nome: 'Psicomotricidade', valor: 100.00 },
            { id: 5, nome: 'Musicoterapia', valor: 90.00 }
        ];
    }


    getTerapeutaById(id) {
        // Se os dados já estão carregados, usa cache  
        if (this.data.terapeutas && this.data.terapeutas.length > 0) {
            return this.data.terapeutas.find(t => t.id === parseInt(id));
        }
        // Senão retorna null por enquanto (poderia fazer chamada async)
        return null;
    }

    // Método síncrono para buscar paciente por ID (usando cache)
    getPacienteByIdSync(id) {
        if (this.data.pacientes && this.data.pacientes.length > 0) {
            return this.data.pacientes.find(p => p.id === parseInt(id));
        }
        return null;
    }

    async adicionarAgendamento(agendamento) {
        try {
            const response = await apiClient.createAgendamento({
                paciente_id: agendamento.pacienteId,
                terapeuta_id: agendamento.terapeutaId,
                data_hora: new Date(agendamento.datetime).toISOString(),
                duracao: agendamento.duracao,
                tipo_terapia: agendamento.tipoTerapia,
                local: agendamento.local,
                observacoes: agendamento.observacoes,
                status: agendamento.status || 'agendado'
            });
            
            if (response.data) {
                // Adicionar à lista local
                this.data.agendamentos.push({
                    id: response.data.id,
                    pacienteId: response.data.paciente_id,
                    terapeutaId: response.data.terapeuta_id,
                    datetime: new Date(response.data.data_hora).getTime(),
                    duracao: response.data.duracao,
                    tipoTerapia: response.data.tipo_terapia,
                    local: response.data.local,
                    observacoes: response.data.observacoes,
                    status: response.data.status
                });
                
                return response.data;
            }
        } catch (error) {
            console.error('Erro ao adicionar agendamento:', error);
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast('Erro ao criar agendamento', 'error');
            }
        }
    }

    async atualizarStatusAgendamento(id, novoStatus) {
        try {
            const response = await apiClient.updateAgendamentoStatus(id, novoStatus);
            
            if (response.data) {
                // Atualizar na lista local
                const agendamento = this.data.agendamentos.find(a => a.id === parseInt(id));
                if (agendamento) {
                    agendamento.status = novoStatus;
                }
                return response.data;
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast('Erro ao atualizar status', 'error');
            }
        }
        return null;
    }

    async removerDisponibilidade(disponibilidadeId) {
        try {
            const response = await apiClient.deleteDisponibilidade(disponibilidadeId);
            
            if (response.message) {
                // Remover da lista local
                this.data.disponibilidades = this.data.disponibilidades.filter(d => d.id !== parseInt(disponibilidadeId));
                return response;
            } else {
                throw new Error('Resposta inválida do servidor');
            }
        } catch (error) {
            console.error('Erro ao remover disponibilidade:', error);
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast(error.message || 'Erro ao remover disponibilidade', 'error');
            }
            throw error;
        }
    }

    // Métodos de manipulação de dados
    async adicionarDisponibilidade(disponibilidade) {
        try {
            const response = await apiClient.createDisponibilidade({
                terapeuta_id: disponibilidade.terapeutaId,
                data_hora: new Date(disponibilidade.datetime).toISOString(),
                duracao: disponibilidade.duracao || 60
            });
            
            if (response.data) {
                // Adicionar à lista local também para atualização imediata da UI
                if (!this.data.disponibilidades) {
                    this.data.disponibilidades = [];
                }
                
                this.data.disponibilidades.push({
                    id: response.data.id,
                    terapeutaId: response.data.terapeuta_id,
                    datetime: new Date(response.data.data_hora).getTime(),
                    duracao: response.data.duracao,
                    status: response.data.status
                });
                
                return response.data;
            } else {
                throw new Error('Resposta inválida do servidor');
            }
        } catch (error) {
            console.error('Erro ao adicionar disponibilidade:', error);
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast(error.message || 'Erro ao adicionar disponibilidade', 'error');
            }
            throw error;
        }
    }
}

const dataManager = new DataManagerAPI();

// Initialization is handled by App.init() - removing duplicate
