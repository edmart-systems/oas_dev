import { CreatePurchaseItemInput, PurchaseItemDtoInput } from "../dtos/purchase_item.dto";
import { purchase_item } from "@prisma/client";

export class PurchaseItemRepository {
    constructor(private prisma: any) {} // Accepts both PrismaClient and transaction client

    async create(data: CreatePurchaseItemInput): Promise<purchase_item> {
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

    async getAll(): Promise<purchase_item[]> {
        return this.prisma.purchase_item.findMany({});
    }

    async getById(id: number): Promise<purchase_item | null> {
        return this.prisma.purchase_item.findUnique({
            where: { purchase_item_id: id },
        });
    }

    async update(id: number, data: Partial<PurchaseItemDtoInput>): Promise<purchase_item> {
        return this.prisma.purchase_item.update({
            where: { purchase_item_id: id },
            data,
        });
    }
}

