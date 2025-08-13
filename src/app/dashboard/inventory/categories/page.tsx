"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Stack,

} from "@mui/material";
import { toast } from "react-toastify";
import TagForm from "@/components/dashboard/inventory/tag/tagForm";
import CategoryForm from "@/components/dashboard/inventory/category/CategoryForm";
import { Category } from "@/modules/inventory/types/category.types";
import { Tag } from "@/modules/inventory/types/tag.types";
import CategoryMain from "@/components/dashboard/inventory/category/categoryMain";
import TagMain from "@/components/dashboard/inventory/tag/tagMain";




const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState({
      category: false,
      tag: false,
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
      const[tagRes, CategoryRes] = await Promise.all([
        fetch("/api/inventory/tag"), 
        fetch("/api/inventory/category")]);

      const[tagData, categoryData] = await Promise.all([
        tagRes.json(),
        CategoryRes.json()]);
      
      setTags(tagData);
      setCategories(categoryData);
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

  const filteredTags = tags.filter(tag =>
    tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
            variant={tabValue === 0 ? "contained" : "outlined"}
            onClick={() => setTabValue(0)}
            color="primary"
          >
                  Categories
                </Button>
                <Button
                  variant={tabValue === 1 ? "contained" : "outlined"}
                  onClick={() => setTabValue(1)}
                  color="primary"
                >
                  Tags
                </Button>

      </Stack>
      {/* Catergories */}
                {tabValue == 0 &&(
                  <CategoryMain
                    categories={filteredCategories}
                    onAdd={() => handleDialogOpen('category')}
                    onEdit={() => handleDialogOpen('category')}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                )}
      {/* Tags */}
      {tabValue == 1 &&(
       <TagMain
        tags={filteredTags}
        onAdd={() => handleDialogOpen('tag')}
        onEdit={() => handleDialogOpen('tag')}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
       />
      )}
      
      <TagForm
              open={openDialog.tag}
              onClose={() => handleDialogClose('tag')}
              onSuccess={(newTag) => {
                toast.success('Tag added successfully');
              }}
            />
      <CategoryForm
        open={openDialog.category}
        onClose={() => handleDialogClose('category')}
        onSuccess={(newCategory) => {
          toast.success('Category added successfully');
         
        }}
      />
    </Stack>
  );
};

export default CategoriesPage;