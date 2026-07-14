const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '../public/plugins');
const PREMIUM_DIR = path.join(__dirname, '../public/plugins/premium');

function generatePreviewHtml(id, name, type) {
  const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
  const isPremium = type === 'premium';
  
  // Create different mock content based on name heuristics
  let mockContent = `<div class="pulse" style="font-size: 4rem; margin-bottom: 20px;">✨</div><div style="text-align:center;"><h3 style="color:#fff;margin-bottom:10px;">${name}</h3><p>이 플러그인의 인터랙티브 시뮬레이션 환경입니다.</p></div>`;
  
  if (name.toLowerCase().includes('finance') || name.toLowerCase().includes('chart')) {
    mockContent = `
      <div style="display:flex; align-items:flex-end; gap:8px; height:150px;">
        <div class="shimmer" style="width:40px; height:60%; border-radius:4px 4px 0 0;"></div>
        <div class="shimmer" style="width:40px; height:80%; border-radius:4px 4px 0 0;"></div>
        <div class="shimmer" style="width:40px; height:40%; border-radius:4px 4px 0 0;"></div>
        <div class="shimmer" style="width:40px; height:90%; border-radius:4px 4px 0 0; background:var(--primary);"></div>
        <div class="shimmer" style="width:40px; height:50%; border-radius:4px 4px 0 0;"></div>
        <div class="shimmer" style="width:40px; height:100%; border-radius:4px 4px 0 0; background:var(--premium);"></div>
      </div>
      <div style="position:absolute; top:20px; left:20px; color:#fff;">Live Market Data</div>
    `;
  } else if (name.toLowerCase().includes('collab') || name.toLowerCase().includes('sync')) {
    mockContent = `
      <div style="position:relative; width:100%; height:100%;">
        <div style="position:absolute; top:20%; left:30%; padding:8px 16px; background:var(--primary); color:#fff; border-radius:20px; font-size:14px; box-shadow:0 4px 12px rgba(59,130,246,0.5); animation: float 3s ease-in-out infinite;">User A Cursor</div>
        <div style="position:absolute; bottom:30%; right:20%; padding:8px 16px; background:var(--premium); color:#fff; border-radius:20px; font-size:14px; box-shadow:0 4px 12px rgba(236,72,153,0.5); animation: float 4s ease-in-out infinite reverse;">User B Cursor</div>
      </div>
    `;
  } else if (name.toLowerCase().includes('youtube') || name.toLowerCase().includes('video')) {
    mockContent = `
      <div style="width: 80%; height: 80%; background:#000; border-radius: 8px; position:relative; display:flex; align-items:center; justify-content:center;">
        <div style="width:60px; height:40px; background:#f00; border-radius:8px; display:flex; align-items:center; justify-content:center;">
          <div style="width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-left:15px solid #fff; margin-left:5px;"></div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${name} Preview</title>
  <link rel="stylesheet" href="${isPremium ? '../' : ''}preview-shared.css">
  <style>
    @keyframes float { 0% {transform:translateY(0);} 50% {transform:translateY(-15px);} 100% {transform:translateY(0);} }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <img src="${iconUrl}" class="preview-icon" alt="icon" />
      <div class="preview-title">
        <h2>${name} <span style="font-size:12px; padding:2px 8px; border-radius:12px; background:${isPremium ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)'}; color:${isPremium ? 'var(--premium)' : 'var(--primary)'}; vertical-align:middle; margin-left:8px;">${isPremium ? 'Premium' : 'Standard'}</span></h2>
        <p>실제 작동 화면 미리보기 (Mockup Simulation)</p>
      </div>
    </div>
    <div class="preview-body">
      <div class="mock-window">
        <div class="mock-titlebar">
          <div class="mock-dot r"></div><div class="mock-dot y"></div><div class="mock-dot g"></div>
        </div>
        <div class="mock-content">
          ${mockContent}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function processDirectory(dir, type) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.tsx')) {
      const ext = path.extname(file);
      const id = file.replace(ext, '');
      const name = id.split(/[-_]+|(?=[A-Z])/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      const htmlContent = generatePreviewHtml(id, name, type);
      const targetPath = path.join(dir, `${id}-preview.html`);
      
      fs.writeFileSync(targetPath, htmlContent, 'utf8');
      console.log(`Generated preview for ${id} -> ${targetPath}`);
    }
  });
}

// 1. 공용 플러그인 처리
processDirectory(PLUGINS_DIR, 'standard');

// 2. 프리미엄 플러그인 처리
processDirectory(PREMIUM_DIR, 'premium');

console.log('All preview pages generated successfully!');
