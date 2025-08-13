"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Plus, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import { ca, fi } from "date-fns/locale";
import { toast } from "react-toastify";
import { TagDtoInput } from "@/modules/inventory/dtos/tag.dto";
import { CategoryDtoInput } from "@/modules/inventory/dtos/category.dto";
import TagForm from "@/components/dashboard/inventory/tags/tagForm";
import CategoryForm from "@/components/dashboard/inventory/tags/CategoryForm";
import { SimpleUserDtoType } from "@/types/user.types";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import { Product } from "@/modules/inventory/types";


export interface User extends SimpleUserDtoType {}

export interface Category extends CategoryDtoInput {
category_id: string;
created_at: Date;
updated_at?: Date;
creator?: {
  co_user_id: string;
  firstName: string;
  lastName: string; 
};
Product: Product[];
}

export interface Tag extends TagDtoInput {
  tag_id: string;
  created_at: Date;
  updated_at?: Date;
  creator?: {
    co_user_id: string;
    firstName: string;
    lastName: string; 
  };
  Product: Product[];
}



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
                  <>
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
              <Button variant="contained" startIcon={<Plus />} onClick={() => handleDialogOpen('category')}>
                Add Category
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Products with Category</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell>CA-{category.category_id}</TableCell>
                    <TableCell>{category.category}</TableCell>
                    <TableCell 
                      title={category.Product?.length > 0 ? category.Product.map(p => p.product_name).join(", ") : "No products"}
                      sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {category.Product?.length > 0 
                        ? category.Product.map(p => p.product_name).join(", ") 
                        : "No products"}
                    </TableCell>
                    <TableCell>{category.updated_at? new Date(category.updated_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>{category.created_at? new Date(category.created_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>
                      {/* {category.creator ? `${category.creator.firstName} ${category.creator.lastName}` : category.created_by || "N/A"} */}
                      <UserAvatar/>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDialogOpen('category')}>
                        <PencilSimple />
                      </IconButton>
                      {/* <IconButton onClick={() => handleDelete(category.id)} color="error">
                        <Trash />
                      </IconButton> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

                  </>
                )}
      {/* Tags */}
      {tabValue == 1 &&(
        <>
        <Card>
        <CardHeader
          title="Tags"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={() => handleDialogOpen('tag') }>
                Add Tag
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Products with Tag</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.tag_id}>
                    <TableCell>TA-{tag.tag_id}</TableCell>
                    <TableCell>{tag.tag}</TableCell>
                    <TableCell 
                      title={tag.Product?.length > 0 ? tag.Product.map(p => p.product_name).join(", ") : "No products"}
                      sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {tag.Product?.length > 0 
                        ? tag.Product.map(p => p.product_name).join(", ") 
                        : "No products"}
                    </TableCell>
                    <TableCell>{tag.updated_at? new Date(tag.updated_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>{tag.created_at? new Date(tag.created_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>
                    {/* {tag.creator ? `${tag.creator.firstName} ${tag.creator.lastName}` : tag.created_by || "N/A"} */}
                    <UserAvatar/>
                  </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDialogOpen('tag')}>
                        <PencilSimple />
                      </IconButton>
                      {/* <IconButton onClick={() => handleDelete(category.id)} color="error">
                        <Trash />
                      </IconButton> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

        </>
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