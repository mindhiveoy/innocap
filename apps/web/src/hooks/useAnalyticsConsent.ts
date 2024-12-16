import { useState, useEffect } from 'react';
import { getConsentStatus, COOKIE_CATEGORIES } from '@/utils/cookieConsent';

export const useAnalyticsConsent = () => {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const acceptedCategories = getConsentStatus();
      setHasAnalyticsConsent(acceptedCategories.includes(COOKIE_CATEGORIES.ANALYTICS));
    };

    // Check initial consent
    checkConsent();

    // Listen for consent changes
    document.addEventListener('cc:onChange', checkConsent);

    return () => {
      document.removeEventListener('cc:onChange', checkConsent);
    };
  }, []);

  return hasAnalyticsConsent;
}; 