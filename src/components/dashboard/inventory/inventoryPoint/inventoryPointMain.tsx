import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
} from "@mui/material";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import InventoryPointTable from './inventoryPointTable';
import { toast } from 'react-toastify';
import InventoryPointForm from './inventoryPointForm';
import { InventoryPoint } from '@/modules/inventory/types/inventoryPoint.types';



const InventoryPointMain = () => {
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState({
      inventoryPoint: false,
    });
  const handleDialogOpen = (type: keyof typeof openDialog) =>
  setOpenDialog({ ...openDialog, [type]: true });

  const handleDialogClose = (type: keyof typeof openDialog) =>
  setOpenDialog({ ...openDialog, [type]: false });

   
  useEffect(() => {
      fetchData();
    }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/inventory_point");
      if (!res.ok) throw new Error("Failed to fetch inventory Points");

      const data: InventoryPoint[] = await res.json();
      setInventoryPoints(data);
    } catch (error) {
      console.error("Failed to fetch inventory Points:", error);
      toast.error("Failed to fetch inventory Points");
    } finally {
      setLoading(false);
    }
  };
  const filteredInventoryPoints = inventoryPoints.filter(inventoryPoint =>
    inventoryPoint.inventory_point.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
       <Card>
        <CardHeader
          title="InventoryPoints"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search inventoryPoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={()=> handleDialogOpen('inventoryPoint')}>
                Add InventoryPoint
              </Button>
            </Stack>
          }
        />
        <CardContent>
            {/* InventoryPoint table  */}
            <InventoryPointTable inventoryPoints={filteredInventoryPoints} onEdit={() => handleDialogOpen('inventoryPoint'  )} />
        
        </CardContent>
        <InventoryPointForm
                      open={openDialog.inventoryPoint}
                      onClose={() => handleDialogClose('inventoryPoint')}
                      onSuccess={(newInventoryPoint) => {
                        toast.success('InventoryPoint added successfully');
                      }}
                    />
      </Card>

    
  )
}

export default InventoryPointMain