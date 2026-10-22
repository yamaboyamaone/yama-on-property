import React, { useState } from 'react';
import { CURRENCY_LIST } from '../utils/currency';
import { Phone, Heart, Menu, X, Lock, Cloud, RefreshCw } from 'lucide-react';

import { Property, Profile } from '../types';

interface NavbarProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleFavoritesOnly: () => void;
  onOpenAdmin: () => void;
  onScrollToSection: (sectionId: string) => void;
  businessPhone: string;
  isCloudConnected: boolean;
  isSyncing: boolean;
  onTriggerSync?: () => void;
  profile?: Profile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  favoritesCount,
  showOnlyFavorites,
  onToggleFavoritesOnly,
  onOpenAdmin,
  onScrollToSection,
  businessPhone,
  isCloudConnected,
  isSyncing,
  onTriggerSync,
  profile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const defaultHeadshot = '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png';
  const avatarUrl =
    profile?.avatar && !profile.avatar.includes('unsplash')
      ? profile.avatar
      : defaultHeadshot;
  const consultantName = profile?.name || 'Mr Yaseer Mustapha Aliyu';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#0b1930] text-slate-100 text-xs sm:text-sm py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#e7b95f] animate-pulse" />
            <span className="font-bold text-slate-100">Homes. Investments. A Better Tomorrow.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-200 text-xs sm:text-sm">
            {/* Cloud & Local Storage Status Badge */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 shadow-xs"
              title="Data is stored in both Cloud Storage and Local Device Storage"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCloudConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-100">
                {isSyncing
                  ? 'Syncing Cloud...'
                  : isCloudConnected
                  ? 'Cloud & Local Storage Active'
                  : 'Local Storage (Offline)'}
              </span>
              {onTriggerSync && (
                <button
                  type="button"
                  onClick={onTriggerSync}
                  className="hover:text-[#e7b95f] ml-1 p-0.5 transition-colors cursor-pointer"
                  title="Synchronize Cloud & Local Storage"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            <span className="hidden sm:inline font-medium text-slate-200">
              Trusted property guidance · Book an inspection online
            </span>

            {businessPhone && (
              <a
                href={`tel:${businessPhone.replace(/\D/g, '')}`}
                className="text-[#e7b95f] hover:underline flex items-center gap-1 font-semibold"
              >
                <Phone className="w-3 h-3" />
                {businessPhone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src="/assets/aistudio/Yama_On_Property_Logo_fba4d8d2.png"
              alt="YAMA ON PROPERTY Logo"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col justify-center">
              <span className="font-black text-[#0b1930] tracking-tight text-xl sm:text-2xl leading-none">
                YAMA
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-[0.28em] font-extrabold text-[#c99535] mt-1 uppercase">
                ON PROPERTY
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <button
              onClick={() => onScrollToSection('properties')}
              className="hover:text-[#c99535] transition-colors cursor-pointer"
            >
              Properties
            </button>
            <button
              onClick={() => onScrollToSection('categories')}
              className="hover:text-[#c99535] transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => onScrollToSection('map-section')}
              className="hover:text-[#c99535] transition-colors cursor-pointer"
            >
              Neighbourhood
            </button>
            <button
              onClick={() => onScrollToSection('about')}
              className="hover:text-[#c99535] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onScrollToSection('contact')}
              className="hover:text-[#c99535] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={currentCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 pl-2.5 pr-7 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c99535] cursor-pointer"
                title="Select Currency"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-2.5 pointer-events-none text-slate-400 text-xs">▼</span>
            </div>

            {/* Saved Favorites Toggle */}
            <button
              onClick={onToggleFavoritesOnly}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={showOnlyFavorites ? 'Show all properties' : 'Show saved favorites'}
            >
              <Heart
                className={`w-4 h-4 ${showOnlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`}
              />
              <span className="hidden sm:inline font-medium">Saved</span>
              {favoritesCount > 0 && (
                <span className="bg-[#0b1930] text-[#e7b95f] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Lead Advisor Chip (Bold & Medium) */}
            <button
              onClick={() => onScrollToSection('about')}
              className="hidden lg:flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer group shadow-xs"
              title="Meet Principal Consultant"
            >
              <img
                src={avatarUrl}
                alt={consultantName}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#c99535]"
              />
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black text-[#0b1930] leading-tight">
                  {consultantName}
                </span>
                <span className="block text-[11px] text-[#c99535] font-extrabold leading-tight">
                  Principal Consultant
                </span>
              </div>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#0b1930] bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Admin Portal"
            >
              <Lock className="w-4 h-4 text-[#c99535]" />
              <span>Admin</span>
            </button>

            {/* Explore Homes CTA */}
            <button
              onClick={() => onScrollToSection('properties')}
              className="bg-[#c99535] hover:bg-[#b38228] text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Explore Homes
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-4 shadow-xl">
            {/* Consultant Profile Spotlight in Mobile Menu */}
            <div
              onClick={() => {
                onScrollToSection('about');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <img
                src={avatarUrl}
                alt={consultantName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#c99535] shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-sm sm:text-base font-black text-[#0b1930]">
                  {consultantName}
                </span>
                <span className="block text-xs sm:text-sm text-[#c99535] font-extrabold">
                  Principal Real Estate Consultant
                </span>
                <span className="block text-xs text-slate-500 font-medium truncate mt-0.5">
                  Tap to view profile & advisory credentials
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onScrollToSection('properties');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-slate-700 hover:text-[#c99535]"
            >
              Properties
            </button>
            <button
              onClick={() => {
                onScrollToSection('categories');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-slate-700 hover:text-[#c99535]"
            >
              Categories
            </button>
            <button
              onClick={() => {
                onScrollToSection('map-section');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-slate-700 hover:text-[#c99535]"
            >
              Neighbourhood
            </button>
            <button
              onClick={() => {
                onScrollToSection('about');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-slate-700 hover:text-[#c99535]"
            >
              About Us
            </button>
            <button
              onClick={() => {
                onScrollToSection('contact');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-medium text-slate-700 hover:text-[#c99535]"
            >
              Contact
            </button>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1930] py-2 px-3 bg-slate-100 rounded-lg"
              >
                <Lock className="w-3.5 h-3.5 text-[#c99535]" />
                Admin Dashboard
              </button>
              <button
                onClick={() => {
                  onScrollToSection('properties');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-white bg-[#c99535] py-2 px-4 rounded-lg"
              >
                Find Properties
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
