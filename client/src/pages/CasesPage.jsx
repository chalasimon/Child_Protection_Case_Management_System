// src/pages/CasesPage.jsx
import React, { useState } from 'react'
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
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const CasesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const navigate = useNavigate()

  const casesData = [
    { id: 'CASE-001', title: 'Physical Abuse - School Incident', victim: 'John Doe', type: 'Physical', priority: 'High', status: 'Active', date: '2025-12-09' },
    { id: 'CASE-002', title: 'Neglect - Home Environment', victim: 'Jane Smith', type: 'Neglect', priority: 'Medium', status: 'Investigation', date: '2025-12-08' },
    { id: 'CASE-003', title: 'Sexual Abuse Report', victim: 'Mike Johnson', type: 'Sexual', priority: 'High', status: 'Resolved', date: '2025-12-07' },
    { id: 'CASE-004', title: 'Emotional Abuse - Bullying', victim: 'Sarah Williams', type: 'Emotional', priority: 'Low', status: 'Active', date: '2025-12-06' },
  ]

  const handleMenuOpen = (event, caseItem) => {
    setAnchorEl(event.currentTarget)
    setSelectedCase(caseItem)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCase(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error'
      case 'Medium': return 'warning'
      case 'Low': return 'success'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <WarningIcon fontSize="small" />
      case 'Investigation': return <PendingIcon fontSize="small" />
      case 'Resolved': return <CheckIcon fontSize="small" />
      default: return null
    }
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                42
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                18
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Investigation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                89
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search cases by ID, victim name, or type..."
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
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
        </Box>
      </Paper>

      {/* Cases Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Case ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Case Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Victim</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Report Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {casesData.map((caseItem) => (
                <TableRow 
                  key={caseItem.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {caseItem.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {caseItem.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {caseItem.victim}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      label={caseItem.type}
                      sx={{
                        bgcolor: `${caseItem.type === 'Physical' ? '#ff6b6b20' : 
                                 caseItem.type === 'Sexual' ? '#4ecdc420' :
                                 caseItem.type === 'Neglect' ? '#45b7d120' : '#96ceb420'}`,
                        color: `${caseItem.type === 'Physical' ? '#ff6b6b' : 
                               caseItem.type === 'Sexual' ? '#4ecdc4' :
                               caseItem.type === 'Neglect' ? '#45b7d1' : '#96ceb4'}`,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      label={caseItem.priority}
                      color={getPriorityColor(caseItem.priority)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getStatusIcon(caseItem.status)}
                      label={caseItem.status}
                      color={caseItem.status === 'Active' ? 'error' : 
                             caseItem.status === 'Investigation' ? 'warning' : 'success'}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {caseItem.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, caseItem)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/cases/${selectedCase?.id}`)
          handleMenuClose()
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Case
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default CasesPage