import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  Paper,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import PerpetratorList from '../components/Perpetrators/PerpetratorList'
import PerpetratorForm from '../components/Perpetrators/PerpetratorForm'
import SearchBar from '../components/Common/SearchBar'
import { perpetratorApi } from '../api/perpetrators'

const PerpetratorsPage = () => {
  const [perpetrators, setPerpetrators] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedPerp, setSelectedPerp] = useState(null)

  useEffect(() => {
    fetchPerpetrators()
  }, [])

  const fetchPerpetrators = async () => {
    setLoading(true)
    try {
      const response = await perpetratorApi.getPerpetrators({ search: searchTerm })
      setPerpetrators(response.data || [])
    } catch (error) {
      console.error('Failed to fetch perpetrators:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchPerpetrators()
  }

  const handleCreatePerpetrator = async (data) => {
    try {
      await perpetratorApi.createPerpetrator(data)
      setOpenForm(false)
      fetchPerpetrators()
    } catch (error) {
      console.error('Failed to create perpetrator:', error)
      throw error
    }
  }

  const handleUpdatePerpetrator = async (id, data) => {
    try {
      await perpetratorApi.updatePerpetrator(id, data)
      setSelectedPerp(null)
      setOpenForm(false)
      fetchPerpetrators()
    } catch (error) {
      console.error('Failed to update perpetrator:', error)
      throw error
    }
  }

  const handleDeletePerpetrator = async (id) => {
    if (window.confirm('Are you sure you want to delete this perpetrator?')) {
      try {
        await perpetratorApi.deletePerpetrator(id)
        fetchPerpetrators()
      } catch (error) {
        console.error('Failed to delete perpetrator:', error)
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Perpetrator Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          New Perpetrator
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <SearchBar onSearch={handleSearch} placeholder="Search perpetrators..." />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <PerpetratorList
          perpetrators={perpetrators}
          loading={loading}
          onEdit={(perp) => {
            setSelectedPerp(perp)
            setOpenForm(true)
          }}
          onDelete={handleDeletePerpetrator}
          onView={(perp) => {
            // Navigate to perpetrator details view
            console.log('View perpetrator:', perp)
          }}
        />
      </Paper>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <PerpetratorForm
          initialData={selectedPerp}
          onSubmit={selectedPerp ? 
            (data) => handleUpdatePerpetrator(selectedPerp.id, data) :
            handleCreatePerpetrator
          }
          onCancel={() => {
            setOpenForm(false)
            setSelectedPerp(null)
          }}
        />
      </Dialog>
    </Box>
  )
}

export default PerpetratorsPage