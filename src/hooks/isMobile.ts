// src/hooks/useMobile.ts
import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile(); // Initial check
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};