import { ProductRepository } from "../repositories/product.repository";
import { CreateProductInput } from "../dtos/product.dto";
import { Product } from "@prisma/client";
import { calculateProductStatus, calculateMarkupPercentage } from "../methods/purchase.method";

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

    const productData = {
      ...data,
      product_status: calculateProductStatus(0, data.product_min_quantity || null, data.product_max_quantity || null),
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
  
  if (data.product_quantity !== undefined || data.product_min_quantity !== undefined || data.product_max_quantity !== undefined) {
    const quantity = data.product_quantity ?? existing.product_quantity;
    const minQty = data.product_min_quantity ?? existing.product_min_quantity;
    const maxQty = data.product_max_quantity ?? existing.product_max_quantity;
    updateData.product_status = calculateProductStatus(quantity, minQty, maxQty);
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
      existing.product_min_quantity, 
      existing.product_max_quantity
    );
    
    return this.productRepo.update(id, {
      product_quantity: newQuantity,
      product_status: newStatus
    });
  }
}
