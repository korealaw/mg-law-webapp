# NEXT ACTION — 추가100 v8.4.1 재설계 적용

기준시각: 2026-09-08 15:46 KST
작업 브랜치: `recovery/v8.4.1-20260908`
운영 `main` 기능 변경 없음.

## 현재까지 PASS
- 운영 v8.4 health PASS
- secure selftest 실제 관리자키 PASS
- 실제 Google Form 제출 -> 자동 APPROVED -> `/extra/` 추가100 개방 E2E PASS
- 기존 추가100 의미중복 감사 완료: 콘텐츠 품질 FAIL
- 재설계 후보 v2 구조/중복 QA PASS
- 후보 v2 법적 시점 표본감사 PASS
- 새마을금고법 제79조의2 현행 확인: 금고감독위원회는 중앙회에 두고, 위원장 포함 5명으로 구성하며 감독/검사 관련 법정사항을 심의/의결

## 후보 v2 핵심 QA
- 100/100
- B001~B100 연속/고유
- 4지선다/단일정답 100/100
- 무료100 통합 최근접 유사도 최대 0.262, 평균 0.104
- 무료100 통합 유사도 >0.30: 0문항
- 후보100 내부 통합 유사도 >=0.40: 0쌍
- 난이도 B 38 / C 62

## 실제 적용 원칙
과거 RC의 `Code.gs` 전체를 덮어쓰지 않는다. 현재 운영 소스에는 selftest와 admin 수정 등 이후 복구내용이 존재하므로 전체 교체는 퇴행 위험이 있다.

반드시 현재 Apps Script 편집기 `Code.gs`에서 다음 상수 블록만 교체한다.

`const PROTECTED_QUESTION_BANK = [...]`

후보 소스: `PROTECTED_QUESTION_BANK_v8.4.1_candidate_v2.js` (비공개 작업물)

기존 다음 항목은 변경하지 않는다.
- Deployment ID / `/exec` URL
- `ADMIN_KEY`
- `_WEBAPP_ACCESS_V84`
- Google Form 응답
- 설치형 `onResearchFormSubmit` 트리거
- setupProject 연결값

## 교체 후 검증 순서
1. 저장
2. 필요하면 편집기 HEAD에서 구조검사
3. 기존 웹앱 배포를 새 버전으로 갱신(새 deployment 생성 금지)
4. `/exec?action=health` -> version 8.4 / baseCount 100 / baseUnique true / baseOrderOK true / releaseReady true
5. secure selftest -> 전체 PASS
6. 기존 승인 브라우저 `/extra/`에서 새로운 B001~B100 실제 수신 확인
7. 다른 브라우저/시크릿에서 `/extra/` 직접 접근 차단 확인
8. 공개 프런트의 무료학습 재진입 결함을 recovery 브랜치에서 수정
9. 전체 회귀 QA 후에만 `main` 승격

## 보안
- 보호100 원문은 GitHub에 올리지 않는다.
- 후보 JS/JSON/ZIP은 비공개 작업물로만 유지한다.
- ADMIN_KEY는 채팅/GitHub/문서에 평문 기록하지 않는다.
