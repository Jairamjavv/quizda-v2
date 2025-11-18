import React, { useState } from 'react'
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useSession } from '../services/sessionManager'
import { Button, Text } from './ui'
import { spacing } from '../theme/constants'

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
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button component={Link} to="/landing" variant="ghost" sx={{ fontSize: '1.25rem', fontWeight: 600, p: spacing.sm }}>
            Quizda
          </Button>
        </Box>

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
              <Text as="body2" sx={{ ml: spacing.xs }}>
                {user.username}
              </Text>
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
            <Button component={Link} to="/login" variant="ghost" sx={{ mr: spacing.xs }}>
              Login
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="outline"
              sx={{ mr: spacing.md }}
            >
              Register
            </Button>
          </>
        )}

        {/* Theme Toggle */}
        <IconButton
          onClick={onToggleMode}
          sx={{ color: 'text.primary' }}
        >
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header
