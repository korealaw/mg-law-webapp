# ⚠️ LEGACY / 연구 설문 연계 웹앱 — [new]간부자격 기준 저장소 아님

> 이 저장소(`korealaw/mg-law-webapp`)는 과거 **무료100 → 생성형 AI 연구 설문 → 추가100** 구조의 웹앱이다.
> 현재 프로젝트 **[new]간부자격 / 간부직원 자격전형 DAILY** 작업에는 사용하지 않는다.
> 현재 단일 진실 소스: `kfcccpro-ship-it/mind_law` · `main`
> 현재 학생용: `https://kfcccpro-ship-it.github.io/mind_law/` 및 `/daily/`
> 새 채팅에서 "다음 작업 진행" 요청 시 이 저장소가 아니라 `mind_law/PROJECT_HANDOFF_LATEST.md`를 읽는다.

# PROJECT HANDOFF LATEST — MG 새마을금고법 톡톡

기준일: 2026-09-06
프런트 후보: **v8.4**
백엔드 후보: **v8.4**
저장소: `korealaw/mg-law-webapp`
운영 URL: `https://korealaw.github.io/mg-law-webapp/`
추가학습 URL: `https://korealaw.github.io/mg-law-webapp/extra/`

## 확정 구조

`무료 기본50 → 무료 모의50 → 무료100 완주 → (추가문제가 필요한 사람만) 생성형 AI 연구 설문 → 실제 제출 자동확인 → /extra/ 추가100 자동개방`

- 설문 목적: 새마을금고 임·직원 관련 생성형 AI 연구·조사
- 설문은 선택사항
- 무료100은 설문과 무관
- 추가100을 원하는 경우에만 설문 참여
- 기존 설문 참여자는 일부 문항/예시 보완 때문에 재참여 가능. 기존 응답도 계속 활용
- 수동 승인 없음
- 별도 이용기간 만료 없음
- 같은 브라우저 원칙
- 추가 URL만 공유해서는 접근 불가

## 접근 검증

백엔드 `_WEBAPP_ACCESS_V84` 레지스트리에 다음만 기록:
- 인증코드
- 동일 브라우저 확인용 무작위 기기값
- 무료100 완료시각
- 설문 제출시각
- 추가100 개방시각
- 현재 설문 제출횟수

개인별 정오답·점수·학습시간은 서버 저장하지 않음.

## 보호 콘텐츠

- 추가100 B001~B100은 비공개 Apps Script에만 존재
- 공개 `index.html` 및 `extra/index.html`에는 B### 토큰 0개
- 백엔드 문제은행 의미감사/순서/고유성 검증 유지

## 남은 실제 운영 검증

1. Apps Script v8.4 적용 및 `setupProject()` 1회 실행
2. 기존 `/exec` 배포 URL 유지 확인
3. health v8.4 확인
4. 실제 Google Form 한 건 제출하여 onFormSubmit 자동개방 확인
5. GitHub 공개 v8.4 업로드
6. 실제 휴대폰에서 50+50 완주 → 설문 → 원래 창 복귀 → `/extra/` 자동진입 E2E
7. 다른 브라우저에서 `/extra/` 주소만 열었을 때 차단 확인

브라우저 E2E는 아직 운영환경에서 최종 PASS 처리하지 않았음.

## 2026-09-08 운영 재검증

- GitHub `main`의 v8.4 공개 배포 확인
- 무료 기본학습 1문항 완료 후 새로고침 → 2/50 이어하기 확인
- 미니 모의고사 1문항 답안 저장 후 새로고침 → 1/50 이어서 응시 확인
- 무료100 미완료 브라우저에서 `/extra/` 직접 접근 → 차단 확인
- 최초 공개 정적 QA 48개 중 기능·데이터 46개 PASS, 매니페스트 해시 2개 FAIL
- `RELEASE_MANIFEST_v8.4.txt`의 root/extra 해시 불일치 교정 후 확장 QA 50/50 PASS
- 재현 가능한 정적검사 도구: `node tools/qa-v8.4.mjs`

아직 PASS로 바꾸지 않은 항목:

- Apps Script health v8.4 직접 응답
- 실제 Google Form 제출 이벤트와 자동개방
- 무료50+모의50 전체 완주 종단간 흐름
- 보호 B001~B100의 실제 서버 반환 순서

### 비공개 백엔드 순서 진단 준비

- 구형 v8.1 `Code.gs`의 B001~B100 순서는 진단 결과 PASS
- v8.4 감사의 순서 FAIL은 v8.4 비공개 파일 또는 당시 테스트를 직접 확인해야 원인 확정 가능
- 진단기 추가: `node tools/qa-private-backend.mjs /path/to/Code.gs --expected-version=8.4`
- 진단기는 보호문항 원문을 공개하지 않고 버전·수량·ID·순서·필수 구조만 출력

## 2026-10-02 재개 검증

- GitHub `main/index.html` 운영본 확인: **v8.4**
- 과거 로컬 v8.1i/v8.1g를 운영 기준으로 되돌리지 않음
- 공개 무료학습 구조 재확인: **L01~L50 = 50문항 / M01~M50 = 50문항**, ID 연속성 PASS
- 무료 기본50·모의50 이어하기 localStorage 키 유지 확인
- 무료100 완료 게이트 및 동일 브라우저 device gate 유지 확인
- 공개 `index.html` / `extra/index.html` 내 보호문항 `B###` 토큰 0건 확인
- root/extra 실행 스크립트 동일성 확인
- 90일 이용제한 코드·문구 없음 확인
- 현재 프런트 endpoint: `AKfycbzRUrMwptwCVNWP_WOcTkFkwigEZC6X9Ybe1h_Q2wEZk4qUhY7jtoORu3QvnZPO0NDv`
- 외부 도구에서는 Apps Script `?action=health` 직접 호출이 차단되어 health v8.4는 이번 재개 시점에도 운영응답 PASS로 표기하지 않음
- 현재 세션 작업공간에는 과거에 언급된 `PRIVATE_APPS_SCRIPT_v8.4_NEW_BACKEND(1).zip` 실파일이 없어 비공개 v8.4 `Code.gs`의 B001~B100 실제 반환 순서 재검증은 보류

### 다음 실제 작업
1. v8.4 비공개 Apps Script ZIP 또는 `Code.gs` 확보
2. `tools/qa-private-backend.mjs`로 version=8.4, B001~B100 수량·ID·순서·필수구조 검사
3. Apps Script 프로젝트에 반영 후 `setupProject()` 및 기존 `/exec` 배포 URL 유지 확인
4. 실제 Google Form 1건 제출 → 자동개방 → `/extra/` 진입 E2E
5. Galaxy/iPad에서 무료50+모의50 전체 완주 종단간 검증

## 2026-10-06 비공개 v8.4 백엔드 복구·검증

- 복구 파일: `PRIVATE_APPS_SCRIPT_v8.4_NEW_BACKEND(1)(1).zip`
- ZIP SHA-256: `c1dc02bba1ff2f37000c9bdd40054bf3621e08588a6ccacc650568d01f1b43d6`
- 내부 `SHA256SUMS.txt`와 실제 파일 해시 전부 일치
- `Code.gs` BUILD_INFO.VERSION: **8.4**
- `BASE_REQUIRED`: 100, `MAX_CONTENT_BATCH`: 20
- 접근 레지스트리: `_WEBAPP_ACCESS_V84`
- 구형 `ACCESS_DAYS` 없음, 기간 만료 구조 없음
- `setupProject()`, `onResearchFormSubmit`, `runSelfTest()` 존재
- 공개 API: `health`, `registerFree100`, `status`, `manifest`, `questions` 존재
- 보호 BASE 문제은행 정적 QA: **17/17 PASS**
  - B001~B100 정확히 100문항
  - ID 100/100 고유
  - 반환 순서 B001→B100 PASS
  - 선택지 4개, answer 0~3, 질문/1단계/2단계/sources 모두 PASS
  - 질문문장 고유성 PASS
- 현재 GitHub `main/index.html`의 v8.4 API 계약과 구조적으로 호환
- 비공개 ZIP은 공개 GitHub에 업로드하지 않음

### 현재 남은 운영 검증

1. 현재 프런트 endpoint의 `?action=health` 운영 응답 직접 확인
2. health가 version=8.4 / releaseReady=true이면 **백엔드 재설치 금지**, 현행 유지
3. health가 구버전·오류이면 복구 ZIP을 기준으로 Apps Script 교체/배포
4. 실제 Google Form 1건 제출 → 자동 APPROVED → `/extra/` 진입 E2E
5. 실제 Galaxy/iPad에서 무료50+모의50 전체 완주 종단간 확인

외부 검사 도구에서는 script.google.com 운영 `/exec` 직접 호출이 차단될 수 있으므로, health는 실제 브라우저 또는 Apps Script 운영환경에서 최종 확인한다.

## 2026-10-06 운영 health 직접 확인

사용자 실제 브라우저에서 현재 운영 Apps Script endpoint의 `?action=health` 응답을 직접 확인함.

확인값:
- `status: OK`
- `version: 8.4`
- `deviceBinding: true`
- `free100Gate: true`
- `automaticSurveyUnlock: true`
- `accessExpiry: false`
- `productionFilter: "MG_ONLY"`
- `selfTest: true`
- `protectedContent: true`
- `questionBank.baseCount: 100`
- `questionBank.baseLoaded: 100`
- `questionBank.baseRequired: 100`
- `questionBank.baseUnique: true`
- `questionBank.baseOrderOk: true`
- `questionBank.extraCount: 0`
- `questionBank.totalReleased: 100`
- `questionBank.releaseReady: true`

판정:
- **현재 운영 백엔드는 정상 v8.4로 확인됨**
- 복구한 `PRIVATE_APPS_SCRIPT_v8.4_NEW_BACKEND(1)(1).zip`으로 재설치/덮어쓰기하지 않음
- 기존 `/exec` 배포 URL 유지
- 백엔드 정적 QA + 운영 health 모두 PASS
- 다음 미완료 검증은 실제 사용자 흐름 E2E(무료100 완주 → 설문 제출 → APPROVED → /extra/ 자동진입 및 타 브라우저 차단)임

