import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiSettings } from './useApiSettings';
import { STORAGE_KEYS } from '../utils/storage';

describe('useApiSettings', () => {
  beforeEach(() => localStorage.clear());

  it('기본값은 google 제공자, 빈 키, 키 저장 꺼짐이다', () => {
    const { result } = renderHook(() => useApiSettings());
    expect(result.current.provider).toBe('google');
    expect(result.current.apiKey).toBe('');
    expect(result.current.rememberKey).toBe(false);
  });

  it('선택한 제공자를 저장하고 다시 불러온다', () => {
    const first = renderHook(() => useApiSettings());
    act(() => first.result.current.setProvider('anthropic'));
    first.unmount();

    const second = renderHook(() => useApiSettings());
    expect(second.result.current.provider).toBe('anthropic');
  });

  it('저장된 제공자 값이 올바르지 않으면 기본값을 쓴다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('openai'));
    const { result } = renderHook(() => useApiSettings());
    expect(result.current.provider).toBe('google');
  });

  it('키 저장이 꺼져 있으면 입력한 키가 localStorage에 저장되지 않는다', () => {
    const { result } = renderHook(() => useApiSettings());
    act(() => result.current.setApiKey('secret-1'));

    expect(result.current.apiKey).toBe('secret-1');
    expect(localStorage.getItem(STORAGE_KEYS.apiKeys)).toBeNull();
  });

  it('키 저장을 켜면 키를 저장하고 다시 불러온다', () => {
    const first = renderHook(() => useApiSettings());
    act(() => first.result.current.setRememberKey(true));
    act(() => first.result.current.setApiKey('secret-1'));
    first.unmount();

    const second = renderHook(() => useApiSettings());
    expect(second.result.current.rememberKey).toBe(true);
    expect(second.result.current.apiKey).toBe('secret-1');
  });

  it('이미 입력한 키가 있는 상태에서 키 저장을 켜면 그 키도 저장된다', () => {
    const first = renderHook(() => useApiSettings());
    act(() => first.result.current.setApiKey('secret-1'));
    act(() => first.result.current.setRememberKey(true));
    first.unmount();

    const second = renderHook(() => useApiSettings());
    expect(second.result.current.apiKey).toBe('secret-1');
  });

  it('키 저장을 끄면 저장된 키가 삭제된다', () => {
    const { result } = renderHook(() => useApiSettings());
    act(() => result.current.setRememberKey(true));
    act(() => result.current.setApiKey('secret-1'));
    act(() => result.current.setRememberKey(false));

    expect(localStorage.getItem(STORAGE_KEYS.apiKeys)).toBeNull();
  });

  it('키는 제공자별로 분리되어 다른 제공자로 전송되지 않는다', () => {
    const { result } = renderHook(() => useApiSettings());
    act(() => result.current.setProvider('google'));
    act(() => result.current.setApiKey('google-key'));
    act(() => result.current.setProvider('anthropic'));

    expect(result.current.apiKey).toBe('');

    act(() => result.current.setProvider('google'));
    expect(result.current.apiKey).toBe('google-key');
  });
});
