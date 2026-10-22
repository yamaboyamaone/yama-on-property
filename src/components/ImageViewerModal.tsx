import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageViewerModalProps {
  src: string;
  caption: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  src,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-lg z-10"
        aria-label="Close image viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image */}
      <div
        className="max-w-[95vw] max-h-[85vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={caption}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform"
        />
      </div>

      {/* Caption bar */}
      {caption && (
        <div
          className="mt-4 px-6 py-2 rounded-full bg-black/60 text-white text-xs sm:text-sm font-medium tracking-wide max-w-xl text-center truncate border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
