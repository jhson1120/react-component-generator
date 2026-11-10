import { useState, useCallback } from 'react';
import { addToHistory } from '../utils/history';
import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from '../utils/storage';

function loadHistory(): string[] {
  const raw = readStorage<unknown>(STORAGE_KEYS.history, []);
  return Array.isArray(raw) ? raw.filter((p): p is string => typeof p === 'string') : [];
}

export function usePromptHistory() {
  const [history, setHistory] = useState<string[]>(loadHistory);

  const addPrompt = useCallback((prompt: string) => {
    setHistory((prev) => {
      const next = addToHistory(prev, prompt);
      writeStorage(STORAGE_KEYS.history, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    removeStorage(STORAGE_KEYS.history);
  }, []);

  return { history, addPrompt, clearHistory };
}
