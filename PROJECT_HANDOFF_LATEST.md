# PROJECT_HANDOFF_LATEST

## 프로젝트
- 이름: 새마을금고법 학습 웹앱
- 공개 저장소: `korealaw/mg-law-webapp`
- 기본 브랜치: `main`
- GitHub Pages: `main` / `(root)`
- 공개 주소: https://korealaw.github.io/mg-law-webapp/

## 현재 기준 버전
- Frontend: v8.1b
- Backend: Google Apps Script v8.1
- 기준일: 2026-09-03

## v8.1a → v8.1b 변경점
- 카카오톡 미리보기가 "작은 썸네일 카드"로 뜨던 문제 수정
- `og-image.jpg`를 900×900(정사각) → **1200×630(2:1)** 로 교체
- `og:image:width` / `og:image:height` 를 실제 크기(1200/630)와 일치하도록 정정
- `og:image` URL의 쿼리스트링(`?v=20260903a`) 제거
- `twitter:card` 를 `summary` → `summary_large_image` 로 변경
- 파비콘을 `icon.jpg`(512×512 정사각)로 분리
  (와이드 OG 이미지를 파비콘으로 쓰면 아이콘이 찌그러짐)

## v8.1a 변경점(유지)
- 40~50대 학습자 기준 모바일 시인성 강화
- 문제/선택지/해설/하단 탭 글자 및 터치영역 확대
- 2단계 해설 기본 펼침
- 오답 시 3단계 법령근거 자동 펼침
- 해설 상단 강조 안내 추가
- 430px/390px/350px 이하 화면폭 대응

## 카카오톡 공유 미리보기
- 공유 URL: https://korealaw.github.io/mg-law-webapp/
- `og:title`: MG 새마을금고법 톡톡 · 간부자격 학습
- `og:description`: 핵심문제 → 1단계 핵심 → 2단계 이해 → 3단계 법령근거로 이어지는 모바일 학습 웹앱
- `og:image`: https://korealaw.github.io/mg-law-webapp/og-image.jpg  (1200×630, 쿼리스트링 없음)
- 큰 이미지 카드 조건: 이미지 가로:세로 ≈ 2:1, 선언한 width/height와 실제 크기 일치
- 파일만 교체하면 반영되지 않음. **Kakao 공유 디버거에서 캐시 초기화 필수**
  https://developers.kakao.com/tool/debugger/sharing

## 운영 구조
1. GitHub Pages에는 공개 프런트엔드만 둔다.
2. BASE100 보호 문제은행은 Google Apps Script 서버에만 둔다.
3. 관리자 접근키, 관리자용 비밀값, 보호 문제 원문은 공개 GitHub에 커밋하지 않는다.
4. `main`을 운영 기준 원본으로 사용한다.
5. 변경 시: 최신 `main` 확인 → 수정 → QA → 커밋 → Pages 반영 → 실제 URL 점검 순서로 진행한다.

## 다음 검증
1. `index.html` / `og-image.jpg` / `icon.jpg` 3개 파일이 저장소 루트에 반영됐는지 확인
2. 페이지 소스 보기에서 `og:image:width`가 **1200** 으로 나오는지 확인 (900이면 미반영)
3. Kakao 공유 디버거에서 캐시 초기화 실행
4. "나와의 채팅"에 URL 붙여 큰 이미지 카드 확인 후 채팅방 배포
5. Galaxy급 모바일에서 정답/오답 직후 화면 재점검
6. 첫 실제 승인 이용자 발생 시 BASE20 로딩 E2E 최종 확인
