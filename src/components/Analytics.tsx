// Plausible Analytics integration (privacy-friendly)
'use client';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    if (window.location.hostname === 'localhost') return;
    const script = document.createElement('script');
    script.setAttribute('defer', '');
    script.setAttribute('data-domain', 'money-transfer-comparison.com');
    script.src = 'https://plausible.io/js/plausible.js';
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return null;
}
