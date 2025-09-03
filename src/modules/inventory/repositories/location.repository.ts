import { PrismaClient } from '@prisma/client';
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';

const prisma = new PrismaClient();

export class LocationRepository {
  async findAll() {
  return await prisma.location.findMany({
    where: { is_active: true },
    include: { parent: true, children: true },
    orderBy: { location_name: 'asc' }
  });
}


  async findById(location_id: number) {
    return await prisma.location.findUnique({
      where: { location_id },
      include: {
        parent: true,
        children: true,
      }
    });
  }

  async create(data: CreateLocationDto) {
    return await prisma.location.create({
      data,
      include: {
        parent: true,
        children: true,
      }
    });
  }

  async update(location_id: number, data: UpdateLocationDto) {
    return await prisma.location.update({
      where: { location_id },
      data,
      include: {
        parent: true,
        children: true,
      }
    });
  }

  async delete(location_id: number) {
    return await prisma.location.delete({
      where: { location_id }
    });
  }

  async findByType(location_type: string) {
    return await prisma.location.findMany({
      where: { location_type: location_type as any },
      include: {
        parent: true,
        children: true,
      }
    });
  }
}