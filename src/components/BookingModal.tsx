import React, { useState } from 'react';
import { Property, Booking } from '../types';
import { X, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  property: Property;
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  onClose,
  onSubmitBooking,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('Morning (10:00 AM - 12:00 PM)');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) return;

    onSubmitBooking({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      note: note.trim(),
      property: property.title,
      propertyId: property.id,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Inspection Request Sent!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <b>{name}</b>. Our representative will contact you via WhatsApp or phone ({phone}) shortly to confirm appointment details.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 pr-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c99535]">
                Book An Inspection
              </span>
              <h2 className="text-xl font-black text-[#0b1930] leading-snug">
                Schedule a Property Viewing
              </h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                Property: <b>{property.title}</b> ({property.location})
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ibrahim Abubakar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white cursor-pointer"
                  >
                    <option>Morning (10:00 AM - 12:00 PM)</option>
                    <option>Afternoon (1:00 PM - 3:00 PM)</option>
                    <option>Evening (4:00 PM - 6:00 PM)</option>
                    <option>Weekend Special Slot</option>
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Specific Requests or Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Would like to review title documents and verify parking capacity..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c99535] focus:bg-white resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-[#c99535] hover:bg-[#b38228] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer mt-2"
              >
                Send Inspection Request
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-normal">
                Submitting this form does not bind you to purchase. The agent will confirm the viewing schedule.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
