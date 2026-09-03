# PROJECT_HANDOFF_LATEST

## 프로젝트
- 이름: 새마을금고법 학습 웹앱
- 공개 저장소: `korealaw/mg-law-webapp`
- 기본 브랜치: `main`
- GitHub Pages: `main` / `(root)`
- 공개 주소: https://korealaw.github.io/mg-law-webapp/

## 현재 기준 버전
- Frontend: v8.1a
- Backend: Google Apps Script v8.1
- 기준일: 2026-09-03

## v8.1a 변경점
- 40~50대 학습자 기준 모바일 시인성 강화
- 문제/선택지/해설/하단 탭 글자 및 터치영역 확대
- 2단계 해설 기본 펼침
- 오답 시 3단계 법령근거 자동 펼침
- 해설 상단 강조 안내 추가
- 430px/390px/350px 이하 화면폭 대응
- 카카오톡 URL 공유용 Open Graph 메타데이터 적용
- 공개 이미지: `/og-image.jpg`

## 카카오톡 공유 미리보기
- 공유 URL: https://korealaw.github.io/mg-law-webapp/
- `og:title`: MG 새마을금고법 톡톡 · 간부자격 학습
- `og:description`: 핵심문제 → 1단계 핵심 → 2단계 이해 → 3단계 법령근거로 이어지는 모바일 학습 웹앱
- `og:image`: https://korealaw.github.io/mg-law-webapp/og-image.jpg?v=20260903a
- 카카오톡은 URL 미리보기를 캐시할 수 있으므로 기존 URL을 이미 공유했다면 Kakao Developers의 URL 디버거/스크랩 갱신이 필요할 수 있다.

## 운영 구조
1. GitHub Pages에는 공개 프런트엔드만 둔다.
2. BASE100 보호 문제은행은 Google Apps Script 서버에만 둔다.
3. 관리자 접근키, 관리자용 비밀값, 보호 문제 원문은 공개 GitHub에 커밋하지 않는다.
4. `main`을 운영 기준 원본으로 사용한다.
5. 변경 시: 최신 `main` 확인 → 수정 → QA → 커밋 → Pages 반영 → 실제 URL 점검 순서로 진행한다.

## 다음 검증
1. `index.html`과 `og-image.jpg`를 포함한 v8.1a 파일을 저장소 루트에 반영
2. GitHub Pages 재배포 확인
3. Galaxy급 모바일에서 정답/오답 직후 화면 재점검
4. 카카오톡 채팅방에 URL을 붙여 이미지·제목·설명 미리보기 확인
5. 첫 실제 승인 이용자가 발생하면 BASE20 로딩 E2E 최종 확인
