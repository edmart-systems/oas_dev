import{ ArchiveIcon, ArrowsClockwiseIcon, CashRegisterIcon, ChartBarIcon, GearIcon, HouseIcon, InvoiceIcon, PackageIcon, ReceiptIcon, ShoppingCartIcon, SquaresFourIcon, TagIcon, TruckIcon, UsersIcon, WarehouseIcon, WarningIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { StackIcon } from "@phosphor-icons/react/dist/ssr";


export const inventoryIcons = {
    dashboard: SquaresFourIcon,
    products: StackIcon,
    purchase: ReceiptIcon,
    invoices: InvoiceIcon,
    sales: CashRegisterIcon,
    reports: ArchiveIcon,
    stock: PackageIcon,
    suppliers: TruckIcon,
    customers: UsersIcon,
    analytics: ChartBarIcon,
    settings: GearIcon,
    alerts: WarningIcon,
    transfers: ArrowsClockwiseIcon,
    categories: TagIcon,
    warehouse: WarehouseIcon,
    orders: ShoppingCartIcon,
    manage: HouseIcon, 
} as Record<string, Icon>;