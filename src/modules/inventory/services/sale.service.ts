import { PrismaClient } from "@prisma/client";
import { CreateSaleInput } from "../dtos/sale.dto";
import { SaleRepository } from "../repositories/sale.repository";
import { SaleItemRepository } from "../repositories/sale_item.repository";
import { sale } from "@prisma/client";
import { calculateProductStatus } from "../methods/purchase.method";  

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

    const sale_total_amount = calculatedItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const sale_total_discount = calculatedItems.reduce((sum, i) => sum + i.discount, 0);
    const sale_total_tax = calculatedItems.reduce((sum, i) => sum + i.tax, 0);
    const sale_net_amount = sale_total_amount - sale_total_discount;
    const sale_grand_total = sale_net_amount + sale_total_tax;

    return this.prisma.$transaction(async (tx) => {
      const saleRepo = new SaleRepository(tx);
      

      const sale = await saleRepo.create({
          ...saleData,
          sale_total_amount: sale_total_amount,
          sale_total_discount: sale_total_discount,
          sale_total_tax:   sale_total_tax,
          sale_net_amount: sale_net_amount,
          sale_grand_total: sale_grand_total,
          sale_items: calculatedItems,
      });

      for (const item of calculatedItems) {
        const product = await tx.product.findUnique({
          where: { product_id: item.product_id },
          select: { product_quantity: true, product_name: true },
        });
        const currentQty = product?.product_quantity ?? 0;
        
        if (currentQty < item.quantity) {
          throw new Error(`Insufficient stock for product ${product?.product_name || item.product_id}. Available: ${currentQty}, Required: ${item.quantity}`);
        }
        
        const resulting_stock = currentQty - item.quantity;

        await tx.stock.create({
          data: {
            product_id: item.product_id,
            inventory_point_id: sale.inventory_point_id,
            change_type: "SALE",
            quantity_change: -item.quantity,
            resulting_stock,
            reference_id: sale.sale_id,
          },
        });

        const updatedProduct = await tx.product.findUnique({
          where: { product_id: item.product_id },
          select: { 
            product_quantity: true, 
            product_min_quantity: true, 
            product_max_quantity: true
          },
        });
        
        const newQuantity = (updatedProduct?.product_quantity ?? 0) - item.quantity;
        const newStatus = calculateProductStatus(
          newQuantity,
          updatedProduct?.product_min_quantity ?? null,
          updatedProduct?.product_max_quantity ?? null
        );
        
        await tx.product.update({
          where: { product_id: item.product_id },
          data: {
            product_quantity: newQuantity,
            product_status: newStatus
          },
        });
      }

      return sale;
    });
  }

  async getAllSales(): Promise<sale[]> {
    return this.saleRepo.getAll();
  }

  async getSaleById(id: number): Promise<sale> {
    const sale = await this.saleRepo.getById(id);
    if (!sale) {
        throw new Error(`Sale with ID ${id} not found`);
    }
    return sale;
  }
}
