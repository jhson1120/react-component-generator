import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

function ndjsonResponse(chunks: string[], init?: ResponseInit) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
  return new Response(body, init);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useComponentGenerator 스트리밍', () => {
  it('델타 이벤트를 받는 동안 streaming 컴포넌트의 코드를 누적한다', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('{"type":"delta","text":"const A"}\n'));
        await gate;
        controller.enqueue(encoder.encode('{"type":"done","code":"const A = 1;"}\n'));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)));

    const { result } = renderHook(() => useComponentGenerator());
    let promise!: Promise<void>;
    act(() => {
      promise = result.current.generate('버튼', undefined, 'google');
    });

    await vi.waitFor(() => {
      expect(result.current.components[0]).toMatchObject({ code: 'const A', streaming: true });
    });

    release();
    await act(async () => {
      await promise;
    });
  });

  it('done 이벤트를 받으면 최종 코드로 교체하고 streaming을 끈다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        ndjsonResponse([
          '{"type":"delta","text":"const A"}\n{"type":"do',
          'ne","code":"const A = 1;\\nrender(<A />);"}\n',
        ]),
      ),
    );

    const { result } = renderHook(() => useComponentGenerator());
    await act(async () => {
      await result.current.generate('버튼', undefined, 'google');
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]).toMatchObject({
      code: 'const A = 1;\nrender(<A />);',
      streaming: false,
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('error 이벤트를 받으면 컴포넌트를 제거하고 에러를 노출한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        ndjsonResponse(['{"type":"delta","text":"x"}\n{"type":"error","error":"중단됨"}\n']),
      ),
    );

    const { result } = renderHook(() => useComponentGenerator());
    await act(async () => {
      await result.current.generate('버튼', undefined, 'google');
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.error).toBe('중단됨');
  });

  it('HTTP 에러 응답이면 data.error를 에러로 노출한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ error: '요청이 너무 많습니다.' }, { status: 429 })),
    );

    const { result } = renderHook(() => useComponentGenerator());
    await act(async () => {
      await result.current.generate('버튼', undefined, 'google');
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.error).toBe('요청이 너무 많습니다.');
  });
});
