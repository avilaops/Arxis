import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const Tasks: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tarefas
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Gerencie todas as tarefas dos projetos
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Página de tarefas em desenvolvimento...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Implementação do DataGrid e Kanban Board será feita em breve
        </Typography>
      </Paper>
    </Box>
  );
};
