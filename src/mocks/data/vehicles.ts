// src/mocks/data/vehicles.ts
import type { VehicleInterest } from '@/types';
import catalogJson from './vehicles.json';

export const vehicleCatalog = catalogJson as Omit<
  VehicleInterest,
  'interestLevel' | 'notes' | 'vin' | 'odometer'
>[];
