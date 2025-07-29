import { PrismaClient } from "@prisma/client";
import { CreatePurchaseInput } from "../dtos/purchase.dto";
import {Purchase} from "@prisma/client";

export class PurchaseRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: CreatePurchaseInput): Promise<Purchase> {
        return this.prisma.purchase.create({
            data: {
                ...data,
                purchase_total_cost: data.purchase_total_cost ?? 0, // Ensure it's always a number
            },
        });
    }

    async getAll(): Promise<Purchase[]> {
        return this.prisma.purchase.findMany({});
    }

    async getById(id: number): Promise<Purchase | null> {
        return this.prisma.purchase.findUnique({
            where: { purchase_id: id },
        });
    }

    async update(id: number, data: Partial<CreatePurchaseInput>): Promise<Purchase> {
        return this.prisma.purchase.update({
            where: { purchase_id: id },
            data,
        });
    }
}
