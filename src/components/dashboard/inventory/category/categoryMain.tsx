'use client';

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  alpha,
  useTheme,
} from "@mui/material";
import { PlusIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Category } from '@/modules/inventory/types/category.types';
import CategoryTable from './catergoryTable';
import { toast } from 'react-toastify';
import CategoryForm from './CategoryForm';
import MyCircularProgress from '@/components/common/my-circular-progress';

const CategoryMain = () => {
  const theme = useTheme();

  const colors = {
    primary: "#D98219",
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  } 

  const filteredCategories = categories.filter(category =>
    (category.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedCategory(null);
    setOpenForm(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: colors.surface,
          boxShadow: `0 4px 16px ${alpha(colors.success, 0.08)}`,
        }}
      >
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
                  startAdornment: <MagnifyingGlassIcon size={20} />,
                }}
              />
              <Button 
                variant="contained" 
                disabled={loading} 
                startIcon={<PlusIcon />} 
                onClick={handleAdd}
                sx={{
                  backgroundColor: colors.primary,
                  "&:hover": {
                    backgroundColor: alpha(colors.primary, 0.9),
                  },
                }}
              >
                Add Category
              </Button>
            </Stack>
          }
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceVariant,
          }}
        />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <MyCircularProgress />
            </Box>
          ) : (
            <CategoryTable categories={filteredCategories} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={openForm}
        initialData={selectedCategory}
        onClose={() => setOpenForm(false)}
        onSuccess={(newCategory) => {
          fetchData();
          setOpenForm(false)
          toast.success('Category added successfully');
        }}
      />
    </Stack>
  );
};

export default CategoryMain;
