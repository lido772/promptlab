import { ref, push, set, onValue, remove } from 'firebase/database';
import { database } from './firebase';

const db = database;

const HISTORY_LIMIT = 50;

export async function saveToHistory(userId, originalPrompt, improvedPrompt = null) {
  try {
    const historyRef = ref(db, `users/${userId}/history`);
    const newEntryRef = push(historyRef);
    await set(newEntryRef, {
      originalPrompt,
      improvedPrompt,
      createdAt: Date.now(),
    });
    return newEntryRef.key;
  } catch (error) {
    console.error('Failed to save to history:', error);
    throw error;
  }
}

export async function getHistory(userId) {
  return new Promise((resolve, reject) => {
    const historyRef = ref(db, `users/${userId}/history`);
    onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          resolve([]);
          return;
        }

        const entries = Object.entries(data)
          .map(([id, value]) => ({
            id,
            ...value,
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, HISTORY_LIMIT);

        resolve(entries);
      },
      (error) => {
        reject(error);
      },
      { onlyOnce: true }
    );
  });
}

export async function deleteFromHistory(userId, entryId) {
  try {
    await remove(ref(db, `users/${userId}/history/${entryId}`));
  } catch (error) {
    console.error('Failed to delete from history:', error);
    throw error;
  }
}
