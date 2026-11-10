import { describe, it, expect } from 'vitest';
import { reviveComponents } from './components';

describe('reviveComponents', () => {
  it('createdAt 문자열을 Date로 복원한다', () => {
    const iso = '2026-01-02T03:04:05.000Z';
    const [c] = reviveComponents([{ id: '1', prompt: 'p', code: 'c', createdAt: iso }]);
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(iso);
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(reviveComponents({ a: 1 })).toEqual([]);
    expect(reviveComponents(null)).toEqual([]);
  });

  it('필드가 잘못된 항목은 걸러낸다', () => {
    const good = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };
    const bad = { id: 2, prompt: 'p' };
    expect(reviveComponents([bad, good])).toHaveLength(1);
  });

  it('날짜가 유효하지 않으면 걸러낸다', () => {
    const bad = { id: '1', prompt: 'p', code: 'c', createdAt: 'not-a-date' };
    expect(reviveComponents([bad])).toEqual([]);
  });
});
