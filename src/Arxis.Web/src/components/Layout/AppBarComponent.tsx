import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Button,
  ListItemText,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Logout,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { topBarMenus, globalShortcuts } from '../../config/navigation';

interface AppBarComponentProps {
  onMenuClick: () => void;
}

export const AppBarComponent: React.FC<AppBarComponentProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ id: string | null; anchor: HTMLElement | null }>({
    id: null,
    anchor: null,
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileClose();
  };

  const handleMenuOpen = (menuId: string) => (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor({ id: menuId, anchor: event.currentTarget });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ id: null, anchor: null });
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ mr: 3 }}>
          ARXIS - Gerenciamento de Obras
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, flexGrow: 1 }}>
          {topBarMenus.map((menu) => (
            <React.Fragment key={menu.id}>
              <Button
                color="inherit"
                onClick={handleMenuOpen(menu.id)}
                aria-haspopup="true"
                aria-controls={`${menu.id}-menu`}
                sx={{ textTransform: 'none' }}
              >
                {menu.label}
              </Button>
              <Menu
                id={`${menu.id}-menu`}
                anchorEl={menuAnchor.anchor}
                open={menuAnchor.id === menu.id}
                onClose={handleMenuClose}
                MenuListProps={{ sx: { minWidth: 280 } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                {menu.items.map((item) => (
                  <MenuItem key={item.label} onClick={handleMenuClose}>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </MenuItem>
                ))}
              </Menu>
            </React.Fragment>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={globalShortcuts[0]?.description ?? 'Abrir busca global'}>
            <IconButton color="inherit" onClick={() => setCommandPaletteOpen(true)}>
              <Search />
            </IconButton>
          </Tooltip>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleProfileClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Perfil
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      </AppBar>
      <Dialog open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{globalShortcuts[0]?.label ?? 'Busca global'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Digite para procurar qualquer coisa no ARXIS"
            type="search"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommandPaletteOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
