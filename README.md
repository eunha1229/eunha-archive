# Persona Archive v0.1

개인 페르소나 설정 + AI 채팅 프롬프트 백업용 정적 위키입니다.

## 가장 중요한 사용법

캐릭터 데이터는 `posts/*.md`에 있습니다.

새 캐릭터를 추가할 때:
1. 사이트의 `+ NEW ENTRY`에서 작성
2. `DOWNLOAD .MD` 클릭
3. 받은 파일을 GitHub 저장소의 `posts/` 폴더에 업로드
4. `posts/index.json`에 파일명을 한 줄 추가
5. Commit

예:
```json
[
  "aubade.md",
  "rita.md"
]
```

기존 캐릭터를 수정할 때:
- 가장 간단함: GitHub에서 해당 `.md`를 직접 열어 글만 수정
- 에디터 사용: `.md` 파일을 내려받아 사이트의 `IMPORT .MD TO EDIT`로 불러온 뒤 수정하고 다시 업로드

## 이미지

이미지를 `assets/characters/`에 넣고 Markdown front matter의 `image:`에 다음처럼 적습니다.

`image: assets/characters/aubade.webp`

## 로컬 테스트 주의

브라우저에서 index.html을 파일로 직접 열면 fetch 보안 제한 때문에 posts 폴더를 읽지 못할 수 있습니다.
GitHub Pages에서는 정상 작동합니다. 로컬에서는 Python이 있다면 저장소 폴더에서:

`python -m http.server 8000`

그 다음 브라우저에서 `http://localhost:8000`을 여세요.

## GitHub Pages

Repository → Settings → Pages → Deploy from a branch → `main` / `(root)`를 선택하면 됩니다.
