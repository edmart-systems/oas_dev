import React, { useEffect, useState, useCallback } from "react"
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Stock } from "@/modules/inventory/types/stock.types"
import { toast } from "react-toastify"

interface Product {
  product_id: number
  product_name: string
}

interface InventoryPoint {
  inventory_point_id: number
  inventory_point: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (updatedStock: Stock) => void
  initialData?: Stock
}

const adjustmentTypes = ["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"] as const

const StockAdjustmentForm: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
  const [adjustmentType, setAdjustmentType] = useState<"PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT">("ADJUSTMENT")
  const [quantity, setQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [productId, setProductId] = useState<number | null>(null)
  const [inventoryPointId, setInventoryPointId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (initialData) {
      setAdjustmentType("ADJUSTMENT")
      setQuantity(0)
      setProductId(initialData.product?.product_id ?? null)
      setInventoryPointId(initialData.inventory_point?.inventory_point_id ?? null)
      setError("")
    } else {
      setProductId(null)
      setInventoryPointId(null)
      setQuantity(0)
    }
    if (open && !dataLoaded) {
      fetchProducts()
      fetchInventoryPoints()
    }
  }, [initialData, open, dataLoaded])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/product")
      if (!res.ok) throw new Error("Failed to fetch products")
      const data: Product[] = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load products")
    }
  }, [])

  const fetchInventoryPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/inventory_point")
      if (!res.ok) throw new Error("Failed to fetch inventory points")
      const data: InventoryPoint[] = await res.json()
      setInventoryPoints(data)
      setDataLoaded(true)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load inventory points")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!productId || !inventoryPointId) {
      setError("Please select product and inventory point")
      return
    }

    if (quantity === 0) {
      setError("Quantity cannot be zero")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/inventory/stock/adjust`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_id: initialData?.stock_id,
          product_id: productId,
          inventory_point_id: inventoryPointId,
          change_type: adjustmentType,
          quantity_change: quantity,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to adjust stock")
      }

      const updatedStock: Stock = await res.json()
      onSuccess(updatedStock)
      onClose()
      toast.success("Stock adjusted successfully!")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={initialData?.stock_id || "new"}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
                { initialData?.stock_id ? 'Edit Stock Adjustment' : 'New Stock Adjustment'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          select
          label="Product"
          value={productId ?? ""}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (!isNaN(value)) setProductId(value)
          }}
          required
        >
          {products.map((p) => (
            <MenuItem key={p.product_id} value={p.product_id}>
              {p.product_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Inventory Point"
          value={inventoryPointId ?? ""}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (!isNaN(value)) setInventoryPointId(value)
          }}
          required
        >
          {inventoryPoints.map((ip) => (
            <MenuItem key={ip.inventory_point_id} value={ip.inventory_point_id}>
              {ip.inventory_point}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Adjustment Type"
          value={adjustmentType}
          onChange={(e) => {
            const value = e.target.value as typeof adjustmentTypes[number]
            setAdjustmentType(value)
          }}
        >
          {adjustmentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (!isNaN(value)) setQuantity(value)
          }}
        />
      </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
                        {initialData?.stock_id ? 'Edit' : 'Add'} Stock Adjustment
            </Button>

        </DialogActions>
      
    </form>

    </Dialog>

  
  )
}

export default StockAdjustmentForm
