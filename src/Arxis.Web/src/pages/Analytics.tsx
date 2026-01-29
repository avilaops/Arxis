import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
} from '@mui/material';
import {
  Insights,
  TrendingUp,
  WarningAmber,
  Science,
  QueryStats,
  AutoAwesome,
  Analytics as AnalyticsIcon,
  Timeline,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  Bar,
} from 'recharts';

const productivityForecast = [
  { week: 'Semana 1', baseline: 74, predicted: 78, lower: 72, upper: 83 },
  { week: 'Semana 2', baseline: 76, predicted: 79, lower: 73, upper: 85 },
  { week: 'Semana 3', baseline: 75, predicted: 80, lower: 74, upper: 86 },
  { week: 'Semana 4', baseline: 77, predicted: 82, lower: 75, upper: 88 },
  { week: 'Semana 5', baseline: 78, predicted: 84, lower: 76, upper: 90 },
];

const riskRadarBase = [
  { dimension: 'Prazo', actual: 62, predicted: 70 },
  { dimension: 'Custo', actual: 58, predicted: 65 },
  { dimension: 'Qualidade', actual: 74, predicted: 79 },
  { dimension: 'Segurança', actual: 81, predicted: 85 },
  { dimension: 'Satisfação', actual: 69, predicted: 76 },
];

const anomalySeries = [
  { month: 'Ago/25', expected: 12.4, real: 12.7, anomalies: 0 },
  { month: 'Set/25', expected: 12.6, real: 13.8, anomalies: 1 },
  { month: 'Out/25', expected: 12.8, real: 13.3, anomalies: 0 },
  { month: 'Nov/25', expected: 13.0, real: 14.7, anomalies: 2 },
  { month: 'Dez/25', expected: 13.2, real: 13.4, anomalies: 0 },
  { month: 'Jan/26', expected: 13.5, real: 14.2, anomalies: 1 },
];

const aiInsights = [
  {
    title: 'Risco de atraso no bloco B',
    impact: 'Médio',
    description: 'Sequência de tarefas com alta variabilidade e dependências críticas.',
    action: 'Antecipar equipe de instalações elétricas e ativar plano de contingência.',
  },
  {
    title: 'Economia potencial em acabamento',
    impact: 'Alto',
    description: 'Cenários indicam margem para renegociar 3% com fornecedor atual.',
    action: 'Acionar procurement para rodada express com fornecedores homologados.',
  },
  {
    title: 'Alertas de segurança crescente',
    impact: 'Alto',
    description: 'Churn de checklists NR-35 em modo offline aumentou 18% na última semana.',
    action: 'Direcionar task force de segurança e reforçar treinamento just-in-time.',
  },
];

const models = {
  regressao: 'Regressão multivariada c/ features de produtividade, clima e logística.',
  arvore: 'Gradient boosting calibrado com 12 meses de histórico e 92% de precisão.',
  rede: 'Rede neural temporal (LSTM) treinada em série de dados de produção e custos.',
};

export const Analytics: React.FC = () => {
  const [model, setModel] = useState<'regressao' | 'arvore' | 'rede'>('arvore');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confidence, setConfidence] = useState<number>(80);

  const radarData = useMemo(
    () =>
      riskRadarBase.map((item) => ({
        ...item,
        predicted: Math.round(item.predicted * (confidence / 80)),
      })),
    [confidence],
  );

  return (
    <Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Analytics Preditivo & Inteligência Operacional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Antecipe riscos, oportunidades e gargalos combinando modelos estatísticos e machine learning.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardHeader avatar={<AnalyticsIcon color="primary" />} title="Modelo estatístico ativo" subheader="Curadoria automática pela plataforma" />
              <CardContent>
                <ToggleButtonGroup orientation="vertical" exclusive value={model} onChange={(_event, value) => value && setModel(value)} fullWidth>
                  <ToggleButton value="regressao">Regressão multivariada</ToggleButton>
                  <ToggleButton value="arvore">Gradient Boosting</ToggleButton>
                  <ToggleButton value="rede">Rede Neural Temporal</ToggleButton>
                </ToggleButtonGroup>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">{models[model]}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader
                title="Produtividade prevista por sprint"
                subheader="Índice composto (0-100) com intervalo de confiança"
                action={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">Auto refresh</Typography>
                    <Switch checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
                  </Stack>
                }
              />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="baseline" stroke="#9e9e9e" name="Histórico" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="predicted" stroke="#1976d2" name="Previsto" strokeWidth={2} />
                      <Line type="monotone" dataKey="lower" stroke="#ed6c02" name="Limite inferior" strokeDasharray="2 4" />
                      <Line type="monotone" dataKey="upper" stroke="#2e7d32" name="Limite superior" strokeDasharray="2 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Alert icon={<Insights />} severity="info" sx={{ mt: 2 }}>
                  O cenário selecionado prevê ganho de {Math.round(productivityForecast[productivityForecast.length - 1].predicted - productivityForecast[0].baseline)} pontos no índice de produtividade ao longo das próximas 5 semanas.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader
                title="Radar de risco consolidado"
                subheader="Ajuste a faixa de confiança para afinar a previsão"
                action={
                  <Stack spacing={1} sx={{ minWidth: 200 }}>
                    <Typography variant="caption" color="text.secondary">
                      Nível de confiança: {confidence}%
                    </Typography>
                    <Slider value={confidence} onChange={(_event, value) => setConfidence(value as number)} step={5} min={60} max={95} valueLabelDisplay="auto" />
                  </Stack>
                }
              />
              <CardContent>
                <Box height={280}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis angle={45} domain={[0, 100]} />
                      <Radar name="Atual" dataKey="actual" stroke="#9e9e9e" fill="#9e9e9e" fillOpacity={0.2} />
                      <Radar name="Previsto" dataKey="predicted" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Detecção de anomalias" subheader="Cruza execução física, custo e telemetria" />
              <CardContent>
                <Box height={280}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={anomalySeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="expected" name="Esperado" stroke="#1976d2" fill="#1976d2" fillOpacity={0.1} />
                      <Line yAxisId="left" type="monotone" dataKey="real" name="Real" stroke="#2e7d32" strokeWidth={2} />
                      <Bar yAxisId="right" dataKey="anomalies" name="Alertas" fill="#ed6c02" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={2}>
          <CardHeader title="Recomendações de IA" subheader="Sugestões priorizadas por impacto" />
          <CardContent>
            <List>
              {aiInsights.map((insight) => (
                <ListItem key={insight.title} alignItems="flex-start">
                  <ListItemIcon>
                    <AutoAwesome color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>{insight.title}</Typography>
                        <Chip label={insight.impact} color={insight.impact === 'Alto' ? 'error' : 'warning'} size="small" />
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">{insight.description}</Typography>
                        <Typography variant="caption" color="text.secondary">Ação sugerida: {insight.action}</Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Alert icon={<Science />} severity="success">
          Os insights são recalibrados a cada 3 horas combinando telemetria do canteiro, dados financeiros e histórico de produtividade.
        </Alert>
      </Stack>
    </Box>
  );
};
