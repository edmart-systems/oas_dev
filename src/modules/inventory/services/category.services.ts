import { CategoryRepository } from "../repositories/category.repository";
import { CategoryDtoInput } from "../dtos/category.dto";
import { Category } from "@prisma/client";



export class CategoryService{
    constructor(private CategoryRepo: CategoryRepository){}
    async createCategory(data: CategoryDtoInput): Promise<Category> {
        const existingCategory = await this.CategoryRepo.findByName(data.category);
        if(existingCategory){
            throw new Error(`Category '${data.category}' already exists.`);
        }
        return this.CategoryRepo.create(data)

    }
    async getAllCategorys(): Promise<Category[]> { 
        return this.CategoryRepo.getAll();  

  }
     async getCategorysById(id: number): Promise<Category> {
        const category = await this.CategoryRepo.getById(id);
        if (!category) {
            throw new Error(`Category with id '${id}' not found.`);
        }
        return category;
    }

    async updateCategory(id: number, data: { category: string }): Promise<Category> {
        const existing = await this.CategoryRepo.findByName(data.category);

        if (existing && existing.category_id !== id) {
            throw new Error(`Category '${data.category}' already exists.`);
        }

        return this.CategoryRepo.updateCategory(id, data);
    }   
    
}