import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  BugReport,
  AttachMoney,
  CheckCircle,
  Warning,
  Refresh,
  Info,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dashboardService, { DashboardOverview } from '../services/dashboardService';
import env from '../config/env';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

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
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            padding: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const DashboardNew: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getOverview();
      setData(response);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.status === 401
        ? 'Sessão expirada. Por favor, faça login novamente.'
        : err.message || 'Erro ao carregar dados do dashboard';
      setError(errorMessage);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const { projectStats, taskStats, issueStats, budgetStats, recentProjects, timeline } = data;

  // Prepare chart data
  const projectStatusData = Object.entries(projectStats.projectsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const taskStatusData = Object.entries(taskStats.tasksByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const issueStatusData = Object.entries(issueStats.issuesByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const issueSeverityData = Object.entries(issueStats.issuesBySeverity).map(([name, value]) => ({
    name,
    value,
  }));

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Completed': 'success',
      'InProgress': 'primary',
      'OnHold': 'warning',
      'Planning': 'info',
      'Archived': 'default',
      'Cancelled': 'error',
    };
    return statusColors[status] || 'default';
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bem-vindo ao {env.appName} - {env.companyName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <MuiTooltip title="Atualizar dados">
            <IconButton onClick={loadDashboardData} color="primary">
              <Refresh />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="Informações">
            <IconButton color="primary">
              <Info />
            </IconButton>
          </MuiTooltip>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total de Projetos"
            value={projectStats.totalProjects}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle={`${projectStats.activeProjects} ativos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Tarefas"
            value={taskStats.totalTasks}
            icon={<Assignment sx={{ color: 'white' }} />}
            color="#2e7d32"
            subtitle={`${taskStats.completionRate}% concluídas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Issues"
            value={issueStats.totalIssues}
            icon={<BugReport sx={{ color: 'white' }} />}
            color="#ed6c02"
            subtitle={`${issueStats.openIssues} abertas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Orçamento Total"
            value={`R$ ${budgetStats.totalBudget.toLocaleString('pt-BR')}`}
            icon={<AttachMoney sx={{ color: 'white' }} />}
            color="#9c27b0"
            subtitle={`${budgetStats.spentPercentage}% gasto`}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Projetos por Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {projectStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Task Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tarefas por Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Issue Severity Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Issues por Severidade
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issueSeverityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {issueSeverityData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Issue Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Issues por Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ed6c02" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Projects Progress and Timeline */}
      <Grid container spacing={3}>
        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Projetos Recentes
            </Typography>
            <List>
              {recentProjects.slice(0, 5).map((project, index) => (
                <React.Fragment key={project.projectId}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">{project.projectName}</Typography>
                          <Chip
                            label={project.status}
                            size="small"
                            color={getStatusColor(project.status) as any}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box mt={1}>
                          <Stack direction="row" spacing={2} mb={1}>
                            <Typography variant="caption">
                              <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                              {project.completedTasks}/{project.totalTasks} tarefas
                            </Typography>
                            {project.openIssues > 0 && (
                              <Typography variant="caption" color="error">
                                <Warning sx={{ fontSize: 14, mr: 0.5 }} />
                                {project.openIssues} issues
                              </Typography>
                            )}
                          </Stack>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption">Progresso</Typography>
                              <Typography variant="caption">
                                {project.completionPercentage}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={project.completionPercentage}
                              color={project.isOverdue ? 'error' : 'primary'}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Atividades Recentes
            </Typography>
            <List>
              {timeline.slice(0, 8).map((event, index) => (
                <React.Fragment key={event.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {event.projectName} • {event.action} •{' '}
                            {new Date(event.timestamp).toLocaleString('pt-BR')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardNew;
