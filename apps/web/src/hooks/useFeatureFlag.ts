import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/utils/firebase';

export const useFeatureFlag = (flagName: string) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.FEATURES, 'flags'),
      (doc) => {
        if (isMounted) {
          const flags = doc.data();
          setIsEnabled(flags?.[flagName] === true);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error(`Error fetching feature flag ${flagName}:`, error);
        if (isMounted) {
          setIsEnabled(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [flagName]);

  return { isEnabled, isLoading };
}; 