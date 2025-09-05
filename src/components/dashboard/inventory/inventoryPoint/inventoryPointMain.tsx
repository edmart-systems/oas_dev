import { Stack, TextField, Card, CardHeader, Button, CardContent, Box } from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'
import InventoryPointTable from './inventoryPointTable'
import { toast } from 'react-toastify'
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import MyCircularProgress from '@/components/common/my-circular-progress'
import InventoryPointForm from './inventoryPointForm'
import { Location } from '@/modules/inventory/types/location.types'

const InventoryPointMain = () => {
  const [inventoryPoints, setInventoryPoints] = useState<Location[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [selectedInventoryPoint, setSelectedInventoryPoint] = useState<Location | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('Calling API: /api/inventory/inventory_point')
      const res = await fetch("/api/inventory/inventory_point")
      console.log('API Response status:', res.status)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to fetch Inventory Points: ${res.status}`)
      }

      const data: Location[] = await res.json()
      console.log('Inventory Points data:', data)
      setInventoryPoints(data)
    } catch (error) {
      console.error("Failed to fetch inventory Points:", error)
      toast.error("Failed to fetch inventory Points")
    } finally {
      setLoading(false)
    }
  }

  const filteredInventoryPoints = inventoryPoints.filter(inventoryPoint =>
    (inventoryPoint.location_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setSelectedInventoryPoint(null)
    setOpenForm(true)
  }

  const handleEdit = (inventoryPoint: Location) => {
    setSelectedInventoryPoint(inventoryPoint)
    setOpenForm(true)
  }

  const handleFormSuccess = () => {
    toast.success("Inventory Point saved successfully!")
    fetchData()
    setOpenForm(false)
    setSelectedInventoryPoint(null)
  }

  return (
    <Card>
      <CardHeader
        title="Inventory Points"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search Inventory Points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <MagnifyingGlassIcon size={20} />,
              }}
            />
            <Button
              variant="contained"
              disabled={loading}
              startIcon={<PlusIcon />}
              onClick={handleAdd}
            >
              Add Inventory Point
            </Button>
          </Stack>
        }
      />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <MyCircularProgress />
          </Box>
        ) : (
          <InventoryPointTable inventoryPoints={filteredInventoryPoints} onEdit={handleEdit} />
        )}

        {openForm && (
          <InventoryPointForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            initialData={selectedInventoryPoint}
            onSuccess={handleFormSuccess}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default InventoryPointMain