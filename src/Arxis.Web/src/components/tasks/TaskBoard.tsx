import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Event,
  Flag,
  PlaylistAddCheck,
  PriorityHigh,
  Schedule,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
import { TaskPriority, TaskStatus } from '../../services/taskService';

export interface TaskBoardItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedPercentage?: number;
  assignee?: string;
  tags?: string[];
  checklistTotal?: number;
  checklistDone?: number;
}

export interface TaskBoardProps {
  items: TaskBoardItem[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

interface StatusConfig {
  status: TaskStatus;
  title: string;
  hint: string;
  accent: string;
}

const statusConfigs: StatusConfig[] = [
  { status: TaskStatus.Backlog, title: 'Backlog', hint: 'Ideias e demandas futuras', accent: '#8895a7' },
  { status: TaskStatus.Todo, title: 'A Fazer', hint: 'Programadas para execução', accent: '#1976d2' },
  { status: TaskStatus.InProgress, title: 'Em andamento', hint: 'Foco total da equipe', accent: '#2e7d32' },
  { status: TaskStatus.Blocked, title: 'Bloqueadas', hint: 'Dependências ou impedimentos', accent: '#ed6c02' },
  { status: TaskStatus.Review, title: 'Revisão', hint: 'Aguardando aprovação ou QA', accent: '#9c27b0' },
  { status: TaskStatus.Done, title: 'Concluídas', hint: 'Encerradas com sucesso', accent: '#00b8a9' },
];

const priorityMap: Record<TaskPriority, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }>
  = {
    [TaskPriority.P4_Low]: { label: 'Baixa', color: 'default' },
    [TaskPriority.P3_Medium]: { label: 'Média', color: 'primary' },
    [TaskPriority.P2_High]: { label: 'Alta', color: 'warning' },
    [TaskPriority.P1_Critical]: { label: 'Crítica', color: 'error' },
  };

const statusLabelMap: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: 'Backlog',
  [TaskStatus.Todo]: 'A Fazer',
  [TaskStatus.InProgress]: 'Em andamento',
  [TaskStatus.Blocked]: 'Bloqueada',
  [TaskStatus.Review]: 'Revisão',
  [TaskStatus.Done]: 'Concluída',
  [TaskStatus.Cancelled]: 'Cancelada',
};

const getDueChipColor = (dueDate?: string, status?: TaskStatus) => {
  if (!dueDate) return 'default';
  if (status === TaskStatus.Done) return 'success';

  const today = dayjs();
  const due = dayjs(dueDate);

  if (due.isBefore(today, 'day')) return 'error';
  if (due.diff(today, 'day') <= 2) return 'warning';
  return 'default';
};

const formatDueLabel = (dueDate?: string) => {
  if (!dueDate) return 'Sem prazo';
  const due = dayjs(dueDate);
  return `Entrega ${due.locale('pt-br').format('DD/MM')} (${due.fromNow()})`;
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ items, onStatusChange }) => {
  const tasksByStatus = useMemo(() => {
    return statusConfigs.reduce<Record<TaskStatus, TaskBoardItem[]>>((acc, config) => {
      acc[config.status] = items.filter((item) => item.status === config.status);
      return acc;
    }, {
      [TaskStatus.Backlog]: [],
      [TaskStatus.Todo]: [],
      [TaskStatus.InProgress]: [],
      [TaskStatus.Blocked]: [],
      [TaskStatus.Review]: [],
      [TaskStatus.Done]: [],
      [TaskStatus.Cancelled]: [],
    });
  }, [items]);

  const totalTasks = items.length;

  return (
    <Grid container spacing={2}>
      {statusConfigs.map((config) => {
        const columnItems = tasksByStatus[config.status] ?? [];
        const completionRatio = totalTasks === 0 ? 0 : Math.round((columnItems.length / totalTasks) * 100);

        return (
          <Grid key={config.status} item xs={12} md={6} lg={4} xl={2}>
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
              <Box px={3} pt={3} pb={1.5} sx={{ borderBottom: '1px solid', borderColor: 'divider', background: `linear-gradient(135deg, ${config.accent}15, transparent)` }}>
                <Typography variant="h6" fontWeight={600}>{config.title}</Typography>
                <Typography variant="caption" color="text.secondary">{config.hint}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1.5}>
                  <Chip label={`${columnItems.length} tarefa${columnItems.length === 1 ? '' : 's'}`} size="small" />
                  <Chip label={`${completionRatio}% da carteira`} size="small" color="primary" variant="outlined" />
                </Stack>
                <LinearProgress variant="determinate" value={completionRatio} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
              </Box>

              <Stack spacing={2} sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                {columnItems.map((task) => {
                  const priority = priorityMap[task.priority];
                  const dueColor = getDueChipColor(task.dueDate, task.status);

                  return (
                    <Card key={task.id} variant="outlined" sx={{ borderRadius: 2, borderTop: `4px solid ${config.accent}` }}>
                      <CardHeader
                        title={
                          <Typography variant="subtitle1" fontWeight={600} noWrap>
                            {task.title}
                          </Typography>
                        }
                        subheader={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" icon={<Flag fontSize="inherit" />} label={priority.label} color={priority.color} variant="outlined" />
                            <Chip size="small" icon={<Event fontSize="inherit" />} label={formatDueLabel(task.dueDate)} color={dueColor as any} variant="outlined" />
                          </Stack>
                        }
                        action={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Mover para estágio anterior">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={task.status === TaskStatus.Backlog}
                                  onClick={() => {
                                    const currentIndex = statusConfigs.findIndex((status) => status.status === task.status);
                                    if (currentIndex > 0) {
                                      onStatusChange(task.id, statusConfigs[currentIndex - 1].status);
                                    }
                                  }}
                                >
                                  <ArrowBack fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Mover para próximo estágio">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={task.status === TaskStatus.Done}
                                  onClick={() => {
                                    const currentIndex = statusConfigs.findIndex((status) => status.status === task.status);
                                    if (currentIndex < statusConfigs.length - 1) {
                                      onStatusChange(task.id, statusConfigs[currentIndex + 1].status);
                                    }
                                  }}
                                >
                                  <ArrowForward fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        }
                      />
                      <CardContent sx={{ pt: 0 }}>
                        {task.description ? (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {task.description}
                          </Typography>
                        ) : null}

                        {task.tags && task.tags.length > 0 ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                            {task.tags.map((tag) => (
                              <Chip key={tag} size="small" label={tag} variant="outlined" />
                            ))}
                          </Stack>
                        ) : null}

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {task.assignee ? (
                            <Chip size="small" label={task.assignee} icon={<PlaylistAddCheck fontSize="inherit" />} />
                          ) : null}
                          {typeof task.checklistDone === 'number' && typeof task.checklistTotal === 'number' ? (
                            <Chip
                              size="small"
                              icon={<Schedule fontSize="inherit" />}
                              label={`${task.checklistDone}/${task.checklistTotal} checklist`}
                              variant="outlined"
                            />
                          ) : null}
                        </Stack>

                        {typeof task.completedPercentage === 'number' ? (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Progresso da atividade
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={task.completedPercentage}
                              sx={{ height: 6, borderRadius: 3 }}
                              color={task.completedPercentage === 100 ? 'success' : 'primary'}
                            />
                          </Box>
                        ) : null}

                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Mover para estágio específico
                          </Typography>
                          <Select
                            fullWidth
                            size="small"
                            value={task.status}
                            onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                          >
                            {Object.values(TaskStatus)
                              .filter((value) => typeof value === 'number')
                              .map((value) => (
                                <MenuItem key={value} value={value as number}>
                                  {statusLabelMap[value as TaskStatus]}
                                </MenuItem>
                              ))}
                          </Select>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}

                {columnItems.length === 0 ? (
                  <Box
                    sx={{
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      py: 4,
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <PriorityHigh sx={{ fontSize: 38, mb: 1, color: `${config.accent}` }} />
                    <Typography variant="body2">Nenhuma tarefa neste estágio</Typography>
                  </Box>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};
