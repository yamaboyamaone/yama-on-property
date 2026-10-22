import React from 'react';
import { ArrowRight, ShieldCheck, Clock, Award, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Profile } from '../types';

interface AboutCTAProps {
  onExploreHomes: () => void;
  profile?: Profile;
  businessPhone?: string;
}

export const AboutCTA: React.FC<AboutCTAProps> = ({
  onExploreHomes,
  profile,
  businessPhone,
}) => {
  const defaultHeadshot = '/assets/aistudio/Professional_Circular_Studio_Headshot_16e4be7f.png';
  const avatarUrl =
    profile?.avatar && !profile.avatar.includes('unsplash')
      ? profile.avatar
      : defaultHeadshot;
  const consultantName = profile?.name || 'Mr Yaseer Mustapha Aliyu';
  const consultantRole = profile?.role || 'Managing Director & Principal Consultant';
  // Admin customizable consultant WhatsApp number
  const consultantWhatsapp =
    profile?.whatsapp || profile?.phone || businessPhone || '+234 803 555 0192';

  const handleConsultantWhatsApp = () => {
    const rawNumber = consultantWhatsapp.replace(/\D/g, '');
    let cleanPhone = rawNumber;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.slice(1);
    }
    const message = `Hello ${consultantName}, I visited the YAMA ON PROPERTY website and would like personalized guidance regarding verified properties and inspection viewings.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section id="about" className="py-20 md:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#b38228] text-xs sm:text-sm font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#c99535]"></span>
            Executive Leadership & Advisory
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0b1930] tracking-tight">
            Meet Your Principal Property Consultant
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            Direct, verified, and personalized real estate guidance with full legal integrity.
          </p>
        </div>

        {/* Consultant Showcase Card (Premium Minimalist, Bold & Medium Typography) */}
        <div className="bg-gradient-to-br from-[#071224] via-[#0b1930] to-[#132743] text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Ambient Gold Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c99535]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#e7b95f]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Consultant Photo Column */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                {/* Glowing Outer Ring */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#c99535] via-[#e7b95f] to-amber-200 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>

                {/* Main Headshot Image */}
                <div className="relative w-56 h-56 sm:w-68 sm:h-68 rounded-full overflow-hidden border-4 border-[#e7b95f] bg-[#0b1930] shadow-2xl ring-4 ring-[#e7b95f]/30">
                  <img
                    src={avatarUrl}
                    alt={consultantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Verified Badge */}
                <div
                  className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-emerald-500 text-white p-2.5 sm:p-3 rounded-full shadow-2xl border-2 border-[#0b1930]"
                  title="Verified Real Estate Consultant"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Name & Title under photo */}
              <div className="mt-6 space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {consultantName}
                </h3>
                <p className="text-sm sm:text-base font-bold text-[#e7b95f]">
                  {consultantRole}
                </p>
                <div className="inline-block mt-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs sm:text-sm font-bold text-slate-200 border border-white/15">
                  YAMA ON PROPERTY
                </div>
              </div>
            </div>

            {/* Consultant Bio & Guarantees Column */}
            <div className="lg:col-span-7 space-y-7">
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#e7b95f] block mb-3">
                  A Personal Commitment to Every Client
                </span>
                <blockquote className="text-slate-100 text-lg sm:text-xl md:text-2xl italic font-serif-luxury leading-relaxed border-l-4 border-[#c99535] pl-5 my-4">
                  “Real estate in Nigeria should not be a gamble. Every acquisition must be anchored on verified title documents, clear payment milestones, and genuine care. We inspect every home as if we are buying it for our own family.”
                </blockquote>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal mt-4">
                  {profile?.bio ||
                    'Specializing in prime residential acquisitions, commercial land developments, and flexible investment advisory across Lagos, Abuja, and diaspora clients. We provide end-to-end guidance from physical inspection to final deed delivery.'}
                </p>
              </div>

              {/* Pillars (Bold & Medium Fonts) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <ShieldCheck className="w-6 h-6 text-[#e7b95f] mb-2" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white">Title Verification</h4>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Governor’s Consent & C of O legal checks
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Clock className="w-6 h-6 text-[#e7b95f] mb-2" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white">Flexible Milestones</h4>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Structured installment plans & deposits
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Award className="w-6 h-6 text-[#e7b95f] mb-2" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white">Direct Guidance</h4>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                    Physical tour & video accompaniment
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <button
                  type="button"
                  onClick={handleConsultantWhatsApp}
                  className="bg-[#128c4a] hover:bg-[#0d733c] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with Mr Yaseer on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onExploreHomes}
                  className="bg-[#c99535] hover:bg-[#b38228] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Explore Available Properties</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
