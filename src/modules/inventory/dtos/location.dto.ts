import { LocationType } from '@prisma/client';
import { z } from 'zod';

/**
 * Create Location Schema
 */
export const CreateLocationSchema = z.object({
  location_name: z.string().min(1, "Location name is required"),
  location_type: z.nativeEnum(LocationType),
  location_parent_id: z.number().optional(),
  location_address: z.string().optional(),
  assigned_to: z.string().optional(),
  is_active: z.boolean().default(true),
  created_by: z.string().optional(),
});
export type CreateLocationDto = z.infer<typeof CreateLocationSchema>;

/**
 * Update Location Schema
 */
export const UpdateLocationSchema = z.object({
  location_name: z.string().optional(),
  location_type: z.nativeEnum(LocationType).optional(),
  location_parent_id: z.number().optional(),
  location_address: z.string().optional(),
  assigned_to: z.string().optional(),
  is_active: z.boolean().optional(),
  updated_by: z.string().optional(),
});
export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>;

/**
 * Response Schema
 */
export const LocationResponseSchema: z.ZodType<{
  location_id: number;
  location_name: string;
  location_type: LocationType;
  location_parent_id?: number | null;
  location_address?: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
  parent?: any;
  children?: any[];
}> = z.lazy(() =>
  z.object({
    location_id: z.number(),
    location_name: z.string(),
    location_type: z.nativeEnum(LocationType),
    location_parent_id: z.number().nullable().optional(),
    location_address: z.string().nullable().optional(),
    is_active: z.boolean(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    parent: LocationResponseSchema.optional(),
    children: z.array(LocationResponseSchema).optional(),
  })
);
export type LocationResponseDto = z.infer<typeof LocationResponseSchema>;
