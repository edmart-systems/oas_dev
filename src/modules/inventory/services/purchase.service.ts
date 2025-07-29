import { PurchaseRepository } from "../repositories/purchase.repository";
import { CreatePurchaseInput } from "../dtos/purchase.dto";
import { Purchase } from "@prisma/client";


export class PurchaseService {
    constructor(private purchaseRepo: PurchaseRepository) {}

    async createPurchase(data: CreatePurchaseInput): Promise<Purchase> {
        return this.purchaseRepo.create(data);
    }

    async getAllPurchases(): Promise<Purchase[]> {
        return this.purchaseRepo.getAll();
    }

    async getPurchaseById(id: number): Promise<Purchase> {
        const purchase = await this.purchaseRepo.getById(id);
        if (!purchase) {
            throw new Error(`Purchase with ID '${id}' not found.`);
        }
        return purchase;
    }

    async updatePurchase(id: number, data: Partial<CreatePurchaseInput>): Promise<Purchase> {
        return this.purchaseRepo.update(id, data);
    }
}                                           