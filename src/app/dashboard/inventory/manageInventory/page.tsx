"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Stack,

} from "@mui/material";
import CategoryMain from "@/components/dashboard/inventory/category/categoryMain";
import TagMain from "@/components/dashboard/inventory/tag/tagMain";
import ProductsMain from "@/components/dashboard/inventory/products/productMain";
import { Stack as PhosphorStack, Tag as TagIcon, StackSimple as CategoryIcon} from "@phosphor-icons/react";
import InventoryPointMain from "@/components/dashboard/inventory/inventoryPoint/inventoryPointMain";




const CategoriesPage = () => {
  const [tabValue, setTabValue] = useState(0);
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
            variant={tabValue === 0 ? "contained" : "outlined"}
            startIcon={<PhosphorStack size={20} />}
            onClick={() => setTabValue(0)}
            color="primary"
          >
                  Products
                </Button>
                <Button
                  variant={tabValue === 1 ? "contained" : "outlined"}
                  startIcon={<TagIcon size={20} />}
                  onClick={() => setTabValue(1)}
                  color="primary"
                >
                  Tags
                </Button>
                <Button
                  variant={tabValue === 2 ? "contained" : "outlined"}
                  startIcon={<CategoryIcon size={20} />}
                  onClick={() => setTabValue(2)}
                  color="primary"
                >
                  Categories
                </Button>
                <Button
                  variant={tabValue === 3 ? "contained" : "outlined"}
                  startIcon={<CategoryIcon size={20} />}
                  onClick={() => setTabValue(3)}
                  color="primary"
                >
                  Inventory Point
                </Button>

      </Stack>
      {/* Catergories */}
      {tabValue == 2 &&(
        <CategoryMain/>
      )}
      {/* Tags */}
      {tabValue == 1 &&(
       <TagMain/>
      )}
      {/* Products */}
      {(tabValue == 0) && (
        <ProductsMain/>
      )}
      {(tabValue == 3) && (
        <InventoryPointMain/>
      )}  

    </Stack>
  );
};

export default CategoriesPage;