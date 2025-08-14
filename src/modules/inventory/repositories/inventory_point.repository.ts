import { PrismaClient } from "@prisma/client";
import { inventory_point } from "@prisma/client";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";


export class Inventory_pointRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(inventory_point: string){
        return this.prisma.inventory_point.findUnique({
            where:{inventory_point},
        })
    }

    async create(data: Inventory_pointDtoInput):Promise<inventory_point>{
        return this.prisma.inventory_point.create({
            data: {
                ...data,
                updated_at: new Date()
            }
        });
    }

    
    async getAll():Promise<inventory_point[]>{
        return this.prisma.inventory_point.findMany({});
    }
    async getById(id: number): Promise<inventory_point | null> {
        return this.prisma.inventory_point.findUnique({
            where: { inventory_point_id: id },
        });
    }

    async updateInventory_point(id: number, data: { inventory_point: string }): Promise<inventory_point> {
        return this.prisma.inventory_point.update({
            where: { inventory_point_id: id },
            data,
    });
    }
};