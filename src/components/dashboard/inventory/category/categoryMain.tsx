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
import { Category } from '@/modules/inventory/types/category.types';
import CatergoryTable from './catergoryTable';
import { toast } from 'react-toastify';
import CategoryForm from './CategoryForm';


const CategoryMain = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState({
      category: false,
    });
  const handleDialogOpen = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: true });
  
  const handleDialogClose = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: false }); 

  useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async ( )=>{
      setLoading(true);
      try{
        const  res = await fetch("/api/inventory/category");
        if(!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      }catch(error){
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
    } 
  const filteredCategories = categories.filter(category =>
    category.category.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
                 <Card>
            <CardHeader
              title="Categories"
              action={
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <MagnifyingGlass size={20} />,
                    }}
                  />
                  <Button variant="contained" startIcon={<Plus />} onClick={() => handleDialogOpen('category')  }>
                    Add Category
                  </Button>
                </Stack>
              }
            />
            <CardContent>
                {/* Catergory table  */}
              <CatergoryTable categories={filteredCategories} onEdit={() => handleDialogOpen('category')} />
              
            </CardContent>
            <CategoryForm
        open={openDialog.category}
        onClose={() => handleDialogClose('category')}
        onSuccess={(newCategory) => {
          fetchData()
          toast.success('Category added successfully');
         
        }}
      />
          </Card>
    
  )
}

export default CategoryMain




