import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { setCredentials } from '../../store/authSlice'

const Login = () => {
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use direct fetch instead of axios to avoid any config issues
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
    
      // Check if response has BOM (Byte Order Mark) - that "ï»¿" you see
      const text = await response.text()
     
      
      // Remove BOM if present
      const cleanText = text.replace(/^\uFEFF/, '').replace(/^ï»¿/, '')
      
      let data;
      try {
        data = JSON.parse(cleanText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid JSON response from server')
      }
      

      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response format from server')
      }

      // Dispatch to Redux
      dispatch(setCredentials({ 
        user: data.user, 
        token: data.token 
      }))
      
      // Also store in localStorage for persistence
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
    
      
      // Navigate to dashboard
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Test the API directly
  const testApi = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@test.com', 
          password: 'password123' 
        })
      })
      
      const text = await response.text()
      const cleanText = text.replace(/^\uFEFF/, '').replace(/^ï»¿/, '')
      const data = JSON.parse(cleanText)
      
      alert(`API Test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nToken: ${data.token ? 'Received ✓' : 'Missing ✗'}`)
      console.log('Test result:', data)
    } catch (error) {
      alert('API Test Failed: ' + error.message)
    }
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '85vh',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 460,
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1.5 }} />
            <Typography
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: '1.15rem',
                mb: 0.5,
              }}
            >
              Child Protection Case Management
            </Typography>
           
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              margin="normal"
              required
              disabled={loading}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              margin="normal"
              required
              disabled={loading}
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: 42,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Test Account:</strong> admin@test.com / password123
            </Typography>
          </Box>

          {/* Debug buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setEmail('admin@test.com')
                setPassword('password123')
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Fill Credentials
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login