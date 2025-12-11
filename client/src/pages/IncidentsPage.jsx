// src/pages/IncidentsPage.jsx
import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
} from '@mui/material'
import { 
  Add, 
  Visibility, 
  Edit, 
  Delete, 
  Search as SearchIcon,
  Description,
  LocationOn,
  CalendarToday,
  AccessTime,
  FileCopy,
  Refresh,
  Warning
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/index'

const IncidentsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, isFocalPerson } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check if user can modify incidents
  const canModifyIncidents = isAdmin || isFocalPerson

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents()
    }
  }, [isAuthenticated])

  // ✅ FIXED: Use api instance instead of axios directly
  const fetchIncidents = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/incidents')
      console.log('Incidents API response:', response)
      
      // ✅ Handle different Laravel response structures
      let incidentsData = []
      
      if (Array.isArray(response)) {
        incidentsData = response
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          incidentsData = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          incidentsData = response.data.data
        }
      }
      
      setIncidents(incidentsData)
      setSuccess('')
    } catch (err) {
      console.error('Failed to fetch incidents:', err)
      console.error('Error details:', err.response?.data || err.message)
      
      if (err.status === 401) {
        setError('Session expired. Please login again.')
      } else if (err.status === 404) {
        setError('Incidents API endpoint not found. Please check your Laravel routes.')
      } else if (err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Make sure Laravel is running on http://localhost:8000')
      } else {
        setError(err.message || 'Failed to fetch incidents. Please try again.')
      }
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Use api instance for delete
  const handleDeleteIncident = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      try {
        await api.delete(`/incidents/${id}`)
        setSuccess('Incident deleted successfully')
        setError('')
        fetchIncidents() // Refresh the list
      } catch (err) {
        console.error('Failed to delete incident:', err)
        setError('Failed to delete incident. Please try again.')
        setSuccess('')
      }
    }
  }

  const handleViewIncident = (incident) => {
    setSelectedIncident(incident)
    setOpenDialog(true)
  }

  const handleAddIncident = () => {
    navigate('/incidents/new')
  }

  const handleEditIncident = (id) => {
    navigate(`/incidents/${id}/edit`)
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
    return labels[type.toLowerCase()] || type.replace('_', ' ')
  }

  const getLocationTypeLabel = (type) => {
    if (!type) return 'Unknown'
    const labels = {
      'home': 'Home',
      'school': 'School',
      'online': 'Online',
      'public_place': 'Public Place',
      'other': 'Other'
    }
    return labels[type.toLowerCase()] || type.replace('_', ' ')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting datetime:', error)
      return 'Invalid date'
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
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const countEvidenceFiles = (evidenceFiles) => {
    if (!evidenceFiles) return 0
    try {
      // Check if it's already an array
      if (Array.isArray(evidenceFiles)) {
        return evidenceFiles.length
      }
      // Check if it's a JSON string
      if (typeof evidenceFiles === 'string') {
        const parsed = JSON.parse(evidenceFiles)
        return Array.isArray(parsed) ? parsed.length : 0
      }
      return 0
    } catch (error) {
      return 0
    }
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

  const filteredIncidents = incidents.filter(incident => {
    if (!incident) return false
    const searchLower = searchTerm.toLowerCase()
    const caseIdStr = incident.case_id ? `case-${incident.case_id}`.toLowerCase() : ''
    
    return (
      caseIdStr.includes(searchLower) ||
      (incident.location && incident.location.toLowerCase().includes(searchLower)) ||
      (incident.abuse_type && incident.abuse_type.toLowerCase().includes(searchLower)) ||
      (incident.location_type && incident.location_type.toLowerCase().includes(searchLower)) ||
      (incident.detailed_description && incident.detailed_description.toLowerCase().includes(searchLower))
    )
  })

  // Show loading while fetching
  if (loading && incidents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Incident Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all incident reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={fetchIncidents}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canModifyIncidents && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddIncident}
              sx={{ borderRadius: 2 }}
            >
              New Incident
            </Button>
          )}
        </Box>
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
              onClick={fetchIncidents}
              startIcon={<Refresh />}
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

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search incidents by case ID, location, type, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Paper>

      {/* Incidents Table */}
      {filteredIncidents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {incidents.length === 0 ? 'No incidents found' : 'No matching incidents found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first incident'}
          </Typography>
          {canModifyIncidents && incidents.length === 0 && (
            <Button 
              variant="contained" 
              onClick={handleAddIncident}
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Add First Incident
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Case ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Incident Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Location Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Abuse Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Prior Reports</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Evidence</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const abuseColors = getAbuseTypeColor(incident.abuse_type)
                  return (
                    <TableRow 
                      key={incident.id} 
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {incident.case_id ? `CASE-${incident.case_id}` : 'No Case'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(incident.incident_datetime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(incident.incident_datetime)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {incident.location || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getLocationTypeLabel(incident.location_type)}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getAbuseTypeLabel(incident.abuse_type)}
                          size="small"
                          sx={{
                            backgroundColor: abuseColors.bg,
                            color: abuseColors.text,
                            fontWeight: 500,
                            border: `1px solid ${abuseColors.text}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={incident.prior_reports_count || 0}
                          size="small"
                          color={(incident.prior_reports_count || 0) > 0 ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FileCopy fontSize="small" color="action" />
                          <Typography variant="body2">
                            {countEvidenceFiles(incident.evidence_files)} files
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewIncident(incident)}
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {canModifyIncidents && (
                            <>
                              <Tooltip title="Edit Incident">
                                <IconButton 
                                  size="small" 
                                  color="secondary"
                                  onClick={() => handleEditIncident(incident.id)}
                                  sx={{ 
                                    '&:hover': {
                                      backgroundColor: 'secondary.light',
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Incident">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteIncident(incident.id)}
                                  sx={{ 
                                    '&:hover': {
                                      backgroundColor: 'error.light',
                                    }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Results Count */}
      {filteredIncidents.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      )}

      {/* Incident Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedIncident && (
          <>
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Incident Details - Case {selectedIncident.case_id || 'No Case'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Report Date & Time</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body1">
                      {formatDateTime(selectedIncident.report_datetime)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Incident Date & Time</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body1">
                      {formatDateTime(selectedIncident.incident_datetime)}
                    </Typography>
                  </Box>
                </Grid>

                {selectedIncident.incident_end_datetime && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Incident End Date & Time</Typography>
                    <Typography variant="body1">
                      {formatDateTime(selectedIncident.incident_end_datetime)}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Location Type</Typography>
                  <Typography variant="body1">
                    {getLocationTypeLabel(selectedIncident.location_type)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Location</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body1">
                      {selectedIncident.location || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Abuse Type</Typography>
                  <Typography variant="body1">
                    {getAbuseTypeLabel(selectedIncident.abuse_type)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Prior Reports</Typography>
                  <Typography variant="body1">
                    {selectedIncident.prior_reports_count || 0}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detailed Description</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1, borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedIncident.detailed_description || 'No description provided'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Evidence Files</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <FileCopy fontSize="small" color="action" />
                    <Typography variant="body1">
                      {countEvidenceFiles(selectedIncident.evidence_files)} file(s)
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Created</Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedIncident.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Last Updated</Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedIncident.updated_at)}
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
              {canModifyIncidents && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setOpenDialog(false)
                    handleEditIncident(selectedIncident.id)
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Edit Incident
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
    </Box>
  )
}

export default IncidentsPage