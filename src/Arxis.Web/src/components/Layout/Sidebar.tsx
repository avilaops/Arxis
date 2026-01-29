import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Folder,
  Assignment,
  BugReport,
  Assessment,
  Settings,
  People,
  Timeline,
  ThreeDRotation,
  Map,
  Paid,
  ShoppingCart,
  Description,
  Security,
  Analytics,
  Hub,
  Storefront,
  AutoAwesome,
  Tune,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { activityModules } from '../../config/navigation';

const drawerWidth = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  Folder: <Folder />,
  Assignment: <Assignment />,
  BugReport: <BugReport />,
  Assessment: <Assessment />,
  Settings: <Settings />,
  People: <People />,
  Timeline: <Timeline />,
  ThreeDRotation: <ThreeDRotation />,
  Map: <Map />,
  Paid: <Paid />,
  ShoppingCart: <ShoppingCart />,
  Description: <Description />,
  Security: <Security />,
  Analytics: <Analytics />,
  Hub: <Hub />,
  Storefront: <Storefront />,
  AutoAwesome: <AutoAwesome />,
  Tune: <Tune />,
  AdminPanelSettings: <AdminPanelSettings />,
};

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const primaryModules = activityModules.filter(
    (module) => module.id !== 'settings' && module.id !== 'admin'
  );
  const secondaryModules = activityModules.filter((module) => module.id === 'settings' || module.id === 'admin');

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {primaryModules.map((module) => (
            <ListItem key={module.id} disablePadding>
              <ListItemButton
                selected={isActive(module.path)}
                onClick={() => handleNavigation(module.path)}
              >
                <ListItemIcon sx={{ color: isActive(module.path) ? 'primary.main' : 'inherit' }}>
                  {iconMap[module.icon]}
                </ListItemIcon>
                <ListItemText
                  primary={module.label}
                  secondary={module.description}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />
        <List>
          {secondaryModules.map((module) => (
            <ListItem key={module.id} disablePadding>
              <ListItemButton
                selected={isActive(module.path)}
                onClick={() => handleNavigation(module.path)}
              >
                <ListItemIcon sx={{ color: isActive(module.path) ? 'primary.main' : 'inherit' }}>
                  {iconMap[module.icon]}
                </ListItemIcon>
                <ListItemText primary={module.label} secondary={module.description} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ARXIS v1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
