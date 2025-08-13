import { PrismaClient } from "@prisma/client";
import { CreateProductInput } from "../dtos/product.dto";
import { product } from "@prisma/client";

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findByName(product_name: string): Promise<product | null> {
    return this.prisma.product.findUnique({
      where: { product_name },
    });
  }

  async findByBarcode(product_barcode: number): Promise<product | null> {
    return this.prisma.product.findUnique({
      where: { product_barcode },
    });
  }

  async create(data: CreateProductInput): Promise<product> {
    const existing = await this.findByBarcode(data.product_barcode);
    if (existing) {
      throw new Error("Product with this barcode already exists.");
    }

    return this.prisma.product.create({ data });
  }

  async getAll(): Promise<product[]> {
    return this.prisma.product.findMany({
      orderBy: { product_created_at: "desc" },
    });
  }

  async getById(id: number): Promise<product | null> {
    return this.prisma.product.findUnique({
      where: { product_id: id },
    });
  }
  async update(id: number, data: Partial<product>): Promise<product> {
    if (data.product_barcode) {
    const existing = await this.findByBarcode(data.product_barcode);

    if (existing && existing.product_id !== id) {
      throw new Error("Product with this barcode already exists.");
    }

    
  }
  if(data.product_name) {
    const existing = await this.findByName(data.product_name);

    if (existing && existing.product_id !== id) {
      throw new Error("Product with this name already exists.");
    }

  }

    return this.prisma.product.update({
      where: { product_id: id },
      data,
    });
  }

  async delete(id: number): Promise<product> {
    return this.prisma.product.delete({
      where: { product_id: id },
    });
  }
}
