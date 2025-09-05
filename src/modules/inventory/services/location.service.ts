import { LocationRepository } from '../repositories/location.repository';
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';
import { getAllowedLocationTypes, canSelectParent, UserRoleId } from '@/utils/location-role.utils';
import { LocationType } from '@prisma/client';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async getAllLocations() {
    return await this.locationRepository.findAll();
  }

  async getLocationsByType(locationType: string) {
    return await this.locationRepository.findByType(locationType as any);
  }

  async getLocationById(location_id: number) {
    const location = await this.locationRepository.findById(location_id);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

 async createLocation(data: CreateLocationDto, userRoleId: UserRoleId = 2) {
  const allowedTypes = getAllowedLocationTypes(userRoleId);
  if (!allowedTypes.includes(data.location_type)) {
    throw new Error(`You don't have permission to create ${data.location_type}`);
  }

  if (data.location_type === LocationType.MAIN_STORE) {
    const existing = await this.locationRepository.findByType(LocationType.MAIN_STORE);
    if (existing.length > 0) throw new Error('Only one MAIN_STORE allowed');
    data.location_parent_id = undefined;
  }

  if (data.location_type === LocationType.BRANCH) {
    const parent = await this.locationRepository.findById(data.location_parent_id ?? 0);
    if (!parent || parent.location_type !== LocationType.MAIN_STORE) {
      throw new Error('BRANCH must belong to MAIN_STORE');
    }
  }

  if (data.location_type === LocationType.INVENTORY_POINT) {
    const parent = await this.locationRepository.findById(data.location_parent_id ?? 0);
    if (!parent || parent.location_type !== LocationType.BRANCH) {
      throw new Error('INVENTORY_POINT must belong to a BRANCH');
    }
  }

  return await this.locationRepository.create(data);
}


  async updateLocation(location_id: number, data: UpdateLocationDto) {
    // Check if location exists
    await this.getLocationById(location_id);

   if (data.location_type === LocationType.BRANCH && data.location_parent_id) {
  const parent = await this.locationRepository.findById(data.location_parent_id);
  if (!parent || parent.location_type !== LocationType.MAIN_STORE) {
    throw new Error('BRANCH must belong to MAIN_STORE');
  }
}

if (data.location_type === LocationType.INVENTORY_POINT && data.location_parent_id) {
  const parent = await this.locationRepository.findById(data.location_parent_id);
  if (!parent || parent.location_type !== LocationType.BRANCH) {
    throw new Error('INVENTORY_POINT must belong to a BRANCH');
  }
}

    return await this.locationRepository.update(location_id, data);
  }

  async deleteLocation(location_id: number) {
  const location = await this.getLocationById(location_id);

  if (location.children && location.children.length > 0) {
    throw new Error("Cannot delete location with children");
  }

  return await this.locationRepository.delete(location_id);
}
}