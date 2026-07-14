const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');
const publicDir = path.join(__dirname, 'public');
const apiDir = path.join(docsDir, 'api');
const financeApiDir = path.join(apiDir, 'finance');

const BASE_URL = 'https://uno-km.github.io/AMEVA-Workstation-Market-Place';

// 1. Create directories
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
}
fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });
fs.mkdirSync(financeApiDir, { recursive: true });

// 2. Copy public folder to docs recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
copyRecursiveSync(publicDir, docsDir);

// 3. Update localhost:3010 to BASE_URL in docs files (plugins JS/TSX)
function replaceUrlInFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceUrlInFiles(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace API URLs to use .json extension for static hosting
      content = content.replace(/http:\/\/localhost:3010\/api\/finance\/data/g, `${BASE_URL}/api/finance/data.json`);
      content = content.replace(/http:\/\/localhost:3010\/api\/finance\/stock-detail\?ticker=[^`'"]+/g, `${BASE_URL}/api/finance/stock-detail.json`);
      content = content.replace(/http:\/\/localhost:3010\/api\/finance\/search\?q=[^`'"]+/g, `${BASE_URL}/api/finance/search.json`);
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  });
}
replaceUrlInFiles(docsDir);

// 4. Generate plugins.json
let plugins = [
  {
    id: 'pythonConsole',
    name: 'Python Sandbox Executor (Pro)',
    description: '마크다운 환경 내에서 안전한 파이썬 샌드박스를 구동하여 데이터 분석 및 코드를 실행합니다.',
    scriptUrl: `${BASE_URL}/plugins/premium/pythonConsole.js`,
    previewUrl: `${BASE_URL}/plugins/premium/pythonConsole-preview.html`,
    version: '1.0.0',
    type: 'premium'
  },
  {
    id: 'requestQueue',
    name: 'Sequential Request Queue',
    description: '여러 API 호출을 순차적이고 안정적으로 처리하는 분산 큐 시스템입니다.',
    scriptUrl: `${BASE_URL}/plugins/premium/requestQueue.js`,
    previewUrl: `${BASE_URL}/plugins/premium/requestQueue-preview.html`,
    version: '1.0.0',
    type: 'premium'
  }
];

const customDescriptions = {
  'calculator': '다양한 공학용/재무용 연산을 지원하는 직관적인 고급 계산기 도구입니다.',
  'calendar': '일정 관리, 스케줄링 및 캘린더 동기화를 지원하는 스마트 캘린더 플러그인입니다.',
  'cloud-collab': '팀원들과 실시간으로 문서를 공동 편집하고 화상/음성 채팅을 지원하는 협업 툴입니다.',
  'db-explorer': '다양한 데이터베이스(MySQL, PostgreSQL 등)를 시각적으로 탐색하고 SQL을 실행하는 도구입니다.',
  'drawing-board': '자유로운 펜 드로잉과 스케치가 가능한 실시간 화이트보드 캔버스입니다.',
  'finance-dashboard': '주식, 코인 등 실시간 시세와 차트를 제공하는 맞춤형 금융 대시보드입니다.',
  'google-drive': '구글 드라이브와 연동하여 내 파일과 문서를 워크스페이스 내에서 직접 관리합니다.',
  'google-maps': '구글 지도 기반의 위치 검색, 길 찾기 및 로케이션 핀 관리 도구입니다.',
  'google': '구글 검색 엔진을 워크스페이스 내에서 바로 사용할 수 있는 브라우징 도구입니다.',
  'mind-map': '아이디어를 시각적인 브레인스토밍 노드로 구조화하여 보여주는 마인드맵 툴입니다.',
  'minimap': '방대한 코드나 문서를 한눈에 파악할 수 있는 스크롤 미니맵 내비게이션 뷰어입니다.',
  'naver': '네이버 검색 엔진과 주요 서비스를 내장 브라우저 형태로 제공하는 확장 플러그인입니다.',
  'outline': '긴 문서의 목차를 자동으로 생성하고 계층형 구조로 정리해주는 아웃라인 뷰어입니다.',
  'pdf-rag': 'PDF 문서를 분석하여 AI가 맥락을 이해하고 관련 질문에 답변하는 스마트 RAG 시스템입니다.',
  'pomodoro': '작업 시간과 휴식 시간을 체계적으로 관리해 집중력을 극대화하는 뽀모도로 타이머입니다.',
  'presentation': '워크스페이스 내에서 바로 슬라이드를 작성하고 발표 모드로 전환할 수 있는 프레젠테이션 툴입니다.',
  'rest-client': 'HTTP API 요청을 보내고 응답을 디버깅할 수 있는 Postman 스타일의 REST 클라이언트입니다.',
  'rich-styling': '굵게, 기울임꼴, 색상 등 워드프로세서급 서식을 적용할 수 있는 리치 텍스트 에디터입니다.',
  'voice-dictation': '사용자의 음성을 실시간으로 인식하여 텍스트로 변환해주는 AI 받아쓰기 플러그인입니다.',
  'web-browser': '워크스페이스 내에서 새 탭을 열지 않고도 웹을 탐색할 수 있는 내장형 웹 브라우저입니다.',
  'wireframe': '드래그 앤 드롭으로 빠르고 쉽게 UI/UX 프로토타입을 설계하는 와이어프레임 툴입니다.',
  'youtube': '유튜브 동영상을 검색하고 플레이리스트를 관리하며 백그라운드 재생을 지원합니다.',
  'AmevaBrowserView': '보안과 렌더링 성능이 강화된 프리미엄 내장 웹 브라우저입니다.',
  'DatabaseExplorerPlugin': '대용량 데이터베이스 연결 및 쿼리 최적화를 지원하는 프로 DB 탐색기입니다.',
  'FinanceDashboardView': '기관급 실시간 데이터 스트리밍이 적용된 프리미엄 트레이딩 대시보드입니다.',
  'GoogleMapsView': '고도화된 길찾기와 3D 뷰를 지원하는 엔터프라이즈 구글 맵스 뷰어입니다.',
  'KanbanBoard': '애자일 업무 관리를 위한 드래그 앤 드롭 형태의 고급 칸반 보드 시스템입니다.',
  'MindMapPlugin': '무제한 노드와 협업 동기화가 추가된 전문가용 마인드맵 설계 도구입니다.',
  'PdfRagPlugin': '수백 페이지의 대용량 PDF 문서도 순식간에 분석하는 프리미엄 AI RAG 엔진입니다.',
  'PomodoroPlugin': '상세한 통계와 맞춤형 알림 설정이 추가된 프로 뽀모도로 매니저입니다.',
  'PresentationPlugin': '풍부한 애니메이션과 템플릿 라이브러리가 포함된 프레젠테이션 스튜디오입니다.',
  'RestClientPlugin': '복잡한 인증 및 자동화된 테스트 스크립트를 지원하는 고급 REST 클라이언트입니다.',
  'VoiceDictationPlugin': '다국어 지원 및 오프라인 처리가 가능한 엔터프라이즈 음성 인식기입니다.',
  'WireframePlugin': '고품질 컴포넌트 라이브러리와 내보내기 기능이 지원되는 프로 UI 프로토타이핑 툴입니다.',
  'webSearch': '광고 없는 프라이빗 웹 검색 및 요약을 제공하는 DuckDuckGo 기반 프리미엄 검색 툴입니다.'
};

const pluginsDirPath = path.join(publicDir, 'plugins');
if (fs.existsSync(pluginsDirPath)) {
  const files = fs.readdirSync(pluginsDirPath);
  files.filter(file => file.endsWith('.js')).forEach(file => {
    const id = file.replace('.js', '');
    if (!plugins.find(p => p.id === id)) {
      plugins.push({
        id,
        name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: customDescriptions[id] || `마켓플레이스 동적 제공 플러그인: ${id}`,
        scriptUrl: `${BASE_URL}/plugins/${file}`,
        previewUrl: `${BASE_URL}/plugins/${id}-preview.html`,
        version: '1.0.0',
        type: 'feature'
      });
    }
  });
}

const premiumDirPath = path.join(publicDir, 'plugins/premium');
if (fs.existsSync(premiumDirPath)) {
  const pfiles = fs.readdirSync(premiumDirPath);
  pfiles.filter(file => file.endsWith('.tsx')).forEach(file => {
    const id = file.replace('.tsx', '');
    if (!plugins.find(p => p.scriptUrl.includes(file))) {
      plugins.push({
        id,
        name: id.split(/(?=[A-Z])/).join(' '),
        description: customDescriptions[id] || `프리미엄 플러그인: ${id}`,
        scriptUrl: `${BASE_URL}/plugins/premium/${file}`,
        previewUrl: `${BASE_URL}/plugins/premium/${id}-preview.html`,
        version: '1.0.0',
        type: 'premium'
      });
    }
  });
}

fs.writeFileSync(path.join(apiDir, 'plugins.json'), JSON.stringify(plugins, null, 2), 'utf8');

// 5. Generate finance mockups
const mockData = {
  indices: [
    { ticker: '^KS11', name: 'KOSPI', price: 2750.45, changePercent: 0.8 },
    { ticker: '^KQ11', name: 'KOSDAQ', price: 850.12, changePercent: -0.3 },
    { ticker: '^GSPC', name: 'S&P 500', price: 5200.0, changePercent: 1.1 }
  ],
  popular: [
    { ticker: 'SANGSANG', name: '상상전자', price: 50000, changePercent: 1.2 },
    { ticker: 'AMEVA', name: '아메바시스템즈', price: 125000, changePercent: 5.4 },
    { ticker: 'MOCK', name: '가라테크', price: 8400, changePercent: -2.1 }
  ],
  exchange: {
    base: 'KRW',
    rates: [
      { currency: 'USD', name: '미국 달러', rate: 1350.50, change: -2.5 },
      { currency: 'JPY', name: '일본 엔', rate: 890.20, change: 1.1 },
      { currency: 'EUR', name: '유로', rate: 1450.80, change: 0.5 }
    ]
  }
};
fs.writeFileSync(path.join(financeApiDir, 'data.json'), JSON.stringify(mockData, null, 2), 'utf8');

const mockDetail = {
  ticker: 'SANGSANG',
  name: '상상전자',
  price: 50000,
  changePercent: 1.2
};
fs.writeFileSync(path.join(financeApiDir, 'stock-detail.json'), JSON.stringify(mockDetail, null, 2), 'utf8');
fs.writeFileSync(path.join(financeApiDir, 'search.json'), JSON.stringify([mockDetail], null, 2), 'utf8');

console.log('GitHub Pages static build completed successfully into /docs!');
