/**
 * Seed script — generates deterministic mock data into JSON files.
 * Run once with: npm run seed
 *
 * Output:
 *   src/mocks/data/leads.json
 *   src/mocks/data/activities.json
 */

import { faker } from '@faker-js/faker'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../src/mocks/data')

// ── Fixed seed for deterministic output ──────────────────────────────
faker.seed(42)

// ── Constants ────────────────────────────────────────────────────────

const LEAD_COUNT = 22
const SALES_REPS = ['salesperson-1', 'salesperson-2']

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost', 'won']
const LEAD_SOURCES = ['website', 'referral', 'walk-in', 'phone', 'social-media', 'dealer-event', 'other']
const LEAD_TYPES = ['cold', 'warm', 'hot']
const PURCHASE_TIMELINES = ['immediate', 'within-1-month', 'within-3-months', 'within-6-months', 'exploring']
const FINANCING_PREFS = ['cash', 'lease', 'loan', 'undecided']
const SALES_MODELS = ['direct', 'indirect']
const COMM_CHANNELS = ['call', 'text', 'email', 'in-person']
const CONDITIONS = ['new', 'used', 'certified-pre-owned']
const ODOMETER_UNITS = ['km', 'miles']
const ACTIVITY_TYPES = ['call', 'email', 'text', 'appointment', 'note', 'walk-in']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'SGD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR']

// ── Car image URLs (Unsplash, royalty-free) ──────────────────────────

const CAR_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800',
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
  'https://images.unsplash.com/photo-1600661653561-629509216228?w=800',
  'https://images.unsplash.com/photo-1635073908681-e4b31ac3b8a1?w=800',
  'https://images.unsplash.com/photo-1649872867344-b3e14b4a79c3?w=800',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
]

const VEHICLE_CATALOG = [
  { brand: 'Tesla', model: 'Model 3', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'Tesla', model: 'Model Y', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'BMW', model: 'X5', fuelType: 'hybrid', transmission: 'automatic' },
  { brand: 'BMW', model: '3 Series', fuelType: 'petrol', transmission: 'automatic' },
  { brand: 'Mercedes-Benz', model: 'E-Class', fuelType: 'hybrid', transmission: 'automatic' },
  { brand: 'Mercedes-Benz', model: 'Sprinter', fuelType: 'diesel', transmission: 'automatic' },
  { brand: 'Porsche', model: 'Taycan', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'Toyota', model: 'Corolla', fuelType: 'hybrid', transmission: 'cvt' },
  { brand: 'Toyota', model: 'Land Cruiser', fuelType: 'diesel', transmission: 'automatic' },
  { brand: 'Ford', model: 'Transit', fuelType: 'diesel', transmission: 'automatic' },
  { brand: 'Ford', model: 'Mustang Mach-E', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'Volvo', model: 'XC90', fuelType: 'hybrid', transmission: 'automatic' },
  { brand: 'Audi', model: 'Q7', fuelType: 'diesel', transmission: 'automatic' },
  { brand: 'Hyundai', model: 'Ioniq 5', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'Kia', model: 'EV6', fuelType: 'electric', transmission: 'automatic' },
  { brand: 'Range Rover', model: 'Sport', fuelType: 'hybrid', transmission: 'automatic' },
  { brand: 'Chevrolet', model: 'Silverado', fuelType: 'petrol', transmission: 'automatic' },
  { brand: 'Jeep', model: 'Wrangler', fuelType: 'petrol', transmission: 'manual' },
  { brand: 'Mazda', model: 'CX-5', fuelType: 'petrol', transmission: 'automatic' },
  { brand: 'Cadillac', model: 'Escalade', fuelType: 'petrol', transmission: 'automatic' },
  { brand: 'Honda', model: 'CR-V', fuelType: 'hybrid', transmission: 'cvt' },
  { brand: 'Nissan', model: 'Leaf', fuelType: 'electric', transmission: 'automatic' },
]

const INDUSTRIES = [
  'Logistics', 'Technology', 'Construction', 'Hospitality', 'Healthcare',
  'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate',
]

// ── Helpers ──────────────────────────────────────────────────────────

function pick(arr) {
  return faker.helpers.arrayElement(arr)
}

function padId(n) {
  return String(n).padStart(3, '0')
}

// ── Generate a vehicle interest ──────────────────────────────────────

function generateVehicle(index) {
  const catalog = pick(VEHICLE_CATALOG)
  const condition = pick(CONDITIONS)
  const year = faker.number.int({ min: 2021, max: 2025 })
  const name = `${year} ${catalog.brand} ${catalog.model}`

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
    ...(condition !== 'new'
      ? { odometer: faker.number.int({ min: 5000, max: 80000 }) }
      : {}),
    odometerUnit: pick(ODOMETER_UNITS),
    color: faker.vehicle.color(),
    imageUrl: pick(CAR_IMAGE_URLS),
    fuelType: catalog.fuelType,
    transmission: catalog.transmission,
    interestLevel: faker.number.int({ min: 1, max: 5 }),
    notes: faker.lorem.sentence(),
  }
}

// ── Generate a lead ──────────────────────────────────────────────────

function generateLead(index) {
  const id = `lead-${padId(index)}`
  const isOrg = faker.datatype.boolean(0.35)
  const currency = pick(CURRENCIES)
  const maxBudget = faker.number.int({ min: 25000, max: 600000 })
  const createdAt = faker.date
    .between({ from: '2026-01-15T00:00:00.000Z', to: '2026-03-20T00:00:00.000Z' })
    .toISOString()
  const updatedAt = faker.date
    .between({ from: createdAt, to: '2026-03-21T23:59:59.000Z' })
    .toISOString()

  // 1-2 vehicles per lead
  const vehicleCount = faker.number.int({ min: 1, max: 2 })
  const vehicles = Array.from({ length: vehicleCount }, (_, vi) =>
    generateVehicle(index * 10 + vi + 1),
  )

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
      }

  const commCount = faker.number.int({ min: 1, max: 3 })

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
    status: pick(LEAD_STATUSES),
    assignedSalesRepId: pick(SALES_REPS),
    createdAt,
    updatedAt,
  }
}

// ── Generate activities ──────────────────────────────────────────────

const ACTIVITY_SUBJECTS = {
  call: ['Initial outreach', 'Follow-up call', 'Pricing discussion', 'Availability check', 'Post-event call'],
  email: ['Sent brochure', 'Pricing details', 'Follow-up email', 'Comparison sheet sent', 'Options emailed'],
  text: ['Quick follow-up', 'Sent specs link', 'Availability update', 'Follow-up text'],
  appointment: ['Test drive scheduled', 'Showroom visit', 'Site visit', 'Contract signing', 'Fleet demo'],
  note: ['Internal note', 'Post-demo notes', 'Deal status update', 'Requirements documented'],
  'walk-in': ['Showroom walk-in', 'Walked in to browse', 'Office visit'],
}

function generateActivities(leads) {
  const activities = []
  let actIndex = 1

  for (const lead of leads) {
    // lead-022 gets zero activities for test edge case
    if (lead.id === 'lead-022') continue

    const count = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < count; i++) {
      const type = pick(ACTIVITY_TYPES)
      const subject = pick(ACTIVITY_SUBJECTS[type])

      activities.push({
        id: `act-${padId(actIndex++)}`,
        leadId: lead.id,
        type,
        subject,
        note: faker.lorem.sentences({ min: 1, max: 2 }),
        createdAt: faker.date
          .between({ from: lead.createdAt, to: '2026-03-21T23:59:59.000Z' })
          .toISOString(),
        createdBy: pick(SALES_REPS),
      })
    }
  }

  // Sort by createdAt for consistency
  activities.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // Re-index IDs after sort
  activities.forEach((act, i) => {
    act.id = `act-${padId(i + 1)}`
  })

  return activities
}

// ── Main ─────────────────────────────────────────────────────────────

const leads = Array.from({ length: LEAD_COUNT }, (_, i) => generateLead(i + 1))
const activities = generateActivities(leads)

writeFileSync(
  resolve(DATA_DIR, 'leads.json'),
  JSON.stringify(leads, null, 2) + '\n',
)

writeFileSync(
  resolve(DATA_DIR, 'activities.json'),
  JSON.stringify(activities, null, 2) + '\n',
)

console.log(`Seeded ${leads.length} leads → src/mocks/data/leads.json`)
console.log(`Seeded ${activities.length} activities → src/mocks/data/activities.json`)
