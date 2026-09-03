# PROJECT_HANDOFF_LATEST

## 프로젝트
- 이름: 새마을금고법 학습 웹앱
- 공개 저장소: `korealaw/mg-law-webapp`
- 기본 브랜치: `main`
- GitHub Pages: `main` / `(root)`
- 공개 예정 주소: https://korealaw.github.io/mg-law-webapp/

## 현재 기준 버전
- Frontend: v8.1
- Backend: Google Apps Script v8.1
- 기준일: 2026-09-03

## 운영 구조
1. GitHub Pages에는 공개 프런트엔드만 둔다.
2. BASE100 보호 문제은행은 Google Apps Script 서버에만 둔다.
3. 관리자 접근키, 관리자용 비밀값, 보호 문제 원문은 공개 GitHub에 커밋하지 않는다.
4. `main`을 운영 기준 원본으로 사용한다.
5. 변경 시: 최신 `main` 확인 → 수정 → QA → 커밋 → Pages 반영 → 실제 URL 점검 순서로 진행한다.

## v8.1 검증 완료 사항
- Apps Script 기존 canonical deployment를 새 버전으로 갱신
- Health: `status=OK`, `version=8.1`
- BASE 문제은행: 100/100, `releaseReady=true`
- 관리자 self-test 전체 통과
  - 승인 전 PENDING
  - 승인 후 APPROVED
  - 최초 기기 귀속
  - 동일 기기 허용
  - 다른 기기 차단 DEVICE_MISMATCH
  - 기기 초기화 후 새 기기 허용
  - 만료 EXPIRED
- 미승인 `manifest` 요청: NOT_FOUND
- 미승인 `questions` 요청: NOT_FOUND + 빈 questions
- 공개 HTML에서 보호 문항 B001~B100 미노출 확인

## 공개 프런트엔드 핵심 흐름
- 신규 접속 시 체험 학습 진입
- 체험 학습 8개념
- 미니 모의고사 10문항
- 설문 이동
- 동일 인증코드로 설문 화면 다시 열기 가능
- 설문 제출 후 승인 상태 확인
- 승인된 이용자에게만 서버에서 BASE100 전달
- 기본 제공 범위: 100문항 / 승인일부터 90일
- 100문항 이후는 추가 학습·참고용이며 지속 제공·즉시 유지보수를 보장하지 않음

## 다음 작업
1. 이 폴더의 `index.html`, `README.md`, `CHANGELOG.md`, `PROJECT_HANDOFF_LATEST.md`, `.nojekyll`을 저장소 루트에 업로드한다.
2. GitHub Pages 배포 완료를 확인한다.
3. 공개 URL에서 PC/모바일 실사용 흐름을 점검한다.
4. 첫 실제 승인 이용자가 발생하면 승인된 BASE20 로딩 E2E를 최종 확인한다.
5. 이후 v8.2에서 필요할 때만 코드 모듈화를 검토한다.
