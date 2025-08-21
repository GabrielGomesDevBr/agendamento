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
    async loginAs(role) {
        // Show login form instead of auto-login
        this.showLoginForm(role);
    }

    showLoginForm(role) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 class="text-xl font-bold mb-4">Login ${role === 'supervisor' ? 'Supervisor' : 'Terapeuta'}</h3>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" id="email" name="email" required 
                               class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-slate-700">Senha</label>
                        <input type="password" id="password" name="password" required 
                               class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                    </div>
                    <div class="text-xs text-slate-500">
                        Senha padrão para MVP: <strong>123456</strong>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e, modal);
        });
    }

    async handleLogin(e, modal) {
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';
        
        try {
            const response = await dataManager.login(email, password);
            
            this.currentUser = {
                role: response.user.role,
                data: {
                    id: response.user.id,
                    name: response.user.nome,
                    avatar: response.user.avatar || 'https://placehold.co/100x100/a7f3d0/15803d?text=' + response.user.nome.charAt(0)
                }
            };
            
            modal.remove();
            this.transitionToApp();
            
        } catch (error) {
            Utils.showToast(error.message || 'Erro no login', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    }

    logout() {
        // Clear user data
        this.currentUser = null;
        dataManager.logout();
        
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
                <a href="#" data-navigate="novo-paciente" class="nav-item" data-view="novo-paciente">
                    <i data-lucide="user-plus" class="nav-icon"></i>
                    <span>Novo Paciente</span>
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
            'novo-paciente': 'Cadastrar Novo Paciente',
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
            
            // Initialize form if it's the new patient view
            if (view === 'novo-paciente') {
                this.initializeNovoPacienteForm();
            }
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
            case 'novo-paciente':
                container.innerHTML = this.renderNovoPacienteView();
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
        // Load patients from API if not already loaded
        dataManager.getPacientes().then(patients => {
            if (this.currentView === 'pacientes') {
                // Re-render if we're still on the patients view
                setTimeout(() => {
                    this.renderView('pacientes', document.getElementById('main-content'));
                    lucide.createIcons();
                }, 100);
            }
        }).catch(error => {
            console.error('Error loading patients:', error);
        });

        const patients = dataManager.data.pacientes || [];
        
        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 class="card-title">Lista de Pacientes</h3>
                            <p class="card-subtitle">${patients.length} pacientes cadastrados</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="App.navigateTo('novo-paciente')" class="btn-primary text-sm">
                                <i data-lucide="user-plus" class="w-4 h-4 inline mr-1"></i>
                                Novo Paciente
                            </button>
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

    renderNovoPacienteView() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex items-center gap-4">
                        <button onclick="App.navigateTo('pacientes')" class="btn-secondary text-sm">
                            <i data-lucide="arrow-left" class="w-4 h-4 inline mr-1"></i>
                            Voltar
                        </button>
                        <h3 class="card-title">Cadastrar Novo Paciente</h3>
                    </div>
                </div>
                <div class="card-body">
                    <form id="novo-paciente-form" class="space-y-6">
                        <!-- Informações Básicas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Informações Básicas</h4>
                            </div>
                            <div>
                                <label for="nome" class="block text-sm font-medium text-slate-700">Nome Completo *</label>
                                <input type="text" id="nome" name="nome" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="cpf" class="block text-sm font-medium text-slate-700">CPF *</label>
                                <input type="text" id="cpf" name="cpf" required placeholder="000.000.000-00" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="data_nascimento" class="block text-sm font-medium text-slate-700">Data de Nascimento *</label>
                                <input type="date" id="data_nascimento" name="data_nascimento" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="sexo" class="block text-sm font-medium text-slate-700">Sexo *</label>
                                <select id="sexo" name="sexo" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <!-- Endereço -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Endereço</h4>
                            </div>
                            <div class="md:col-span-2">
                                <label for="endereco_rua" class="block text-sm font-medium text-slate-700">Rua e Número *</label>
                                <input type="text" id="endereco_rua" name="endereco_rua" required placeholder="Ex: Rua das Flores, 123" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="endereco_bairro" class="block text-sm font-medium text-slate-700">Bairro *</label>
                                <input type="text" id="endereco_bairro" name="endereco_bairro" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="endereco_cidade" class="block text-sm font-medium text-slate-700">Cidade *</label>
                                <input type="text" id="endereco_cidade" name="endereco_cidade" required value="São Paulo" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="endereco_cep" class="block text-sm font-medium text-slate-700">CEP *</label>
                                <input type="text" id="endereco_cep" name="endereco_cep" required placeholder="00000-000" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                        </div>

                        <!-- Contato -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Contato</h4>
                            </div>
                            <div>
                                <label for="telefone" class="block text-sm font-medium text-slate-700">Telefone *</label>
                                <input type="tel" id="telefone" name="telefone" required placeholder="(11) 91234-5678" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="email_responsavel" class="block text-sm font-medium text-slate-700">Email do Responsável *</label>
                                <input type="email" id="email_responsavel" name="email_responsavel" required placeholder="exemplo@email.com" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                        </div>

                        <!-- Responsável -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-3">
                                <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Responsável Legal</h4>
                            </div>
                            <div>
                                <label for="responsavel_nome" class="block text-sm font-medium text-slate-700">Nome do Responsável *</label>
                                <input type="text" id="responsavel_nome" name="responsavel_nome" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="responsavel_cpf" class="block text-sm font-medium text-slate-700">CPF do Responsável *</label>
                                <input type="text" id="responsavel_cpf" name="responsavel_cpf" required placeholder="000.000.000-00" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="responsavel_parentesco" class="block text-sm font-medium text-slate-700">Parentesco *</label>
                                <select id="responsavel_parentesco" name="responsavel_parentesco" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Avô">Avô</option>
                                    <option value="Avó">Avó</option>
                                    <option value="Tio">Tio</option>
                                    <option value="Tia">Tia</option>
                                    <option value="Responsável Legal">Responsável Legal</option>
                                </select>
                            </div>
                        </div>

                        <!-- Informações Clínicas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Informações Clínicas</h4>
                            </div>
                            <div>
                                <label for="diagnostico_principal" class="block text-sm font-medium text-slate-700">Diagnóstico Principal *</label>
                                <input type="text" id="diagnostico_principal" name="diagnostico_principal" required placeholder="Ex: TDAH, TEA, etc." class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                            <div>
                                <label for="tipo_terapia" class="block text-sm font-medium text-slate-700">Tipo de Terapia *</label>
                                <select id="tipo_terapia" name="tipo_terapia" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="ABA">ABA</option>
                                    <option value="Fonoaudiologia">Fonoaudiologia</option>
                                    <option value="Psicoterapia Individual">Psicoterapia Individual</option>
                                    <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                                    <option value="Psicomotricidade">Psicomotricidade</option>
                                </select>
                            </div>
                            <div>
                                <label for="frequencia_recomendada" class="block text-sm font-medium text-slate-700">Frequência Recomendada *</label>
                                <select id="frequencia_recomendada" name="frequencia_recomendada" required class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Selecione</option>
                                    <option value="1x por semana">1x por semana</option>
                                    <option value="2x por semana">2x por semana</option>
                                    <option value="3x por semana">3x por semana</option>
                                    <option value="4x por semana">4x por semana</option>
                                    <option value="5x por semana">5x por semana</option>
                                </select>
                            </div>
                            <div>
                                <label for="escola" class="block text-sm font-medium text-slate-700">Escola</label>
                                <input type="text" id="escola" name="escola" placeholder="Nome da escola" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            </div>
                        </div>

                        <!-- Informações Adicionais -->
                        <div>
                            <h4 class="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Informações Adicionais</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="medicacoes" class="block text-sm font-medium text-slate-700">Medicações</label>
                                    <textarea id="medicacoes" name="medicacoes" rows="3" placeholder="Ex: Ritalina 10mg - 1x ao dia" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                                <div>
                                    <label for="alergias" class="block text-sm font-medium text-slate-700">Alergias</label>
                                    <textarea id="alergias" name="alergias" rows="3" placeholder="Ex: Lactose, Amendoim" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label for="preferencias" class="block text-sm font-medium text-slate-700">Preferências</label>
                                    <textarea id="preferencias" name="preferencias" rows="3" placeholder="Ex: Brinquedos de encaixe, Histórias de super-heróis" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                                <div>
                                    <label for="gatilhos" class="block text-sm font-medium text-slate-700">Gatilhos</label>
                                    <textarea id="gatilhos" name="gatilhos" rows="3" placeholder="Ex: Barulhos altos, Mudanças bruscas de rotina" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <label for="observacoes" class="block text-sm font-medium text-slate-700">Observações Gerais</label>
                                <textarea id="observacoes" name="observacoes" rows="4" placeholder="Informações importantes sobre o paciente, comportamentos, estratégias eficazes..." class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>
                        </div>

                        <!-- Botões -->
                        <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onclick="App.navigateTo('pacientes')" class="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" class="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold transition-colors">
                                Cadastrar Paciente
                            </button>
                        </div>
                    </form>
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

    // Cadastro de Pacientes
    initializeNovoPacienteForm() {
        const form = document.getElementById('novo-paciente-form');
        if (!form) return;
        
        // Adicionar máscaras de formatação
        this.setupFormMasks();
        
        // Submit do formulário
        form.addEventListener('submit', (e) => this.handleNovoPacienteSubmit(e));
    }

    setupFormMasks() {
        const cpfInput = document.getElementById('cpf');
        const responsavelCpfInput = document.getElementById('responsavel_cpf');
        const telefoneInput = document.getElementById('telefone');
        const cepInput = document.getElementById('endereco_cep');
        
        // Máscaras de formatação
        const formatCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        const formatTelefone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        const formatCEP = (value) => value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
        
        cpfInput?.addEventListener('input', (e) => {
            e.target.value = formatCPF(e.target.value);
        });
        
        responsavelCpfInput?.addEventListener('input', (e) => {
            e.target.value = formatCPF(e.target.value);
        });
        
        telefoneInput?.addEventListener('input', (e) => {
            e.target.value = formatTelefone(e.target.value);
        });
        
        cepInput?.addEventListener('input', (e) => {
            e.target.value = formatCEP(e.target.value);
        });
    }

    handleNovoPacienteSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pacienteData = this.extractPatientDataFromForm(formData);
        
        // Validação
        const validationErrors = this.validatePatientData(pacienteData);
        if (validationErrors.length > 0) {
            Utils.showToast(`Erros no formulário:\n${validationErrors.join('\n')}`, 'error');
            return;
        }
        
        // Adicionar aos dados via API
        try {
            await dataManager.addPaciente(pacienteData);
            Utils.showToast('Paciente cadastrado com sucesso!', 'success');
            this.navigateTo('pacientes');
        } catch (error) {
            console.error('Erro ao cadastrar paciente:', error);
            Utils.showToast(error.message || 'Erro ao cadastrar paciente. Tente novamente.', 'error');
        }
    }

    extractPatientDataFromForm(formData) {
        return {
            id: Date.now(),
            nome: formData.get('nome'),
            cpf: formData.get('cpf'),
            data_nascimento: formData.get('data_nascimento'),
            sexo: formData.get('sexo'),
            telefone: formData.get('telefone'),
            email_responsavel: formData.get('email_responsavel'),
            diagnostico_principal: formData.get('diagnostico_principal'),
            tipo_terapia: formData.get('tipo_terapia'),
            frequencia_recomendada: formData.get('frequencia_recomendada'),
            escola: formData.get('escola') || '',
            status: 'ativo',
            endereco: {
                rua: formData.get('endereco_rua'),
                bairro: formData.get('endereco_bairro'),
                cidade: formData.get('endereco_cidade'),
                cep: formData.get('endereco_cep')
            },
            responsavel: {
                nome: formData.get('responsavel_nome'),
                cpf: formData.get('responsavel_cpf'),
                parentesco: formData.get('responsavel_parentesco')
            },
            medicacoes: this.processTextareaToArray(formData.get('medicacoes')) || ['Nenhuma'],
            alergias: this.processTextareaToArray(formData.get('alergias')) || ['Nenhuma conhecida'],
            preferencias: this.processTextareaToArray(formData.get('preferencias')) || [],
            gatilhos: this.processTextareaToArray(formData.get('gatilhos')) || [],
            observacoes: formData.get('observacoes') || '',
            diagnosticos_secundarios: [],
            estrategias_eficazes: []
        };
    }

    processTextareaToArray(text) {
        if (!text) return null;
        return text.split('\n').map(line => line.trim()).filter(line => line);
    }

    validatePatientData(data) {
        const errors = [];
        
        if (!data.nome || data.nome.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }
        
        if (!data.cpf || !this.validateCPF(data.cpf)) {
            errors.push('CPF inválido');
        }
        
        if (!data.data_nascimento) {
            errors.push('Data de nascimento é obrigatória');
        }
        
        if (!data.sexo) {
            errors.push('Sexo é obrigatório');
        }
        
        if (!data.telefone || data.telefone.length < 14) {
            errors.push('Telefone inválido');
        }
        
        if (!data.email_responsavel || !this.validateEmail(data.email_responsavel)) {
            errors.push('Email do responsável inválido');
        }
        
        if (!data.responsavel.nome || data.responsavel.nome.trim().length < 3) {
            errors.push('Nome do responsável deve ter pelo menos 3 caracteres');
        }
        
        if (!data.responsavel.cpf || !this.validateCPF(data.responsavel.cpf)) {
            errors.push('CPF do responsável inválido');
        }
        
        if (!data.diagnostico_principal || data.diagnostico_principal.trim().length < 3) {
            errors.push('Diagnóstico principal é obrigatório');
        }
        
        if (!data.tipo_terapia) {
            errors.push('Tipo de terapia é obrigatório');
        }
        
        if (!data.frequencia_recomendada) {
            errors.push('Frequência recomendada é obrigatória');
        }
        
        return errors;
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
        let digit1 = 11 - (sum % 11);
        if (digit1 > 9) digit1 = 0;
        
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
        let digit2 = 11 - (sum % 11);
        if (digit2 > 9) digit2 = 0;
        
        return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Global instance
const App = new Application();