/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics configuration
export const GA_MEASUREMENT_ID = 'G-YBHL457WSL';

export const initGA = () => {
  // Add the script tag dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
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

export const trackEvent = (category: string, action: string, label?: string) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Helper functions for common events
export const trackIndicatorSelection = (indicatorId: string, indicatorName: string) => {
  trackEvent('Indicator', 'select', `${indicatorId} - ${indicatorName}`);
};

export const trackIndicatorPin = (indicatorId: string, indicatorName: string) => {
  trackEvent('Indicator', 'pin', `${indicatorId} - ${indicatorName}`);
};

export const trackMapInteraction = (action: 'zoom' | 'pan' | 'click', details: string) => {
  trackEvent('Map', action, details);
}; 