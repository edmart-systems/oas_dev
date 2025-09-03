import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SystemSettingService {
  async getCurrentLocation(): Promise<number | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { setting_key: 'current_location_id' }
    });
    return setting?.setting_value ? parseInt(setting.setting_value) : null;
  }

  async setCurrentLocation(locationId: number, updatedBy: string): Promise<void> {
    await prisma.systemSetting.upsert({
      where: { setting_key: 'current_location_id' },
      update: {
        setting_value: locationId.toString(),
        updated_by: updatedBy
      },
      create: {
        setting_key: 'current_location_id',
        setting_value: locationId.toString(),
        updated_by: updatedBy
      }
    });
  }
}