import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

function mockGenerate(code: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code }) }),
  );
}

describe('useComponentGenerator 보존', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('생성한 컴포넌트가 새로 마운트해도 유지된다', async () => {
    mockGenerate('render(<div />);');
    const first = renderHook(() => useComponentGenerator());
    await act(() => first.result.current.generate('카드', undefined, 'google'));
    expect(first.result.current.components).toHaveLength(1);
    first.unmount();

    const second = renderHook(() => useComponentGenerator());
    expect(second.result.current.components).toHaveLength(1);
    expect(second.result.current.components[0].prompt).toBe('카드');
    expect(second.result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('삭제한 컴포넌트는 다시 불러와도 나타나지 않는다', async () => {
    mockGenerate('render(<div />);');
    const first = renderHook(() => useComponentGenerator());
    await act(() => first.result.current.generate('카드', undefined, 'google'));
    const id = first.result.current.components[0].id;
    act(() => first.result.current.removeComponent(id));
    first.unmount();

    const second = renderHook(() => useComponentGenerator());
    expect(second.result.current.components).toEqual([]);
  });

  it('전체 삭제도 유지된다', async () => {
    mockGenerate('render(<div />);');
    const first = renderHook(() => useComponentGenerator());
    await act(() => first.result.current.generate('카드', undefined, 'google'));
    act(() => first.result.current.clearAll());
    first.unmount();

    const second = renderHook(() => useComponentGenerator());
    expect(second.result.current.components).toEqual([]);
  });

  it('저장은 최근 30개까지만 한다', async () => {
    mockGenerate('render(<div />);');
    const first = renderHook(() => useComponentGenerator());
    for (let i = 0; i < 31; i++) {
      await act(() => first.result.current.generate(`p${i}`, undefined, 'google'));
    }
    first.unmount();

    const second = renderHook(() => useComponentGenerator());
    expect(second.result.current.components).toHaveLength(30);
    expect(second.result.current.components[0].prompt).toBe('p30');
  });
});
