// PreToolUse 훅: 에이전트가 `git commit`을 실행하기 전에 전체 테스트를 돌린다.
// 모두 통과하면 커밋을 허용하고(exit 0), 하나라도 실패하면 커밋을 차단한다(exit 2).
// exit 2의 stderr는 에이전트에게 전달되어 실패 원인을 고치도록 유도한다.
import { spawnSync } from 'node:child_process';

const TEST_CMD = process.env.PRE_COMMIT_TEST_CMD || 'bun run test';
const TAIL_LINES = 40;

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let command = '';
try {
  command = JSON.parse(raw)?.tool_input?.command ?? '';
} catch {
  // 입력을 해석할 수 없으면 훅이 작업을 막지 않도록 통과시킨다.
  process.exit(0);
}

// `git commit`, `git -c k=v commit`, `git add . && git commit ...` 모두 감지한다.
// `git commit-tree`, `git log --grep=commit` 같은 오탐을 피하려고 단어 경계로 끝을 확인한다.
const isCommit = /(^|[;&|\s])git\s+(?:-[^\s]+\s+(?:[^\s-][^\s]*\s+)?)*commit(?![\w-])/.test(command);
if (!isCommit) process.exit(0);

console.error(`[pre-commit hook] 커밋 전 테스트 실행: ${TEST_CMD}`);
const result = spawnSync(TEST_CMD, {
  shell: true,
  encoding: 'utf8',
  cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
});

if (result.status === 0) {
  console.error('[pre-commit hook] 모든 테스트 통과. 커밋을 허용합니다.');
  process.exit(0);
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split('\n');
console.error('[pre-commit hook] 테스트 실패. 커밋을 차단합니다.');
console.error('실패한 테스트를 고친 뒤 다시 커밋하세요. 테스트를 건너뛰거나 삭제해서 통과시키지 마세요.');
console.error('--- 테스트 출력 (마지막 %d줄) ---', TAIL_LINES);
console.error(output.slice(-TAIL_LINES).join('\n'));
process.exit(2);
