import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/server-actions/auth-actions/auth.actions';
import { LocationService } from '@/modules/inventory/services/location.service';

const locationService = new LocationService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location_id = parseInt(params.id);
    const location = await locationService.getLocationById(location_id);
    return NextResponse.json(location);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const location_id = parseInt(params.id);
    const data = await request.json();
    data.updated_by = session?.user?.co_user_id;
    
    const location = await locationService.updateLocation(location_id, data);
    return NextResponse.json(location);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update location' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location_id = parseInt(params.id);
    await locationService.deleteLocation(location_id);
    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete location' },
      { status: 400 }
    );
  }
}