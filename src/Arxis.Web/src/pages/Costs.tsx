import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Chip,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Savings,
  QueryStats,
  Assessment,
  Payments,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

interface ScenarioState {
  costVariation: number;
  scheduleImpact: number;
  materialInflation: number;
}

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const baseline = {
  totalBudget: 128_000_000,
  committed: 74_500_000,
  actual: 58_200_000,
  projectedEnd: 131_800_000,
};

const categoryBreakdown = [
  { category: 'Estruturas', planned: 32, actual: 34 },
  { category: 'Acabamentos', planned: 24, actual: 21 },
  { category: 'Instalações', planned: 18, actual: 19 },
  { category: 'Infraestrutura', planned: 16, actual: 17 },
  { category: 'Mobilização', planned: 10, actual: 7 },
];

const cashFlowSeries = [
  { month: 'Jan/26', planned: 9.2, actual: 9.1, forecast: 9.4 },
  { month: 'Fev/26', planned: 10.4, actual: 10.2, forecast: 10.8 },
  { month: 'Mar/26', planned: 11.6, actual: 11.9, forecast: 12.4 },
  { month: 'Abr/26', planned: 12.1, actual: 12.4, forecast: 12.9 },
  { month: 'Mai/26', planned: 12.8, actual: 13.6, forecast: 14.3 },
  { month: 'Jun/26', planned: 13.3, actual: 14.8, forecast: 15.2 },
];

const deviationHotspots = [
  {
    title: 'Pacote concreto fck45',
    variance: '+6,4%',
    reason: 'Reposição de estoque com frete adicional',
    owner: 'Suprimentos',
  },
  {
    title: 'Mão de obra elétrica',
    variance: '+4,2%',
    reason: 'Horas extras para adequação a norma',
    owner: 'Coordenação Instalações',
  },
  {
    title: 'Acabamento fachada',
    variance: '-3,1%',
    reason: 'Negociação com fornecedor e otimização de perdas',
    owner: 'Planejamento',
  },
];

const fundingMix = [
  { channel: 'Capital próprio', value: 35 },
  { channel: 'Financiamento bancário', value: 45 },
  { channel: 'Incentivos fiscais', value: 12 },
  { channel: 'Parcerias comerciais', value: 8 },
];

const scenarioPresets: Record<string, ScenarioState> = {
  conservador: { costVariation: 3, scheduleImpact: 2, materialInflation: 5 },
  base: { costVariation: 6, scheduleImpact: 4, materialInflation: 8 },
  agressivo: { costVariation: 9, scheduleImpact: 1, materialInflation: 11 },
};

export const Costs: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioState>(scenarioPresets.base);
  const [preset, setPreset] = useState<'conservador' | 'base' | 'agressivo'>('base');

  const scenarioImpact = useMemo(() => {
    const base = baseline.projectedEnd;
    const costImpact = (baseline.totalBudget * scenario.costVariation) / 100;
    const schedulePenalty = (baseline.totalBudget * scenario.scheduleImpact) / 100;
    const inflationImpact = (baseline.totalBudget * scenario.materialInflation) / 100;

    return {
      newProjection: base + costImpact + schedulePenalty + inflationImpact,
      delta: costImpact + schedulePenalty + inflationImpact,
      costImpact,
      schedulePenalty,
      inflationImpact,
    };
  }, [scenario]);

  const handleScenarioChange = (patch: Partial<ScenarioState>) => {
    const next = { ...scenario, ...patch };
    setScenario(next);
    setPreset('base');
  };

  const applyPreset = (_event: React.MouseEvent<HTMLElement>, value: 'conservador' | 'base' | 'agressivo' | null) => {
    if (!value) return;
    setPreset(value);
    setScenario(scenarioPresets[value]);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Controle Financeiro Integrado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consolide orçamento, medições e projeções de caixa com simulações em tempo real.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<AccountBalance color="primary" />} title="Orçamento aprovado" subheader="Total alocado para a obra" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>{currency(baseline.totalBudget)}</Typography>
                <Typography variant="body2" color="text.secondary">Inclui contratos firmados e contingência.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<TrendingUp color="success" />} title="Gasto realizado" subheader="Notas fiscais + medições" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>{currency(baseline.actual)}</Typography>
                <Typography variant="body2" color="text.secondary">Atualizado com integrações ERP / Arxis.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<Savings color="secondary" />} title="Comprometido" subheader="Pedidos de compra e contratos" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>{currency(baseline.committed)}</Typography>
                <Typography variant="body2" color="text.secondary">Inclui reservas e aditivos em aprovação.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<QueryStats color="warning" />} title="Projeção de término" subheader="Com impactos e ajustes" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>{currency(baseline.projectedEnd)}</Typography>
                <Typography variant="body2" color="text.secondary">Simulação considerando riscos conhecidos.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Comparativo planejado vs realizado" subheader="Valores em milhões de reais" />
              <CardContent>
                <Box height={310}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value?: number) => `${value ?? 0} mi`} />
                      <Legend />
                      <Bar name="Planejado" dataKey="planned" fill="#1976d2" radius={[6, 6, 0, 0]} />
                      <Bar name="Realizado" dataKey="actual" fill="#2e7d32" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Hotspots de variação" />
              <CardContent>
                <List>
                  {deviationHotspots.map((item) => (
                    <React.Fragment key={item.title}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight={600}>{item.title}</Typography>
                              <Chip label={item.variance} color={item.variance.startsWith('-') ? 'success' : 'error'} size="small" />
                            </Stack>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">{item.reason}</Typography>
                              <Typography variant="caption" color="text.secondary">Responsável: {item.owner}</Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Simulador de cenários" subheader="Ajuste hipóteses para prever o impacto no resultado final" />
              <CardContent>
                <Stack spacing={3}>
                  <ToggleButtonGroup exclusive value={preset} onChange={applyPreset} size="small">
                    <ToggleButton value="conservador">Conservador</ToggleButton>
                    <ToggleButton value="base">Base</ToggleButton>
                    <ToggleButton value="agressivo">Agressivo</ToggleButton>
                  </ToggleButtonGroup>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Variação de custos diretos</Typography>
                    <Slider value={scenario.costVariation} onChange={(_event, value) => handleScenarioChange({ costVariation: value as number })} step={1} min={0} max={15} valueLabelDisplay="auto" />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Impacto de cronograma (dias)
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Convertido em impacto financeiro estimado
                      </Typography>
                    </Typography>
                    <Slider value={scenario.scheduleImpact} onChange={(_event, value) => handleScenarioChange({ scheduleImpact: value as number })} step={1} min={0} max={10} valueLabelDisplay="auto" />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Inflação de materiais estratégicos</Typography>
                    <Slider value={scenario.materialInflation} onChange={(_event, value) => handleScenarioChange({ materialInflation: value as number })} step={1} min={0} max={15} valueLabelDisplay="auto" />
                  </Stack>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">Nova projeção total</Typography>
                        <Typography variant="h6" fontWeight={700}>{currency(scenarioImpact.newProjection)}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Variação acumulada</Typography>
                        <Typography variant="body1" color={scenarioImpact.delta > 0 ? 'error.main' : 'success.main'}>
                          {scenarioImpact.delta > 0 ? '+' : ''}{currency(scenarioImpact.delta)}
                        </Typography>
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <Chip icon={<Payments fontSize="small" />} label={`Custos: ${currency(scenarioImpact.costImpact)}`} color="primary" variant="outlined" />
                        <Chip icon={<Assessment fontSize="small" />} label={`Cronograma: ${currency(scenarioImpact.schedulePenalty)}`} color="secondary" variant="outlined" />
                        <Chip icon={<TrendingUp fontSize="small" />} label={`Inflação: ${currency(scenarioImpact.inflationImpact)}`} color="warning" variant="outlined" />
                      </Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Fluxo de caixa previsto" subheader="Valores em milhões, incluindo tendência preditiva" />
              <CardContent>
                <Box height={310}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowSeries}>
                      <defs>
                        <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ed6c02" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value?: number) => `${value ?? 0} mi`} />
                      <Legend />
                      <Area type="monotone" dataKey="planned" stroke="#1976d2" fill="url(#colorPlanned)" name="Planejado" />
                      <Area type="monotone" dataKey="actual" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.15} name="Realizado" />
                      <Area type="monotone" dataKey="forecast" stroke="#ed6c02" fill="url(#colorForecast)" name="Preditivo" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={2}>
          <CardHeader title="Estrutura de funding e capital" subheader="Distribuição dos recursos do projeto" />
          <CardContent>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fundingMix}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value?: number) => `${value ?? 0}%`} />
                  <Line type="monotone" dataKey="value" stroke="#9c27b0" strokeWidth={2} name="Participação" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
