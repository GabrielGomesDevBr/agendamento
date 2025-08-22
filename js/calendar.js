// Calendar module for CliniAgende v4

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.viewType = 'month'; // month, week, day
        this.filters = {
            terapeutaId: null,
            tipoTerapia: null,
            status: null
        };
    }

    init() {
        this.setupEventListeners();
        
        // Check if there's a patient selected for scheduling
        if (window.selectedPatientForScheduling) {
            this.selectedPatientId = window.selectedPatientForScheduling;
            // Clear the global variable
            delete window.selectedPatientForScheduling;
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-calendar-prev]')) {
                this.navigateMonth(-1);
            }
            if (e.target.matches('[data-calendar-next]')) {
                this.navigateMonth(1);
            }
            if (e.target.matches('[data-calendar-today]')) {
                this.goToToday();
            }
        });

        // View type buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-view-type]')) {
                this.changeViewType(e.target.dataset.viewType);
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-calendar-filter]')) {
                this.updateFilter(e.target.name, e.target.value);
            }
        });
    }

    async render() {
        const container = document.getElementById('calendar-container');
        if (!container) return;

        const html = await this.getCalendarHTML();
        container.innerHTML = html;
        await this.renderCalendarEvents();
        lucide.createIcons();
    }

    async getCalendarHTML() {
        const monthYear = this.currentDate.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden">
                <!-- Calendar Header -->
                <div class="p-6 border-b border-slate-200">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <!-- Month Navigation -->
                        <div class="flex items-center gap-4">
                            <button data-calendar-prev class="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <i data-lucide="chevron-left" class="w-5 h-5"></i>
                            </button>
                            <h3 class="text-xl font-bold text-slate-800 capitalize min-w-[200px] text-center">
                                ${monthYear}
                            </h3>
                            <button data-calendar-next class="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <i data-lucide="chevron-right" class="w-5 h-5"></i>
                            </button>
                            <button data-calendar-today class="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                Hoje
                            </button>
                        </div>

                        <!-- View Controls and Filters -->
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <!-- View Type Toggle -->
                            <div class="flex bg-slate-100 rounded-lg p-1">
                                <button data-view-type="month" class="px-3 py-1 text-sm rounded-md transition-colors ${this.viewType === 'month' ? 'bg-white shadow' : 'hover:bg-slate-200'}">
                                    Mês
                                </button>
                                <button data-view-type="week" class="px-3 py-1 text-sm rounded-md transition-colors ${this.viewType === 'week' ? 'bg-white shadow' : 'hover:bg-slate-200'}">
                                    Semana
                                </button>
                            </div>

                            <!-- Filters -->
                            <div class="flex gap-2">
                                ${App.currentUser && App.currentUser.role === 'supervisor' ? `
                                    <select name="terapeutaId" data-calendar-filter class="px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        <option value="">Todos os terapeutas</option>
                                        ${(await dataManager.getTerapeutas()).map(t => 
                                            `<option value="${t.id}" ${this.filters.terapeutaId == t.id ? 'selected' : ''}>${t.nome}</option>`
                                        ).join('')}
                                    </select>
                                ` : ''}

                                ${this.getTerapeutaActions()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div id="calendar-grid" class="p-4">
                    ${this.viewType === 'month' ? this.getMonthView() : this.getWeekView()}
                </div>
            </div>
        `;
    }

    getTerapeutaActions() {
        if (App.currentUser && App.currentUser.role === 'terapeuta') {
            return `
                <button onclick="openAvailabilityModal()" class="flex items-center gap-2 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-md transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Adicionar Horário
                </button>
            `;
        } else {
            return this.getSupervisorActions();
        }
    }

    getSupervisorActions() {
        return `
            <select name="status" data-calendar-filter class="px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Todos os status</option>
                <option value="agendado" ${this.filters.status === 'agendado' ? 'selected' : ''}>Agendados</option>
                <option value="realizado" ${this.filters.status === 'realizado' ? 'selected' : ''}>Realizados</option>
                <option value="cancelado" ${this.filters.status === 'cancelado' ? 'selected' : ''}>Cancelados</option>
            </select>
        `;
    }

    getMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        let html = `
            <div class="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
                <!-- Day Headers -->
                ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => 
                    `<div class="bg-slate-50 text-center font-semibold py-3 text-sm text-slate-600">${day}</div>`
                ).join('')}
        `;

        // Empty cells for days before month start
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="bg-slate-50 min-h-[120px]"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const dateStr = date.toISOString().split('T')[0];
            
            html += `
                <div class="bg-white min-h-[120px] p-2 calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-semibold text-sm ${isToday ? 'bg-teal-500 text-white px-2 py-1 rounded-full' : 'text-slate-800'}">${day}</span>
                    </div>
                    <div class="space-y-1 calendar-events" data-date="${dateStr}">
                        <!-- Events will be inserted here -->
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    getWeekView() {
        // Implementation for week view (simplified for MVP)
        return `
            <div class="text-center py-8 text-slate-500">
                <i data-lucide="calendar" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                <p>Visualização semanal em desenvolvimento</p>
            </div>
        `;
    }

    async renderCalendarEvents() {
        const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        try {
            // Get appointments and availabilities for the current month
            const [appointments, availabilities] = await Promise.all([
                dataManager.getAgendamentos({
                    dataInicio: startDate,
                    dataFim: endDate,
                    ...this.filters
                }),
                dataManager.getDisponibilidades({
                    dataInicio: startDate,
                    dataFim: endDate,
                    ...this.filters
                })
            ]);

            // Clear existing events
            document.querySelectorAll('.calendar-events').forEach(container => {
                container.innerHTML = '';
            });

            // Render appointments
            appointments.forEach(appointment => {
                this.renderEventOnCalendar(appointment, 'appointment');
            });

            // Render availabilities (only if no therapist filter or if user is supervisor)
            if (!this.filters.terapeutaId || (App.currentUser && App.currentUser.role === 'supervisor')) {
                availabilities.forEach(availability => {
                    this.renderEventOnCalendar(availability, 'availability');
                });
            }
        } catch (error) {
            console.error('❌ [CALENDAR] Error loading calendar events:', error);
        }
    }

    renderEventOnCalendar(event, type) {
        const eventDate = new Date(event.datetime);
        const dateStr = eventDate.toISOString().split('T')[0];
        const container = document.querySelector(`.calendar-events[data-date="${dateStr}"]`);
        
        if (!container) return;

        let eventHTML = '';
        
        if (type === 'appointment') {
            const patient = dataManager.getPacienteById(event.pacienteId);
            const therapist = dataManager.getTerapeutaById(event.terapeutaId);
            const time = Utils.formatTime(event.datetime);
            
            eventHTML = `
                <div class="calendar-event cursor-pointer p-1 text-xs rounded transition-all hover:shadow-sm" 
                     style="background-color: ${Utils.getStatusColor(event.status)}20; border-left: 3px solid ${Utils.getStatusColor(event.status)}"
                     data-event-type="appointment" 
                     data-event-id="${event.id}"
                     onclick="handleEventClick(${event.id}, 'appointment')">
                    <div class="font-semibold">${time}</div>
                    <div class="truncate">${patient ? patient.nome.split(' ')[0] : 'Paciente'}</div>
                    <div class="text-xs opacity-75">${therapist ? therapist.nome.split(' ')[1] : 'Terapeuta'}</div>
                </div>
            `;
        } else if (type === 'availability') {
            const therapist = dataManager.getTerapeutaById(event.terapeutaId);
            const time = Utils.formatTime(event.datetime);
            
            eventHTML = `
                <div class="calendar-event cursor-pointer p-1 text-xs rounded transition-all hover:shadow-sm bg-green-100 border-l-green-500" 
                     data-event-type="availability" 
                     data-event-id="${event.id}"
                     onclick="handleEventClick(${event.id}, 'availability')">
                    <div class="font-semibold">${time}</div>
                    <div class="text-green-700">Disponível</div>
                    <div class="text-xs opacity-75">${therapist ? therapist.nome.split(' ')[1] : 'Terapeuta'}</div>
                </div>
            `;
        }

        container.insertAdjacentHTML('beforeend', eventHTML);
    }

    handleEventClick(eventId, eventType) {
        if (eventType === 'appointment' && App.currentUser.role === 'terapeuta') {
            // Therapist can update appointment status
            this.openStatusUpdateModal(eventId);
        } else if (eventType === 'availability' && App.currentUser.role === 'supervisor') {
            // Supervisor can book appointment
            this.openBookingModal(eventId);
        } else if (eventType === 'appointment' && App.currentUser.role === 'supervisor') {
            // Supervisor can view appointment details
            this.openAppointmentDetailsModal(eventId);
        }
    }

    async openBookingModal(availabilityId) {
        try {
            const availability = await this.getAvailabilityById(availabilityId);
            const therapist = dataManager.getTerapeutaById(availability.terapeutaId);
            const patients = await dataManager.getPacientes();
            
            const modalHTML = `
                <div class="modal-overlay fade-in" id="booking-modal">
                    <div class="modal-content w-full max-w-2xl p-6">
                        <button onclick="Utils.closeModal()" class="modal-close">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                        
                        <div class="modal-header">
                            <h3 class="text-xl font-bold text-slate-800">Agendar Consulta</h3>
                            <p class="text-sm text-slate-500 mt-1">Disponibilidade: ${Utils.formatDateTime(availability.datetime)}</p>
                        </div>

                        <form id="booking-form" class="modal-body space-y-4" data-availability-id="${availabilityId}">
                            <div>
                                <label class="block text-sm font-medium text-slate-700">Terapeuta</label>
                                <input type="text" value="${therapist ? therapist.nome : 'Terapeuta'}" disabled class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-slate-300 rounded-md">
                            </div>

                            <div>
                                <label for="patient-select" class="block text-sm font-medium text-slate-700">Paciente *</label>
                                <select id="patient-select" name="pacienteId" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione um paciente</option>
                                    ${patients.map(p => `<option value="${p.id}" ${this.selectedPatientId && this.selectedPatientId == p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}
                                </select>
                            </div>

                            <div>
                                <label for="tipo-terapia" class="block text-sm font-medium text-slate-700">Tipo de Terapia *</label>
                                <select id="tipo-terapia" name="tipoTerapia" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="ABA">ABA</option>
                                    <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                                    <option value="Fonoaudiologia">Fonoaudiologia</option>
                                    <option value="Psicomotricidade">Psicomotricidade</option>
                                    <option value="Musicoterapia">Musicoterapia</option>
                                </select>
                            </div>

                            <div>
                                <label for="local" class="block text-sm font-medium text-slate-700">Local *</label>
                                <select id="local" name="local" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="Sala 1">Sala 1</option>
                                    <option value="Sala 2">Sala 2</option>
                                    <option value="Sala 3">Sala 3</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>

                            <div>
                                <label for="observacoes" class="block text-sm font-medium text-slate-700">Observações</label>
                                <textarea id="observacoes" name="observacoes" rows="3" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>

                            <div class="modal-footer">
                                <button type="button" onclick="Utils.closeModal()" class="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i data-lucide="calendar-plus" class="w-4 h-4 inline mr-2"></i>
                                    Confirmar Agendamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.getElementById('modals-container').innerHTML = modalHTML;
            lucide.createIcons();
            
            // Setup form submission
            document.getElementById('booking-form').addEventListener('submit', (e) => this.handleBookingSubmit(e));
        } catch (error) {
            console.error('Erro ao abrir modal de agendamento:', error);
            Utils.showToast('Erro ao carregar dados para agendamento', 'error');
        }
    }

    async getAvailabilityById(availabilityId) {
        const availabilities = await dataManager.getDisponibilidades();
        return availabilities.find(a => a.id === parseInt(availabilityId));
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const availabilityId = e.target.dataset.availabilityId;
        
        try {
            const availability = await this.getAvailabilityById(availabilityId);
            
            const appointmentData = {
                pacienteId: parseInt(formData.get('pacienteId')),
                terapeutaId: availability.terapeutaId,
                datetime: availability.datetime,
                duracao: availability.duracao || 60,
                tipoTerapia: formData.get('tipoTerapia'),
                local: formData.get('local'),
                observacoes: formData.get('observacoes'),
                status: 'agendado'
            };

            // Criar agendamento
            await dataManager.adicionarAgendamento(appointmentData);
            
            // Remover disponibilidade
            await dataManager.removerDisponibilidade(availabilityId);
            
            Utils.showToast('Consulta agendada com sucesso!', 'success');
            Utils.closeModal();
            
            // Recarregar calendário
            this.renderCalendarEvents();
        } catch (error) {
            console.error('Erro ao agendar consulta:', error);
            Utils.showToast('Erro ao agendar consulta', 'error');
        }
    }

    openStatusUpdateModal(appointmentId) {
        Utils.showToast('Funcionalidade em desenvolvimento', 'info');
    }

    openAppointmentDetailsModal(appointmentId) {
        Utils.showToast('Funcionalidade em desenvolvimento', 'info');
    }

    // Navigation methods
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    changeViewType(viewType) {
        this.viewType = viewType;
        this.render();
    }

    // Filter methods
    async updateFilter(filterName, filterValue) {
        this.filters[filterName] = filterValue || null;
        await this.renderCalendarEvents();
    }

    clearFilters() {
        this.filters = {
            terapeutaId: null,
            tipoTerapia: null,
            status: null
        };
        this.render();
    }

    // Utility methods
    getEventsForDate(date) {
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const appointments = dataManager.getAgendamentos({
            dataInicio: dateStart,
            dataFim: dateEnd,
            ...this.filters
        });

        const availabilities = dataManager.getDisponibilidades({
            dataInicio: dateStart,
            dataFim: dateEnd,
            ...this.filters
        });

        return { appointments, availabilities };
    }

    // Export methods
    exportCalendarData(format = 'json') {
        const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        const appointments = dataManager.getAgendamentos({
            dataInicio: startDate,
            dataFim: endDate
        });

        const exportData = appointments.map(appointment => {
            const patient = dataManager.getPacienteById(appointment.pacienteId);
            const therapist = dataManager.getTerapeutaById(appointment.terapeutaId);
            
            return {
                data: Utils.formatDate(appointment.datetime),
                horario: Utils.formatTime(appointment.datetime),
                paciente: patient ? patient.nome : '',
                terapeuta: therapist ? therapist.nome : '',
                tipo_terapia: appointment.tipoTerapia,
                local: appointment.local,
                status: appointment.status,
                observacoes: appointment.observacoes
            };
        });

        const monthYear = this.currentDate.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        if (format === 'csv') {
            Utils.downloadCSV(exportData, `agendamentos_${monthYear.replace(' ', '_')}.csv`);
        } else {
            Utils.downloadJSON(exportData, `agendamentos_${monthYear.replace(' ', '_')}.json`);
        }
    }
}

// Global instance
const calendarManager = new CalendarManager();
window.calendarManager = calendarManager;

// Make handleEventClick available globally
window.handleEventClick = function(eventId, eventType) {
    calendarManager.handleEventClick(eventId, eventType);
};