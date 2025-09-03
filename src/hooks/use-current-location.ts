import { useState, useEffect } from 'react';

export const useCurrentLocation = () => {
  const [currentLocationId, setCurrentLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentLocation = async () => {
    try {
      const response = await fetch('/api/system/settings/location');
      const data = await response.json();
      setCurrentLocationId(data.locationId);
    } catch (error) {
      console.error('Failed to fetch current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentLocation = async (locationId: number) => {
    try {
      const response = await fetch('/api/system/settings/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId })
      });

      if (response.ok) {
        setCurrentLocationId(locationId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to set current location:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return {
    currentLocationId,
    setCurrentLocation,
    loading,
    refetch: fetchCurrentLocation
  };
};