import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Box,
} from '@mui/material'
import {
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material'
import { formatDate } from '../../utils/formatters'
import LoadingSpinner from '../Common/LoadingSpinner'

const VictimList = ({ victims, loading, onEdit, onDelete, onView }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!victims || victims.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <p>No victims found</p>
      </Paper>
    )
  }

  const displayedVictims = Array.isArray(victims) 
    ? victims.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : []

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Case</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedVictims.map((victim) => (
              <TableRow key={victim.id} hover>
                <TableCell>{victim.first_name} {victim.last_name}</TableCell>
                <TableCell>{victim.gender}</TableCell>
                <TableCell>{victim.age || 'N/A'}</TableCell>
                <TableCell>{victim.contact_number || 'N/A'}</TableCell>
                <TableCell>{victim.case?.case_number || 'N/A'}</TableCell>
                <TableCell>{formatDate(victim.created_at)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onView(victim)}
                      color="primary"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(victim)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(victim.id)}
                      color="error"
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={victims.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default VictimList