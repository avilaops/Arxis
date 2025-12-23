import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const Issues: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Issues
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Gerencie problemas e RFIs dos projetos
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Página de issues em desenvolvimento...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Sistema de gerenciamento de issues e RFIs será implementado
        </Typography>
      </Paper>
    </Box>
  );
};
