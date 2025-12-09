import { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  Autocomplete,
  Alert,
} from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { userApi } from '../../api/users'
import { perpetratorApi } from '../../api/perpetrators'

const validationSchema = yup.object({
  case_title: yup.string().required('Case title is required'),
  abuse_type: yup.string().required('Abuse type is required'),
  priority: yup.string(),
  severity: yup.string(),
  location: yup.string(),
  incident_date: yup.date(),
  status: yup.string(),
  assigned_to: yup.number().nullable(),
})

const CaseForm = ({ initialData, onSubmit, onCancel }) => {
  const [focalPersons, setFocalPersons] = useState([])
  const [perpetrators, setPerpetrators] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [personsResponse, perpsResponse] = await Promise.all([
        userApi.getFocalPersons(),
        perpetratorApi.getPerpetrators({ per_page: 100 }),
      ])
      setFocalPersons(personsResponse.data || [])
      setPerpetrators(perpsResponse.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  const formik = useFormik({
    initialValues: initialData || {
      case_title: '',
      case_description: '',
      abuse_type: '',
      priority: 'medium',
      severity: 'medium',
      location: '',
      incident_date: '',
      status: 'reported',
      assigned_to: null,
      perpetrator_ids: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('')
      setLoading(true)
      try {
        await onSubmit(values)
        onCancel()
      } catch (err) {
        setError(err.message || 'Failed to save case')
      } finally {
        setLoading(false)
      }
    },
  })

  const abuseTypes = [
    'sexual_abuse',
    'physical_abuse',
    'emotional_abuse',
    'neglect',
    'exploitation',
    'other',
  ]

  const priorities = ['low', 'medium', 'high', 'critical']
  const severities = ['low', 'medium', 'high', 'critical']
  const statuses = [
    'reported',
    'assigned',
    'under_investigation',
    'investigation',
    'resolved',
    'closed',
    'reopened',
  ]

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>{initialData ? 'Edit Case' : 'Create New Case'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="case_title"
              label="Case Title"
              value={formik.values.case_title}
              onChange={formik.handleChange}
              error={formik.touched.case_title && Boolean(formik.errors.case_title)}
              helperText={formik.touched.case_title && formik.errors.case_title}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="case_description"
              label="Description"
              value={formik.values.case_description}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Abuse Type *</InputLabel>
              <Select
                name="abuse_type"
                value={formik.values.abuse_type}
                onChange={formik.handleChange}
                error={formik.touched.abuse_type && Boolean(formik.errors.abuse_type)}
                label="Abuse Type *"
              >
                {abuseTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                label="Priority"
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                name="severity"
                value={formik.values.severity}
                onChange={formik.handleChange}
                label="Severity"
              >
                {severities.map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              name="incident_date"
              label="Incident Date"
              value={formik.values.incident_date}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={formik.values.location}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assigned_to"
                value={formik.values.assigned_to || ''}
                onChange={formik.handleChange}
                label="Assigned To"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {focalPersons.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.name} ({person.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={perpetrators}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={perpetrators.filter(p => 
                formik.values.perpetrator_ids?.includes(p.id)
              )}
              onChange={(_, newValue) => {
                formik.setFieldValue(
                  'perpetrator_ids',
                  newValue.map(v => v.id)
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Perpetrators"
                  placeholder="Select perpetrators"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.first_name} ${option.last_name}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  )
}

export default CaseForm