import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { LinkedIn, Language, Description, Support } from '@mui/icons-material';
import env from '../../config/env';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {env.appName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {env.companyName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Versão {env.appVersion}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Links Úteis
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link
                href={env.links.avilasolucoes}
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
                underline="hover"
                variant="body2"
              >
                Avila Soluções
              </Link>
              <Link
                href={env.links.aviladevelopment}
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
                underline="hover"
                variant="body2"
              >
                Avila Development
              </Link>
              <Link
                href={env.links.documentacao}
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
                underline="hover"
                variant="body2"
              >
                Documentação
              </Link>
              <Link
                href={env.links.suporte}
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
                underline="hover"
                variant="body2"
              >
                Suporte Técnico
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Redes Sociais
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                component="a"
                href={env.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
                aria-label="LinkedIn"
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                component="a"
                href={env.links.avilasolucoes}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
                aria-label="Website"
              >
                <Language />
              </IconButton>
              <IconButton
                component="a"
                href={env.links.documentacao}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
                aria-label="Documentação"
              >
                <Description />
              </IconButton>
              <IconButton
                component="a"
                href={env.links.suporte}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
                aria-label="Suporte"
              >
                <Support />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {env.companyName}. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
