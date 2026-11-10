# AGENTS.md

## Operational Commands

- 패키지 매니저/런타임은 `bun` 고정. npm, yarn, pnpm 사용 금지 (`bun.lock` 기준).
- 개발 서버(API + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (포트 3002, `bun --watch`)
- 테스트: `bun run test` (vitest run, `src/**`와 `server/**` 모두 포함)
- 단일 테스트: `bunx vitest run <파일 경로>`
- 린트: `bun run lint`
- 빌드/타입체크: `bun run build` (`tsc -b && vite build`)
- 변경 후 최소 검증: `bun run lint` + `bun run test`
- 에이전트의 `git commit`은 PreToolUse 훅(`.claude/hooks/pre-commit-test.mjs`)이 `bun run test`를 먼저 실행하며, 하나라도 실패하면 차단된다. 테스트를 삭제/skip해서 통과시키지 말고 원인을 고친다.

## Golden Rules

Immutable:
- `.env`와 API 키를 커밋하거나 코드에 하드코딩하지 않는다. `.env`는 `.gitignore`로 제외되어 있다.
- 서버 환경 키(`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`) 값은 클라이언트로 내보내지 않는다. `/api/config`는 boolean만 반환한다 (`server/index.ts:147-157`).
- AI 호출은 서버(`server/`)에서만 한다. 클라이언트에서 Anthropic/Google API를 직접 호출하지 않는다.

Sensitive Files (민감 파일 판단 규칙):
- 아래에 해당하면 민감 파일로 간주한다. 읽기, 수정, 복사, 출력, 로그/PR/커밋 메시지에의 인용을 모두 금지한다. `.claude/settings.json`의 `permissions.deny`가 도구 수준에서 이를 강제하지만, 이 규칙은 deny 목록에 없는 경우의 판단 기준이다.
  - 파일명: `.env`와 그 변형(`.env.local`, `.env.production` 등), `*credential*`, `*secret*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `id_ed25519*`, `.npmrc`, `.netrc`
  - 위치: `~/.ssh/`, `~/.aws/`, `~/.config/gcloud/`
  - 내용: API 키, 토큰, 비밀번호, 개인 키, 연결 문자열이 들어 있는 파일 (파일명이 평범해도 해당)
- 판단이 애매하면 민감 파일로 취급하고, 읽지 않은 채 사용자에게 확인을 요청한다.
- 민감 파일이 필요한 작업(키 설정 등)은 사용자가 직접 하도록 안내한다. 에이전트는 값을 대신 읽거나 채우지 않는다. 필요한 변수 이름만 안내한다 (`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`).
- `.env.example`은 값이 없는 템플릿일 때만 허용한다. 실제 키가 들어 있으면 민감 파일로 취급한다.
- 우회 금지: deny 규칙에 막혔을 때 `Bash`(`cat`, `type`, `Get-Content` 등), 스크립트, 다른 도구로 같은 파일에 접근하지 않는다. 막혔다는 사실을 그대로 사용자에게 보고한다.
- 실수로 민감 값이 대화·커밋·PR에 노출되면 즉시 중단하고 사용자에게 알려 키 폐기(rotate)를 안내한다.

Do:
- AI 응답 후처리는 `server/generator.ts`의 순수 함수(`stripCodeFences`, `ensureRenderCall`)에 둔다. 부수효과가 없어 단위 테스트가 가능하다 (`server/generator.test.ts`).
- Google 모델 호출은 `withModelFallback`을 거친다. 모델 목록은 `GOOGLE_MODELS`에서 우선순위 순으로 관리한다 (`server/index.ts:5`, `server/fallback.ts`).
- 서버가 Bun 전용 API(`Bun.serve`, `process.env`)를 쓰므로 `server/index.ts`는 vitest에서 import하지 않는다. 테스트가 필요한 로직은 별도 모듈로 분리한다 (`server/generator.ts`, `server/fallback.ts`가 그 사례).

Don't:
- 생성 코드 규칙(인라인 스타일, import 금지, 끝에 `render()` 호출, TypeScript 문법 금지)을 한쪽에서만 바꾸지 않는다. 이 규칙은 `SYSTEM_PROMPT`와 `ensureRenderCall`, 클라이언트 `noInline` 렌더링이 함께 맞물려 있다 (`server/index.ts:7-49`, `server/generator.ts:13-21`, `src/components/LivePreview.tsx:240`). 프롬프트에만 의존하지도, 후처리만 믿지도 않는다.
- Gemini API 키가 URL 쿼리(`?key=`)로 전달되므로 (`server/index.ts:99`) 해당 URL을 로그나 에러 메시지에 출력하지 않는다. 현재 에러는 상태 코드만 담는다 (`server/index.ts:112`).
- 서버 에러 응답의 `503`/`429` 문자열 매칭을 깨지 않는다. 폴백/에러 메시지는 `message.includes('503')` 방식에 의존해 사용자용 한국어 오류로 변환된다 (`server/index.ts:194-208`).
- 서버 에러를 새로 던질 때는 상태 코드를 메시지에 포함하는 기존 형식(`Gemini API error: ${status}`)을 따른다.

## Project Context

프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 보여주는 도구.
Stack: React 19, TypeScript, Vite, Bun, react-live, Vitest, Testing Library.

## Standards & References

- 설치/실행/기능 설명은 `README.md` 참고. 중복 작성하지 않는다.
- 프론트엔드 세부 규칙: `src/AGENTS.md`
- 커밋 메시지: `타입: 한국어 요약` (feat/fix/refactor/chore). `/commit` 스킬 사용.
- push는 사용자가 명시적으로 요청할 때만 한다.
- UI 문구와 사용자 대상 에러 메시지는 한국어.

## Maintenance Policy

규칙과 코드 사이에 괴리가 생기면(라인 근거 불일치 포함) 작업을 멈추고 이 파일의 업데이트를 먼저 제안한다.
