document.addEventListener('DOMContentLoaded', () => {
  const premiumGrid = document.getElementById('premiumGrid');
  const standardGrid = document.getElementById('standardGrid');
  const searchInput = document.getElementById('searchInput');

  // Preview Sidebar Elements
  const previewSidebar = document.getElementById('previewSidebar');
  const previewIframe = document.getElementById('previewIframe');
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');
  const previewInstallBtn = document.getElementById('previewInstallBtn');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  
  // Resizer Elements
  const resizer = document.getElementById('dragMe');
  const leftPane = document.querySelector('.plugin-list');
  const rightPane = previewSidebar;
  
  // Toggle Sidebar Logic
  let isSidebarOpen = false;
  
  // Initialize collapsed state
  previewSidebar.classList.add('sidebar-collapsed');
  toggleSidebarBtn.textContent = '◀';
  resizer.style.display = 'none';

  toggleSidebarBtn.addEventListener('click', () => {
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      previewSidebar.classList.remove('sidebar-collapsed');
      toggleSidebarBtn.textContent = '▶';
      resizer.style.display = 'block';
    } else {
      previewSidebar.classList.add('sidebar-collapsed');
      toggleSidebarBtn.textContent = '◀';
      resizer.style.display = 'none';
    }
  });

  // Resizer Logic
  let isDragging = false;

  resizer.addEventListener('mousedown', function(e) {
    if(!isSidebarOpen) return; // Don't resize if collapsed
    isDragging = true;
    resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    // Prevent iframe from intercepting mouse events during drag
    previewIframe.style.pointerEvents = 'none';
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // Calculate new flex basis
    const containerWidth = document.getElementById('layoutContainer').offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    // Restrict dragging boundaries (20% to 80%)
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      leftPane.style.flex = `1 1 ${newLeftWidth}%`;
      rightPane.style.flex = `1 1 ${100 - newLeftWidth}%`;
    }
  });

  document.addEventListener('mouseup', function(e) {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      previewIframe.style.pointerEvents = 'auto';
    }
  });

  window.openPreview = (url, name, description, isPremium) => {
    if (!isSidebarOpen) {
      isSidebarOpen = true;
      previewSidebar.classList.remove('sidebar-collapsed');
      toggleSidebarBtn.textContent = '▶';
      resizer.style.display = 'block';
    }
    previewIframe.src = url;
    previewTitle.textContent = name;
    previewDesc.innerHTML = description;
    
    // Update active style on cards
    document.querySelectorAll('.plugin-card').forEach(c => c.classList.remove('active'));
    // We can't easily find the exact card here without passing ID, so we'll do it inside renderPlugins
    
    previewInstallBtn.className = `install-btn ${isPremium ? 'premium' : ''}`;
    previewInstallBtn.textContent = isPremium ? 'Activate' : 'Install';
    previewInstallBtn.onclick = () => alert(`${name} 클라우드 스트리밍이 워크스테이션으로 시작됩니다!`);
  };

  let allPlugins = [];

  
  // Hardcoded plugins data for static GitHub Pages hosting
  const staticPlugins = [
  {
    "id": "pythonConsole",
    "name": "Python Sandbox Executor (Pro)",
    "description": "마크다운 환경 내에서 안전한 파이썬 샌드박스를 구동하여 데이터 분석 및 코드를 실행합니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/pythonConsole.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/pythonConsole-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "requestQueue",
    "name": "Sequential Request Queue",
    "description": "여러 API 호출을 순차적이고 안정적으로 처리하는 분산 큐 시스템입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/requestQueue.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/requestQueue-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "calculator",
    "name": "Calculator",
    "description": "<span class='desc-asis'>[As-Is] 별도의 계산기 앱을 열어 수식을 일일이 복붙해야 하는 불편함</span><br/><span class='desc-tobe'>[To-Be] <b>워크스페이스 내장형 고급 계산기!</b> 복잡한 공학/재무 연산도 작업 흐름의 끊김 없이 즉시 해결됩니다.</span><br/><span class='desc-highlight'>✨ 강점: 수식 히스토리 자동 저장 및 컨텍스트 통합</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calculator.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calculator-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "calendar",
    "name": "Calendar",
    "description": "<span class='desc-asis'>[As-Is] 구글 캘린더, 아웃룩 등 여러 창을 띄워놓고 일정을 대조하는 비효율</span><br/><span class='desc-tobe'>[To-Be] <b>스마트 캘린더 동기화!</b> 현재 작업 중인 문서와 일정이 완벽히 연동되어 일정 관리가 300% 빨라집니다.</span><br/><span class='desc-highlight'>✨ 강점: 드래그 앤 드롭 일정 매핑 및 즉각적인 리마인더</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calendar.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calendar-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "cloud-collab",
    "name": "Cloud Collab",
    "description": "<span class='desc-asis'>[As-Is] 화상 회의 앱 따로, 문서 편집기 따로, 메신저 따로... 극심한 파편화</span><br/><span class='desc-tobe'>[To-Be] <b>완전한 올인원 협업 공간!</b> 화상/음성 채팅과 실시간 문서 편집을 단 하나의 창에서 딜레이 없이 경험하세요.</span><br/><span class='desc-highlight'>✨ 강점: Yjs 기반 제로 레이턴시 텍스트 동기화</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/cloud-collab.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/cloud-collab-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "db-explorer",
    "name": "Db Explorer",
    "description": "<span class='desc-asis'>[As-Is] 무거운 DB 클라이언트를 설치하고 VPN을 켜야만 가능한 쿼리 작업</span><br/><span class='desc-tobe'>[To-Be] <b>웹 네이티브 DB 브라우저!</b> 브라우저에서 바로 MySQL/PostgreSQL에 접속해 쿼리를 날리고 데이터를 시각화합니다.</span><br/><span class='desc-highlight'>✨ 강점: 클라우드 스트리밍 렌더링으로 로컬 리소스 점유 0%</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/db-explorer.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/db-explorer-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "drawing-board",
    "name": "Drawing Board",
    "description": "<span class='desc-asis'>[As-Is] 스케치 툴을 열고 이미지를 캡처해 다시 붙여넣는 지루한 반복 작업</span><br/><span class='desc-tobe'>[To-Be] <b>실시간 캔버스 보드!</b> 팀원들과 동시에 아이디어를 그리고 다이어그램을 워크스페이스에 즉시 삽입하세요.</span><br/><span class='desc-highlight'>✨ 강점: 무한 캔버스 및 레이어 기반 백터 드로잉</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/drawing-board.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/drawing-board-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "finance-dashboard",
    "name": "Finance Dashboard",
    "description": "<span class='desc-asis'>[As-Is] 여러 금융 사이트의 탭을 띄워놓고 시세가 갱신될 때까지 새로고침</span><br/><span class='desc-tobe'>[To-Be] <b>기관급 실시간 트레이딩 대시보드!</b> 주식, 크립토 차트와 호가창이 단일 뷰에서 실시간 스트리밍됩니다.</span><br/><span class='desc-highlight'>✨ 강점: 커스텀 지표 추가 및 다중 차트 레이아웃 지원</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/finance-dashboard.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/finance-dashboard-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google-drive",
    "name": "Google Drive",
    "description": "<span class='desc-asis'>[As-Is] 파일 하나 찾으려고 구글 드라이브 홈에서 수십 개의 폴더를 뒤적거림</span><br/><span class='desc-tobe'>[To-Be] <b>내장형 클라우드 탐색기!</b> 현재 프로젝트에 필요한 파일만 즉각 마운트하여 로컬 파일처럼 다룹니다.</span><br/><span class='desc-highlight'>✨ 강점: OS Keychain을 활용한 안전한 토큰 관리</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-drive.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-drive-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google-maps",
    "name": "Google Maps",
    "description": "<span class='desc-asis'>[As-Is] 주소를 복사해서 지도 탭에 붙여넣고 다시 캡처하는 번거로운 워크플로우</span><br/><span class='desc-tobe'>[To-Be] <b>엔터프라이즈 3D 맵스!</b> 길찾기, 로케이션 핀 관리, 위성 뷰를 문서 작업과 동시에 수행하세요.</span><br/><span class='desc-highlight'>✨ 강점: 커스텀 마커 저장 및 3D 렌더링 최적화</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-maps.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-maps-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google",
    "name": "Google",
    "description": "<span class='desc-asis'>[As-Is] 궁금한 게 생길 때마다 새 탭을 열어 검색하고 다시 돌아오는 시선 분산</span><br/><span class='desc-tobe'>[To-Be] <b>인라인 검색 엔진!</b> 팝업 없이 워크스페이스 안에서 바로 검색하고 결과를 드래그해 즉시 인용하세요.</span><br/><span class='desc-highlight'>✨ 강점: 인라인 브라우징으로 컨텍스트 유지 극대화</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "mind-map",
    "name": "Mind Map",
    "description": "<span class='desc-asis'>[As-Is] 아이디어가 떠올라도 마인드맵 앱이 켜지는 시간을 기다리다 흐름이 끊김</span><br/><span class='desc-tobe'>[To-Be] <b>즉각적인 브레인스토밍!</b> 무제한 노드를 지원하는 마인드맵 툴을 단 0.1초 만에 로드하여 아이디어를 확장하세요.</span><br/><span class='desc-highlight'>✨ 강점: 자동 레이아웃 정렬 및 이미지 내보내기</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/mind-map.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/mind-map-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "minimap",
    "name": "Minimap",
    "description": "<span class='desc-asis'>[As-Is] 수천 줄의 코드나 문서를 스크롤하며 내가 어디쯤 있는지 길을 잃음</span><br/><span class='desc-tobe'>[To-Be] <b>코드 컨텍스트 네비게이션!</b> 문서의 전체 구조를 한눈에 파악하고 원하는 위치로 즉시 점프합니다.</span><br/><span class='desc-highlight'>✨ 강점: 시맨틱 하이라이팅 및 드래그 스크롤링</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/minimap.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/minimap-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "naver",
    "name": "Naver",
    "description": "<span class='desc-asis'>[As-Is] 국내 포털 검색을 위해 작업창을 가리고 새 브라우저 창을 띄워야 하는 답답함</span><br/><span class='desc-tobe'>[To-Be] <b>한국어 맞춤 포털 인라인 브라우저!</b> 네이버 검색과 주요 서비스를 사이드패널에서 방해 없이 이용하세요.</span><br/><span class='desc-highlight'>✨ 강점: 독립 세션 격리로 안전한 웹 서핑</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/naver.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/naver-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "outline",
    "name": "Outline",
    "description": "<span class='desc-asis'>[As-Is] 방대한 분량의 문서에서 특정 목차나 단락을 찾기 위해 수동으로 스크롤</span><br/><span class='desc-tobe'>[To-Be] <b>자동 목차 생성기!</b> 헤딩 태그를 분석해 계층형 아웃라인을 생성하고 트리 형태로 문서를 완벽히 지배합니다.</span><br/><span class='desc-highlight'>✨ 강점: 실시간 DOM 분석 및 즉각적인 앵커 이동</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/outline.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/outline-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "pdf-rag",
    "name": "Pdf Rag",
    "description": "<span class='desc-asis'>[As-Is] 수백 페이지의 PDF 문서를 일일이 읽으며 필요한 정보를 수동으로 발췌</span><br/><span class='desc-tobe'>[To-Be] <b>프리미엄 AI RAG 엔진!</b> PDF를 업로드하면 AI가 전체 맥락을 파악하여 당신의 질문에 정확히 답변합니다.</span><br/><span class='desc-highlight'>✨ 강점: 시맨틱 검색 및 정확한 페이지 레퍼런스 제공</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pdf-rag.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pdf-rag-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "pomodoro",
    "name": "Pomodoro",
    "description": "<span class='desc-asis'>[As-Is] 핸드폰으로 타이머를 맞추다 카톡을 보고 집중력이 완전히 박살남</span><br/><span class='desc-tobe'>[To-Be] <b>몰입 최적화 매니저!</b> 작업 시간과 휴식 시간을 엄격하게 관리하고 사이트 차단 기능으로 몰입도를 500% 높입니다.</span><br/><span class='desc-highlight'>✨ 강점: 맞춤형 루틴 설정 및 일간 몰입 통계 제공</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pomodoro.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pomodoro-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "presentation",
    "name": "Presentation",
    "description": "<span class='desc-asis'>[As-Is] 무거운 파워포인트를 켜고 템플릿을 맞추느라 정작 내용 작성에 시간을 뺏김</span><br/><span class='desc-tobe'>[To-Be] <b>원클릭 프레젠테이션 스튜디오!</b> 마크다운과 드래그 앤 드롭만으로 10분 만에 고품질 슬라이드를 완성하세요.</span><br/><span class='desc-highlight'>✨ 강점: 풍부한 CSS 애니메이션 및 레이아웃 프리셋</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/presentation.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/presentation-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "rest-client",
    "name": "Rest Client",
    "description": "<span class='desc-asis'>[As-Is] Postman이나 Insomnia처럼 무거운 앱을 켜야만 API 테스트가 가능함</span><br/><span class='desc-tobe'>[To-Be] <b>경량화된 프로 REST 클라이언트!</b> 복잡한 Auth와 헤더 세팅을 지원하며 API 응답을 문서에 즉각 반영할 수 있습니다.</span><br/><span class='desc-highlight'>✨ 강점: 환경 변수(Env) 관리 및 자동화 스크립트 지원</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rest-client.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rest-client-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "rich-styling",
    "name": "Rich Styling",
    "description": "<span class='desc-asis'>[As-Is] 마크다운의 한계로 인해 표나 색상을 넣기 위해 복잡한 HTML 태그를 삽입</span><br/><span class='desc-tobe'>[To-Be] <b>위지윅(WYSIWYG) 리치 텍스트 에디터!</b> 노션처럼 직관적인 슬래시(/) 명령어와 서식 툴바로 아름다운 문서를 작성하세요.</span><br/><span class='desc-highlight'>✨ 강점: Yjs와 결합된 실시간 리치 텍스트 공동 편집</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rich-styling.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rich-styling-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "voice-dictation",
    "name": "Voice Dictation",
    "description": "<span class='desc-asis'>[As-Is] 타이핑 속도가 생각의 속도를 따라가지 못해 아이디어가 휘발됨</span><br/><span class='desc-tobe'>[To-Be] <b>초정밀 AI 음성 인식!</b> 말하는 즉시 텍스트로 변환되어 타이핑 없이도 장문의 문서를 순식간에 완성합니다.</span><br/><span class='desc-highlight'>✨ 강점: 다국어 실시간 번역 및 오프라인 음성 엔진 탑재</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/voice-dictation.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/voice-dictation-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "web-browser",
    "name": "Web Browser",
    "description": "<span class='desc-asis'>[As-Is] 듀얼 모니터가 없으면 자료 조사와 문서 작성을 번갈아 하느라 Alt+Tab만 수백 번</span><br/><span class='desc-tobe'>[To-Be] <b>인라인 샌드박스 브라우저!</b> 5:5 스플릿 뷰에서 좌측엔 브라우저, 우측엔 에디터를 띄워 압도적인 효율을 경험하세요.</span><br/><span class='desc-highlight'>✨ 강점: 보안이 강화된 Iframe 샌드박싱 아키텍처</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/web-browser.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/web-browser-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "wireframe",
    "name": "Wireframe",
    "description": "<span class='desc-asis'>[As-Is] 피그마나 스케치 같은 무거운 툴을 켜야만 간단한 UI 초안을 그릴 수 있음</span><br/><span class='desc-tobe'>[To-Be] <b>초고속 UI 프로토타이핑!</b> 드래그 앤 드롭으로 1분 만에 와이어프레임을 조립하고 팀원과 기획을 검증하세요.</span><br/><span class='desc-highlight'>✨ 강점: 방대한 컴포넌트 라이브러리 및 코드 추출</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/wireframe.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/wireframe-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "youtube",
    "name": "Youtube",
    "description": "<span class='desc-asis'>[As-Is] 유튜브 탭을 켜두면 알고리즘의 유혹에 빠져 몇 시간씩 허비하게 됨</span><br/><span class='desc-tobe'>[To-Be] <b>미니멀 백그라운드 플레이어!</b> 작업용 플레이리스트나 강의 영상만 깔끔하게 띄워놓고 방해꾼 없는 환경을 만드세요.</span><br/><span class='desc-highlight'>✨ 강점: 광고 차단 모드 및 PIP(Picture in Picture) 완벽 지원</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/youtube.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/youtube-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "AmevaBrowserView",
    "name": "Ameva Browser View",
    "description": "<span class='desc-asis'>[As-Is] 일반 내장 브라우저로는 보안 인증이나 복잡한 렌더링을 감당하기 버거움</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 하드웨어 가속 브라우저!</b> 크로미움 기반 엔진을 클라우드에서 스트리밍하여 무거운 3D 웹이나 WebGL도 부드럽게 구동합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 완벽한 쿠키/세션 격리 및 GPU 가속 렌더링</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/AmevaBrowserView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/AmevaBrowserView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "DatabaseExplorerPlugin",
    "name": "Database Explorer Plugin",
    "description": "<span class='desc-asis'>[As-Is] 수백만 건의 데이터를 쿼리하면 브라우저가 멈추거나 메모리가 폭발함</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 빅데이터 최적화 DB 탐색기!</b> 대용량 결과셋을 페이지네이션과 가상 스크롤링으로 지연 없이 부드럽게 렌더링합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 쿼리 실행 계획(Explain) 시각화 및 SSH 터널링</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/DatabaseExplorerPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/DatabaseExplorerPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "FinanceDashboardView",
    "name": "Finance Dashboard View",
    "description": "<span class='desc-asis'>[As-Is] API 호출 제한에 막혀 실시간 틱 데이터를 제대로 시각화할 수 없음</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 월스트리트급 트레이딩 터미널!</b> WebRTC DataChannel을 통해 초당 수십 번 갱신되는 틱 데이터를 제로 레이턴시로 꽂아줍니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 100+개 기술적 지표 및 알고리즘 트레이딩 연동</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/FinanceDashboardView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/FinanceDashboardView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "GoogleMapsView",
    "name": "Google Maps View",
    "description": "<span class='desc-asis'>[As-Is] 단순한 2D 지도만으로는 고도화된 공간 분석이나 동선 기획이 불가능함</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 엔터프라이즈 3D 로케이션 애널리틱스!</b> 지형지물 3D 렌더링과 커스텀 데이터 레이어(GeoJSON)를 지도 위에 직접 투사합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 열지도(Heatmap) 및 클러스터링 실시간 분석</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/GoogleMapsView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/GoogleMapsView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "KanbanBoard",
    "name": "Kanban Board",
    "description": "<span class='desc-asis'>[As-Is] 포스트잇이나 텍스트로만 관리되는 일정은 프로젝트 규모가 커질수록 통제 불능</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 애자일 워크플로우 매니저!</b> 지라(Jira)급의 강력한 상태 관리와 드래그 앤 드롭 보드로 프로젝트 병목현상을 완벽히 해결합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 깃허브 PR 자동 연동 및 번다운 차트 생성</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/KanbanBoard.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/KanbanBoard-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "MindMapPlugin",
    "name": "Mind Map Plugin",
    "description": "<span class='desc-asis'>[As-Is] 혼자서만 그리는 마인드맵은 집단 지성을 이끌어내지 못하고 죽은 문서가 됨</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] Yjs 기반 실시간 다중 참여 마인드맵!</b> 수십 명의 팀원이 동시에 접속해 수천 개의 노드를 충돌 없이 시각적으로 엮어냅니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: AI 노드 자동 추천 및 토폴로지 분석</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/MindMapPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/MindMapPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PdfRagPlugin",
    "name": "Pdf Rag Plugin",
    "description": "<span class='desc-asis'>[As-Is] 500페이지가 넘는 논문이나 매뉴얼은 텍스트 검색만으로는 원하는 맥락을 찾기 불가능</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 문서 통째로 씹어먹는 AI 챗봇!</b> 수백 메가의 대형 PDF들을 벡터 DB에 인덱싱하여 인간처럼 이해하고 정확한 출처와 함께 추론해 답변합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 다중 문서 교차 분석 및 수식/표 OCR 인식</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PdfRagPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PdfRagPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PomodoroPlugin",
    "name": "Pomodoro Plugin",
    "description": "<span class='desc-asis'>[As-Is] 단순 타이머는 집중 실패 원인을 분석해주지 않아 나쁜 습관이 반복됨</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 딥 다이브 포커스 트래커!</b> 집중도를 수치화하고 가장 효율이 높은 시간대를 분석해 당신만의 완벽한 루틴을 설계해줍니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 주간 집중력 리포트 및 바이오리듬 연동</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PomodoroPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PomodoroPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PresentationPlugin",
    "name": "Presentation Plugin",
    "description": "<span class='desc-asis'>[As-Is] 정적인 텍스트만으로는 청중을 설득하거나 강렬한 인상을 남기기 부족함</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 시네마틱 프레젠테이션 엔진!</b> 데이터 바인딩 기반의 동적 슬라이드와 부드러운 화면 전환으로 애플급 키노트를 워크스페이스에서 구현합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 실시간 인터랙티브 투표 및 청중 Q&A 연동</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PresentationPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PresentationPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "RestClientPlugin",
    "name": "Rest Client Plugin",
    "description": "<span class='desc-asis'>[As-Is] 복잡한 OAuth2 토큰 갱신이나 전후 처리 스크립트 작성 시 기존 툴은 너무 무거움</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 완전 무장한 API 개발 플랫폼!</b> 워크스페이스의 자격 증명을 안전하게 재사용하며 체인 리퀘스트와 자동화된 테스트 슈트를 가볍게 구동합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: GraphQL 완벽 지원 및 응답 스키마 자동 검증</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/RestClientPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/RestClientPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "VoiceDictationPlugin",
    "name": "Voice Dictation Plugin",
    "description": "<span class='desc-asis'>[As-Is] 네트워크가 끊기면 음성 인식이 멈추고 억양이나 전문 용어를 제대로 인식하지 못함</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 온디바이스 AI 트랜스크립터!</b> 네트워크 없이 구동되는 오프라인 딥러닝 모델이 의료/법률 등 전문 용어까지 문맥에 맞게 정확히 받아 적습니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 화자 분리(Diarization) 및 실시간 다국어 동시통역</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/VoiceDictationPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/VoiceDictationPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "WireframePlugin",
    "name": "Wireframe Plugin",
    "description": "<span class='desc-asis'>[As-Is] 직접 그린 와이어프레임을 개발자에게 넘겨주면 CSS로 다시 변환하는 이중 작업 발생</span><br/><span class='desc-tobe'>[To-Be] <b>[Premium] 디자인-투-코드(Design-to-Code) 스튜디오!</b> 드래그 앤 드롭으로 만든 UI에서 React, Vue, HTML 코드를 프로덕션 레벨로 즉시 추출합니다.</span><br/><span class='desc-highlight'>💎 프리미엄 특화: 1000+ 프리미엄 컴포넌트 팩 및 디자인 시스템 동기화</span>",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/WireframePlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/WireframePlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  }
];
  allPlugins = staticPlugins;
  renderPlugins(allPlugins);


  function renderPlugins(plugins) {
    premiumGrid.innerHTML = '';
    standardGrid.innerHTML = '';

    plugins.forEach(plugin => {
      const isPremium = plugin.type === 'premium' || (plugin.scriptUrl && plugin.scriptUrl.includes('premium'));
      const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(plugin.name)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;
      const previewUrl = plugin.previewUrl || `/plugins/${isPremium ? 'premium/' : ''}${plugin.id}-preview.html`;

      const card = document.createElement('div');
      card.className = 'plugin-card';
      // Store ID to help with active state if needed
      card.dataset.id = plugin.id;
      
      card.innerHTML = `
        <div class="card-header">
          <div class="icon-wrapper">
            <img src="${iconUrl}" alt="${plugin.name} icon">
          </div>
          <div class="title-wrap">
            <h4>${plugin.name}</h4>
            <span class="version">v${plugin.version || '1.0.0'}</span>
          </div>
        </div>
        <p class="description">${plugin.description}</p>
        <div class="card-footer" style="flex-wrap: wrap; gap: 8px;">
          <span class="type-tag">${plugin.type}</span>
        </div>
      `;

      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        document.querySelectorAll('.plugin-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        window.openPreview(previewUrl, plugin.name, plugin.description, isPremium);
      });

      if (isPremium) {
        premiumGrid.appendChild(card);
      } else {
        standardGrid.appendChild(card);
      }
    });

    if (premiumGrid.children.length === 0) premiumGrid.innerHTML = '<p class="text-muted">검색된 프리미엄 기능이 없습니다.</p>';
    if (standardGrid.children.length === 0) standardGrid.innerHTML = '<p class="text-muted">검색된 스탠다드 기능이 없습니다.</p>';
  }

  // Real-time search filtering
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allPlugins.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
    renderPlugins(filtered);
  });

  // About Modal Logic
  const aboutBtn = document.getElementById('aboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const closeAboutBtn = document.getElementById('closeAboutBtn');

  if (aboutBtn && aboutModal && closeAboutBtn) {
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      aboutModal.style.display = 'flex';
      setTimeout(() => {
        aboutModal.classList.add('visible');
      }, 10);
    });

    closeAboutBtn.addEventListener('click', () => {
      aboutModal.classList.remove('visible');
      setTimeout(() => {
        aboutModal.style.display = 'none';
      }, 300);
    });

    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.remove('visible');
        setTimeout(() => {
          aboutModal.style.display = 'none';
        }, 300);
      }
    });
  }
});
