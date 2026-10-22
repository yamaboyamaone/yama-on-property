import React from 'react';
import { Property } from '../types';
import { formatMoney } from '../utils/currency';
import { MapPin, Bed, Bath, Sparkles, Heart, MessageCircle, CalendarCheck, ZoomIn, Film, Images } from 'lucide-react';

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
  const totalPhotosCount = (property.images && property.images.length > 0)
    ? property.images.length
    : (property.image ? 1 : 0);

  return (
    <article className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-[#c99535]/50 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Property Image Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
          onClick={() => onOpenImageViewer(property.image, property.title)}
          loading="lazy"
          title="Click to view full image"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Purpose & Flexible Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <span className="bg-emerald-700/95 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-xl tracking-wider uppercase shadow-md">
            {property.purpose}
          </span>
          {property.flexible === 'yes' && (
            <span className="bg-[#0b1930]/95 backdrop-blur-md text-[#e7b95f] text-xs font-extrabold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#e7b95f]" />
              <span>{property.deposit}% Down · {property.duration || 'Flexible Plan'}</span>
            </span>
          )}
        </div>

        {/* Multi-Photo & Video Tour Badges */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 z-10">
          {totalPhotosCount > 1 && (
            <span className="bg-black/75 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <Images className="w-3.5 h-3.5 text-[#e7b95f]" />
              {totalPhotosCount} Photos
            </span>
          )}
          {property.videoUrl && (
            <span className="bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <Film className="w-3.5 h-3.5" />
              Video Tour
            </span>
          )}
        </div>

        {/* Favorite & Zoom Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenImageViewer(property.image, property.title);
            }}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 flex items-center justify-center transition-all shadow-md cursor-pointer"
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
            className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-md hover:bg-white flex items-center justify-center transition-all shadow-md cursor-pointer ${
              isFavorite ? 'text-rose-500' : 'text-slate-700 hover:text-rose-500'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Status overlay if not Available */}
        {property.status !== 'Available' && (
          <div className="absolute bottom-4 right-4 z-10">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md">
              {property.status}
            </span>
          </div>
        )}
      </div>

      {/* Property Content Details (Bold, Medium, Premium Minimalist) */}
      <div className="p-6 flex flex-col flex-1 space-y-4">
        {/* Price & Type Tag */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-2xl sm:text-3xl font-black text-[#0b1930] tracking-tight">
            {formatMoney(property.price, currency)}
            {isRent && (
              <span className="text-sm font-bold text-slate-500 ml-1">/ year</span>
            )}
            {isShortLet && (
              <span className="text-sm font-bold text-slate-500 ml-1">/ night</span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            {property.type}
          </span>
        </div>

        {/* Property Title */}
        <h3
          onClick={() => onViewDetails(property)}
          className="font-black text-slate-900 text-lg leading-snug line-clamp-2 hover:text-[#c99535] transition-colors cursor-pointer"
          title={property.title}
        >
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <MapPin className="w-4 h-4 text-[#c99535] shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Bed / Bath specs */}
        <div className="flex items-center gap-5 text-sm font-bold text-slate-700 pt-3 border-t border-slate-100">
          {property.beds > 0 && (
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#c99535]" />
              <span>{property.beds} {property.beds === 1 ? 'bed' : 'beds'}</span>
            </div>
          )}
          {property.baths > 0 && (
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-[#c99535]" />
              <span>{property.baths} {property.baths === 1 ? 'bath' : 'baths'}</span>
            </div>
          )}
          <div className="text-slate-500 font-medium truncate ml-auto">
            {property.category}
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="pt-2 mt-auto space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onViewDetails(property)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-extrabold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => onBookViewing(property)}
              className="w-full bg-[#c99535] hover:bg-[#b38228] text-white text-sm font-extrabold py-3 px-3 rounded-xl transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Tour</span>
            </button>
          </div>

          {/* WhatsApp Direct Action */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full bg-[#128c4a] hover:bg-[#0d733c] text-white text-sm font-black py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>
      </div>
    </article>
  );
};
