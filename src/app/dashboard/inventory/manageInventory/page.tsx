"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Stack,

} from "@mui/material";
import CategoryMain from "@/components/dashboard/inventory/category/categoryMain";
import TagMain from "@/components/dashboard/inventory/tag/tagMain";
import ProductsMain from "@/components/dashboard/inventory/products/productMain";
import { Stack as PhosphorStack, Tag as TagIcon, StackSimple as CategoryIcon ,Warehouse, PackageIcon, UniteSquareIcon, ArrowsClockwiseIcon} from "@phosphor-icons/react";
import InventoryPointMain from "@/components/dashboard/inventory/inventoryPoint/inventoryPointMain";
import StockMain from "@/components/dashboard/inventory/stock/stockMain";
import { CurrencyEthIcon } from "@phosphor-icons/react/dist/ssr";
import UnitMain from "@/components/dashboard/inventory/units/UnitMain";
import CurrencyMain from "@/components/dashboard/inventory/units/CurrencyMain";


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
                  variant={tabValue === 6 ? "contained" : "outlined"}
                  startIcon={<UniteSquareIcon size={20} />}
                  onClick={() => setTabValue(6)}
                  color="primary"
                >
                  Units
                </Button>
                <Button
                  variant={tabValue === 7 ? "contained" : "outlined"}
                  startIcon={<CurrencyEthIcon size={20} />}
                  onClick={() => setTabValue(7)}
                  color="primary"
                >
                  Currencies
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
                  startIcon={<Warehouse size={20} />}
                  onClick={() => setTabValue(3)}
                  color="primary"
                >
                  Inventory Point
                </Button>
                
                <Button
                  variant={tabValue === 4 ? "contained" : "outlined"}
                  startIcon={<PackageIcon size={20} />}
                  onClick={() => setTabValue(4)}
                  color="primary"
                >
                  Stock
                </Button>
                <Button
                  variant={tabValue === 5 ? "contained" : "outlined"}
                  startIcon={<ArrowsClockwiseIcon size={20} />}
                  onClick={() => setTabValue(5)}
                  color="primary"
                >
                  transfers
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
      {(tabValue == 4) && (
        <StockMain/>
      )} 
      {(tabValue == 5) && (
        <h1>Transfers</h1>
      )}
      {(tabValue == 6) && (
        <UnitMain/>
      )}
      {(tabValue == 7) && (
        <CurrencyMain/>
      )}  

    </Stack>
  );
};

export default CategoriesPage;