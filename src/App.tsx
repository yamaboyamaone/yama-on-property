import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Property, Booking, Message, Profile, WebsiteSettings, StorageStatus, VisitorStats } from './types';
import {
  INITIAL_PROPERTIES,
  INITIAL_BOOKINGS,
  INITIAL_MESSAGES,
  INITIAL_PROFILE,
  INITIAL_SETTINGS,
  INITIAL_VISITOR_STATS,
} from './initialData';
import {
  fetchServerCloudData,
  syncServerCloudData,
  CloudPayload,
  getStoredAdminSessionToken,
  verifyAdminSessionApi,
  logoutAdminApi,
} from './utils/cloudStorage';
import { recordSiteVisit, getStoredVisitorStats } from './utils/visitorTracker';
import { safeSetItem } from './utils/safeStorage';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BookingModal } from './components/BookingModal';
import { InquiryModal } from './components/InquiryModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { MapSection } from './components/MapSection';
import { AboutCTA } from './components/AboutCTA';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import { Building2, Lock, PhoneCall, Smartphone } from 'lucide-react';

function sanitizeList<T extends { id?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const id = String(item?.id || '');
    return !id.startsWith('yama-prop-') && !id.startsWith('b-10') && !id.startsWith('m-20');
  });
}

export default function App() {
  // -------------------------------------------------------------
  // State: Local Cache & Cloud Storage
  // -------------------------------------------------------------
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('yama_properties');
      if (saved) {
        return sanitizeList(JSON.parse(saved));
      }
    } catch {}
    return INITIAL_PROPERTIES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('yama_bookings');
      if (saved) {
        return sanitizeList(JSON.parse(saved));
      }
    } catch {}
    return INITIAL_BOOKINGS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('yama_messages');
      if (saved) {
        return sanitizeList(JSON.parse(saved));
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('yama_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        let updated = false;
        if (
          !parsed.avatar ||
          parsed.avatar.includes('unsplash') ||
          parsed.avatar.includes('photo-')
        ) {
          parsed.avatar = '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png';
          updated = true;
        }
        if (!parsed.name || parsed.name === 'Mustapha Yasir' || parsed.name.trim() === '') {
          parsed.name = 'Mr Yaseer Mustapha Aliyu';
          updated = true;
        }
        if (!parsed.whatsapp) {
          parsed.whatsapp = parsed.phone || '+234 803 555 0192';
          updated = true;
        }
        if (!parsed.role || parsed.role.includes('Managing Director')) {
          parsed.role = 'Managing Director & Principal Consultant';
        }
        if (updated) {
          localStorage.setItem('yama_profile', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return INITIAL_PROFILE;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    try {
      const saved = localStorage.getItem('yama_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.whatsapp) {
          parsed.whatsapp = parsed.phone || '+234 803 555 0192';
          localStorage.setItem('yama_settings', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  // Visitor analytics state
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() => {
    return getStoredVisitorStats();
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yama_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin authentication token for multi-device login
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return getStoredAdminSessionToken();
  });

  // Currency
  const [currency, setCurrency] = useState<string>(() => {
    return settings.currency || 'NGN';
  });

  // Storage and sync tracking
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    cloudConnected: false,
    cloudMode: 'cloud-and-local',
    supabaseConnected: false,
    lastSynced: null,
    syncing: false,
  });

  // Mode: public website vs admin portal (checks #admin or ?admin=1 on boot)
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('admin') || search.includes('admin') || path.includes('/admin')) {
        return 'admin';
      }
    }
    return 'public';
  });

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchPurpose, setSearchPurpose] = useState('');
  const [selectedPurposeTab, setSelectedPurposeTab] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Active Modals
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<Property | null>(null);
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null);
  const [selectedPropertyForInquiry, setSelectedPropertyForInquiry] = useState<Property | null>(null);
  const [imageViewerData, setImageViewerData] = useState<{ src: string; caption: string } | null>(null);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Listen to hash changes (e.g. user taps #admin on their phone)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.toLowerCase().includes('admin')) {
        setViewMode('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Verify stored session token on mount (auto-login across device refreshes)
  useEffect(() => {
    const token = getStoredAdminSessionToken();
    if (token) {
      verifyAdminSessionApi(token).then((res) => {
        if (res.authenticated) {
          setAdminToken(token);
        } else {
          setAdminToken(null);
        }
      });
    }
  }, []);

  // Track visitor on mount
  useEffect(() => {
    recordSiteVisit(window.location.pathname).then((newStats) => {
      setVisitorStats(newStats);
    });
  }, []);

  // -------------------------------------------------------------
  // Cloud & Local Sync Engine
  // -------------------------------------------------------------
  const syncWithCloudServer = useCallback(
    async (currentLocalData?: CloudPayload) => {
      setStorageStatus((s) => ({ ...s, syncing: true }));

      const payload: CloudPayload = currentLocalData || {
        properties,
        bookings,
        messages,
        profile,
        settings,
        visitors: visitorStats,
      };

      const pushResult = await syncServerCloudData(payload);
      const pullResult = await fetchServerCloudData();

      if (pullResult.success && pullResult.data) {
        const serverData = pullResult.data;
        if (serverData.properties) {
          const cleanProps = sanitizeList(serverData.properties);
          setProperties(cleanProps);
          safeSetItem('yama_properties', JSON.stringify(cleanProps));
        }
        if (serverData.bookings) {
          const cleanBookings = sanitizeList(serverData.bookings);
          setBookings(cleanBookings);
          safeSetItem('yama_bookings', JSON.stringify(cleanBookings));
        }
        if (serverData.messages) {
          const cleanMessages = sanitizeList(serverData.messages);
          setMessages(cleanMessages);
          safeSetItem('yama_messages', JSON.stringify(cleanMessages));
        }
        if (serverData.profile) {
          setProfile(serverData.profile);
          safeSetItem('yama_profile', JSON.stringify(serverData.profile));
        }
        if (serverData.settings) {
          setSettings(serverData.settings);
          safeSetItem('yama_settings', JSON.stringify(serverData.settings));
        }
        if (serverData.visitors) {
          setVisitorStats(serverData.visitors);
          safeSetItem('yama_visitor_stats', JSON.stringify(serverData.visitors));
        }

        setStorageStatus({
          cloudConnected: true,
          cloudMode: 'cloud-and-local',
          supabaseConnected: Boolean(settings.supabaseUrl && settings.supabaseAnonKey),
          lastSynced: new Date().toLocaleTimeString(),
          syncing: false,
        });
      } else {
        setStorageStatus((s) => ({
          ...s,
          cloudConnected: pushResult.success,
          syncing: false,
          lastSynced: new Date().toLocaleTimeString(),
        }));
      }
    },
    [properties, bookings, messages, profile, settings, visitorStats]
  );

  // Initial cloud fetch on boot
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await fetchServerCloudData();
      if (!isMounted) return;

      if (result.success && result.data) {
        const serverData = result.data;
        if (serverData.properties && serverData.properties.length > 0) {
          const cleanProps = sanitizeList(serverData.properties);
          setProperties(cleanProps);
          safeSetItem('yama_properties', JSON.stringify(cleanProps));
        } else {
          const localProps = sanitizeList(properties);
          if (localProps.length > 0) {
            syncServerCloudData({ properties: localProps, bookings, messages, profile, settings, visitors: visitorStats });
          }
        }

        if (serverData.bookings) {
          setBookings(sanitizeList(serverData.bookings));
        }
        if (serverData.messages) {
          setMessages(sanitizeList(serverData.messages));
        }
        if (serverData.profile?.name) {
          setProfile(serverData.profile);
        }
        if (serverData.settings?.phone !== undefined) {
          setSettings(serverData.settings);
        }
        if (serverData.visitors?.totalVisitors !== undefined) {
          setVisitorStats(serverData.visitors);
          safeSetItem('yama_visitor_stats', JSON.stringify(serverData.visitors));
        }

        setStorageStatus({
          cloudConnected: true,
          cloudMode: 'cloud-and-local',
          supabaseConnected: Boolean(serverData.settings?.supabaseUrl),
          lastSynced: new Date().toLocaleTimeString(),
          syncing: false,
        });
      } else {
        setStorageStatus((s) => ({
          ...s,
          cloudConnected: false,
          lastSynced: 'Local Only',
          syncing: false,
        }));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to safe storage
  useEffect(() => {
    safeSetItem('yama_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    safeSetItem('yama_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeSetItem('yama_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeSetItem('yama_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    safeSetItem('yama_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeSetItem('yama_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Handlers with automatic cloud dispatch
  const handleUpdateProperties = (newProps: Property[]) => {
    setProperties(newProps);
    safeSetItem('yama_properties', JSON.stringify(newProps));
    syncServerCloudData({ properties: newProps, bookings, messages, profile, settings });
  };

  const handleUpdateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    safeSetItem('yama_bookings', JSON.stringify(newBookings));
    syncServerCloudData({ properties, bookings: newBookings, messages, profile, settings });
  };

  const handleUpdateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    safeSetItem('yama_messages', JSON.stringify(newMessages));
    syncServerCloudData({ properties, bookings, messages: newMessages, profile, settings });
  };

  const handleUpdateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
    safeSetItem('yama_profile', JSON.stringify(newProfile));
    syncServerCloudData({ properties, bookings, messages, profile: newProfile, settings });
  };

  const handleUpdateSettings = (newSettings: WebsiteSettings) => {
    setSettings(newSettings);
    safeSetItem('yama_settings', JSON.stringify(newSettings));
    if (newSettings.currency) setCurrency(newSettings.currency);
    syncServerCloudData({ properties, bookings, messages, profile, settings: newSettings });
  };

  const handleClearAllData = () => {
    setProperties([]);
    setBookings([]);
    setMessages([]);
    try {
      localStorage.removeItem('yama_properties');
      localStorage.removeItem('yama_bookings');
      localStorage.removeItem('yama_messages');
    } catch {}
    syncServerCloudData({
      properties: [],
      bookings: [],
      messages: [],
      profile,
      settings,
    });
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    triggerToast('Logged into Admin Console');
  };

  const handleAdminLogout = () => {
    logoutAdminApi(adminToken || undefined);
    setAdminToken(null);
    window.location.hash = '';
    setViewMode('public');
    triggerToast('Logged out of Admin');
  };

  const handleScrollToSection = (sectionId: string) => {
    if (viewMode === 'admin') {
      window.location.hash = '';
      setViewMode('public');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleToggleFavorite = (propId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(propId);
      if (exists) {
        triggerToast('Removed from saved properties');
        return prev.filter((id) => id !== propId);
      } else {
        triggerToast('Property saved to your favorites');
        return [...prev, propId];
      }
    });
  };

  const handleSubmitBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: 'book-' + Date.now(),
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);

    const inquiryMsg: Message = {
      id: 'msg-' + Date.now(),
      name: bookingData.name,
      contact: `${bookingData.phone} · ${bookingData.email}`,
      property: bookingData.property,
      propertyId: bookingData.propertyId,
      text: `Inspection requested for ${bookingData.date} (${bookingData.time}). ${
        bookingData.note ? `Note: ${bookingData.note}` : ''
      }`,
      date: new Date().toLocaleDateString('en-GB'),
      read: false,
    };
    const updatedMessages = [inquiryMsg, ...messages];
    setMessages(updatedMessages);

    syncServerCloudData({
      properties,
      bookings: updatedBookings,
      messages: updatedMessages,
      profile,
      settings,
    });

    triggerToast('Inspection request scheduled and saved to Cloud');
  };

  const handleSubmitInquiry = (inquiryData: Omit<Message, 'id' | 'date' | 'read'>) => {
    const newMsg: Message = {
      ...inquiryData,
      id: 'msg-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      read: false,
    };
    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);

    syncServerCloudData({
      properties,
      bookings,
      messages: updatedMessages,
      profile,
      settings,
    });

    triggerToast('Inquiry sent to Cloud database');
  };

  const handleSelectCategory = (categoryType: string) => {
    setSelectedCategory((prev) => (prev === categoryType ? '' : categoryType));
    handleScrollToSection('properties');
  };

  const handleClearFilters = () => {
    setSearchName('');
    setSearchLocation('');
    setSearchType('');
    setSearchPurpose('');
    setSelectedPurposeTab('All');
    setSelectedCategory('');
    setShowOnlyFavorites(false);
  };

  // Filtered properties with complete null-safety
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!p) return false;
      const title = (p.title || '').toLowerCase();
      const location = (p.location || '').toLowerCase();
      const type = (p.type || '').toLowerCase();
      const category = (p.category || '').toLowerCase();

      if (searchName.trim()) {
        const q = searchName.toLowerCase();
        const matchesTitle = title.includes(q);
        const matchesLoc = location.includes(q);
        const matchesType = type.includes(q);
        if (!matchesTitle && !matchesLoc && !matchesType) return false;
      }

      if (searchLocation.trim()) {
        const qLoc = searchLocation.toLowerCase();
        if (!location.includes(qLoc)) return false;
      }

      if (searchType) {
        const qType = searchType.toLowerCase();
        if (
          !type.includes(qType) &&
          !category.includes(qType) &&
          !title.includes(qType)
        ) {
          return false;
        }
      }

      if (searchPurpose && p.purpose !== searchPurpose) {
        return false;
      }

      if (selectedPurposeTab !== 'All') {
        if (selectedPurposeTab === 'Land') {
          if (p.category !== 'Land & Plots' && !type.includes('land')) {
            return false;
          }
        } else if (selectedPurposeTab === 'Short Let') {
          if (p.purpose !== 'Short Let') return false;
        } else if (p.purpose !== selectedPurposeTab) {
          return false;
        }
      }

      if (selectedCategory) {
        const qCat = selectedCategory.toLowerCase();
        const matchCat =
          type.includes(qCat) ||
          category.includes(qCat) ||
          title.includes(qCat);
        if (!matchCat) return false;
      }

      if (showOnlyFavorites && !favorites.includes(p.id)) {
        return false;
      }

      return true;
    });
  }, [
    properties,
    searchName,
    searchLocation,
    searchType,
    searchPurpose,
    selectedPurposeTab,
    selectedCategory,
    showOnlyFavorites,
    favorites,
  ]);

  // Admin Portal View
  if (viewMode === 'admin') {
    return (
      <AdminPortal
        properties={properties}
        bookings={bookings}
        messages={messages}
        profile={profile}
        settings={settings}
        storageStatus={storageStatus}
        adminToken={adminToken}
        visitorStats={visitorStats}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onAdminLogout={handleAdminLogout}
        onUpdateProperties={handleUpdateProperties}
        onUpdateBookings={handleUpdateBookings}
        onUpdateMessages={handleUpdateMessages}
        onUpdateProfile={handleUpdateProfile}
        onUpdateSettings={handleUpdateSettings}
        onCloseAdmin={() => {
          window.location.hash = '';
          setViewMode('public');
        }}
        onTriggerSync={() => syncWithCloudServer()}
        onClearAllData={handleClearAllData}
      />
    );
  }

  // Public View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-[#c99535] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0b1930] text-[#e7b95f] px-5 py-3 rounded-2xl shadow-2xl border border-[#e7b95f]/30 z-50 text-xs font-bold transition-all">
          {toastMessage}
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        favoritesCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavoritesOnly={() => {
          setShowOnlyFavorites(!showOnlyFavorites);
          handleScrollToSection('properties');
        }}
        onOpenAdmin={() => {
          window.location.hash = '#admin';
          setViewMode('admin');
        }}
        onScrollToSection={handleScrollToSection}
        businessPhone={settings.phone}
        isCloudConnected={storageStatus.cloudConnected}
        isSyncing={storageStatus.syncing}
        onTriggerSync={() => syncWithCloudServer()}
        profile={profile}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          searchName={searchName}
          onSearchNameChange={setSearchName}
          searchLocation={searchLocation}
          onSearchLocationChange={setSearchLocation}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          searchPurpose={searchPurpose}
          onSearchPurposeChange={setSearchPurpose}
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          onExecuteSearch={() => handleScrollToSection('properties')}
          profile={profile}
          businessPhone={settings.phone}
          onConsultantClick={() => handleScrollToSection('about')}
        />

        {/* Categories Section */}
        <CategoriesSection
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />

        {/* Properties Listings Section */}
        <section id="properties" className="py-16 md:py-24 bg-slate-100/70 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#c99535] mb-2">
                  Handpicked opportunities
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1930] tracking-tight">
                  Featured properties
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Showing {filteredProperties.length}{' '}
                  {filteredProperties.length === 1 ? 'property' : 'properties'}. Availability should be confirmed with the advisory team.
                </p>
              </div>

              {/* Purpose Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'For Sale', 'For Rent', 'Short Let', 'Land'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedPurposeTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPurposeTab === tab
                        ? 'bg-[#0b1930] text-[#e7b95f] shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                {(searchName ||
                  searchLocation ||
                  searchType ||
                  searchPurpose ||
                  selectedPurposeTab !== 'All' ||
                  selectedCategory ||
                  showOnlyFavorites) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Empty States */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 bg-[#0b1930]/5 text-[#0b1930] rounded-2xl flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-[#c99535]" />
                </div>

                {properties.length === 0 ? (
                  <>
                    <h3 className="text-xl font-extrabold text-[#0b1930]">
                      No properties currently published
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      Our catalog is being updated with verified properties. Contact our advisory team directly for inquiries, or sign in to the Admin Console to publish listings from your phone or laptop.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleScrollToSection('contact')}
                        className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Contact Advisory
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.hash = '#admin';
                          setViewMode('admin');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#c99535]" />
                        Admin Login
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-900">
                      No properties matched your criteria
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Try clearing some of your filters to browse available properties.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                    >
                      Clear active filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    currency={currency}
                    isFavorite={favorites.includes(prop.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={setSelectedPropertyForDetails}
                    onBookViewing={setSelectedPropertyForBooking}
                    onOpenImageViewer={(src, caption) =>
                      setImageViewerData({ src, caption })
                    }
                    defaultWhatsApp={settings.phone}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Map Section */}
        <MapSection />

        {/* About Call-To-Action & Principal Consultant Spotlight */}
        <AboutCTA
          onExploreHomes={() => handleScrollToSection('properties')}
          profile={profile}
          businessPhone={settings.phone}
        />
      </main>

      {/* Floating Real Estate Advisor Quick-Contact Widget (Desktop) */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <div className="bg-[#0b1930] text-white p-3 pr-5 rounded-full shadow-2xl border border-[#e7b95f]/50 flex items-center gap-3.5 backdrop-blur-md hover:border-[#e7b95f] transition-all duration-300">
          <div className="relative shrink-0">
            <img
              src={
                profile.avatar && !profile.avatar.includes('unsplash')
                  ? profile.avatar
                  : '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png'
              }
              alt={profile.name || 'Mr Yaseer Mustapha Aliyu'}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#e7b95f]"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1930]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white flex items-center gap-2 leading-tight">
              {profile.name || 'Mr Yaseer Mustapha Aliyu'}
              <span className="text-[10px] font-extrabold text-[#0b1930] bg-[#e7b95f] px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 font-medium">
              <button
                type="button"
                onClick={() => {
                  const rawNumber = (profile.whatsapp || profile.phone || settings.whatsapp || settings.phone || '+234 803 555 0192').replace(/\D/g, '');
                  let cleanPhone = rawNumber;
                  if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);
                  const msg = `Hello ${profile.name || 'Mr Yaseer Mustapha Aliyu'}, I'm browsing the YAMA ON PROPERTY website and would like personalized property consultation.`;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                Chat on WhatsApp
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleScrollToSection('about')}
                className="text-slate-300 hover:text-[#e7b95f] font-semibold cursor-pointer"
              >
                Profile & Bio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Real Estate Advisor Quick-Contact Pill (Mobile) */}
      <div className="fixed bottom-5 left-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => {
            const rawNumber = (profile.whatsapp || profile.phone || settings.whatsapp || settings.phone || '+234 803 555 0192').replace(/\D/g, '');
            let cleanPhone = rawNumber;
            if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);
            const msg = `Hello ${profile.name || 'Mr Yaseer Mustapha Aliyu'}, I'm browsing the YAMA ON PROPERTY website and would like personalized property consultation.`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
          }}
          className="bg-[#0b1930] text-white p-2 pr-4 rounded-full shadow-2xl border border-[#e7b95f]/60 flex items-center gap-2.5 cursor-pointer"
          title="Chat with Principal Consultant"
        >
          <div className="relative shrink-0">
            <img
              src={
                profile.avatar && !profile.avatar.includes('unsplash')
                  ? profile.avatar
                  : '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png'
              }
              alt={profile.name || 'Mr Yaseer Mustapha Aliyu'}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#e7b95f]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0b1930]" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Chat with Mr Yaseer</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        settings={settings}
        onScrollToSection={handleScrollToSection}
        onOpenAdmin={() => {
          window.location.hash = '#admin';
          setViewMode('admin');
        }}
      />

      {/* Modals */}
      {selectedPropertyForDetails && (
        <PropertyDetailModal
          property={selectedPropertyForDetails}
          currency={currency}
          onClose={() => setSelectedPropertyForDetails(null)}
          onBookViewing={(prop) => {
            setSelectedPropertyForDetails(null);
            setSelectedPropertyForBooking(prop);
          }}
          onAskQuestion={(prop) => {
            setSelectedPropertyForDetails(null);
            setSelectedPropertyForInquiry(prop);
          }}
          onOpenImageViewer={(src, caption) =>
            setImageViewerData({ src, caption })
          }
          defaultWhatsApp={settings.phone}
        />
      )}

      {selectedPropertyForBooking && (
        <BookingModal
          property={selectedPropertyForBooking}
          onClose={() => setSelectedPropertyForBooking(null)}
          onSubmitBooking={handleSubmitBooking}
        />
      )}

      {selectedPropertyForInquiry && (
        <InquiryModal
          property={selectedPropertyForInquiry}
          onClose={() => setSelectedPropertyForInquiry(null)}
          onSubmitInquiry={handleSubmitInquiry}
        />
      )}

      {imageViewerData && (
        <ImageViewerModal
          src={imageViewerData.src}
          caption={imageViewerData.caption}
          onClose={() => setImageViewerData(null)}
        />
      )}
    </div>
  );
}
