import { describe, it, expect } from 'vitest';
import { validatePrompt, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePrompt', () => {
  it('최대 길이는 500자이다', () => {
    expect(MAX_PROMPT_LENGTH).toBe(500);
  });

  it('500자 이하이면 유효하다', () => {
    expect(validatePrompt('가'.repeat(500))).toEqual({ valid: true });
  });

  it('500자를 넘으면 유효하지 않고 에러 메시지를 반환한다', () => {
    const result = validatePrompt('가'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('500');
  });

  it('빈 문자열은 길이 검증을 통과한다', () => {
    expect(validatePrompt('')).toEqual({ valid: true });
  });
});
