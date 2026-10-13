export interface Property {
  id: string;
  title: string;
  category: string;
  type: string;
  purpose: 'For Sale' | 'For Rent' | 'For Lease' | 'Short Let' | 'For Sale or Rent';
  price: number;
  location: string;
  beds: number;
  baths: number;
  status: 'Available' | 'Reserved' | 'Unavailable' | 'Sold';
  whatsapp?: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  description: string;
  features: string[];
  flexible: 'yes' | 'no';
  deposit: number;
  duration: string;
  balance: number;
  createdAt?: string;
  featured?: boolean;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  note: string;
  property: string;
  propertyId?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Cancelled';
  createdAt?: string;
}

export interface Message {
  id: string;
  name: string;
  contact: string;
  property: string;
  propertyId?: string;
  text: string;
  date: string;
  read?: boolean;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  role?: string;
}

export interface WebsiteSettings {
  phone: string;
  email: string;
  currency: string;
  address: string;
  footerIntro: string;
  contactTitle: string;
  contactText: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  storagePreference?: 'cloud-and-local' | 'cloud-only' | 'local-only';
  masterKey?: string;
}

export interface StorageStatus {
  cloudConnected: boolean;
  cloudMode: 'cloud-and-local' | 'local-only';
  supabaseConnected: boolean;
  lastSynced: string | null;
  syncing: boolean;
  error?: string | null;
}
