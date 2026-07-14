# 📂 AMEVA Basic Plugins

이 폴더(`public/plugins/`)는 순수 JavaScript(`.js`)로 작성된 AMEVA 워크스테이션의 핵심 기능 및 유틸리티 플러그인들을 포함하고 있습니다. 서버 구동 시 이 폴더 내의 스크립트들이 자동으로 마켓플레이스에 등록되어 클라이언트에서 로드할 수 있게 됩니다.

## 🧩 등록된 기본 도구 목록

### 🛠️ Core Tools (핵심 편집/문서 도구)
- **`calculator.js` (Calculator)**: 문서 작성 중 즉석으로 계산할 수 있는 확장 도구입니다.
- **`minimap.js` (Minimap)**: 에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.
- **`outline.js` (Outline)**: 문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.
- **`rich-styling.js` (Rich Styling)**: 인라인 글씨 크기 조절 및 다양한 한글/영문 폰트 서식 변경 툴바를 활성화합니다.
- **`drawing-board.js` (Drawing Board)**: 문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.

### 🌐 Web & Media Utilities (웹/미디어 유틸리티)
- **`naver.js` (Naver Portal)**: 임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.
- **`google.js` (Google Search)**: 임시 세션으로 검색 내역을 남기지 않고 즉석 구글 검색을 활용하는 안전 웹 뷰어 도구입니다.
- **`youtube.js` (YouTube Player)**: 문서 작업 중 유튜브 비디오를 실시간 시청 및 PiP 팝업 모드로 전환할 수 있는 도구입니다.

### ☁️ Cloud & Collaboration (클라우드 및 협업)
- **`google-drive.js` (Google Drive Sync)**: 작성 중인 마크다운 문서를 구글 드라이브 클라우드에 다이렉트 업로드 및 백업 동기화하는 클라우드 연동 도구입니다.
- **`cloud-collab.js` (Cloud Collaboration)**: 로컬 오프라인 제한을 뛰어넘어 보안 중앙 채널에서 팀원들과 원격 실시간 편집을 해금합니다.

### 📅 Productivity (생산성 도구)
- **`calendar.js` (Calendar & Scheduler)**: 문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.

---

*참고: 여기에 새로운 `.js` 파일을 추가하면 마켓플레이스 서버가 재시작 없이도(또는 재시작 시) 자동으로 인식하여 워크스테이션에 제공합니다.*
