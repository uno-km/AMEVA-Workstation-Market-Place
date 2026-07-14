const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../README-template.md');
const README_PATH = path.join(__dirname, '../README.md');
const BASIC_DIR = path.join(__dirname, '../public/plugins');
const PREMIUM_DIR = path.join(__dirname, '../public/plugins/premium');

// 예쁜 표시 이름 맵핑
const displayNames = {
  'calculator': 'Smart Calculator',
  'minimap': 'Document Minimap',
  'outline': 'TOC Navigator',
  'rich-styling': 'Rich Text Studio',
  'drawing-board': 'Whiteboard Canvas',
  'naver': 'Naver Portal Viewer',
  'google': 'Google Stealth Search',
  'youtube': 'YouTube PiP Player',
  'google-drive': 'Google Drive Cloud Sync',
  'cloud-collab': 'Live Team Collaboration',
  'calendar': 'Smart Scheduler',
  'FinanceDashboardView': 'Global Finance & Exchange',
  'DatabaseExplorerPlugin': 'Database Inspector',
  'GoogleMapsView': 'Google Maps Integrator',
  'AmevaBrowserView': 'Ameva In-App Browser',
  'MindMapPlugin': 'Idea Mind Mapper',
  'WireframePlugin': 'UI/UX Wireframer',
  'KanbanBoard': 'Agile Kanban Board',
  'PdfRagPlugin': 'AI PDF Analyst (RAG)',
  'PomodoroPlugin': 'Pomodoro Focus Timer',
  'PresentationPlugin': 'Markdown Presenter',
  'VoiceDictationPlugin': 'AI Voice Dictation',
  'RestClientPlugin': 'API Testing Studio'
};

const descriptions = {
  'calculator': '문서 작업의 흐름을 끊지 않고 즉석에서 복잡한 수식을 계산할 수 있는 스마트 도우미입니다.',
  'minimap': '방대한 문서의 전체 윤곽을 한눈에 파악하고 원하는 위치로 빠르게 이동할 수 있는 우측 미니맵 뷰어를 제공합니다.',
  'outline': '문서 내 제목(Heading) 구조를 자동으로 분석하여 좌측에 직관적인 트리 형태의 목차(TOC) 네비게이션을 구축합니다.',
  'rich-styling': '단조로운 텍스트를 넘어, 글꼴, 크기, 색상 등 풍부한 타이포그래피 서식을 자유롭게 적용할 수 있는 강력한 스타일링 툴바입니다.',
  'drawing-board': '글로 표현하기 어려운 복잡한 아이디어를 문서 중간에 즉각적으로 스케치하고 드로잉할 수 있는 무한 캔버스 보드입니다.',
  'naver': '브라우저 창을 넘나들 필요 없이 워크스테이션 내부에서 안전하게 네이버 서비스를 이용할 수 있는 내장형 포털 뷰어입니다.',
  'google': '검색 기록을 남기지 않는 안전한 임시 프라이버시 세션을 통해, 즉석에서 구글 검색을 활용할 수 있는 스텔스 브라우저입니다.',
  'youtube': '작업 중인 문서 화면을 가리지 않으면서, 멀티태스킹이 가능한 PIP(Picture-in-Picture) 팝업 형태의 유튜브 플레이어를 지원합니다.',
  'google-drive': '소중한 작업 데이터를 구글 드라이브 클라우드에 원클릭으로 직접 백업하고 실시간 동기화하여 유실을 원천 차단합니다.',
  'cloud-collab': '시공간의 제약을 뛰어넘어, 강력한 보안 중앙 채널을 통해 팀원들과 문서를 실시간으로 동시 편집할 수 있는 엔터프라이즈급 협업 솔루션입니다.',
  'calendar': '프로젝트 일정과 문서 작업 데드라인을 직관적으로 연동하고 관리할 수 있는 맞춤형 스마트 스케줄러입니다.',
  'FinanceDashboardView': '전 세계 주요 주식 시장 지수, 실시간 환율(VND 포함), 금리 현황을 한 곳에서 모니터링할 수 있는 전문가용 금융 대시보드입니다.',
  'DatabaseExplorerPlugin': '서버에 내장된 데이터베이스의 구조와 테이블을 즉석에서 탐색하고 쿼리를 테스트해 볼 수 있는 개발자용 인스펙터입니다.',
  'GoogleMapsView': '문서 내에 특정 장소를 검색하여 첨부하거나, 전 세계의 지도를 자유롭게 탐색할 수 있는 구글 지도 연동형 뷰어입니다.',
  'AmevaBrowserView': '별도의 외부 브라우저 없이도 모든 웹 서핑과 자료 조사를 에디터 내부에서 끝낼 수 있는 초고속 통합형 웹 브라우저입니다.',
  'MindMapPlugin': '머릿속의 파편화된 아이디어와 개념들을 시각적인 노드와 링크로 연결하여 구조화할 수 있는 브레인스토밍 도구입니다.',
  'WireframePlugin': '웹/앱 기획 단계에서 신속하게 UI 레이아웃을 스케치하고 프로토타입을 설계할 수 있는 전문가용 와이어프레이밍 툴입니다.',
  'KanbanBoard': '업무 진행 상황(To-Do, In Progress, Done)을 시각적인 카드로 관리하여 애자일한 팀 생산성을 끌어올리는 칸반 솔루션입니다.',
  'PdfRagPlugin': '수백 페이지에 달하는 방대한 PDF 논문이나 매뉴얼을 로드하고, AI 기술을 통해 즉각적인 요약과 질의응답을 수행하는 지식 분석 툴입니다.',
  'PomodoroPlugin': '집중과 휴식의 황금 비율(25분/5분)을 통해 사용자의 작업 효율을 극대화하고 번아웃을 예방하는 뽀모도로 타이머입니다.',
  'PresentationPlugin': '작성된 마크다운 문서를 별도의 PPT 변환 과정 없이, 단 1초 만에 화려한 발표용 슬라이드 모드로 전환해 주는 프레젠터입니다.',
  'VoiceDictationPlugin': '타이핑할 필요 없이 말하는 즉시 AI가 고정밀 STT 기술로 음성을 인식하여 텍스트로 자동 변환해 주는 딕테이션 툴입니다.',
  'RestClientPlugin': 'API 개발 및 검증을 위해, 포스트맨(Postman)과 같이 HTTP/REST 요청을 보내고 응답을 테스트할 수 있는 내장형 클라이언트입니다.'
};

const emojiMap = {
  'calculator': '🧮', 'minimap': '🗺️', 'outline': '📑', 'rich-styling': '🎨', 
  'drawing-board': '🖍️', 'naver': '📗', 'google': '🔍', 'youtube': '📺', 
  'google-drive': '☁️', 'cloud-collab': '🤝', 'calendar': '📅', 
  'FinanceDashboardView': '📈', 'DatabaseExplorerPlugin': '🗄️', 'GoogleMapsView': '📍', 
  'AmevaBrowserView': '🌐', 'MindMapPlugin': '🧠', 'WireframePlugin': '📐', 
  'KanbanBoard': '📋', 'PdfRagPlugin': '📄', 'PomodoroPlugin': '🍅', 
  'PresentationPlugin': '📽️', 'VoiceDictationPlugin': '🎙️', 'RestClientPlugin': '🔌'
};

function getFiles(dir, ext) {
  try {
    return fs.readdirSync(dir).filter(file => file.endsWith(ext));
  } catch (e) {
    return [];
  }
}

function generateHtmlCards(files, ext, isPremium) {
  if (files.length === 0) return '> 아직 등록된 제품이 없습니다.\n';

  const badgeColor = isPremium ? 'ff69b4' : '007bff'; 
  const badgeText = isPremium ? 'Enterprise' : 'Standard';

  let html = '<table>\n';
  html += '  <thead>\n';
  html += '    <tr>\n';
  html += '      <th width="12%" align="center">Preview</th>\n';
  html += '      <th width="28%">Product Name</th>\n';
  html += '      <th width="60%">Features & Benefits</th>\n';
  html += '    </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';

  files.forEach(file => {
    const rawName = file.replace(ext, '');
    const name = displayNames[rawName] || rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const desc = descriptions[rawName] || '마켓플레이스에 새로 런칭된 최신 확장팩입니다.';
    const emoji = emojiMap[rawName] || '✨';
    
    const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;

    html += '    <tr>\n';
    html += `      <td align="center">\n`;
    html += `        <img src="${iconUrl}" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>\n`;
    html += `        <span style="font-size: 1.5rem;">${emoji}</span>\n`;
    html += `      </td>\n`;
    html += `      <td>\n`;
    html += `        <b style="font-size: 1.1em; color: #2c3e50;">${name}</b><br/><br/>\n`;
    html += `        <img src="https://img.shields.io/badge/Edition-${badgeText}-${badgeColor}?style=flat-square" />\n`;
    html += `      </td>\n`;
    html += `      <td>\n`;
    html += `        ${desc}<br/><br/>\n`;
    html += `        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #${badgeColor}; color: #6c757d; font-size: 0.9em;">✨ 클라우드 스트리밍을 통한 1-Click 즉시 활성화 지원</blockquote>\n`;
    html += `      </td>\n`;
    html += '    </tr>\n';
  });

  html += '  </tbody>\n';
  html += '</table>\n';

  return html;
}

function buildReadme() {
  const basicFiles = getFiles(BASIC_DIR, '.js');
  const premiumFiles = getFiles(PREMIUM_DIR, '.tsx');

  const basicCards = generateHtmlCards(basicFiles, '.js', false);
  const premiumCards = generateHtmlCards(premiumFiles, '.tsx', true);

  let templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  templateContent = templateContent.replace('<!-- INJECT_BASIC_PLUGINS -->', basicCards);
  templateContent = templateContent.replace('<!-- INJECT_PREMIUM_PLUGINS -->', premiumCards);

  fs.writeFileSync(README_PATH, templateContent);
  console.log('✅ [AMEVA Marketplace] Commercial README.md has been dynamically built!');
}

buildReadme();
