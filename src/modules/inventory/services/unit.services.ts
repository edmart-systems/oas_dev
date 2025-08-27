import { Unit } from "@prisma/client";
import { UnitDtoInput } from "../dtos/unit.dto";
import { UnitRepository } from "../repositories/unit.repository";

export class UnitService {
  constructor(private unitRepo: UnitRepository) {}

  async createUnit(data: UnitDtoInput): Promise<Unit> {
    const existing = await this.unitRepo.findByName(data.name);
    if (existing) {
      throw new Error(`Unit '${data.name}' already exists.`);
    }
    return this.unitRepo.create(data);
  }

  async getAllUnits(): Promise<Unit[]> {
    return this.unitRepo.getAll();
  }

  async getUnitById(id: number): Promise<Unit> {
    const unit = await this.unitRepo.getById(id);
    if (!unit) throw new Error(`Unit with id '${id}' not found.`);
    return unit;
  }

  async updateUnit(id: number, data: UnitDtoInput): Promise<Unit> {
    const existing = await this.unitRepo.findByName(data.name);
    if (existing && existing.unit_id !== id) {
      throw new Error(`Unit '${data.name}' already exists.`);
    }
    return this.unitRepo.updateUnit(id, data);
  }
}
