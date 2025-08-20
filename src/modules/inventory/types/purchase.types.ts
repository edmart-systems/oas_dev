import { ProductDtoInput  } from "@/modules/inventory/dtos/product.dto";
import { PurchaseItemDtoInput  } from "@/modules/inventory/dtos/purchase_item.dto";
import { PurchaseDtoInput  } from "@/modules/inventory/dtos/purchase.dto";
import { SupplierDtoInput } from "../dtos/supplier.dto";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";
import { CompanyAddressDTO, CompanyDto } from "@/types/company.types";
import React, { Dispatch, forwardRef, Fragment, Ref, SetStateAction } from "react";
import { Supplier } from "./supplier.types";
import { InventoryPoint } from "./inventoryPoint.types";
import { Product } from "@/types/product.types";
import { Company } from "@prisma/client";




export interface CartItem extends PurchaseItemDtoInput {
  product_name: string;
  total_cost: number;
}
export interface Purchase extends PurchaseDtoInput {
  purchase_id: number;
  Purchase_items?: PurchaseItemDtoInput[];
  creator?: {
    firstName: string;
    lastName: string;
  };
  created_by?:string;
}



export interface PurchaseMainProps {
  products: Product[];
  cart: CartItem[];
  suppliers: Supplier[];
  inventoryPoints: InventoryPoint[];
  supplierId: number;
  inventoryPointId: number;
  searchTerm: string;
  recentSearches: string[];
  showDropdown: boolean;
  selectedProductIndex: number;
  loading: boolean;
  onSupplierChange: (id: number) => void;
  onInventoryPointChange: (id: number) => void;
  onSearchChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onAddToCart: (product: Product) => void;
  onCloseDropdown: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateUnitCost: (productId: number, unitCost: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onProcessPurchase: () => void;
onOpenDialog: (type: "supplier" | "inventoryPoint" | "product") => void;

} 
export interface ProductSearchProps {
  searchTerm: string;
  products: Product[];
  recentSearches: string[];
  showDropdown: boolean;
  selectedProductIndex: number;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onAddToCart: (product: Product) => void;
  onCloseDropdown: () => void;
}





export interface PurchaseViewDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  purchase: Purchase; //Purchase 
  company: CompanyDto;
};

