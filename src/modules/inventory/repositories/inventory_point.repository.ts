import { PrismaClient } from "@prisma/client";
import { Inventory_point } from "@prisma/client";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";


export class Inventory_pointRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(inventory_point: string){
        return this.prisma.inventory_point.findUnique({
            where:{inventory_point},
        })
    }

    async create(data: Inventory_pointDtoInput):Promise<Inventory_point>{
        return this.prisma.inventory_point.create({data});
    }

    
    async getAll():Promise<Inventory_point[]>{
        return this.prisma.inventory_point.findMany({});
    }
    async getById(id: number): Promise<Inventory_point | null> {
        return this.prisma.inventory_point.findUnique({
            where: { inventory_point_id: id },
        });
    }

    async updateInventory_point(id: number, data: { inventory_point: string }): Promise<Inventory_point> {
        return this.prisma.inventory_point.update({
            where: { inventory_point_id: id },
            data,
    });
    }
};