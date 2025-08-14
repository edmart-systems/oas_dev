import { PurchaseRepository } from "../repositories/purchase.repository";
import { CreatePurchaseInput } from "../dtos/purchase.dto";
import { PurchaseItemRepository } from "../repositories/purchase_item.repository";
import { purchase } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { calculateProductStatus, calculateMarkupPercentage, calculatePurchaseTotals } from "../methods/purchase.method";


export class PurchaseService {
    constructor(
        private prisma: PrismaClient,
        private purchaseRepo: PurchaseRepository,
        private purchaseItemRepo: PurchaseItemRepository,
    ) {}


    async createPurchase(data: CreatePurchaseInput) {
        const { purchase_items, ...purchaseData } = data;

        const calculatedItems = purchase_items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost ?? item.unit_cost * item.quantity,
        }));

        const { totalCost, totalQuantity, totalUnitCost } = calculatePurchaseTotals(calculatedItems);

        return this.prisma.$transaction(async (tx) => {
            const purchaseRepo = new PurchaseRepository(tx);
            const purchase = await purchaseRepo.create({
                ...purchaseData,
                purchase_total_cost: totalCost,
                purchase_unit_cost: totalUnitCost,
                purchase_quantity: totalQuantity,
                purchase_items: calculatedItems,
            });
            for (const item of calculatedItems) {

            const product = await tx.product.findUnique({
            where: { product_id: item.product_id },
            select: { product_quantity: true },
            });
            
            const currentQty = product?.product_quantity ?? 0;
            const resulting_stock = currentQty + item.quantity;

            await tx.stock.create({
                data: {
                    product_id: item.product_id,
                    inventory_point_id: purchase.inventory_point_id,
                    change_type: "PURCHASE",
                    quantity_change: item.quantity,
                    resulting_stock, 
                    reference_id: purchase.purchase_id, 
                },
            });
            
            const updatedProduct = await tx.product.findUnique({
                where: { product_id: item.product_id },
                select: { 
                    product_quantity: true, 
                    product_min_quantity: true, 
                    product_max_quantity: true,
                    selling_price: true 
                },
            });
            
            const newQuantity = (updatedProduct?.product_quantity ?? 0) + item.quantity;
            const newStatus = calculateProductStatus(
                newQuantity,
                updatedProduct?.product_min_quantity ?? null,
                updatedProduct?.product_max_quantity ?? null
            );
            const newMarkup = calculateMarkupPercentage(
                item.unit_cost,
                updatedProduct?.selling_price ?? 0
            );
            
            await tx.product.update({
                where: { product_id: item.product_id },
                data: { 
                    product_quantity: newQuantity,
                    buying_price: item.unit_cost,
                    product_status: newStatus,
                    markup_percentage: newMarkup
                },
            });
        }
            return purchase;
        });
    }

    async getAllPurchases(): Promise<purchase[]> {
        return this.purchaseRepo.getAll();
    }

    async getPurchaseById(id: number): Promise<purchase> {
        const purchase = await this.purchaseRepo.getById(id);
        if (!purchase) {
            throw new Error(`Purchase with ID '${id}' not found.`);
        }
        return purchase;
    }

    async updatePurchase(id: number, data: Partial<CreatePurchaseInput>): Promise<purchase> {
        return this.purchaseRepo.update(id, data);
    }
}