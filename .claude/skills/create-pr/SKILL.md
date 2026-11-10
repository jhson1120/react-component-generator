---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 한국어 제목과 템플릿 본문으로 GitHub PR을 생성한다. "PR 만들어줘", "PR 생성", "풀리퀘스트 올려줘", "PR 올려줘", "pull request" 등 PR 작성·생성 요청이 있으면 커밋이나 push 이야기가 섞여 있어도 반드시 이 스킬을 사용한다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# create-pr

현재 브랜치와 base 브랜치의 차이를 분석해 PR을 만드는 스킬. 포크된 컨텍스트에서 실행되므로 사용자에게 중간 질문을 할 수 없다. 판단이 필요한 지점은 아래 규칙대로 안전한 쪽으로 결정하고, 최종 결과만 보고한다.

## 절차

### 1. 사전 확인

```bash
git branch --show-current
git status --short
gh auth status
gh repo view --json defaultBranchRef -q .defaultBranchRef.name   # base 브랜치
```

- 현재 브랜치가 base 브랜치(예: `main`)와 같으면 PR을 만들 수 없다. 변경 내용을 보고 `feat/요약-슬러그` 형태의 새 브랜치를 `git switch -c`로 만든 뒤 진행한다. base와의 차이(커밋)가 없으면 중단하고 "PR로 만들 변경이 없다"고 보고한다.
- 커밋되지 않은 변경이 있으면 PR에 포함되지 않는다. 임의로 커밋하지 말고, 결과 보고에 "미커밋 변경이 있음, `/commit`으로 먼저 커밋 필요"를 명시한다.
- `gh` 인증이 안 되어 있으면 중단하고 `gh auth login`이 필요하다고 보고한다.
- 이미 같은 브랜치의 열린 PR이 있는지 `gh pr list --head <브랜치> --json url -q '.[0].url'`로 확인한다. 있으면 새로 만들지 않고 그 URL을 보고한다.

### 2. 변경사항 분석

```bash
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
git diff <base>...HEAD
```

- 커밋 메시지와 diff를 함께 읽고 "무엇을, 왜" 바꿨는지 파악한다. 파일 목록을 나열하지 말고 사용자 관점의 변화로 요약한다.
- 테스트 파일 변경, UI 변경(스크린샷 필요 여부), 비밀 정보(`.env`, 키) 포함 여부를 확인한다. 비밀 정보가 diff에 있으면 PR을 만들지 않고 중단 보고한다.

### 3. 제목 작성

형식: `타입: 요약` (한국어, feat/fix/refactor/chore 등, 70자 이내, 마침표 없음).

- 커밋이 하나면 그 메시지를 기반으로 하고, 여럿이면 전체를 아우르는 하나의 목적으로 요약한다.

### 4. 본문 작성

`references/pr-template.md`를 Read로 읽어 그 구조 그대로 채운다. 이 스킬 디렉토리 기준 경로이며, 못 찾으면 Glob으로 `**/create-pr/references/pr-template.md`를 찾는다.

- 해당 없는 섹션은 지우지 말고 "해당 없음"으로 둔다. 리뷰어가 누락과 해당 없음을 구분할 수 있어야 한다.
- 테스트 섹션에는 실제로 실행한 결과만 적는다. 프로젝트의 `AGENTS.md`에 테스트 명령이 있으면 그 명령을 실행해 결과를 기록하고, 실행하지 않은 것을 통과했다고 쓰지 않는다.
- 본문 맨 끝에 `🤖 Generated with [Claude Code](https://claude.com/claude-code)` 줄을 넣는다.

### 5. push 및 PR 생성

```bash
git push -u origin <브랜치>
gh pr create --base <base> --head <브랜치> --title "<제목>" --body-file <임시 본문 파일>
```

- 본문은 임시 파일에 heredoc으로 쓴 뒤 `--body-file`로 넘긴다. 따옴표와 백틱이 섞인 본문이 셸에서 깨지는 것을 막는다.
- `--force`, `--no-verify`는 쓰지 않는다. push가 거부되면 원인을 보고하고 중단한다.
- 사용자가 draft를 요청한 경우에만 `--draft`를 붙인다.
- 완료 후 임시 파일을 삭제한다.

### 6. 결과 보고

다음을 간결하게 보고한다.

- PR URL, 제목, base ← head 브랜치
- 본문에 담은 핵심 변경 요약 2~3줄
- 주의사항(미커밋 변경, 실행하지 못한 테스트 등)이 있으면 함께 표기

## 주의

- PR 본문과 제목은 한국어로 쓴다. 코드 식별자와 기술 용어는 원문 그대로 둔다.
- 머지, 리뷰어 지정, 라벨 추가는 요청받지 않았으면 하지 않는다.
