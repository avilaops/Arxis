import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ContentCopy as ContentCopyIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { projectService, ProjectStatus, ProjectType } from '../services/projectService';

type Project = Awaited<ReturnType<typeof projectService.getAll>> extends (infer R)[] ? R : never;

const statusOptions = ['Planning', 'InProgress', 'OnHold', 'Completed', 'Archived', 'Cancelled'] as const;

type StatusKey = (typeof statusOptions)[number];

const statusColorMap: Record<StatusKey, 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'> = {
  Planning: 'primary',
  InProgress: 'success',
  OnHold: 'warning',
  Completed: 'default',
  Archived: 'secondary',
  Cancelled: 'error',
};

const statusLabelMap: Record<StatusKey, string> = {
  Planning: 'Planejamento',
  InProgress: 'Em andamento',
  OnHold: 'Em espera',
  Completed: 'Concluído',
  Archived: 'Arquivado',
  Cancelled: 'Cancelado',
};

const typeLabelMap: Record<ProjectType, string> = {
  [ProjectType.Residential]: 'Residencial',
  [ProjectType.Commercial]: 'Comercial',
  [ProjectType.Industrial]: 'Industrial',
  [ProjectType.Infrastructure]: 'Infraestrutura',
  [ProjectType.Hospital]: 'Hospitalar',
  [ProjectType.Educational]: 'Educacional',
  [ProjectType.Other]: 'Outros',
};

const formatCurrency = (value?: number, currency?: string) => {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency ?? 'BRL',
  }).format(value);
};

const isStatusKey = (value: string): value is StatusKey =>
  statusOptions.includes(value as StatusKey);

const getStatusKey = (status: ProjectStatus): StatusKey => {
  const result = ProjectStatus[status];
  if (typeof result === 'string' && isStatusKey(result)) {
    return result;
  }
  return 'Planning';
};

const getTypeLabel = (type?: ProjectType) => {
  if (type === undefined) return '-';
  return typeLabelMap[type] ?? 'Outros';
};

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | typeof statusOptions[number]>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const availableTags = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.tags ?? []))).filter(Boolean).sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const statusKey = getStatusKey(project.status);
      const matchesStatus = statusFilter === 'all' || statusKey === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [project.name, project.client, project.city]
          .filter((field): field is string => Boolean(field))
          .some((field) => field.toLowerCase().includes(normalizedSearch));
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => project.tags?.includes(tag));

      return matchesStatus && matchesSearch && matchesTags;
    });
  }, [projects, searchTerm, statusFilter, selectedTags]);

  const columns: GridColDef<Project>[] = [
    {
      field: 'name',
      headerName: 'Nome do Projeto',
      flex: 1.1,
      minWidth: 220,
    },
    {
      field: 'client',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 160,
      valueGetter: (params: any) => params.value ?? '-',
    },
    {
      field: 'city',
      headerName: 'Cidade',
      width: 140,
      valueGetter: (params: any) => {
        const { city, state } = params.row;
        if (city) {
          return state ? `${city}/${state}` : city;
        }
        return state ?? '-';
      },
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150,
      valueFormatter: (params: any) => getTypeLabel(params.value as ProjectType | undefined),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: any) => {
        const statusKey = getStatusKey(params.value as ProjectStatus);
        return (
          <Chip
            label={statusLabelMap[statusKey] ?? statusKey}
            color={statusColorMap[statusKey] ?? 'default'}
            size="small"
          />
        );
      },
      valueFormatter: (params: any) => {
        const value = params.value as ProjectStatus | undefined;
        if (value === undefined) return '-';
        const statusKey = getStatusKey(value);
        return statusLabelMap[statusKey] ?? statusKey;
      },
    },
    {
      field: 'totalBudget',
      headerName: 'Orçamento',
      width: 160,
      valueFormatter: (params: any) => formatCurrency(params.row.totalBudget, params.row.currency),
    },
    {
      field: 'startDate',
      headerName: 'Início',
      width: 120,
      valueFormatter: (value?: string) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-'),
    },
    {
      field: 'endDate',
      headerName: 'Término',
      width: 120,
      valueFormatter: (value?: string) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-'),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => {
        const tags = params.value ?? [];
        const displayTags = tags.slice(0, 3);
        const extraCount = tags.length - displayTags.length;

        return (
          <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden' }}>
            {displayTags.map((tag: string) => (
              <Chip key={tag} label={tag} size="small" icon={<LocalOfferIcon fontSize="small" />} />
            ))}
            {extraCount > 0 ? (
              <Chip label={`+${extraCount}`} size="small" variant="outlined" />
            ) : null}
          </Stack>
        );
      },
      sortable: false,
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 160,
      sortable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Visualizar">
            <IconButton size="small" color="primary">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" color="default">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleStatusChange = (_event: React.MouseEvent<HTMLElement>, value: typeof statusFilter) => {
    if (value !== null) {
      setStatusFilter(value);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((current) => current !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedTags([]);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Projetos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie todas as obras com filtros por status, tags e templates.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={clearFilters}>
            Limpar filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(event) => setActionsAnchor(event.currentTarget)}
          >
            Novo Projeto
          </Button>
          <Menu anchorEl={actionsAnchor} open={Boolean(actionsAnchor)} onClose={() => setActionsAnchor(null)}>
            <MenuItem onClick={() => setActionsAnchor(null)}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} /> Criar do zero
            </MenuItem>
            <MenuItem onClick={() => setActionsAnchor(null)}>
              <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicar projeto existente
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setActionsAnchor(null)}>
              <FileUploadIcon fontSize="small" sx={{ mr: 1 }} /> Importar (Excel/CSV)
            </MenuItem>
            <MenuItem onClick={() => setActionsAnchor(null)}>
              <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} /> Exportar portfólio
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar por nome, cliente ou cidade"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={handleStatusChange}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all">Todos</ToggleButton>
          {statusOptions.map((status) => (
            <ToggleButton key={status} value={status}>
              {statusLabelMap[status] ?? status}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {availableTags.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableTags.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => toggleTag(tag)}
                  icon={<LocalOfferIcon fontSize="small" />}
                />
              );
            })}
          </Stack>
        ) : null}
      </Stack>

      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid
          rows={filteredProjects}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
};
