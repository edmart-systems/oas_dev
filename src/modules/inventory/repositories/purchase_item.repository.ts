import { PrismaClient } from "@prisma/client";
import { PurchaseItemDtoInput } from "../dtos/purchase_item.dto";
import { Purchase_item } from "@prisma/client";


export class PurchaseItemRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: PurchaseItemDtoInput): Promise<Purchase_item> {
        return this.prisma.purchase_item.create({
            data: {
                ...data,
                total_cost: data.total_cost ?? 0, // Ensure it's always a number
            },
        });
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

