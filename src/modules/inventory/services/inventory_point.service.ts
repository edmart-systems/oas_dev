import { Inventory_pointRepository } from "../repositories/inventory_point.repository";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";
import { inventory_point } from "@prisma/client";



export class Inventory_pointService{
    constructor(private Inventory_pointRepo: Inventory_pointRepository){}

    async createInventory_point(data: Inventory_pointDtoInput): Promise<inventory_point> {
        const existingInventory_point = await this.Inventory_pointRepo.findByName(data.inventory_point);
        if(existingInventory_point){
            throw new Error(`Inventory_point '${data.inventory_point}' already exists.`);
        }
        return this.Inventory_pointRepo.create(data)

    }
    async getAllInventory_points(): Promise<inventory_point[]> { 
        return this.Inventory_pointRepo.getAll();  

  }
     async getInventory_pointsById(id: number): Promise<inventory_point> {
        const inventory_point = await this.Inventory_pointRepo.getById(id);
        if (!inventory_point) {
            throw new Error(`Inventory_point with id '${id}' not found.`);
        }
        return inventory_point;
    }

    async updateInventory_point(id: number, data: { inventory_point: string }): Promise<inventory_point> {
        const existing = await this.Inventory_pointRepo.findByName(data.inventory_point);

        if (existing && existing.inventory_point_id !== id) {
            throw new Error(`Inventory_point '${data.inventory_point}' already exists.`);
        }

        return this.Inventory_pointRepo.updateInventory_point(id, data);
    }   
    
}