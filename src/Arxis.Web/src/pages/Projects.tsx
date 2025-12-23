import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { projectService } from '../services/projectService';

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

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

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' | 'primary' | 'secondary' | 'info' => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'primary'> = {
      'Active': 'success',
      'Planning': 'primary',
      'OnHold': 'warning',
      'Completed': 'default',
      'Cancelled': 'error',
    };
    return statusMap[status] || 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome do Projeto',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'client',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'totalBudget',
      headerName: 'Orçamento',
      width: 150,
      valueFormatter: (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      },
    },
    {
      field: 'startDate',
      headerName: 'Início',
      width: 120,
      valueFormatter: (value?: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'endDate',
      headerName: 'Término',
      width: 120,
      valueFormatter: (value?: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
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
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Projetos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie todos os projetos de obras
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Novo Projeto
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={projects}
          columns={columns}
          loading={loading}
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
