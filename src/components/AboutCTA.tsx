import React from 'react';
import { ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

interface AboutCTAProps {
  onExploreHomes: () => void;
}

export const AboutCTA: React.FC<AboutCTAProps> = ({ onExploreHomes }) => {
  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#071224] via-[#0b1930] to-[#132743] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
          {/* Decorative Gold Circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c99535]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#e7b95f]">
                A smoother property journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Make your next move with confidence.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Browse verified homes, compare structured payment options, and schedule guided physical or virtual inspections with our advisory team. We remove the guesswork from Nigerian real estate.
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#e7b95f]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Title Verification</h4>
                    <p className="text-[11px] text-slate-400">Strict document vetting</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#e7b95f]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Flexible Milestones</h4>
                    <p className="text-[11px] text-slate-400">Installments up to 24 mos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#e7b95f]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dedicated Agent</h4>
                    <p className="text-[11px] text-slate-400">Prompt WhatsApp support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={onExploreHomes}
                className="w-full sm:w-auto bg-[#c99535] hover:bg-[#b38228] text-white font-extrabold text-sm sm:text-base py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Find a property</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
