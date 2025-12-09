import React from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

const Settings = () => {
  const { getUserName, isAdmin } = useAuth()

  if (!isAdmin) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Access denied. Administrator privileges required.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" color="textSecondary">
            System Configuration
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Welcome to system settings, {getUserName()}. This section is for administrators only.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Settings