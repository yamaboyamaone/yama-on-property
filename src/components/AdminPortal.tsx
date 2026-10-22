import React, { useState } from 'react';
import {
  Property,
  Booking,
  Message,
  Profile,
  WebsiteSettings,
  StorageStatus,
  VisitorStats,
} from '../types';
import { formatMoney, CURRENCY_LIST } from '../utils/currency';
import {
  testSupabaseConnection,
  loginAdminApi,
  logoutAdminApi,
  getStoredAdminSessionToken,
  saveAdminSessionToken,
} from '../utils/cloudStorage';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  CalendarCheck,
  Mail,
  User,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Search,
  Trash2,
  Upload,
  KeyRound,
  Download,
  Menu,
  X,
  Cloud,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Smartphone,
  Laptop,
  Copy,
  Eye,
  EyeOff,
  Share2,
  MessageCircle,
  Users,
  Film,
  Images,
  TrendingUp,
  Star,
  Play,
  Calculator,
  Sliders,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface AdminPortalProps {
  properties: Property[];
  bookings: Booking[];
  messages: Message[];
  profile: Profile;
  settings: WebsiteSettings;
  storageStatus: StorageStatus;
  visitorStats: VisitorStats;
  adminToken: string | null;
  onAdminLoginSuccess: (token: string) => void;
  onAdminLogout: () => void;
  onUpdateProperties: (properties: Property[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateMessages: (messages: Message[]) => void;
  onUpdateProfile: (profile: Profile) => void;
  onUpdateSettings: (settings: WebsiteSettings) => void;
  onCloseAdmin: () => void;
  onTriggerSync: () => Promise<void>;
  onClearAllData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  properties,
  bookings,
  messages,
  profile,
  settings,
  storageStatus,
  visitorStats,
  adminToken,
  onAdminLoginSuccess,
  onAdminLogout,
  onUpdateProperties,
  onUpdateBookings,
  onUpdateMessages,
  onUpdateProfile,
  onUpdateSettings,
  onCloseAdmin,
  onTriggerSync,
  onClearAllData,
}) => {
  // Login input state
  const [inputKey, setInputKey] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'masterKey' | 'email'>('masterKey');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'traffic' | 'listings' | 'add' | 'bookings' | 'messages' | 'devices' | 'profile' | 'settings' | 'storage'
  >('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Property edit state
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propForm, setPropForm] = useState<Partial<Property>>({
    title: '',
    category: 'Residential',
    type: 'Detached House',
    purpose: 'For Sale',
    price: 0,
    location: '',
    beds: 4,
    baths: 4,
    status: 'Available',
    whatsapp: '',
    image: '',
    images: [],
    videoUrl: '',
    description: '',
    features: [],
    flexible: 'yes',
    deposit: 30,
    duration: '12 months',
    balance: 70,
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Supabase test state
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Change master key form state
  const [currentKeyInput, setCurrentKeyInput] = useState('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [keyUpdateResult, setKeyUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Login handler using Cloud API verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const credentials =
      loginMethod === 'masterKey'
        ? { key: inputKey.trim() }
        : { email: inputEmail.trim(), password: inputKey.trim() };

    const result = await loginAdminApi(credentials, settings.masterKey || '419@Yamaonproperty');
    setIsLoggingIn(false);

    if (result.success && result.token) {
      if (rememberDevice) {
        saveAdminSessionToken(result.token);
      }
      onAdminLoginSuccess(result.token);
      showToast('Admin access verified on this device');
    } else {
      setLoginError(result.message || 'Incorrect Master Key or password.');
    }
  };

  // Property form operations
  const startEditProperty = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropForm({
      ...prop,
      images: prop.images && prop.images.length > 0 ? prop.images : (prop.image ? [prop.image] : []),
      videoUrl: prop.videoUrl || '',
    });
    setActiveTab('add');
  };

  const resetForm = () => {
    setEditingPropertyId(null);
    setPropForm({
      title: '',
      category: 'Residential',
      type: 'Detached House',
      purpose: 'For Sale',
      price: 0,
      location: '',
      beds: 4,
      baths: 4,
      status: 'Available',
      whatsapp: '',
      image: '',
      images: [],
      videoUrl: '',
      description: '',
      features: [],
      flexible: 'yes',
      deposit: 30,
      duration: '12 months',
      balance: 70,
    });
    setNewImageUrl('');
    setFeatureInput('');
  };

  // Multi-photo batch upload with automatic canvas compression
  const handleMultiPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploadingPhotos(true);
    showToast(`Optimizing and adding ${files.length} photo${files.length > 1 ? 's' : ''}...`);

    try {
      const compressedImages: string[] = [];
      for (const file of files) {
        try {
          // Compress to max 1600px width/height and quality 0.82
          const compressed = await compressImage(file, 1600, 0.82);
          compressedImages.push(compressed);
        } catch (err) {
          console.warn('Skipping unreadable image file:', err);
        }
      }

      if (compressedImages.length > 0) {
        setPropForm((prev) => {
          const currentList = prev.images || [];
          const merged = [...currentList, ...compressedImages];
          return {
            ...prev,
            images: merged,
            image: prev.image || merged[0] || '',
          };
        });
        showToast(`${compressedImages.length} photo${compressedImages.length > 1 ? 's' : ''} added to gallery`);
      }
    } catch (err) {
      console.error('Error processing photos:', err);
      showToast('Error uploading photos. Please try again.');
    } finally {
      setIsUploadingPhotos(false);
      if (e.target) e.target.value = '';
    }
  };

  // Add photo by URL
  const handleAddPhotoUrl = () => {
    if (!newImageUrl.trim()) return;
    setPropForm((prev) => {
      const current = prev.images || [];
      return {
        ...prev,
        images: [...current, newImageUrl.trim()],
        image: prev.image || newImageUrl.trim(),
      };
    });
    setNewImageUrl('');
    showToast('Photo URL added to gallery');
  };

  const handleSetCoverImage = (imgUrl: string) => {
    setPropForm((prev) => ({
      ...prev,
      image: imgUrl,
    }));
    showToast('Cover photo updated');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPropForm((prev) => {
      const current = prev.images || [];
      const updated = current.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image: prev.image === current[indexToRemove] ? (updated[0] || '') : prev.image,
      };
    });
    showToast('Photo removed from gallery');
  };

  // Video file upload with safe size limit
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 25MB for direct browser embed
    if (file.size > 25 * 1024 * 1024) {
      alert(
        `Video file is ${Math.round(file.size / (1024 * 1024))}MB. Direct browser upload limit is 25MB to prevent memory freezes.\n\nFor larger video walkthroughs, please paste a YouTube, Vimeo, or MP4 link in the box below.`
      );
      if (e.target) e.target.value = '';
      return;
    }

    showToast('Attaching video walkthrough...');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPropForm((prev) => ({
          ...prev,
          videoUrl: reader.result as string,
        }));
        showToast('Property video uploaded');
      }
    };
    reader.onerror = () => {
      alert('Failed to read video file.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMultiPhotoUpload(e);
  };

  const handleAddFeatureChip = (chip: string) => {
    if (!chip.trim()) return;
    const current = propForm.features || [];
    if (!current.includes(chip.trim())) {
      setPropForm({ ...propForm, features: [...current, chip.trim()] });
    }
    setFeatureInput('');
  };

  const handleRemoveFeatureChip = (indexToRemove: number) => {
    const current = propForm.features || [];
    setPropForm({
      ...propForm,
      features: current.filter((_, i) => i !== indexToRemove),
    });
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!propForm.title || !propForm.price || !propForm.location) {
        alert('Please fill out all required fields: Title, Price, and Location.');
        return;
      }

      if (propForm.flexible === 'yes') {
        const deposit = Number(propForm.deposit) || 0;
        const balance = Number(propForm.balance) || 0;
        if (deposit + balance !== 100) {
          alert('Initial deposit % and balance % must equal 100%.');
          return;
        }
      }

      const fallbackImage =
        propForm.image ||
        (propForm.images && propForm.images[0]) ||
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85';

      if (editingPropertyId) {
        const updated = properties.map((p) =>
          p.id === editingPropertyId
            ? ({
                ...p,
                ...propForm,
                price: Number(propForm.price) || 0,
                beds: Number(propForm.beds) || 0,
                baths: Number(propForm.baths) || 0,
                deposit: Number(propForm.deposit) || 30,
                balance: Number(propForm.balance) || 70,
                image: fallbackImage,
                images: propForm.images && propForm.images.length > 0 ? propForm.images : [fallbackImage],
                videoUrl: propForm.videoUrl || '',
                features: Array.isArray(propForm.features) ? propForm.features : [],
              } as Property)
            : p
        );
        onUpdateProperties(updated);
        showToast('Property updated in Cloud database');
      } else {
        const newProperty: Property = {
          id: 'prop-' + Date.now(),
          title: propForm.title || '',
          category: propForm.category || 'Residential',
          type: propForm.type || 'Detached House',
          purpose: propForm.purpose || 'For Sale',
          price: Number(propForm.price) || 0,
          location: propForm.location || '',
          beds: Number(propForm.beds) || 0,
          baths: Number(propForm.baths) || 0,
          status: propForm.status || 'Available',
          whatsapp: propForm.whatsapp || '',
          image: fallbackImage,
          images: propForm.images && propForm.images.length > 0 ? propForm.images : [fallbackImage],
          videoUrl: propForm.videoUrl || '',
          description: propForm.description || '',
          features: Array.isArray(propForm.features) ? propForm.features : [],
          flexible: propForm.flexible || 'yes',
          deposit: Number(propForm.deposit) || 30,
          duration: propForm.duration || '12 months',
          balance: Number(propForm.balance) || 70,
          createdAt: new Date().toISOString().split('T')[0],
        };
        onUpdateProperties([newProperty, ...properties]);
        showToast('Property published to Cloud database');
      }

      resetForm();
      setActiveTab('listings');
    } catch (err) {
      console.error('Error saving property:', err);
      alert('An error occurred while saving the property listing. Please try again.');
    }
  };

  const handleDeleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this property listing?')) {
      onUpdateProperties(properties.filter((p) => p.id !== id));
      showToast('Property deleted');
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updated = properties.map((p) => {
      if (p.id === id) {
        const nextStatus: Property['status'] =
          p.status === 'Available' ? 'Unavailable' : 'Available';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    onUpdateProperties(updated);
    showToast('Listing status updated');
  };

  // Booking operations
  const handleUpdateBookingStatus = (id: string, newStatus: Booking['status']) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    onUpdateBookings(updated);
    showToast('Booking status updated');
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('Remove this inspection request?')) {
      onUpdateBookings(bookings.filter((b) => b.id !== id));
      showToast('Booking removed');
    }
  };

  // Message operations
  const handleToggleMessageRead = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, read: !m.read } : m));
    onUpdateMessages(updated);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('Delete this client message?')) {
      onUpdateMessages(messages.filter((m) => m.id !== id));
      showToast('Message deleted');
    }
  };

  // Profile operations
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ ...profile });
    showToast('Profile updated in Cloud database');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ ...profile, avatar: reader.result as string });
        showToast('Profile photo updated');
      }
    };
    reader.readAsDataURL(file);
  };

  // Settings operations
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ ...settings });
    showToast('Website settings saved to Cloud');
  };

  const handleUpdateMasterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyUpdateResult(null);
    try {
      const res = await fetch('/api/auth/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentKey: currentKeyInput.trim(),
          newKey: newKeyInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateSettings({ ...settings, masterKey: newKeyInput.trim() });
        setKeyUpdateResult({ success: true, message: data.message });
        setCurrentKeyInput('');
        setNewKeyInput('');
        showToast('Master Key updated for all devices');
      } else {
        setKeyUpdateResult({ success: false, message: data.message || 'Update failed' });
      }
    } catch {
      setKeyUpdateResult({ success: false, message: 'Server communication error' });
    }
  };

  const handleTestSupabase = async () => {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
      alert('Please enter both Supabase Project URL and Public Anon Key first.');
      return;
    }
    setTestingSupabase(true);
    setSupabaseTestResult(null);
    const result = await testSupabaseConnection(settings.supabaseUrl, settings.supabaseAnonKey);
    setTestingSupabase(false);
    setSupabaseTestResult(result);
  };

  const handleExportData = () => {
    const data = {
      properties,
      bookings,
      messages,
      profile,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yama_on_property_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  };

  // Direct Admin URL Link helpers
  const adminDirectUrl = `${window.location.origin}/#admin`;

  const copyAdminUrl = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    showToast('Admin direct link copied to clipboard!');
  };

  const shareToWhatsApp = () => {
    const msg = `Here is your YAMA ON PROPERTY Admin Console login link for your phone or laptop:\n${adminDirectUrl}\n\nMaster Key: ${settings.masterKey || '419@Yamaonproperty'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // -------------------------------------------------------------
  // If not authenticated, render Login Screen
  // -------------------------------------------------------------
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071224] via-[#0b1930] to-[#132743] flex items-center justify-center p-4">
        {toastMsg && (
          <div className="fixed bottom-6 right-6 bg-[#0b1930] text-[#e7b95f] px-5 py-3 rounded-xl shadow-2xl border border-[#e7b95f]/30 z-50 text-xs font-bold">
            {toastMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Yama_On_Property_Logo_fba4d8d2.png"
              alt="YAMA ON PROPERTY Logo"
              className="h-14 w-auto object-contain drop-shadow-md"
            />
            <div>
              <span className="font-black text-[#0b1930] text-xl block leading-tight">
                YAMA
              </span>
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#c99535] uppercase">
                ON PROPERTY · ADMIN
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1930] tracking-tight">
              Sign In to Admin
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Log in to manage properties, bookings, and inquiries from any phone, tablet, or laptop.
            </p>
          </div>

          {/* Toggle Method: Master Key or Admin Email */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('masterKey');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                loginMethod === 'masterKey'
                  ? 'bg-white text-[#0b1930] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Key
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                loginMethod === 'email'
                  ? 'bg-white text-[#0b1930] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Email
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMethod === 'email' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="admin@yamaonproperty.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="admin-master-key"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                {loginMethod === 'masterKey' ? 'Master Key' : 'Admin Password / Key'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="admin-master-key"
                  name="masterKey"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter key"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 leading-snug">
                  {loginError}
                </p>
              )}
            </div>

            {/* Remember Device Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="rounded text-[#c99535] focus:ring-[#c99535] w-4 h-4 cursor-pointer"
              />
              <span>Remember this phone / laptop</span>
            </label>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#0b1930] hover:bg-[#132743] text-[#e7b95f] font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Device...
                </>
              ) : (
                'Enter Admin Dashboard'
              )}
            </button>
          </form>

          {/* Device helper note */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Smartphone className="w-3.5 h-3.5 text-[#c99535]" />
              <Laptop className="w-3.5 h-3.5 text-[#c99535]" />
              <span>Multi-Device Cloud Access</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              You can log in on any smartphone, tablet, or PC. Your listings and edits sync across all devices via the cloud.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onCloseAdmin}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Filtered properties for listings table
  // -------------------------------------------------------------
  const filteredListings = properties.filter((p) => {
    if (!p) return false;
    const q = (searchTerm || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const typ = (p.type || '').toLowerCase();
    return (
      title.includes(q) ||
      loc.includes(q) ||
      cat.includes(q) ||
      typ.includes(q)
    );
  });

  const availableCount = properties.filter(
    (p) => p.status === 'Available' && p.purpose === 'For Sale'
  ).length;
  const rentCount = properties.filter(
    (p) => p.status === 'Available' && p.purpose === 'For Rent'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased text-slate-900">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#0b1930] text-[#e7b95f] px-5 py-3 rounded-xl shadow-2xl border border-[#e7b95f]/30 z-50 text-xs font-bold animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#0b1930] text-white flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Yama_On_Property_Logo_fba4d8d2.png"
              alt="YAMA ON PROPERTY Logo"
              className="h-10 w-auto object-contain rounded-xl bg-white/10 p-1 border border-white/15"
            />
            <div>
              <span className="font-black text-white text-base block leading-tight">
                YAMA
              </span>
              <span className="text-[9px] tracking-[0.25em] font-extrabold text-[#c99535] uppercase">
                ON PROPERTY ADMIN
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'overview'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="font-bold">Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('traffic');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'traffic'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 text-[#e7b95f]" />
            <div className="flex items-center justify-between flex-1">
              <span className="font-bold">Site Traffic & Visitors</span>
              <span className="bg-emerald-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                {visitorStats?.totalVisitors || 0}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('listings');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'listings'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <div className="flex items-center justify-between flex-1">
              <span>Property Listings</span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {properties.length}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveTab('add');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'add'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Upload Property</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('bookings');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'bookings'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <div className="flex items-center justify-between flex-1">
              <span>Bookings & Inquiries</span>
              {bookings.length > 0 && (
                <span className="bg-[#e7b95f] text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  {bookings.length}
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('messages');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'messages'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <div className="flex items-center justify-between flex-1">
              <span>Client Messages</span>
              {messages.filter((m) => !m.read).length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {messages.filter((m) => !m.read).length}
                </span>
              )}
            </div>
          </button>

          {/* New Multi-Device Hub tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('devices');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'devices'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Devices & Access</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('storage');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'storage'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <div className="flex items-center justify-between flex-1">
              <span>Cloud & Storage</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  storageStatus.cloudConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors cursor-pointer text-left ${
              activeTab === 'settings'
                ? 'bg-[#c99535] text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Website Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onCloseAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#e7b95f]" />
            <span>View Public Website</span>
          </button>

          <button
            type="button"
            onClick={onAdminLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b1930] leading-snug">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'traffic' && 'Site Traffic & Visitor Analytics'}
                {activeTab === 'listings' && 'Property Listings'}
                {activeTab === 'add' && (editingPropertyId ? 'Edit Property' : 'Upload Property')}
                {activeTab === 'bookings' && 'Bookings & Inspection Requests'}
                {activeTab === 'messages' && 'Client Messages & Inquiries'}
                {activeTab === 'devices' && 'Access on Any Phone or Laptop'}
                {activeTab === 'storage' && 'Cloud & Local Storage Engine'}
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'settings' && 'Website Settings'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>YAMA ON PROPERTY Control Panel</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-1 font-semibold text-emerald-700">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Cloud Storage Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={async () => {
                await onTriggerSync();
                showToast('Cloud and local storage synchronized');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Sync Cloud and Local storage"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#c99535] ${
                  storageStatus.syncing ? 'animate-spin' : ''
                }`}
              />
              <span>{storageStatus.syncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('devices')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#b38228] border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Open on phone or laptop"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open on Phone</span>
            </button>

            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 cursor-pointer group p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <img
                src={
                  profile.avatar && !profile.avatar.includes('unsplash')
                    ? profile.avatar
                    : '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png'
                }
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#c99535]"
              />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Multi-Device Banner */}
              <div className="bg-gradient-to-r from-[#0b1930] to-[#132743] text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-[#e7b95f] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      Admin Access from Any Phone or Laptop
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Bookmark or share your direct admin link to manage properties on the go.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyAdminUrl}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => setActiveTab('devices')}
                    className="bg-[#c99535] hover:bg-[#b38228] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    View QR & Setup
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Properties
                  </span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b1930] mt-1 block">
                    {properties.length}
                  </strong>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    In Cloud database
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    For Sale
                  </span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b1930] mt-1 block">
                    {availableCount}
                  </strong>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    Published inventory
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    For Rent / Lease
                  </span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b1930] mt-1 block">
                    {rentCount}
                  </strong>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    Published inventory
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Inspection Requests
                  </span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#c99535] mt-1 block">
                    {bookings.length}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Client requests
                  </span>
                </div>
              </div>

              {/* Traffic & Visitors Spotlight Card */}
              <div className="bg-gradient-to-r from-[#0b1930] via-[#132743] to-[#071224] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-[#e7b95f]">
                        Audience Traffic Analytics
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {visitorStats?.totalVisitors || 0} Total Site Visitors · {visitorStats?.todayVisitors || 0} Today
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                      {visitorStats?.totalPageViews || 0} total pageviews recorded across mobile, tablet, and desktop devices.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('traffic')}
                  className="bg-[#c99535] hover:bg-[#b38228] text-white font-black text-xs sm:text-sm py-3 px-5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Visitor Analytics</span>
                </button>
              </div>

              {/* Action Banner */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-[#0b1930]">Upload a Property</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Take photos with your phone or select files from your computer.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  ＋ Upload Property
                </button>
              </div>

              {/* Recent Properties Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-extrabold text-[#0b1930] text-sm">
                    Recent Properties
                  </h3>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs font-bold text-[#c99535] hover:underline cursor-pointer"
                  >
                    View all listings →
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                    <p>No properties uploaded yet.</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('add');
                      }}
                      className="text-[#c99535] font-bold underline cursor-pointer"
                    >
                      Click here to upload your first property listing
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Purpose</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {properties.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                              <div className="text-[11px] text-slate-500">{p.location}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0b1930]">
                              {formatMoney(p.price, settings.currency)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                                {p.purpose}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'Available'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => startEditProperty(p)}
                                className="text-slate-600 hover:text-[#c99535] font-bold text-xs p-1 cursor-pointer"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SITE TRAFFIC & VISITORS */}
          {/* ========================================================= */}
          {activeTab === 'traffic' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-r from-[#071224] via-[#0b1930] to-[#132743] text-white p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#e7b95f]">
                      Real-time Audience Analytics
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      Site Visitors & Client Traffic
                    </h3>
                    <p className="text-sm text-slate-300 mt-1 font-medium">
                      Live tracking of visitors browsing YAMA ON PROPERTY from phones, tablets, and computers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Tracking Active
                  </span>
                </div>
              </div>

              {/* 4 Visitor Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Total Site Visitors
                  </span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b1930] mt-2 block">
                    {visitorStats?.totalVisitors || 0}
                  </strong>
                  <span className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Unique client visits
                  </span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Today's Visitors
                  </span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#c99535] mt-2 block">
                    {visitorStats?.todayVisitors || 0}
                  </strong>
                  <span className="text-xs text-slate-500 font-bold mt-1 block">
                    Active today
                  </span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Total Pageviews
                  </span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b1930] mt-2 block">
                    {visitorStats?.totalPageViews || 0}
                  </strong>
                  <span className="text-xs text-slate-500 font-bold mt-1 block">
                    Property impressions
                  </span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Unique Sessions
                  </span>
                  <strong className="text-3xl sm:text-4xl font-black text-indigo-900 mt-2 block">
                    {visitorStats?.uniqueSessions || 0}
                  </strong>
                  <span className="text-xs text-slate-500 font-bold mt-1 block">
                    Engaged sessions
                  </span>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h4 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Visitor Device Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <Smartphone className="w-9 h-9 text-[#c99535]" />
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Mobile Phones</span>
                      <strong className="text-2xl font-black text-slate-900">
                        {visitorStats?.deviceBreakdown?.mobile || 0}
                      </strong>
                      <span className="text-xs text-slate-500 block">visits recorded</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <Laptop className="w-9 h-9 text-[#0b1930]" />
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Laptops & PCs</span>
                      <strong className="text-2xl font-black text-slate-900">
                        {visitorStats?.deviceBreakdown?.desktop || 0}
                      </strong>
                      <span className="text-xs text-slate-500 block">visits recorded</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <Smartphone className="w-9 h-9 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Tablets & iPads</span>
                      <strong className="text-2xl font-black text-slate-900">
                        {visitorStats?.deviceBreakdown?.tablet || 0}
                      </strong>
                      <span className="text-xs text-slate-500 block">visits recorded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Visitor Activity Table */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h4 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Live Visitor Activity Log
                </h4>
                {(!visitorStats?.recentVisits || visitorStats.recentVisits.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 font-medium text-sm">
                    No visitor events recorded yet. When clients visit the website, their activity will appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                        <tr>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Device</th>
                          <th className="py-3 px-4">Page / Route</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {visitorStats.recentVisits.slice(0, 20).map((visit) => (
                          <tr key={visit.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-bold text-slate-900">{visit.timestamp}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                {visit.device === 'Mobile' ? (
                                  <Smartphone className="w-3.5 h-3.5 text-[#c99535]" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-[#0b1930]" />
                                )}
                                {visit.device}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{visit.page || 'Homepage'}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                Online Session
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: DEVICES & MULTI-DEVICE ACCESS */}
          {/* ========================================================= */}
          {activeTab === 'devices' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">
                  Log In on Every Phone or Laptop
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow these simple steps to access your admin console from any smartphone, tablet, or computer.
                </p>
              </div>

              {/* Direct Access Box */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0b1930] text-[#e7b95f] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0b1930] text-sm">
                      Your Direct Admin URL
                    </h4>
                    <p className="text-xs text-slate-500">
                      Open this address on any mobile browser (Safari, Chrome) or desktop laptop:
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={adminDirectUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={copyAdminUrl}
                    className="bg-[#0b1930] hover:bg-[#132743] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#e7b95f]" />
                    Copy Link
                  </button>
                  <button
                    onClick={shareToWhatsApp}
                    className="bg-[#128c4a] hover:bg-[#0d733c] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Send to WhatsApp
                  </button>
                </div>
              </div>

              {/* Master Key Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#c99535]" />
                    Current Admin Master Key
                  </h4>
                  <div className="p-3 bg-slate-100 rounded-xl font-mono text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>{settings.masterKey || '419@Yamaonproperty'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(settings.masterKey || '419@Yamaonproperty');
                        showToast('Master Key copied!');
                      }}
                      className="text-xs font-semibold text-[#c99535] hover:underline cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Enter this master key when signing in from your phone, laptop, or home computer.
                  </p>
                </div>

                {/* Change Master Key Card */}
                <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Change Master Key Across All Devices
                  </h4>
                  <form onSubmit={handleUpdateMasterKey} className="space-y-3 text-xs">
                    <div>
                      <input
                        type="password"
                        required
                        placeholder="Current Master Key"
                        value={currentKeyInput}
                        onChange={(e) => setCurrentKeyInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        required
                        placeholder="New Master Key (min 6 chars)"
                        value={newKeyInput}
                        onChange={(e) => setNewKeyInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#c99535] hover:bg-[#b38228] text-white font-bold py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Update Key in Cloud
                    </button>
                    {keyUpdateResult && (
                      <div
                        className={`text-[11px] p-2 rounded-lg font-semibold ${
                          keyUpdateResult.success
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {keyUpdateResult.message}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800">Tips for using on your phone:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600">
                  <li>
                    <b>iPhone / Safari:</b> Tap the <i>Share</i> button at the bottom of Safari and select <i>"Add to Home Screen"</i>. It will appear as an app icon on your home screen!
                  </li>
                  <li>
                    <b>Android / Chrome:</b> Tap the <i>three dots (⋮)</i> menu and select <i>"Add to Home screen"</i> or <i>"Install App"</i>.
                  </li>
                  <li>
                    Check the <i>"Remember this phone / laptop"</i> checkbox upon logging in so you stay logged in.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: LISTINGS */}
          {/* ========================================================= */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, location or category..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Upload Property
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Photo</th>
                        <th className="py-3.5 px-4">Property</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Category / Type</th>
                        <th className="py-3.5 px-4">Availability</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredListings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-500">
                            {properties.length === 0
                              ? 'No properties in your catalog yet. Click "Upload Property" to add your first listing.'
                              : 'No properties matched your search filter.'}
                          </td>
                        </tr>
                      ) : (
                        filteredListings.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-200"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 max-w-xs truncate">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-500">{p.location}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0b1930]">
                              {formatMoney(p.price, settings.currency)}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div>{p.category}</div>
                              <div className="text-[10px] text-slate-400">{p.type}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  p.status === 'Available'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => handleToggleAvailability(p.id)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                {p.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                              </button>
                              <button
                                onClick={() => startEditProperty(p)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(p.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer inline-block align-middle"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: UPLOAD / EDIT PROPERTY */}
          {/* ========================================================= */}
          {activeTab === 'add' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0b1930]">
                    {editingPropertyId ? 'Edit Property Listing' : 'Upload a Property'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saved directly to Cloud Storage and synchronized on all your devices.
                  </p>
                </div>
                {editingPropertyId && (
                  <button
                    onClick={resetForm}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Cancel editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProperty} className="space-y-6 text-xs font-medium text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={propForm.title || ''}
                      onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                      placeholder="e.g. 4-Bedroom Detached Duplex with Swimming Pool"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Category *
                    </label>
                    <select
                      value={propForm.category || 'Residential'}
                      onChange={(e) => setPropForm({ ...propForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                    >
                      <option>Residential</option>
                      <option>Luxury Homes</option>
                      <option>Affordable Housing</option>
                      <option>New Developments</option>
                      <option>Commercial</option>
                      <option>Office & Retail</option>
                      <option>Industrial</option>
                      <option>Land & Plots</option>
                      <option>Agricultural</option>
                      <option>Short Let & Holiday</option>
                      <option>Hospitality</option>
                      <option>Investment Properties</option>
                      <option>Mixed Use</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      House / Property Type *
                    </label>
                    <select
                      value={propForm.type || 'Detached House'}
                      onChange={(e) => setPropForm({ ...propForm, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                    >
                      <option>Detached House</option>
                      <option>Semi-Detached House</option>
                      <option>Terrace Duplex</option>
                      <option>Block of Flats</option>
                      <option>Duplex</option>
                      <option>Terrace House</option>
                      <option>Townhouse</option>
                      <option>Bungalow</option>
                      <option>Mansion</option>
                      <option>Villa</option>
                      <option>Apartment</option>
                      <option>Penthouse</option>
                      <option>Dry Land</option>
                      <option>Waterfront Land</option>
                      <option>Land with C of O</option>
                      <option>Office Space</option>
                      <option>Shop / Retail</option>
                      <option>Warehouse</option>
                      <option>Mixed-use Building</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Listing Purpose *
                    </label>
                    <select
                      value={propForm.purpose || 'For Sale'}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          purpose: e.target.value as Property['purpose'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                    >
                      <option>For Sale</option>
                      <option>For Rent</option>
                      <option>For Lease</option>
                      <option>Short Let</option>
                      <option>For Sale or Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Price (₦ Base Amount) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={propForm.price || ''}
                      onChange={(e) =>
                        setPropForm({ ...propForm, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="e.g. 150000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Location / Neighborhood *
                    </label>
                    <input
                      type="text"
                      required
                      value={propForm.location || ''}
                      onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                      placeholder="e.g. Lekki Phase 1, Lagos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={propForm.beds ?? 4}
                        onChange={(e) =>
                          setPropForm({ ...propForm, beds: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={propForm.baths ?? 4}
                        onChange={(e) =>
                          setPropForm({ ...propForm, baths: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={propForm.status || 'Available'}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          status: e.target.value as Property['status'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                    >
                      <option>Available</option>
                      <option>Reserved</option>
                      <option>Unavailable</option>
                      <option>Sold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      WhatsApp Routing for this Property
                    </label>
                    <input
                      type="text"
                      value={propForm.whatsapp || ''}
                      onChange={(e) => setPropForm({ ...propForm, whatsapp: e.target.value })}
                      placeholder="e.g. 2348031234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Multi-Photo & Video Upload Section */}
                <div className="space-y-6 pt-5 border-t border-slate-200">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Images className="w-4 h-4 text-[#c99535]" />
                      Property Photo Gallery (Multi-Photo Upload)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select multiple photos at once from your phone or computer. The first photo will be the main listing cover.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Multi-File Upload Input */}
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#c99535] transition-colors">
                      <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#c99535]" />
                        Upload Multiple Photos (Batch)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          disabled={isUploadingPhotos}
                          accept="image/*"
                          onChange={handleMultiPhotoUpload}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0b1930] file:text-[#e7b95f] hover:file:bg-[#132743] file:cursor-pointer cursor-pointer disabled:opacity-50"
                        />
                        {isUploadingPhotos && (
                          <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#c99535]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Optimizing and compressing photos...</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-2 block">
                        Tip: You can select multiple photos simultaneously. Automatically optimized for fast loading.
                      </span>
                    </div>

                    {/* Add Photo by URL */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-xs font-black text-slate-800 mb-1.5">
                        Or Add Photo by Web URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535]"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Photo Gallery Grid */}
                  {propForm.images && propForm.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Gallery Photos ({propForm.images.length} photos added)</span>
                        <span className="text-[11px] text-[#c99535] font-semibold">
                          Click star to set as main cover
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {propForm.images.map((img, idx) => {
                          const isCover = (propForm.image || propForm.images?.[0]) === img;
                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-2xl overflow-hidden border-2 aspect-4/3 bg-slate-100 ${
                                isCover ? 'border-[#c99535] ring-2 ring-[#c99535]/30' : 'border-slate-200'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {isCover && (
                                <span className="absolute top-1.5 left-1.5 bg-[#c99535] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                                  Cover
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverImage(img)}
                                    className="p-1.5 bg-[#c99535] text-white rounded-lg hover:bg-[#b38228] transition-colors"
                                    title="Set as Cover Photo"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Property Video Walkthrough Upload */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Film className="w-4 h-4 text-rose-600" />
                        Property Walkthrough Video
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Upload a video walkthrough file from your phone/computer or paste a YouTube / MP4 video link.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Video File Upload */}
                      <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-rose-500 transition-colors">
                        <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-rose-600" />
                          Upload Video File (MP4, WebM, MOV)
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-rose-600 file:text-white hover:file:bg-rose-700 file:cursor-pointer cursor-pointer"
                        />
                      </div>

                      {/* Video Link */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="block text-xs font-black text-slate-800 mb-1.5">
                          Or Paste Video URL (YouTube, Vimeo, MP4)
                        </label>
                        <input
                          type="url"
                          value={propForm.videoUrl || ''}
                          onChange={(e) => setPropForm({ ...propForm, videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* Live Video Preview in Form */}
                    {propForm.videoUrl && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5" />
                            Live Video Preview
                          </span>
                          <button
                            type="button"
                            onClick={() => setPropForm({ ...propForm, videoUrl: '' })}
                            className="text-xs text-rose-300 hover:text-white font-bold cursor-pointer"
                          >
                            Remove Video
                          </button>
                        </div>
                        <div className="h-56 sm:h-72 w-full rounded-xl overflow-hidden bg-black">
                          {propForm.videoUrl.includes('youtube.com') || propForm.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={
                                propForm.videoUrl.includes('youtu.be/')
                                  ? `https://www.youtube.com/embed/${propForm.videoUrl.split('youtu.be/')[1].split('?')[0]}`
                                  : `https://www.youtube.com/embed/${propForm.videoUrl.split('watch?v=')[1]?.split('&')[0]}`
                              }
                              title="Property Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; encrypted-media; gyroscope"
                            />
                          ) : (
                            <video
                              src={propForm.videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Plan */}
                <div className="space-y-4 pt-3 border-t border-slate-200 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#c99535]" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                          Flexible Payment Plan Configuration
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Configure installment duration from 1 month to 100 months, or enter custom terms.
                      </p>
                    </div>

                    <select
                      value={propForm.flexible || 'yes'}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          flexible: e.target.value as 'yes' | 'no',
                        })
                      }
                      className="bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 cursor-pointer shadow-xs"
                    >
                      <option value="yes">Enable Flexible Plan</option>
                      <option value="no">Outright Payment Only</option>
                    </select>
                  </div>

                  {propForm.flexible === 'yes' && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Initial Deposit (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={propForm.deposit ?? 30}
                              onChange={(e) => {
                                const dep = Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), 100);
                                setPropForm({
                                  ...propForm,
                                  deposit: dep,
                                  balance: 100 - dep,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535]"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                          </div>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {[10, 20, 30, 40, 50].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() =>
                                  setPropForm({
                                    ...propForm,
                                    deposit: pct,
                                    balance: 100 - pct,
                                  })
                                }
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                                  propForm.deposit === pct
                                    ? 'bg-[#0b1930] text-[#e7b95f]'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Duration (1 to 100 Months)
                          </label>
                          <select
                            value={
                              propForm.duration && propForm.duration.match(/^\d+\s+months?$/i)
                                ? propForm.duration.toLowerCase()
                                : (propForm.duration ? 'custom' : '12 months')
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                setPropForm({
                                  ...propForm,
                                  duration: propForm.duration || 'Custom Plan (Milestone terms)',
                                });
                              } else {
                                setPropForm({
                                  ...propForm,
                                  duration: val,
                                });
                              }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] cursor-pointer"
                          >
                            <optgroup label="Popular Milestones">
                              <option value="1 month">1 month (Single Month)</option>
                              <option value="3 months">3 months (Quarterly)</option>
                              <option value="6 months">6 months (Biannual)</option>
                              <option value="12 months">12 months (1 Year)</option>
                              <option value="18 months">18 months (1.5 Years)</option>
                              <option value="24 months">24 months (2 Years)</option>
                              <option value="36 months">36 months (3 Years)</option>
                              <option value="48 months">48 months (4 Years)</option>
                              <option value="60 months">60 months (5 Years)</option>
                              <option value="72 months">72 months (6 Years)</option>
                              <option value="84 months">84 months (7 Years)</option>
                              <option value="96 months">96 months (8 Years)</option>
                              <option value="100 months">100 months (Maximum 8.3 Years)</option>
                            </optgroup>
                            <optgroup label="All Durations (1 to 100 Months)">
                              {Array.from({ length: 100 }, (_, i) => i + 1).map((m) => {
                                const unit = m === 1 ? 'month' : 'months';
                                const keyVal = `${m} ${unit}`;
                                return (
                                  <option key={m} value={keyVal}>
                                    {m} {unit}
                                  </option>
                                );
                              })}
                            </optgroup>
                            <option value="custom">✏️ Custom / Customize Duration...</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Balance (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={propForm.balance ?? 70}
                              onChange={(e) => {
                                const bal = Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), 100);
                                setPropForm({
                                  ...propForm,
                                  balance: bal,
                                  deposit: 100 - bal,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535]"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Auto-syncs with Initial Deposit
                          </span>
                        </div>
                      </div>

                      {/* Interactive Custom Duration / Stepper & Slider (1 to 100 Months) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#c99535]" />
                            <span>Duration Slider & Customizer (1 - 100 Months)</span>
                          </label>
                          <span className="text-xs font-black text-[#c99535] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Selected: {propForm.duration || '12 months'}
                          </span>
                        </div>

                        {/* Slider (1 to 100) */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-500 w-12">1 mo</span>
                            <input
                              type="range"
                              min={1}
                              max={100}
                              step={1}
                              value={(() => {
                                const match = (propForm.duration || '').match(/\d+/);
                                return match ? parseInt(match[0], 10) : 12;
                              })()}
                              onChange={(e) => {
                                const m = parseInt(e.target.value, 10);
                                setPropForm({
                                  ...propForm,
                                  duration: `${m} ${m === 1 ? 'month' : 'months'}`,
                                });
                              }}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c99535]"
                            />
                            <span className="text-[11px] font-black text-slate-500 w-14 text-right">100 mos</span>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Presets:</span>
                          {[1, 3, 6, 12, 18, 24, 36, 48, 60, 72, 84, 100].map((m) => {
                            const valStr = `${m} ${m === 1 ? 'month' : 'months'}`;
                            const isSelected = propForm.duration === valStr;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setPropForm({ ...propForm, duration: valStr })}
                                className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0b1930] text-[#e7b95f] shadow-xs ring-1 ring-[#c99535]'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {m} {m === 1 ? 'mo' : m === 100 ? 'mos (Max)' : 'mos'}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Text/Notes for Duration (Costum Costimize) */}
                        <div className="pt-2 border-t border-slate-100">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Custom Duration / Special Terms (Custom Costimize)
                          </label>
                          <input
                            type="text"
                            value={propForm.duration || ''}
                            onChange={(e) => setPropForm({ ...propForm, duration: e.target.value })}
                            placeholder="e.g. 100 months flexible spread, 36 months zero-interest, or 50% deposit + balance quarterly"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Live Calculation Preview Card for Admin */}
                      {Number(propForm.price) > 0 && (
                        <div className="bg-[#0b1930] text-white p-4 rounded-xl border border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#e7b95f]">
                            <span>Live Financial Breakdown (Price: {formatMoney(Number(propForm.price), 'NGN')})</span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-200">
                              Duration: {propForm.duration || '12 months'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                            <div className="bg-white/5 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">Initial Deposit ({propForm.deposit}%)</span>
                              <strong className="text-[#e7b95f] font-black text-sm">
                                {formatMoney((Number(propForm.price) * (Number(propForm.deposit) || 30)) / 100, 'NGN')}
                              </strong>
                            </div>

                            <div className="bg-white/5 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">Remaining Balance ({propForm.balance}%)</span>
                              <strong className="text-white font-black text-sm">
                                {formatMoney((Number(propForm.price) * (Number(propForm.balance) || 70)) / 100, 'NGN')}
                              </strong>
                            </div>

                            <div className="bg-white/5 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">Monthly Installment</span>
                              <strong className="text-emerald-400 font-black text-sm">
                                {(() => {
                                  const balanceAmount = (Number(propForm.price) * (Number(propForm.balance) || 70)) / 100;
                                  const match = (propForm.duration || '').match(/\d+/);
                                  const months = match ? parseInt(match[0], 10) : 12;
                                  return months > 0
                                    ? `~${formatMoney(balanceAmount / months, 'NGN')} / mo`
                                    : 'Custom Terms';
                                })()}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Features & Amenities
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeatureChip(featureInput);
                        }
                      }}
                      placeholder="Add amenity (e.g. Swimming Pool, 24/7 Security)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeatureChip(featureInput)}
                      className="px-4 py-2.5 bg-[#0b1930] hover:bg-[#132743] text-white font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {propForm.features && propForm.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {propForm.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-[#0b1930] text-[#e7b95f] text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {feat}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureChip(idx)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Property Description
                  </label>
                  <textarea
                    rows={4}
                    value={propForm.description || ''}
                    onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                    placeholder="Describe architectural highlights, finishes, landmark proximity, title documents..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {editingPropertyId ? 'Save Changes' : 'Publish Property'}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-5 rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: BOOKINGS */}
          {/* ========================================================= */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">
                  Inspection Requests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized across all phones and laptops via Cloud Storage.
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No inspection requests currently in the database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Property</th>
                        <th className="py-3 px-4">Slot</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.name}
                            <div className="text-[11px] font-normal text-slate-500">{b.email}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 font-semibold">
                            {b.property}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{b.date}</div>
                            <div className="text-[10px] text-slate-400">{b.time}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {b.phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleUpdateBookingStatus(
                                  b.id,
                                  e.target.value as Booking['status']
                                )
                              }
                              className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border cursor-pointer ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : b.status === 'Contacted'
                                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                                  : 'bg-amber-50 border-amber-300 text-amber-800'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {b.phone && (
                              <a
                                href={`https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${b.name}, this is YAMA ON PROPERTY regarding your inspection request.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-[#128c4a] hover:bg-[#0d733c] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                              >
                                <MessageCircle className="w-3 h-3" />
                                WhatsApp
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer align-middle"
                              title="Delete booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: MESSAGES */}
          {/* ========================================================= */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">Client Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct questions submitted from property pages.
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No client messages in the database.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-colors ${
                        m.read
                          ? 'bg-white border-slate-200'
                          : 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">{m.name}</strong>
                          <span className="text-[11px] text-slate-500">· {m.contact}</span>
                          <span className="text-[11px] text-slate-400">· {m.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleMessageRead(m.id)}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                          >
                            {m.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-[#c99535] mb-2">
                        Property: {m.property}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-100">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CLOUD & STORAGE */}
          {/* ========================================================= */}
          {activeTab === 'storage' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">
                  Cloud & Local Storage Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage cloud synchronization, server persistence, and optional Supabase connection.
                </p>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    Cloud Server API
                  </div>
                  <strong className="text-sm text-emerald-950 block">
                    {storageStatus.cloudConnected ? 'Active & Persistent' : 'Connecting...'}
                  </strong>
                  <span className="text-[11px] text-emerald-700 mt-1 block">
                    Data persists across all devices
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-1">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    This Device Storage
                  </div>
                  <strong className="text-sm text-blue-950 block">
                    Mirrored & Offline-Ready
                  </strong>
                  <span className="text-[11px] text-blue-700 mt-1 block">
                    Cached in browser localStorage
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-800 font-bold text-xs mb-1">
                    <Database className="w-4 h-4 text-purple-600" />
                    Supabase Cloud
                  </div>
                  <strong className="text-sm text-purple-950 block">
                    {settings.supabaseUrl ? 'Configured' : 'Optional / Standby'}
                  </strong>
                  <span className="text-[11px] text-purple-700 mt-1 block">
                    External database support
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Dual-Direction Synchronization
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Last synchronized: {storageStatus.lastSynced || 'Active'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await onTriggerSync();
                    showToast('Cloud and local storage synchronized');
                  }}
                  className="bg-[#0b1930] hover:bg-[#132743] text-[#e7b95f] font-bold text-xs py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${storageStatus.syncing ? 'animate-spin' : ''}`} />
                  Sync Cloud & Local Now
                </button>
              </div>

              {/* Supabase Configuration Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Supabase Cloud Project (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Connect an external Supabase database project for additional multi-device cloud storage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={settings.supabaseUrl || ''}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, supabaseUrl: e.target.value })
                      }
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Supabase Public Anon Key
                    </label>
                    <input
                      type="password"
                      value={settings.supabaseAnonKey || ''}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, supabaseAnonKey: e.target.value })
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={testingSupabase}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    {testingSupabase ? 'Testing...' : 'Test Supabase Connection'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Save Cloud Config
                  </button>
                </div>

                {supabaseTestResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      supabaseTestResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                    }`}
                  >
                    {supabaseTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{supabaseTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Data Utilities */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Data Utilities & Backup
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Full Backup (JSON)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to clear all properties, bookings, and messages from both cloud and local storage?'
                        )
                      ) {
                        onClearAllData();
                        showToast('All data cleared');
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All Catalog Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: PROFILE SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">Profile Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update administrator identity and contact info.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-medium text-slate-700">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200">
                  <img
                    src={
                      profile.avatar && !profile.avatar.includes('unsplash')
                        ? profile.avatar
                        : '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png'
                    }
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#c99535] shadow-md"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <label className="inline-block bg-[#0b1930] hover:bg-[#132743] text-[#e7b95f] font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                      Managing Director & Consultant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name || 'Mr Yaseer Mustapha Aliyu'}
                      onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                      placeholder="Mr Yaseer Mustapha Aliyu"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                      Role / Executive Title
                    </label>
                    <input
                      type="text"
                      value={profile.role || 'Managing Director & Principal Consultant'}
                      onChange={(e) => onUpdateProfile({ ...profile, role: e.target.value })}
                      placeholder="Managing Director & Principal Consultant"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                      Business Phone Line
                    </label>
                    <input
                      type="tel"
                      value={profile.phone || '+234 803 555 0192'}
                      onChange={(e) => onUpdateProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  {/* Customizable Principal Consultant WhatsApp Number */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                    <label className="block text-xs font-black text-emerald-950 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Principal Consultant WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={profile.whatsapp !== undefined ? profile.whatsapp : (profile.phone || '+234 803 555 0192')}
                      onChange={(e) => onUpdateProfile({ ...profile, whatsapp: e.target.value })}
                      placeholder="+234 803 555 0192"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2.5 text-sm font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-emerald-800 font-semibold mt-1.5">
                      All client consultation buttons across the website (Hero, About, and Floating Chat) route to this WhatsApp number.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => onUpdateProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                      Professional Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: WEBSITE SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1930]">Website Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure business contact numbers, default currency, and master security key.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-medium text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Main Business Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => onUpdateSettings({ ...settings, phone: e.target.value })}
                      placeholder="+234..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => onUpdateSettings({ ...settings, email: e.target.value })}
                      placeholder="info@yamaonproperty.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Default Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, currency: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                    >
                      {CURRENCY_LIST.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Public Office Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => onUpdateSettings({ ...settings, address: e.target.value })}
                      placeholder="City, State, Country"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Admin Master Key
                    </label>
                    <input
                      type="password"
                      value={settings.masterKey || '419@Yamaonproperty'}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, masterKey: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Footer Introduction
                    </label>
                    <textarea
                      rows={2}
                      value={settings.footerIntro}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, footerIntro: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
