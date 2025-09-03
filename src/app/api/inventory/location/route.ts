import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/server-actions/auth-actions/auth.actions';
import { LocationService } from '@/modules/inventory/services/location.service';
import { UserRoleId } from '@/utils/location-role.utils';
import { CreateLocationSchema } from '@/modules/inventory/dtos/location.dto';

const locationService = new LocationService();

export async function GET() {
  try {
    const locations = await locationService.getAllLocations();
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    const userRoleId = (session?.user?.role_id as UserRoleId) || 2;
  const json = await request.json();
const parsed = CreateLocationSchema.parse(json);
parsed.created_by = session?.user?.co_user_id;

const location = await locationService.createLocation(parsed, userRoleId);
    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create location' },
      { status: 400 }
    );
  }
}