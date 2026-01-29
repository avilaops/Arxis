import React, { useMemo, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  BugReport,
  CheckCircle,
  WarningAmber,
  Event,
  TrendingUp,
  CorporateFare,
  Insights,
  Map,
} from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface RiskHeatmapItem {
  category: string;
  indicator: string;
  owner: string;
  level: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  sla: string;
  severity: 'P1' | 'P2' | 'P3';
}

interface UpcomingItem {
  id: string;
  title: string;
  date: string;
  type: 'Marco' | 'Entrega' | 'Inspeção';
  owner: string;
}

interface PortfolioProject {
  id: string;
  name: string;
  status: 'No prazo' | 'Atenção' | 'Crítico';
  region: string;
  owner: string;
  deviation: string;
}

const severityColorMap: Record<RiskHeatmapItem['level'], string> = {
  low: '#81c784',
  medium: '#ffb74d',
  high: '#fb8c00',
  critical: '#e53935',
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={2}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const RiskHeatmap: React.FC<{ data: RiskHeatmapItem[] }> = ({ data }) => (
  <Grid container spacing={2}>
    {data.map((item) => (
      <Grid key={item.category} item xs={12} sm={6} md={3}>
        <Card sx={{ borderTop: `4px solid ${severityColorMap[item.level]}` }}>
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.category}
              </Typography>
              <Typography variant="h6">{item.indicator}</Typography>
              <Chip
                label={item.level.toUpperCase()}
                size="small"
                sx={{ alignSelf: 'flex-start', bgcolor: severityColorMap[item.level], color: 'black' }}
              />
              <Typography variant="caption" color="text.secondary">
                Responsável: {item.owner}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const CriticalAlerts: React.FC<{ alerts: AlertItem[] }> = ({ alerts }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Alertas críticos
      </Typography>
      <List>
        {alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <WarningAmber color={alert.severity === 'P1' ? 'error' : alert.severity === 'P2' ? 'warning' : 'info'} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">{alert.title}</Typography>
                    <Chip label={alert.severity} color={alert.severity === 'P1' ? 'error' : 'warning'} size="small" />
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {alert.description}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      SLA: {alert.sla}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < alerts.length - 1 ? <Divider component="li" /> : null}
          </React.Fragment>
        ))}
      </List>
    </CardContent>
  </Card>
);

const UpcomingHighlights: React.FC<{ items: UpcomingItem[] }> = ({ items }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Próximos 7 dias
      </Typography>
      <List>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemIcon>
                <Event color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={
                  <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                    <Typography variant="body2" color="text.secondary">
                      {item.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Responsável: {item.owner}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
            {index < items.length - 1 ? <Divider component="li" /> : null}
          </React.Fragment>
        ))}
      </List>
    </CardContent>
  </Card>
);

const PortfolioOverviewCard: React.FC<{ projects: PortfolioProject[] }> = ({ projects }) => (
  <Card>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Insights color="primary" />
        <Typography variant="h6">Ranking de obras</Typography>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Obra</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Região</TableCell>
            <TableCell>Gestor</TableCell>
            <TableCell align="right">Desvio prazo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} hover>
              <TableCell>{project.name}</TableCell>
              <TableCell>
                <Chip
                  label={project.status}
                  color={project.status === 'Crítico' ? 'error' : project.status === 'Atenção' ? 'warning' : 'success'}
                  size="small"
                />
              </TableCell>
              <TableCell>{project.region}</TableCell>
              <TableCell>{project.owner}</TableCell>
              <TableCell align="right">{project.deviation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const PortfolioSummary: React.FC = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Portfólio corporativo
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <KPICard title="Obras ativas" value="18" icon={<CorporateFare />} color="#1976d2" subtitle="Portfólio 2025" />
          <KPICard title="Aderência cronograma" value="87%" icon={<TrendingUp />} color="#2e7d32" subtitle="Meta 90%" />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Capacidade por região</Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Sudeste (45%)
            </Typography>
            <LinearProgress variant="determinate" value={45} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Sul (25%)
            </Typography>
            <LinearProgress variant="determinate" value={25} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Nordeste (20%)
            </Typography>
            <LinearProgress variant="determinate" value={20} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Centro-Oeste (10%)
            </Typography>
            <LinearProgress variant="determinate" value={10} />
          </Box>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const ProjectOverview: React.FC<{
  kpis: KPICardProps[];
  heatmap: RiskHeatmapItem[];
  alerts: AlertItem[];
  upcoming: UpcomingItem[];
}> = ({ kpis, heatmap, alerts, upcoming }) => (
  <Box>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {kpis.map((kpi) => (
        <Grid key={kpi.title} item xs={12} sm={6} md={3}>
          <KPICard {...kpi} />
        </Grid>
      ))}
    </Grid>

    <Grid container spacing={3}>
      <Grid item xs={12} lg={7}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Map color="primary" />
              <Typography variant="h6">Heatmap de riscos</Typography>
            </Stack>
            <RiskHeatmap data={heatmap} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} lg={5}>
        <CriticalAlerts alerts={alerts} />
      </Grid>
      <Grid item xs={12}>
        <UpcomingHighlights items={upcoming} />
      </Grid>
    </Grid>
  </Box>
);

const PortfolioOverview: React.FC<{ projects: PortfolioProject[] }> = ({ projects }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <PortfolioSummary />
    </Grid>
    <Grid item xs={12} md={6}>
      <PortfolioOverviewCard projects={projects} />
    </Grid>
  </Grid>
);

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'project' | 'portfolio'>('project');

  const projectKpis = useMemo(
    (): KPICardProps[] => [
      { title: 'Prazo', value: '68% concluído', icon: (<Assignment />), color: '#1976d2', subtitle: 'Baseline 2 vs real' },
      { title: 'Custo planejado x real', value: 'R$ 24,8M', icon: (<TrendingUp />), color: '#2e7d32', subtitle: 'Desvio: +3,2%' },
      { title: 'Issues abertas', value: 7, icon: (<BugReport />), color: '#f44336', subtitle: '3 críticas aguardando ação' },
      { title: 'Tarefas concluídas', value: 156, icon: (<CheckCircle />), color: '#4caf50', subtitle: 'Últimos 30 dias' },
    ],
    [],
  );

  const riskMatrix = useMemo(
    (): RiskHeatmapItem[] => [
      { category: 'Cronograma', indicator: 'Atraso execução fachadas (12d)', owner: 'Planejamento', level: 'critical' },
      { category: 'Custos', indicator: 'Concreto usinado +8%', owner: 'Suprimentos', level: 'high' },
      { category: 'Suprimentos', indicator: 'Aço CA50 estoque 10d', owner: 'Compras', level: 'medium' },
      { category: 'Qualidade', indicator: 'NC acabamento pav. 14', owner: 'Qualidade', level: 'medium' },
    ],
    [],
  );

  const criticalAlerts = useMemo(
    (): AlertItem[] => [
      {
        id: '1',
        title: 'Aprovação de mudança estrutural',
        description: 'Pendência com engenharia central. Bloco B sem liberação para concretagem.',
        sla: 'Vence em 4 horas',
        severity: 'P1',
      },
      {
        id: '2',
        title: 'RFI 237 - Detalhe fachada',
        description: 'Cliente precisa validar material alternativo.',
        sla: 'Vence amanhã',
        severity: 'P2',
      },
      {
        id: '3',
        title: 'Checklist segurança pav. 09',
        description: 'Itens reprovados aguardando correção (EPI).',
        sla: 'Vence em 2 dias',
        severity: 'P2',
      },
    ],
    [],
  );

  const upcomingHighlights = useMemo(
    (): UpcomingItem[] => [
      { id: '1', title: 'Concretagem pavimento 12', date: '27 Dez', type: 'Marco', owner: 'Equipe Estrutura' },
      { id: '2', title: 'Entrega nível 03 instalações', date: '29 Dez', type: 'Entrega', owner: 'Instalações' },
      { id: '3', title: 'Inspeção cliente - bloco A', date: '30 Dez', type: 'Inspeção', owner: 'Cliente XPTO' },
    ],
    [],
  );

  const portfolioProjects = useMemo(
    (): PortfolioProject[] => [
      { id: '1', name: 'Hospital Vida Plena', status: 'Crítico', region: 'SP', owner: 'Carla Martins', deviation: '-18 dias' },
      { id: '2', name: 'Residencial Atlântico', status: 'Atenção', region: 'RJ', owner: 'Lucas Oliveira', deviation: '-6 dias' },
      { id: '3', name: 'Data Center Norte', status: 'No prazo', region: 'DF', owner: 'Renata Costa', deviation: '+2 dias' },
      { id: '4', name: 'Fábrica TechParts', status: 'No prazo', region: 'MG', owner: 'Tiago Alves', deviation: '+4 dias' },
    ],
    [],
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Chip label="Project Overview" color={activeView === 'project' ? 'primary' : 'default'} variant="outlined" />
        <Chip label="Portfolio Overview" color={activeView === 'portfolio' ? 'primary' : 'default'} variant="outlined" />
      </Stack>
      <Typography variant="body1" color="text.secondary" paragraph>
        Visão geral da obra e do portfólio com os principais indicadores do ARXIS.
      </Typography>

      <Tabs
        value={activeView}
        onChange={(_event, value) => setActiveView(value)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Project Overview" value="project" />
        <Tab label="Portfolio Overview" value="portfolio" />
      </Tabs>

      {activeView === 'project' ? (
        <ProjectOverview kpis={projectKpis} heatmap={riskMatrix} alerts={criticalAlerts} upcoming={upcomingHighlights} />
      ) : null}

      {activeView === 'portfolio' ? <PortfolioOverview projects={portfolioProjects} /> : null}
    </Box>
  );
};
