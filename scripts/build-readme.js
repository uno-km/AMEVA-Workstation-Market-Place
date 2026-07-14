const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../README-template.md');
const README_PATH = path.join(__dirname, '../README.md');
const BASIC_DIR = path.join(__dirname, '../public/plugins');
const PREMIUM_DIR = path.join(__dirname, '../public/plugins/premium');

// 기존 도구들에 대한 설명 (여기에 없는 파일은 자동 기본 메시지 부여)
const descriptions = {
  'calculator': '문서 작성 중 즉석으로 계산할 수 있는 확장 도구입니다.',
  'minimap': '에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.',
  'outline': '문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.',
  'rich-styling': '인라인 글씨 크기 조절 및 다양한 한글/영문 폰트 서식 변경 툴바를 활성화합니다.',
  'drawing-board': '문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.',
  'naver': '임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.',
  'google': '임시 세션으로 검색 내역을 남기지 않고 즉석 구글 검색을 활용하는 안전 웹 뷰어 도구입니다.',
  'youtube': '문서 작업 중 유튜브 비디오를 실시간 시청 및 PiP 팝업 모드로 전환할 수 있는 도구입니다.',
  'google-drive': '작성 중인 마크다운 문서를 구글 드라이브 클라우드에 다이렉트 업로드 및 백업 동기화하는 클라우드 연동 도구입니다.',
  'cloud-collab': '로컬 오프라인 제한을 뛰어넘어 보안 중앙 채널에서 팀원들과 원격 실시간 편집을 해금합니다.',
  'calendar': '문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.',
  'FinanceDashboardView': '실시간 글로벌 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.',
  'DatabaseExplorerPlugin': '데이터베이스 구조 탐색 및 쿼리를 위한 고급 탐색기 컴포넌트입니다.',
  'GoogleMapsView': '장소 검색 및 지도 탐색이 가능한 구글 지도 내장 뷰어 도구입니다.',
  'AmevaBrowserView': '워크스테이션 내부에 독립적으로 탑재되는 강력한 인앱 웹 브라우저입니다.',
  'MindMapPlugin': '복잡한 아이디어와 개념을 시각적으로 구성할 수 있는 마인드맵 도구입니다.',
  'WireframePlugin': '신속한 UI/UX 와이어프레임 및 프로토타입 설계를 돕는 툴입니다.',
  'KanbanBoard': '칸반 보드 형태로 직관적이고 시각적인 태스크(일정) 관리를 제공합니다.',
  'PdfRagPlugin': '대용량 PDF 문서를 로드하고 AI를 통해 질의응답(RAG) 및 요약 분석을 수행하는 고급 AI 플러그인입니다.',
  'PomodoroPlugin': '뽀모도로 기법을 적용하여 사용자의 작업 집중력을 극대화하고 시간을 관리해 주는 타이머입니다.',
  'PresentationPlugin': '작성된 마크다운 문서를 기반으로 즉석에서 발표용 슬라이드 모드를 구동하는 뷰어입니다.',
  'VoiceDictationPlugin': '실시간 음성 인식(STT)을 통해 음성을 텍스트로 즉각 변환하여 에디터에 타이핑하는 편의 도구입니다.',
  'RestClientPlugin': 'API 개발 및 테스트를 위해 워크스테이션 내장형으로 제공되는 HTTP/REST 클라이언트 컴포넌트입니다.'
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
  if (files.length === 0) return '> 아직 등록된 플러그인이 없습니다.\n';

  const badgeColor = isPremium ? 'ff69b4' : '4c1'; // 핑크색 for premium, 초록색 for basic
  const badgeText = isPremium ? 'Premium' : 'Active';

  let html = '<table>\n';
  html += '  <thead>\n';
  html += '    <tr>\n';
  html += '      <th width="12%" align="center">Preview</th>\n';
  html += '      <th width="28%">Plugin Info</th>\n';
  html += '      <th width="60%">Description & Details</th>\n';
  html += '    </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';

  files.forEach(file => {
    const name = file.replace(ext, '');
    const desc = descriptions[name] || '마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.';
    const emoji = emojiMap[name] || '✨';
    
    // UI Avatars for dynamic colorful icons based on plugin name
    const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;

    html += '    <tr>\n';
    html += `      <td align="center">\n`;
    html += `        <img src="${iconUrl}" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>\n`;
    html += `        <span style="font-size: 1.5rem;">${emoji}</span>\n`;
    html += `      </td>\n`;
    html += `      <td>\n`;
    html += `        <b style="font-size: 1.1em; color: #2c3e50;">${name}</b><br/>\n`;
    html += `        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">${file}</code><br/><br/>\n`;
    html += `        <img src="https://img.shields.io/badge/Status-${badgeText}-${badgeColor}?style=flat-square" />\n`;
    html += `      </td>\n`;
    html += `      <td>\n`;
    html += `        ${desc}<br/><br/>\n`;
    html += `        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #${badgeColor}; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>\n`;
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
  console.log('✅ [AMEVA Marketplace] README.md has been dynamically updated with Beautiful HTML Cards!');
}

buildReadme();
