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
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useAuth } from '../hooks/useAuth'

const ChildrenPage = () => {
  const { isAdmin, isFocalPerson, getUserName } = useAuth()
  const [children, setChildren] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API call
  useEffect(() => {
    const mockData = [
      { id: 1, name: 'John Doe', age: 10, gender: 'Male', guardian: 'Jane Doe', status: 'active', caseNumber: 'CASE-001' },
      { id: 2, name: 'Mary Smith', age: 8, gender: 'Female', guardian: 'John Smith', status: 'active', caseNumber: 'CASE-002' },
      { id: 3, name: 'Peter Johnson', age: 12, gender: 'Male', guardian: 'Sarah Johnson', status: 'inactive', caseNumber: 'CASE-003' },
    ]
    setChildren(mockData)
  }, [])

  const handleViewChild = (child) => {
    setSelectedChild(child)
    setOpenDialog(true)
  }

  const handleEditChild = (childId) => {
    console.log('Edit child:', childId)
    // Implement edit logic
  }

  const handleDeleteChild = (childId) => {
    console.log('Delete child:', childId)
    // Implement delete logic with confirmation
  }

  const handleAddChild = () => {
    console.log('Add new child')
    // Implement add child logic
  }

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.guardian.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error'
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Children Management
        </Typography>

        {/* Search and Actions */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Children ({filteredChildren.length})
            </Typography>
            {(isAdmin || isFocalPerson) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddChild}
              >
                Add New Child
              </Button>
            )}
          </Box>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, case number, or guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Paper>

        {/* Children Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell><strong>Case #</strong></TableCell>
                  <TableCell><strong>Child Name</strong></TableCell>
                  <TableCell><strong>Age</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell><strong>Guardian</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChildren.map((child) => (
                  <TableRow key={child.id} hover>
                    <TableCell>{child.caseNumber}</TableCell>
                    <TableCell>{child.name}</TableCell>
                    <TableCell>{child.age}</TableCell>
                    <TableCell>{child.gender}</TableCell>
                    <TableCell>{child.guardian}</TableCell>
                    <TableCell>
                      <Chip 
                        label={child.status.toUpperCase()} 
                        color={getStatusColor(child.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewChild(child)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {(isAdmin || isFocalPerson) && (
                          <>
                            <IconButton
                              color="secondary"
                              onClick={() => handleEditChild(child.id)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteChild(child.id)}
                              size="small"
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
      </Box>

      {/* View Child Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedChild && (
          <>
            <DialogTitle>Child Details - {selectedChild.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Case Number:</strong> {selectedChild.caseNumber}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Age:</strong> {selectedChild.age} years
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Gender:</strong> {selectedChild.gender}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Guardian:</strong> {selectedChild.guardian}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> {selectedChild.status.toUpperCase()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              {(isAdmin || isFocalPerson) && (
                <Button variant="contained" onClick={() => handleEditChild(selectedChild.id)}>
                  Edit
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default ChildrenPage