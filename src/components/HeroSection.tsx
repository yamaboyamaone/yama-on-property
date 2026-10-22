import React from 'react';
import { Search, CheckCircle2, MessageCircle, ArrowUpRight, Award, ShieldCheck, Phone } from 'lucide-react';
import { Profile } from '../types';

interface HeroSectionProps {
  searchName: string;
  onSearchNameChange: (val: string) => void;
  searchLocation: string;
  onSearchLocationChange: (val: string) => void;
  searchType: string;
  onSearchTypeChange: (val: string) => void;
  searchPurpose: string;
  onSearchPurposeChange: (val: string) => void;
  currentCurrency: string;
  onCurrencyChange: (val: string) => void;
  onExecuteSearch: () => void;
  profile?: Profile;
  businessPhone?: string;
  onConsultantClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchName,
  onSearchNameChange,
  searchLocation,
  onSearchLocationChange,
  searchType,
  onSearchTypeChange,
  searchPurpose,
  onSearchPurposeChange,
  onExecuteSearch,
  profile,
  businessPhone,
  onConsultantClick,
}) => {
  const avatarUrl =
    profile?.avatar && !profile.avatar.includes('unsplash')
      ? profile.avatar
      : '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png';
  const consultantName = profile?.name || 'Mr Yaseer Mustapha Aliyu';
  const consultantRole = profile?.role || 'Managing Director & Principal Consultant';
  // Admin customizable consultant WhatsApp number
  const consultantWhatsapp =
    profile?.whatsapp || profile?.phone || businessPhone || '+234 803 555 0192';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onExecuteSearch();
    }
  };

  const handleWhatsAppConsultant = () => {
    const rawNumber = consultantWhatsapp.replace(/\D/g, '');
    let cleanPhone = rawNumber;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.slice(1);
    }
    const message = `Hello ${consultantName}, I visited the YAMA ON PROPERTY website and would like personalized property consultation regarding verified listings.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[660px] bg-[#071224] text-white flex items-center overflow-hidden">
      {/* Background with luxury architectural overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000 ease-out opacity-45"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071224] via-[#0b1930]/95 to-[#0b1930]/80 z-10" />

      {/* Decorative golden ambient glows */}
      <div className="absolute -top-32 right-10 w-96 h-96 bg-[#c99535]/25 rounded-full blur-3xl pointer-events-none z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#e7b95f]/15 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-22 w-full space-y-10">
        
        {/* Top Split: Headline on Left, Executive Founder Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Mission */}
          <div className="lg:col-span-7 space-y-5">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#c99535]/20 border border-[#e7b95f]/30 text-[#e7b95f] text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e7b95f] animate-pulse"></span>
              Verified Real Estate & Property Advisory
            </div>

            {/* Main Headline (Bold, Medium-Large Premium Minimalist) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Find a place <br className="hidden sm:inline" />
              to call <span className="text-[#e7b95f] italic font-serif-luxury font-normal">home.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-200 text-base sm:text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Discover verified luxury homes, prime dry lands and high-yield real estate investments with transparent title documents, milestone payment structures, and direct principal guidance.
            </p>

            {/* Key trust badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-200">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#e7b95f]" />
                <span className="font-bold text-white">100% Title Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shadow-sm">
                <Award className="w-5 h-5 text-[#e7b95f]" />
                <span className="font-bold text-white">Direct Principal Advisory</span>
              </div>
            </div>
          </div>

          {/* Right Column: Founder & Principal Consultant Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative group bg-gradient-to-b from-[#0b1930]/90 to-[#071224]/90 backdrop-blur-2xl border-2 border-[#e7b95f]/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden hover:border-[#e7b95f] transition-all duration-300">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-[#c99535]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Photo with Luxury Ring & Active Beacon */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-[#e7b95f] shadow-2xl bg-[#0b1930] ring-4 ring-[#e7b95f]/30">
                    <img
                      src={avatarUrl}
                      alt={consultantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Online Beacon */}
                  <div
                    className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-[#0b1930] shadow-md flex items-center justify-center"
                    title="Active Lead Consultant"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white block animate-ping opacity-75" />
                  </div>
                </div>

                {/* Consultant Info & Actions */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7b95f]/20 text-[#e7b95f] text-xs font-black uppercase tracking-wider">
                    <span>Leadership Spotlight</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {consultantName}
                  </h3>

                  <p className="text-sm font-bold text-[#e7b95f]">
                    {consultantRole}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Personalized guidance on verified luxury properties, installment structures, and physical tour accompaniment.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppConsultant}
                      className="bg-[#128c4a] hover:bg-[#0d733c] text-white text-xs sm:text-sm font-extrabold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp {consultantName.split(' ')[0]}</span>
                    </button>

                    {onConsultantClick && (
                      <button
                        type="button"
                        onClick={onConsultantClick}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-white/15"
                      >
                        <span>View Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Field Search Panel (Premium Minimalist, Bold & Medium Fonts) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Field 1: Property Name / Keyword */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Property Name or Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => onSearchNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Detached Mansion, Lekki, Ikoyi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Field 2: Location */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => onSearchLocationChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="City, area or neighborhood"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Field 3: Property Type */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Property Type
              </label>
              <select
                value={searchType}
                onChange={(e) => onSearchTypeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm sm:text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">All property types</option>
                <option value="Detached House">Detached House</option>
                <option value="Terrace Duplex">Terrace Duplex</option>
                <option value="Block of Flats">Block of Flats</option>
                <option value="Duplex">Duplex</option>
                <option value="Apartment">Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Terrace House">Terrace House</option>
                <option value="Dry Land">Land / Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Field 4: Listing Purpose */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Listing Purpose
              </label>
              <select
                value={searchPurpose}
                onChange={(e) => onSearchPurposeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm sm:text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Rent or Sale</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="Short Let">Short Let</option>
                <option value="For Lease">For Lease</option>
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                type="button"
                onClick={onExecuteSearch}
                className="w-full bg-[#c99535] hover:bg-[#b38228] text-white font-extrabold text-sm sm:text-base h-[48px] rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-200 font-semibold">
          <div
            onClick={onConsultantClick}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-white/20 transition-colors"
          >
            <img
              src={avatarUrl}
              alt={consultantName}
              className="w-7 h-7 rounded-full object-cover border-2 border-[#e7b95f]"
            />
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Advisory led by {consultantName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#e7b95f]" />
            <span>Verified Title Check</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#e7b95f]" />
            <span>Structured Milestone Plans</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#e7b95f]" />
            <span>Physical & Video Tour Booking</span>
          </div>
        </div>

      </div>
    </section>
  );
};
