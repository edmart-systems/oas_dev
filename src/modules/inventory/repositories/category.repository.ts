import { PrismaClient } from "@prisma/client";
import { Category } from "@prisma/client";
import { CategoryDtoInput } from "../dtos/category.dto";
import { validateCategory } from "../methods/category.methods";


export class CategoryRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(category: string){
        return this.prisma.category.findUnique({
            where:{category},
        })
    }

    async create(data: CategoryDtoInput):Promise<Category>{
        const validation = validateCategory({category: data.category});

        if(!validation.valid){
            throw new Error(validation.errors?.join(", ") || "Invalid Category Input");
        }

        return this.prisma.category.create({data});
    }

    
    async getAll():Promise<Category[]>{
        return this.prisma.category.findMany({
            orderBy:{
                created_at: "desc"
            },
            include: {
                creator: {
                    select: {
                        co_user_id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                Product: {
                    take: 5,
                    select: {
                        product_name: true
                    }
                }
            }
        });
    }
    async getById(id: number): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { category_id: id },
        });
    }

    async updateCategory(id: number, data: { category: string }): Promise<Category> {
        
        const validation = validateCategory({category: data.category});

        if(!validation.valid){
            throw new Error(validation.errors?.join(", ") || "Invalid Category Input");
        }

        return this.prisma.category.update({
            where: { category_id: id },
            data,
    });
    }
};