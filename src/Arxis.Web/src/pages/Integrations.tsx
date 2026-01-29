import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Hub,
  Storage,
  CloudSync,
  Api,
  AutoAwesome,
  Engineering,
  Paid,
  CloudUpload,
  ElectricBolt,
} from '@mui/icons-material';

interface IntegrationItem {
  name: string;
  status: 'Online' | 'Parcial' | 'Offline';
  lastSync: string;
  owner: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

const integrationGroups: Record<string, IntegrationItem[]> = {
  'BIM & Design': [
    {
      name: 'Revit Connector',
      status: 'Online',
      lastSync: 'há 18 minutos',
      owner: 'Modelagem 4D',
      description: 'Sincroniza parâmetros, famílias e revisões com controle de versão.',
      metrics: [
        { label: 'Elementos sincronizados', value: '12.487' },
        { label: 'Tempo médio', value: '00:03:21' },
      ],
    },
    {
      name: 'Navisworks Clash',
      status: 'Parcial',
      lastSync: 'há 1 hora',
      owner: 'Coordenação BIM',
      description: 'Importa relatórios de conflitos e abre issues automáticas.',
      metrics: [
        { label: 'Clashes tratados', value: '92%' },
        { label: 'Pendências', value: '14' },
      ],
    },
  ],
  'ERP & Financeiro': [
    {
      name: 'Totvs Protheus',
      status: 'Online',
      lastSync: 'há 6 minutos',
      owner: 'Controladoria',
      description: 'Sincroniza pedidos de compra, medições e centros de custo.',
      metrics: [
        { label: 'Notas fiscais', value: '1.248' },
        { label: 'Pedidos em trânsito', value: '37' },
      ],
    },
    {
      name: 'SAP S/4HANA',
      status: 'Offline',
      lastSync: 'há 4 horas',
      owner: 'TI Corporativa',
      description: 'Integração standby aguardando credenciais atualizadas.',
      metrics: [
        { label: 'Filas pendentes', value: '12' },
        { label: 'Tentativas', value: '3' },
      ],
    },
  ],
  'Storage & Cloud': [
    {
      name: 'Azure Blob Storage',
      status: 'Online',
      lastSync: 'há 2 minutos',
      owner: 'Infraestrutura',
      description: 'Armazena anexos e modelos BIM pesados com versionamento.',
      metrics: [
        { label: 'Uso', value: '2,4 TB' },
        { label: 'Objetos', value: '58.129' },
      ],
    },
    {
      name: 'Google Drive Parceiros',
      status: 'Parcial',
      lastSync: 'há 45 minutos',
      owner: 'Stakeholders Externos',
      description: 'Espaço compartilhado com clientes e fornecedores estratégicos.',
      metrics: [
        { label: 'Pastas compartilhadas', value: '32' },
        { label: 'Links expirados', value: '0' },
      ],
    },
  ],
  'APIs & Webhooks': [
    {
      name: 'Power BI Dataflow',
      status: 'Online',
      lastSync: 'há 12 minutos',
      owner: 'Analytics',
      description: 'Alimenta dashboards customizados e relatórios executivos.',
      metrics: [
        { label: 'Dataflows', value: '5' },
        { label: 'Último refresh', value: 'OK' },
      ],
    },
    {
      name: 'Webhook Stakeholders',
      status: 'Online',
      lastSync: 'há 3 minutos',
      owner: 'PMO',
      description: 'Envia alertas de marcos, RFIs e aprovações para clientes.',
      metrics: [
        { label: 'Eventos nas últimas 24h', value: '212' },
        { label: 'Falhas', value: '0,3%' },
      ],
    },
  ],
};

const statusColor = (status: IntegrationItem['status']) => {
  switch (status) {
    case 'Online':
      return 'success';
    case 'Parcial':
      return 'warning';
    default:
      return 'error';
  }
};

export const Integrations: React.FC = () => {
  return (
    <Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Hub de Integrações
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitore conectores BIM, ERPs, provedores de arquivos e APIs em um cockpit único.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<Hub color="primary" />} title="Integrações ativas" subheader="Conectores com healthcheck" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>18</Typography>
                <Typography variant="body2" color="text.secondary">Com monitoramento 24/7 e SLA de 99,5%.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<CloudSync color="success" />} title="Jobs sincronizados" subheader="Últimas 24 horas" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>1.274</Typography>
                <Typography variant="body2" color="text.secondary">92% executados com automação total.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<AutoAwesome color="secondary" />} title="Workflows automatizados" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>46</Typography>
                <Typography variant="body2" color="text.secondary">Regras se/então conectadas a ERPs e BIM.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardHeader avatar={<Engineering color="warning" />} title="Alertas em andamento" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>3</Typography>
                <Typography variant="body2" color="text.secondary">Acompanhe falhas e retentativas em tempo real.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {Object.entries(integrationGroups).map(([group, connectors]) => (
          <Accordion key={group} defaultExpanded sx={{ borderRadius: 2, mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}> 
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ width: '100%' }}>
                <Typography variant="h6" fontWeight={600}>{group}</Typography>
                <Chip label={`${connectors.length} conectores`} color="primary" variant="outlined" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {connectors.map((connector) => (
                  <Grid key={connector.name} item xs={12} md={6} lg={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardHeader
                        title={connector.name}
                        subheader={`Responsável: ${connector.owner}`}
                        action={<Chip label={connector.status} color={statusColor(connector.status) as any} size="small" />}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {connector.description}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={1}>
                          {connector.metrics.map((metric) => (
                            <Stack key={metric.label} direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{metric.value}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">Último sync: {connector.lastSync}</Typography>
                          <Button size="small">Ver detalhes</Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Fila de eventos em tempo real" subheader="Monitoramento contínuo de webhooks" />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <Chip icon={<Api />} label="Webhooks" color="primary" />
                    <Chip icon={<Paid />} label="Financeiro" color="secondary" />
                    <Chip icon={<CloudUpload />} label="Uploads BIM" color="success" />
                  </Stack>
                  <LinearProgress variant="determinate" value={72} color="primary" sx={{ height: 8, borderRadius: 3 }} />
                  <Typography variant="body2" color="text.secondary">
                    72% dos eventos processados nos últimos 5 minutos. Fila atual: 38 itens.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Playbooks de automação" subheader="Sugestões para novos conectores" />
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ElectricBolt color="warning" />
                    <Typography variant="subtitle1" fontWeight={600}>RFIs para BIM 360</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Gere issues automaticamente em obras Autodesk quando novas RFIs forem abertas no ARXIS.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ElectricBolt color="warning" />
                    <Typography variant="subtitle1" fontWeight={600}>Aprovação de medições com SAP</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Sincronize medições aprovadas com ordens de pagamento no SAP S/4HANA com retentativas automáticas.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};
