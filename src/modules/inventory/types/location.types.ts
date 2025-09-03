import { LocationType } from '@prisma/client';

export interface Location {
  location_id: number;
  location_name: string;
  location_type: LocationType;
  location_parent_id?: number;
  location_address?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  parent?: Location;
  children?: Location[];
}