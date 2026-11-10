// 상위 API의 SSE 스트림을 파싱하는 순수 함수들. 부수효과가 없어 단위 테스트가 가능하다.

/** SSE 버퍼에서 완성된 이벤트의 data 값을 추출하고, 미완성 나머지를 반환한다. */
export function splitSSE(buffer: string): { datas: string[]; rest: string } {
  const parts = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = parts.pop() ?? '';
  const datas = parts
    .map((block) =>
      block
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n'),
    )
    .filter((data) => data.length > 0);
  return { datas, rest };
}

/** Anthropic 스트림 이벤트에서 텍스트 델타를 추출한다. 텍스트가 아니면 빈 문자열. */
export function extractAnthropicDelta(data: string): string {
  const event = JSON.parse(data) as {
    type: string;
    delta?: { type?: string; text?: string };
  };
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return event.delta.text ?? '';
  }
  return '';
}

/** Gemini 스트림 청크에서 텍스트를 추출한다. 토큰 한도로 잘렸으면 에러를 던진다. */
export function extractGoogleDelta(data: string): string {
  const chunk = JSON.parse(data) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };
  const candidate = chunk.candidates?.[0];
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('생성된 코드가 너무 길어 잘렸습니다. 더 간단한 컴포넌트를 요청해주세요.');
  }
  return candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
}
