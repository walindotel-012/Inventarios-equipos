import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const baseClasses = 'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50';
  
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return createPortal(
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="text-xl">{icons[type]}</span>
      <span className="font-medium text-sm">{message}</span>
    </div>,
    document.getElementById('portal') || document.body
  );
}
