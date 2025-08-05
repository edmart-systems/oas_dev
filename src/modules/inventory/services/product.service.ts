import { ProductRepository } from "../repositories/product.repository";
import { CreateProductInput } from "../dtos/product.dto";
import { Product } from "@prisma/client";

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async createProduct(data: CreateProductInput): Promise<Product> {
    const existingBarcode = await this.productRepo.findByBarcode(data.product_barcode);
    if (existingBarcode) {
      throw new Error("Product with this barcode already exists.");
    }

    const existingName = await this.productRepo.findByName(data.product_name);
    if (existingName) {
      throw new Error("Product with this name already exists.");
    }

    return this.productRepo.create(data);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepo.getAll();
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepo.getById(id);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const existing = await this.productRepo.getById(id);
  if (!existing) throw new Error("Product not found");

  if (data.product_barcode) {
    const existingBarcode = await this.productRepo.findByBarcode(data.product_barcode);

    if (existingBarcode && existingBarcode.product_id !== id) {
      throw new Error("A product with this barcode already exists.");
    }
  }

   if (data.product_name) {
    const existingName = await this.productRepo.findByName(data.product_name);

    if (existingName && existingName.product_id !== id) {
      throw new Error("A product with this name already exists.");
    }
  }

  return this.productRepo.update(id, data);
}

  async deleteProduct(id: number): Promise<Product> {
    const existing = await this.productRepo.getById(id);
    if (!existing) throw new Error("Product not found");
    return this.productRepo.delete(id);
  }
}
