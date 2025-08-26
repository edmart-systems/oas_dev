import { PurchaseRepository } from "../repositories/purchase.repository";
import { CreatePurchaseInput } from "../dtos/purchase.dto";
import { PurchaseItemRepository } from "../repositories/purchase_item.repository";
import { Purchase } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { calculateMarkupPercentage, calculatePurchaseTotals } from "../methods/purchase.method";
import { StockRepository } from "../repositories/stock.repository";
import { StockService } from "./stock.service";


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
            const stockRepo = new StockRepository(tx as unknown as PrismaClient);
            const stockServiceTx = new StockService(tx as unknown as PrismaClient, stockRepo);
            const purchase = await purchaseRepo.create({
                ...purchaseData,
                purchase_total_cost: totalCost,
                purchase_unit_cost: totalUnitCost,
                purchase_quantity: totalQuantity,
                purchase_items: calculatedItems,
            });
            for (const item of calculatedItems) {
              // Apply stock via StockService so inventory_stock is upserted per inventory point
              await stockServiceTx.createAndApplyStock({
                product_id: item.product_id,
                inventory_point_id: purchase.inventory_point_id,
                change_type: "PURCHASE",
                quantity_change: item.quantity,
                reference_id: purchase.purchase_id,
              } as any);

              // Keep existing pricing logic: update buying_price and markup_percentage
              const prodPricing = await tx.product.findUnique({
                where: { product_id: item.product_id },
                select: { selling_price: true },
              });
              const newMarkup = calculateMarkupPercentage(
                item.unit_cost,
                prodPricing?.selling_price ?? 0
              );
              await tx.product.update({
                where: { product_id: item.product_id },
                data: {
                  buying_price: item.unit_cost,
                  markup_percentage: newMarkup,
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