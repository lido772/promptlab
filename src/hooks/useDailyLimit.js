import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const DAILY_LIMIT = 3;
const STORAGE_KEY = 'promptup_daily';

export function useDailyLimit() {
  const { user } = useAuth();
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [total, setTotal] = useState(DAILY_LIMIT);

  useEffect(() => {
    checkLimit();
  }, [user]);

  const checkLimit = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      if (cached.date === today && typeof cached.remaining === 'number') {
        setRemaining(cached.remaining);
        setTotal(cached.total || DAILY_LIMIT);
      } else {
        setRemaining(DAILY_LIMIT);
        setTotal(DAILY_LIMIT);
      }
    } catch (err) {
      setRemaining(DAILY_LIMIT);
      setTotal(DAILY_LIMIT);
    }
  };

  const updateRemaining = (newRemaining, newTotal = DAILY_LIMIT) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const safeRemaining = Math.max(0, parseInt(newRemaining, 10) || 0);
      const safeTotal = parseInt(newTotal, 10) || DAILY_LIMIT;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: today,
          remaining: safeRemaining,
          total: safeTotal,
        })
      );

      setRemaining(safeRemaining);
      setTotal(safeTotal);
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  };

  return { remaining, total, checkLimit, updateRemaining };
}
