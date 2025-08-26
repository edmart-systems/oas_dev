import { PrismaClient, Unit } from "@prisma/client";
import { UnitDtoInput } from "../dtos/unit.dto";
import { validateUnit } from "../methods/unit.methods";

export class UnitRepository {
  constructor(private prisma: PrismaClient) {}

  async findByName(name: string) {
    return this.prisma.unit.findFirst({ where: { name } });
  }

  async create(data: UnitDtoInput): Promise<Unit> {
    const validation = validateUnit({
      name: data.name,
      short_name: data.short_name,
      unit_desc: data.unit_desc || "",
    });
    if (!validation.valid) {
      throw new Error(validation.errors?.join(", ") || "Invalid Unit Input");
    }
    return this.prisma.unit.create({ data });
  }

  async getAll(): Promise<Unit[]> {
    return this.prisma.unit.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  async getById(id: number): Promise<Unit | null> {
    return this.prisma.unit.findUnique({ where: { unit_id: id } });
  }

  async updateUnit(id: number, data: Partial<UnitDtoInput>): Promise<Unit> {
    const validation = validateUnit({
      name: data.name || "",
      short_name: data.short_name || "",
      unit_desc: data.unit_desc || "",
    });
    if (!validation.valid) {
      throw new Error(validation.errors?.join(", ") || "Invalid Unit Input");
    }
    return this.prisma.unit.update({ where: { unit_id: id }, data });
  }
}
