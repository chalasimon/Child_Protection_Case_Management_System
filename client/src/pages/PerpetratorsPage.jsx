// src/pages/PerpetratorsPage.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../api/index'

const PerpetratorsPage = () => {
  const [perpetrators, setPerpetrators] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedPerp, setSelectedPerp] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewPerp, setViewPerp] = useState(null)
  const navigate = useNavigate()

  // Fetch perpetrators from API
  const fetchPerpetrators = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = searchTerm ? { search: searchTerm } : {}
      const data = await api.get('/perpetrators', { params })
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setPerpetrators(data)
      } else if (data && data.data && Array.isArray(data.data)) {
        setPerpetrators(data.data) // Paginated response
      } else {
        console.warn('Unexpected API response format:', data)
        setPerpetrators([])
      }
    } catch (err) {
      console.error('Failed to fetch perpetrators:', err)
      setError(err.message || 'Failed to load perpetrators')
      setPerpetrators([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerpetrators()
  }, [])

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    // Debounce search - fetch after typing stops
    const timer = setTimeout(() => {
      if (term !== searchTerm) {
        fetchPerpetrators()
      }
    }, 500)
    return () => clearTimeout(timer)
  }

  const handleCreatePerpetrator = async (formData) => {
    try {
      await api.post('/perpetrators', formData)
      setSuccess('Perpetrator created successfully')
      setOpenForm(false)
      fetchPerpetrators()
    } catch (err) {
      console.error('Failed to create perpetrator:', err)
      throw err // Let form handle the error
    }
  }

  const handleUpdatePerpetrator = async (id, formData) => {
    try {
      await api.put(`/perpetrators/${id}`, formData)
      setSuccess('Perpetrator updated successfully')
      setSelectedPerp(null)
      setOpenForm(false)
      fetchPerpetrators()
    } catch (err) {
      console.error('Failed to update perpetrator:', err)
      throw err // Let form handle the error
    }
  }

  const handleDeletePerpetrator = async (id) => {
    if (window.confirm('Are you sure you want to delete this perpetrator? This action cannot be undone.')) {
      try {
        await api.delete(`/perpetrators/${id}`)
        setSuccess('Perpetrator deleted successfully')
        fetchPerpetrators()
      } catch (err) {
        console.error('Failed to delete perpetrator:', err)
        setError('Failed to delete perpetrator')
      }
    }
  }

  const handleViewPerpetrator = (perp) => {
    setViewPerp(perp)
    setViewDialogOpen(true)
  }

  const handleEditPerpetrator = (perp) => {
    setSelectedPerp(perp)
    setOpenForm(true)
  }

  // Helper functions
  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Male'
      case 'female': return 'Female'
      case 'other': return 'Other'
      case 'prefer_not_to_disclose': return 'Prefer not to disclose'
      default: return gender
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const filteredPerpetrators = perpetrators.filter(perp => {
    if (!perp) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      perp.first_name?.toLowerCase().includes(searchLower) ||
      perp.last_name?.toLowerCase().includes(searchLower) ||
      perp.contact_number?.includes(searchTerm) ||
      perp.address?.toLowerCase().includes(searchLower) ||
      perp.occupation?.toLowerCase().includes(searchLower) ||
      perp.relationship_to_victim?.toLowerCase().includes(searchLower)
    )
  })

  const PerpetratorForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
      first_name: '',
      last_name: '',
      gender: '',
      age: '',
      date_of_birth: '',
      contact_number: '',
      address: '',
      occupation: '',
      relationship_to_victim: '',
      previous_records: false,
      description: '',
      additional_info: {},
    })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSubmitting(true)
      setFormError('')
      
      try {
        // Convert age to number if provided
        const submitData = {
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          previous_records: Boolean(formData.previous_records)
        }
        
        await onSubmit(submitData)
      } catch (err) {
        setFormError(err.message || 'Failed to save perpetrator')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Perpetrator' : 'Add New Perpetrator'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                SelectProps={{ native: true }}
                required
              >
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_disclose">Prefer not to disclose</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Relationship to Victim"
                name="relationship_to_victim"
                value={formData.relationship_to_victim}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Physical description, behavior patterns, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Has Previous Records"
                name="previous_records"
                select
                value={formData.previous_records}
                onChange={handleChange}
                SelectProps={{ native: true }}
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Perpetrator Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all perpetrators in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Perpetrator
        </Button>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, phone, address, occupation..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPerpetrators}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Perpetrators Table */}
      {loading && perpetrators.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading perpetrators...
          </Typography>
        </Paper>
      ) : filteredPerpetrators.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {perpetrators.length === 0 ? 'No perpetrators found' : 'No matching perpetrators found'}
          </Typography>
          {searchTerm && perpetrators.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search terms
            </Typography>
          )}
          {perpetrators.length === 0 && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
              sx={{ mt: 2 }}
            >
              Add First Perpetrator
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age/DOB</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Occupation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Previous Records</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPerpetrators.map((perp) => {
                  const age = calculateAge(perp.date_of_birth)
                  return (
                    <TableRow key={perp.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {perp.first_name} {perp.last_name}
                          </Typography>
                        </Box>
                        {perp.address && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            <LocationIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                            {perp.address.substring(0, 40)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {getGenderLabel(perp.gender)}
                      </TableCell>
                      <TableCell>
                        {age ? `${age} years` : 'N/A'}
                        {perp.date_of_birth && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {formatDate(perp.date_of_birth)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {perp.contact_number ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {perp.contact_number}
                            </Typography>
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {perp.occupation || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {perp.relationship_to_victim || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={perp.previous_records ? 'Yes' : 'No'}
                          color={perp.previous_records ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewPerpetrator(perp)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditPerpetrator(perp)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePerpetrator(perp.id)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
      {filteredPerpetrators.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredPerpetrators.length} of {perpetrators.length} perpetrators
        </Typography>
      )}

      {/* Perpetrator Form Dialog */}
      <Dialog open={openForm} onClose={() => {
        setOpenForm(false)
        setSelectedPerp(null)
      }} maxWidth="md" fullWidth>
        <PerpetratorForm
          initialData={selectedPerp}
          onSubmit={selectedPerp ? 
            (data) => handleUpdatePerpetrator(selectedPerp.id, data) :
            handleCreatePerpetrator
          }
          onCancel={() => {
            setOpenForm(false)
            setSelectedPerp(null)
          }}
        />
      </Dialog>

      {/* View Perpetrator Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {viewPerp && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">
                  Perpetrator Details - {viewPerp.first_name} {viewPerp.last_name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewPerp.first_name} {viewPerp.last_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography variant="body1" gutterBottom>
                    {getGenderLabel(viewPerp.gender)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(viewPerp.date_of_birth)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                  <Typography variant="body1" gutterBottom>
                    {calculateAge(viewPerp.date_of_birth) || 'N/A'} years
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Number</Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewPerp.contact_number || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Occupation</Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewPerp.occupation || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewPerp.address || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Relationship to Victim</Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewPerp.relationship_to_victim || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Previous Records</Typography>
                  <Chip
                    label={viewPerp.previous_records ? 'Yes' : 'No'}
                    color={viewPerp.previous_records ? 'error' : 'default'}
                    variant="filled"
                  />
                </Grid>
                
                {viewPerp.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {viewPerp.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">
                    {formatDate(viewPerp.created_at)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {formatDate(viewPerp.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setViewDialogOpen(false)
                  handleEditPerpetrator(viewPerp)
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default PerpetratorsPage