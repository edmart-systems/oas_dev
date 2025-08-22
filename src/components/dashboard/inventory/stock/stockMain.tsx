import { Stack, CircularProgress, TextField, Card, CardHeader, Button, CardContent, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import StockTable from './stockTable'
import { Stock } from '@/modules/inventory/types/stock.types'
import { toast } from 'react-toastify'
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import MyCircularProgress from '@/components/common/my-circular-progress'

const StockMain = () => {
  const [stock, setStock] = useState<Stock[]>([])
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
      const res = await fetch("/api/inventory/stock")
      if (!res.ok) throw new Error("Failed to fetch Stock")

      const data: Stock[] = await res.json()
      setStock(data)
    } catch (error) {
      console.error("Failed to fetch Stock", error)
      toast.error("Failed to fetch Stock")
    } finally {
      setLoading(false)
    }
  }

  const filteredStock = stock.filter(item =>
    (item.product?.product_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const handleEdit = (stock: Stock) => {
    setSelectedStock(stock)
    setOpenForm(true)
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
              <Button variant="contained" disabled={loading} startIcon={<PlusIcon />} onClick={() => setOpenForm(true )}>
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
          
            
                    <StockTable
          Stock={filteredStock}
          onEdit={handleEdit}
        />

        )}
        {/* Example: conditional form rendering */}
      {openForm && selectedStock && (
        <div>
          {/* Replace with your form component */}
          Editing stock: {selectedStock.product?.product_name}
        </div>
      )}
        </CardContent>
          
      </Card>


  )
}

export default StockMain
