export interface MenuOption {
  label: string
  description?: string
  action?: string
}

export interface TopBarMenu {
  id: string
  label: string
  items: MenuOption[]
}

export interface ModulePage {
  name: string
  description: string
}

export interface ModuleDefinition {
  id: string
  label: string
  path: string
  icon: string
  description: string
  pages: ModulePage[]
}

export const topBarMenus: TopBarMenu[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { label: 'Selecionar obra', description: 'Trocar entre obras ativas ou portfólios' },
      { label: 'Selecionar portfólio', description: 'Escolher portfólio corporativo' },
      { label: 'Ambientes', description: 'Alternar entre produção e homologação' },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    items: [
      { label: 'Clonar obra', description: 'Duplicar estrutura e fluxos de uma obra' },
      { label: 'Arquivar obra', description: 'Mover obra para estado arquivado' },
      { label: 'Importar dados', description: 'Subir cronogramas, WBS ou configurações' },
      { label: 'Exportar dados', description: 'Gerar pacote completo da obra atual' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Layouts de tela', description: 'Alternar entre visões padrão da plataforma' },
      { label: 'Modo claro/escuro', description: 'Alternar rapidamente o tema visual' },
      { label: 'Densidade', description: 'Ajustar densidade das tabelas e cards' },
      { label: 'Idioma', description: 'Selecionar idioma preferido' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { label: 'Importar IFC', description: 'Trazer modelos no formato IFC' },
      { label: 'Importar Revit', description: 'Subir modelos RVT' },
      { label: 'Planilhas (CSV/Excel)', description: 'Importar dados tabulares' },
      { label: 'Integração via API', description: 'Sincronizar dados por API' },
    ],
  },
  {
    id: 'field',
    label: 'Field',
    items: [
      { label: 'Diário de obra', description: 'Atalho rápido para registrar o dia' },
      { label: 'Fotos', description: 'Capturar e navegar pelas fotos do canteiro' },
      { label: 'Checklists', description: 'Executar rotinas de inspeção em campo' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Simuladores', description: 'Ferramentas para cenários de prazo e custo' },
      { label: 'Calculadoras', description: 'Utilitários para dimensionamento' },
      { label: 'Templates', description: 'Modelos de documentos e fluxos' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { label: 'Gestão de usuários', description: 'Criar e gerenciar perfis e times' },
      { label: 'Permissões', description: 'Configurar papéis por obra ou tenant' },
      { label: 'Planos', description: 'Administrar assinaturas e billing' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Central de ajuda', description: 'Abrir documentação e guias' },
      { label: 'Changelog', description: 'Ver novidades do ARXIS' },
      { label: 'Enviar feedback', description: 'Compartilhar sugestões com o time' },
      { label: 'Suporte', description: 'Abrir chamado para suporte técnico' },
    ],
  },
]

export const globalShortcuts: MenuOption[] = [
  { label: 'Search / Command Palette (Ctrl+K)', description: 'Encontre qualquer recurso no ARXIS' },
  { label: 'Notification Center', description: 'Consulte alertas de prazos, conflitos e aprovações' },
  { label: 'Perfil do usuário', description: 'Gerencie preferências pessoais e 2FA' },
]

export const activityModules: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'Dashboard',
    description: 'Visões gerais do projeto ou portfólio com KPIs e alertas críticos.',
    pages: [
      {
        name: 'Project Overview',
        description: 'Status cards, heatmap de riscos, alertas críticos e próximos 7 dias.',
      },
      {
        name: 'Portfolio Overview',
        description: 'Visão multiobra com ranking de desvios e exportação executiva.',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'Folder',
    description: 'Gestão de obras, templates, arquivamento e configurações por projeto.',
    pages: [
      {
        name: 'Projects List',
        description: 'Busca, tags, clone e arquivamento de obras.',
      },
      {
        name: 'Project Settings',
        description: 'Parâmetros específicos da obra, calendário, WBS e integrações.',
      },
    ],
  },
  {
    id: 'timeline4d',
    label: 'Timeline 4D',
    path: '/timeline',
    icon: 'Timeline',
    description: 'Cronogramas, simulações 4D e análises de produtividade.',
    pages: [
      { name: 'Gantt View', description: 'Cronograma com predecessoras, filtros e baselines.' },
      { name: '4D Simulation', description: 'Vincula o cronograma ao modelo 3D para cenários.' },
      { name: 'S-Curve & Productivity', description: 'Curvas de avanço físico e produtividade planejada.' },
    ],
  },
  {
    id: 'model3d',
    label: 'Model 3D',
    path: '/model',
    icon: 'ThreeDRotation',
    description: 'Visualização, análises e dados do modelo BIM.',
    pages: [
      { name: '3D Viewer', description: 'Navegação com cortes, filtros e views favoritas.' },
      { name: 'Clash Detection', description: 'Regras de conflito, agrupamentos e status.' },
      { name: 'Model Data Browser', description: 'Tabela de propriedades exportável.' },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks & Workflow',
    path: '/tasks',
    icon: 'Assignment',
    description: 'Boards operacionais e desenho de fluxos de aprovação.',
    pages: [
      { name: 'Task Board', description: 'Kanban com checklists, anexos e templates.' },
      { name: 'Workflow Designer', description: 'Fluxos visuais com SLA e condicional.' },
    ],
  },
  {
    id: 'field',
    label: 'Field',
    path: '/field',
    icon: 'Map',
    description: 'Rotinas do canteiro para diários, fotos e checklists móveis.',
    pages: [
      { name: 'Daily Log', description: 'Registro completo do dia, anexos e relatório PDF.' },
      { name: 'Field Checklist', description: 'Inspeções em campo com resultados e NCs.' },
      { name: 'Field Photos & Map', description: 'Galeria georreferenciada e comparativos.' },
    ],
  },
  {
    id: 'issues',
    label: 'Issues & RFI',
    path: '/issues',
    icon: 'BugReport',
    description: 'Centralização de pendências e pedidos de informação.',
    pages: [
      { name: 'Issues Board', description: 'Gestão de pendências com prioridade e SLA.' },
      { name: 'RFI Center', description: 'Fluxo completo de RFIs com histórico.' },
    ],
  },
  {
    id: 'costs',
    label: 'Costs & Budget',
    path: '/costs',
    icon: 'Paid',
    description: 'Orçamento, controle de custos e projeções financeiras.',
    pages: [
      { name: 'Budget Breakdown', description: 'Importação e revisão de orçamento por WBS.' },
      { name: 'Cost Control', description: 'Comparativo planejado vs realizado por centro de custo.' },
      { name: 'Forecast & Cash Flow', description: 'Simulações de cenários e exportações de fluxo.' },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement & Stock',
    path: '/procurement',
    icon: 'ShoppingCart',
    description: 'Requisições, pedidos de compra e controle de estoque.',
    pages: [
      { name: 'Requests', description: 'Requisições vinculadas a frentes e aprovação multinível.' },
      { name: 'Purchase Orders', description: 'Pedidos emitidos e status logístico.' },
      { name: 'Deliveries & Stock', description: 'Recebimento móvel, conferência e alertas.' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents & Contracts',
    path: '/documents',
    icon: 'Description',
    description: 'Repositório documental e gestão contratual.',
    pages: [
      { name: 'Document Library', description: 'Pastas, versões e permissões granulares.' },
      { name: 'Contract Manager', description: 'Resumo de contratos, aditivos e vínculos.' },
    ],
  },
  {
    id: 'quality',
    label: 'Quality & Safety',
    path: '/quality',
    icon: 'Security',
    description: 'Planos de qualidade, não conformidades e indicadores de segurança.',
    pages: [
      { name: 'Quality Plans', description: 'ITPs associados a checklists de campo.' },
      { name: 'Non-Conformities', description: 'Registro, plano de ação e encerramento com evidência.' },
      { name: 'Safety Board', description: 'Indicadores, incidentes e ações preventivas.' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    path: '/analytics',
    icon: 'Analytics',
    description: 'KPI builder, relatórios e exportações automáticas.',
    pages: [
      { name: 'KPI Builder', description: 'Composição de indicadores a partir de múltiplas fontes.' },
      { name: 'Report Templates', description: 'Relatórios pré-configurados e agendamento.' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    icon: 'Hub',
    description: 'Integração com BIM, ERPs, nuvens e APIs abertas.',
    pages: [
      { name: 'BIM & Design', description: 'Conectores IFC, Revit, Navisworks e similares.' },
      { name: 'ERP & Finance', description: 'Integrações com sistemas financeiros e contábeis.' },
      { name: 'Storage & Cloud', description: 'Sincronização com plataformas de arquivos.' },
      { name: 'Open API & Webhooks', description: 'Gestão de tokens e eventos do ARXIS.' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    icon: 'Storefront',
    description: 'Apresentação das soluções ARXIS, downloads e jornadas de adoção.',
    pages: [
      {
        name: 'Espaços do Usuário',
        description: 'Portal com painéis, comunicação, templates e apps móveis conectados.',
      },
      {
        name: 'Espaços Financeiros',
        description: 'Área para orçamentos, billing, integrações ERP e auditoria.',
      },
      {
        name: 'Downloads & Add-ons',
        description: 'Central para pacotes, instaladores e complementos ARXIS.',
      },
    ],
  },
  {
    id: 'stakeholders',
    label: 'Stakeholders Portal',
    path: '/stakeholders',
    icon: 'People',
    description: 'Experiência dedicada para clientes, conselho e fornecedores com dados segmentados.',
    pages: [
      {
        name: 'Visão Executiva',
        description: 'Dashboards financeiros, marcos e status de riscos para o conselho.',
      },
      {
        name: 'Portal Colaborativo',
        description: 'RFIs, contratos, checklists e comunicação bidirecional com clientes.',
      },
      {
        name: 'Experiência de Fornecedores',
        description: 'Pedidos, entregas, documentação e fluxo de aprovações integrados.',
      },
    ],
  },
  {
    id: 'automations',
    label: 'Automations',
    path: '/automations',
    icon: 'AutoAwesome',
    description: 'Regras, gatilhos e bots para automatizar fluxos.',
    pages: [
      { name: 'Rules Engine', description: 'Configuração de gatilhos do tipo se/então.' },
      { name: 'Bots & Schedulers', description: 'Rotinas automáticas e agendamentos.' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings (Project)',
    path: '/settings',
    icon: 'Tune',
    description: 'Configurações específicas da obra e layouts padrão.',
    pages: [
      { name: 'Layouts', description: 'Presets de dashboard e componentes padrão.' },
      { name: 'Permissões', description: 'Perfis e papéis do projeto.' },
      { name: 'Formatos', description: 'Moeda, datas e unidades da obra.' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin (Tenant)',
    path: '/admin',
    icon: 'AdminPanelSettings',
    description: 'Gestão corporativa da conta, billing e auditoria.',
    pages: [
      { name: 'Usuários e grupos', description: 'Administração global de equipes.' },
      { name: 'Planos e billing', description: 'Assinaturas, faturas e domínios autorizados.' },
      { name: 'Auditoria', description: 'Logs de atividades e rastreabilidade.' },
    ],
  },
]
