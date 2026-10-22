import React, { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

const REGIONS = [
  {
    name: 'Lekki & Ikoyi Corridor, Lagos',
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=3.40%2C6.42%2C3.60%2C6.48&layer=mapnik',
    description: 'Premier coastal residential & financial districts',
  },
  {
    name: 'Maitama & Central, Abuja',
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=7.45%2C9.04%2C7.54%2C9.12&layer=mapnik',
    description: 'Federal capital diplomatic zone and upscale residences',
  },
  {
    name: 'Greater Lagos Region',
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=2.7%2C6.2%2C8.0%2C9.0&layer=mapnik',
    description: 'Overall strategic investment belt',
  },
];

export const MapSection: React.FC = () => {
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const currentRegion = REGIONS[selectedRegionIndex];

  return (
    <section id="map-section" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#c99535] mb-2">
              Explore the neighbourhood
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1930] tracking-tight">
              Find properties on the map
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">
              Explore the surrounding arterial roads, coastline, and landmarks before scheduling your physical tour.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region, idx) => (
              <button
                key={region.name}
                type="button"
                onClick={() => setSelectedRegionIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRegionIndex === idx
                    ? 'bg-[#0b1930] text-[#e7b95f] shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {region.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Map Box */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-200 min-h-[380px]">
          <iframe
            title={currentRegion.name}
            loading="lazy"
            src={currentRegion.src}
            className="w-full h-[400px] border-0"
          />

          {/* Overlay Card */}
          <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl max-w-xs border border-slate-100 hidden sm:block">
            <div className="flex items-center gap-2 text-[#0b1930] font-black text-sm mb-1">
              <Compass className="w-4 h-4 text-[#c99535]" />
              {currentRegion.name}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRegion.description}
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-400">
              <Navigation className="w-3 h-3 text-[#c99535]" />
              <span>Map view is illustrative. Exact GPS pins provided upon booking.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
