import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptHistory } from './usePromptHistory';

describe('usePromptHistory', () => {
  beforeEach(() => localStorage.clear());

  it('처음에는 비어 있다', () => {
    const { result } = renderHook(() => usePromptHistory());
    expect(result.current.history).toEqual([]);
  });

  it('추가한 프롬프트가 최신순으로 쌓인다', () => {
    const { result } = renderHook(() => usePromptHistory());
    act(() => result.current.addPrompt('첫 번째'));
    act(() => result.current.addPrompt('두 번째'));
    expect(result.current.history).toEqual(['두 번째', '첫 번째']);
  });

  it('새로 마운트해도 히스토리가 유지된다', () => {
    const first = renderHook(() => usePromptHistory());
    act(() => first.result.current.addPrompt('유지되는 프롬프트'));
    first.unmount();

    const second = renderHook(() => usePromptHistory());
    expect(second.result.current.history).toEqual(['유지되는 프롬프트']);
  });

  it('clearHistory는 히스토리를 모두 지운다', () => {
    const first = renderHook(() => usePromptHistory());
    act(() => first.result.current.addPrompt('a'));
    act(() => first.result.current.clearHistory());
    expect(first.result.current.history).toEqual([]);
    first.unmount();

    const second = renderHook(() => usePromptHistory());
    expect(second.result.current.history).toEqual([]);
  });
});
