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
} from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'

const validationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  gender: yup.string().required('Gender is required'),
  case_id: yup.number().required('Case ID is required'),
})

const VictimForm = ({ initialData, onSubmit, onCancel, cases }) => {
  const formik = useFormik({
    initialValues: initialData || {
      first_name: '',
      last_name: '',
      gender: '',
      age: '',
      date_of_birth: '',
      contact_number: '',
      address: '',
      relationship_to_perpetrator: '',
      case_id: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values)
        onCancel()
      } catch (error) {
        console.error('Failed to save victim:', error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>{initialData ? 'Edit Victim' : 'Add Victim'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="first_name"
              label="First Name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="last_name"
              label="Last Name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Gender *</InputLabel>
              <Select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                label="Gender *"
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="age"
              label="Age"
              type="number"
              value={formik.values.age}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              name="date_of_birth"
              label="Date of Birth"
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="contact_number"
              label="Contact Number"
              value={formik.values.contact_number}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              value={formik.values.address}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="relationship_to_perpetrator"
              label="Relationship to Perpetrator"
              value={formik.values.relationship_to_perpetrator}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Case *</InputLabel>
              <Select
                name="case_id"
                value={formik.values.case_id}
                onChange={formik.handleChange}
                error={formik.touched.case_id && Boolean(formik.errors.case_id)}
                label="Case *"
              >
                <MenuItem value="">Select a case</MenuItem>
                {cases.map((caseItem) => (
                  <MenuItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.case_number} - {caseItem.case_title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  )
}

export default VictimForm