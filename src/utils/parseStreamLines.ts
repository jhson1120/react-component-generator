export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; code: string }
  | { type: 'error'; error: string };

/** 서버가 보낸 NDJSON 버퍼를 이벤트로 파싱하고, 미완성 마지막 줄은 rest로 반환한다. */
export function parseStreamLines(buffer: string): { events: StreamEvent[]; rest: string } {
  const lines = buffer.split('\n');
  const rest = lines.pop() ?? '';
  const events = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as StreamEvent);
  return { events, rest };
}
