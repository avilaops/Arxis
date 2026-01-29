import React from 'react'
import { Box, Typography, Grid, Card, CardContent, Chip, Stack } from '@mui/material'
import { ModuleDefinition } from '../config/navigation'

interface ModuleLandingProps {
  module: ModuleDefinition
}

export const ModuleLanding: React.FC<ModuleLandingProps> = ({ module }) => {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          {module.label}
        </Typography>
        <Chip label="Blueprint" color="primary" variant="outlined" />
      </Stack>
      <Typography variant="body1" color="text.secondary" paragraph>
        {module.description}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {module.pages.map((page) => (
          <Grid item xs={12} md={6} key={page.name}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {page.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {page.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
