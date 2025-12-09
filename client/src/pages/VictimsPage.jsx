import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  Paper,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import VictimList from '../components/Victims/VictimList'
import VictimForm from '../components/Victims/VictimForm'
import SearchBar from '../components/Common/SearchBar'
import { victimApi } from '../api/victims'
import { caseApi } from '../api/cases'

const VictimsPage = () => {
  const [victims, setVictims] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedVictim, setSelectedVictim] = useState(null)

  useEffect(() => {
    fetchVictims()
    fetchCases()
  }, [])

  const fetchVictims = async () => {
    setLoading(true)
    try {
      const response = await victimApi.getVictims({ search: searchTerm })
      setVictims(response.data || [])
    } catch (error) {
      console.error('Failed to fetch victims:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCases = async () => {
    try {
      const response = await caseApi.getCases({ per_page: 100 })
      setCases(response.data || [])
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchVictims()
  }

  const handleCreateVictim = async (data) => {
    try {
      await victimApi.createVictim(data)
      setOpenForm(false)
      fetchVictims()
    } catch (error) {
      console.error('Failed to create victim:', error)
      throw error
    }
  }

  const handleUpdateVictim = async (id, data) => {
    try {
      await victimApi.updateVictim(id, data)
      setSelectedVictim(null)
      setOpenForm(false)
      fetchVictims()
    } catch (error) {
      console.error('Failed to update victim:', error)
      throw error
    }
  }

  const handleDeleteVictim = async (id) => {
    if (window.confirm('Are you sure you want to delete this victim?')) {
      try {
        await victimApi.deleteVictim(id)
        fetchVictims()
      } catch (error) {
        console.error('Failed to delete victim:', error)
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Victim Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          New Victim
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <SearchBar onSearch={handleSearch} placeholder="Search victims..." />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <VictimList
          victims={victims}
          loading={loading}
          onEdit={(victim) => {
            setSelectedVictim(victim)
            setOpenForm(true)
          }}
          onDelete={handleDeleteVictim}
          onView={(victim) => {
            // Navigate to victim details view
            console.log('View victim:', victim)
          }}
        />
      </Paper>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <VictimForm
          initialData={selectedVictim}
          cases={cases}
          onSubmit={selectedVictim ? 
            (data) => handleUpdateVictim(selectedVictim.id, data) :
            handleCreateVictim
          }
          onCancel={() => {
            setOpenForm(false)
            setSelectedVictim(null)
          }}
        />
      </Dialog>
    </Box>
  )
}

export default VictimsPage