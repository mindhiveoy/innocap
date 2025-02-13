import { useState, useEffect } from 'react';
import { isAnalyticsAccepted } from '@/utils/cookieConsent';

export const useAnalyticsConsent = () => {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = isAnalyticsAccepted();
      setHasAnalyticsConsent(hasConsent);
    };

    checkConsent();
    document.addEventListener('cc:onFirstAction', checkConsent);
    document.addEventListener('cc:onChange', checkConsent);

    return () => {
      document.removeEventListener('cc:onFirstAction', checkConsent);
      document.removeEventListener('cc:onChange', checkConsent);
    };
  }, []);

  return hasAnalyticsConsent;
}; 