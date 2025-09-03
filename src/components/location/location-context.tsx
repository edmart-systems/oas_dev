"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentLocation } from '@/hooks/use-current-location';

type LocationContextType = {
  currentLocationId: number | null;
  setCurrentLocation: (locationId: number) => Promise<boolean>;
  loading: boolean;
  refetch: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const locationData = useCurrentLocation();

  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};