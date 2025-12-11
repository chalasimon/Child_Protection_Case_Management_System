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
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import ShieldIcon from '@mui/icons-material/Shield'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { setCredentials } from '../../store/authSlice' // ✅ Now this exists!

const Login = () => {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting login...', { email })
      
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      console.log('Response status:', response.status)
      
      const text = await response.text()
      console.log('Raw response:', text.substring(0, 200))
      
      // Remove BOM if present
      const cleanText = text.replace(/^\uFEFF/, '').replace(/^ï»¿/, '')
      
      let data;
      try {
        data = JSON.parse(cleanText)
        console.log('Parsed data:', data)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', cleanText)
        throw new Error('Invalid response from server. Is Laravel running?')
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`)
      }
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response format. Token or user missing.')
      }

      // ✅ Use setCredentials (now available)
      dispatch(setCredentials({ 
        user: data.user, 
        token: data.token 
      }))
      
      console.log('Login successful!', { user: data.user.name, token: data.token.substring(0, 20) + '...' })
      
      // Navigate to dashboard
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please check credentials and ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Test API connection
  const testApi = async () => {
    setLoading(true)
    try {
      console.log('Testing API connection...')
      
      // Test health endpoint first
      const healthResponse = await fetch('http://localhost:8000/api/health')
      const healthText = await healthResponse.text()
      const cleanHealthText = healthText.replace(/^\uFEFF/, '').replace(/^ï»¿/, '')
      
      let healthData
      try {
        healthData = JSON.parse(cleanHealthText)
      } catch (e) {
        throw new Error(`Health endpoint returned invalid JSON: ${cleanHealthText.substring(0, 100)}`)
      }
      
      console.log('Health check:', healthData)
      
      // Test login endpoint
      const loginResponse = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@example.com', 
          password: 'password123' 
        })
      })
      
      const loginText = await loginResponse.text()
      const cleanLoginText = loginText.replace(/^\uFEFF/, '').replace(/^ï»¿/, '')
      
      console.log('Login test response:', loginResponse.status, cleanLoginText)
      
      try {
        const loginData = JSON.parse(cleanLoginText)
        
        let message = `API Test Results:\n\n`
        message += `✅ Health Check: ${healthData.status || 'OK'}\n`
        message += `✅ Login Endpoint: ${loginResponse.status}\n`
        message += `✅ Token: ${loginData.token ? 'Received ✓' : 'Missing ✗'}\n`
        message += `✅ User: ${loginData.user?.name || 'None'}\n\n`
        message += `Full response in browser console`
        
        alert(message)
        
        // Auto-fill if successful
        if (loginData.token) {
          setEmail('admin@example.com')
          setPassword('password123')
        }
        
      } catch (parseErr) {
        alert(`❌ JSON Parse Error:\nResponse: ${cleanLoginText.substring(0, 200)}`)
      }
      
    } catch (error) {
      console.error('API test error:', error)
      alert(`❌ API Test Failed:\n${error.message}\n\nMake sure:\n1. Laravel is running: php artisan serve\n2. Database is seeded\n3. CORS is configured`)
    } finally {
      setLoading(false)
    }
  }

  const checkStorage = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    let message = 'Local Storage Status:\n\n'
    message += `Token: ${token ? `✓ Present (${token.substring(0, 20)}...)` : '✗ Missing'}\n`
    
    if (user) {
      try {
        const userObj = JSON.parse(user)
        message += `User: ✓ ${userObj.name} (${userObj.email})\n`
        message += `Role: ${userObj.role}\n`
        message += `Authenticated: ${localStorage.getItem('token') ? 'Yes' : 'No'}`
      } catch (e) {
        message += `User: ✗ Invalid JSON`
      }
    } else {
      message += 'User: ✗ Missing'
    }
    
    alert(message)
  }

  const clearStorage = () => {
    localStorage.clear()
    alert('Local storage cleared! You will need to login again.')
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
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <ShieldIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <LockIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                mb: 0.5,
                color: 'primary.main',
              }}
            >
              Child Protection System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Case Management & Reporting Portal
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="email"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: 44,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                mt: 3,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
          </Divider>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login