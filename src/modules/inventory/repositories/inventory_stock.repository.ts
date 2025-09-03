import { PrismaClient } from "@prisma/client";
import { InventoryStockDto } from "../dtos/inventory_stock.dto";

export class InventoryStockRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<InventoryStockDto[]> {
    const inventoryStocks = await this.prisma.location.findMany({
      include: {
        location_stock: {
          include: {
            product: {
              select: {
                product_id: true,
                product_name: true,
                product_barcode: true,
                category: { select: { category: true } },
                tag: { select: { tag: true } },
                supplier: { select: { supplier_name: true } },
                unit: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return inventoryStocks.map((inv) => ({
      location_id: inv.location_id,
      location_name: inv.location_name,
      stock: inv.location_stock.map((s) => ({
        product_id: s.product_id,
        product_name: s.product.product_name,
        barcode: s.product.product_barcode,
        supplier: s.product.supplier?.supplier_name,
        category: s.product.category.category,
        tag: s.product.tag.tag,
        unit: s.product.unit.name,
        quantity: s.quantity,
      })),
    }));
  }
}
