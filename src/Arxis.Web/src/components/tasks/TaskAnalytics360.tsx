import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assessment,
  WarningAmber,
  AvTimer,
  AutoGraph,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export interface TaskAnalyticsData {
  completionRate: number;
  overdueTasks: number;
  averageCycleTimeHours: number;
  automationCoverage: number;
  statusDistribution: { status: string; value: number }[];
  priorityDistribution: { priority: string; value: number }[];
  burndown: { date: string; planned: number; actual: number }[];
  teamLoad: { team: string; tasks: number; capacity: number }[];
}

interface TaskAnalytics360Props {
  data: TaskAnalyticsData;
}

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

export const TaskAnalytics360: React.FC<TaskAnalytics360Props> = ({ data }) => {
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Assessment color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Taxa de conclusão
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={700}>
                  {formatPercent(data.completionRate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Baseado nas últimas 4 semanas de execução.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <WarningAmber color="error" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tarefas bloqueadas
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={700}>
                  {data.overdueTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Itens com prazo crítico ou dependências.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AvTimer color="success" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Lead time médio
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={700}>
                  {data.averageCycleTimeHours}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Da criação até a entrega concluída.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AutoGraph color="secondary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Automação do fluxo
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={700}>
                  {formatPercent(data.automationCoverage)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Etapas automatizadas no workflow inteligente.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Burndown de sprint
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.burndown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#1976d2" strokeWidth={2} dot={false} name="Planejado" />
                    <Line type="monotone" dataKey="actual" stroke="#2e7d32" strokeWidth={2} name="Real" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por status
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#00b8a9" name="Tarefas" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prioridade x Volume
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ed6c02" name="Tarefas" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data.priorityDistribution.map((item) => (
                  <Chip key={item.priority} label={`${item.priority}: ${item.value}`} size="small" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Capacidade de squads (Radar)
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.teamLoad}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="team" />
                    <PolarRadiusAxis />
                    <Radar name="Capacidade" dataKey="capacity" stroke="#1976d2" fill="#1976d2" fillOpacity={0.4} />
                    <Radar name="Demandas" dataKey="tasks" stroke="#ed6c02" fill="#ed6c02" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};
