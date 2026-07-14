# 💎 AMEVA Premium Plugins

이 폴더(`public/plugins/premium/`)는 React 기반(`.tsx`)으로 구축된 AMEVA 워크스테이션의 고급형(Premium) 엔터프라이즈 컴포넌트들을 포함하고 있습니다. 복잡한 UI/UX와 심화된 기능을 제공하는 플러그인들이 이곳에서 관리됩니다.

## 🧩 등록된 프리미엄 도구 목록

### 📈 Data & Finance (데이터 및 금융)
- **`FinanceDashboardView.tsx` (Finance & Exchange)**: 실시간 글로벌 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.
- **`DatabaseExplorerPlugin.tsx` (Database Explorer)**: 데이터베이스 구조 탐색 및 쿼리를 위한 고급 탐색기 컴포넌트입니다.

### 🗺️ Navigation & Web (네비게이션 및 브라우징)
- **`GoogleMapsView.tsx` (Google Maps)**: 장소 검색 및 지도 탐색이 가능한 구글 지도 내장 뷰어 도구입니다. 현재 위치를 에디터 본문에 링크로 삽입할 수 있습니다.
- **`AmevaBrowserView.tsx` (Ameva Browser)**: 워크스테이션 내부에 독립적으로 탑재되는 강력한 인앱 웹 브라우저입니다.

### 🧠 Ideation & Planning (아이디어 및 기획)
- **`MindMapPlugin.tsx` (Mind Map)**: 복잡한 아이디어와 개념을 시각적으로 구성할 수 있는 마인드맵 도구입니다.
- **`WireframePlugin.tsx` (Wireframe)**: 신속한 UI/UX 와이어프레임 및 프로토타입 설계를 돕는 툴입니다.
- **`KanbanBoard.tsx` (Kanban Board)**: 칸반 보드 형태로 직관적이고 시각적인 태스크(일정) 관리를 제공합니다.

### 🤖 AI & Productivity (인공지능 및 생산성)
- **`PdfRagPlugin.tsx` (PDF RAG)**: 대용량 PDF 문서를 로드하고 AI를 통해 질의응답(RAG) 및 요약 분석을 수행하는 고급 AI 플러그인입니다.
- **`PomodoroPlugin.tsx` (Pomodoro)**: 뽀모도로 기법을 적용하여 사용자의 작업 집중력을 극대화하고 시간을 관리해 주는 타이머입니다.
- **`PresentationPlugin.tsx` (Presentation)**: 작성된 마크다운 문서를 기반으로 즉석에서 발표용 슬라이드 모드를 구동하는 뷰어입니다.
- **`VoiceDictationPlugin.tsx` (Voice Dictation)**: 실시간 음성 인식(STT)을 통해 음성을 텍스트로 즉각 변환하여 에디터에 타이핑하는 편의 도구입니다.

### 🛠️ Developer Tools (개발자 도구)
- **`RestClientPlugin.tsx` (REST Client)**: API 개발 및 테스트를 위해 워크스테이션 내장형으로 제공되는 HTTP/REST 클라이언트 컴포넌트입니다.

---

*이 폴더 내의 `.tsx` 컴포넌트들은 마켓플레이스 서버의 동적 로딩 기능에 의해 프리미엄 플러그인으로 식별되어 클라이언트 애플리케이션으로 안전하게 전달됩니다.*
