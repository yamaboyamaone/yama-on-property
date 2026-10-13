import React from 'react';
import { Property } from '../types';
import { formatMoney } from '../utils/currency';
import { MapPin, Bed, Bath, Sparkles, Heart, MessageCircle, CalendarCheck, ZoomIn, CheckCircle } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currency: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onBookViewing: (property: Property) => void;
  onOpenImageViewer: (src: string, caption: string) => void;
  defaultWhatsApp: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currency,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onBookViewing,
  onOpenImageViewer,
  defaultWhatsApp,
}) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    const message = `Hello YAMA ON PROPERTY, I am interested in "${property.title}" located at ${property.location}.\n\nListing Type: ${property.purpose}\nPrice: ${priceText}\n\nPlease share more details and availability for an inspection.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const isRent = property.purpose === 'For Rent';
  const isShortLet = property.purpose === 'Short Let';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Property Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
          onClick={() => onOpenImageViewer(property.image, property.title)}
          loading="lazy"
          title="Click to view full image"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Purpose Badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className="bg-emerald-700/90 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs">
            {property.purpose}
          </span>
          {property.flexible === 'yes' && (
            <span className="bg-[#0b1930]/90 backdrop-blur-xs text-[#e7b95f] text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              {property.deposit}% Down
            </span>
          )}
        </div>

        {/* Favorite & Zoom Controls */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenImageViewer(property.image, property.title);
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
            title="Enlarge photo"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer ${
              isFavorite ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Status overlay if not Available */}
        {property.status !== 'Available' && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {property.status}
            </span>
          </div>
        )}
      </div>

      {/* Property Content Details */}
      <div className="p-5 flex flex-col flex-1">
        {/* Price Tag */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <div className="text-xl sm:text-2xl font-black text-[#0b1930] tracking-tight">
            {formatMoney(property.price, currency)}
            {isRent && (
              <span className="text-xs font-semibold text-slate-500 ml-1">/ year</span>
            )}
            {isShortLet && (
              <span className="text-xs font-semibold text-slate-500 ml-1">/ night</span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {property.type}
          </span>
        </div>

        {/* Property Title */}
        <h3
          onClick={() => onViewDetails(property)}
          className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-[#c99535] transition-colors cursor-pointer mb-2"
          title={property.title}
        >
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-[#c99535] shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Bed / Bath / Features specs */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-3 border-t border-slate-100 mb-4">
          {property.beds > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.beds} {property.beds === 1 ? 'bed' : 'beds'}</span>
            </div>
          )}
          {property.baths > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.baths} {property.baths === 1 ? 'bath' : 'baths'}</span>
            </div>
          )}
          <div className="text-slate-400 font-normal truncate">
            {property.category}
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="mt-auto space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(property)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-center"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => onBookViewing(property)}
              className="w-full bg-[#c99535] hover:bg-[#b38228] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Book viewing
            </button>
          </div>

          {/* WhatsApp Direct Action */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full bg-[#128c4a] hover:bg-[#0d733c] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
};
