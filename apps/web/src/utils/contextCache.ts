import { db } from '@/utils/firebase';
import { doc, getDoc, setDoc, query, collection, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { IndicatorContext } from '@/types/chat';

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

interface SessionDocument {
  context: IndicatorContext;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

class FirestoreCache {
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0
  };

  private memoryCache = new Map<string, IndicatorContext>();
  private readonly WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
  private readonly SESSIONS_COLLECTION = 'sessions';

  get = async (sessionId: string): Promise<IndicatorContext | null> => {
    if (!sessionId) {
      console.warn('Invalid sessionId provided to contextCache.get');
      return null;
    }

    // Check memory cache first
    if (this.memoryCache.has(sessionId)) {
      this.stats.hits++;
      return this.memoryCache.get(sessionId) ?? null;
    }

    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionDoc = sessionSnap.data() as SessionDocument;
        // Update memory cache
        this.memoryCache.set(sessionId, sessionDoc.context);
        this.stats.hits++;
        return sessionDoc.context;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      this.stats.misses++;
      return null;
    }
  };

  set = async (sessionId: string, data: IndicatorContext): Promise<void> => {
    if (!sessionId) {
      throw new Error('Invalid sessionId provided to contextCache.set');
    }

    try {
      const now = new Date();
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const sessionDoc: SessionDocument = {
        context: data,
        updatedAt: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now)
      };

      await setDoc(sessionRef, sessionDoc, { merge: true });

      // Update memory cache
      this.memoryCache.set(sessionId, data);
      this.stats.size = this.memoryCache.size;
    } catch (error) {
      console.error('Error setting data in Firestore:', error);
      throw error;
    }
  };

  clearOldSessions = async (): Promise<void> => {
    try {
      const weekAgo = new Date(Date.now() - this.WEEK_IN_MS);
      const sessionsRef = collection(db, this.SESSIONS_COLLECTION);
      const oldSessionsQuery = query(
        sessionsRef,
        where('updatedAt', '<', Timestamp.fromDate(weekAgo))
      );

      const snapshot = await getDocs(oldSessionsQuery);
      
      if (snapshot.empty) return;

      const deletePromises = snapshot.docs.map(async doc => {
        try {
          await deleteDoc(doc.ref);
          this.memoryCache.delete(doc.id);
        } catch (error) {
          console.error(`Failed to delete session ${doc.id}:`, error);
        }
      });
      
      await Promise.all(deletePromises);
      this.stats.size = this.memoryCache.size;
      
      console.log(`Cleaned up ${snapshot.size} old sessions`);
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  };

  getStats = (): CacheStats => {
    return { ...this.stats };
  };

  clearMemoryCache = (): void => {
    this.memoryCache.clear();
    this.stats.size = 0;
  };
}

// Create singleton instance
export const contextCache = new FirestoreCache();

// Only run cleanup tasks on server
if (typeof window === 'undefined') {
  // Clear memory cache every hour
  setInterval(() => {
    contextCache.clearMemoryCache();
  }, 60 * 60 * 1000);

  // Clean up old sessions every day
  setInterval(() => {
    contextCache.clearOldSessions();
  }, 24 * 60 * 60 * 1000);

  // Initial cleanup on startup
  void contextCache.clearOldSessions();
} 