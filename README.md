# 은혜교회 작업 아카이브 — 사용 설명서 (노코드 관리 버전)

이제부터는 **data.js 코드를 직접 손대지 않고**, 웹사이트의 `/admin/` 페이지에
로그인해서 폴더/서랍/자료를 추가·수정·삭제할 수 있습니다.
글쓰기 화면처럼 이름과 설명을 입력하고, 파일을 드래그해서 올리면 끝입니다.

---

## 구조

```
폴더 (교회 관리 시스템, 성경공부 ...)
  └ 서랍 (출석관리 앱, 마가복음 10장 ...)
        └ 자료 (실제 열람/다운로드 파일)
```

- `index.html` / `folder.html` / `drawer.html` — 방문자가 보는 화면 (기존과 동일)
- `content/data.json` — 폴더·서랍·자료 구조가 저장되는 파일 (이제 이 파일을 직접 열 필요 없습니다)
- `/admin/` — 로그인해서 폴더/서랍/자료를 추가하는 관리 화면 (Decap CMS)

---

## 처음 한 번만 설정하는 과정 (이후로는 코드 안 만져도 됩니다)

이 부분은 사이트를 "코드 수정 없이 설정에서 관리"하게 만들기 위한 초기 배선 작업입니다.
한 번만 해두면, 그 다음부터는 `/admin/`에 로그인해서 폼으로만 작업하시면 됩니다.

### 1단계 — GitHub에 사이트 파일 올리기 (코드 명령어 없이, 웹에서 드래그만)

1. https://github.com 에서 무료 계정을 만듭니다 (이미 있으면 로그인)
2. 오른쪽 위 "+" → "New repository" 클릭
3. 이름을 예: `church-archive` 로 하고 "Create repository"
4. 만들어진 저장소 페이지에서 "uploading an existing file" 링크 클릭
5. 이 `church-archive` 폴더 안의 파일 전체를 그대로 드래그해서 올립니다
   (폴더 구조가 그대로 유지되도록, 폴더째로 드래그하시면 됩니다)
6. 아래 "Commit changes" 버튼 클릭

### 2단계 — Netlify를 이 GitHub 저장소에 연결하기

1. https://app.netlify.com 로그인
2. "Add new site" → "Import an existing project"
3. GitHub 선택 → 방금 만든 `church-archive` 저장소 선택
4. Build command는 비워두고, Publish directory는 `/` (루트) 그대로 두고 "Deploy"
5. 몇 초 뒤 사이트 주소가 생성됩니다 (나중에 가비아 도메인 연결 가능)

참고: 기존에 Netlify Drop으로 만들었던 사이트가 있다면, 이번엔 "Import an existing project"로
새로 하나 만드시는 걸 추천드려요. Git 연동 사이트라야 관리 화면(/admin/)이 작동합니다.

### 3단계 — 로그인 기능(Netlify Identity) 켜기

1. Netlify 사이트 대시보드 → Site configuration → Identity → Enable Identity
2. Registration 설정을 "Invite only" 로 변경 (아무나 가입 못 하도록)
3. 같은 화면에서 Services → Git Gateway → Enable Git Gateway
   (이게 있어야 관리 화면에서 저장한 내용이 실제로 GitHub에 반영됩니다)

### 4단계 — 본인을 관리자로 초대하기

1. Identity 탭 → Invite users → 본인 이메일 입력 후 초대
2. 받은 이메일에서 "Accept the invite" 클릭
3. 비밀번호를 설정하면 로그인 완료

---

## 앞으로 자료를 추가하는 방법 (이제부터 이렇게만 하면 됩니다)

1. 사이트주소/admin/ 로 접속
2. 로그인
3. "작업 아카이브" → "전체 구조 관리" 클릭
4. 화면에서:
   - 폴더 목록의 "Add" 버튼으로 새 폴더 추가
   - 폴더를 펼치면 그 안의 서랍 목록에 "Add"로 새 서랍 추가
   - 서랍을 펼치면 그 안의 자료 목록에 "Add"로 새 자료 추가 → 이름/설명 입력 + 실제 파일 드래그 업로드
5. 오른쪽 위 "Publish" 클릭 → 몇 분 안에 실제 사이트에 반영됩니다

코드나 파일 경로를 직접 만질 필요가 전혀 없습니다. 이름 짓고, 설명 쓰고, 파일 올리고, Publish만 누르면 됩니다.

---

## 참고

- 폴더/서랍의 "ID"는 영문과 하이픈만 써주세요 (예: youth-group, summer-retreat). 화면에 보이는 이름은 "폴더 이름/서랍 이름" 필드가 따로 있으니 한글로 편하게 쓰시면 됩니다.
- 관리 화면은 본인만 초대해서 쓰는 구조라, 다른 사람이 함부로 자료를 추가할 수 없습니다.
- 나중에 다른 분(교육팀 등)에게도 관리 권한을 드리고 싶으면, Identity → Invite users에서 그분 이메일만 추가하시면 됩니다.
