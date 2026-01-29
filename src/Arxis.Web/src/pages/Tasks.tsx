import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import { FilterAlt, Refresh } from '@mui/icons-material';
import dayjs from 'dayjs';
import { TaskAnalytics360, TaskAnalyticsData } from '../components/tasks/TaskAnalytics360';
import { TaskBoard, TaskBoardItem } from '../components/tasks/TaskBoard';
import { WorkflowDesigner, WorkflowStep } from '../components/tasks/WorkflowDesigner';
import { projectService, Project } from '../services/projectService';
import {
  taskService,
  TaskBoardResponse,
  TaskBoardItemResponse,
  TaskPriority,
  TaskStatus,
  TaskWorkflowStepResponse,
  UpsertWorkflowRequest,
} from '../services/taskService';

type ExtendedTask = TaskBoardItem & {
  projectId: string;
  project: string;
  squad: string;
  cycleTimeHours: number;
  assignedToUserId?: string | null;
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: 'Backlog',
  [TaskStatus.Todo]: 'A Fazer',
  [TaskStatus.InProgress]: 'Em andamento',
  [TaskStatus.Blocked]: 'Bloqueada',
  [TaskStatus.Review]: 'Revisão',
  [TaskStatus.Done]: 'Concluída',
  [TaskStatus.Cancelled]: 'Cancelada',
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState<string>('Workflow inteligente');
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [boardMetadata, setBoardMetadata] = useState<{ projectName: string } | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingBoard, setLoadingBoard] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previousTasksRef = useRef<ExtendedTask[] | null>(null);

  const squads = useMemo(() => {
    const unique = new Set<string>();
    tasks.forEach((task) => {
      if (task.squad) {
        unique.add(task.squad);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const projectMatch = !activeProjectId || task.projectId === activeProjectId;
      const squadMatch = selectedSquad === 'all' || task.squad === selectedSquad;
      const searchMatch = normalizedSearch.length === 0
        || [task.title, task.description, task.tags?.join(' ')]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(normalizedSearch));
      return projectMatch && squadMatch && searchMatch;
    });
  }, [tasks, activeProjectId, selectedSquad, searchTerm]);

  const analyticsData: TaskAnalyticsData = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((task) => task.status === TaskStatus.Done).length;
    const overdue = filteredTasks.filter(
      (task) => task.status !== TaskStatus.Done && task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day'),
    ).length;
    const avgCycle = total === 0
      ? 0
      : Math.round(
          filteredTasks.reduce((sum, task) => sum + (Number.isFinite(task.cycleTimeHours) ? task.cycleTimeHours : 0), 0) /
            total,
        );

    const statusDistribution = Object.values(TaskStatus)
      .filter((value): value is TaskStatus => typeof value === 'number')
      .map((status) => ({
        status: statusLabels[status],
        value: filteredTasks.filter((task) => task.status === status).length,
      }));

    const priorityDistribution = Object.values(TaskPriority)
      .filter((value): value is TaskPriority => typeof value === 'number')
      .map((priority) => ({
        priority: ['Baixa', 'Média', 'Alta', 'Crítica'][priority],
        value: filteredTasks.filter((task) => task.priority === priority).length,
      }));

    const squadsLoadMap = new Map<string, { tasks: number; capacity: number }>();
    filteredTasks.forEach((task) => {
      const key = task.squad || 'Squad não atribuída';
      const current = squadsLoadMap.get(key) ?? { tasks: 0, capacity: 12 };
      squadsLoadMap.set(key, { tasks: current.tasks + 1, capacity: current.capacity });
    });

    const teamLoad = Array.from(squadsLoadMap.entries()).map(([team, info]) => ({
      team,
      tasks: info.tasks,
      capacity: info.capacity,
    }));

    const burndownBase = [
      { date: 'Dia 1', planned: 30, actual: 32 },
      { date: 'Dia 2', planned: 26, actual: 29 },
      { date: 'Dia 3', planned: 22, actual: 24 },
      { date: 'Dia 4', planned: 18, actual: 20 },
      { date: 'Dia 5', planned: 14, actual: 15 },
      { date: 'Dia 6', planned: 9, actual: 10 },
      { date: 'Dia 7', planned: 4, actual: 5 },
      { date: 'Dia 8', planned: 0, actual: 2 },
    ];

    const automationCoverage = workflowSteps.length === 0
      ? 0
      : Math.round((workflowSteps.filter((step) => step.automation).length / workflowSteps.length) * 100);

    return {
      completionRate: total === 0 ? 0 : (completed / total) * 100,
      overdueTasks: overdue,
      averageCycleTimeHours: avgCycle,
      automationCoverage,
      statusDistribution,
      priorityDistribution,
      burndown: burndownBase,
      teamLoad: teamLoad.length > 0 ? teamLoad : [{ team: 'Squad Global', tasks: completed, capacity: 12 }],
    };
  }, [filteredTasks, workflowSteps]);

  const mapTaskFromBoard = useCallback(
    (board: TaskBoardResponse, task: TaskBoardItemResponse): ExtendedTask => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? undefined,
      completedPercentage: task.progressPercent,
      assignee: task.assignedToUserName ?? 'Não atribuído',
      tags: task.tags ?? [],
      checklistTotal: task.checklistTotal,
      checklistDone: task.checklistDone,
      project: board.projectName,
      projectId: board.projectId,
      squad: task.squad || 'Squad não atribuída',
      cycleTimeHours: task.cycleTimeHours ?? 0,
      assignedToUserId: task.assignedToUserId,
    }),
    [],
  );

  const mapWorkflowStep = useCallback(
    (step: TaskWorkflowStepResponse): WorkflowStep => ({
      id: step.id,
      name: step.name,
      ownerRole: step.ownerRole,
      slaHours: step.slaHours,
      automation: step.automation,
      entryCriteria: step.entryCriteria,
      exitCriteria: step.exitCriteria,
    }),
    [],
  );

  const applyBoard = useCallback(
    (board: TaskBoardResponse) => {
      setBoardMetadata({ projectName: board.projectName });
      setWorkflowName(board.workflow.name);
      setTasks(board.tasks.map((task) => mapTaskFromBoard(board, task)));
      const orderedSteps = [...board.workflow.steps].sort((a, b) => a.orderIndex - b.orderIndex);
      setWorkflowSteps(orderedSteps.map(mapWorkflowStep));
    },
    [mapTaskFromBoard, mapWorkflowStep],
  );

  const loadBoard = useCallback(
    async (projectId: string) => {
      if (!projectId) {
        return;
      }
      setLoadingBoard(true);
      setErrorMessage(null);
      try {
        const board = await taskService.getBoard(projectId);
        applyBoard(board);
      } catch (error) {
        console.error('Erro ao carregar board de tarefas', error);
        setErrorMessage('Não foi possível carregar as tarefas do projeto selecionado.');
        setTasks([]);
        setWorkflowSteps([]);
      } finally {
        setLoadingBoard(false);
      }
    },
    [applyBoard],
  );

  const loadProjects = useCallback(async () => {
    try {
      const response = await projectService.getAll();
      const options = response.map((project) => ({ id: project.id, name: project.name }));
      setProjects(options);
      if (options.length === 0) {
        setActiveProjectId('');
        return;
      }

      setActiveProjectId((current) => {
        if (current && options.some((project) => project.id === current)) {
          return current;
        }
        return options[0].id;
      });
    } catch (error) {
      console.error('Erro ao carregar projetos', error);
      setProjects([]);
      setActiveProjectId('');
      setErrorMessage('Não foi possível carregar a lista de projetos.');
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (activeProjectId) {
      loadBoard(activeProjectId);
    } else {
      setTasks([]);
      setWorkflowSteps([]);
    }
  }, [activeProjectId, loadBoard]);

  const clearFilters = useCallback(() => {
    setSelectedSquad('all');
    setSearchTerm('');
  }, []);

  const handleProjectChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setActiveProjectId(event.target.value);
    },
    [],
  );

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      previousTasksRef.current = tasks;
      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                completedPercentage: newStatus === TaskStatus.Done ? 100 : task.completedPercentage,
                checklistDone:
                  newStatus === TaskStatus.Done && typeof task.checklistTotal === 'number'
                    ? task.checklistTotal
                    : task.checklistDone,
              }
            : task,
        ),
      );

      try {
        setErrorMessage(null);
        await taskService.updateStatus(taskId, newStatus);
        previousTasksRef.current = null;
      } catch (error) {
        console.error('Erro ao atualizar status da tarefa', error);
        setErrorMessage('Não foi possível atualizar o status da tarefa.');
        if (previousTasksRef.current) {
          setTasks(previousTasksRef.current);
          previousTasksRef.current = null;
        }
      }
    },
    [tasks],
  );

  const handleWorkflowChange = useCallback(
    async (nextSteps: WorkflowStep[]) => {
      const previousSteps = [...workflowSteps];
      setWorkflowSteps(nextSteps);

      if (!activeProjectId) {
        return;
      }

      const payload: UpsertWorkflowRequest = {
        name: workflowName,
        steps: nextSteps.map((step, index) => ({
          id: step.id,
          name: step.name,
          orderIndex: index,
          ownerRole: step.ownerRole,
          slaHours: step.slaHours,
          automation: step.automation,
          entryCriteria: step.entryCriteria,
          exitCriteria: step.exitCriteria,
        })),
      };

      try {
        setErrorMessage(null);
        const updated = await taskService.updateWorkflow(activeProjectId, payload);
        setWorkflowName(updated.name);
        const orderedSteps = [...updated.steps].sort((a, b) => a.orderIndex - b.orderIndex);
        setWorkflowSteps(orderedSteps.map(mapWorkflowStep));
      } catch (error) {
        console.error('Erro ao atualizar workflow do projeto', error);
        setErrorMessage('Não foi possível salvar as alterações do workflow.');
        setWorkflowSteps(previousSteps);
      }
    },
    [activeProjectId, workflowName, workflowSteps, mapWorkflowStep],
  );

  const handleSeedDemo = useCallback(async () => {
    if (!activeProjectId) {
      return;
    }
    setLoadingBoard(true);
    setErrorMessage(null);
    try {
      const response = await taskService.seedDemo(activeProjectId);
      applyBoard(response);
    } catch (error) {
      console.error('Erro ao gerar dados demo', error);
      setErrorMessage('Não foi possível gerar os dados demonstrativos.');
    } finally {
      setLoadingBoard(false);
    }
  }, [activeProjectId, applyBoard]);

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Central de Tarefas & Fluxos Inteligentes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Controle unificado de execução, automações e indicadores operacionais em um só lugar.
          </Typography>
          {boardMetadata ? (
            <Typography variant="subtitle1" color="text.primary" mt={1}>
              Projeto ativo: <strong>{boardMetadata.projectName}</strong>
            </Typography>
          ) : null}
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flex={1}>
              <TextField
                select
                label="Projeto"
                size="small"
                value={activeProjectId}
                onChange={handleProjectChange}
                sx={{ minWidth: 220 }}
                disabled={loadingBoard || projects.length === 0}
              >
                {projects.length === 0 ? (
                  <MenuItem value="">Nenhum projeto encontrado</MenuItem>
                ) : null}
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Squad / Time"
                size="small"
                value={selectedSquad}
                onChange={(event) => setSelectedSquad(event.target.value)}
                sx={{ minWidth: 200 }}
                disabled={loadingBoard}
              >
                <MenuItem value="all">Todas as squads</MenuItem>
                {squads.map((squad) => (
                  <MenuItem key={squad} value={squad}>
                    {squad}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Pesquisar tarefas"
                size="small"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Busque por título, tag ou descrição"
                sx={{ flex: 1 }}
                disabled={loadingBoard}
              />
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<FilterAlt />} onClick={clearFilters} disabled={loadingBoard}>
                Limpar filtros
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleSeedDemo}
                disabled={loadingBoard || !activeProjectId}
              >
                Regerar dados demo
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {errorMessage ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Tarefas filtradas: ${filteredTasks.length}`} color="primary" variant="outlined" />
            <Chip
              label={`Concluídas: ${filteredTasks.filter((task) => task.status === TaskStatus.Done).length}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Bloqueadas: ${filteredTasks.filter((task) => task.status === TaskStatus.Blocked).length}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Críticas: ${filteredTasks.filter((task) => task.priority === TaskPriority.P1_Critical).length}`}
              color="error"
              variant="outlined"
            />
          </Stack>
        </Paper>

        {loadingBoard ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress color="primary" />
            <Typography variant="subtitle1" mt={2} color="text.secondary">
              Carregando dados do board...
            </Typography>
          </Paper>
        ) : null}

        {!loadingBoard && filteredTasks.length > 0 ? (
          <TaskAnalytics360 data={analyticsData} />
        ) : null}

        {!loadingBoard && filteredTasks.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Nenhuma tarefa encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste os filtros ou gere dados demo para visualizar o fluxo de trabalho.
            </Typography>
          </Paper>
        ) : null}

        {!loadingBoard && filteredTasks.length > 0 ? (
          <TaskBoard items={filteredTasks} onStatusChange={handleStatusChange} />
        ) : null}

        {!loadingBoard ? (
          <WorkflowDesigner steps={workflowSteps} onChange={handleWorkflowChange} />
        ) : null}
      </Stack>
    </Box>
  );
};
