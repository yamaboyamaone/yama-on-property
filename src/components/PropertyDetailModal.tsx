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
    const message = `Hello YAMA ON PROPERTY, I am inquiring about "${property.title}" in ${property.location}.\nPrice: ${priceText} (${property.purpose}).\n\nPlease send me complete details and brochure.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#c99535]">
              {property.purpose} · {property.category}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1930] leading-snug line-clamp-1">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Photo & Thumbnails */}
          <div>
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 group">
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => onOpenImageViewer(activeImage, property.title)}
              />
              <button
                onClick={() => onOpenImageViewer(activeImage, property.title)}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Enlarge photo
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#c99535] ring-2 ring-[#c99535]/30'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Banner & Location */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1930] tracking-tight">
                {formatMoney(property.price, currency)}
                {property.purpose === 'For Rent' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ year</span>
                )}
                {property.purpose === 'Short Let' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ night</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <MapPin className="w-4 h-4 text-[#c99535]" />
                <span className="font-medium">{property.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              {property.beds > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-[#c99535]" />
                  <span>{property.beds} Bedrooms</span>
                </div>
              )}
              {property.baths > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-[#c99535]" />
                  <span>{property.baths} Bathrooms</span>
                </div>
              )}
              <span className="text-slate-400">|</span>
              <span className="text-emerald-700 font-extrabold uppercase">{property.status}</span>
            </div>
          </div>

          {/* Flexible Payment Plan Breakdown */}
          {isFlexible && (
            <div className="bg-[#0b1930] text-white p-6 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-[#e7b95f] text-xs font-bold uppercase tracking-wider mb-2">
                <Calculator className="w-4 h-4" />
                Flexible Payment Plan Structure
              </div>
              <h3 className="text-lg font-extrabold mb-4">
                Structured Milestone Payments
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                  <span className="text-slate-400 text-xs font-medium block">
                    Initial Deposit ({depositPercent}%)
                  </span>
                  <strong className="text-lg font-extrabold text-[#e7b95f] mt-1 block">
                    {formatMoney(depositAmount, currency)}
                  </strong>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                  <span className="text-slate-400 text-xs font-medium block">
                    Balance ({balancePercent}%)
                  </span>
                  <strong className="text-lg font-extrabold text-white mt-1 block">
                    {formatMoney(balanceAmount, currency)}
                  </strong>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                  <span className="text-slate-400 text-xs font-medium block">
                    Term Duration
                  </span>
                  <strong className="text-lg font-extrabold text-white mt-1 block">
                    {property.duration || 'Custom terms'}
                  </strong>
                </div>
              </div>

              {monthlyPayment > 0 && (
                <div className="bg-[#e7b95f]/15 border border-[#e7b95f]/30 rounded-xl p-3 text-xs text-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <span>Estimated monthly installment:</span>
                  <strong className="text-sm font-bold text-[#e7b95f]">
                    ~{formatMoney(monthlyPayment, currency)} / month
                  </strong>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                * Payment calculations are informational estimates provided by YAMA ON PROPERTY. Final terms, deed of contract, and schedules are formalized upon purchase agreement execution.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Property Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Features & Amenities */}
          {property.features && property.features.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Key Features & Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#c99535] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onBookViewing(property);
              }}
              className="w-full sm:flex-1 bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-sm py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              Book an inspection
            </button>

            <button
              onClick={() => {
                onClose();
                onAskQuestion(property);
              }}
              className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Ask a question
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto bg-[#128c4a] hover:bg-[#0d733c] text-white font-bold text-sm py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
