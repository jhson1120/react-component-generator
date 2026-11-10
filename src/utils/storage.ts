export const STORAGE_KEYS = {
  provider: 'rcg:provider',
  rememberKey: 'rcg:remember-key',
  apiKeys: 'rcg:api-keys',
  history: 'rcg:prompt-history',
  components: 'rcg:components',
} as const;

// localStorage는 차단(프라이빗 모드)되거나 용량이 찰 수 있으므로 모든 접근을 보호한다.
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 기능 저하일 뿐 앱 동작을 막지 않는다.
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // 위와 같음
  }
}
