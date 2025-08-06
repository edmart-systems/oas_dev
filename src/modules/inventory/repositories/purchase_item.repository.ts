import { CreatePurchaseItemInput, PurchaseItemDtoInput } from "../dtos/purchase_item.dto";
import { Purchase_item } from "@prisma/client";

export class PurchaseItemRepository {
    constructor(private prisma: any) {} // Accepts both PrismaClient and transaction client

    async create(data: CreatePurchaseItemInput): Promise<Purchase_item> {
        const totalCost = data.total_cost ?? data.quantity * data.unit_cost;

        const purchaseItem = await this.prisma.purchase_item.create({
            data: { ...data, total_cost: totalCost },
        });

        await this.prisma.product.update({
            where: { product_id: data.product_id },
            data: { product_quantity: { increment: data.quantity } },
        });

        return purchaseItem;
    }

    async getAll(): Promise<Purchase_item[]> {
        return this.prisma.purchase_item.findMany({});
    }

    async getById(id: number): Promise<Purchase_item | null> {
        return this.prisma.purchase_item.findUnique({
            where: { purchase_item_id: id },
        });
    }

    async update(id: number, data: Partial<PurchaseItemDtoInput>): Promise<Purchase_item> {
        return this.prisma.purchase_item.update({
            where: { purchase_item_id: id },
            data,
        });
    }
}

