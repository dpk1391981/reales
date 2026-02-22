// ─── FORM DATA TYPE ───────────────────────────────────────────────────────────
export interface FormData {
  propertyCategory: string;
  listingType: string;
  plan: string;
  selectedPlan?: string;
  residentialType: string;
  commercialType: string;
  industrialType: string;
  bhk: string;
  area: string;
  price: string;
  description: string;
  city: string;
  locality: string;
  society: string;
  pincode: string;
  photos: string[];
  virtualTour: boolean;
  hideNumber: boolean;
  ownerName: string;
  ownerPhone: string;
  negotiable: boolean;
  urgent: boolean;
  loanAvailable: boolean;
  featured: boolean;
  bathrooms: number;
  balconies: number;
  furnishing: string;
  facing: string;
  age: string;
  amenities: string[];
  deposit: string;
  maintenance: string;
  projectName: string;
  builderName: string;
  rera: string;
  powerLoad: string;
  roadWidth: string;
  cabins: string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type SetField = (k: string, v: any) => void;
