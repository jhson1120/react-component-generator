# src (Frontend)

## Module Context

Vite + React 19 클라이언트. 서버(`server/`)와는 `/api/*` HTTP로만 통신하며 서버 코드를 import하지 않는다.

## Tech Stack & Constraints

- 상태 관리 라이브러리 없음. `useState`/`useCallback` + 커스텀 훅(`hooks/useComponentGenerator.ts`)만 사용한다.
- 미리보기는 `react-live`만 사용한다. 생성 코드를 `eval`/`new Function`/`dangerouslySetInnerHTML`로 직접 실행하지 않는다.
- API 호출은 상대 경로 `fetch('/api/...')`를 쓴다. 호스트/포트를 하드코딩하지 않는다 (`vite.config.ts`의 proxy가 3002로 전달).
- 스타일은 `App.css` 전역 클래스(`window`, `titlebar`, `btn` 등)를 재사용한다. 새 UI 라이브러리를 추가하지 않는다.
- 공용 타입은 `types/index.ts`에 둔다. 컴포넌트 props 타입은 해당 파일 안에 정의한다.

## Implementation Patterns

- 컴포넌트는 `components/PascalCase.tsx`의 named export. `App`만 default export.
- 훅은 `hooks/useXxx.ts`, 반환 타입 인터페이스를 명시한다.
- UI 문구는 한국어, 시간 표시는 `toLocaleTimeString('ko-KR', ...)`.
- 서버 에러는 `data.error`를 읽어 `Error`로 던지고 훅에서 `error` 상태로 노출한다 (`hooks/useComponentGenerator.ts`).

## Testing Strategy

- 실행: `bun run test` (vitest run), 단일 파일은 `bunx vitest run src/components/PromptInput.test.tsx`.
- 환경: jsdom, `src/test/setup.ts`에서 jest-dom 매처 등록 및 테스트 후 `cleanup()`.
- 테스트 파일은 대상 옆에 `*.test.tsx`로 둔다. 쿼리는 `getByRole` + 접근 가능한 이름 우선 (`PromptInput.test.tsx` 패턴).
- 테스트 설명은 한국어 문장형.

## Local Golden Rules

Do:
- 생성 코드는 반드시 `LiveProvider`의 `noInline`으로 렌더링한다. 이 모드에서는 코드가 `render(<X />)`를 호출해야 화면이 그려진다 (`components/LivePreview.tsx:240`). 서버가 `ensureRenderCall`로 보정하므로 (`server/generator.ts:13-21`) 클라이언트에서 `noInline`을 빼거나 중복 보정하지 않는다.
- 미리보기 새로고침은 `LivePreview`의 `key`를 바꿔 리마운트하는 방식을 유지한다 (`components/ComponentCard.tsx:325`). 애니메이션 컴포넌트 재실행 용도다.
- 재생성은 `App.handleGenerate`를 거쳐 호출한다. 키 검증 로직이 그곳에 있다 (`App.tsx:34-40`).

Don't:
- API 키를 `localStorage`/`sessionStorage`/쿠키/URL에 저장하지 않는다. 키는 `App`의 메모리 상태로만 두고 요청 body로만 전송한다 (`App.tsx:14`, `hooks/useComponentGenerator.ts:188`).
- 서버 환경 키 값을 클라이언트로 받지 않는다. `/api/config`는 provider별 boolean만 반환하며 클라이언트는 그것만 사용한다 (`App.tsx:25-27`). 키 값을 노출하는 응답 필드를 추가하지 않는다.
- provider 전환 시 입력 키 초기화를 제거하지 않는다. 다른 제공자에 키가 잘못 전송되는 것을 막는다 (`App.tsx:42-45`).
- 키를 빈 문자열로 body에 보내지 않는다. `apiKey`가 없으면 필드를 생략해 서버 env 키를 쓰게 한다 (`hooks/useComponentGenerator.ts:188`, `App.tsx:39`).
- 새 로직을 추가할 때 테스트 경계를 인지한다. 현재 테스트는 `PromptInput`뿐이며 `App`, `useComponentGenerator`, `ComponentCard`는 미테스트다. 이 파일들의 분기 로직(키 검증, 에러 처리)을 수정하면 테스트를 함께 추가한다.

## Maintenance

이 규칙과 코드가 어긋나면 수정 대신 먼저 업데이트를 제안한다.
