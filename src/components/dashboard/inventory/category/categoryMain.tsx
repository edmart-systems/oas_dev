import React, { useState } from 'react'
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




interface Props {
  categories: Category[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: () => void;
}


const CategoryMain = ({categories, searchTerm, onSearchChange, onAdd, onEdit}: Props) => {
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
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                      startAdornment: <MagnifyingGlass size={20} />,
                    }}
                  />
                  <Button variant="contained" startIcon={<Plus />} onClick={onAdd}>
                    Add Category
                  </Button>
                </Stack>
              }
            />
            <CardContent>
                {/* Catergory table  */}
              <CatergoryTable categories={categories} onEdit={onEdit} />
              
            </CardContent>
          </Card>
    
  )
}

export default CategoryMain




