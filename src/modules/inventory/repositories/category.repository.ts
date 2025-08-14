import { PrismaClient } from "@prisma/client";
import { category } from "@prisma/client";
import { CategoryDtoInput } from "../dtos/category.dto";


export class CategoryRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(category: string){
        return this.prisma.category.findUnique({
            where:{category},
        })
    }

    async create(data: CategoryDtoInput):Promise<category>{
        return this.prisma.category.create({data});
    }

    
    async getAll():Promise<category[]>{
        return this.prisma.category.findMany({});
    }
    async getById(id: number): Promise<category | null> {
        return this.prisma.category.findUnique({
            where: { category_id: id },
        });
    }

    async updateCategory(id: number, data: { category: string }): Promise<category> {
        return this.prisma.category.update({
            where: { category_id: id },
            data,
    });
    }
};