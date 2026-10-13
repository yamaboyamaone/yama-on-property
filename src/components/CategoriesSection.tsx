import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory: (categoryType: string) => void;
  selectedCategory: string;
}

const CATEGORIES = [
  {
    title: 'Houses & Duplexes',
    subtitle: 'Family living',
    typeValue: 'Duplex',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Luxury Apartments',
    subtitle: 'Modern city life',
    typeValue: 'Apartment',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Prime Land & Plots',
    subtitle: 'Build your future',
    typeValue: 'Dry Land',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Commercial Properties',
    subtitle: 'Business spaces',
    typeValue: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Short Let & Terraces',
    subtitle: 'Flexible stays',
    typeValue: 'Penthouse',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=80',
  },
];

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section id="categories" className="py-16 md:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#c99535] mb-2">
              Explore your options
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1930] tracking-tight">
              Browse by category
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Find the property type that fits your lifestyle, family, or investment goals.
            </p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="text-xs font-semibold text-[#c99535] hover:text-[#b38228] underline underline-offset-4 cursor-pointer self-start sm:self-auto"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.typeValue;
            return (
              <button
                key={cat.title}
                type="button"
                onClick={() => onSelectCategory(cat.typeValue)}
                className={`group text-left rounded-2xl overflow-hidden border bg-white shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col ${
                  isSelected
                    ? 'border-[#c99535] ring-2 ring-[#c99535]/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                  <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#c99535] transition-colors leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.subtitle}</p>
                  </div>
                  {isSelected && (
                    <span className="mt-2 inline-block text-[10px] font-bold text-[#c99535] uppercase tracking-wider">
                      ● Active filter
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
