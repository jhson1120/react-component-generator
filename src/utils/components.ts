import type { GeneratedComponent } from '../types';

export const MAX_STORED_COMPONENTS = 30;

// localStorage에서 읽은 값은 신뢰할 수 없으므로 형태를 검증하고 createdAt을 Date로 복원한다.
export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  const result: GeneratedComponent[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item.id === 'string' &&
      typeof item.prompt === 'string' &&
      typeof item.code === 'string' &&
      typeof item.createdAt === 'string'
    ) {
      const createdAt = new Date(item.createdAt);
      if (!Number.isNaN(createdAt.getTime())) {
        result.push({ id: item.id, prompt: item.prompt, code: item.code, createdAt });
      }
    }
  }
  return result;
}
