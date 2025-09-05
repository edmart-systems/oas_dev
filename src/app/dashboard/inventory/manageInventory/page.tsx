"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Stack,
} from "@mui/material";
import CategoryMain from "@/components/dashboard/inventory/category/categoryMain";
import TagMain from "@/components/dashboard/inventory/tag/tagMain";
import ProductMain from "@/components/dashboard/inventory/products/productMain";
import { Stack as PhosphorStack, Tag as TagIcon, StackSimple as CategoryIcon, Warehouse, Package as PackageIcon, Unite as UniteSquareIcon, ArrowsClockwise as ArrowsClockwiseIcon} from "@phosphor-icons/react";
import InventoryPointMain from "@/components/dashboard/inventory/inventoryPoint/inventoryPointMain";
import StockMain from "@/components/dashboard/inventory/stock/stockMain";
import { CurrencyEth as CurrencyEthIcon } from "@phosphor-icons/react";
import UnitMain from "@/components/dashboard/inventory/units/UnitMain";
import CurrencyMain from "@/components/dashboard/inventory/units/CurrencyMain";
import TransfersMain from "@/components/dashboard/inventory/transfers/TransfersMain";
import InventoryStockMain from "@/components/dashboard/inventory/inventoryStock/InventoryStockMain";

const ManageInventoryPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (session?.user?.role_id === 2) {
      router.replace('/dashboard/inventory/sales');
    }
  }, [session, router]);

  if (session?.user?.role_id === 2) {
    return null;
  }

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
          variant={tabValue === 8 ? "contained" : "outlined"}
          startIcon={<PackageIcon size={20} />}
          onClick={() => setTabValue(8)}
          color="primary"
        >
          Inventory Stock
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
      
      {/* Categories */}
      {tabValue == 2 && (
        <CategoryMain/>
      )}
      {/* Tags */}
      {tabValue == 1 && (
       <TagMain/>
      )}
      {/* Products */}
      {(tabValue == 0) && (
        <ProductMain/>
      )}
      {(tabValue == 3) && (
        <InventoryPointMain/>
      )} 
      {(tabValue == 4) && (
        <StockMain/>
      )} 
      {(tabValue == 5) && (
        <TransfersMain/>
      )}
      {(tabValue == 8) && (
        <InventoryStockMain/>
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

export default ManageInventoryPage;