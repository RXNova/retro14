import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isVisible,
  onClose,
  duration = 1000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-[#172B4D] text-white px-4 py-3 rounded-[3px] shadow-lg flex items-center gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center hover:opacity-75 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
