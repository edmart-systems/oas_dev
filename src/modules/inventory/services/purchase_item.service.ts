import { PurchaseItemRepository } from "../repositories/purchase_item.repository";
import { PurchaseItemDtoInput } from "../dtos/purchase_item.dto";
import { Purchase_item } from "@prisma/client";

export class PurchaseItemService {
    constructor(private purchaseItemRepo: PurchaseItemRepository) {}

    async createPurchaseItem(data: PurchaseItemDtoInput): Promise<Purchase_item> {
        return this.purchaseItemRepo.create(data);
    }

    async getAllPurchaseItems(): Promise<Purchase_item[]> {
        return this.purchaseItemRepo.getAll();
    }

    async getPurchaseItemById(id: number): Promise<Purchase_item> {
        const purchaseItem = await this.purchaseItemRepo.getById(id);
        if (!purchaseItem) {
            throw new Error(`Purchase item with ID '${id}' not found.`);
        }
        return purchaseItem;
    }

    async updatePurchaseItem(id: number, data: Partial<PurchaseItemDtoInput>): Promise<Purchase_item> {
        return this.purchaseItemRepo.update(id, data);
    }
}