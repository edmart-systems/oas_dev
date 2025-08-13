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

    </Stack>
  );
};

export default CategoriesPage;