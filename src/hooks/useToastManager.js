import { useState } from 'react';

export function useToastManager() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    if (duration !== 0) {
      setTimeout(() => setToast(null), duration);
    }
  };

  const hideToast = () => setToast(null);

  return {
    toast,
    showToast,
    hideToast,
  };
}
