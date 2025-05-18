import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
} from '@mui/icons-material';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  // TODO: Replace with actual auth state management
  const isAuthenticated = false;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ArgumentativeWriter
        </Typography>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/prompts">
            Writing Prompts
          </Button>
          <Button color="inherit" component={RouterLink} to="/essay-builder">
            Essay Builder
          </Button>
          
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My Essays</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu */}
        <Menu
          id="mobile-menu"
          anchorEl={mobileMenuAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleClose}
        >
          <MenuItem component={RouterLink} to="/" onClick={handleClose}>
            Dashboard
          </MenuItem>
          <MenuItem component={RouterLink} to="/prompts" onClick={handleClose}>
            Writing Prompts
          </MenuItem>
          <MenuItem component={RouterLink} to="/essay-builder" onClick={handleClose}>
            Essay Builder
          </MenuItem>
          {isAuthenticated ? (
            [
              <MenuItem key="profile" onClick={handleClose}>Profile</MenuItem>,
              <MenuItem key="essays" onClick={handleClose}>My Essays</MenuItem>,
              <MenuItem key="logout" onClick={handleClose}>Logout</MenuItem>
            ]
          ) : (
            [
              <MenuItem key="login" component={RouterLink} to="/login" onClick={handleClose}>
                Login
              </MenuItem>,
              <MenuItem key="register" component={RouterLink} to="/register" onClick={handleClose}>
                Register
              </MenuItem>
            ]
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 