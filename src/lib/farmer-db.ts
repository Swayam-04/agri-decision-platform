import { validatePhoneNumber } from "./sms-engine";

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  region: string;
  crop: string;
  consent: boolean;
  verified: boolean;
  created_at: string;
}

let farmersList: FarmerProfile[] = [
  // Seed data for immediate testing
  {
    id: "f-1000",
    name: "Ramesh Kumar",
    phone: "+919876543210",
    region: "Punjab",
    crop: "Wheat",
    consent: true,
    verified: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "f-1001",
    name: "Suresh Patel",
    phone: "+919988776655",
    region: "Gujarat",
    crop: "Cotton",
    consent: false, // Explicitly opted out
    verified: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];
let idCounter = 1002;

export function addFarmer(data: { name: string; phone: string; region: string; crop: string; consent: boolean }): { success: boolean; farmer?: FarmerProfile; error?: string } {
  // 1. Phone validation using the existing helper
  const validation = validatePhoneNumber(data.phone);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join("; ") };
  }
  
  const normalizedPhone = validation.normalized;

  // 2. Uniqueness check
  const exists = farmersList.find(f => f.phone === normalizedPhone);
  if (exists) {
    // If it exists, we could just update it, but for strictness we return error.
    return { success: false, error: "Farmer with this phone number is already registered." };
  }

  // 3. Create
  const newFarmer: FarmerProfile = {
    id: `f-${idCounter++}-${Date.now()}`,
    name: data.name,
    phone: normalizedPhone,
    region: data.region,
    crop: data.crop,
    consent: data.consent,
    verified: true, // Auto-verified for this MVP
    created_at: new Date().toISOString()
  };

  farmersList.push(newFarmer);
  return { success: true, farmer: newFarmer };
}

export function getFarmers(): FarmerProfile[] {
  // Return sorted by newest first
  return [...farmersList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function unsubscribeFarmer(phone: string): boolean {
  const normalizedPhone = phone.replace(/[\s\-()]/g, "").replace(/^0/, "+91");
  const parsedPhone = normalizedPhone.startsWith("+") ? normalizedPhone : "+91" + normalizedPhone;
  
  const farmerIdx = farmersList.findIndex(f => f.phone === parsedPhone || f.phone === phone);
  if (farmerIdx >= 0) {
    farmersList[farmerIdx].consent = false;
    return true;
  }
  return false;
}

export function getValidTargetFarmers(cropType: string, region: string): FarmerProfile[] {
  // Filter for exact crop, region, MUST have consent, MUST be verified.
  return farmersList.filter(f => 
    f.crop === cropType && 
    f.region === region && 
    f.consent === true && 
    f.verified === true
  );
}
