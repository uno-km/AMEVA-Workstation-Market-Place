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
  let isSidebarOpen = true;
  toggleSidebarBtn.addEventListener('click', () => {
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      previewSidebar.classList.remove('sidebar-collapsed');
      toggleSidebarBtn.textContent = '▶';
    } else {
      previewSidebar.classList.add('sidebar-collapsed');
      toggleSidebarBtn.textContent = '◀';
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
      toggleSidebarBtn.click(); // Open sidebar if closed
    }
    previewIframe.src = url;
    previewTitle.textContent = name;
    previewDesc.textContent = description;
    
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
    "description": "다양한 공학용/재무용 연산을 지원하는 직관적인 고급 계산기 도구입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calculator.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calculator-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "calendar",
    "name": "Calendar",
    "description": "일정 관리, 스케줄링 및 캘린더 동기화를 지원하는 스마트 캘린더 플러그인입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calendar.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/calendar-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "cloud-collab",
    "name": "Cloud Collab",
    "description": "팀원들과 실시간으로 문서를 공동 편집하고 화상/음성 채팅을 지원하는 협업 툴입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/cloud-collab.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/cloud-collab-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "db-explorer",
    "name": "Db Explorer",
    "description": "다양한 데이터베이스(MySQL, PostgreSQL 등)를 시각적으로 탐색하고 SQL을 실행하는 도구입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/db-explorer.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/db-explorer-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "drawing-board",
    "name": "Drawing Board",
    "description": "자유로운 펜 드로잉과 스케치가 가능한 실시간 화이트보드 캔버스입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/drawing-board.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/drawing-board-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "finance-dashboard",
    "name": "Finance Dashboard",
    "description": "주식, 코인 등 실시간 시세와 차트를 제공하는 맞춤형 금융 대시보드입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/finance-dashboard.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/finance-dashboard-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google-drive",
    "name": "Google Drive",
    "description": "구글 드라이브와 연동하여 내 파일과 문서를 워크스페이스 내에서 직접 관리합니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-drive.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-drive-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google-maps",
    "name": "Google Maps",
    "description": "구글 지도 기반의 위치 검색, 길 찾기 및 로케이션 핀 관리 도구입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-maps.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-maps-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "google",
    "name": "Google",
    "description": "구글 검색 엔진을 워크스페이스 내에서 바로 사용할 수 있는 브라우징 도구입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/google-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "mind-map",
    "name": "Mind Map",
    "description": "아이디어를 시각적인 브레인스토밍 노드로 구조화하여 보여주는 마인드맵 툴입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/mind-map.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/mind-map-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "minimap",
    "name": "Minimap",
    "description": "방대한 코드나 문서를 한눈에 파악할 수 있는 스크롤 미니맵 내비게이션 뷰어입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/minimap.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/minimap-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "naver",
    "name": "Naver",
    "description": "네이버 검색 엔진과 주요 서비스를 내장 브라우저 형태로 제공하는 확장 플러그인입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/naver.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/naver-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "outline",
    "name": "Outline",
    "description": "긴 문서의 목차를 자동으로 생성하고 계층형 구조로 정리해주는 아웃라인 뷰어입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/outline.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/outline-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "pdf-rag",
    "name": "Pdf Rag",
    "description": "PDF 문서를 분석하여 AI가 맥락을 이해하고 관련 질문에 답변하는 스마트 RAG 시스템입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pdf-rag.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pdf-rag-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "pomodoro",
    "name": "Pomodoro",
    "description": "작업 시간과 휴식 시간을 체계적으로 관리해 집중력을 극대화하는 뽀모도로 타이머입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pomodoro.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/pomodoro-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "presentation",
    "name": "Presentation",
    "description": "워크스페이스 내에서 바로 슬라이드를 작성하고 발표 모드로 전환할 수 있는 프레젠테이션 툴입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/presentation.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/presentation-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "rest-client",
    "name": "Rest Client",
    "description": "HTTP API 요청을 보내고 응답을 디버깅할 수 있는 Postman 스타일의 REST 클라이언트입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rest-client.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rest-client-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "rich-styling",
    "name": "Rich Styling",
    "description": "굵게, 기울임꼴, 색상 등 워드프로세서급 서식을 적용할 수 있는 리치 텍스트 에디터입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rich-styling.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/rich-styling-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "voice-dictation",
    "name": "Voice Dictation",
    "description": "사용자의 음성을 실시간으로 인식하여 텍스트로 변환해주는 AI 받아쓰기 플러그인입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/voice-dictation.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/voice-dictation-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "web-browser",
    "name": "Web Browser",
    "description": "워크스페이스 내에서 새 탭을 열지 않고도 웹을 탐색할 수 있는 내장형 웹 브라우저입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/web-browser.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/web-browser-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "wireframe",
    "name": "Wireframe",
    "description": "드래그 앤 드롭으로 빠르고 쉽게 UI/UX 프로토타입을 설계하는 와이어프레임 툴입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/wireframe.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/wireframe-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "youtube",
    "name": "Youtube",
    "description": "유튜브 동영상을 검색하고 플레이리스트를 관리하며 백그라운드 재생을 지원합니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/youtube.js",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/youtube-preview.html",
    "version": "1.0.0",
    "type": "feature"
  },
  {
    "id": "AmevaBrowserView",
    "name": "Ameva Browser View",
    "description": "보안과 렌더링 성능이 강화된 프리미엄 내장 웹 브라우저입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/AmevaBrowserView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/AmevaBrowserView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "DatabaseExplorerPlugin",
    "name": "Database Explorer Plugin",
    "description": "대용량 데이터베이스 연결 및 쿼리 최적화를 지원하는 프로 DB 탐색기입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/DatabaseExplorerPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/DatabaseExplorerPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "FinanceDashboardView",
    "name": "Finance Dashboard View",
    "description": "기관급 실시간 데이터 스트리밍이 적용된 프리미엄 트레이딩 대시보드입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/FinanceDashboardView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/FinanceDashboardView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "GoogleMapsView",
    "name": "Google Maps View",
    "description": "고도화된 길찾기와 3D 뷰를 지원하는 엔터프라이즈 구글 맵스 뷰어입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/GoogleMapsView.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/GoogleMapsView-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "KanbanBoard",
    "name": "Kanban Board",
    "description": "애자일 업무 관리를 위한 드래그 앤 드롭 형태의 고급 칸반 보드 시스템입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/KanbanBoard.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/KanbanBoard-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "MindMapPlugin",
    "name": "Mind Map Plugin",
    "description": "무제한 노드와 협업 동기화가 추가된 전문가용 마인드맵 설계 도구입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/MindMapPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/MindMapPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PdfRagPlugin",
    "name": "Pdf Rag Plugin",
    "description": "수백 페이지의 대용량 PDF 문서도 순식간에 분석하는 프리미엄 AI RAG 엔진입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PdfRagPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PdfRagPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PomodoroPlugin",
    "name": "Pomodoro Plugin",
    "description": "상세한 통계와 맞춤형 알림 설정이 추가된 프로 뽀모도로 매니저입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PomodoroPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PomodoroPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "PresentationPlugin",
    "name": "Presentation Plugin",
    "description": "풍부한 애니메이션과 템플릿 라이브러리가 포함된 프레젠테이션 스튜디오입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PresentationPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/PresentationPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "RestClientPlugin",
    "name": "Rest Client Plugin",
    "description": "복잡한 인증 및 자동화된 테스트 스크립트를 지원하는 고급 REST 클라이언트입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/RestClientPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/RestClientPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "VoiceDictationPlugin",
    "name": "Voice Dictation Plugin",
    "description": "다국어 지원 및 오프라인 처리가 가능한 엔터프라이즈 음성 인식기입니다.",
    "scriptUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/VoiceDictationPlugin.tsx",
    "previewUrl": "https://uno-km.github.io/AMEVA-Workstation-Market-Place/plugins/premium/VoiceDictationPlugin-preview.html",
    "version": "1.0.0",
    "type": "premium"
  },
  {
    "id": "WireframePlugin",
    "name": "Wireframe Plugin",
    "description": "고품질 컴포넌트 라이브러리와 내보내기 기능이 지원되는 프로 UI 프로토타이핑 툴입니다.",
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
});
