import { Container, Paper, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import WarningIcon from '@mui/icons-material/Warning'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            You don't have permission to access this page.
            Please contact your administrator if you believe this is an error.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            Login with Different Account
          </Button>
        </Paper>
      </Box>
    </Container>
  )
}

export default Unauthorized