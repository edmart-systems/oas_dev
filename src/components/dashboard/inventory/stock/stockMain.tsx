import { Stack, TextField, Card, CardHeader, Button, CardContent, Box } from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'
import StockTable from './stockTable'
import { Stock } from '@/modules/inventory/types/stock.types'
import { toast } from 'react-toastify'
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import MyCircularProgress from '@/components/common/my-circular-progress'
import StockAdjustmentForm from './stockAdjustmentForm'

const StockMain = () => {
  const [stock, setStock] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('Calling API: /api/inventory/stock')
      const res = await fetch("/api/inventory/stock")
      console.log('API Response status:', res.status)
      if (!res.ok) throw new Error("Failed to fetch Stock")

      const data: any[] = await res.json()
      console.log('Stock API Response:', data)
      console.log('First item structure:', data[0])
      setStock(data)
    } catch (error) {
      console.error("Failed to fetch Stock", error)
      toast.error("Failed to fetch Stock")
    } finally {
      setLoading(false)
    }
  }

  const filteredStock = useMemo(() => 
    stock.filter(item =>
      (item.product?.product_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ), [stock, searchTerm]
  )

  const handleEdit = (stock: Stock) => {
    setSelectedStock(stock)
    setOpenForm(true)
  }

  const handleNewAdjustment = () => {
    setSelectedStock(null) // null means new adjustment, not editing
    setOpenForm(true)
  }

  const handleFormSuccess = (updatedStock: Stock) => {
    toast.success("Stock adjusted successfully!")
    // refresh the stock list
    fetchData()
    setOpenForm(false)
    setSelectedStock(null)
  }

  return (
    <Card>
      <CardHeader
        title="Stock"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search Stock..."
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
              onClick={handleNewAdjustment}
            >
              New Stock Adjustment
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
          <StockTable stock={filteredStock} onEdit={handleEdit} />
        )}

        {/* Stock Adjustment Form Modal */}
        {openForm && (
          <StockAdjustmentForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            initialData={selectedStock ?? undefined}
            onSuccess={handleFormSuccess}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default StockMain
