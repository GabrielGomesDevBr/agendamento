// Forms module for CliniAgende v4

class FormsManager {
    constructor() {
        this.currentFormData = {};
        this.validationRules = {};
    }

    init() {
        this.setupFormEventListeners();
    }

    setupFormEventListeners() {
        // Form submission handling
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form[data-form-type]')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });

        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[data-validate], textarea[data-validate], select[data-validate]')) {
                this.validateField(e.target);
            }
        });

        // Patient selection in booking modal
        document.addEventListener('change', (e) => {
            if (e.target.id === 'patient-select') {
                this.updatePatientBookingForm(parseInt(e.target.value) || null);
            }
        });
    }

    // Modal Forms
    openAvailabilityModal() {
        const modalHTML = `
            <div class="modal-overlay fade-in">
                <div class="modal-content w-full max-w-md p-6">
                    <button onclick="Utils.closeModal()" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                    
                    <div class="modal-header">
                        <h3 class="text-xl font-bold text-slate-800">Adicionar Disponibilidade</h3>
                        <p class="text-sm text-slate-500 mt-1">Defina um novo horário disponível para agendamentos</p>
                    </div>

                    <form data-form-type="availability" class="modal-body space-y-4">
                        <div class="form-group">
                            <label for="availability-date" class="form-label">Data *</label>
                            <input 
                                type="date" 
                                id="availability-date" 
                                name="date" 
                                required 
                                data-validate="required"
                                class="form-input"
                                min="${new Date().toISOString().split('T')[0]}"
                            >
                            <div class="form-error" id="date-error"></div>
                        </div>

                        <div class="form-group">
                            <label for="availability-time" class="form-label">Horário de Início *</label>
                            <input 
                                type="time" 
                                id="availability-time" 
                                name="time" 
                                required 
                                data-validate="required"
                                class="form-input"
                            >
                            <div class="form-error" id="time-error"></div>
                        </div>

                        <div class="form-group">
                            <label for="availability-duration" class="form-label">Duração (minutos)</label>
                            <select id="availability-duration" name="duration" class="form-input">
                                <option value="45">45 minutos</option>
                                <option value="60" selected>60 minutos</option>
                                <option value="90">90 minutos</option>
                            </select>
                        </div>

                        <div class="modal-footer">
                            <button type="button" onclick="Utils.closeModal()" class="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary">
                                <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                                Adicionar Disponibilidade
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        Utils.openModal(modalHTML);
    }

    openBookingModal(availabilityId) {
        const availability = dataManager.data.disponibilidades.find(d => d.id === availabilityId);
        if (!availability) return;

        const therapist = dataManager.getTerapeutaById(availability.terapeutaId);
        const datetime = new Date(availability.datetime);
        
        const modalHTML = `
            <div class="modal-overlay fade-in">
                <div class="modal-content w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                    <button onclick="Utils.closeModal()" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                    
                    <div class="modal-header">
                        <h3 class="text-xl font-bold text-slate-800">Agendar Paciente</h3>
                        <p class="text-sm text-slate-500 mt-1">
                            ${Utils.formatDateTime(datetime)} com ${therapist.name}
                        </p>
                    </div>

                    <form data-form-type="booking" class="modal-body space-y-6">
                        <input type="hidden" name="availabilityId" value="${availabilityId}">
                        
                        <!-- Patient Selection -->
                        <div class="form-group">
                            <label for="patient-select" class="form-label">Selecionar Paciente *</label>
                            <select id="patient-select" name="patientId" required data-validate="required" class="form-input">
                                <option value="">Selecione um paciente</option>
                                ${dataManager.getPacientes().map(p => 
                                    `<option value="${p.id}">${p.nome}</option>`
                                ).join('')}
                            </select>
                            <div class="form-error" id="patientId-error"></div>
                        </div>

                        <!-- Patient Details (Auto-filled) -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label for="patient-age" class="form-label">Idade</label>
                                <input type="text" id="patient-age" readonly class="form-input bg-slate-50">
                            </div>
                            <div class="form-group">
                                <label for="patient-diagnosis" class="form-label">Diagnóstico</label>
                                <input type="text" id="patient-diagnosis" readonly class="form-input bg-slate-50">
                            </div>
                        </div>

                        <!-- Session Details -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label for="booking-location" class="form-label">Local de Atendimento *</label>
                                <select id="booking-location" name="location" required data-validate="required" class="form-input">
                                    <option value="">Selecione o local</option>
                                    <option value="Clínica">Clínica</option>
                                    <option value="Escola">Escola do paciente</option>
                                    <option value="Residência">Residência do paciente</option>
                                    <option value="Online">Sessão online</option>
                                </select>
                                <div class="form-error" id="location-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="therapy-type" class="form-label">Tipo de Terapia</label>
                                <select id="therapy-type" name="therapyType" class="form-input">
                                    <option value="">Selecione o tipo</option>
                                    ${dataManager.getTiposTerapia().map(t => 
                                        `<option value="${t.id}">${t.nome}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Session Notes -->
                        <div class="form-group">
                            <label for="session-notes" class="form-label">Observações para a Sessão</label>
                            <textarea 
                                id="session-notes" 
                                name="notes" 
                                rows="3" 
                                class="form-input" 
                                placeholder="Ex: Paciente prefere atividades com brinquedos coloridos, evitar ambientes barulhentos..."
                            ></textarea>
                        </div>

                        <!-- Patient Preferences (Auto-filled) -->
                        <div class="bg-slate-50 rounded-lg p-4">
                            <h4 class="font-semibold text-slate-800 mb-3">Informações do Paciente</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <label class="font-medium text-slate-600">Preferências:</label>
                                    <p id="patient-preferences" class="text-slate-500 mt-1">-</p>
                                </div>
                                <div>
                                    <label class="font-medium text-slate-600">Gatilhos:</label>
                                    <p id="patient-triggers" class="text-slate-500 mt-1">-</p>
                                </div>
                                <div>
                                    <label class="font-medium text-slate-600">Estratégias eficazes:</label>
                                    <p id="patient-strategies" class="text-slate-500 mt-1">-</p>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" onclick="Utils.closeModal()" class="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary bg-cyan-500 hover:bg-cyan-600">
                                <i data-lucide="calendar-check" class="w-4 h-4 inline mr-2"></i>
                                Confirmar Agendamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        Utils.openModal(modalHTML);
    }

    openStatusUpdateModal(appointmentId) {
        const appointment = dataManager.data.agendamentos.find(a => a.id === appointmentId);
        if (!appointment) return;

        const patient = dataManager.getPacienteById(appointment.pacienteId);
        const datetime = new Date(appointment.datetime);

        const modalHTML = `
            <div class="modal-overlay fade-in">
                <div class="modal-content w-full max-w-sm p-6">
                    <button onclick="Utils.closeModal()" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                    
                    <div class="modal-header text-center">
                        <h3 class="text-xl font-bold text-slate-800">Atualizar Status</h3>
                        <p class="text-sm text-slate-500 mt-1">
                            Sessão de ${patient.nome}<br>
                            ${Utils.formatDateTime(datetime)}
                        </p>
                    </div>

                    <div class="modal-body space-y-3">
                        <button onclick="updateAppointmentStatus(${appointmentId}, 'realizado')" 
                                class="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <i data-lucide="check-circle" class="w-5 h-5"></i>
                            Marcar como Realizada
                        </button>
                        
                        <button onclick="updateAppointmentStatus(${appointmentId}, 'cancelado')" 
                                class="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <i data-lucide="x-circle" class="w-5 h-5"></i>
                            Marcar como Cancelada
                        </button>

                        <button onclick="updateAppointmentStatus(${appointmentId}, 'faltou')" 
                                class="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <i data-lucide="user-x" class="w-5 h-5"></i>
                            Paciente Faltou
                        </button>
                    </div>
                </div>
            </div>
        `;

        Utils.openModal(modalHTML);
    }

    openAppointmentDetailsModal(appointmentId) {
        const appointment = dataManager.data.agendamentos.find(a => a.id === appointmentId);
        if (!appointment) return;

        const patient = dataManager.getPacienteById(appointment.pacienteId);
        const therapist = dataManager.getTerapeutaById(appointment.terapeutaId);
        const datetime = new Date(appointment.datetime);

        const modalHTML = `
            <div class="modal-overlay fade-in">
                <div class="modal-content w-full max-w-2xl p-6">
                    <button onclick="Utils.closeModal()" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                    
                    <div class="modal-header">
                        <h3 class="text-xl font-bold text-slate-800">Detalhes do Agendamento</h3>
                    </div>

                    <div class="modal-body space-y-6">
                        <!-- Appointment Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-4">
                                <div>
                                    <label class="text-sm font-medium text-slate-600">Data e Horário</label>
                                    <p class="text-lg font-semibold">${Utils.formatDateTime(datetime)}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-slate-600">Local</label>
                                    <p>${appointment.local}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-slate-600">Status</label>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                          style="background-color: ${Utils.getStatusColor(appointment.status)}20; color: ${Utils.getStatusColor(appointment.status)}">
                                        ${appointment.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="text-sm font-medium text-slate-600">Paciente</label>
                                    <p class="text-lg font-semibold">${patient.nome}</p>
                                    <p class="text-sm text-slate-500">${patient.diagnostico_principal}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-slate-600">Terapeuta</label>
                                    <p>${therapist.name}</p>
                                    <p class="text-sm text-slate-500">${therapist.especialidades.join(', ')}</p>
                                </div>
                            </div>
                        </div>

                        ${appointment.observacoes ? `
                            <div>
                                <label class="text-sm font-medium text-slate-600">Observações da Sessão</label>
                                <p class="mt-1 p-3 bg-slate-50 rounded-lg">${appointment.observacoes}</p>
                            </div>
                        ` : ''}

                        <!-- Patient Preferences -->
                        <div class="bg-blue-50 rounded-lg p-4">
                            <h4 class="font-semibold text-blue-800 mb-3">Informações do Paciente</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <label class="font-medium text-blue-700">Preferências:</label>
                                    <p class="text-blue-600 mt-1">${patient.preferencias ? patient.preferencias.join(', ') : 'Não informado'}</p>
                                </div>
                                <div>
                                    <label class="font-medium text-blue-700">Gatilhos:</label>
                                    <p class="text-blue-600 mt-1">${patient.gatilhos ? patient.gatilhos.join(', ') : 'Não informado'}</p>
                                </div>
                                <div>
                                    <label class="font-medium text-blue-700">Estratégias:</label>
                                    <p class="text-blue-600 mt-1">${patient.estrategias_eficazes ? patient.estrategias_eficazes.join(', ') : 'Não informado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button onclick="Utils.closeModal()" class="btn-secondary">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        Utils.openModal(modalHTML);
    }

    openPatientProfileModal(patientId) {
        const patient = dataManager.getPacienteById(patientId);
        if (!patient) return;

        const appointments = dataManager.getAgendamentos({ pacienteId: patientId })
            .sort((a, b) => b.datetime - a.datetime);

        const modalHTML = `
            <div class="modal-overlay fade-in">
                <div class="modal-content w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                    <button onclick="Utils.closeModal()" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                    
                    <!-- Patient Header -->
                    <div class="flex items-start gap-6 mb-6">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            ${Utils.getInitials(patient.nome)}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold text-slate-800">${patient.nome}</h2>
                            <p class="text-slate-600 mt-1">${patient.diagnostico_principal}</p>
                            <div class="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                <span><i data-lucide="cake" class="w-4 h-4 inline mr-1"></i>${Utils.calculateAge(patient.data_nascimento)} anos</span>
                                <span><i data-lucide="phone" class="w-4 h-4 inline mr-1"></i>${patient.telefone}</span>
                                <span><i data-lucide="graduation-cap" class="w-4 h-4 inline mr-1"></i>${patient.escola}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Patient Details Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <!-- Medical Info -->
                        <div class="bg-red-50 rounded-xl p-4">
                            <h3 class="font-bold text-red-800 mb-3">Informações Médicas</h3>
                            <div class="space-y-2 text-sm">
                                <div><span class="font-medium">Diagnóstico:</span> ${patient.diagnostico_principal}</div>
                                ${patient.diagnosticos_secundarios ? `<div><span class="font-medium">Diagnósticos secundários:</span> ${patient.diagnosticos_secundarios.join(', ')}</div>` : ''}
                                <div><span class="font-medium">Medicações:</span> ${patient.medicacoes ? patient.medicacoes.join(', ') : 'Nenhuma'}</div>
                                <div><span class="font-medium">Alergias:</span> ${patient.alergias ? patient.alergias.join(', ') : 'Nenhuma'}</div>
                            </div>
                        </div>

                        <!-- Therapy Info -->
                        <div class="bg-green-50 rounded-xl p-4">
                            <h3 class="font-bold text-green-800 mb-3">Informações Terapêuticas</h3>
                            <div class="space-y-2 text-sm">
                                <div><span class="font-medium">Tipo de terapia:</span> ${patient.tipo_terapia}</div>
                                <div><span class="font-medium">Frequência:</span> ${patient.frequencia_recomendada}</div>
                                <div><span class="font-medium">Preferências:</span> ${patient.preferencias ? patient.preferencias.join(', ') : 'Não informado'}</div>
                                <div><span class="font-medium">Gatilhos:</span> ${patient.gatilhos ? patient.gatilhos.join(', ') : 'Não informado'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="bg-slate-50 rounded-xl p-4 mb-6">
                        <h3 class="font-bold text-slate-800 mb-3">Informações de Contato</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">Responsável:</span> ${patient.responsavel.nome} (${patient.responsavel.parentesco})<br>
                                <span class="font-medium">CPF:</span> ${patient.responsavel.cpf}<br>
                                <span class="font-medium">Email:</span> ${patient.email_responsavel}
                            </div>
                            <div>
                                <span class="font-medium">Endereço:</span><br>
                                ${patient.endereco.rua}<br>
                                ${patient.endereco.bairro}, ${patient.endereco.cidade}<br>
                                CEP: ${patient.endereco.cep}
                            </div>
                        </div>
                    </div>

                    <!-- Appointments History -->
                    <div>
                        <h3 class="font-bold text-slate-800 mb-4">Histórico de Sessões (${appointments.length})</h3>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            ${appointments.length > 0 ? appointments.map(app => {
                                const therapist = dataManager.getTerapeutaById(app.terapeutaId);
                                return `
                                    <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p class="font-semibold text-sm">${Utils.formatDateTime(app.datetime)}</p>
                                            <p class="text-xs text-slate-600">${therapist.name} • ${app.local}</p>
                                            ${app.observacoes ? `<p class="text-xs text-slate-500 mt-1">${app.observacoes}</p>` : ''}
                                        </div>
                                        <span class="text-xs font-medium px-2 py-1 rounded-full" 
                                              style="background-color: ${Utils.getStatusColor(app.status)}20; color: ${Utils.getStatusColor(app.status)}">
                                            ${app.status}
                                        </span>
                                    </div>
                                `;
                            }).join('') : '<p class="text-slate-500 text-center py-4">Nenhum agendamento encontrado.</p>'}
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button onclick="Utils.closeModal()" class="btn-secondary">Fechar</button>
                        <button onclick="schedulePatient(${patientId})" class="btn-primary bg-cyan-500 hover:bg-cyan-600">
                            <i data-lucide="calendar-plus" class="w-4 h-4 inline mr-2"></i>
                            Agendar Nova Sessão
                        </button>
                    </div>
                </div>
            </div>
        `;

        Utils.openModal(modalHTML);
    }

    // Form submission handlers
    handleFormSubmission(form) {
        const formType = form.dataset.formType;
        const formData = Utils.getFormData(form);

        // Validate form
        if (!this.validateForm(form)) {
            Utils.showToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        // Handle different form types
        switch (formType) {
            case 'availability':
                this.handleAvailabilitySubmission(formData);
                break;
            case 'booking':
                this.handleBookingSubmission(formData);
                break;
            default:
                console.warn('Unknown form type:', formType);
        }
    }

    handleAvailabilitySubmission(formData) {
        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, minute] = formData.time.split(':').map(Number);
        
        const datetime = new Date(year, month - 1, day, hour, minute);
        
        const availability = {
            terapeutaId: App.currentUser.data.id,
            datetime: datetime.getTime(),
            duracao: parseInt(formData.duration) || 60
        };

        dataManager.adicionarDisponibilidade(availability);
        Utils.closeModal();
        calendarManager.render();
        Utils.showToast('Disponibilidade adicionada com sucesso!');
    }

    handleBookingSubmission(formData) {
        const availability = dataManager.data.disponibilidades.find(d => d.id == formData.availabilityId);
        if (!availability) {
            Utils.showToast('Horário não encontrado', 'error');
            return;
        }

        const appointment = {
            pacienteId: parseInt(formData.patientId),
            terapeutaId: availability.terapeutaId,
            datetime: availability.datetime,
            duracao: availability.duracao,
            tipoTerapia: formData.therapyType || 'Não especificado',
            local: formData.location,
            observacoes: formData.notes || '',
            status: 'agendado'
        };

        dataManager.adicionarAgendamento(appointment);
        Utils.closeModal();
        calendarManager.render();
        Utils.showToast('Agendamento realizado com sucesso!');

        // Show notification for therapist
        if (App.currentUser.role === 'supervisor') {
            document.getElementById('notification-dot').classList.remove('hidden');
        }
    }

    // Form validation
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('[data-validate]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const rules = field.dataset.validate.split(' ');
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           field.parentElement.querySelector('.form-error');
        if (errorElement) errorElement.textContent = '';
        field.classList.remove('error');

        // Required validation
        if (rules.includes('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }

        // Email validation
        if (rules.includes('email') && field.value && !Utils.validateEmail(field.value)) {
            isValid = false;
            errorMessage = 'Email inválido';
        }

        // CPF validation
        if (rules.includes('cpf') && field.value && !Utils.validateCPF(field.value)) {
            isValid = false;
            errorMessage = 'CPF inválido';
        }

        // Show error if validation failed
        if (!isValid) {
            if (errorElement) errorElement.textContent = errorMessage;
            field.classList.add('error');
        }

        return isValid;
    }

    // Helper functions for patient booking form
    updatePatientBookingForm(patientId) {
        const patient = dataManager.getPacienteById(patientId);
        
        // Clear fields if no patient selected
        if (!patient) {
            document.getElementById('patient-age').value = '';
            document.getElementById('patient-diagnosis').value = '';
            document.getElementById('patient-preferences').textContent = '-';
            document.getElementById('patient-triggers').textContent = '-';
            document.getElementById('patient-strategies').textContent = '-';
            document.getElementById('therapy-type').value = '';
            return;
        }

        // Fill patient information
        document.getElementById('patient-age').value = `${Utils.calculateAge(patient.data_nascimento)} anos`;
        document.getElementById('patient-diagnosis').value = patient.diagnostico_principal;
        document.getElementById('patient-preferences').textContent = patient.preferencias ? patient.preferencias.join(', ') : 'Não informado';
        document.getElementById('patient-triggers').textContent = patient.gatilhos ? patient.gatilhos.join(', ') : 'Não informado';
        document.getElementById('patient-strategies').textContent = patient.estrategias_eficazes ? patient.estrategias_eficazes.join(', ') : 'Não informado';
        
        // Set therapy type based on patient preference
        const therapySelect = document.getElementById('therapy-type');
        const therapyTypes = dataManager.getTiposTerapia();
        const matchingTherapy = therapyTypes.find(t => t.id === patient.tipo_terapia);
        if (matchingTherapy) {
            therapySelect.value = matchingTherapy.id;
        }
    }

    // Status update methods
    updateAppointmentStatus(appointmentId, newStatus) {
        const updated = dataManager.atualizarStatusAgendamento(appointmentId, newStatus);
        if (updated) {
            Utils.closeModal();
            calendarManager.render();
            
            const statusMessages = {
                'realizado': 'Sessão marcada como realizada!',
                'cancelado': 'Sessão cancelada',
                'faltou': 'Marcado como falta do paciente'
            };
            
            Utils.showToast(statusMessages[newStatus] || 'Status atualizado');
        } else {
            Utils.showToast('Erro ao atualizar status', 'error');
        }
    }

    // Quick actions
    schedulePatient(patientId) {
        Utils.closeModal();
        App.navigateTo('calendario');
        
        // Show available slots for this patient
        Utils.showToast('Selecione um horário disponível no calendário', 'info');
    }
}

// Global instance
const Forms = new FormsManager();

// Make methods available globally for onclick handlers
window.updateAppointmentStatus = function(appointmentId, newStatus) {
    Forms.updateAppointmentStatus(appointmentId, newStatus);
};

window.schedulePatient = function(patientId) {
    Forms.schedulePatient(patientId);
};

window.openAvailabilityModal = function() {
    Forms.openAvailabilityModal();
};

window.openBookingModal = function(availabilityId) {
    Forms.openBookingModal(availabilityId);
};

window.openStatusUpdateModal = function(appointmentId) {
    Forms.openStatusUpdateModal(appointmentId);
};

window.openPatientProfileModal = function(patientId) {
    Forms.openPatientProfileModal(patientId);
};

window.openAppointmentDetailsModal = function(appointmentId) {
    Forms.openAppointmentDetailsModal(appointmentId);
};