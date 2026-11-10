import { describe, it, expect, beforeEach } from 'vitest';
import { readStorage, writeStorage, removeStorage } from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('저장한 값을 그대로 읽는다', () => {
    writeStorage('k', { a: 1 });
    expect(readStorage('k', null)).toEqual({ a: 1 });
  });

  it('값이 없으면 fallback을 반환한다', () => {
    expect(readStorage('missing', 'dflt')).toBe('dflt');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('bad', '{oops');
    expect(readStorage('bad', 42)).toBe(42);
  });

  it('removeStorage는 값을 지운다', () => {
    writeStorage('k', 1);
    removeStorage('k');
    expect(readStorage('k', 'gone')).toBe('gone');
  });
});
