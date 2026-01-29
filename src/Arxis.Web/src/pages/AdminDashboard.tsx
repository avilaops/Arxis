import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5136/api';

interface DashboardMetrics {
  period: string;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  pageViews: number;
  planInterests: number;
  checkoutStarts: number;
  purchases: number;
  interestRate: number;
  conversionRate: number;
  abandonRate: number;
  topFeatures: Array<{ name: string; count: number }>;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  planBreakdown: Array<{
    planName: string;
    interests: number;
    purchases: number;
    conversionRate: number;
  }>;
}

interface RecentEvent {
  eventType: string;
  userId: string;
  timestamp: string;
  details: string;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(7);

  useEffect(() => {
    loadDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [metricsRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/dashboard/analytics/metrics?days=${period}`, config),
        axios.get(`${API_BASE_URL}/api/dashboard/analytics/recent-events?count=20`, config),
      ]);

      setMetrics(metricsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (_event: React.MouseEvent<HTMLElement>, newPeriod: number | null) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
      setLoading(true);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box p={3}>
        <Typography>Erro ao carregar dados do dashboard</Typography>
      </Box>
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          📊 Analytics Dashboard
        </Typography>

        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
        >
          <ToggleButton value={7}>7 dias</ToggleButton>
          <ToggleButton value={30}>30 dias</ToggleButton>
          <ToggleButton value={90}>90 dias</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Revenue Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatCurrency(metrics.totalRevenue)}
                  </Typography>
                </Box>
                <AttachMoney fontSize="large" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Vendas (Compras)
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.purchases}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Taxa: {formatPercent(metrics.conversionRate)}
                  </Typography>
                </Box>
                <CheckCircle fontSize="large" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Interessados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {metrics.planInterests}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    De {metrics.pageViews} visualizações
                  </Typography>
                </Box>
                <TrendingUp fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Usuários Ativos
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.activeUsers}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    De {metrics.totalUsers} total
                  </Typography>
                </Box>
                <People fontSize="large" color="action" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Conversion Funnel */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🔥 Funil de Conversão
              </Typography>

              <Box mt={2}>
                {[
                  { label: 'Visitou Pricing', value: metrics.pageViews, percent: 100 },
                  { label: 'Interessados em Plano', value: metrics.planInterests, percent: metrics.interestRate },
                  { label: 'Iniciou Checkout', value: metrics.checkoutStarts, percent: (metrics.checkoutStarts / metrics.pageViews) * 100 },
                  { label: 'Completou Compra', value: metrics.purchases, percent: metrics.conversionRate },
                ].map((step, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{step.label}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {step.value} ({formatPercent(step.percent)})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${step.percent}%`,
                          height: '100%',
                          bgcolor: index === 3 ? 'success.main' : 'primary.main',
                          transition: 'width 0.5s ease-in-out',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                💼 Performance por Plano
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Plano</TableCell>
                      <TableCell align="right">Interessados</TableCell>
                      <TableCell align="right">Vendas</TableCell>
                      <TableCell align="right">Conversão</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.planBreakdown.map((plan) => (
                      <TableRow key={plan.planName}>
                        <TableCell>
                          <Chip label={plan.planName} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{plan.interests}</TableCell>
                        <TableCell align="right">
                          <strong>{plan.purchases}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={formatPercent(plan.conversionRate)}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Events */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🎯 Atividade em Tempo Real
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Detalhes</TableCell>
                      <TableCell align="right">Quando</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.slice(0, 15).map((event, index) => {
                      const eventIcon = {
                        PlanInterest: '👀',
                        CheckoutStarted: '🛒',
                        Purchase: '💰',
                        FeatureUsed: '🔧',
                        EmailSent: '📧',
                      }[event.eventType] || '📊';

                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip
                              label={`${eventIcon} ${event.eventType}`}
                              size="small"
                              color={event.eventType === 'Purchase' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{event.userId}</TableCell>
                          <TableCell>{event.details}</TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {new Date(event.timestamp).toLocaleString('pt-BR')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
