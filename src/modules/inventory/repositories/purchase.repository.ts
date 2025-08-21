 import { CreatePurchaseInput } from "../dtos/purchase.dto";
import { Purchase } from "@prisma/client";

export class PurchaseRepository {
    constructor(private prisma: any) {} // Accepts both PrismaClient and transaction client

    async create(data: CreatePurchaseInput): Promise<Purchase> {
        // Only keep allowed fields for nested creation
        const purchaseItems = data.purchase_items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost ?? item.unit_cost * item.quantity,
        }));

        return this.prisma.purchase.create({
            data: {
                purchase_quantity: data.purchase_quantity,
                purchase_unit_cost: data.purchase_unit_cost,
                purchase_total_cost: data.purchase_total_cost ?? 0,
                inventory_point_id: data.inventory_point_id,
                supplier_id: data.supplier_id,
                purchase_created_by: data.purchase_created_by,
                purchase_updated_by: data.purchase_updated_by,
                Purchase_items: purchaseItems.length
                    ? { create: purchaseItems }
                    : undefined,
            },
            include: {
                Purchase_items: true,
                creator: {
                    select: {
                        co_user_id: true,
                        firstName: true,
                        lastName: true
                    }
                },
            },
        });
    }

    async getAll(): Promise<Purchase[]> {
        return this.prisma.purchase.findMany({
            include: { Purchase_items: true,
                creator: {
                    select: {
                        co_user_id: true,
                        firstName: true,
                        lastName: true
                    }
                },
             },
        });
    }

    async getById(id: number): Promise<Purchase | null> {
        return this.prisma.purchase.findUnique({
            where: { purchase_id: id },
            include: { Purchase_items: true },
        });
    }

    async update(id: number, data: Partial<CreatePurchaseInput>): Promise<Purchase> {
        return this.prisma.purchase.update({
            where: { purchase_id: id },
            data,
        });
    }
}
