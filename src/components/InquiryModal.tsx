import React, { useState } from 'react';
import { Property, Message } from '../types';
import { X, Send, User, MessageSquare, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  property: Property;
  onClose: () => void;
  onSubmitInquiry: (inquiry: Omit<Message, 'id' | 'date' | 'read'>) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  property,
  onClose,
  onSubmitInquiry,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !text.trim()) return;

    onSubmitInquiry({
      name: name.trim(),
      contact: contact.trim(),
      property: property.title,
      propertyId: property.id,
      text: text.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-7 flex flex-col relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Message Delivered!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Our property team has received your message regarding <b>{property.title}</b> and will respond promptly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 pr-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c99535]">
                Direct Inquiry
              </span>
              <h2 className="text-lg font-black text-[#0b1930] leading-snug">
                Ask About This Property
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {property.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium text-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Adeleke"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Email or Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="name@email.com or +234..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  rows={4}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="I would like to inquire about payment terms, title verification, or floor plans..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0b1930] hover:bg-[#132743] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5 text-[#e7b95f]" />
                Send Inquiry to Agent
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
