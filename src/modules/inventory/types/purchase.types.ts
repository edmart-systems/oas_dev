import { ProductDtoInput  } from "@/modules/inventory/dtos/product.dto";
import { PurchaseItemDtoInput  } from "@/modules/inventory/dtos/purchase_item.dto";
import { PurchaseDtoInput  } from "@/modules/inventory/dtos/purchase.dto";
import { SupplierDtoInput } from "../dtos/supplier.dto";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";
import { CompanyDto } from "@/types/company.types";
import React, { Dispatch, forwardRef, Fragment, Ref, SetStateAction } from "react";
import { Supplier } from "./supplier.types";
import { InventoryPoint } from "./inventoryPoint.types";



export interface Product extends ProductDtoInput {
  product_id: number;
}
export interface CartItem extends PurchaseItemDtoInput {
  product_name: string;
  total_cost: number;
}
export interface PurchaseOrder extends PurchaseDtoInput {
  purchase_id: number;
  Purchase_items?: PurchaseItemDtoInput[];
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


export interface PurchaseCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateUnitCost: (productId: number, unitCost: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onProcessPurchase: () => void;
}

export interface PurchaseHistoryProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  onDelete: (purchaseId: number) => void;
  company?: CompanyDto;
  inventoryPoints: InventoryPoint[];
  products: Product[];
  
}
export interface OpenDialog {
  supplier: boolean;
  inventoryPoint: boolean;
  product: boolean;
  deleteConfirm: boolean;
}

export interface PurchaseDialogsProps {
  openDialog: OpenDialog;
  itemToDelete: CartItem | null;
  onCloseDialog: (type: keyof OpenDialog) => void;
  onConfirmDelete: () => void;
  onRefreshData: () => void;
}

export interface PurchasePdfDocProps {
  purchase: PurchaseOrder;
  company: CompanyDto;
}


export interface PurchaseViewDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  purchase: PurchaseOrder; //Purchase 
  company: CompanyDto;
};

export interface PurchaseDownloadButtonsProps {
  purchase: PurchaseOrder;
  company: CompanyDto;
  supplierName: string;
  inventoryPointName: string;
  productNames: Record<number, string>;
};