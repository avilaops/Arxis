import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Bolt,
  DeleteForever,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Timeline,
  WatchLater,
} from '@mui/icons-material';

export interface WorkflowStep {
  id: string;
  name: string;
  ownerRole: string;
  slaHours: number;
  automation: boolean;
  entryCriteria: string;
  exitCriteria: string;
}

export interface WorkflowDesignerProps {
  steps: WorkflowStep[];
  onChange: (nextSteps: WorkflowStep[]) => void;
}

const stepTemplates: Omit<WorkflowStep, 'id'>[] = [
  {
    name: 'Solicitação inicial',
    ownerRole: 'Coordenador de Obras',
    slaHours: 8,
    automation: true,
    entryCriteria: 'Abertura automática via formulário ou API',
    exitCriteria: 'Checklist inicial concluído',
  },
  {
    name: 'Validação técnica',
    ownerRole: 'Engenharia',
    slaHours: 16,
    automation: false,
    entryCriteria: 'Documentos anexados e escopo definido',
    exitCriteria: 'Parecer técnico emitido',
  },
  {
    name: 'Aprovação financeira',
    ownerRole: 'Financeiro',
    slaHours: 12,
    automation: true,
    entryCriteria: 'Valor estimado e centro de custo associados',
    exitCriteria: 'Orçamento reservado e aprovado',
  },
  {
    name: 'Execução em campo',
    ownerRole: 'Líder de Frente',
    slaHours: 24,
    automation: false,
    entryCriteria: 'Equipe confirmada e OS liberada',
    exitCriteria: 'Registro diário com fotos e checklist',
  },
  {
    name: 'Entrega e lições aprendidas',
    ownerRole: 'PMO',
    slaHours: 10,
    automation: true,
    entryCriteria: 'Todos os documentos anexados',
    exitCriteria: 'Termo de aceite, métricas e automações concluídas',
  },
];

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback GUID generator
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ steps, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const averageSla = useMemo(() => {
    if (steps.length === 0) {
      return 0;
    }
    const total = steps.reduce((sum, step) => sum + step.slaHours, 0);
    return Math.round(total / steps.length);
  }, [steps]);

  const automationRate = useMemo(() => {
    if (steps.length === 0) return 0;
    const count = steps.filter((step) => step.automation).length;
    return Math.round((count / steps.length) * 100);
  }, [steps]);

  const addStep = (template: Omit<WorkflowStep, 'id'>) => {
    onChange([...steps, { ...template, id: createId() }]);
    setAnchorEl(null);
  };

  const updateStep = (stepId: string, patch: Partial<WorkflowStep>) => {
    onChange(
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              ...patch,
            }
          : step,
      ),
    );
  };

  const moveStep = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= steps.length) {
      return;
    }
    const reordered = [...steps];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, removed);
    onChange(reordered);
  };

  const removeStep = (stepId: string) => {
    onChange(steps.filter((step) => step.id !== stepId));
  };

  return (
    <Card elevation={3}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Timeline color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Workflow inteligente
            </Typography>
          </Stack>
        }
        subheader="Configure etapas com SLA, donos e automações gatilhadas por eventos."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            Adicionar etapa
          </Button>
        }
      />
      <CardContent>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      SLA médio
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {averageSla}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Calculado nas {steps.length} etapas ativas.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cobertura automatizada
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {automationRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Etapas com webhooks, bots ou aprovações automáticas.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Etapas mapeadas
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {steps.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Combine templates com as políticas da sua companhia.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box>
            <Stepper alternativeLabel activeStep={steps.length - 1}>
              {steps.map((step) => (
                <Step key={step.id} completed>
                  <StepLabel>{step.name}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider />

          <List disablePadding>
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {index > 0 ? <Divider component="li" /> : null}
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" fontWeight={600}>
                            {step.name}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip icon={<WatchLater fontSize="small" />} label={`SLA: ${step.slaHours}h`} />
                              <Chip icon={<Bolt fontSize="small" />} label={step.automation ? 'Automatizado' : 'Manual'} color={step.automation ? 'success' : 'default'} variant={step.automation ? 'filled' : 'outlined'} />
                              <Chip label={`Responsável: ${step.ownerRole}`} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Entrada: {step.entryCriteria}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Saída: {step.exitCriteria}
                            </Typography>
                          </Stack>
                        }
                      />
                      <Stack spacing={1}>
                        <TextField
                          label="SLA (horas)"
                          type="number"
                          size="small"
                          value={step.slaHours}
                          onChange={(event) =>
                            updateStep(step.id, {
                              slaHours: Number(event.target.value),
                            })
                          }
                          inputProps={{ min: 1, step: 1 }}
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Automação
                          </Typography>
                          <Switch
                            checked={step.automation}
                            onChange={(event) =>
                              updateStep(step.id, {
                                automation: event.target.checked,
                              })
                            }
                          />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Subir etapa">
                            <span>
                              <IconButton size="small" onClick={() => moveStep(index, -1)} disabled={index === 0}>
                                <KeyboardArrowUp />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Descer etapa">
                            <span>
                              <IconButton size="small" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1}>
                                <KeyboardArrowDown />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Remover etapa">
                            <IconButton size="small" color="error" onClick={() => removeStep(step.id)}>
                              <DeleteForever />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}

            {steps.length === 0 ? (
              <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                <Typography color="text.secondary">Adicione etapas para criar seu primeiro fluxo inteligente.</Typography>
              </ListItem>
            ) : null}
          </List>
        </Stack>
      </CardContent>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {stepTemplates.map((template) => (
          <MenuItem key={template.name} onClick={() => addStep(template)}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{template.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Responsável: {template.ownerRole} • SLA {template.slaHours}h
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};
