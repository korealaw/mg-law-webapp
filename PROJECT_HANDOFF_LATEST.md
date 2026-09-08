# PROJECT HANDOFF LATEST — MG 새마을금고법 톡톡

기준시각: **2026-09-08 14:01 KST**
저장소: `korealaw/mg-law-webapp`
운영 브랜치: `main`
복구 작업 브랜치: `recovery/v8.4.1-20260908`
복구 전 보존 브랜치: `backup/pre-recovery-20260908`
운영 프런트: **v8.4**
운영 Apps Script 소스: **v8.4**
현재 Apps Script 웹앱 배포: **버전 3 (2026-09-08 09:59 KST)**

> 새 채팅에서 사용자가 **“다음 작업 진행”**이라고만 말하면, 이 문서를 기준으로 아래 `즉시 다음 작업`부터 이어간다. 이미 완료한 진단을 반복하거나 사용자에게 처음부터 다시 설명하게 하지 않는다.

---

## 1. 목표 구조

`무료 기본50 → 무료 모의50 → 무료100 완주 → (추가문제가 필요한 사람만) 생성형 AI 연구 설문 → 실제 제출 자동확인 → /extra/ 추가100 자동개방`

- 설문 목적: 새마을금고 임·직원 관련 생성형 AI 연구·조사
- 설문은 선택사항
- 무료100은 설문과 무관
- 추가100을 원하는 경우에만 설문 참여
- 수동 승인 없음
- 별도 90일 이용기간 없음
- 동일 브라우저 원칙
- `/extra/` URL만 공유해서는 보호100 접근 불가
- 개인별 정오답·점수·학습시간은 서버 저장하지 않음

---

## 2. 현재까지 확정적으로 PASS 된 것

### GitHub / 공개 프런트

- GitHub `main`은 v8.4 공개 프런트 상태.
- 공개 `index.html` / `extra/index.html`에는 보호문항 `B###` 원문이 없음.
- 무료 기본 50 + 모의 50, 총 100문항 구조 존재.
- 12개 파트 선택 구조 존재.
- 프런트 endpoint는 현재 운영 Apps Script `/exec`를 가리킴.
- 정적 QA 도구: `tools/qa-v8.4.mjs`.

### Apps Script 편집기 소스

사용자 화면으로 직접 확인:

- 프로젝트명: `MG 새마을금고법 톡톡 · v8.4 백엔드`
- `BUILD_INFO.VERSION = '8.4'`
- `BASE_REQUIRED = 100`
- 보호문항 B001~B100이 `Code.gs`에 존재
- 접근 레지스트리: `_WEBAPP_ACCESS_V84`
- 관리자 HTML 실제 파일명: **`admin.html`**

### setupProject()

2026-09-08 실행 성공:

- `v8.4 설정 완료`
- 연구 설문 응답 Spreadsheet 자동 연결 성공
- 응답 탭: `Form Responses 1`
- 자동개방 레지스트리: `_WEBAPP_ACCESS_V84`
- `SPREADSHEET_ID:''`, `RESPONSE_SHEET_NAME:''`는 자동탐색 구조이므로 장애 원인이 아님

### 설치형 트리거

트리거 화면으로 확인:

- 함수: `onResearchFormSubmit`
- 이벤트: **스프레드시트에서 → 양식 제출 시**
- 배포: Head
- 오류율 표시 없음
- 트리거 1개

### 실제 운영 health

운영 `/exec?action=health`에서 실제 확인:

- `status: OK`
- `version: 8.4`
- `deviceBinding: true`
- `free100Gate: true`
- `automaticSurveyUnlock: true`
- `accessExpiry: false`
- `productionFilter: MG_ONLY`
- `selfTest: true`
- `protectedContent: true`
- `baseCount: 100`
- `baseLoaded: 100`
- `baseRequired: 100`
- `baseUnique: true`
- `baseOrderOK: true`
- `extraCount: 0`
- `totalReleased: 100`
- `releaseReady: true`

따라서 과거 감사문서의 `B001~B100 순서 FAIL`은 **현재 운영에서는 해결됨**.

---

## 3. 관리자 HTML 문제와 조치 이력

### 발견된 직접 결함

실제 파일명은 `admin.html`인데 `doGet()`이 다음처럼 대문자 파일을 호출하고 있었음.

```javascript
const t = HtmlService.createTemplateFromFile('Admin');
```

이를 다음으로 수정함.

```javascript
const t = HtmlService.createTemplateFromFile('admin');
```

기존 배포를 새로 만들지 않고 같은 Deployment ID를 유지한 채 **버전 2**로 갱신함.

### admin 템플릿 직접 진단

임시 진단 함수 `diagnoseAdminRender()`를 실행했고 결과:

`ADMIN_RENDER_OK / length=5654`

즉 편집기 HEAD에서 `admin.html` 템플릿 자체는 정상 렌더링됨.

### 그러나 관리자 HTML 브라우저 경로는 여전히 실패

`/exec?key=<ADMIN_KEY>` 접근 시 일반창/시크릿창 모두 Google Drive의

`현재 파일을 열 수 없습니다.`

화면으로 실패.

따라서 핵심 학습 API와 관리자 HtmlService 경로를 분리하여 운영 검증을 계속하기로 함.

---

## 4. secure selftest endpoint 추가 — 현재 여기까지 완료

`doGet(e)`의 `health` 분기 바로 다음, `registerFree100` 분기 전에 아래 `selftest` 분기를 추가함.

```javascript
if (p.action === 'selftest') {
  try {
    const key = p.key || '';

    if (!validAdminKey_(key)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'ADMIN_KEY_INVALID'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const result = runSelfTest(key);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'OK',
        version: BUILD_INFO.VERSION,
        result: result
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ERROR',
        message: String(err && err.message ? err.message : err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

이 코드를 저장하고 **같은 기존 배포를 버전 3 (2026-09-08 09:59)**으로 갱신함.

### 버전 3 실제 반영 검증 — PASS

관리자 키 없이:

`/exec?action=selftest`

호출 결과:

```json
{"status":"ADMIN_KEY_INVALID"}
```

즉:

- 버전 3이 실제 운영 `/exec`에 반영됨
- `selftest` 분기가 실제 배포에서 동작함
- `ContentService` 경로는 정상

---

# 5. 즉시 다음 작업 — 새 채팅에서 여기부터

## STEP 1 — 관리자 키를 포함한 selftest 실행

사용자가 관리자 키를 채팅에 공개하지 않도록 한다.

기존 운영 웹앱 URL에 다음처럼 호출하도록 안내:

`/exec?action=selftest&key=<ADMIN_KEY>`

주의:

- `?action=selftest` 뒤에는 `?key=`가 아니라 **`&key=`**
- 주소창에 관리자 키가 보이므로 캡처 시 주소창을 제외하거나 가림
- JSON 결과 부분만 받음

### 기대 결과

정상 시 대략:

```json
{
  "status":"OK",
  "version":"8.4",
  "result": ...
}
```

`result`가 문자열/객체 중 어느 형식인지는 현재 `runSelfTest(key)` 구현에 따르므로 실제 응답을 보고 판정한다.

## STEP 2 — selftest 결과 판정

반드시 확인할 항목:

- 무료100 미완료 차단
- 무료100 등록
- 설문 전 차단
- 설문 제출 후 `APPROVED`
- 동일 브라우저 허용
- 다른 브라우저 `DEVICE_MISMATCH`
- 보호100 releaseReady
- 보호100 수량 100
- B001~B100 순서/고유성
- 테스트 임시 레지스트리 정리 여부

자가점검 PASS 전에는 실제 운영 완전복구를 선언하지 않는다.

## STEP 3 — 실제 Google Form 제출 E2E 1건

자가점검 PASS 후 실제 운영 연결 검증:

1. 테스트 브라우저에서 무료100 완료 레지스트리 확보
2. 연구 설문 열기
3. 인증코드 자동입력 확인
4. 실제 설문 1건 제출
5. `onResearchFormSubmit` 실제 실행 확인
6. 동일 브라우저 `status` → `APPROVED` 확인
7. `/extra/` 진입
8. 보호문항 실제 서버 로드 확인

운영 설문응답이나 기존 사용자의 레지스트리를 삭제하지 않는다.

## STEP 4 — 다른 브라우저 보호검증

동일 `/extra/` URL을 시크릿/다른 브라우저에서 열어 보호문항이 차단되는지 확인.

## STEP 5 — 공개 프런트 v8.4.1 결함 수정

백엔드 검증 후 GitHub `recovery/v8.4.1-20260908`에서 프런트 수정.

확정된 결함:

- 무료 학습에서 답을 고르면 `state.study.answered/selected`는 메모리에만 존재
- 해설은 DOM으로만 렌더링
- 저장되는 `TRIAL_STUDY_PROGRESS_KEY` 데이터에는 `answered`, `selected`가 없음
- 답을 선택하고 해설을 본 뒤 다른 화면으로 갔다가 복귀하면, 질문은 새것처럼 보이지만 내부 `answered=true`일 수 있어 재응답이 막히는 재진입 상태 불일치 가능

수정 방향:

- 답변 직후 `answered`, `selected`를 안전하게 진행상태에 저장
- 복귀 시 선택지/정오표시/해설을 재구성
- 또는 해설 확인 전 화면이탈 시 상태를 명시적으로 복구 가능한 형태로 설계
- 기존 사용자의 저장키 호환 유지
- 기존 진도 초기화 금지

## STEP 6 — 회귀 QA

- `tools/qa-v8.4.mjs`
- 무료50
- 모의50
- 12파트
- root/extra 실행코드 일치
- 보호 B### 공개 노출 0
- endpoint 일치
- 이어학습 재진입 회귀 테스트 추가

## STEP 7 — 최종 main 승격

모든 실제 E2E PASS 후에만:

- 복구 브랜치의 프런트 수정본을 `main`에 반영
- `CHANGELOG.md`
- `PROJECT_HANDOFF_LATEST.md`
- 최종 감사문서
- 릴리스 매니페스트 갱신

그 전에는 `main`을 기능적으로 변경하지 않는다.

---

## 6. 보안/데이터 보존 주의

- 관리자 키는 채팅/문서/GitHub에 평문 저장하지 않는다.
- 이전 캡처에서 관리자 키가 노출된 적이 있으므로 **최종 복구 완료 시 ADMIN_KEY 회전(교체) 필요**.
- 키 교체는 최종 E2E 완료 전에는 하지 않는다.
- 보호 B001~B100 원문을 공개 GitHub에 올리지 않는다.
- 연구 설문 응답 데이터를 GitHub에 복사하지 않는다.
- `_WEBAPP_ACCESS_V84` 기존 이용자 기록을 일괄 삭제/초기화하지 않는다.
- 현재 기존 Deployment ID와 `/exec` URL을 유지한다.

---

## 7. 복구 상태 요약

완료:

- 백업 브랜치 확보
- v8.4 Apps Script 소스 확인
- setupProject 정상
- 설문응답 Spreadsheet 정상 연결
- 자동개방 레지스트리 정상
- 설치형 트리거 정상
- 운영 health v8.4 정상
- 보호100 수량/고유성/순서/releaseReady 정상
- `Admin` → `admin` 파일명 결함 수정
- admin 템플릿 직접 렌더 PASS
- secure selftest endpoint 추가
- 기존 Deployment ID 유지한 버전 3 배포
- `/exec?action=selftest` → `ADMIN_KEY_INVALID` 확인

미완료:

1. **관리자 키 포함 selftest 실제 결과 확인 — 가장 먼저 할 일**
2. 실제 Google Form 제출 → 자동 APPROVED E2E
3. 실제 `/extra/` 보호100 서버 수신 E2E
4. 다른 브라우저 차단 E2E
5. 프런트 무료학습 재진입 결함 수정
6. 모바일 50+50 전체 종단간 테스트
7. 관리자 키 최종 회전
8. 최종 감사/CHANGELOG/manifest
9. 검증 완료본 `main` 승격

---

## 새 채팅 시작 규칙

사용자가 새 채팅에서 **“다음 작업 진행”**이라고만 입력하면:

1. 이 문서의 상태를 신뢰하되, 운영상 변경 가능성이 있는 항목만 최소 재확인한다.
2. 사용자에게 지금까지 한 작업을 다시 설명하게 하지 않는다.
3. 가장 먼저 **`/exec?action=selftest&key=<ADMIN_KEY>` 실행 결과**를 받는 단계부터 시작한다.
4. ADMIN_KEY는 사용자에게 채팅에 입력하도록 요구하지 않는다.
5. 실제 운영 완전복구는 selftest + 실제 설문 E2E + 보호100 + 다른 브라우저 차단 + 프런트 회귀 QA가 모두 PASS 한 뒤 선언한다.
