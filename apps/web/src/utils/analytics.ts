/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export const initGA = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = () => {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  };
  script.onerror = (e) => console.error('🔍 GA script failed:', e);
  document.head.appendChild(script);

  // Initialize the data layer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
};

export const trackPageView = (url: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

interface Event {
  category: string;
  action: string;
  label: string;
}

export const trackEvent = ({ category, action, label }: Event) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};