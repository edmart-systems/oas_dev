import { ProductRepository } from "../repositories/product.repository";
import { CreateProductInput } from "../dtos/product.dto";
import { Product } from "@prisma/client";
import { calculateProductStatus, calculateMarkupPercentage } from "../methods/purchase.method";
import prisma from "../../../../db/db";

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  private async generateSKU(categoryId: number): Promise<string> {
    const category = await prisma.category.findUnique({
      where: { category_id: categoryId }
    });
    
    const categoryCode = category?.category.substring(0, 3).toUpperCase() || 'GEN';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${categoryCode}-${timestamp}-${randomNum}`;
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    const existingBarcode = await this.productRepo.findByBarcode(data.product_barcode);
    if (existingBarcode) {
      throw new Error("Product with this barcode already exists.");
    }

    const existingName = await this.productRepo.findByName(data.product_name);
    if (existingName) {
      throw new Error("Product with this name already exists.");
    }

    const sku_code = await this.generateSKU(data.category_id);
    
    const productData = {
      ...data,
      sku_code,
      product_status: calculateProductStatus(0, data.reorder_level || null, null),
      markup_percentage: calculateMarkupPercentage(data.buying_price, data.selling_price)
    };

    return this.productRepo.create(productData);
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

  const updateData = { ...data };
  
  if (data.reorder_level !== undefined) {
    const quantity = existing.stock_quantity;
    const minQty = data.reorder_level ?? existing.reorder_level;
    updateData.product_status = calculateProductStatus(quantity, minQty, null);
  }
  
  if (data.buying_price !== undefined || data.selling_price !== undefined) {
    const buyingPrice = data.buying_price ?? existing.buying_price;
    const sellingPrice = data.selling_price ?? existing.selling_price;
    updateData.markup_percentage = calculateMarkupPercentage(buyingPrice, sellingPrice);
  }

  return this.productRepo.update(id, updateData);
}

  async deleteProduct(id: number): Promise<Product> {
    const existing = await this.productRepo.getById(id);
    if (!existing) throw new Error("Product not found");
    return this.productRepo.delete(id);
  }

  async updateProductQuantityAndStatus(id: number, newQuantity: number): Promise<Product> {
    const existing = await this.productRepo.getById(id);
    if (!existing) throw new Error("Product not found");
    
    const newStatus = calculateProductStatus(
      newQuantity, 
      existing.reorder_level, 
      null
    );
    
    return this.productRepo.update(id, {
      stock_quantity: newQuantity,
      product_status: newStatus
    });
  }
}
