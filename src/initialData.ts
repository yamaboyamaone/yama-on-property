import { Property, Booking, Message, Profile, WebsiteSettings } from './types';

// Zero defaults and demo properties - empty catalog
export const INITIAL_PROPERTIES: Property[] = [];

// Zero defaults and demo bookings - clean state
export const INITIAL_BOOKINGS: Booking[] = [];

// Zero defaults and demo messages - clean state
export const INITIAL_MESSAGES: Message[] = [];

// Clean administrative profile
export const INITIAL_PROFILE: Profile = {
  name: 'YAMA ON PROPERTY Admin',
  email: '',
  phone: '',
  bio: '',
  avatar: '',
  role: 'Administrator',
};

// Clean website configuration
export const INITIAL_SETTINGS: WebsiteSettings = {
  phone: '',
  email: '',
  currency: 'NGN',
  address: '',
  footerIntro: 'Thoughtful property choices. Clear guidance. A better tomorrow.',
  contactTitle: 'Get in touch',
  contactText: 'Contact our team for property details, viewings and enquiries.',
  supabaseUrl: '',
  supabaseAnonKey: '',
  storagePreference: 'cloud-and-local',
  masterKey: '419@Yamaonproperty',
};
