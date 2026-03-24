/**
 * Seed script — generates deterministic mock data into JSON files.
 * Run once with: npm run seed
 *
 * Output:
 *   src/mocks/data/leads.json
 *   src/mocks/data/activities.json
 */

import { faker } from '@faker-js/faker';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../src/mocks/data');

// ── Fixed seed for deterministic output ──────────────────────────────
faker.seed(42);

// ── Constants ────────────────────────────────────────────────────────

const LEAD_COUNT = 126;
const SALES_REPS = ['salesperson-1', 'salesperson-2'];

const LEAD_SOURCES = [
  'website',
  'referral',
  'walk-in',
  'phone',
  'social-media',
  'dealer-event',
  'other',
];
const LEAD_TYPES = ['cold', 'warm', 'hot'];
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'unqualified'];
const PURCHASE_TIMELINES = [
  'immediate',
  'within-1-month',
  'within-3-months',
  'within-6-months',
  'exploring',
];
const FINANCING_PREFS = ['cash', 'lease', 'loan', 'undecided'];
const SALES_MODELS = ['direct', 'indirect'];
const COMM_CHANNELS = ['call', 'text', 'email', 'in-person'];
const CONDITIONS = ['new', 'used', 'certified-pre-owned'];
const ODOMETER_UNITS = ['km', 'miles'];
const ACTIVITY_TYPES = ['call', 'email', 'text', 'appointment', 'note', 'walk-in'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'SGD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR'];

// ── Car image URLs (Unsplash, royalty-free) ──────────────────────────

const CAR_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
  'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
  'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
  'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
  'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800',
  'https://images.unsplash.com/photo-1617704548623-340376564e68?w=800',
];

const VEHICLE_CATALOG = [
  {
    brand: 'Tesla',
    model: 'Model 3',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  {
    brand: 'Tesla',
    model: 'Model Y',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  { brand: 'BMW', model: 'X5', fuelType: 'hybrid', transmission: 'automatic' },
  {
    brand: 'BMW',
    model: '3 Series',
    fuelType: 'petrol',
    transmission: 'automatic',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    fuelType: 'hybrid',
    transmission: 'automatic',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    fuelType: 'diesel',
    transmission: 'automatic',
  },
  {
    brand: 'Porsche',
    model: 'Taycan',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    fuelType: 'hybrid',
    transmission: 'cvt',
  },
  {
    brand: 'Toyota',
    model: 'Land Cruiser',
    fuelType: 'diesel',
    transmission: 'automatic',
  },
  {
    brand: 'Ford',
    model: 'Transit',
    fuelType: 'diesel',
    transmission: 'automatic',
  },
  {
    brand: 'Ford',
    model: 'Mustang Mach-E',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  {
    brand: 'Volvo',
    model: 'XC90',
    fuelType: 'hybrid',
    transmission: 'automatic',
  },
  { brand: 'Audi', model: 'Q7', fuelType: 'diesel', transmission: 'automatic' },
  {
    brand: 'Hyundai',
    model: 'Ioniq 5',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  {
    brand: 'Kia',
    model: 'EV6',
    fuelType: 'electric',
    transmission: 'automatic',
  },
  {
    brand: 'Range Rover',
    model: 'Sport',
    fuelType: 'hybrid',
    transmission: 'automatic',
  },
  {
    brand: 'Chevrolet',
    model: 'Silverado',
    fuelType: 'petrol',
    transmission: 'automatic',
  },
  {
    brand: 'Jeep',
    model: 'Wrangler',
    fuelType: 'petrol',
    transmission: 'manual',
  },
  {
    brand: 'Mazda',
    model: 'CX-5',
    fuelType: 'petrol',
    transmission: 'automatic',
  },
  {
    brand: 'Cadillac',
    model: 'Escalade',
    fuelType: 'petrol',
    transmission: 'automatic',
  },
  { brand: 'Honda', model: 'CR-V', fuelType: 'hybrid', transmission: 'cvt' },
  {
    brand: 'Nissan',
    model: 'Leaf',
    fuelType: 'electric',
    transmission: 'automatic',
  },
];

const INDUSTRIES = [
  'Logistics',
  'Technology',
  'Construction',
  'Hospitality',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
];

// ── Helpers ──────────────────────────────────────────────────────────

function pick(arr) {
  return faker.helpers.arrayElement(arr);
}

function padId(n) {
  return String(n).padStart(3, '0');
}

// ── Generate a vehicle interest ──────────────────────────────────────

function generateVehicle(index) {
  const catalog = pick(VEHICLE_CATALOG);
  const condition = pick(CONDITIONS);
  const year = faker.number.int({ min: 2021, max: 2025 });
  const name = `${year} ${catalog.brand} ${catalog.model}`;

  return {
    id: `v-${padId(index)}`,
    name,
    brand: catalog.brand,
    model: catalog.model,
    ...(condition === 'used' || condition === 'certified-pre-owned'
      ? { vin: faker.vehicle.vin() }
      : {}),
    condition,
    year,
    ...(condition !== 'new' ? { odometer: faker.number.int({ min: 5000, max: 80000 }) } : {}),
    odometerUnit: pick(ODOMETER_UNITS),
    color: faker.vehicle.color(),
    imageUrl: pick(CAR_IMAGE_URLS),
    fuelType: catalog.fuelType,
    transmission: catalog.transmission,
    interestLevel: faker.number.int({ min: 1, max: 5 }),
    notes: faker.lorem.sentence(),
  };
}

// ── Generate a lead ──────────────────────────────────────────────────

function generateLead(index) {
  const id = faker.string.uuid();
  const isOrg = faker.datatype.boolean(0.35);
  const currency = pick(CURRENCIES);
  const maxBudget = faker.number.int({ min: 25000, max: 600000 });
  const createdAt = faker.date
    .between({
      from: '2026-01-15T00:00:00.000Z',
      to: '2026-03-20T00:00:00.000Z',
    })
    .toISOString();
  const updatedAt = faker.date
    .between({ from: createdAt, to: '2026-03-21T23:59:59.000Z' })
    .toISOString();

  // 1-2 vehicles per lead
  const vehicleCount = faker.number.int({ min: 1, max: 2 });
  const vehicles = Array.from({ length: vehicleCount }, (_, vi) =>
    generateVehicle(index * 10 + vi + 1)
  );

  const clientProfile = isOrg
    ? {
        type: 'organization',
        companyName: faker.company.name(),
        industry: pick(INDUSTRIES),
        numberOfEmployees: faker.number.int({ min: 10, max: 500 }),
        annualRevenue: faker.number.int({ min: 500000, max: 50000000 }),
        currency,
        companyRegion: faker.location.state(),
      }
    : {
        type: 'individual',
        jobTitle: faker.person.jobTitle(),
      };

  const commCount = faker.number.int({ min: 1, max: 3 });

  return {
    id,
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    bestTimeToContact: pick([
      'Weekday mornings',
      'Weekday afternoons',
      'Weekday evenings',
      'Afternoons after 2pm',
      'Evenings after 6pm',
      'Mornings before 10am',
      'Weekends',
      'Any time',
    ]),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      country: faker.location.countryCode(),
      postalCode: faker.location.zipCode(),
    },
    leadType: pick(LEAD_TYPES),
    status: pick(LEAD_STATUSES),
    clientProfile,
    source: pick(LEAD_SOURCES),
    salesModel: pick(SALES_MODELS),
    preferredCommunication: faker.helpers.arrayElements(COMM_CHANNELS, commCount),
    notes: faker.lorem.sentence(),
    vehiclesOfInterest: vehicles,
    budget: {
      max: maxBudget,
      monthlyPaymentTarget: Math.round(maxBudget / faker.number.int({ min: 36, max: 72 })),
      currency,
    },
    financingPreference: pick(FINANCING_PREFS),
    purchaseTimeline: pick(PURCHASE_TIMELINES),
    assignedSalesRepId: pick(SALES_REPS),
    createdAt,
    updatedAt,
  };
}

// ── Generate activities ──────────────────────────────────────────────

const ACTIVITY_SUBJECTS = {
  call: [
    'Initial outreach',
    'Follow-up call',
    'Pricing discussion',
    'Availability check',
    'Post-event call',
  ],
  email: [
    'Sent brochure',
    'Pricing details',
    'Follow-up email',
    'Comparison sheet sent',
    'Options emailed',
  ],
  text: ['Quick follow-up', 'Sent specs link', 'Availability update', 'Follow-up text'],
  appointment: [
    'Test drive scheduled',
    'Showroom visit',
    'Site visit',
    'Contract signing',
    'Fleet demo',
  ],
  note: ['Internal note', 'Post-demo notes', 'Deal status update', 'Requirements documented'],
  'walk-in': ['Showroom walk-in', 'Walked in to browse', 'Office visit'],
};

function generateActivities(leads) {
  const activities = [];
  let actIndex = 1;

  for (let li = 0; li < leads.length; li++) {
    const lead = leads[li];
    // index 21 (22nd lead) gets zero activities for test edge case
    if (li === 21) continue;

    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      const type = pick(ACTIVITY_TYPES);
      const subject = pick(ACTIVITY_SUBJECTS[type]);

      const createdAt = faker.date
        .between({ from: lead.createdAt, to: '2026-03-21T23:59:59.000Z' })
        .toISOString();
      const isCompleted = faker.datatype.boolean(0.3);
      const completedAt = isCompleted
        ? faker.date.between({ from: createdAt, to: '2026-03-22T23:59:59.000Z' }).toISOString()
        : null;

      activities.push({
        id: `act-${padId(actIndex++)}`,
        leadId: lead.id,
        type,
        subject,
        note: faker.lorem.sentences({ min: 1, max: 2 }),
        createdAt,
        createdBy: pick(SALES_REPS),
        completedAt,
      });
    }
  }

  // Sort by createdAt for consistency
  activities.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Re-index IDs after sort
  activities.forEach((act, i) => {
    act.id = `act-${padId(i + 1)}`;
  });

  return activities;
}

// ── Vehicle catalog ──────────────────────────────────────────────────

const CATALOG_ENTRIES = [
  { id: 'cat-001', brand: 'BMW', model: 'X5', year: 2024, condition: 'new', color: 'Black Sapphire', imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', fuelType: 'hybrid', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-002', brand: 'BMW', model: '3 Series', year: 2024, condition: 'new', color: 'Alpine White', imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', fuelType: 'petrol', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-003', brand: 'Tesla', model: 'Model 3', year: 2024, condition: 'new', color: 'Pearl White', imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', fuelType: 'electric', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-004', brand: 'Tesla', model: 'Model Y', year: 2024, condition: 'new', color: 'Midnight Silver', imageUrl: 'https://images.unsplash.com/photo-1617704548623-340376564e68?w=800', fuelType: 'electric', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-005', brand: 'Toyota', model: 'Camry', year: 2024, condition: 'new', color: 'Midnight Black', imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', fuelType: 'hybrid', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-006', brand: 'Toyota', model: 'RAV4', year: 2024, condition: 'new', color: 'Blueprint', imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', fuelType: 'hybrid', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-007', brand: 'Mercedes-Benz', model: 'GLE', year: 2024, condition: 'new', color: 'Obsidian Black', imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800', fuelType: 'diesel', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-008', brand: 'Mercedes-Benz', model: 'C-Class', year: 2023, condition: 'certified-pre-owned', color: 'Polar White', imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', fuelType: 'petrol', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-009', brand: 'Audi', model: 'A4', year: 2024, condition: 'new', color: 'Mythos Black', imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', fuelType: 'petrol', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-010', brand: 'Audi', model: 'Q7', year: 2024, condition: 'new', color: 'Glacier White', imageUrl: 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800', fuelType: 'diesel', transmission: 'automatic', odometerUnit: 'km' },
  { id: 'cat-011', brand: 'Porsche', model: '911', year: 2023, condition: 'certified-pre-owned', color: 'Guards Red', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', fuelType: 'petrol', transmission: 'manual', odometerUnit: 'km' },
  { id: 'cat-012', brand: 'Honda', model: 'Accord', year: 2024, condition: 'new', color: 'Sonic Grey', imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800', fuelType: 'hybrid', transmission: 'cvt', odometerUnit: 'km' },
  { id: 'cat-013', brand: 'Ford', model: 'F-150', year: 2024, condition: 'new', color: 'Oxford White', imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', fuelType: 'petrol', transmission: 'automatic', odometerUnit: 'miles' },
  { id: 'cat-014', brand: 'Volkswagen', model: 'Golf', year: 2024, condition: 'new', color: 'Reflex Silver', imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800', fuelType: 'petrol', transmission: 'manual', odometerUnit: 'km' },
  { id: 'cat-015', brand: 'Lexus', model: 'RX', year: 2024, condition: 'new', color: 'Nebula Gray', imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800', fuelType: 'hybrid', transmission: 'automatic', odometerUnit: 'km' },
];

function generateVehicleCatalog() {
  return CATALOG_ENTRIES.map((entry) => ({
    ...entry,
    name: `${entry.year} ${entry.brand} ${entry.model}`,
  }));
}

// ── Main ─────────────────────────────────────────────────────────────

const leads = Array.from({ length: LEAD_COUNT }, (_, i) => generateLead(i + 1));
const activities = generateActivities(leads);
const vehicleCatalog = generateVehicleCatalog();

writeFileSync(resolve(DATA_DIR, 'leads.json'), JSON.stringify(leads, null, 2) + '\n');
writeFileSync(resolve(DATA_DIR, 'activities.json'), JSON.stringify(activities, null, 2) + '\n');
writeFileSync(resolve(DATA_DIR, 'vehicles.json'), JSON.stringify(vehicleCatalog, null, 2) + '\n');

console.log(`Seeded ${leads.length} leads → src/mocks/data/leads.json`);
console.log(`Seeded ${activities.length} activities → src/mocks/data/activities.json`);
console.log(`Seeded ${vehicleCatalog.length} vehicles → src/mocks/data/vehicles.json`);
