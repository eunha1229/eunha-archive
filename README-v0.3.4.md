# Persona Archive v0.3.4 — HOME loader cleanup

- HOME를 페이지 진입 즉시 먼저 렌더링합니다.
- posts 로더를 단순화했습니다.
- `posts/index.json`에 실제로 등록된 파일만 읽습니다.
- 한 게시글 로딩 실패가 HOME 전체를 막지 않습니다.
- 사용자 화면에 '배포 중' 안내문을 표시하지 않습니다.
- 한글 Markdown 파일명도 path segment 단위 encodeURIComponent로 지원합니다.
- 불필요한 `cache: no-store`, timestamp query, 자동 재시도 루프를 제거했습니다.
- 기존 GitHub 저장 / 이미지 업로드 / 자유 섹션 / HOME 편집 기능은 유지합니다.

적용: index.html, js/app.js, css/style.css 교체.
posts/와 config/home.json은 건드리지 않습니다.
