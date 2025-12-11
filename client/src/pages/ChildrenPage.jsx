// src/pages/ChildrenPage.jsx
import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/index'

const ChildrenPage = () => {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    isAdmin,
    isFocalPerson,
    isSystemAdmin,
    isDirector
  } = useAuth()
  
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ FIXED: Fetch children data from API with proper response handling
  const fetchChildren = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get('/children')
      console.log('Children API response:', response)
      
      // ✅ Handle different Laravel response structures
      let childrenData = []
      
      // If response is already an array
      if (Array.isArray(response)) {
        childrenData = response
      }
      // If response has data property
      else if (response && response.data) {
        // Check if it's paginated response
        if (Array.isArray(response.data)) {
          childrenData = response.data
        }
        // Check if data.data exists (Laravel paginated with meta)
        else if (response.data.data && Array.isArray(response.data.data)) {
          childrenData = response.data.data
        }
      }
      
      console.log('Processed children data:', childrenData)
      setChildren(childrenData)
    } catch (err) {
      console.error('Failed to fetch children:', err)
      console.error('Error details:', err.response?.data || err.message)
      
      if (err.status === 401) {
        setError('Session expired. Please login again.')
      } else if (err.status === 404) {
        setError('Children API endpoint not found. Please check your Laravel routes.')
      } else if (err.status === 500) {
        setError('Server error. Please check your Laravel logs.')
      } else if (err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Make sure Laravel is running on http://localhost:8000')
      } else {
        setError(err.message || 'Failed to load children data')
      }
      
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if user is authenticated
    if (isAuthenticated) {
      fetchChildren()
    }
  }, [isAuthenticated])

  const handleViewChild = (child) => {
    setSelectedChild(child)
    setOpenDialog(true)
  }

  const handleEditChild = (childId) => {
    navigate(`/children/${childId}/edit`)
  }

  const handleDeleteChild = async (childId) => {
    if (window.confirm('Are you sure you want to delete this child record? This action cannot be undone.')) {
      try {
        await api.delete(`/children/${childId}`)
        setSuccess('Child record deleted successfully')
        setError('')
        fetchChildren() // Refresh the list
      } catch (err) {
        console.error('Failed to delete child:', err)
        setError('Failed to delete child record')
        setSuccess('')
      }
    }
  }

  const handleAddChild = () => {
    navigate('/children/new')
  }

  // Check if user has permission to modify children
  const canModifyChildren = isAdmin || isSystemAdmin || isFocalPerson

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    try {
      const birthDate = new Date(dob)
      if (isNaN(birthDate.getTime())) return 'Invalid date'
      
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch (error) {
      console.error('Error calculating age:', error)
      return 'N/A'
    }
  }

  const getGenderLabel = (gender) => {
    if (!gender) return 'Not specified'
    switch (gender.toLowerCase()) {
      case 'male': return 'Male'
      case 'female': return 'Female'
      case 'other': return 'Other'
      case 'prefer_not_to_disclose': return 'Prefer not to disclose'
      default: return gender
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const filteredChildren = children.filter(child => {
    if (!child) return false
    const searchLower = searchTerm.toLowerCase()
    
    // Create full name
    const fullName = `${child.first_name || ''} ${child.middle_name || ''} ${child.last_name || ''}`.toLowerCase()
    
    // Create case ID string
    const caseIdStr = child.case_id ? `case-${child.case_id}`.toLowerCase() : ''
    
    return (
      fullName.includes(searchLower) ||
      (child.first_name && child.first_name.toLowerCase().includes(searchLower)) ||
      (child.last_name && child.last_name.toLowerCase().includes(searchLower)) ||
      (child.middle_name && child.middle_name.toLowerCase().includes(searchLower)) ||
      (child.current_address && child.current_address.toLowerCase().includes(searchLower)) ||
      (child.guardian_phone && child.guardian_phone.includes(searchTerm)) ||
      (child.guardian_email && child.guardian_email.toLowerCase().includes(searchLower)) ||
      caseIdStr.includes(searchLower)
    )
  })

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Container maxWidth="lg">
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
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    )
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to be logged in to view children data.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    )
  }

  // Show loading while fetching children
  if (loading && children.length === 0) {
    return (
      <Container maxWidth="lg">
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
            Loading children data...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Children Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all children in the system
              {user && (
                <Typography component="span" sx={{ ml: 1, fontWeight: 500, color: 'primary.main' }}>
                  • Logged in as: {user.name || user.email}
                </Typography>
              )}
            </Typography>
          </Box>
          {canModifyChildren && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChild}
              sx={{ borderRadius: 2 }}
            >
              Add New Child
            </Button>
          )}
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError('')}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchChildren}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Role Info Banner */}
        {!canModifyChildren && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have view-only access. Contact an administrator if you need edit permissions.
          </Alert>
        )}

        {/* Search and Actions */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Children ({filteredChildren.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={fetchChildren}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Box>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, address, phone, or case ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            disabled={loading}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Paper>

        {/* Children Table */}
        {filteredChildren.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {children.length === 0 ? 'No children in database' : 'No matching children found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first child to get started'}
            </Typography>
            {canModifyChildren && children.length === 0 && (
              <Button 
                variant="contained" 
                onClick={handleAddChild}
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add First Child
              </Button>
            )}
            {!canModifyChildren && children.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Contact an administrator to add children to the system
              </Typography>
            )}
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'primary.light' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Date of Birth</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Age</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Gender</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Guardian Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Case ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChildren.map((child) => (
                    <TableRow 
                      key={child.id}
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {child.first_name} {child.middle_name || ''} {child.last_name}
                            </Typography>
                            {child.current_address && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <LocationOnIcon fontSize="inherit" />
                                {child.current_address.substring(0, 50)}
                                {child.current_address.length > 50 ? '...' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(child.date_of_birth)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {calculateAge(child.date_of_birth)} years
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getGenderLabel(child.gender)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {child.guardian_phone ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {child.guardian_phone}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {child.case_id ? `CASE-${child.case_id}` : 'Not Assigned'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewChild(child)}
                            size="small"
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'primary.light',
                              }
                            }}
                            title="View Details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          
                          {canModifyChildren && (
                            <>
                              <IconButton
                                color="secondary"
                                onClick={() => handleEditChild(child.id)}
                                size="small"
                                sx={{ 
                                  '&:hover': {
                                    backgroundColor: 'secondary.light',
                                  }
                                }}
                                title="Edit Child"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteChild(child.id)}
                                size="small"
                                sx={{ 
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                  }
                                }}
                                title="Delete Child"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Results Count */}
        {filteredChildren.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredChildren.length} of {children.length} children
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                User role: {user?.role || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* View Child Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedChild && (
          <>
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Child Details - {selectedChild.first_name} {selectedChild.last_name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Full Name</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedChild.first_name} {selectedChild.middle_name || ''} {selectedChild.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Date of Birth</Typography>
                  <Typography variant="body1" paragraph>
                    {formatDate(selectedChild.date_of_birth)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Age</Typography>
                  <Typography variant="body1" paragraph>
                    {calculateAge(selectedChild.date_of_birth)} years
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Gender</Typography>
                  <Typography variant="body1" paragraph>
                    {getGenderLabel(selectedChild.gender)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Current Address</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedChild.current_address || 'Not specified'}
                  </Typography>
                </Grid>
                {selectedChild.address_history && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Address History</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedChild.address_history}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Guardian Phone</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body1" paragraph>
                      {selectedChild.guardian_phone || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Guardian Email</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body1" paragraph>
                      {selectedChild.guardian_email || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Child Contact</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedChild.child_contact || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Case ID</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedChild.case_id ? `CASE-${selectedChild.case_id}` : 'Not Assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Created</Typography>
                  <Typography variant="body1">
                    {formatDate(selectedChild.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Last Updated</Typography>
                  <Typography variant="body1">
                    {formatDate(selectedChild.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
              {canModifyChildren && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setOpenDialog(false)
                    handleEditChild(selectedChild.id)
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Edit Child
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  )
}

export default ChildrenPage