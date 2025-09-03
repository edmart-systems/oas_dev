import { LocationRepository } from '../repositories/location.repository';
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';
import { getAllowedLocationTypes, canSelectParent, UserRoleId } from '@/utils/location-role.utils';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async getAllLocations() {
    return await this.locationRepository.findAll();
  }

  async getLocationById(location_id: number) {
    const location = await this.locationRepository.findById(location_id);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  async createLocation(data: CreateLocationDto, userRoleId: UserRoleId = 2) {
    // Check role permissions
    const allowedTypes = getAllowedLocationTypes(userRoleId);
    if (!allowedTypes.includes(data.location_type)) {
      throw new Error(`You don't have permission to create ${data.location_type} locations`);
    }

    // Handle MAIN_STORE logic
    if (data.location_type === 'MAIN_STORE') {
      const existingMainStore = await this.locationRepository.findByType('MAIN_STORE');
      if (existingMainStore.length > 0) {
        throw new Error('Only one MAIN_STORE location is allowed');
      }
      data.location_parent_id = undefined;
    }

    // Handle BRANCH logic
    if (data.location_type === 'BRANCH') {
      if (!canSelectParent(userRoleId, data.location_type)) {
        throw new Error('You don\'t have permission to select parent for BRANCH locations');
      }
      const mainStore = await this.locationRepository.findByType('MAIN_STORE');
      if (mainStore.length === 0) {
        throw new Error('MAIN_STORE must exist before creating BRANCH');
      }
      data.location_parent_id = mainStore[0].location_id;
    }

    // Handle INVENTORY_POINT logic
    if (data.location_type === 'INVENTORY_POINT') {
      if (data.location_parent_id && !canSelectParent(userRoleId, data.location_type)) {
        throw new Error('You don\'t have permission to select parent for INVENTORY_POINT locations');
      }
      if (!data.location_parent_id) {
        throw new Error('INVENTORY_POINT must have a BRANCH parent');
      }
      const parent = await this.locationRepository.findById(data.location_parent_id);
      if (!parent || parent.location_type !== 'BRANCH') {
        throw new Error('INVENTORY_POINT parent must be a BRANCH');
      }
    }

    return await this.locationRepository.create(data);
  }

  async updateLocation(location_id: number, data: UpdateLocationDto) {
    // Check if location exists
    await this.getLocationById(location_id);

    // Validate parent exists if provided
    if (data.location_parent_id) {
      const parent = await this.locationRepository.findById(data.location_parent_id);
      if (!parent) {
        throw new Error('Parent location not found');
      }
    }

    return await this.locationRepository.update(location_id, data);
  }

  async deleteLocation(location_id: number) {
    // Check if location exists
    await this.getLocationById(location_id);

    return await this.locationRepository.delete(location_id);
  }

  async getLocationsByType(location_type: string) {
    return await this.locationRepository.findByType(location_type);
  }
}