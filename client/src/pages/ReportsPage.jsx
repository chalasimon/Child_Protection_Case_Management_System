import { useState } from 'react'
import {
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Download, Refresh } from '@mui/icons-material'
import { reportApi } from '../api/reports'
import { formatDate } from '../utils/formatters'

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(new Date())
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (startDate) params.start_date = startDate.toISOString().split('T')[0]
      if (endDate) params.end_date = endDate.toISOString().split('T')[0]
      
      let response
      if (tabValue === 0) {
        response = await reportApi.generateCasesReport(params)
      } else if (tabValue === 1) {
        response = await reportApi.generateVictimsReport(params)
      } else {
        response = await reportApi.generatePerpetratorsReport(params)
      }
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return
    
    let headers = []
    let rows = []
    
    if (tabValue === 0) {
      headers = ['Case Number', 'Title', 'Type', 'Status', 'Incident Date']
      rows = reportData.cases?.map(caseItem => [
        caseItem.case_number,
        caseItem.case_title,
        caseItem.abuse_type,
        caseItem.status,
        formatDate(caseItem.incident_date),
      ]) || []
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Cases Report" />
          <Tab label="Victims Report" />
          <Tab label="Perpetrators Report" />
        </Tabs>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={generateReport}
                  disabled={loading}
                  startIcon={<Refresh />}
                >
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={exportToCSV}
                  disabled={!reportData}
                  startIcon={<Download />}
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Results
          </Typography>
          {tabValue === 0 && reportData.cases && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Case Number</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Incident Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell>{caseItem.case_number}</TableCell>
                      <TableCell>{caseItem.case_title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={caseItem.abuse_type?.replace('_', ' ')}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={caseItem.status?.replace('_', ' ')}
                          size="small"
                          color={caseItem.status === 'closed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(caseItem.incident_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default ReportsPage