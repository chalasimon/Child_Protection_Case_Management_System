import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
} from '@mui/material'
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { caseApi } from '../api/cases'
import { victimApi } from '../api/victims'
import { perpetratorApi } from '../api/perpetrators'
import { childApi } from '../api/children'
import { incidentApi } from '../api/incidents'
import { useLocation, useNavigate } from 'react-router-dom'

const useQuery = () => new URLSearchParams(useLocation().search)

const filterItems = (items, term, fields) => {
  if (!term) return items
  const t = term.toLowerCase()
  return items.filter((item) =>
    fields.some((f) => (item[f] || '').toString().toLowerCase().includes(t))
  )
}

const Section = ({ title, loading, error, items, renderItem, emptyLabel }) => (
  <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      {loading && <CircularProgress size={16} />}
      {items?.length > 0 && (
        <Chip label={`${items.length}`} size="small" sx={{ ml: 'auto' }} />
      )}
    </Stack>
    {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
    {!loading && !error && items?.length === 0 && (
      <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>
    )}
    {!loading && !error && items?.length > 0 && (
      <List dense>
        {items.map(renderItem)}
      </List>
    )}
  </Paper>
)

const SearchPage = () => {
  const query = useQuery()
  const navigate = useNavigate()
  const initialTerm = query.get('q') || ''
  const [term, setTerm] = useState(initialTerm)

  const [cases, setCases] = useState([])
  const [victims, setVictims] = useState([])
  const [perps, setPerps] = useState([])
  const [children, setChildren] = useState([])
  const [incidents, setIncidents] = useState([])

  const [loading, setLoading] = useState({
    cases: false,
    victims: false,
    perps: false,
    children: false,
    incidents: false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setTerm(initialTerm)
  }, [initialTerm])

  const fetchData = async () => {
    setErrors({})
    setLoading({ cases: true, victims: true, perps: true, children: true, incidents: true })
    try {
      const [casesRes, victimsRes, perpsRes, childrenRes, incidentsRes] = await Promise.allSettled([
        caseApi.getCases({ per_page: 200 }),
          victimApi.getVictims?.({ per_page: 200 }) || victimApi.getVictims?.(),
        perpetratorApi.getPerpetrators?.({ per_page: 200 }) || perpetratorApi.getPerpetrators?.(),
        childApi.getChildren?.({ per_page: 200 }) || childApi.getChildren?.(),
        incidentApi.getIncidents?.({ per_page: 200 }) || incidentApi.getIncidents?.(),
      ])

      const normalize = (res) => {
        if (res.status !== 'fulfilled') return []
        const data = res.value?.data ?? res.value
        return Array.isArray(data) ? data : (data?.data || [])
      }

      setCases(normalize(casesRes))
      setVictims(normalize(victimsRes))
      setPerps(normalize(perpsRes))
      setChildren(normalize(childrenRes))
      setIncidents(normalize(incidentsRes))
    } catch (err) {
      // Errors captured per promise above
    } finally {
      setLoading({ cases: false, victims: false, perps: false, children: false, incidents: false })
      setErrors({
        cases: cases instanceof Error ? cases.message : '',
        victims: victims instanceof Error ? victims.message : '',
        perps: perps instanceof Error ? perps.message : '',
        children: children instanceof Error ? children.message : '',
        incidents: incidents instanceof Error ? incidents.message : '',
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => ({
    cases: filterItems(cases, term, ['case_title', 'case_number', 'abuse_type', 'status', 'location']),
    victims: filterItems(victims, term, ['name', 'gender', 'zone', 'woreda']),
    perps: filterItems(perps, term, ['name', 'gender', 'zone', 'woreda']),
    children: filterItems(children, term, ['name', 'gender', 'zone', 'woreda']),
    incidents: filterItems(incidents, term, ['title', 'description', 'status', 'location']),
  }), [cases, victims, perps, children, incidents, term])

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = term.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Search</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Search across cases, victims, perpetrators, children, incidents"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <RefreshIcon onClick={fetchData} sx={{ cursor: 'pointer' }} />
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Section
            title="Cases"
            loading={loading.cases}
            error={errors.cases}
            items={filtered.cases}
            emptyLabel="No matching cases"
            renderItem={(c) => (
              <ListItem key={`case-${c.id}`} button onClick={() => navigate(`/cases/${c.id || c.case_id || ''}`)}>
                <ListItemText
                  primary={c.case_title || c.title || 'Untitled Case'}
                  secondary={(c.case_number || '').toString() || 'No case number'}
                />
              </ListItem>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Section
            title="Victims"
            loading={loading.victims}
            error={errors.victims}
            items={filtered.victims}
            emptyLabel="No matching victims"
            renderItem={(v) => (
              <ListItem key={`victim-${v.id}`}>
                <ListItemText
                  primary={v.name || 'Unknown victim'}
                  secondary={[v.gender, v.zone, v.woreda].filter(Boolean).join(' • ') || 'No details'}
                />
              </ListItem>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Section
            title="Perpetrators"
            loading={loading.perps}
            error={errors.perps}
            items={filtered.perps}
            emptyLabel="No matching perpetrators"
            renderItem={(p) => (
              <ListItem key={`perp-${p.id}`}>
                <ListItemText
                  primary={p.name || 'Unknown perpetrator'}
                  secondary={[p.gender, p.zone, p.woreda].filter(Boolean).join(' • ') || 'No details'}
                />
              </ListItem>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Section
            title="Children"
            loading={loading.children}
            error={errors.children}
            items={filtered.children}
            emptyLabel="No matching children"
            renderItem={(ch) => (
              <ListItem key={`child-${ch.id}`}>
                <ListItemText
                  primary={ch.name || 'Unknown child'}
                  secondary={[ch.gender, ch.zone, ch.woreda].filter(Boolean).join(' • ') || 'No details'}
                />
              </ListItem>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Section
            title="Incidents"
            loading={loading.incidents}
            error={errors.incidents}
            items={filtered.incidents}
            emptyLabel="No matching incidents"
            renderItem={(inc) => (
              <ListItem key={`incident-${inc.id}`}>
                <ListItemText
                  primary={inc.title || inc.description || 'Incident'}
                  secondary={[inc.status, inc.location].filter(Boolean).join(' • ') || 'No details'}
                />
              </ListItem>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default SearchPage
