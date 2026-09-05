# MG 새마을금고법 톡톡 v8.2 — 전체 기능·설문 연계 최종 검수

기준일: 2026-09-05

## 결론
전체 아키텍처는 타당하다. 무료 체험이 연구 설문으로 이어지고, 실제 설문 응답의 웹앱 인증코드를 운영자가 확인한 뒤 승인된 이용자에게만 보호 BASE100을 제공하는 구조는 목적과 일치한다.

다만 v8.1 계열에는 `설문 창을 열었다`와 `설문을 실제 제출했다`가 같은 로컬 상태로 취급되는 핵심 결함이 있었고, 승인상태 처리 중복·중복 설문행·BASE 범위학습과 일반진도 간 충돌 가능성이 있었다. v8.2에서 이를 구조적으로 분리·보완했다.

## 구간별 판정

| 구간 | 기존 위험 | v8.2 조치 | 판정 |
|---|---|---|---|
| 무료학습 30 | 중간 종료 시 진도 유실 가능성은 이전 버전에서 보완됨 | 기존 연속성 유지 | PASS |
| 모의고사 20 | 답안 제출만으로 완료될 수 있는 과거 위험 | 20개 해설 순차 확인 후 완료 유지 | PASS |
| 설문 진입 | 설문 창 열기만 해도 pending으로 기록 | `opened`와 `submitted` 분리 | FIXED |
| 구버전 설문 상태 | 과거 PENDING이 실제 제출인지 구분 불가 | `legacy`로 이관해 다시 확인 | FIXED |
| Form 인증코드 | 앱 코드와 Form을 연결해야 함 | `entry.310247277`에 코드 자동 prefill 유지 | STRUCTURAL PASS / 실Form 1회 확인 필요 |
| 제출 판정 | cross-origin Form 제출을 앱이 자동 판독 불가 | 사용자의 `설문 제출 완료` 확인 + 실제 응답시트/관리자 승인 이중 확인 | EXPECTED LIMITATION |
| 승인대기 | 상태 처리함수 중복/문구 불일치 | 공통 status 처리로 통일 | FIXED |
| 관리자 재검토 | PENDING/REVIEW로 돌려도 로컬 승인정보가 남을 위험 | stale entitlement 제거 | FIXED |
| 만료/기기불일치 | 승인대기처럼 보일 수 있음 | terminal 상태 별도 표시 | FIXED |
| 기기 귀속 | 설문한 기기에 묶인다는 안내와 실제 동작 불일치 | 승인 후 첫 status/학습 실행 기기로 안내 일치 | FIXED |
| 승인 처리시간 | `통상 1~2일` 문구가 운영 현실과 충돌 | 처리시점 비보장으로 통일 | FIXED |
| BASE 이어하기 | 별도 범위에서 공부한 문항을 다시 만날 수 있음 | 미완료 상태의 일반 이어하기는 완료기록 자동 제외 | FIXED |
| 범위학습 | 연속진도와 비연속학습이 충돌할 위험 | 완료문항 history와 연속 progress 분리 | PASS |
| 보호 문제은행 | 개수 100만으로 releaseReady가 true 가능 | 개수+ID 고유성+B001~B100 순서 검사 | FIXED |
| 설문 중복제출 | 새 미처리 행이 기존 승인상태를 덮을 수 있음 | 최신 응답내용 + 최신 명시 관리상태를 분리 | FIXED |
| 관리자 목록 | 같은 코드가 여러 카드로 보일 수 있음 | 코드별 최신 1건 + duplicateCount | FIXED |
| 공유 미리보기 | 최근 후보에서 OG 메타가 누락됨 | 1200×630 OG/Twitter 메타 복원 | FIXED |

## 설문과 학습의 올바른 책임 분리

- **프런트엔드**: 무료체험 완료 여부, 설문창 열기/제출완료 사용자 확인, 승인상태 조회, 로컬 진도
- **Google Form/응답시트**: 실제 설문 응답과 인증코드 보관
- **운영자**: 실제 응답의 적정성 확인 후 승인/검토/대기 판단
- **Apps Script 백엔드**: 승인·만료·기기귀속 판단, 보호문항 전송

이 분리가 유지되어야 한다. 프런트의 `submitted`만으로 BASE100을 열어서는 안 되며, v8.2도 반드시 백엔드 `APPROVED`를 요구한다.

## 남은 운영상 한계

1. Google Form은 별도 도메인이므로 웹앱이 실제 제출 성공을 직접 확인할 수 없다. `설문 제출 완료`는 사용자 자기확인이고 실제 응답시트가 최종 근거다.
2. 무료체험 완료 여부는 브라우저 로컬 상태이므로 연구대상 자격을 서버 수준에서 강제하는 장치는 아니다. 연구 분석에서 체험 완료를 엄격한 선별조건으로 쓸 경우 별도 서버 로그/식별 설계가 필요하다.
3. 기기 연결 초기화 뒤에는 새 기기에서 먼저 접속해야 한다. 이전 기기가 먼저 승인상태를 확인하면 다시 이전 기기에 연결될 수 있다.
4. 브라우저 저장데이터 삭제·시크릿모드 사용 시 무료체험/진도 연속성이 사라질 수 있다. 서버에는 개인별 학습진도를 저장하지 않는 설계의 반대급부다.

## QA 결과

- HTML parser: PASS
- inline JavaScript 2블록 syntax: PASS
- 무료학습 30 / 모의고사 20: PASS
- 무료학습/모의고사 ID unique 및 4지선다 answer schema: PASS
- 설문 open != submitted 상태 테스트: PASS
- 구버전 ambiguous PENDING → legacy migration: PASS
- submitted → 승인확인 홈 복귀: PASS
- entitlement에서 accessCode 복구: PASS
- PENDING 시 stale entitlement 제거: PASS
- EXPIRED 시 승인대기 플래그 제거, 설문제출 이력 보존: PASS
- 연속진도 23 + 별도 50~60 학습 → 일반 이어하기 24부터, 50~60 제외: PASS
- 24~49를 채우면 연속진도 60까지 자동 catch-up: PASS
- 100 완료 후 전체 복습 기본값은 전체 포함: PASS
- 12개 파트가 보호 BASE100 실제 category 구간과 정확히 일치: PASS
- public index의 `B###` 보호 ID: 0건
- canonical Apps Script endpoint: 1건
- Google Form URL: 1건 / entry id 설정 존재
- demo 우회: 0건
- pinch zoom 차단값: 0건
- OG 1200×630 / Twitter large card 메타: PASS
- Backend Code.gs syntax: PASS
- Backend BASE100 100개 / ID unique / B001~B100 order / releaseReady: PASS
- Backend 중복 설문 최신내용 1건 표시 + 기존 승인상태 보존 로직 단위테스트: PASS

### 아직 PASS라고 기록하지 않은 항목
- 실제 모바일 브라우저 E2E
- 실제 Google Form 제출 → 응답시트 생성 → 관리자 승인 → 실제 BASE100 로딩의 현행 v8.2 종단간 테스트

위 두 항목은 배포 후 실기기에서 확인해야 한다.
