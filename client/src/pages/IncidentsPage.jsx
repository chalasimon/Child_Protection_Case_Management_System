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
} from '@mui/material'
import { Add, Visibility, Edit, Delete } from '@mui/icons-material'
import { incidentApi } from '../api/incidents'
import { formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const response = await incidentApi.getIncidents()
      setIncidents(response.data || [])
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIncident = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await incidentApi.deleteIncident(id)
        fetchIncidents()
      } catch (error) {
        console.error('Failed to delete incident:', error)
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Incident Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            // Open incident form
            alert('Incident form will open here')
          }}
        >
          New Incident
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Case ID</TableCell>
                <TableCell>Incident Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Files</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>{incident.case_id}</TableCell>
                  <TableCell>{formatDateTime(incident.incident_datetime)}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={incident.abuse_type?.replace('_', ' ') || 'Unknown'}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    {incident.evidence_files?.length || 0} files
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteIncident(incident.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default IncidentsPage