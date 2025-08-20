import { PrismaClient } from "@prisma/client";
import { Inventory_point } from "@prisma/client";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";
import { validateInventoryPoint } from "../methods/inventoryPoint.methods";

export class Inventory_pointRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(inventory_point: string){
        return this.prisma.inventory_point.findUnique({
            where:{inventory_point},
        })
    }

    async create(data: Inventory_pointDtoInput):Promise<Inventory_point>{
        const validation = validateInventoryPoint({inventory_point: data.inventory_point});
        if(!validation.valid){
            throw new Error(validation.errors?.join(", ") || "Invalid Inventory Point Input");  
        }

        return this.prisma.inventory_point.create({data});
    }

    
    async getAll():Promise<Inventory_point[]>{
        return this.prisma.inventory_point.findMany({
            orderBy: {
                inventory_point: 'asc'
            },
              include: {
                creator: {
                    select: {
                        co_user_id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }
    async getById(id: number): Promise<Inventory_point | null> {
        return this.prisma.inventory_point.findUnique({
            where: { inventory_point_id: id },
        });
    }

    async updateInventory_point(id: number, data: { inventory_point: string }): Promise<Inventory_point> {
        const validation = validateInventoryPoint({inventory_point: data.inventory_point});
        if(!validation.valid){
            throw new Error(validation.errors?.join(", ") || "Invalid Inventory Point Input");  
        }
        return this.prisma.inventory_point.update({
            where: { inventory_point_id: id },
            data,
    });
    }
};