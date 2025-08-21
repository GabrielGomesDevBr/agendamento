# CliniAgende v4 - Sistema de Agendamento para Clínica de Terapia Infantil

## 🎯 Visão Geral

O CliniAgende v4 é um MVP robusto de sistema de agendamento desenvolvido especificamente para clínicas de terapia infantil. O sistema permite que terapeutas gerenciem suas disponibilidades e supervisores coordenem agendamentos de pacientes de forma eficiente.

## ✨ Principais Melhorias Implementadas

### Estrutura Modularizada
- **HTML:** Index principal limpo e semântico
- **CSS:** Arquivos separados (main.css, components.css, responsive.css)
- **JavaScript:** Módulos especializados (app.js, data.js, calendar.js, forms.js, utils.js)
- **Dados:** Arquivos JSON simulando um banco de dados real

### Dados Expandidos
- **6 Terapeutas** com especialidades, horários de trabalho e informações de contato
- **7 Pacientes** com dados completos (diagnósticos, preferências, gatilhos, responsáveis)
- **8 Tipos de Terapia** (ABA, Fonoaudiologia, Terapia Ocupacional, etc.)
- **2 Supervisores** com equipes supervisionadas

### Formulários Avançados
- **Formulário de Paciente Completo:**
  - Dados pessoais (CPF, endereço, idade)
  - Informações médicas (diagnósticos, medicações, alergias)
  - Dados terapêuticos (tipo de terapia, preferências, gatilhos)
  - Informações do responsável legal
  - Estratégias eficazes para o atendimento

### Dashboard Inteligente
- **Para Terapeutas:**
  - Agenda do dia com ações rápidas
  - Estatísticas pessoais de sessões
  - Lista de próximos agendamentos
  - Acesso rápido para adicionar disponibilidades

- **Para Supervisores:**
  - Métricas gerais da clínica
  - Pacientes aguardando agendamento
  - Atividade recente do sistema
  - Visão geral da equipe

### Sistema de Calendário Aprimorado
- Visualização mensal interativa
- Filtros por terapeuta, status e tipo de terapia
- Eventos coloridos por tipo de terapia
- Ações contextuais baseadas no papel do usuário

## 🚀 Funcionalidades Principais

### Para Terapeutas
- ✅ Adicionar e gerenciar disponibilidades
- ✅ Visualizar agenda pessoal
- ✅ Atualizar status das sessões (realizada/cancelada/falta)
- ✅ Acessar informações detalhadas dos pacientes
- ✅ Dashboard com métricas pessoais

### Para Supervisores
- ✅ Agendar pacientes em horários disponíveis
- ✅ Visualizar agendas de todos os terapeutas
- ✅ Gerenciar lista completa de pacientes
- ✅ Acessar perfis detalhados de pacientes
- ✅ Gerar relatórios e exportar dados
- ✅ Monitorar performance da equipe

### Funcionalidades Gerais
- ✅ Sistema de notificações toast
- ✅ Interface responsiva (mobile/tablet/desktop)
- ✅ Modais interativos para formulários
- ✅ Validação de dados em tempo real
- ✅ Sistema de filtros no calendário
- ✅ Exportação de dados (CSV/JSON)

## 📱 Interface Responsiva

- **Mobile First:** Interface otimizada para dispositivos móveis
- **Menu Lateral Colapsável:** Navegação adaptativa
- **Cards Responsivos:** Layout que se adapta ao tamanho da tela
- **Formulários Otimizados:** Campos empilhados em telas menores

## 🎨 Design System

### Cores Principais
- **Teal (#0EA5E9):** Ações primárias e elementos de destaque
- **Cyan (#06B6D4):** Funções de supervisão
- **Green (#10B981):** Estados positivos e disponibilidades
- **Red (#EF4444):** Alertas e cancelamentos

### Componentes
- **Cards:** Interface limpa com shadows sutis
- **Botões:** Estados de hover e foco bem definidos
- **Formulários:** Validação visual e mensagens de erro
- **Toast:** Notificações não-intrusivas

## 📊 Dados Simulados

### Terapeutas (6)
1. Dra. Ana Paula Sousa (ABA, Terapia Ocupacional)
2. Dr. Carlos Eduardo Lima (Psicoterapia Individual, Terapia Familiar)
3. Dra. Marina Santos Silva (Fonoaudiologia, Musicoterapia)
4. Dr. João Pedro Oliveira (Psicomotricidade, Terapia em Grupo)
5. Dra. Fernanda Costa Reis (ABA, Análise Funcional)
6. Dra. Beatriz Almeida (Terapia Ocupacional, Integração Sensorial)

### Pacientes (7)
- Variados diagnósticos: TDAH, TEA, Ansiedade, Atraso Global
- Idades entre 5-10 anos
- Dados completos incluindo preferências e estratégias

### Tipos de Terapia (8)
- ABA, Terapia Ocupacional, Fonoaudiologia
- Psicoterapia Individual, Terapia Familiar, Terapia em Grupo
- Musicoterapia, Psicomotricidade

## 🛠️ Estrutura de Arquivos

```
/agendamento_clinica/
├── index.html              # Página principal
├── css/
│   ├── main.css            # Estilos principais
│   ├── components.css      # Componentes UI
│   └── responsive.css      # Media queries
├── js/
│   ├── app.js             # Aplicação principal
│   ├── data.js            # Gerenciamento de dados
│   ├── calendar.js        # Funcionalidades do calendário
│   ├── forms.js           # Modais e formulários
│   └── utils.js           # Funções utilitárias
├── data/
│   ├── terapeutas.json    # Dados dos terapeutas
│   ├── supervisores.json  # Dados dos supervisores
│   ├── pacientes.json     # Dados dos pacientes
│   └── tipos_terapia.json # Tipos de terapia
└── README.md              # Documentação
```

## 🔧 Como Usar

1. **Abrir o arquivo `index.html` no navegador**
2. **Escolher o tipo de usuário:** Terapeuta ou Supervisor
3. **Navegar pelas funcionalidades:**
   - Dashboard para visão geral
   - Calendário para agendamentos
   - Seções específicas por papel

### Login Demo
- **Terapeuta:** Dra. Ana Paula Sousa
- **Supervisor:** Mariana Costa Santos

## 🎯 Próximos Passos

### Implementação com Backend
1. **Database PostgreSQL** para persistência de dados
2. **API RESTful** para comunicação cliente-servidor
3. **Autenticação JWT** para segurança
4. **WebSocket** para notificações em tempo real

### Funcionalidades Futuras
- Sistema de lembretes por email/SMS
- Integração com calendário externo (Google Calendar)
- Relatórios financeiros e faturamento
- Prontuário eletrônico
- Videoconferência para sessões online
- App mobile nativo

## 💡 Melhorias Implementadas vs MVP Original

### ✅ Melhorias de UX/UI
- Interface mais moderna e profissional
- Navegação intuitiva e responsiva
- Feedback visual para todas as ações
- Loading states e animações suaves

### ✅ Funcionalidades Expandidas
- Dados muito mais completos e realistas
- Sistema de filtros no calendário
- Perfis detalhados de pacientes
- Dashboard específico por papel
- Validação de formulários
- Exportação de dados

### ✅ Arquitetura Melhorada
- Código modularizado e organizando
- Separação clara de responsabilidades
- Reutilização de componentes
- Facilita manutenção e expansão

## 📈 Métricas do Sistema

- **Performance:** Carregamento rápido sem dependências pesadas
- **Acessibilidade:** Contraste adequado e navegação por teclado
- **Responsividade:** Funciona em dispositivos de 320px a 1920px
- **Usabilidade:** Interface intuitiva com feedback visual constante

---

**CliniAgende v4** - Desenvolvido como MVP para demonstração de valor e validação de funcionalidades para clínicas de terapia infantil.