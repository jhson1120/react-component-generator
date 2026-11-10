import { describe, it, expect } from 'vitest';
import { parseStreamLines } from './parseStreamLines';

describe('parseStreamLines', () => {
  it('완성된 줄을 이벤트로 파싱하고 미완성 줄은 rest로 남긴다', () => {
    const { events, rest } = parseStreamLines('{"type":"delta","text":"a"}\n{"type":"do');
    expect(events).toEqual([{ type: 'delta', text: 'a' }]);
    expect(rest).toBe('{"type":"do');
  });

  it('빈 줄은 무시한다', () => {
    const { events } = parseStreamLines('\n{"type":"done","code":"x"}\n\n');
    expect(events).toEqual([{ type: 'done', code: 'x' }]);
  });
});
