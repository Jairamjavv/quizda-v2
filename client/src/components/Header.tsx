import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button, Menu, MenuItem, Avatar, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useSession } from '../services/sessionManager'

interface HeaderProps {
  mode: 'light' | 'dark'
  onToggleMode: () => void
}

const Header: React.FC<HeaderProps> = ({ mode, onToggleMode }) => {
  const { user, isAuthenticated, logout } = useSession()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    navigate('/landing')
  }

  const handleDashboard = () => {
    handleMenuClose()
    if (user?.role === 'admin') {
      navigate('/dashboard/admin')
    } else if (user?.role === 'contributor') {
      navigate('/dashboard/contributor')
    } else {
      navigate('/dashboard/attempter')
    }
  }

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'var(--surface)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'var(--text-primary)' }}>
          <Button component={Link} to="/landing" sx={{ textTransform: 'none', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>
            Quizda
          </Button>
        </Typography>

        {isAuthenticated && user ? (
          <>
            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={anchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Typography variant="body2" sx={{ ml: 1, color: 'var(--text-primary)' }}>
                {user.username}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleDashboard}>
                Dashboard ({user.role})
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            {/* Login/Register Buttons */}
            <Button component={Link} to="/login" sx={{ color: 'var(--text-primary)', mr: 1 }}>
              Login
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="outlined"
              sx={{ 
                color: 'var(--text-primary)', 
                mr: 2,
                borderColor: 'var(--primary-green)',
                '&:hover': {
                  borderColor: 'var(--primary-green)',
                  bgcolor: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              Register
            </Button>
          </>
        )}

        {/* Theme Toggle */}
        <IconButton
          onClick={onToggleMode}
          sx={{ color: 'var(--text-primary)' }}
        >
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header
