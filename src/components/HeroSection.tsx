import React from 'react';
import { Search, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { CURRENCY_LIST } from '../utils/currency';

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
  currentCurrency,
  onCurrencyChange,
  onExecuteSearch,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onExecuteSearch();
    }
  };

  return (
    <section className="relative min-h-[540px] md:min-h-[580px] bg-slate-900 text-white flex items-center overflow-hidden">
      {/* Background with luxury architectural overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071224]/95 via-[#0b1930]/85 to-[#0b1930]/40 z-10" />

      {/* Decorative golden ambient glow */}
      <div className="absolute -top-40 right-10 w-96 h-96 bg-[#c99535]/15 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c99535]/20 border border-[#e7b95f]/30 text-[#e7b95f] text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e7b95f]"></span>
            Your next chapter starts here
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-5">
            Find a place <br className="hidden sm:inline" />
            to call <span className="text-[#e7b95f] italic font-serif-luxury font-normal">home.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-base sm:text-lg max-w-2xl font-normal leading-relaxed mb-8">
            Discover quality homes, land and investment opportunities with clear details, flexible payment options and trusted property guidance.
          </p>
        </div>

        {/* Multi-Field Search Panel */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-100 text-slate-800 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
            {/* Field 1: Property Name / Keyword */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Property Name or Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => onSearchNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Detached Mansion, Lekki, Ikoyi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Field 2: Location */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => onSearchLocationChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="City, area or neighborhood"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all"
              />
            </div>

            {/* Field 3: Property Type */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Property Type
              </label>
              <select
                value={searchType}
                onChange={(e) => onSearchTypeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">All property types</option>
                <option value="Detached House">Detached House</option>
                <option value="Duplex">Duplex</option>
                <option value="Apartment">Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Terrace">Terrace House</option>
                <option value="Dry Land">Land / Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Field 4: Listing Purpose */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Listing Purpose
              </label>
              <select
                value={searchPurpose}
                onChange={(e) => onSearchPurposeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white transition-all cursor-pointer"
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
                className="w-full bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-sm h-[44px] rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#e7b95f]" />
            <span>Verified listing workflow</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#e7b95f]" />
            <span>Flexible payment plans</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#e7b95f]" />
            <span>Inspection booking with verified agents</span>
          </div>
        </div>
      </div>
    </section>
  );
};
