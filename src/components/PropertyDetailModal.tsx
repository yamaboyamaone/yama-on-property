import React, { useState } from 'react';
import { Property } from '../types';
import { formatMoney } from '../utils/currency';
import {
  X,
  MapPin,
  Bed,
  Bath,
  CheckCircle2,
  CalendarCheck,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Calculator,
  ZoomIn,
  Film,
  Images,
  ChevronLeft,
  ChevronRight,
  Play,
  Sliders,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  currency: string;
  onClose: () => void;
  onBookViewing: (property: Property) => void;
  onAskQuestion: (property: Property) => void;
  onOpenImageViewer: (src: string, caption: string) => void;
  defaultWhatsApp: string;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  currency,
  onClose,
  onBookViewing,
  onAskQuestion,
  onOpenImageViewer,
  defaultWhatsApp,
}) => {
  const images = property.images && property.images.length > 0 ? property.images : [property.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'photos' | 'video'>('photos');

  const activeImage = images[activeImageIndex] || property.image;

  // Calculate payment breakdown
  const isFlexible = property.flexible === 'yes';
  const depositPercent = property.deposit || 30;
  const balancePercent = property.balance || 70;
  const depositAmount = (property.price * depositPercent) / 100;
  const balanceAmount = (property.price * balancePercent) / 100;

  // Parse duration months if possible (e.g., "12 months" -> 12)
  const durationMonthsMatch = (property.duration || '').match(/\d+/);
  const durationMonths = durationMonthsMatch ? parseInt(durationMonthsMatch[0], 10) : 0;
  const monthlyPayment = durationMonths > 0 ? balanceAmount / durationMonths : 0;

  // Client-customizable payment plan state (1 to 100 months)
  const initialCustomMonths = durationMonths > 0 ? Math.min(Math.max(durationMonths, 1), 100) : 12;
  const [customMonths, setCustomMonths] = useState<number>(initialCustomMonths);
  const [customDepositPercent, setCustomDepositPercent] = useState<number>(depositPercent);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  const customBalancePercent = 100 - customDepositPercent;
  const customDepositAmount = (property.price * customDepositPercent) / 100;
  const customBalanceAmount = (property.price * customBalancePercent) / 100;
  const customMonthlyPayment = customMonths > 0 ? customBalanceAmount / customMonths : 0;

  const handleWhatsApp = () => {
    const rawNumber = (property.whatsapp || defaultWhatsApp || '').trim();
    let phone = rawNumber.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '234' + phone.slice(1);
    }
    if (!phone) {
      alert('WhatsApp contact number is not configured for this property.');
      return;
    }

    const priceText = formatMoney(property.price, currency);
    const message = `Hello Mr Yaseer Mustapha Aliyu (YAMA ON PROPERTY), I am inquiring about "${property.title}" in ${property.location}.\nPrice: ${priceText} (${property.purpose}).\n\nPlease send me complete details and brochure.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppWithCustomPlan = () => {
    const rawNumber = (property.whatsapp || defaultWhatsApp || '').trim();
    let phone = rawNumber.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '234' + phone.slice(1);
    }
    if (!phone) {
      alert('WhatsApp contact number is not configured for this property.');
      return;
    }

    const priceText = formatMoney(property.price, currency);
    const depositText = formatMoney(customDepositAmount, currency);
    const balanceText = formatMoney(customBalanceAmount, currency);
    const monthlyText = formatMoney(customMonthlyPayment, currency);
    const message = `Hello Mr Yaseer Mustapha Aliyu (YAMA ON PROPERTY),\n\nI would like to purchase "${property.title}" in ${property.location} using a Customized Flexible Payment Plan:\n• Total Property Price: ${priceText}\n• Customized Repayment Duration: ${customMonths} months\n• Initial Deposit (${customDepositPercent}%): ${depositText}\n• Remaining Balance (${customBalancePercent}%): ${balanceText}\n• Estimated Monthly Installment: ~${monthlyText} / month for ${customMonths} months\n\nPlease let me know if this structured schedule is approved so we can formalize documentation.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleNextPhoto = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isVideoYoutube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYoutubeEmbed = (url: string) => {
    if (url.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    }
    if (url.includes('watch?v=')) {
      return `https://www.youtube.com/embed/${url.split('watch?v=')[1].split('&')[0]}`;
    }
    return url;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-slate-200 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#c99535]">
              {property.purpose} · {property.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1930] leading-snug line-clamp-1">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-7">
          
          {/* Media Switcher: Photos vs Video */}
          {property.videoUrl && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'photos'
                    ? 'bg-[#0b1930] text-[#e7b95f] shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Images className="w-4 h-4" />
                <span>Photo Gallery ({images.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Video Tour Walkthrough</span>
              </button>
            </div>
          )}

          {/* Media Player Display */}
          {activeTab === 'video' && property.videoUrl ? (
            <div className="relative h-72 sm:h-[440px] w-full rounded-3xl overflow-hidden bg-black shadow-xl">
              {isVideoYoutube(property.videoUrl) ? (
                <iframe
                  src={getYoutubeEmbed(property.videoUrl)}
                  title="Property Video Tour"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={property.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : (
            <div>
              {/* Main Photo Container with Next/Prev Controls */}
              <div className="relative h-72 sm:h-[420px] w-full rounded-3xl overflow-hidden bg-slate-900 group shadow-xl">
                <img
                  src={activeImage}
                  alt={property.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => onOpenImageViewer(activeImage, property.title)}
                />

                {/* Photo Count Pill */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md">
                  Photo {activeImageIndex + 1} of {images.length}
                </div>

                {/* Enlarge Button */}
                <button
                  onClick={() => onOpenImageViewer(activeImage, property.title)}
                  className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>Enlarge Photo</span>
                </button>

                {/* Carousel Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPhoto();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPhoto();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                      title="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-18 rounded-2xl overflow-hidden shrink-0 border-3 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#c99535] ring-2 ring-[#c99535]/40 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing Banner & Location (Bold & Medium) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#0b1930] tracking-tight">
                {formatMoney(property.price, currency)}
                {property.purpose === 'For Rent' && (
                  <span className="text-base font-bold text-slate-500 ml-1">/ year</span>
                )}
                {property.purpose === 'Short Let' && (
                  <span className="text-base font-bold text-slate-500 ml-1">/ night</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-700 mt-2">
                <MapPin className="w-4 h-4 text-[#c99535]" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-800 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
              {property.beds > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#c99535]" />
                  <span>{property.beds} Bedrooms</span>
                </div>
              )}
              {property.baths > 0 && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-[#c99535]" />
                  <span>{property.baths} Bathrooms</span>
                </div>
              )}
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-black uppercase">{property.status}</span>
            </div>
          </div>

          {/* Flexible Payment Plan Breakdown */}
          {isFlexible && (
            <div className="bg-[#0b1930] text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-[#e7b95f] text-xs font-black uppercase tracking-wider mb-1">
                    <Calculator className="w-4 h-4" />
                    <span>Flexible Milestone Payment Calculator</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Structured Installment Breakdown
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    showCustomizer
                      ? 'bg-[#e7b95f] text-slate-950 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-[#e7b95f] border border-[#e7b95f]/30'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{showCustomizer ? 'Close Customizer' : 'Customize Plan (1 - 100 Months)'}</span>
                </button>
              </div>

              {/* Standard Configured Plan Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
                    Initial Deposit ({depositPercent}%)
                  </span>
                  <strong className="text-xl font-black text-[#e7b95f] mt-1.5 block">
                    {formatMoney(depositAmount, currency)}
                  </strong>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
                    Remaining Balance ({balancePercent}%)
                  </span>
                  <strong className="text-xl font-black text-white mt-1.5 block">
                    {formatMoney(balanceAmount, currency)}
                  </strong>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
                    Repayment Duration
                  </span>
                  <strong className="text-xl font-black text-white mt-1.5 block">
                    {property.duration || 'Custom schedule'}
                  </strong>
                </div>
              </div>

              {monthlyPayment > 0 && !showCustomizer && (
                <div className="bg-[#e7b95f]/15 border border-[#e7b95f]/30 rounded-2xl p-4 text-sm font-semibold text-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <span>Estimated standard monthly installment:</span>
                  <strong className="text-base sm:text-lg font-black text-[#e7b95f]">
                    ~{formatMoney(monthlyPayment, currency)} / month
                  </strong>
                </div>
              )}

              {/* Interactive Custom Plan Tool (1 to 100 Months) */}
              {showCustomizer && (
                <div className="bg-white/10 border-2 border-[#e7b95f]/40 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#e7b95f] block">
                        Interactive Plan Customizer
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        Simulate Your Customized Duration (1 to 100 Months)
                      </h4>
                    </div>
                    <span className="text-sm font-black text-[#0b1930] bg-[#e7b95f] px-3 py-1 rounded-xl shadow-xs">
                      {customMonths} {customMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  {/* Duration Slider (1 to 100) */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>1 Month (Immediate spread)</span>
                      <span>50 Months</span>
                      <span>100 Months (~8.3 Years Max)</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={customMonths}
                      onChange={(e) => setCustomMonths(parseInt(e.target.value, 10))}
                      className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#e7b95f]"
                    />
                  </div>

                  {/* Preset Duration Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-300 mr-1">Quick Select:</span>
                    {[1, 3, 6, 12, 18, 24, 36, 48, 60, 72, 84, 100].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMonths(m)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          customMonths === m
                            ? 'bg-[#e7b95f] text-slate-950 font-black shadow-sm ring-2 ring-white/30'
                            : 'bg-white/10 hover:bg-white/20 text-slate-200'
                        }`}
                      >
                        {m} {m === 1 ? 'mo' : m === 100 ? 'mos (Max)' : 'mos'}
                      </button>
                    ))}
                  </div>

                  {/* Deposit % Adjuster */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Custom Initial Deposit: <strong className="text-[#e7b95f]">{customDepositPercent}%</strong></span>
                      <span>Remaining Balance: <strong className="text-white">{customBalancePercent}%</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[10, 20, 25, 30, 40, 50, 60].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCustomDepositPercent(pct)}
                          className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            customDepositPercent === pct
                              ? 'bg-white text-[#0b1930] font-black'
                              : 'bg-white/10 hover:bg-white/20 text-slate-300'
                          }`}
                        >
                          {pct}% Down
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customized Financial Result */}
                  <div className="bg-[#071224] p-4 sm:p-5 rounded-xl border border-white/15 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">
                          Down Payment ({customDepositPercent}%)
                        </span>
                        <strong className="text-lg font-black text-[#e7b95f]">
                          {formatMoney(customDepositAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">
                          Spread Balance ({customBalancePercent}%)
                        </span>
                        <strong className="text-lg font-black text-white">
                          {formatMoney(customBalanceAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 block uppercase">
                          Monthly Installment ({customMonths} mos)
                        </span>
                        <strong className="text-lg sm:text-xl font-black text-emerald-400">
                          ~{formatMoney(customMonthlyPayment, currency)} / mo
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWhatsAppWithCustomPlan}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-colors cursor-pointer shadow-md mt-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Inquire via WhatsApp with this {customMonths}-Month Custom Plan</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-normal">
                * Payment calculations are informational guidance provided by YAMA ON PROPERTY. Final terms, deed of contract, and schedules are formalized upon purchase agreement execution.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
              Property Overview & Description
            </h3>
            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line font-medium">
              {property.description}
            </p>
          </div>

          {/* Features & Amenities */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                Key Features & Premium Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#c99535] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3.5">
            <button
              onClick={() => {
                onClose();
                onBookViewing(property);
              }}
              className="w-full sm:flex-1 bg-[#c99535] hover:bg-[#b38228] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Book an Inspection</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskQuestion(property);
              }}
              className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <span>Ask a Question</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto bg-[#128c4a] hover:bg-[#0d733c] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
