import { describe, it, expect } from 'vitest';
import { splitSSE, extractAnthropicDelta, extractGoogleDelta } from './stream';

describe('splitSSE', () => {
  it('완성된 이벤트의 data를 추출하고 나머지 버퍼를 반환한다', () => {
    const { datas, rest } = splitSSE('data: {"a":1}\n\ndata: {"b":2}\n\ndata: {"c"');
    expect(datas).toEqual(['{"a":1}', '{"b":2}']);
    expect(rest).toBe('data: {"c"');
  });

  it('CRLF 구분자도 처리한다', () => {
    const { datas, rest } = splitSSE('event: x\r\ndata: hi\r\n\r\n');
    expect(datas).toEqual(['hi']);
    expect(rest).toBe('');
  });
});

describe('extractAnthropicDelta', () => {
  it('content_block_delta의 text를 반환한다', () => {
    const data = JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'abc' } });
    expect(extractAnthropicDelta(data)).toBe('abc');
  });

  it('텍스트 이벤트가 아니면 빈 문자열을 반환한다', () => {
    expect(extractAnthropicDelta(JSON.stringify({ type: 'message_start' }))).toBe('');
  });
});

describe('extractGoogleDelta', () => {
  it('candidates의 parts 텍스트를 이어 붙여 반환한다', () => {
    const data = JSON.stringify({ candidates: [{ content: { parts: [{ text: 'a' }, { text: 'b' }] } }] });
    expect(extractGoogleDelta(data)).toBe('ab');
  });

  it('MAX_TOKENS로 끝나면 잘림 에러를 던진다', () => {
    const data = JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS' }] });
    expect(() => extractGoogleDelta(data)).toThrow('너무 길어');
  });
});
