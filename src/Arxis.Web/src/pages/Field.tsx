import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  CloudDone,
  CloudOff,
  Upload,
  Download,
  Map,
  CheckCircle,
  WarningAmber,
  PhotoCamera,
  SignalWifiStatusbarConnectedNoInternet4,
  PendingActions,
  AssignmentTurnedIn,
  ElectricBolt,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface SyncItem {
  id: string;
  type: 'Diário' | 'Checklist' | 'Foto' | 'Observação';
  status: 'Pendente' | 'Sincronizado' | 'Erro';
  project: string;
  updatedAt: string;
}

const syncQueue: SyncItem[] = [
  {
    id: 'sync-001',
    type: 'Diário',
    status: 'Pendente',
    project: 'Linha 8 Trens',
    updatedAt: dayjs().subtract(18, 'minute').toISOString(),
  },
  {
    id: 'sync-002',
    type: 'Checklist',
    status: 'Erro',
    project: 'Hospital Vida Nova',
    updatedAt: dayjs().subtract(32, 'minute').toISOString(),
  },
  {
    id: 'sync-003',
    type: 'Foto',
    status: 'Pendente',
    project: 'Residencial Horizonte',
    updatedAt: dayjs().subtract(5, 'minute').toISOString(),
  },
  {
    id: 'sync-004',
    type: 'Observação',
    status: 'Sincronizado',
    project: 'Hospital Vida Nova',
    updatedAt: dayjs().subtract(2, 'hour').toISOString(),
  },
];

const offlineStats = {
  storageUsedMb: 442,
  totalCapacityMb: 1_024,
  pendingUploads: syncQueue.filter((item) => item.status !== 'Sincronizado').length,
  checklistsCompleted: 38,
  photosCaptured: 147,
};

const downloadPackages = [
  {
    title: 'Pacote de checklists NR-35',
    description: 'Inclui versões mais recentes e anexos de procedimento',
    size: '32 MB',
    version: 'v2.4',
  },
  {
    title: 'Mapas offline canteiro Linha 8',
    description: 'Mapbox + plantas georreferenciadas para consulta sem conexão',
    size: '120 MB',
    version: 'v1.12',
  },
  {
    title: 'Modelos de diário de obra',
    description: 'Templates com automações e campos obrigatórios atualizados',
    size: '14 MB',
    version: 'v3.1',
  },
];

export const Field: React.FC = () => {
  const [offlineMode, setOfflineMode] = useState(true);

  const storageUsage = useMemo(() => {
    const percentage = Math.round((offlineStats.storageUsedMb / offlineStats.totalCapacityMb) * 100);
    return {
      percentage,
      freeMb: offlineStats.totalCapacityMb - offlineStats.storageUsedMb,
    };
  }, []);

  return (
    <Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Operações em Campo & Modo Offline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Empodere as equipes com sincronização inteligente, checklists offline e telemetria integrada.
          </Typography>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              {offlineMode ? <CloudOff color="warning" /> : <CloudDone color="primary" />}
              <Typography variant="h6">
                {offlineMode ? 'Modo offline ativo' : 'Conectado à nuvem'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Alternar modo offline
              </Typography>
              <Switch checked={offlineMode} onChange={(event) => setOfflineMode(event.target.checked)} />
            </Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Chip icon={<AssignmentTurnedIn />} label={`${offlineStats.checklistsCompleted} checklists concluídos`} color="primary" variant="outlined" />
            <Chip icon={<PhotoCamera />} label={`${offlineStats.photosCaptured} fotos capturadas`} color="secondary" variant="outlined" />
            <Chip icon={<PendingActions />} label={`${offlineStats.pendingUploads} itens aguardando sincronização`} color="warning" variant="outlined" />
            <Chip icon={<ElectricBolt />} label="Sincronização automática a cada 15 min" color="success" variant="outlined" />
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Fila de sincronização" subheader="Itens aguardando conexão para envio" />
              <CardContent>
                <List>
                  {syncQueue.map((item) => (
                    <ListItem key={item.id} alignItems="flex-start">
                      <ListItemIcon>
                        {item.status === 'Sincronizado' ? (
                          <CheckCircle color="success" />
                        ) : item.status === 'Erro' ? (
                          <WarningAmber color="error" />
                        ) : (
                          <SignalWifiStatusbarConnectedNoInternet4 color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>{item.type}</Typography>
                            <Chip label={item.status} color={item.status === 'Sincronizado' ? 'success' : item.status === 'Erro' ? 'error' : 'warning'} size="small" />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">Projeto: {item.project}</Typography>
                            <Typography variant="caption" color="text.secondary">Atualizado {dayjs(item.updatedAt).fromNow()}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Armazenamento dedicado offline" />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Uso atual</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {offlineStats.storageUsedMb} MB / {offlineStats.totalCapacityMb} MB (livres {storageUsage.freeMb} MB)
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={storageUsage.percentage} sx={{ height: 8, borderRadius: 3 }} color={storageUsage.percentage > 85 ? 'error' : storageUsage.percentage > 65 ? 'warning' : 'primary'} />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Pacotes disponíveis para download</Typography>
                    {downloadPackages.map((pkg) => (
                      <Paper key={pkg.title} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}>
                          <Stack>
                            <Typography variant="subtitle1" fontWeight={600}>{pkg.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{pkg.description}</Typography>
                            <Typography variant="caption" color="text.secondary">{pkg.size} • {pkg.version}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Button startIcon={<Download />} size="small" variant="outlined">Baixar</Button>
                            <Button startIcon={<Upload />} size="small" variant="text">Atualizar</Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={2}>
          <CardHeader title="Mapa e telemetria" subheader="Acompanhe o canteiro mesmo em modo offline" />
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
              <Box
                sx={{
                  width: { xs: '100%', md: '50%' },
                  aspectRatio: '4 / 3',
                  borderRadius: 2,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Map sx={{ fontSize: 80, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'white', px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                  Último sync: {dayjs().subtract(12, 'minute').format('HH:mm')}
                </Typography>
              </Box>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>Resumo do dia</Typography>
                <Typography variant="body2" color="text.secondary">
                  • 18 equipes em campo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 147 fotos capturadas (72 offline)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 12 checklists críticos concluídos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 4 alertas de segurança emitidos automaticamente
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
