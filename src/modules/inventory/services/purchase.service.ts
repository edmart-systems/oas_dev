import { PurchaseRepository } from "../repositories/purchase.repository";
import { CreatePurchaseInput } from "../dtos/purchase.dto";
import { PurchaseItemRepository } from "../repositories/purchase_item.repository";
import { Purchase } from "@prisma/client";
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
            select: { stock_quantity: true },
            });
            
            const currentQty = product?.stock_quantity ?? 0;
            const resulting_stock = currentQty + item.quantity;

            await tx.stock.create({
                data: {
                    product_id: item.product_id,
                    location_id: purchase.location_id,
                    change_type: "PURCHASE",
                    quantity_change: item.quantity,
                    resulting_stock, 
                    reference_id: purchase.purchase_id, 
                },
            });
            
            const updatedProduct = await tx.product.findUnique({
                where: { product_id: item.product_id },
                select: { 
                    stock_quantity: true, 
                    reorder_level: true,
                    selling_price: true 
                },
            });
            
            const newQuantity = (updatedProduct?.stock_quantity ?? 0) + item.quantity;
            const newStatus = calculateProductStatus(
                newQuantity,
                updatedProduct?.reorder_level ?? null,
                null
            );
            const newMarkup = calculateMarkupPercentage(
                item.unit_cost,
                updatedProduct?.selling_price ?? 0
            );
            
            await tx.product.update({
                where: { product_id: item.product_id },
                data: { 
                    stock_quantity: newQuantity,
                    buying_price: item.unit_cost,
                    product_status: newStatus,
                    markup_percentage: newMarkup
                },
            });
        }
            return purchase;
        });
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