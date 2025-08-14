import { PrismaClient, sale } from "@prisma/client";
import { CreateSaleInput } from "../dtos/sale.dto";

export class SaleRepository {
  constructor(private prisma: PrismaClient | any) {}

  async create(data: CreateSaleInput): Promise<sale> {
    const { sale_items, ...saleData } = data;

    const saleItems = sale_items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount ?? 0,
      tax: item.tax ?? 0,
      total_price:
        item.total_price ?? (item.unit_price * item.quantity) - item.discount + item.tax,
    }));

    return this.prisma.sale.create({
      data: {
        sale_no: saleData.sale_no,
        seller_id: saleData.seller_id,
        currency_id: saleData.currency_id,
        inventory_point_id: saleData.inventory_point_id,
        sale_total_amount: saleData.sale_total_amount!,
        sale_total_discount: saleData.sale_total_discount ?? 0,
        sale_total_tax: saleData.sale_total_tax ?? 0,
        sale_grand_total: saleData.sale_grand_total ?? 0,
        sale_updated_at: new Date(),
        Sale_items: {
          create: saleItems,
        },
      },
      include: {
        Sale_items: true,
      },
    });
  }

  async getAll(): Promise<sale[]> {
    return this.prisma.sale.findMany({
      include: { Sale_items: true },
    });
  }

  async getById(id: number): Promise<sale | null> {
    return this.prisma.sale.findUnique({
      where: { sale_id: id },
      include: { Sale_items: true },
    });
  }
}
