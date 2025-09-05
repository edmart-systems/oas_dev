import { PrismaClient } from '@prisma/client';
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';

const prisma = new PrismaClient();

export class LocationRepository {
  async findAll() {
  return await prisma.location.findMany({
    where: { is_active: true },
    select: {
      location_id: true,
      location_name: true,
      location_type: true,
      location_parent_id: true,
      location_address: true,
      assigned_to: true,
      is_active: true,
      created_by: true,
      updated_by: true,
      parent: {
        select: {
          location_id: true,
          location_name: true,
          location_type: true
        }
      },
      children: {
        select: {
          location_id: true,
          location_name: true,
          location_type: true
        }
      }
    },
    orderBy: { location_name: 'asc' }
  });
}


  async findById(location_id: number) {
    return await prisma.location.findUnique({
      where: { location_id },
      select: {
        location_id: true,
        location_name: true,
        location_type: true,
        location_parent_id: true,
        location_address: true,
        is_active: true,
        created_by: true,
        updated_by: true,
        parent: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        },
        children: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        }
      }
    });
  }

  async create(data: CreateLocationDto) {
    return await prisma.location.create({
      data,
      select: {
        location_id: true,
        location_name: true,
        location_type: true,
        location_parent_id: true,
        location_address: true,
        is_active: true,
        created_by: true,
        updated_by: true,
        parent: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        },
        children: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        }
      }
    });
  }

  async update(location_id: number, data: UpdateLocationDto) {
    return await prisma.location.update({
      where: { location_id },
      data,
      select: {
        location_id: true,
        location_name: true,
        location_type: true,
        location_parent_id: true,
        location_address: true,
        is_active: true,
        created_by: true,
        updated_by: true,
        parent: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        },
        children: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        }
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
      select: {
        location_id: true,
        location_name: true,
        location_type: true,
        location_parent_id: true,
        location_address: true,
        is_active: true,
        created_by: true,
        updated_by: true,
        parent: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        },
        children: {
          select: {
            location_id: true,
            location_name: true,
            location_type: true
          }
        }
      }
    });
  }
}