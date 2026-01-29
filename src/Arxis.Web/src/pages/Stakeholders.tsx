import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Avatar,
  AvatarGroup,
  Button,
} from '@mui/material';
import {
  Groups,
  Timeline,
  SupportAgent,
  Feed,
  LockPerson,
  NotificationsActive,
  LiveHelp,
  CheckCircle,
} from '@mui/icons-material';

const stakeholders = [
  {
    name: 'Conselho Executivo',
    level: 'Visão estratégica',
    access: 'Dashboards financeiros, marcos principais',
    members: ['Ana', 'Roberto', 'Luís'],
  },
  {
    name: 'Cliente Operacional',
    level: 'Visão operacional',
    access: 'RFIs, diários, fotos e cronograma detalhado',
    members: ['Fernanda', 'Paulo'],
  },
  {
    name: 'Fornecedores críticos',
    level: 'Visão colaborativa',
    access: 'Pedidos, entregas, contratos e aditivos',
    members: ['Construsol', 'Alpha Mix'],
  },
];

const communicationLog = [
  {
    title: 'Resumo executivo semanal',
    channel: 'E-mail + Portal',
    date: '22/01/2026',
    status: 'Publicado',
  },
  {
    title: 'Alerta de RFI crítica (RFI-231)',
    channel: 'Portal + Notificação push',
    date: '20/01/2026',
    status: 'Em andamento',
  },
  {
    title: 'Checklist segurança obra',
    channel: 'Aplicativo móvel',
    date: '18/01/2026',
    status: 'Publicado',
  },
];

export const Stakeholders: React.FC = () => {
  return (
    <Box>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Portal de Stakeholders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Transparência e colaboração em tempo real com clientes, conselhos e fornecedores.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardHeader avatar={<Groups color="primary" />} title="Stakeholders ativos" subheader="Usuários externos com acesso configurado" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>58</Typography>
                <Typography variant="body2" color="text.secondary">Divididos em 12 grupos com acesso segmentado.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardHeader avatar={<Timeline color="success" />} title="Marcos sincronizados" subheader="Atualizados para os stakeholders" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>142</Typography>
                <Typography variant="body2" color="text.secondary">Inclui entregas, aprovações e riscos em destaque.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardHeader avatar={<SupportAgent color="secondary" />} title="Satisfação" subheader="Net Stakeholder Score" />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>86</Typography>
                <Typography variant="body2" color="text.secondary">Feedback coletado diretamente no portal.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={2}>
          <CardHeader title="Níveis de acesso" subheader="Configure experiências específicas por perfil" />
          <CardContent>
            <Grid container spacing={2}>
              {stakeholders.map((group) => (
                <Grid key={group.name} item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Typography variant="h6" fontWeight={600}>{group.name}</Typography>
                        <Chip icon={<LockPerson fontSize="small" />} label={group.level} color="primary" variant="outlined" />
                        <Typography variant="body2" color="text.secondary">
                          {group.access}
                        </Typography>
                        <Stack>
                          <Typography variant="caption" color="text.secondary">Integrantes</Typography>
                          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                            {group.members.map((member) => (
                              <Avatar key={member}>{member[0]}</Avatar>
                            ))}
                          </AvatarGroup>
                        </Stack>
                        <Button size="small" variant="outlined">Gerenciar acesso</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Comunicações recentes" subheader="Histórico centralizado para auditoria" />
              <CardContent>
                <List>
                  {communicationLog.map((item) => (
                    <ListItem key={item.title} alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>{item.title}</Typography>
                            <Chip label={item.status} color={item.status === 'Publicado' ? 'success' : 'warning'} size="small" />
                          </Stack>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">Canal: {item.channel}</Typography>
                            <Typography variant="caption" color="text.secondary">Data: {item.date}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader title="Automação de notificações" subheader="Dispare alertas personalizados" />
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationsActive color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Alertas de marcos</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Envio instantâneo quando marcos críticos são concluídos ou atrasados.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LiveHelp color="secondary" />
                    <Typography variant="subtitle1" fontWeight={600}>Portal de dúvidas</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Canal bidirecional com SLA automática e sugestões de resposta.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Feed color="warning" />
                    <Typography variant="subtitle1" fontWeight={600}>Relatórios executivos</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    PDFs e dashboards interativos liberados semanalmente, com confirmação de leitura.
                  </Typography>
                  <Button variant="contained" startIcon={<CheckCircle />}>Configurar automações</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};
