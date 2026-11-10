// PreToolUse 훅: 소스 코드를 수정하기 직전에 TDD 규칙(.claude/rules/tdd.md)을 상기시킨다.
// 차단하지 않고(exit 0) additionalContext로 에이전트 컨텍스트에 리마인더만 주입한다.
import path from 'node:path';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let filePath = '';
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

const rel = path.relative(process.env.CLAUDE_PROJECT_DIR || process.cwd(), filePath).replace(/\\/g, '/');

// tdd.md의 "TDD가 불필요한 대상"과 같은 기준: 테스트, 타입 정의, 설정, 문서, 스타일, 에이전트 설정.
const SKIP = [
  /\.(test|spec)\.[cm]?[jt]sx?$/,
  /(^|\/)test\//,
  /(^|\/)types\//,
  /\.d\.ts$/,
  /(^|\/)[^/]*\.config\.[cm]?[jt]s$/,
  /(^|\/)tsconfig[^/]*\.json$/,
  /\.(md|json|css|svg|html|png|lock|txt)$/,
  /^\.claude\//,
  /^\.agents\//,
  /^public\//,
];
if (SKIP.some((re) => re.test(rel))) process.exit(0);

// TDD 적용 대상은 src/, server/ 의 코드 파일이다.
if (!/^(src|server)\/.+\.[cm]?[jt]sx?$/.test(rel)) process.exit(0);

const message = `[TDD 리마인더] ${rel} 수정 직전입니다. .claude/rules/tdd.md는 Rigid 규칙입니다.
수정 전에 스스로 확인하세요.
1. 이 변경(새 동작, 버그 수정, 로직 변경)을 검증하는 실패하는 테스트를 먼저 작성했습니까?
2. 그 테스트를 실제로 실행해 RED(실패 이유: 기능 미구현)를 눈으로 확인했습니까? import 오류나 오타로 실패한 것은 RED가 아닙니다.
3. 이번 수정은 그 테스트를 통과시키는 최소한의 코드입니까? (YAGNI, 요구되지 않은 기능 금지)
하나라도 아니오라면 이 수정을 멈추고 테스트부터 작성하세요. 이미 프로덕션 코드를 먼저 썼다면 삭제하고 RED부터 다시 시작해야 하며, "참고용"으로 남기는 것도 금지입니다.
순수 UI(마크업/스타일만), 타입 정의, 설정 파일, 리팩터링 중 green 유지 변경은 TDD 적용 대상이 아니므로 그대로 진행해도 됩니다.`;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: message,
    },
  }),
);
process.exit(0);
