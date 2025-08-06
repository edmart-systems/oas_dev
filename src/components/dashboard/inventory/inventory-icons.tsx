import{
    Stack,
    Receipt,
    Invoice,
    CashRegister,
    Archive,
    Package,
    Truck,
    Users,
    ChartBar,
    Gear,
    Warning,
    ArrowsClockwise,
    Tag,
    Warehouse,
    ShoppingCart,
    House
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";


export const inventoryIcons = {
    home: House,
    products: Stack,
    purchase: Receipt,
    invoices: Invoice,
    sales: CashRegister,
    reports: Archive,
    stock: Package,
    suppliers: Truck,
    customers: Users,
    analytics: ChartBar,
    settings: Gear,
    alerts: Warning,
    transfers: ArrowsClockwise,
    categories: Tag,
    warehouse: Warehouse,
    orders: ShoppingCart
} as Record<string, Icon>;