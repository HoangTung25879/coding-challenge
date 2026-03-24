// src/types/index.ts

export type LeadSource =
  | 'website'
  | 'referral'
  | 'walk-in'
  | 'phone'
  | 'social-media'
  | 'dealer-event'
  | 'other';
export type LeadType = 'cold' | 'warm' | 'hot';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified';
export type ActivityType = 'call' | 'email' | 'text' | 'appointment' | 'note' | 'walk-in';
export type PurchaseTimeline =
  | 'immediate'
  | 'within-1-month'
  | 'within-3-months'
  | 'within-6-months'
  | 'exploring';

export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type IndividualContact = {
  type: 'individual';
  jobTitle: string;
};

export type OrganizationContact = {
  type: 'organization';
  companyName: string;
  industry: string;
  numberOfEmployees: number;
  annualRevenue: number;
  currency: string;
  companyRegion: string;
};

export type VehicleInterest = {
  id: string;
  name: string;
  brand: string;
  model: string;
  vin?: string;
  condition: 'new' | 'used' | 'certified-pre-owned';
  year: number;
  odometer?: number;
  odometerUnit: 'km' | 'miles';
  color: string;
  imageUrl: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic' | 'cvt';
  interestLevel: 1 | 2 | 3 | 4 | 5;
  notes: string;
};

export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bestTimeToContact: string;
  address: Address;
  leadType: LeadType;
  status: LeadStatus;
  clientProfile: IndividualContact | OrganizationContact | null;
  source: LeadSource;
  salesModel: 'direct' | 'indirect';
  preferredCommunication: ('call' | 'text' | 'email' | 'in-person')[];
  notes: string;
  vehiclesOfInterest: VehicleInterest[];
  budget: {
    max: number;
    monthlyPaymentTarget: number;
    currency: string;
  };
  financingPreference: 'cash' | 'lease' | 'loan' | 'undecided';
  purchaseTimeline: PurchaseTimeline;
  assignedSalesRepId: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadSummary = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: LeadSource;
  primaryVehicleInterest: string;
  leadType: LeadType;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  subject: string;
  note: string;
  scheduledAt?: string | null;
  createdAt: string;
  createdBy: string;
  completedAt: string | null; // null = pending, ISO string = done
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CollectionResponse<T> = {
  data: T[];
  pagination?: PaginationMeta;
};
