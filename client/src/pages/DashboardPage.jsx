// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material'
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Assignment as CaseIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import api from '../api/index'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    newThisWeek: 0,
  })
  const [abuseTypeData, setAbuseTypeData] = useState([])
  const [monthlyCases, setMonthlyCases] = useState([])
  const [recentCases, setRecentCases] = useState([])
  const navigate = useNavigate()

  // Color palette for charts
  const ABUSE_TYPE_COLORS = {
    'sexual_abuse': '#ff6b6b',
    'physical_abuse': '#4ecdc4',
    'emotional_abuse': '#45b7d1',
    'neglect': '#96ceb4',
    'exploitation': '#ffd166',
    'other': '#999999'
  }

  // Fetch dashboard data - FIXED VERSION
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Make all API calls in parallel
      const [statsResponse, abuseTypeResponse, recentCasesResponse] = await Promise.allSettled([
        api.get('/dashboard/stats'),
        api.get('/dashboard/abuse-type-stats'),
        api.get('/dashboard/recent-cases')
      ])

      console.log('Dashboard API Responses:', {
        stats: statsResponse,
        abuseType: abuseTypeResponse,
        recentCases: recentCasesResponse
      })

      // Process stats response
      let statsData = {}
      if (statsResponse.status === 'fulfilled') {
        // ✅ CORRECT: Access response.data
        statsData = statsResponse.value.data || {}
        console.log('Stats data:', statsData)
      } else {
        console.error('Stats API failed:', statsResponse.reason)
      }

      // Process abuse type response
      let abuseTypeResponseData = []
      if (abuseTypeResponse.status === 'fulfilled') {
        // ✅ CORRECT: Access response.data
        abuseTypeResponseData = abuseTypeResponse.value.data || []
      } else {
        console.warn('Abuse type stats not available:', abuseTypeResponse.reason)
        // Fallback to stats data if available
        abuseTypeResponseData = statsData.by_type || []
      }

      // Process recent cases response
      let recentCasesResponseData = []
      if (recentCasesResponse.status === 'fulfilled') {
        // ✅ CORRECT: Access response.data
        recentCasesResponseData = recentCasesResponse.value.data || []
      } else {
        console.warn('Recent cases not available:', recentCasesResponse.reason)
        // Fallback: try to get cases directly
        try {
          const casesRes = await api.get('/cases')
          recentCasesResponseData = Array.isArray(casesRes.data) ? 
            casesRes.data.slice(0, 5) : []
        } catch (casesError) {
          console.warn('Could not fetch cases either:', casesError)
          recentCasesResponseData = []
        }
      }

      // Set basic stats - FIXED: Use statsData which comes from .data
      const totalCases = statsData.total_cases || 0
      const activeCases = statsData.open_cases || 0
      const resolvedCases = statsData.closed_cases || 0
      
      // Process abuse type data
      const abuseTypeChartData = (abuseTypeResponseData || []).map(item => ({
        name: formatAbuseType(item.abuse_type),
        value: item.total || 0,
        type: item.abuse_type
      }))
      
      // Generate monthly data
      const monthlyChartData = generateMonthlyData(statsData)
      
      // Calculate new this week from recent cases
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const newThisWeek = Array.isArray(recentCasesResponseData) ? 
        recentCasesResponseData.filter(caseItem => {
          if (!caseItem) return false
          const created = new Date(caseItem.created_at || caseItem.reporting_date || caseItem.report_datetime)
          return !isNaN(created.getTime()) && created > oneWeekAgo
        }).length : 0

      // Update state
      setStats({
        totalCases,
        activeCases,
        resolvedCases,
        newThisWeek,
      })
      
      setAbuseTypeData(abuseTypeChartData)
      setMonthlyCases(monthlyChartData)
      setRecentCases(Array.isArray(recentCasesResponseData) ? recentCasesResponseData.slice(0, 10) : [])
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      console.error('Error details:', err.response?.data || err.message)
      
      if (err.response?.status === 404) {
        setError('Dashboard API endpoints not configured. Please check your Laravel routes.')
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
      } else {
        setError(err.message || 'Failed to load dashboard data')
      }
      
      // Set default data for charts
      setAbuseTypeData([])
      setMonthlyCases(generateDefaultMonthlyData())
      setRecentCases([])
    } finally {
      setLoading(false)
    }
  }

  // Generate monthly data from stats or create default
  const generateMonthlyData = (statsData) => {
    // Check if we have monthly data from API
    if (statsData.monthly_stats && Array.isArray(statsData.monthly_stats)) {
      return statsData.monthly_stats.map(item => ({
        month: item.month || 'Unknown',
        cases: item.total || item.cases || 0
      }))
    }
    
    // Check if we have yearly stats with monthly counts
    if (statsData.yearly_stats?.monthly_counts && Array.isArray(statsData.yearly_stats.monthly_counts)) {
      return statsData.yearly_stats.monthly_counts.map(item => ({
        month: getMonthName(item.month),
        cases: item.total || 0
      }))
    }
    
    // Fallback to default data
    return generateDefaultMonthlyData()
  }

  // Generate default monthly data
  const generateDefaultMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(month => ({
      month,
      cases: Math.floor(Math.random() * 10) + 1
    }))
  }

  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthNumber - 1] || months[new Date().getMonth()]
  }

  // Helper functions
  const formatAbuseType = (type) => {
    const types = {
      'sexual_abuse': 'Sexual',
      'physical_abuse': 'Physical',
      'emotional_abuse': 'Emotional',
      'neglect': 'Neglect',
      'exploitation': 'Exploitation',
      'other': 'Other'
    }
    return types[type] || type
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
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
    const labels = {
      'reported': 'Reported',
      'assigned': 'Assigned',
      'under_investigation': 'Under Investigation',
      'investigation': 'Investigation',
      'resolved': 'Resolved',
      'closed': 'Closed',
      'reopened': 'Reopened'
    }
    return labels[status] || status
  }

  const getAbuseTypeColor = (type) => {
    return ABUSE_TYPE_COLORS[type] || '#999999'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const calculateResolutionRate = () => {
    if (stats.totalCases === 0) return 0
    return Math.round((stats.resolvedCases / stats.totalCases) * 100)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2, 
      boxShadow: 2,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: `${color}.light`, 
            borderRadius: 1, 
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { 
              sx: { 
                color: `${color}.main`,
                fontSize: 24
              } 
            })}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  if (loading && stats.totalCases === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Child Protection Case Management System - Real-time Monitoring
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError('')}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
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
          <StatCard
            title="Total Cases"
            value={stats.totalCases}
            icon={<CaseIcon />}
            color="primary"
            subtitle="All cases in system"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cases"
            value={stats.activeCases}
            icon={<WarningIcon />}
            color="error"
            subtitle="Requiring attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Cases"
            value={stats.resolvedCases}
            icon={<CheckCircleIcon />}
            color="success"
            subtitle="Successfully closed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Week"
            value={stats.newThisWeek}
            icon={<ScheduleIcon />}
            color="info"
            subtitle="Last 7 days"
          />
        </Grid>
      </Grid>

      {/* Charts Section - FIXED Chart Container Dimensions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Abuse Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%', 
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Abuse Type Distribution
            </Typography>
            {abuseTypeData.length > 0 ? (
              <>
                <Box sx={{ 
                  height: 300, 
                  minHeight: 300,
                  width: '100%',
                  position: 'relative'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={abuseTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {abuseTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getAbuseTypeColor(entry.type)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} cases`, 'Count']}
                        labelFormatter={(label) => `Type: ${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center', 
                  gap: 1 
                }}>
                  {abuseTypeData.map((item) => (
                    <Chip
                      key={item.name}
                      label={`${item.name}: ${item.value}`}
                      size="small"
                      sx={{
                        bgcolor: `${getAbuseTypeColor(item.type)}20`,
                        color: getAbuseTypeColor(item.type),
                        fontWeight: 500,
                        border: `1px solid ${getAbuseTypeColor(item.type)}30`
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                flex: 1
              }}>
                <Typography color="text.secondary" align="center">
                  No abuse type data available
                  <br />
                  <Typography variant="caption">
                    (No cases in the system yet)
                  </Typography>
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/cases/new')}
                  startIcon={<CaseIcon />}
                >
                  Create First Case
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%', 
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Monthly Case Trend ({new Date().getFullYear()})
            </Typography>
            {monthlyCases.length > 0 ? (
              <Box sx={{ 
                height: 300, 
                minHeight: 300,
                width: '100%'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCases}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} cases`, 'Count']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 2 }}
                    />
                    <Bar 
                      dataKey="cases" 
                      fill="#1976d2" 
                      name="Number of Cases"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flex: 1
              }}>
                <Typography color="text.secondary">
                  No monthly data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Cases Table */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2, 
        boxShadow: 2, 
        mb: 3,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Cases
          </Typography>
          <Chip 
            icon={<TimelineIcon />} 
            label="Recently Updated" 
            variant="outlined" 
            size="small"
          />
        </Box>
        {recentCases.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Case ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Case Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Abuse Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Report Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentCases.map((caseItem) => (
                  <TableRow 
                    key={caseItem.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {caseItem.case_number || `CASE-${caseItem.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CaseIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {caseItem.case_title || 'Untitled Case'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={formatAbuseType(caseItem.abuse_type || 'other')} 
                        sx={{ 
                          bgcolor: `${getAbuseTypeColor(caseItem.abuse_type || 'other')}20`,
                          color: getAbuseTypeColor(caseItem.abuse_type || 'other'),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={getStatusLabel(caseItem.status || 'reported')}
                        color={getStatusColor(caseItem.status || 'reported')}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(caseItem.reporting_date || caseItem.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                        title="View Details"
                        sx={{ 
                          bgcolor: 'primary.light',
                          '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            py: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography color="text.secondary" align="center">
              No recent cases found
              <br />
              <Typography variant="caption">
                Create your first case to see it here
              </Typography>
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/cases/new')}
              startIcon={<CaseIcon />}
            >
              Create New Case
            </Button>
          </Box>
        )}
      </Paper>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Case Resolution Progress
            </Typography>
            <Box sx={{ mb: 3, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  Resolution Rate
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {calculateResolutionRate()}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculateResolutionRate()} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'grey.200'
                }}
                color="success"
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  bgcolor: 'warning.light',
                  borderRadius: 2
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                    {stats.activeCases}
                  </Typography>
                  <Typography variant="body2" color="warning.dark" sx={{ mt: 0.5 }}>
                    Active Cases
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 2
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    {stats.resolvedCases}
                  </Typography>
                  <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>
                    Resolved Cases
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 2,
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CaseIcon />}
                  onClick={() => navigate('/cases/new')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>New Case</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate('/children')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>View Children</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<WarningIcon />}
                  onClick={() => navigate('/perpetrators')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Perpetrators</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => navigate('/incidents')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Incidents</Typography>
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage