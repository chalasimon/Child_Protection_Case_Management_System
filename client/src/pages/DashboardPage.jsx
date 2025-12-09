// src/pages/DashboardPage.jsx
import React from 'react'
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
} from '@mui/material'
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Assignment as CaseIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DashboardPage = () => {
  // Mock data - replace with API data
  const stats = {
    totalCases: 147,
    activeCases: 42,
    resolvedCases: 89,
    newThisWeek: 15,
    victimsCount: 203,
    perpetratorsCount: 121,
    avgResolutionTime: '24 days',
  }

  const abuseTypeData = [
    { name: 'Physical', value: 35, color: '#ff6b6b' },
    { name: 'Sexual', value: 28, color: '#4ecdc4' },
    { name: 'Neglect', value: 22, color: '#45b7d1' },
    { name: 'Emotional', value: 15, color: '#96ceb4' },
  ]

  const monthlyCases = [
    { month: 'Jan', cases: 12 },
    { month: 'Feb', cases: 19 },
    { month: 'Mar', cases: 15 },
    { month: 'Apr', cases: 21 },
    { month: 'May', cases: 18 },
    { month: 'Jun', cases: 24 },
  ]

  const recentCases = [
    { id: 'CASE-001', victim: 'John Doe', type: 'Physical', status: 'Active', date: '2025-12-09' },
    { id: 'CASE-002', victim: 'Jane Smith', type: 'Sexual', status: 'Investigation', date: '2025-12-08' },
    { id: 'CASE-003', victim: 'Mike Johnson', type: 'Neglect', status: 'Resolved', date: '2025-12-07' },
    { id: 'CASE-004', victim: 'Sarah Williams', type: 'Emotional', status: 'Active', date: '2025-12-06' },
  ]

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: `${color}.light`, 
            borderRadius: 1, 
            p: 1,
            mr: 2 
          }}>
            {React.cloneElement(icon, { sx: { color: `${color}.main` } })}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  const StatusChip = ({ status }) => {
    const statusConfig = {
      Active: { color: 'error', label: 'Active' },
      Investigation: { color: 'warning', label: 'Investigation' },
      Resolved: { color: 'success', label: 'Resolved' },
      Pending: { color: 'info', label: 'Pending' },
    }
    const config = statusConfig[status] || { color: 'default', label: status }
    return <Chip size="small" label={config.label} color={config.color} />
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Child Protection Case Management System - Real-time Monitoring
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cases"
            value={stats.totalCases}
            icon={<CaseIcon />}
            color="primary"
            subtitle="Since system launch"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cases"
            value={stats.activeCases}
            icon={<WarningIcon />}
            color="error"
            subtitle="Require attention"
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
            subtitle="Recent reports"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Abuse Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Abuse Type Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {abuseTypeData.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: item.color, mr: 1, borderRadius: '50%' }} />
                  <Typography variant="body2">{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Monthly Case Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCases}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" fill="#1976d2" name="Number of Cases" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Cases Table */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Cases
          </Typography>
          <Chip icon={<TimelineIcon />} label="Last 7 days" variant="outlined" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>Case ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Victim</TableCell>
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
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {caseItem.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      {caseItem.victim}
                    </Box>
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
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={caseItem.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {caseItem.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <Typography variant="caption">View</Typography>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Case Resolution Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                Active Cases
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stats.activeCases}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.activeCases / stats.totalCases) * 100} 
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                Resolved Cases
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {stats.resolvedCases}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.resolvedCases / stats.totalCases) * 100} 
              sx={{ height: 8, borderRadius: 4, bgcolor: 'success.light' }}
              color="success"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              System Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.victimsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Victims
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.perpetratorsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Perpetrators
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 24, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Average Resolution Time
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {stats.avgResolutionTime}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage