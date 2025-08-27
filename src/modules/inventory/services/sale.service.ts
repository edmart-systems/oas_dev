import { PrismaClient } from "@prisma/client";
import { CreateSaleInput } from "../dtos/sale.dto";
import { SaleRepository } from "../repositories/sale.repository";
import { SaleItemRepository } from "../repositories/sale_item.repository";
import { Sale } from "@prisma/client";
import { StockRepository } from "../repositories/stock.repository";
import { StockService } from "./stock.service";
import { calculateSaleTotals } from "../methods/purchase.method";

export class SaleService {
  constructor(
    private prisma: PrismaClient,
    private saleRepo: SaleRepository,
    private saleItemRepo: SaleItemRepository
  ) {}

  async createSale(data: CreateSaleInput) {
    const { sale_items, ...saleData } = data;

    const calculatedItems = sale_items.map((item) => {
      const total_price = item.unit_price * item.quantity - item.discount + item.tax;
      return {
        ...item,
        discount: item.discount ?? 0,
        tax: item.tax ?? 0,
        total_price,
      };
    });

    const {
      sale_total_amount,
      sale_total_discount,
      sale_total_tax,
      sale_net_amount,
      sale_grand_total,
    } = calculateSaleTotals(calculatedItems);
    const sale_total_quantity = calculatedItems.reduce((sum, i) => sum + i.quantity, 0);

    return this.prisma.$transaction(async (tx) => {
      const saleRepo = new SaleRepository(tx);
      const stockService = new StockService(tx, new StockRepository(tx));

      // Resolve seller: prefer seller_co_user_id if provided; else validate seller_id
      let resolvedSellerId: number | undefined = undefined;
      if ((saleData as any).seller_co_user_id) {
        const byCo = await tx.user.findUnique({ where: { co_user_id: (saleData as any).seller_co_user_id } });
        if (!byCo) {
          throw new Error("Invalid seller_co_user_id: user not found");
        }
        resolvedSellerId = byCo.userId;
      } else if (typeof saleData.seller_id === 'number') {
        const exists = await tx.user.findUnique({ where: { userId: saleData.seller_id } });
        if (!exists) {
          throw new Error("Invalid seller_id: user not found");
        }
        resolvedSellerId = saleData.seller_id;
      } else {
        throw new Error("Provide either seller_id or seller_co_user_id");
      }

      // Pre-validate stock availability at the target inventory point for all items
      // Aggregate required quantities per product
      const requiredByProduct = new Map<number, number>();
      for (const item of calculatedItems) {
        requiredByProduct.set(
          item.product_id,
          (requiredByProduct.get(item.product_id) ?? 0) + item.quantity
        );
      }
      const productIds = Array.from(requiredByProduct.keys());
      if (productIds.length > 0) {
        const stocks = await tx.inventory_stock.findMany({
          where: {
            product_id: { in: productIds },
            inventory_point_id: saleData.inventory_point_id,
          },
          select: { product_id: true, quantity: true },
        });
        const availableByProduct = new Map<number, number>();
        for (const s of stocks) availableByProduct.set(s.product_id, s.quantity);
        const insufficient: Array<{ product_id: number; required: number; available: number }> = [];
        for (const pid of productIds) {
          const required = requiredByProduct.get(pid)!;
          const available = availableByProduct.get(pid) ?? 0;
          if (available < required) {
            insufficient.push({ product_id: pid, required, available });
          }
        }
        if (insufficient.length > 0) {
          // Fetch product names for friendlier messaging
          const prods = await tx.product.findMany({
            where: { product_id: { in: insufficient.map(i => i.product_id) } },
            select: { product_id: true, product_name: true },
          });
          const nameById = new Map<number, string>();
          for (const p of prods) nameById.set(p.product_id, p.product_name);
          const details = insufficient.map(i => ({
            product_id: i.product_id,
            product_name: nameById.get(i.product_id) ?? `#${i.product_id}`,
            required: i.required,
            available: i.available,
          }));
          const err = new Error("Insufficient stock");
          (err as any).code = "INSUFFICIENT_STOCK";
          (err as any).inventory_point_id = saleData.inventory_point_id;
          ;(err as any).details = details;
          throw err;
        }
      }

      const sale = await saleRepo.create({
        // Exclude seller_co_user_id if present and inject resolved seller_id
        sale_no: saleData.sale_no,
        seller_id: resolvedSellerId,
        currency_id: saleData.currency_id,
        inventory_point_id: saleData.inventory_point_id,
        sale_total_quantity: sale_total_quantity,
        sale_total_amount: sale_total_amount,
        sale_total_discount: sale_total_discount,
        sale_total_tax: sale_total_tax,
        sale_net_amount: sale_net_amount,
        sale_grand_total: sale_grand_total,
        sale_items: calculatedItems,
      });

      // Apply stock movements per inventory point with validation and inventory_stock upsert
      for (const item of calculatedItems) {
        await stockService.createAndApplyStock({
          product_id: item.product_id,
          inventory_point_id: sale.inventory_point_id,
          change_type: "SALE",
          quantity_change: -item.quantity,
          reference_id: sale.sale_id,
        });
      }

      return sale;
    });
  }

  async getAllSales(): Promise<Sale[]> {
    return this.saleRepo.getAll();
  }

  async getSaleById(id: number): Promise<Sale> {
    const sale = await this.saleRepo.getById(id);
    if (!sale) {
        throw new Error(`Sale with ID ${id} not found`);
    }
    return sale;
  }
}
