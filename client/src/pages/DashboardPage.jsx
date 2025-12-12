import React, { useState, useEffect, useMemo } from 'react'
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
  useTheme,
  alpha,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Flag,
  Public,
  Shield,
  Assessment,
  LocationOn,
  Map,
  LocalHospital,
  School,
  FamilyRestroom
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector, LineChart, Line
} from 'recharts'
import Grow from '@mui/material/Grow'
import Fade from '@mui/material/Fade'
import dayjs from 'dayjs'
import { dashboardApi } from '../api/dashboard'

// SNNPR Regional Government Color Scheme
const SNNPR_COLORS = {
  primary: '#2E7D32',      // SNNPR Green
  secondary: '#1976D2',    // Government Blue
  accent: '#ED6C02',       // Accent Orange
  dark: '#263238',
  gray: '#546E7A',
  lightGray: '#F5F7FA',
  white: '#FFFFFF',
  zoneGreen: '#4CAF50',
  zoneBlue: '#2196F3',
  zoneOrange: '#FF9800',
  zonePurple: '#9C27B0',
  zoneTeal: '#009688'
}

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    newThisWeek: 0,
    pendingReview: 0,
    zonesCovered: 13,
    avgResolutionTime: '12.5',
  })
  const [abuseTypeData, setAbuseTypeData] = useState([])
  const [monthlyCases, setMonthlyCases] = useState([])
  const [recentCases, setRecentCases] = useState([])
  const [zoneData, setZoneData] = useState([])
  const [activePieIndex, setActivePieIndex] = useState(0)
  const navigate = useNavigate()
  const theme = useTheme()

  // SNNPR Zone Colors
  const ZONE_COLORS = [
    SNNPR_COLORS.zoneGreen,
    SNNPR_COLORS.zoneBlue,
    SNNPR_COLORS.zoneOrange,
    SNNPR_COLORS.zonePurple,
    SNNPR_COLORS.zoneTeal,
    '#795548', // Brown
    '#607D8B', // Blue Gray
  ]

  const ABUSE_TYPE_COLORS = [
    SNNPR_COLORS.primary,
    SNNPR_COLORS.secondary,
    SNNPR_COLORS.accent,
    '#7B1FA2',
    '#0288D1',
    '#388E3C',
    '#D32F2F',
    '#C2185B'
  ]

  // SNNPR Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={2}
          sx={{ 
            p: 2, 
            bgcolor: SNNPR_COLORS.white,
            color: SNNPR_COLORS.dark,
            border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.2)}`,
            borderRadius: 2,
            minWidth: 160,
          }}
        >
          <Typography sx={{ color: SNNPR_COLORS.primary, mb: 1, fontSize: '0.875rem' }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: entry.color,
                  mr: 1,
                }} 
              />
              <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: '0.875rem' }}>
                {entry.dataKey}: <span style={{ color: SNNPR_COLORS.dark }}>{entry.value}</span>
              </Typography>
            </Box>
          ))}
        </Paper>
      )
    }
    return null
  }

  // Active shape for pie chart
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={SNNPR_COLORS.white}
          strokeWidth={2}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke={SNNPR_COLORS.white} strokeWidth={1.5} />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={SNNPR_COLORS.dark} fontSize={12}>
          {`${payload.name}: ${value}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill={SNNPR_COLORS.gray} fontSize={11}>
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    )
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      // SNNPR Zone Data
      const snnprZones = [
        { name: 'Gurage', cases: 420, woredas: 15, icon: <LocationOn /> },
        { name: 'Hadiya', cases: 380, woredas: 12, icon: <LocationOn /> },
        { name: 'Kembata', cases: 295, woredas: 9, icon: <LocationOn /> },
        { name: "Silt'e", cases: 245, woredas: 8, icon: <LocationOn /> },
        { name: 'Wolayita', cases: 510, woredas: 18, icon: <LocationOn /> },
        { name: 'Bench Sheko', cases: 180, woredas: 7, icon: <LocationOn /> },
        { name: 'Keffa', cases: 320, woredas: 11, icon: <LocationOn /> },
      ]
      setZoneData(snnprZones)

      // Mock monthly data for SNNPR (Ethiopian calendar months)
      const months = ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase']
      const monthlyData = months.slice(0, 6).map((month, index) => ({
        month,
        cases: Math.floor(Math.random() * 150) + 50,
        trend: Math.floor(Math.random() * 50) + 30,
      }))
      setMonthlyCases(monthlyData)

      // Mock abuse type data for SNNPR
      setAbuseTypeData([
        { name: 'Physical Abuse', value: 38 },
        { name: 'Neglect', value: 28 },
        { name: 'Emotional', value: 18 },
        { name: 'Sexual', value: 12 },
        { name: 'Exploitation', value: 4 },
      ])

      // Mock recent cases for SNNPR
      const recentCasesData = [
        { 
          id: 1, 
          case_number: 'SNNPR-2024-001', 
          case_title: 'Child Neglect in Wolayita Zone', 
          abuse_type: 'neglect', 
          status: 'active', 
          created_at: '2024-01-15',
          zone: 'Wolayita'
        },
        { 
          id: 2, 
          case_number: 'SNNPR-2024-002', 
          case_title: 'School Abuse in Gurage Zone', 
          abuse_type: 'physical_abuse', 
          status: 'investigating', 
          created_at: '2024-01-14',
          zone: 'Gurage'
        },
        { 
          id: 3, 
          case_number: 'SNNPR-2024-003', 
          case_title: 'Family Violence in Hadiya Zone', 
          abuse_type: 'emotional', 
          status: 'resolved', 
          created_at: '2024-01-12',
          zone: 'Hadiya'
        },
       
      ]
      setRecentCases(recentCasesData)

      // Mock stats for SNNPR
      setStats({
        totalCases: 2150,
        activeCases: 480,
        resolvedCases: 1520,
        newThisWeek: 45,
        pendingReview: 150,
        zonesCovered: 13,
        avgResolutionTime: '12.5',
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setTimeout(() => setLoading(false), 800)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatAbuseTypeName = (name) => {
    if (!name) return 'Unknown'
    return name
      .toString()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formattedPieData = useMemo(() => {
    return (abuseTypeData || []).map((item) => {
      const rawName = item.abuse_type || item.name || item.label || 'unknown'
      const value = item.total ?? item.value ?? 0
      return {
        ...item,
        name: rawName,
        value,
        label: item.label || formatAbuseTypeName(rawName)
      }
    })
  }, [abuseTypeData])

  const onPieEnter = (_, index) => {
    setActivePieIndex(index)
  }

  const activeCasePercent = stats.totalCases
    ? Math.min((stats.activeCases / stats.totalCases) * 100, 100)
    : 0

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: SNNPR_COLORS.lightGray,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={70} 
            thickness={3}
            sx={{ 
              color: SNNPR_COLORS.primary,
              mb: 3,
            }} 
          />
          <Typography sx={{ color: SNNPR_COLORS.dark, fontSize: '1.125rem' }}>
            Loading SNNPR Regional Dashboard...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: SNNPR_COLORS.lightGray,
      minHeight: '100vh',
    }}>
      

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Cases',
            value: stats.totalCases.toLocaleString(),
            change: `+${stats.newThisWeek} this week`,
            icon: <CaseIcon />,
            color: SNNPR_COLORS.primary,
            gradient: `linear-gradient(135deg, ${SNNPR_COLORS.primary}, ${alpha(SNNPR_COLORS.primary, 0.8)})`,
          },
          {
            title: 'Active Cases',
            value: stats.activeCases.toLocaleString(),
            change: `${activeCasePercent.toFixed(1)}% of total`,
            icon: <WarningIcon />,
            color: SNNPR_COLORS.secondary,
            gradient: `linear-gradient(135deg, ${SNNPR_COLORS.secondary}, ${alpha(SNNPR_COLORS.secondary, 0.8)})`,
          },
          {
            title: 'Resolved Cases',
            value: stats.resolvedCases.toLocaleString(),
            change: `${stats.totalCases > 0 ? ((stats.resolvedCases / stats.totalCases) * 100).toFixed(1) : 0}% resolved`,
            icon: <CheckCircleIcon />,
            color: SNNPR_COLORS.zoneGreen,
            gradient: `linear-gradient(135deg, ${SNNPR_COLORS.zoneGreen}, ${alpha(SNNPR_COLORS.zoneGreen, 0.8)})`,
          },
          {
            title: 'Pending Review',
            value: stats.pendingReview.toLocaleString(),
            change: `${stats.avgResolutionTime} days average`,
            icon: <ScheduleIcon />,
            color: SNNPR_COLORS.accent,
            gradient: `linear-gradient(135deg, ${SNNPR_COLORS.accent}, ${alpha(SNNPR_COLORS.accent, 0.8)})`,
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card 
              sx={{ 
                bgcolor: SNNPR_COLORS.white,
                borderRadius: 3,
                boxShadow: `0 4px 16px ${alpha(stat.color, 0.12)}`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                transform: 'translateZ(0)',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(stat.color, 0.18)}`,
                  transform: 'translateY(-2px) scale(1.015)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: stat.gradient,
                }
              }}
            >
              <CardContent sx={{ p: 3, pt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      width: 25,
                      height: 25,
                      mr: 2,
                      border: `2px solid ${alpha(stat.color, 0.2)}`,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ 
                      color: SNNPR_COLORS.dark,
                      fontSize: '2.5rem',
                      lineHeight: 1,
                      mb: 1,
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ 
                      color: stat.color,
                      fontSize: '1rem',
                      mb: 0.5,
                    }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(stat.color, 0.05),
                  border: `1px solid ${alpha(stat.color, 0.1)}`,
                }}>
                  <TrendingUpIcon sx={{ color: stat.color, fontSize: 10, mr: 1 }} />
                  <Typography sx={{ 
                    color: stat.color,
                    fontSize: '0.875rem',
                  }}>
                    {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Line Chart - Monthly Trends */}
        <Grid item xs={12} lg={8}>
          <Paper 
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: SNNPR_COLORS.white,
              border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
              boxShadow: `0 4px 10px ${alpha(SNNPR_COLORS.primary, 0.08)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ 
                color: SNNPR_COLORS.primary, 
                fontSize: 18, 
                mr: 1,
              }} />
              <Box>
                <Typography sx={{ color: SNNPR_COLORS.dark, fontSize: '1.125rem' }}>
                  Monthly Case Trends
                </Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: '0.875rem' }}>
                  SNNPR Region - Last 6 Months
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ width: '100%', minHeight: 260, height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyCases}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                <CartesianGrid 
                  strokeDasharray="33" 
                  stroke={alpha(SNNPR_COLORS.gray, 0.2)} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: alpha(SNNPR_COLORS.gray, 0.3) }}
                  tickLine={false}
                  tick={{ fill: SNNPR_COLORS.gray, fontSize: 12 }}
                />
                <YAxis 
                  axisLine={{ stroke: alpha(SNNPR_COLORS.gray, 0.3) }}
                  tickLine={false}
                  tick={{ fill: SNNPR_COLORS.gray, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="cases" 
                  stroke={SNNPR_COLORS.primary}
                  strokeWidth={2}
                  dot={{ stroke: SNNPR_COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  name="Reported Cases"
                />
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke={SNNPR_COLORS.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ stroke: SNNPR_COLORS.secondary, strokeWidth: 2, r: 4 }}
                  name="Trend Line"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          </Paper>
        </Grid>

        {/* Pie Chart - Zone Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper 
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: SNNPR_COLORS.white,
              border: `1px solid ${alpha(SNNPR_COLORS.secondary, 0.1)}`,
              boxShadow: `0 4px 12px ${alpha(SNNPR_COLORS.secondary, 0.08)}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Public sx={{ 
                color: SNNPR_COLORS.secondary, 
                fontSize: 28, 
                mr: 2,
              }} />
              <Box>
                <Typography sx={{ color: SNNPR_COLORS.dark, fontSize: '1.125rem' }}>
                  Zone Distribution
                </Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: '0.875rem' }}>
                  Cases by SNNPR Zone
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, minHeight: 340, height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={zoneData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="cases"
                    onMouseEnter={onPieEnter}
                    paddingAngle={2}
                    stroke={SNNPR_COLORS.white}
                    strokeWidth={2}
                  >
                    {zoneData.slice(0, 6).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={ZONE_COLORS[index % ZONE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ 
                color: SNNPR_COLORS.dark,
                mb: 2,
                fontSize: '0.875rem',
                textAlign: 'center',
              }}>
                Top Zones by Case Volume
              </Typography>
              <List dense>
                {zoneData.slice(0, 4).map((zone, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '2px', 
                        bgcolor: ZONE_COLORS[index],
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={zone.name}
                      secondary={`${zone.cases} cases • ${zone.woredas} woredas`}
                      primaryTypographyProps={{ sx: { color: SNNPR_COLORS.dark, fontSize: '0.875rem' } }}
                      secondaryTypographyProps={{ sx: { color: SNNPR_COLORS.gray, fontSize: '0.75rem' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Cases Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{
              borderRadius: 3,
              bgcolor: SNNPR_COLORS.white,
              border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
              boxShadow: `0 4px 12px ${alpha(SNNPR_COLORS.primary, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              borderBottom: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
            }}>
              <TimelineIcon sx={{ 
                color: SNNPR_COLORS.primary, 
                fontSize: 28, 
                mr: 2,
              }} />
              <Box>
                <Typography sx={{ color: SNNPR_COLORS.dark, fontSize: '1.125rem' }}>
                  Recent Cases
                </Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: '0.875rem' }}>
                  New cases requiring attention in SNNPR
                </Typography>
              </Box>
              <Chip
                label="View All"
                size="small"
                onClick={() => navigate('/cases')}
                sx={{
                  ml: 'auto',
                  bgcolor: alpha(SNNPR_COLORS.secondary, 0.1),
                  color: SNNPR_COLORS.secondary,
                  cursor: 'pointer',
                }}
              />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: alpha(SNNPR_COLORS.primary, 0.04),
                  }}>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Case Number
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Title
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Zone
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Opened Date
                    </TableCell>
                    <TableCell sx={{ color: SNNPR_COLORS.dark, fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCases.map((caseItem) => {
                    const zone = zoneData.find(z => z.name === caseItem.zone) || zoneData[0]
                    const zoneIndex = zoneData.findIndex(z => z.name === caseItem.zone)
                    const zoneColor = ZONE_COLORS[zoneIndex % ZONE_COLORS.length] || SNNPR_COLORS.secondary
                    
                    const statusColor = 
                      caseItem.status === 'active' ? SNNPR_COLORS.accent :
                      caseItem.status === 'resolved' ? SNNPR_COLORS.zoneGreen :
                      caseItem.status === 'investigating' ? SNNPR_COLORS.secondary :
                      SNNPR_COLORS.gray

                    return (
                      <TableRow 
                        key={caseItem.id}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderBottom: `1px solid ${alpha(SNNPR_COLORS.gray, 0.1)}`,
                          '&:hover': { 
                            bgcolor: alpha(SNNPR_COLORS.primary, 0.02),
                          },
                        }}
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                      >
                        <TableCell>
                          <Chip 
                            label={caseItem.case_number}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(SNNPR_COLORS.primary, 0.1),
                              color: SNNPR_COLORS.primary,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: SNNPR_COLORS.dark }}>
                          {caseItem.case_title}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatAbuseTypeName(caseItem.abuse_type)}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(SNNPR_COLORS.secondary, 0.1),
                              color: SNNPR_COLORS.secondary,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={caseItem.status}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(statusColor, 0.1),
                              color: statusColor,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ fontSize: 16, color: zoneColor, mr: 1 }} />
                            <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: '0.875rem' }}>
                              {caseItem.zone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: SNNPR_COLORS.gray }}>
                          {dayjs(caseItem.created_at).format('MMM D, YYYY')}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/cases/${caseItem.id}`)
                            }}
                            sx={{ 
                              color: SNNPR_COLORS.secondary,
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage