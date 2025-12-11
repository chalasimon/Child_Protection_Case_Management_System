// src/pages/CasesPage.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Assignment as AssignmentIcon,
  Report as ReportIcon,
  FolderOpen as FolderOpenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../api/index'

const CasesPage = () => {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    investigation: 0,
    resolved: 0,
    newThisWeek: 0
  })
  const navigate = useNavigate()

  // ✅ FIXED: Fetch cases from API with proper response handling
  const fetchCases = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cases')
      console.log('Cases API response:', response)
      
      // ✅ Handle different Laravel response structures
      let casesData = []
      
      // If response is already an array
      if (Array.isArray(response)) {
        casesData = response
      }
      // If response has data property (common Laravel pattern)
      else if (response && response.data) {
        // Check if it's paginated response
        if (Array.isArray(response.data)) {
          casesData = response.data
        }
        // Check if data.data exists (Laravel paginated with meta)
        else if (response.data.data && Array.isArray(response.data.data)) {
          casesData = response.data.data
        }
      }
      
      console.log('Processed cases data:', casesData)
      setCases(casesData)
      calculateStats(casesData)
      setError('')
    } catch (err) {
      console.error('Failed to fetch cases:', err)
      console.error('Error details:', err.response?.data || err.message)
      
      if (err.status === 404) {
        setError('Cases API endpoint not found. Check your Laravel routes.')
      } else if (err.status === 401) {
        setError('Session expired. Please login again.')
        // Optionally redirect to login
        // navigate('/login')
      } else {
        setError(err.message || 'Failed to load cases')
      }
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Calculate statistics with null checks
  const calculateStats = (casesData) => {
    if (!casesData || !Array.isArray(casesData)) {
      setStats({ total: 0, active: 0, investigation: 0, resolved: 0, newThisWeek: 0 })
      return
    }
    
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const total = casesData.length
    const active = casesData.filter(c => 
      c && ['reported', 'assigned', 'under_investigation', 'investigation'].includes(c.status)
    ).length
    const investigation = casesData.filter(c => 
      c && ['under_investigation', 'investigation'].includes(c.status)
    ).length
    const resolved = casesData.filter(c => 
      c && ['resolved', 'closed'].includes(c.status)
    ).length
    
    const newThisWeek = casesData.filter(c => {
      if (!c) return false
      const dateStr = c.created_at || c.reporting_date || c.report_datetime
      if (!dateStr) return false
      try {
        const created = new Date(dateStr)
        return !isNaN(created.getTime()) && created > oneWeekAgo
      } catch (e) {
        console.warn('Invalid date format:', dateStr)
        return false
      }
    }).length

    setStats({ total, active, investigation, resolved, newThisWeek })
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const handleMenuOpen = (event, caseItem) => {
    setAnchorEl(event.currentTarget)
    setSelectedCase(caseItem)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCase(null)
  }

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      try {
        await api.delete(`/cases/${caseId}`)
        setError('')
        fetchCases() // Refresh the list
      } catch (err) {
        console.error('Failed to delete case:', err)
        setError('Failed to delete case')
      }
    }
  }

  const getPriorityColor = (priority) => {
    if (!priority) return 'default'
    switch (priority.toLowerCase()) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    if (!status) return <FolderOpenIcon fontSize="small" />
    switch (status.toLowerCase()) {
      case 'reported':
      case 'active':
        return <WarningIcon fontSize="small" />
      case 'assigned':
      case 'under_investigation':
      case 'investigation':
        return <PendingIcon fontSize="small" />
      case 'resolved':
      case 'closed':
        return <CheckIcon fontSize="small" />
      default:
        return <FolderOpenIcon fontSize="small" />
    }
  }

  const getStatusColor = (status) => {
    if (!status) return 'default'
    switch (status.toLowerCase()) {
      case 'reported':
      case 'active':
        return 'error'
      case 'assigned':
      case 'under_investigation':
      case 'investigation':
        return 'warning'
      case 'resolved':
      case 'closed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown'
    const labels = {
      'reported': 'Reported',
      'assigned': 'Assigned',
      'under_investigation': 'Under Investigation',
      'investigation': 'Investigation',
      'resolved': 'Resolved',
      'closed': 'Closed',
      'reopened': 'Reopened'
    }
    return labels[status.toLowerCase()] || status
  }

  const getAbuseTypeLabel = (type) => {
    if (!type) return 'Unknown'
    const labels = {
      'sexual_abuse': 'Sexual Abuse',
      'physical_abuse': 'Physical Abuse',
      'emotional_abuse': 'Emotional Abuse',
      'neglect': 'Neglect',
      'exploitation': 'Exploitation',
      'other': 'Other'
    }
    return labels[type.toLowerCase()] || type
  }

  const getAbuseTypeColor = (type) => {
    if (!type) return { bg: '#f0f0f0', text: '#666' }
    switch (type.toLowerCase()) {
      case 'sexual_abuse': return { bg: '#ff6b6b20', text: '#ff6b6b' }
      case 'physical_abuse': return { bg: '#4ecdc420', text: '#4ecdc4' }
      case 'emotional_abuse': return { bg: '#45b7d120', text: '#45b7d1' }
      case 'neglect': return { bg: '#96ceb420', text: '#96ceb4' }
      case 'exploitation': return { bg: '#ffd16620', text: '#ffd166' }
      default: return { bg: '#f0f0f0', text: '#666' }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Filter cases based on search
  const filteredCases = cases.filter(caseItem => {
    if (!caseItem) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      (caseItem.case_number || '').toLowerCase().includes(searchLower) ||
      (caseItem.case_title || '').toLowerCase().includes(searchLower) ||
      (caseItem.abuse_type || '').toLowerCase().includes(searchLower) ||
      (caseItem.location || '').toLowerCase().includes(searchLower) ||
      getAbuseTypeLabel(caseItem.abuse_type).toLowerCase().includes(searchLower)
    )
  })

  if (loading && cases.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading cases...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Case Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all abuse cases
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cases/new')}
          sx={{ borderRadius: 2 }}
        >
          New Case
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError('')}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchCases}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.active}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PendingIcon color="info" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {stats.investigation}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Under Investigation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReportIcon color="success" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.newThisWeek}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                New This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search cases by ID, title, type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderRadius: 2 }}
            disabled={cases.length === 0}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            onClick={fetchCases}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Paper>

      {/* Cases Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Case ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Case Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Abuse Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Report Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>
                      {cases.length === 0 ? 'No cases found' : 'No matching cases found'}
                    </Typography>
                    {cases.length === 0 && (
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/cases/new')}
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Create First Case
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((caseItem) => {
                  const typeColors = getAbuseTypeColor(caseItem.abuse_type)
                  return (
                    <TableRow 
                      key={caseItem.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {caseItem.case_number || `CASE-${caseItem.id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {caseItem.case_title || 'Untitled Case'}
                        </Typography>
                        {caseItem.case_description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {caseItem.case_description.substring(0, 60)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={getAbuseTypeLabel(caseItem.abuse_type)}
                          sx={{
                            bgcolor: typeColors.bg,
                            color: typeColors.text,
                            fontWeight: 500,
                            border: `1px solid ${typeColors.text}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={(caseItem.priority || 'medium').toUpperCase()}
                          color={getPriorityColor(caseItem.priority)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={getStatusIcon(caseItem.status)}
                          label={getStatusLabel(caseItem.status)}
                          color={getStatusColor(caseItem.status)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(caseItem.reporting_date || caseItem.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {caseItem.location || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, caseItem)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'primary.main'
                            }
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Results Count */}
      {filteredCases.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCases.length} of {cases.length} cases
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          navigate(`/cases/${selectedCase?.id}`)
          handleMenuClose()
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/cases/${selectedCase?.id}/edit`)
          handleMenuClose()
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Case
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteCase(selectedCase?.id)
            handleMenuClose()
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Case
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default CasesPage