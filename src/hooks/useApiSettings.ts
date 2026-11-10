import { useState, useCallback } from 'react';
import type { Provider } from '../types';
import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from '../utils/storage';

type KeyMap = Partial<Record<Provider, string>>;

const DEFAULT_PROVIDER: Provider = 'google';

function isProvider(value: unknown): value is Provider {
  return value === 'anthropic' || value === 'google';
}

function loadKeys(): KeyMap {
  const raw = readStorage<unknown>(STORAGE_KEYS.apiKeys, {});
  const keys: KeyMap = {};
  if (raw && typeof raw === 'object') {
    for (const p of ['anthropic', 'google'] as const) {
      const v = (raw as Record<string, unknown>)[p];
      if (typeof v === 'string') keys[p] = v;
    }
  }
  return keys;
}

export function useApiSettings() {
  const [provider, setProviderState] = useState<Provider>(() => {
    const saved = readStorage<unknown>(STORAGE_KEYS.provider, DEFAULT_PROVIDER);
    return isProvider(saved) ? saved : DEFAULT_PROVIDER;
  });
  const [rememberKey, setRememberState] = useState<boolean>(
    () => readStorage<unknown>(STORAGE_KEYS.rememberKey, false) === true,
  );
  const [keys, setKeys] = useState<KeyMap>(() =>
    readStorage<unknown>(STORAGE_KEYS.rememberKey, false) === true ? loadKeys() : {},
  );

  const setProvider = useCallback((next: Provider) => {
    setProviderState(next);
    writeStorage(STORAGE_KEYS.provider, next);
  }, []);

  // 키는 제공자별로 보관하므로 다른 제공자로 잘못 전송되지 않는다.
  const setApiKey = useCallback(
    (key: string) => {
      const next = { ...keys, [provider]: key };
      setKeys(next);
      if (rememberKey) writeStorage(STORAGE_KEYS.apiKeys, next);
    },
    [keys, provider, rememberKey],
  );

  const setRememberKey = useCallback(
    (on: boolean) => {
      setRememberState(on);
      writeStorage(STORAGE_KEYS.rememberKey, on);
      if (on) writeStorage(STORAGE_KEYS.apiKeys, keys);
      else removeStorage(STORAGE_KEYS.apiKeys);
    },
    [keys],
  );

  return { provider, setProvider, apiKey: keys[provider] ?? '', setApiKey, rememberKey, setRememberKey };
}
