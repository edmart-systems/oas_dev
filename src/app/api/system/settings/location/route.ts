import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server-actions/auth-actions/auth.actions';
import { SystemSettingService } from '@/modules/system/services/system-setting.service';
import { SessionService } from '@/services/auth-service/session.service';
import { LocationService } from '@/modules/inventory/services/location.service';
import { CreateLocationSchema } from '@/modules/inventory/dtos/location.dto';

const systemSettingService = new SystemSettingService();
const sessionService = new SessionService();
const locationService = new LocationService();

export async function GET() {
  try {
    const locationId = await systemSettingService.getCurrentLocation();
    return NextResponse.json({ locationId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get current location' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await sessionService.isUserSessionManager(session))) {
      return NextResponse.json(
        { error: 'Unauthorized - Manager access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Check if this is setting current location or creating new location
    if (body.locationId) {
      // Setting current location
      await systemSettingService.setCurrentLocation(body.locationId, session.user.co_user_id);
      return NextResponse.json({ success: true });
    } else {
      // Creating new location
      const locationData = {
        ...body,
        created_by: session.user.co_user_id
      };
      
      const parsed = CreateLocationSchema.safeParse(locationData);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid location data', details: parsed.error.errors },
          { status: 400 }
        );
      }

      const location = await locationService.createLocation(parsed.data);
      return NextResponse.json(location, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}