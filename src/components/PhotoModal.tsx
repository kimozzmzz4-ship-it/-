import React from 'react';
import { X } from 'lucide-react';

interface PhotoModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div 
        className="max-w-full max-h-[85vh] overflow-hidden rounded-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photoUrl}
          alt="صورة التقدم"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};
