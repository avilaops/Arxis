import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  AddLink as AddLinkIcon,
  AttachFile as AttachFileIcon,
  BugReport as BugReportIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Description as DescriptionIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterAlt as FilterAltIcon,
  HelpOutline as HelpOutlineIcon,
  Link as LinkIcon,
  PendingActions as PendingActionsIcon,
  Person as PersonIcon,
  Place as PlaceIcon,
  PriorityHigh as PriorityHighIcon,
  Refresh as RefreshIcon,
  ReportProblem as ReportProblemIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { projectService } from '../services/projectService';
import {
  issueService,
  IssueSummary,
  IssueDetail,
  IssuePriority,
  IssueStatus,
  IssueType,
  IssueCommentCreateRequest,
  IssueLinkCreateRequest,
  IssueLinkType,
} from '../services/issueService';

type ProjectOption = Awaited<ReturnType<typeof projectService.getAll>> extends (infer R)[] ? R : never;

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

const issueStatusMeta: Record<IssueStatus, { label: string; color: ChipColor }> = {
  [IssueStatus.Open]: { label: 'Aberto', color: 'error' },
  [IssueStatus.InAnalysis]: { label: 'Em análise', color: 'info' },
  [IssueStatus.AwaitingResponse]: { label: 'Aguardando resposta', color: 'warning' },
  [IssueStatus.Resolved]: { label: 'Resolvido', color: 'success' },
  [IssueStatus.Closed]: { label: 'Encerrado', color: 'default' },
  [IssueStatus.Cancelled]: { label: 'Cancelado', color: 'secondary' },
};

const issuePriorityMeta: Record<IssuePriority, { label: string; color: ChipColor }> = {
  [IssuePriority.P1_Critical]: { label: 'Crítica (P1)', color: 'error' },
  [IssuePriority.P2_High]: { label: 'Alta (P2)', color: 'warning' },
  [IssuePriority.P3_Medium]: { label: 'Média (P3)', color: 'info' },
  [IssuePriority.P4_Low]: { label: 'Baixa (P4)', color: 'default' },
};

const issueTypeLabel: Record<IssueType, string> = {
  [IssueType.Design]: 'Projetos e desenhos',
  [IssueType.Execution]: 'Execução',
  [IssueType.Safety]: 'Segurança',
  [IssueType.Quality]: 'Qualidade',
  [IssueType.Supply]: 'Suprimentos',
  [IssueType.Contract]: 'Contratos',
  [IssueType.Other]: 'Outros',
};

const linkTypeLabel: Record<IssueLinkType, string> = {
  [IssueLinkType.WorkTask]: 'Tarefa relacionada',
  [IssueLinkType.ModelElement]: 'Elemento BIM',
  [IssueLinkType.Document]: 'Documento',
  [IssueLinkType.Contract]: 'Contrato',
  [IssueLinkType.DailyLog]: 'Diário de obra',
  [IssueLinkType.Other]: 'Outro contexto',
};

const statusOptions = (Object.values(IssueStatus).filter((value) => typeof value === 'number') as IssueStatus[]);
const priorityOptions = (Object.values(IssuePriority).filter((value) => typeof value === 'number') as IssuePriority[]);
const linkTypeOptions = (Object.values(IssueLinkType).filter((value) => typeof value === 'number') as IssueLinkType[]);

const isClosedStatus = (status: IssueStatus) =>
  status === IssueStatus.Resolved || status === IssueStatus.Closed || status === IssueStatus.Cancelled;

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-');
const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('pt-BR') : '-');

const getOverdueStatus = (issue: IssueSummary) => {
  if (!issue.dueDate || isClosedStatus(issue.status)) {
    return false;
  }
  return new Date(issue.dueDate).getTime() < Date.now();
};

interface IssueDetailPanelProps {
  open: boolean;
  issue: IssueDetail | null;
  loading: boolean;
  onClose: () => void;
  onChangeStatus: (status: IssueStatus) => Promise<void>;
  onAddComment: (payload: IssueCommentCreateRequest) => Promise<void>;
  onAddLink: (payload: IssueLinkCreateRequest) => Promise<void>;
  onRemoveLink: (linkId: string) => Promise<void>;
  addingComment: boolean;
  addingLink: boolean;
}

const IssueDetailPanel: React.FC<IssueDetailPanelProps> = ({
  open,
  issue,
  loading,
  onClose,
  onChangeStatus,
  onAddComment,
  onAddLink,
  onRemoveLink,
  addingComment,
  addingLink,
}) => {
  const [commentMessage, setCommentMessage] = useState('');
  const [commentInternal, setCommentInternal] = useState(false);
  const [linkLabelInput, setLinkLabelInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [linkTypeInput, setLinkTypeInput] = useState<IssueLinkType>(IssueLinkType.Document);

  useEffect(() => {
    setCommentMessage('');
    setCommentInternal(false);
    setLinkLabelInput('');
    setLinkUrlInput('');
    setLinkTypeInput(IssueLinkType.Document);
  }, [issue?.summary.id, open]);

  const handleSubmitComment = async () => {
    const trimmed = commentMessage.trim();
    if (!issue || trimmed.length === 0) {
      return;
    }
    await onAddComment({ message: trimmed, isInternal: commentInternal });
    setCommentMessage('');
    setCommentInternal(false);
  };

  const handleSubmitLink = async () => {
    if (!issue) {
      return;
    }
    const label = linkLabelInput.trim();
    const url = linkUrlInput.trim();
    if (!label || !url) {
      return;
    }
    await onAddLink({ linkType: linkTypeInput, label, externalReference: url });
    setLinkLabelInput('');
    setLinkUrlInput('');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420, md: 480 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="overline" color="text.secondary">
              {issue?.summary.referenceCode ?? 'Detalhes da issue'}
            </Typography>
            {issue?.summary.isRfi ? <Chip size="small" color="secondary" label="RFI" /> : null}
            {issue?.summary.isBlocking ? <Chip size="small" color="error" label="Bloqueio" /> : null}
          </Stack>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {issue?.summary.title ?? 'Selecione uma issue'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
            <CircularProgress size={32} />
          </Stack>
        ) : issue ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  color={issueStatusMeta[issue.summary.status].color}
                  label={issueStatusMeta[issue.summary.status].label}
                />
                <Chip
                  size="small"
                  color={issuePriorityMeta[issue.summary.priority].color}
                  label={issuePriorityMeta[issue.summary.priority].label}
                  variant={issue.summary.priority === IssuePriority.P4_Low ? 'outlined' : 'filled'}
                />
              </Stack>
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={issue.summary.status}
                onChange={(event) => onChangeStatus(event.target.value as IssueStatus)}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {issueStatusMeta[status].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Responsável:</strong> {issue.summary.assignedToUserName ?? 'Não definido'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutlineIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {issueTypeLabel[issue.summary.type]}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleIcon fontSize="small" color={getOverdueStatus(issue.summary) ? 'error' : 'action'} />
                  <Typography variant="body2" color={getOverdueStatus(issue.summary) ? 'error' : undefined}>
                    <strong>Prazo:</strong> {formatDate(issue.summary.dueDate)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>SLA resposta:</strong> {formatDate(issue.summary.responseDueDate)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Local:</strong> {issue.summary.location ?? 'Não informado'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PriorityHighIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Disciplina:</strong> {issue.summary.discipline ?? 'Não informada'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <DescriptionIcon fontSize="small" color="action" />
                <Typography variant="subtitle2">Descrição</Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }} color={issue.description ? 'text.primary' : 'text.secondary'}>
                {issue.description ?? 'Nenhuma descrição detalhada foi informada.'}
              </Typography>
            </Box>

            {issue.rfiQuestion ? (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutlineIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">Pergunta RFI</Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>{issue.rfiQuestion}</Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }} color="text.secondary">
                  Resposta
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }} color={issue.rfiAnswer ? 'text.primary' : 'text.secondary'}>
                  {issue.rfiAnswer ?? 'Aguardando resposta.'}
                </Typography>
              </Box>
            ) : null}

            {issue.attachments.length > 0 ? (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachFileIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">Anexos</Typography>
                </Stack>
                <List dense sx={{ mt: 1 }}>
                  {issue.attachments.map((attachment) => (
                    <ListItem key={attachment.id} disablePadding>
                      <ListItemButton
                        component="a"
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ListItemIcon>
                          <AttachFileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.fileName}
                          secondary={attachment.uploadedByUserName ? `Enviado por ${attachment.uploadedByUserName}` : undefined}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : null}

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon fontSize="small" color="action" />
                <Typography variant="subtitle2">Links relacionados</Typography>
              </Stack>
              {issue.links.length > 0 ? (
                <List dense sx={{ mt: 1 }}>
                  {issue.links.map((link) => (
                    <ListItem
                      key={link.id}
                      secondaryAction={
                        <Tooltip title="Remover vínculo">
                          <IconButton edge="end" size="small" onClick={() => onRemoveLink(link.id)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemIcon>
                        <LinkIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label ?? linkTypeLabel[link.linkType]}
                        secondary={link.externalReference ?? 'Sem referência externa'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Nenhum vínculo cadastrado.
                </Typography>
              )}

              <Stack spacing={1} sx={{ mt: 2 }}>
                <FormControl size="small">
                  <InputLabel>Tipo do link</InputLabel>
                  <Select
                    label="Tipo do link"
                    value={linkTypeInput}
                    onChange={(event) => setLinkTypeInput(event.target.value as IssueLinkType)}
                  >
                    {linkTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {linkTypeLabel[option]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Rótulo"
                  value={linkLabelInput}
                  onChange={(event) => setLinkLabelInput(event.target.value)}
                />
                <TextField
                  size="small"
                  label="URL ou referência"
                  value={linkUrlInput}
                  onChange={(event) => setLinkUrlInput(event.target.value)}
                  placeholder="https://..."
                />
                <Button
                  variant="outlined"
                  startIcon={<AddLinkIcon />}
                  onClick={handleSubmitLink}
                  disabled={addingLink || !linkLabelInput.trim() || !linkUrlInput.trim()}
                >
                  {addingLink ? 'Adicionando...' : 'Adicionar link'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <CommentIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">Comentários</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {issue.comments.length} registro(s)
                </Typography>
              </Stack>

              <TextField
                sx={{ mt: 2 }}
                multiline
                minRows={3}
                fullWidth
                value={commentMessage}
                onChange={(event) => setCommentMessage(event.target.value)}
                placeholder="Compartilhe uma atualização ou dúvida..."
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                <FormControlLabel
                  control={<Switch checked={commentInternal} onChange={(event) => setCommentInternal(event.target.checked)} />}
                  label="Comentário interno"
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSubmitComment}
                  disabled={addingComment || commentMessage.trim().length === 0}
                >
                  {addingComment ? 'Enviando...' : 'Adicionar comentário'}
                </Button>
              </Stack>

              {issue.comments.length > 0 ? (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {[...issue.comments].reverse().map((comment) => (
                    <Paper key={comment.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {(comment.authorName ?? 'ARX')[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{comment.authorName ?? 'Usuário'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(comment.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        {comment.isInternal ? <Chip size="small" label="Interno" color="secondary" /> : null}
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1.5 }}>
                        {comment.message}
                      </Typography>
                      {comment.attachments.length > 0 ? (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {comment.attachments.map((attachment) => (
                            <Chip
                              key={attachment.id}
                              label={attachment.fileName}
                              size="small"
                              icon={<AttachFileIcon fontSize="small" />}
                              component="a"
                              clickable
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Nenhum comentário registrado ainda.
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
            <Typography color="text.secondary" align="center">
              Selecione uma issue na lista para visualizar os detalhes.
            </Typography>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export const Issues: React.FC = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [issueScope, setIssueScope] = useState<'all' | 'issues' | 'rfis'>('all');
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([]);
  const [onlyBlocking, setOnlyBlocking] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [issueDetail, setIssueDetail] = useState<IssueDetail | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const result = await projectService.getAll();
        setProjects(result);
        if (result.length > 0) {
          setSelectedProjectId(result[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!selectedProjectId) {
        setIssues([]);
        return;
      }

      setLoadingIssues(true);
      try {
        const isRfiParam = issueScope === 'all' ? undefined : issueScope === 'rfis';
        const data = await issueService.getByProject(selectedProjectId, { isRfi: isRfiParam });
        setIssues(data);
      } catch (error) {
        console.error('Erro ao carregar issues:', error);
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchIssues();
  }, [selectedProjectId, issueScope, reloadToken]);

  const filteredIssues = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          issue.referenceCode,
          issue.title,
          issue.assignedToUserName,
          issue.reportedByUserName,
          issue.respondedByUserName,
          issue.discipline,
          issue.location,
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(issue.status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(issue.priority);
      const matchesBlocking = !onlyBlocking || issue.isBlocking;

      return matchesSearch && matchesStatus && matchesPriority && matchesBlocking;
    });
  }, [issues, searchTerm, statusFilter, priorityFilter, onlyBlocking]);

  const stats = useMemo(() => {
    const now = Date.now();
    const openStatuses = new Set<IssueStatus>([
      IssueStatus.Open,
      IssueStatus.InAnalysis,
      IssueStatus.AwaitingResponse,
    ]);

    const total = issues.length;
    const open = issues.filter((issue) => openStatuses.has(issue.status)).length;
    const overdue = issues.filter(
      (issue) => issue.dueDate && !isClosedStatus(issue.status) && new Date(issue.dueDate).getTime() < now,
    ).length;
    const blocking = issues.filter((issue) => issue.isBlocking).length;

    return { total, open, overdue, blocking };
  }, [issues]);

  const columns: GridColDef<IssueSummary>[] = useMemo(
    () => [
      {
        field: 'referenceCode',
        headerName: 'Código',
        width: 150,
      },
      {
        field: 'title',
        headerName: 'Título',
        flex: 1,
        minWidth: 240,
        renderCell: (params: GridRenderCellParams<IssueSummary>) => (
          <Stack spacing={0.5} sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {params.row.title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {params.row.isRfi ? <Chip size="small" label="RFI" color="secondary" /> : null}
              {params.row.isBlocking ? <Chip size="small" label="Bloqueio" color="error" /> : null}
            </Stack>
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 160,
        renderCell: (params) => {
          const status = params.value as IssueStatus;
          const meta = issueStatusMeta[status];
          return <Chip size="small" label={meta.label} color={meta.color} />;
        },
      },
      {
        field: 'priority',
        headerName: 'Prioridade',
        width: 150,
        renderCell: (params) => {
          const priority = params.value as IssuePriority;
          const meta = issuePriorityMeta[priority];
          return (
            <Chip
              size="small"
              label={meta.label}
              color={meta.color}
              variant={priority === IssuePriority.P4_Low ? 'outlined' : 'filled'}
            />
          );
        },
      },
      {
        field: 'assignedToUserName',
        headerName: 'Responsável',
        width: 190,
        valueGetter: (_value, row) => row.assignedToUserName ?? '-',
      },
      {
        field: 'dueDate',
        headerName: 'Prazo',
        width: 140,
        renderCell: (params: GridRenderCellParams<IssueSummary>) => {
          const issue = params.row;
          if (!issue.dueDate) {
            return '-';
          }
          const overdue = getOverdueStatus(issue);
          return (
            <Typography variant="body2" color={overdue ? 'error' : undefined} fontWeight={overdue ? 600 : 400}>
              {formatDate(issue.dueDate)}
            </Typography>
          );
        },
      },
      {
        field: 'responseDueDate',
        headerName: 'SLA',
        width: 140,
        valueGetter: (_value, row) => formatDate(row.responseDueDate),
      },
      {
        field: 'type',
        headerName: 'Tipo',
        width: 170,
        valueFormatter: (value) => issueTypeLabel[value as IssueType],
      },
      {
        field: 'createdAt',
        headerName: 'Criado em',
        width: 150,
        valueGetter: (_value, row) => formatDate(row.createdAt),
      },
    ],
    [],
  );

  const handleSelectIssue = async (issueId: string) => {
    setSelectedIssueId(issueId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await issueService.getById(issueId);
      setIssueDetail(detail);
    } catch (error) {
      console.error('Erro ao carregar detalhes da issue:', error);
      setIssueDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChangeStatus = async (status: IssueStatus) => {
    if (!selectedIssueId || !issueDetail || issueDetail.summary.status === status) {
      return;
    }
    try {
      await issueService.updateStatus(selectedIssueId, status);
      const updatedAtIso = new Date().toISOString();
      setIssueDetail((prev) =>
        prev
          ? {
              ...prev,
              summary: {
                ...prev.summary,
                status,
                updatedAt: updatedAtIso,
              },
            }
          : prev,
      );
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === selectedIssueId
            ? {
                ...issue,
                status,
                updatedAt: updatedAtIso,
              }
            : issue,
        ),
      );
    } catch (error) {
      console.error('Erro ao atualizar status da issue:', error);
    }
  };

  const handleAddComment = async (payload: IssueCommentCreateRequest) => {
    if (!selectedIssueId) {
      return;
    }
    setAddingComment(true);
    try {
      const newComment = await issueService.addComment(selectedIssueId, payload);
      setIssueDetail((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev,
      );
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setAddingComment(false);
    }
  };

  const handleAddLink = async (payload: IssueLinkCreateRequest) => {
    if (!selectedIssueId) {
      return;
    }
    setAddingLink(true);
    try {
      const newLink = await issueService.addLink(selectedIssueId, payload);
      setIssueDetail((prev) => (prev ? { ...prev, links: [...prev.links, newLink] } : prev));
    } catch (error) {
      console.error('Erro ao adicionar link:', error);
    } finally {
      setAddingLink(false);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!selectedIssueId) {
      return;
    }
    try {
      await issueService.removeLink(selectedIssueId, linkId);
      setIssueDetail((prev) =>
        prev ? { ...prev, links: prev.links.filter((link) => link.id !== linkId) } : prev,
      );
    } catch (error) {
      console.error('Erro ao remover link:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setOnlyBlocking(false);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Issues & RFIs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Centralize o acompanhamento de problemas, RFIs e bloqueios críticos das obras.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FilterAltIcon />} onClick={handleClearFilters}>
            Limpar filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => setReloadToken((prev) => prev + 1)}
            disabled={loadingIssues}
          >
            Atualizar
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registros totais
                  </Typography>
                  <Typography variant="h5">{stats.total}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BugReportIcon />
                </Avatar>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {issues.filter((issue) => issue.isRfi).length} RFIs catalogadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Em andamento
                  </Typography>
                  <Typography variant="h5">{stats.open}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PendingActionsIcon />
                </Avatar>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Priorize respostas e aprovações pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Em atraso
                  </Typography>
                  <Typography variant="h5">{stats.overdue}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ErrorOutlineIcon />
                </Avatar>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Prazos expirados aguardando ação
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bloqueios críticos
                  </Typography>
                  <Typography variant="h5">{stats.blocking}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <ReportProblemIcon />
                </Avatar>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Itens impedindo avanço das frentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <TextField
            select
            label="Projeto"
            size="small"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
            {projects.length === 0 ? <MenuItem value="" disabled>Nenhum projeto cadastrado</MenuItem> : null}
          </TextField>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={issueScope}
            onChange={(_event, value) => {
              if (value) {
                setIssueScope(value);
              }
            }}
            color="primary"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="issues">Issues</ToggleButton>
            <ToggleButton value="rfis">RFIs</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por código, título, responsável..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as IssueStatus[])}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  'Todos'
                ) : (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selected.map((status) => (
                      <Chip key={status} size="small" label={issueStatusMeta[status].label} />
                    ))}
                  </Stack>
                )
              }
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={statusFilter.indexOf(status) > -1} />
                  <ListItemText primary={issueStatusMeta[status].label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              multiple
              label="Prioridade"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as IssuePriority[])}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  'Todas'
                ) : (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selected.map((priority) => (
                      <Chip key={priority} size="small" label={issuePriorityMeta[priority].label} />
                    ))}
                  </Stack>
                )
              }
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  <Checkbox checked={priorityFilter.indexOf(priority) > -1} />
                  <ListItemText primary={issuePriorityMeta[priority].label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch checked={onlyBlocking} onChange={(event) => setOnlyBlocking(event.target.checked)} />}
            label="Somente bloqueios"
          />
        </Stack>
      </Stack>

      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid
          rows={filteredIssues}
          columns={columns}
          loading={loadingIssues}
          getRowId={(row) => row.id}
          onRowClick={(params) => handleSelectIssue(params.row.id)}
          disableRowSelectionOnClick
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      <IssueDetailPanel
        open={detailOpen}
        issue={issueDetail}
        loading={detailLoading}
        onClose={() => setDetailOpen(false)}
        onChangeStatus={handleChangeStatus}
        onAddComment={handleAddComment}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
        addingComment={addingComment}
        addingLink={addingLink}
      />
    </Box>
  );
};
