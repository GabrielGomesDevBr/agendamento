// Utility functions for CliniAgende v4

class Utils {
    // Loading spinner management
    static showLoading(show = true) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.toggle('hidden', !show);
        }
    }

    // Toast notification system
    static showToast(message, type = 'success', title = '', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="Utils.closeToast('${toastId}')">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => this.closeToast(toastId), duration);
    }

    static closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }

    // Modal management
    static openModal(modalHtml) {
        const container = document.getElementById('modals-container');
        if (!container) return;

        container.innerHTML = modalHtml;
        lucide.createIcons();
        
        // Focus trap and escape key handling
        this.setupModalEvents();
    }

    static closeModal() {
        const container = document.getElementById('modals-container');
        if (container) {
            const modal = container.querySelector('.modal-overlay');
            if (modal) {
                modal.classList.add('fade-out');
                setTimeout(() => {
                    container.innerHTML = '';
                }, 300);
            }
        }
    }

    static setupModalEvents() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Date formatting utilities
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Date(date).toLocaleDateString('pt-BR', formatOptions);
    }

    static formatTime(date) {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDateTime(date) {
        return this.formatDate(date, { month: 'short' }) + ' às ' + this.formatTime(date);
    }

    static getRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInMs = targetDate - now;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Hoje';
        if (diffInDays === 1) return 'Amanhã';
        if (diffInDays === -1) return 'Ontem';
        if (diffInDays > 1 && diffInDays <= 7) return `Em ${diffInDays} dias`;
        if (diffInDays < -1 && diffInDays >= -7) return `Há ${Math.abs(diffInDays)} dias`;
        
        return this.formatDate(date);
    }

    // Age calculation
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Form utilities
    static getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    static validateRequired(fields) {
        const errors = {};
        
        for (let [fieldName, value] of Object.entries(fields)) {
            if (!value || value.toString().trim() === '') {
                errors[fieldName] = 'Este campo é obrigatório';
            }
        }
        
        return errors;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf[i]) * (10 - i);
        }
        let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf[i]) * (11 - i);
        }
        let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        
        return parseInt(cpf[9]) === digit1 && parseInt(cpf[10]) === digit2;
    }

    // Formatting utilities
    static formatCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    static formatPhone(phone) {
        phone = phone.replace(/[^\d]/g, '');
        if (phone.length === 11) {
            return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Color utilities for therapy types
    static getTherapyColor(therapyType) {
        const colors = {
            'aba': '#10B981',
            'terapia_ocupacional': '#3B82F6',
            'fonoaudiologia': '#8B5CF6',
            'psicoterapia_individual': '#EF4444',
            'terapia_familiar': '#F59E0B',
            'terapia_grupo': '#06B6D4',
            'musicoterapia': '#84CC16',
            'psicomotricidade': '#EC4899'
        };
        
        return colors[therapyType] || '#6B7280';
    }

    static getStatusColor(status) {
        const colors = {
            'agendado': '#0EA5E9',
            'realizado': '#10B981',
            'cancelado': '#EF4444',
            'em_andamento': '#F59E0B',
            'faltou': '#6B7280'
        };
        
        return colors[status] || '#6B7280';
    }

    // Text utilities
    static truncateText(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    static getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Local storage utilities
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }

    // URL utilities
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }

    // Debounce utility
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Array utilities
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = (groups[item[key]] = groups[item[key]] || []);
            group.push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (order === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copiado para a área de transferência!');
            return true;
        } catch (error) {
            console.error('Erro ao copiar para clipboard:', error);
            return false;
        }
    }

    // Export utilities
    static downloadJSON(data, filename = 'data.json') {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    static downloadCSV(data, filename = 'data.csv') {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}