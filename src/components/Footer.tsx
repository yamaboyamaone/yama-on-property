import React from 'react';
import { WebsiteSettings } from '../types';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: WebsiteSettings;
  onScrollToSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onScrollToSection,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#071224] text-white pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info (col-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#e7b95f] flex items-center justify-center font-bold text-xl border border-white/10">
                ⌂
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white tracking-tight text-lg leading-none">
                  YAMA ON
                </span>
                <span className="text-[9px] tracking-[0.25em] font-bold text-[#c99535] mt-1 uppercase">
                  PROPERTY
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              {settings.footerIntro ||
                'Thoughtful property choices. Clear guidance. A better tomorrow.'}
            </p>

            <div className="pt-2">
              <span className="inline-block text-[10px] font-bold text-[#e7b95f] uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                Lagos · Abuja · Diaspora Desk
              </span>
            </div>
          </div>

          {/* Quick Links (col-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#e7b95f]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onScrollToSection('properties')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Featured Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('categories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Property Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('map-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Neighbourhood Maps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About YAMA ON PROPERTY
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#e7b95f] transition-colors cursor-pointer text-slate-400"
                >
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Get In Touch (col-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#e7b95f]">
              {settings.contactTitle || 'Get in touch'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {settings.contactText ||
                'Contact our advisory team for private viewing appointments and property documentation.'}
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-300 font-medium">
              {settings.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[#c99535] shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\D/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#c99535] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#c99535] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{settings.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © 2026 YAMA ON PROPERTY. Property details and availability should be independently verified before financial commitment.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
