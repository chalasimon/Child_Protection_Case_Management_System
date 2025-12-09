import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  Box,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { formatDate } from '../../utils/formatters'
import { formatCaseStatus, formatAbuseType } from '../../utils/constants'
import LoadingSpinner from '../Common/LoadingSpinner'

const CaseList = ({ cases, loading, onEdit, onDelete, onView }) => {
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

  if (!cases || cases.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <p>No cases found</p>
      </Paper>
    )
  }

  const displayedCases = Array.isArray(cases) 
    ? cases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : []

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Date Reported</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedCases.map((caseItem) => (
              <TableRow key={caseItem.id} hover>
                <TableCell>{caseItem.case_number}</TableCell>
                <TableCell>{caseItem.case_title}</TableCell>
                <TableCell>
                  <Chip 
                    label={formatAbuseType(caseItem.abuse_type)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={formatCaseStatus(caseItem.status)}
                    size="small"
                    color={
                      caseItem.status === 'closed' || caseItem.status === 'resolved'
                        ? 'success'
                        : 'warning'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={caseItem.priority}
                    size="small"
                    color={
                      caseItem.priority === 'high' || caseItem.priority === 'critical'
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>{formatDate(caseItem.created_at)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onView(caseItem)}
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(caseItem)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(caseItem.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
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
        count={cases.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default CaseList