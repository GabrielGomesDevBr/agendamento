// Data management module for CliniAgende v4 - API Integration

class DataManagerAPI {
    constructor() {
        this.data = {
            pacientes: [],
            agendamentos: [],
            disponibilidades: []
        };
        this.initialized = false;
        this.authenticated = false;
        this.currentUser = null;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            Utils.showLoading(true);
            
            // Check if user is already authenticated
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await apiClient.verifyToken();
                    this.authenticated = true;
                    this.currentUser = response.user;
                } catch (error) {
                    // Token invalid, remove it
                    apiClient.setToken(null);
                }
            }
            
            this.initialized = true;
            console.log('✅ DataManager initialized with API integration');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.showToast('Erro ao inicializar a aplicação', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    // Authentication methods
    async login(email, password) {
        try {
            const response = await apiClient.login(email, password);
            this.authenticated = true;
            this.currentUser = response.user;
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    logout() {
        apiClient.logout();
        this.authenticated = false;
        this.currentUser = null;
        this.data = {
            pacientes: [],
            agendamentos: [],
            disponibilidades: []
        };
    }

    // Pacientes methods
    async getPacientes() {
        try {
            const response = await apiClient.getPacientes();
            this.data.pacientes = response.data;
            return response.data;
        } catch (error) {
            console.error('Error fetching pacientes:', error);
            throw error;
        }
    }

    async getPacienteById(id) {
        try {
            const response = await apiClient.getPacienteById(id);
            return response.data;
        } catch (error) {
            console.error('Error fetching paciente:', error);
            // Try to find in cached data
            const cached = this.data.pacientes.find(p => p.id === id);
            if (cached) return cached;
            throw error;
        }
    }

    async addPaciente(pacienteData) {
        try {
            const response = await apiClient.createPaciente(pacienteData);
            
            // Add to local cache
            this.data.pacientes.unshift(response.data);
            
            return response.data;
        } catch (error) {
            console.error('Error creating paciente:', error);
            throw error;
        }
    }

    // Agendamentos methods
    async getAgendamentos(filtros = {}) {
        try {
            const response = await apiClient.getAgendamentos(filtros);
            
            // Convert datetime strings to Date objects for compatibility
            const agendamentos = response.data.map(a => ({
                ...a,
                datetime: new Date(a.data_hora).getTime(),
                pacienteId: a.paciente_id,
                terapeutaId: a.terapeuta_id,
                local: a.local,
                tips: a.observacoes
            }));
            
            if (!filtros.terapeutaId && !filtros.pacienteId) {
                this.data.agendamentos = agendamentos;
            }
            
            return agendamentos;
        } catch (error) {
            console.error('Error fetching agendamentos:', error);
            throw error;
        }
    }

    async updateAgendamentoStatus(id, status) {
        try {
            const response = await apiClient.updateAgendamentoStatus(id, status);
            
            // Update local cache
            const index = this.data.agendamentos.findIndex(a => a.id === id);
            if (index !== -1) {
                this.data.agendamentos[index].status = status;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error updating agendamento status:', error);
            throw error;
        }
    }

    // Disponibilidades methods
    async getDisponibilidades(filtros = {}) {
        try {
            const response = await apiClient.getDisponibilidades(filtros);
            
            // Convert to compatible format
            const disponibilidades = response.data.map(d => ({
                id: d.id,
                terapeutaId: d.terapeuta_id,
                datetime: new Date(d.data_hora).getTime(),
                duracao: d.duracao
            }));
            
            if (!filtros.terapeutaId) {
                this.data.disponibilidades = disponibilidades;
            }
            
            return disponibilidades;
        } catch (error) {
            console.error('Error fetching disponibilidades:', error);
            throw error;
        }
    }

    async addDisponibilidade(disponibilidadeData) {
        try {
            // Convert format for API
            const apiData = {
                terapeuta_id: disponibilidadeData.terapeutaId,
                data_hora: new Date(disponibilidadeData.datetime).toISOString(),
                duracao: disponibilidadeData.duracao || 60
            };
            
            const response = await apiClient.createDisponibilidade(apiData);
            
            // Add to local cache
            const newDisponibilidade = {
                id: response.data.id,
                terapeutaId: response.data.terapeuta_id,
                datetime: new Date(response.data.data_hora).getTime(),
                duracao: response.data.duracao
            };
            
            this.data.disponibilidades.push(newDisponibilidade);
            
            return newDisponibilidade;
        } catch (error) {
            console.error('Error creating disponibilidade:', error);
            throw error;
        }
    }

    // Estatísticas methods
    async getEstatisticas() {
        try {
            const response = await apiClient.getEstatisticas();
            return response.data;
        } catch (error) {
            console.error('Error fetching estatisticas:', error);
            return {
                totalPacientes: 0,
                totalTerapeutas: 0,
                agendamentosAgendados: 0,
                sessoesRealizadasMes: 0,
                disponibilidadesLivres: 0,
                taxaComparecimento: 0
            };
        }
    }

    // Legacy compatibility methods
    getTerapeutas() {
        // Return mock data for compatibility
        return [
            { id: 1, name: 'Dra. Ana Paula Sousa', avatar: 'https://placehold.co/100x100/a7f3d0/15803d?text=AS' },
            { id: 2, name: 'Dr. Carlos Eduardo Lima', avatar: 'https://placehold.co/100x100/bae6fd/0c4a6e?text=CL' }
        ];
    }

    getSupervisores() {
        // Return mock data for compatibility
        return [
            { id: 1, name: 'Mariana Costa', avatar: 'https://placehold.co/100x100/fecaca/991b1b?text=MC' }
        ];
    }

    getTerapeutaById(id) {
        return this.getTerapeutas().find(t => t.id === id);
    }

    // Check authentication status
    isAuthenticated() {
        return this.authenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Replace the old dataManager with the new API-based one
const dataManager = new DataManagerAPI();