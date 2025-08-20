import React, { useEffect, useState } from 'react'
import {
  Box,
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
import MyCircularProgress from '@/components/common/my-circular-progress';



const InventoryPointMain = () => {
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedInventoryPoint, setSelectedInventoryPoint] = useState<InventoryPoint | null>(null);
  
   
  useEffect(() => {
      fetchData();
    }, []);


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/inventory_point");
      if (!res.ok) throw new Error("Failed to fetch Inventory Points");

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
    (inventoryPoint.inventory_point || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
      setSelectedInventoryPoint(null); 
      setOpenForm(true);
    };
  
    const handleEdit = (inventory_point: InventoryPoint) => {
      setSelectedInventoryPoint(inventory_point); 
      setOpenForm(true);
    };

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
              <Button variant="contained" disabled={loading} startIcon={<Plus />} onClick={handleAdd}>
                Add InventoryPoint
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
        </CardContent>
                      <InventoryPointForm
                      open={openForm}
                      initialData={selectedInventoryPoint}
                      onClose={() => setOpenForm(false)}
                      onSuccess={() => {
                        fetchData();
                        setOpenForm(false);
                        toast.success('InventoryPoint added successfully');
                      }}
                      />
      </Card>

    
  )
}

export default InventoryPointMain