// Data management module for CliniAgende v4 - API Integration

class DataManagerAPI {
    constructor() {
        this.authenticated = false;
        this.currentUser = null;
    }

    async init() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await apiClient.verifyToken();
                this.authenticated = true;
                this.currentUser = response.user;
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

    async addDisponibilidade(disponibilidadeData) {
        const apiData = {
            terapeuta_id: disponibilidadeData.terapeutaId,
            data_hora: new Date(disponibilidadeData.datetime).toISOString(),
            duracao: disponibilidadeData.duracao || 60
        };
        const response = await apiClient.createDisponibilidade(apiData);
        return {
            ...response.data,
            datetime: new Date(response.data.data_hora).getTime(),
        };
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

    async getTerapeutaById(id) {
        return apiClient.request(`/terapeutas/${id}`).then(res => res.data);
    }

    isAuthenticated() {
        return this.authenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const dataManager = new DataManagerAPI();

// Initialization is handled by App.init() - removing duplicate
