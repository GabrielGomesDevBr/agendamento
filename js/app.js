// Main application module for CliniAgende v4

class Application {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Initialize data manager
            await dataManager.init();
            
            // Initialize modules
            calendarManager.init();
            Forms.init();

            // Setup global event listeners
            this.setupEventListeners();
            
            // Setup mobile menu
            this.setupMobileMenu();

            this.initialized = true;
            console.log('CliniAgende v4 initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.showToast('Erro ao inicializar a aplicação', 'error');
        }
    }

    setupEventListeners() {
        // Navigation handling
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                this.navigateTo(e.target.dataset.navigate);
            }
        });

        // Notification button
        document.getElementById('notifications-button')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                Utils.closeModal();
            }
            
            // Ctrl/Cmd + K for quick search (future feature)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // this.openQuickSearch();
            }
        });

        // Window resize handling
        window.addEventListener('resize', Utils.debounce(() => {
            // Handle responsive adjustments
            this.handleResize();
        }, 250));
    }

    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!mobileMenuButton || !mobileMenuOverlay) return;

        // Open mobile menu
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('hidden');
            mobileMenu.classList.remove('-translate-x-full');
            mobileMenu.classList.add('slide-in');
            document.body.classList.add('mobile-menu-open');
        });

        // Close mobile menu
        const closeMobileMenu = () => {
            mobileMenu.classList.add('-translate-x-full');
            mobileMenu.classList.remove('slide-in');
            setTimeout(() => {
                mobileMenuOverlay.classList.add('hidden');
                document.body.classList.remove('mobile-menu-open');
            }, 300);
        };

        mobileMenuClose?.addEventListener('click', closeMobileMenu);
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });

        // Close on navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]') && window.innerWidth < 768) {
                closeMobileMenu();
            }
        });
    }

    // Authentication
    loginAs(role) {
        let userData;
        
        if (role === 'terapeuta') {
            userData = { role: 'terapeuta', data: dataManager.getTerapeutas()[0] };
        } else if (role === 'supervisor') {
            userData = { role: 'supervisor', data: dataManager.getSupervisores()[0] };
        } else {
            Utils.showToast('Tipo de usuário inválido', 'error');
            return;
        }

        this.currentUser = userData;
        
        // Save login state
        Utils.saveToStorage('currentUser', userData);
        
        // Animate login transition
        this.transitionToApp();
    }

    logout() {
        // Clear user data
        this.currentUser = null;
        Utils.removeFromStorage('currentUser');
        
        // Reset application state
        this.currentView = 'dashboard';
        
        // Animate logout transition
        this.transitionToLogin();
    }

    transitionToApp() {
        const loginView = document.getElementById('login-view');
        const appView = document.getElementById('app-view');
        
        // Check if elements exist (for testing)
        if (!loginView || !appView) {
            console.log('Elements not found, skipping transition');
            this.initializeAppInterface();
            return;
        }
        
        loginView.classList.add('fade-out');
        
        setTimeout(() => {
            loginView.classList.add('hidden');
            appView.classList.remove('hidden');
            appView.classList.add('fade-in');
            
            // Initialize app interface
            this.initializeAppInterface();
        }, 500);
    }

    transitionToLogin() {
        const loginView = document.getElementById('login-view');
        const appView = document.getElementById('app-view');
        
        appView.classList.add('fade-out');
        
        setTimeout(() => {
            appView.classList.add('hidden');
            loginView.classList.remove('hidden', 'fade-out');
            loginView.classList.add('fade-in');
        }, 500);
    }

    initializeAppInterface() {
        this.updateHeader();
        this.updateSidebar();
        this.navigateTo('dashboard');
        
        // Refresh icons
        lucide.createIcons();
    }

    updateHeader() {
        if (!this.currentUser) return;

        const { name, avatar } = this.currentUser.data;
        const roleDisplay = this.currentUser.role === 'terapeuta' ? 'Terapeuta' : 'Supervisor';
        
        // Safe element updates
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const sidebarUserName = document.getElementById('sidebar-user-name');
        const sidebarUserRole = document.getElementById('sidebar-user-role');
        
        if (userAvatar) userAvatar.src = avatar;
        if (userName) userName.textContent = name;
        if (userRole) userRole.textContent = roleDisplay;
        if (sidebarUserName) sidebarUserName.textContent = name;
        if (sidebarUserRole) sidebarUserRole.textContent = roleDisplay;
    }

    updateSidebar() {
        const nav = document.getElementById('sidebar-nav');
        const mobileNav = document.getElementById('mobile-nav');
        
        // Check if elements exist
        if (!nav) {
            console.log('Sidebar nav not found, skipping sidebar update');
            return;
        }
        
        const role = this.currentUser.role;
        
        let navItems = `
            <a href="#" data-navigate="dashboard" class="nav-item" data-view="dashboard">
                <i data-lucide="layout-dashboard" class="nav-icon"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" data-navigate="calendario" class="nav-item" data-view="calendario">
                <i data-lucide="calendar" class="nav-icon"></i>
                <span>Calendário</span>
            </a>
        `;
        
        if (role === 'supervisor') {
            navItems += `
                <a href="#" data-navigate="pacientes" class="nav-item" data-view="pacientes">
                    <i data-lucide="users" class="nav-icon"></i>
                    <span>Pacientes</span>
                </a>
                <a href="#" data-navigate="terapeutas" class="nav-item" data-view="terapeutas">
                    <i data-lucide="user-cog" class="nav-icon"></i>
                    <span>Terapeutas</span>
                </a>
                <a href="#" data-navigate="relatorios" class="nav-item" data-view="relatorios">
                    <i data-lucide="bar-chart-3" class="nav-icon"></i>
                    <span>Relatórios</span>
                </a>
            `;
        } else {
            navItems += `
                <a href="#" data-navigate="meus-pacientes" class="nav-item" data-view="meus-pacientes">
                    <i data-lucide="users" class="nav-icon"></i>
                    <span>Meus Pacientes</span>
                </a>
                <a href="#" data-navigate="disponibilidades" class="nav-item" data-view="disponibilidades">
                    <i data-lucide="clock" class="nav-icon"></i>
                    <span>Disponibilidades</span>
                </a>
            `;
        }
        
        nav.innerHTML = navItems;
        if (mobileNav) mobileNav.innerHTML = navItems;
        
        lucide.createIcons();
        this.updateActiveNavItem();
    }

    updateActiveNavItem() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === this.currentView) {
                item.classList.add('active');
            }
        });
    }

    // Navigation
    navigateTo(view) {
        this.currentView = view;
        
        const viewTitles = {
            dashboard: 'Dashboard',
            calendario: 'Calendário & Agendamentos',
            pacientes: 'Gestão de Pacientes',
            terapeutas: 'Equipe de Terapeutas',
            relatorios: 'Relatórios',
            'meus-pacientes': 'Meus Pacientes',
            disponibilidades: 'Minhas Disponibilidades'
        };
        
        document.getElementById('page-title').textContent = viewTitles[view] || 'CliniAgende';
        this.updateActiveNavItem();
        
        const contentArea = document.getElementById('main-content');
        Utils.showLoading(true);
        
        // Small delay for better UX
        setTimeout(() => {
            this.renderView(view, contentArea);
            Utils.showLoading(false);
            lucide.createIcons();
        }, 200);
    }

    renderView(view, container) {
        switch (view) {
            case 'dashboard':
                container.innerHTML = this.renderDashboard();
                break;
            case 'calendario':
                container.innerHTML = '<div id="calendar-container"></div>';
                calendarManager.render();
                break;
            case 'pacientes':
                container.innerHTML = this.renderPacientesView();
                break;
            case 'terapeutas':
                container.innerHTML = this.renderTerapeutasView();
                break;
            case 'meus-pacientes':
                container.innerHTML = this.renderMeusPacientesView();
                break;
            case 'disponibilidades':
                container.innerHTML = this.renderDisponibilidadesView();
                break;
            case 'relatorios':
                container.innerHTML = this.renderRelatoriosView();
                break;
            default:
                container.innerHTML = '<div class="text-center py-12"><p class="text-slate-500">Página não encontrada</p></div>';
        }
    }

    // View renderers
    renderDashboard() {
        const stats = dataManager.getEstatisticas();
        const role = this.currentUser.role;

        if (role === 'terapeuta') {
            return this.renderTerapeutaDashboard(stats);
        } else {
            return this.renderSupervisorDashboard(stats);
        }
    }

    renderTerapeutaDashboard(stats) {
        const myAppointments = dataManager.getAgendamentos({ 
            terapeutaId: this.currentUser.data.id 
        }).filter(a => new Date(a.datetime) >= new Date().setHours(0,0,0,0));
        
        const nextAppointments = myAppointments
            .filter(a => a.status === 'agendado')
            .sort((a, b) => a.datetime - b.datetime)
            .slice(0, 3);

        const todayAppointments = myAppointments.filter(a => {
            const today = new Date();
            const appDate = new Date(a.datetime);
            return appDate.toDateString() === today.toDateString();
        });

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Today's Schedule -->
                <div class="lg:col-span-2 card">
                    <div class="card-header">
                        <div class="flex items-center justify-between">
                            <h3 class="card-title">Agenda de Hoje</h3>
                            <span class="text-sm text-slate-500">${new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        ${todayAppointments.length > 0 ? `
                            <div class="space-y-3">
                                ${todayAppointments.map(app => {
                                    const patient = dataManager.getPacienteById(app.pacienteId);
                                    return `
                                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                    ${Utils.getInitials(patient.nome)}
                                                </div>
                                                <div>
                                                    <p class="font-semibold">${patient.nome}</p>
                                                    <p class="text-sm text-slate-500">${Utils.formatTime(app.datetime)} • ${app.local}</p>
                                                </div>
                                            </div>
                                            <button onclick="openStatusUpdateModal(${app.id})" class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium hover:bg-teal-200 transition-colors">
                                                Atualizar Status
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <i data-lucide="calendar-x" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                                <p class="text-slate-500">Nenhum agendamento para hoje</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Quick Stats & Actions -->
                <div class="space-y-6">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="stat-card text-center">
                            <div class="text-2xl font-bold text-teal-600">${todayAppointments.length}</div>
                            <div class="text-xs text-slate-500">Hoje</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-2xl font-bold text-blue-600">${nextAppointments.length}</div>
                            <div class="text-xs text-slate-500">Próximos</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title text-base">Ações Rápidas</h4>
                        </div>
                        <div class="card-body space-y-3">
                            <button onclick="openAvailabilityModal()" class="w-full btn-primary">
                                <i data-lucide="plus-circle" class="w-4 h-4 inline mr-2"></i>
                                Adicionar Horário
                            </button>
                            <button onclick="App.navigateTo('calendario')" class="w-full btn-secondary">
                                <i data-lucide="calendar" class="w-4 h-4 inline mr-2"></i>
                                Ver Calendário
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Appointments -->
            ${nextAppointments.length > 0 ? `
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">Próximos Agendamentos</h3>
                    </div>
                    <div class="card-body">
                        <div class="space-y-3">
                            ${nextAppointments.map(app => {
                                const patient = dataManager.getPacienteById(app.pacienteId);
                                return `
                                    <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                                                ${Utils.getInitials(patient.nome)}
                                            </div>
                                            <div>
                                                <p class="font-semibold">${patient.nome}</p>
                                                <p class="text-sm text-slate-500">${Utils.formatDateTime(app.datetime)} • ${app.local}</p>
                                            </div>
                                        </div>
                                        <span class="text-xs text-slate-400">${Utils.getRelativeTime(app.datetime)}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderSupervisorDashboard(stats) {
        const recentAppointments = dataManager.getAgendamentos()
            .sort((a, b) => b.datetime - a.datetime)
            .slice(0, 5);

        const patientsWithoutSchedule = dataManager.getPacientes().filter(p => 
            !dataManager.getAgendamentos({ pacienteId: p.id, status: 'agendado' }).length
        );

        return `
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="stat-card">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i data-lucide="users" class="w-6 h-6 text-blue-600"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-500">Pacientes</h4>
                            <p class="text-2xl font-bold">${stats.totalPacientes}</p>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i data-lucide="calendar-check" class="w-6 h-6 text-green-600"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-500">Agendados</h4>
                            <p class="text-2xl font-bold">${stats.agendamentosAgendados}</p>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i data-lucide="clock" class="w-6 h-6 text-yellow-600"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-500">Horários Livres</h4>
                            <p class="text-2xl font-bold">${stats.disponibilidadesLivres}</p>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i data-lucide="user-cog" class="w-6 h-6 text-purple-600"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-500">Terapeutas</h4>
                            <p class="text-2xl font-bold">${stats.totalTerapeutas}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Patients Without Schedule -->
                ${patientsWithoutSchedule.length > 0 ? `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title text-red-600">Pacientes Aguardando Agendamento</h3>
                            <p class="card-subtitle">${patientsWithoutSchedule.length} pacientes precisam ser agendados</p>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                ${patientsWithoutSchedule.slice(0, 4).map(p => `
                                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p class="font-semibold text-red-900">${p.nome}</p>
                                            <p class="text-sm text-red-700">${p.diagnostico_principal}</p>
                                        </div>
                                        <button onclick="schedulePatient(${p.id})" class="px-3 py-1 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors">
                                            Agendar
                                        </button>
                                    </div>
                                `).join('')}
                                ${patientsWithoutSchedule.length > 4 ? `
                                    <button onclick="App.navigateTo('pacientes')" class="w-full text-center text-red-600 text-sm hover:text-red-800 transition-colors">
                                        Ver todos (${patientsWithoutSchedule.length - 4} restantes)
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Recent Activity -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Atividade Recente</h3>
                    </div>
                    <div class="card-body">
                        <div class="space-y-3">
                            ${recentAppointments.map(app => {
                                const patient = dataManager.getPacienteById(app.pacienteId);
                                const therapist = dataManager.getTerapeutaById(app.terapeutaId);
                                return `
                                    <div class="flex items-center gap-3 p-2">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style="background-color: ${Utils.getStatusColor(app.status)}20; color: ${Utils.getStatusColor(app.status)}">
                                            ${Utils.getInitials(patient.nome)}
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium">${patient.nome}</p>
                                            <p class="text-xs text-slate-500">${therapist.name} • ${Utils.getRelativeTime(app.datetime)}</p>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full" style="background-color: ${Utils.getStatusColor(app.status)}20; color: ${Utils.getStatusColor(app.status)}">
                                            ${app.status}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPacientesView() {
        const patients = dataManager.getPacientes();
        
        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 class="card-title">Lista de Pacientes</h3>
                            <p class="card-subtitle">${patients.length} pacientes cadastrados</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="this.exportPatientsData('csv')" class="btn-secondary text-sm">
                                <i data-lucide="download" class="w-4 h-4 inline mr-1"></i>
                                Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${patients.map(patient => {
                            const appointments = dataManager.getAgendamentos({ pacienteId: patient.id });
                            const nextAppointment = appointments
                                .filter(a => a.status === 'agendado' && new Date(a.datetime) > new Date())
                                .sort((a, b) => a.datetime - b.datetime)[0];
                            
                            return `
                                <div class="patient-card">
                                    <div class="flex items-start gap-3 mb-3">
                                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            ${Utils.getInitials(patient.nome)}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-semibold truncate">${patient.nome}</h4>
                                            <p class="text-sm text-slate-500">${Utils.calculateAge(patient.data_nascimento)} anos</p>
                                            <p class="text-xs text-slate-400">${patient.diagnostico_principal}</p>
                                        </div>
                                    </div>
                                    
                                    ${nextAppointment ? `
                                        <div class="text-xs text-green-600 mb-3">
                                            <i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>
                                            Próxima: ${Utils.formatDateTime(nextAppointment.datetime)}
                                        </div>
                                    ` : `
                                        <div class="text-xs text-red-600 mb-3">
                                            <i data-lucide="calendar-x" class="w-3 h-3 inline mr-1"></i>
                                            Sem agendamentos
                                        </div>
                                    `}
                                    
                                    <div class="flex gap-2">
                                        <button onclick="openPatientProfileModal(${patient.id})" class="flex-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm rounded-md transition-colors">
                                            Ver Perfil
                                        </button>
                                        <button onclick="schedulePatient(${patient.id})" class="flex-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-md transition-colors">
                                            Agendar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderTerapeutasView() {
        const therapists = dataManager.getTerapeutas();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Equipe de Terapeutas</h3>
                    <p class="card-subtitle">${therapists.length} terapeutas ativos</p>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${therapists.map(therapist => {
                            const appointments = dataManager.getAgendamentos({ terapeutaId: therapist.id });
                            const todayAppointments = appointments.filter(a => {
                                const today = new Date();
                                const appDate = new Date(a.datetime);
                                return appDate.toDateString() === today.toDateString() && a.status === 'agendado';
                            });

                            return `
                                <div class="therapist-card">
                                    <div class="flex items-center gap-4 mb-4">
                                        <img src="${therapist.avatar}" alt="${therapist.name}" class="w-16 h-16 rounded-full border-3 border-green-200">
                                        <div>
                                            <h4 class="font-bold text-lg">${therapist.name}</h4>
                                            <p class="text-sm text-slate-600">${therapist.crf}</p>
                                            <p class="text-xs text-green-600">${therapist.status}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <h5 class="text-sm font-semibold text-slate-700 mb-2">Especialidades</h5>
                                        <div class="flex flex-wrap gap-1">
                                            ${therapist.especialidades.map(esp => `
                                                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${esp}</span>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <div class="flex justify-between items-center text-sm text-slate-600 mb-4">
                                        <span>Hoje: ${todayAppointments.length} sessões</span>
                                        <span>Total: ${appointments.length} agendamentos</span>
                                    </div>

                                    <div class="flex gap-2">
                                        <button onclick="this.viewTherapistSchedule(${therapist.id})" class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors">
                                            <i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>
                                            Ver Agenda
                                        </button>
                                        <button onclick="this.contactTherapist(${therapist.id})" class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-md transition-colors">
                                            <i data-lucide="phone" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderMeusPacientesView() {
        const myAppointments = dataManager.getAgendamentos({ 
            terapeutaId: this.currentUser.data.id 
        });
        
        const myPatientIds = [...new Set(myAppointments.map(a => a.pacienteId))];
        const myPatients = myPatientIds.map(id => dataManager.getPacienteById(id));

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Meus Pacientes</h3>
                    <p class="card-subtitle">${myPatients.length} pacientes em atendimento</p>
                </div>
                <div class="card-body">
                    <div class="space-y-4">
                        ${myPatients.map(patient => {
                            const patientAppointments = myAppointments.filter(a => a.pacienteId === patient.id);
                            const lastSession = patientAppointments
                                .filter(a => a.status === 'realizado')
                                .sort((a, b) => b.datetime - a.datetime)[0];
                            const nextSession = patientAppointments
                                .filter(a => a.status === 'agendado' && new Date(a.datetime) > new Date())
                                .sort((a, b) => a.datetime - b.datetime)[0];

                            return `
                                <div class="patient-card">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                ${Utils.getInitials(patient.nome)}
                                            </div>
                                            <div>
                                                <h4 class="font-semibold">${patient.nome}</h4>
                                                <p class="text-sm text-slate-500">${patient.diagnostico_principal}</p>
                                                <div class="flex gap-4 text-xs text-slate-400 mt-1">
                                                    ${lastSession ? `<span>Última: ${Utils.getRelativeTime(lastSession.datetime)}</span>` : ''}
                                                    ${nextSession ? `<span>Próxima: ${Utils.getRelativeTime(nextSession.datetime)}</span>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex gap-2">
                                            <button onclick="openPatientProfileModal(${patient.id})" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm rounded-md transition-colors">
                                                Ver Perfil
                                            </button>
                                            ${nextSession ? `
                                                <button onclick="openStatusUpdateModal(${nextSession.id})" class="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-md transition-colors">
                                                    Próxima Sessão
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${myPatients.length === 0 ? `
                            <div class="empty-state">
                                <i data-lucide="users" class="empty-state-icon"></i>
                                <h3 class="empty-state-title">Nenhum paciente ainda</h3>
                                <p class="empty-state-description">Você ainda não possui pacientes agendados.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderDisponibilidadesView() {
        const myAvailabilities = dataManager.getDisponibilidades({ 
            terapeutaId: this.currentUser.data.id 
        });

        const futureAvailabilities = myAvailabilities
            .filter(a => new Date(a.datetime) > new Date())
            .sort((a, b) => a.datetime - b.datetime);

        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="card-title">Minhas Disponibilidades</h3>
                            <p class="card-subtitle">${futureAvailabilities.length} horários disponíveis</p>
                        </div>
                        <button onclick="openAvailabilityModal()" class="btn-primary">
                            <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                            Adicionar Horário
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${futureAvailabilities.length > 0 ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${futureAvailabilities.map(availability => `
                                <div class="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <p class="font-semibold text-green-800">${Utils.formatDate(availability.datetime)}</p>
                                            <p class="text-lg font-bold text-green-900">${Utils.formatTime(availability.datetime)}</p>
                                        </div>
                                        <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                            ${availability.duracao}min
                                        </span>
                                    </div>
                                    <p class="text-sm text-green-600">${Utils.getRelativeTime(availability.datetime)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i data-lucide="clock" class="empty-state-icon"></i>
                            <h3 class="empty-state-title">Nenhum horário disponível</h3>
                            <p class="empty-state-description">Adicione horários disponíveis para que supervisores possam agendar pacientes.</p>
                            <button onclick="openAvailabilityModal()" class="btn-primary mt-4">
                                <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                                Adicionar Primeiro Horário
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderRelatoriosView() {
        const stats = dataManager.getEstatisticas();
        const appointments = dataManager.getAgendamentos();
        
        // Group appointments by month
        const appointmentsByMonth = Utils.groupBy(appointments, (apt) => {
            const date = new Date(apt.datetime);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });

        return `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="stat-card text-center">
                        <div class="text-3xl font-bold text-blue-600">${stats.totalPacientes}</div>
                        <div class="text-sm text-slate-500">Total de Pacientes</div>
                    </div>
                    <div class="stat-card text-center">
                        <div class="text-3xl font-bold text-green-600">${appointments.filter(a => a.status === 'realizado').length}</div>
                        <div class="text-sm text-slate-500">Sessões Realizadas</div>
                    </div>
                    <div class="stat-card text-center">
                        <div class="text-3xl font-bold text-red-600">${appointments.filter(a => a.status === 'cancelado').length}</div>
                        <div class="text-sm text-slate-500">Cancelamentos</div>
                    </div>
                    <div class="stat-card text-center">
                        <div class="text-3xl font-bold text-yellow-600">${Math.round((appointments.filter(a => a.status === 'realizado').length / appointments.length) * 100) || 0}%</div>
                        <div class="text-sm text-slate-500">Taxa de Comparecimento</div>
                    </div>
                </div>

                <!-- Detailed Reports -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Therapist Performance -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Performance por Terapeuta</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                ${dataManager.getTerapeutas().map(therapist => {
                                    const therapistAppointments = appointments.filter(a => a.terapeutaId === therapist.id);
                                    const realized = therapistAppointments.filter(a => a.status === 'realizado').length;
                                    const total = therapistAppointments.length;
                                    const percentage = total > 0 ? Math.round((realized / total) * 100) : 0;
                                    
                                    return `
                                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div class="flex items-center gap-3">
                                                <img src="${therapist.avatar}" class="w-10 h-10 rounded-full">
                                                <div>
                                                    <p class="font-semibold">${therapist.name}</p>
                                                    <p class="text-sm text-slate-500">${realized}/${total} sessões</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-lg font-bold text-green-600">${percentage}%</div>
                                                <div class="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div class="h-full bg-green-500 transition-all" style="width: ${percentage}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Monthly Overview -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Visão Mensal</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                ${Object.entries(appointmentsByMonth)
                                    .sort(([a], [b]) => b.localeCompare(a))
                                    .slice(0, 6)
                                    .map(([month, monthAppointments]) => {
                                        const realized = monthAppointments.filter(a => a.status === 'realizado').length;
                                        const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                                        
                                        return `
                                            <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                <div>
                                                    <p class="font-semibold capitalize">${monthName}</p>
                                                    <p class="text-sm text-slate-500">${realized} sessões realizadas</p>
                                                </div>
                                                <div class="text-2xl font-bold text-blue-600">${monthAppointments.length}</div>
                                            </div>
                                        `;
                                    }).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Export Options -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Exportar Dados</h3>
                    </div>
                    <div class="card-body">
                        <div class="flex gap-4">
                            <button onclick="this.exportReportData('appointments')" class="btn-secondary">
                                <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>
                                Agendamentos (CSV)
                            </button>
                            <button onclick="this.exportReportData('patients')" class="btn-secondary">
                                <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>
                                Pacientes (CSV)
                            </button>
                            <button onclick="this.exportReportData('full')" class="btn-secondary">
                                <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>
                                Relatório Completo (JSON)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    toggleNotifications() {
        Utils.showToast('Sistema de notificações em desenvolvimento', 'info');
    }

    handleResize() {
        // Handle responsive adjustments if needed
        if (window.innerWidth >= 768) {
            document.getElementById('mobile-menu-overlay')?.classList.add('hidden');
        }
    }

    // Export methods
    exportPatientsData(format) {
        const patients = dataManager.getPacientes().map(p => ({
            nome: p.nome,
            idade: Utils.calculateAge(p.data_nascimento),
            diagnostico: p.diagnostico_principal,
            tipo_terapia: p.tipo_terapia,
            telefone: p.telefone,
            responsavel: p.responsavel.nome,
            escola: p.escola,
            status: p.status
        }));

        if (format === 'csv') {
            Utils.downloadCSV(patients, 'pacientes.csv');
        } else {
            Utils.downloadJSON(patients, 'pacientes.json');
        }
    }

    exportReportData(type) {
        const today = new Date().toISOString().split('T')[0];
        
        switch (type) {
            case 'appointments':
                const appointments = dataManager.getAgendamentos().map(a => {
                    const patient = dataManager.getPacienteById(a.pacienteId);
                    const therapist = dataManager.getTerapeutaById(a.terapeutaId);
                    
                    return {
                        data: Utils.formatDate(a.datetime),
                        horario: Utils.formatTime(a.datetime),
                        paciente: patient?.nome,
                        terapeuta: therapist?.name,
                        tipo_terapia: a.tipoTerapia,
                        local: a.local,
                        status: a.status,
                        observacoes: a.observacoes
                    };
                });
                Utils.downloadCSV(appointments, `agendamentos_${today}.csv`);
                break;
                
            case 'patients':
                this.exportPatientsData('csv');
                break;
                
            case 'full':
                const fullReport = {
                    data_geracao: new Date().toISOString(),
                    estatisticas: dataManager.getEstatisticas(),
                    pacientes: dataManager.getPacientes(),
                    terapeutas: dataManager.getTerapeutas(),
                    agendamentos: dataManager.getAgendamentos()
                };
                Utils.downloadJSON(fullReport, `relatorio_completo_${today}.json`);
                break;
        }
    }

    viewTherapistSchedule(therapistId) {
        calendarManager.updateFilter('terapeutaId', therapistId);
        this.navigateTo('calendario');
    }

    contactTherapist(therapistId) {
        const therapist = dataManager.getTerapeutaById(therapistId);
        if (therapist?.telefone) {
            window.open(`tel:${therapist.telefone}`, '_self');
        } else {
            Utils.showToast('Telefone não disponível', 'warning');
        }
    }
}

// Global instance
const App = new Application();