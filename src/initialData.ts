import { Property, Booking, Message, Profile, WebsiteSettings, VisitorStats } from './types';

// Zero defaults and demo properties - clean catalog
export const INITIAL_PROPERTIES: Property[] = [];

// Zero defaults and demo bookings - clean state
export const INITIAL_BOOKINGS: Booking[] = [];

// Zero defaults and demo messages - clean state
export const INITIAL_MESSAGES: Message[] = [];

// Managing Director & Principal Consultant profile with studio headshot & customizable WhatsApp
export const INITIAL_PROFILE: Profile = {
  name: 'Mr Yaseer Mustapha Aliyu',
  role: 'Managing Director & Principal Consultant',
  email: 'pennantviewdesignmedia@gmail.com',
  phone: '+234 803 555 0192',
  whatsapp: '+234 803 555 0192',
  bio: 'Managing Director & Principal Real Estate Consultant at YAMA ON PROPERTY. Specializing in verified residential acquisitions, luxury developments, and flexible investment advisory across Lagos, Abuja, and diaspora clients.',
  avatar: '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png',
};

// Clean website configuration with customizable WhatsApp number
export const INITIAL_SETTINGS: WebsiteSettings = {
  phone: '+234 803 555 0192',
  whatsapp: '+234 803 555 0192',
  email: 'info@yamaonproperty.com',
  currency: 'NGN',
  address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  footerIntro: 'Thoughtful property choices. Clear guidance. A better tomorrow.',
  contactTitle: 'Get in touch',
  contactText: 'Contact our team for property details, viewings and enquiries.',
  supabaseUrl: '',
  supabaseAnonKey: '',
  storagePreference: 'cloud-and-local',
  masterKey: '419@Yamaonproperty',
};

// Initial visitor analytics
export const INITIAL_VISITOR_STATS: VisitorStats = {
  totalVisitors: 0,
  todayVisitors: 0,
  totalPageViews: 0,
  uniqueSessions: 0,
  deviceBreakdown: {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  },
  recentVisits: [],
  dailyVisits: [],
};
