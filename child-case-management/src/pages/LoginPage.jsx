import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useFormik } from 'formik';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import { loginValidationSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const result = await login(values.email, values.password);
        if (result.success) {
          toast.success('Welcome back!');
          navigate(from, { replace: true });
        } else {
          setError(result.message || 'Invalid credentials');
        }
      } catch (err) {
        setError(err.message || 'Login failed');
      }
    },
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          margin="normal"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
            label="Remember me"
          />
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Forgot password?
          </Link>
        </Box>

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          By signing in, you agree to our{' '}
          <Link component={RouterLink} to="/terms">Terms</Link> and{' '}
          <Link component={RouterLink} to="/privacy">Privacy Policy</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
