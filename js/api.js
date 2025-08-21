// API client for CliniAgende backend
class ApiClient {
  constructor() {
    this.baseURL = window.location.origin;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authorization headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Erro na requisição', data.code, response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError('Erro de conexão com o servidor', 'NETWORK_ERROR', 0);
    }
  }

  // Authentication endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async verifyToken() {
    return await this.request('/auth/verify');
  }

  // Pacientes endpoints
  async getPacientes() {
    return await this.request('/pacientes');
  }

  async getPacienteById(id) {
    return await this.request(`/pacientes/${id}`);
  }

  async createPaciente(pacienteData) {
    return await this.request('/pacientes', {
      method: 'POST',
      body: JSON.stringify(pacienteData)
    });
  }

  async updatePaciente(id, pacienteData) {
    return await this.request(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pacienteData)
    });
  }

  async searchPacientes(filters) {
    const params = new URLSearchParams(filters);
    return await this.request(`/pacientes/search?${params}`);
  }

  // Agendamentos endpoints
  async getAgendamentos(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/agendamentos?${params}`);
  }

  async getAgendamentoById(id) {
    return await this.request(`/agendamentos/${id}`);
  }

  async createAgendamento(agendamentoData) {
    return await this.request('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(agendamentoData)
    });
  }

  async updateAgendamentoStatus(id, status) {
    return await this.request(`/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async getEstatisticas() {
    return await this.request('/agendamentos/estatisticas');
  }

  // Disponibilidades endpoints
  async getDisponibilidades(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/disponibilidades?${params}`);
  }

  async createDisponibilidade(disponibilidadeData) {
    return await this.request('/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(disponibilidadeData)
    });
  }

  async deleteDisponibilidade(id) {
    return await this.request(`/disponibilidades/${id}`, {
      method: 'DELETE'
    });
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Global API client instance
const apiClient = new ApiClient();