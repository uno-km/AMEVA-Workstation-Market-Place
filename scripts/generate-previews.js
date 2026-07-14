const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '../public/plugins');
const PREMIUM_DIR = path.join(__dirname, '../public/plugins/premium');

function getMockContent(id) {
  const nid = id.toLowerCase();

  // 1. Finance / Stock
  if (nid.includes('finance')) {
    return `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; background:#0b0f19;">
        <div style="padding:16px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; gap:16px;">
          <div style="font-size:24px; font-weight:bold; color:#10b981;">$3,421.50 <span style="font-size:14px;">+2.4%</span></div>
          <div class="shimmer" style="height:24px; width:120px; border-radius:4px; margin-top:4px;"></div>
        </div>
        <div style="flex:1; padding:20px; position:relative; display:flex; align-items:flex-end; gap:8px;">
          <div class="shimmer" style="width:8%; height:40%; background:var(--success); border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:35%; background:#ef4444; border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:50%; background:var(--success); border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:45%; background:#ef4444; border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:70%; background:var(--success); border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:60%; background:#ef4444; border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:80%; background:var(--success); border-radius:4px 4px 0 0;"></div>
          <div class="shimmer" style="width:8%; height:90%; background:var(--success); border-radius:4px 4px 0 0;"></div>
        </div>
      </div>
    `;
  }

  // 2. Kanban Board
  if (nid.includes('kanban')) {
    return `
      <div style="width:100%; height:100%; display:flex; gap:16px; padding:16px; background:#f1f5f9; overflow-x:auto;">
        ${['To Do', 'In Progress', 'Done'].map((col, i) => `
          <div style="flex:1; min-width:250px; background:#e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
            <div style="font-weight:bold; color:#334155; font-size:14px; text-transform:uppercase;">${col}</div>
            <div class="pop-in" style="background:#fff; padding:12px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#0f172a; animation-delay:${i*0.2}s;">
              <div style="font-weight:600; font-size:14px; margin-bottom:8px;">Task ${i+1}</div>
              <div class="shimmer" style="width:100%; height:8px; border-radius:4px; margin-bottom:4px;"></div>
              <div class="shimmer" style="width:80%; height:8px; border-radius:4px;"></div>
            </div>
            ${i === 1 ? `
              <div class="pop-in" style="background:#fff; padding:12px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#0f172a; animation-delay:0.5s;">
                <div style="font-weight:600; font-size:14px; margin-bottom:8px;">Task ${i+2}</div>
                <div class="shimmer" style="width:100%; height:8px; border-radius:4px;"></div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Database / SQL Explorer
  if (nid.includes('db') || nid.includes('database')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#1e1e1e; color:#d4d4d4; font-family:monospace;">
        <div style="width:200px; border-right:1px solid #333; padding:16px; overflow-y:auto;">
          <div style="color:#569cd6; margin-bottom:12px;">?óÑÔ∏?Connections</div>
          <div style="padding-left:12px; margin-bottom:8px;">?ëâ prod_db</div>
          <div style="padding-left:24px; color:#ce9178;">?ìã users</div>
          <div style="padding-left:24px; color:#ce9178;">?ìã orders</div>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
          <div style="height:120px; border-bottom:1px solid #333; padding:16px; background:#1e1e1e;">
            <span style="color:#c586c0;">SELECT</span> * <span style="color:#c586c0;">FROM</span> <span style="color:#4ec9b0;">users</span><br/>
            <span style="color:#c586c0;">WHERE</span> status = <span style="color:#ce9178;">'active'</span>;
            <div style="margin-top:16px;"><button style="background:#0e639c; color:#fff; border:none; padding:4px 12px; border-radius:2px; cursor:pointer;">Run Query ??/button></div>
          </div>
          <div style="flex:1; padding:16px; background:#252526; overflow:hidden;">
            <table style="width:100%; text-align:left; border-collapse:collapse; font-size:13px;">
              <tr style="border-bottom:1px solid #444;"><th>id</th><th>name</th><th>status</th></tr>
              <tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;">1</td><td>Alice</td><td style="color:#4ec9b0;">active</td></tr>
              <tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;">2</td><td>Bob</td><td style="color:#4ec9b0;">active</td></tr>
              <tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;">3</td><td>Charlie</td><td style="color:#4ec9b0;">active</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // 4. PDF RAG / AI Chat
  if (nid.includes('rag') || nid.includes('ai')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#0f172a;">
        <div style="flex:1; border-right:1px solid rgba(255,255,255,0.1); padding:20px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <div style="width:60%; height:80%; background:#f8fafc; border-radius:8px; padding:20px; position:relative;">
            <div style="width:30px; height:40px; background:#ef4444; border-radius:4px; margin-bottom:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">PDF</div>
            <div class="shimmer" style="width:100%; height:12px; background:#cbd5e1; border-radius:6px; margin-bottom:8px;"></div>
            <div class="shimmer" style="width:90%; height:12px; background:#cbd5e1; border-radius:6px; margin-bottom:8px;"></div>
            <div class="shimmer" style="width:95%; height:12px; background:#cbd5e1; border-radius:6px; margin-bottom:8px;"></div>
          </div>
        </div>
        <div style="width:350px; background:#1e293b; display:flex; flex-direction:column;">
          <div style="padding:16px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; color:#fff;">AI Assistant</div>
          <div style="flex:1; padding:16px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
            <div class="slide-in-right" style="align-self:flex-end; background:var(--primary); color:#fff; padding:10px 14px; border-radius:12px 12px 0 12px; font-size:13px; max-width:80%;">Î¨∏ÏÑú???µÏã¨ ?îÏïΩ??Î≠êÏïº?</div>
            <div class="slide-in-right" style="align-self:flex-start; background:rgba(255,255,255,0.1); color:#fff; padding:10px 14px; border-radius:12px 12px 12px 0; font-size:13px; max-width:80%; animation-delay:0.5s; opacity:0;">
              ?¥Îãπ Î¨∏ÏÑú??AI ?úÏû•???ôÌñ•Í≥?ÎØ∏Îûò Í∞ÄÏπòÏóê ?Ä???§Î£®Í≥??àÏäµ?àÎã§.
            </div>
            <div class="pulse" style="align-self:flex-start; font-size:24px; color:var(--primary); animation-delay:1s;">...</div>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Google Maps
  if (nid.includes('map')) {
    return `
      <div style="width:100%; height:100%; background:#e5e3df; position:relative; overflow:hidden;">
        <div style="position:absolute; top:20px; left:20px; width:300px; height:48px; background:#fff; border-radius:24px; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; padding:0 16px;">
          <span style="color:#666;">Search places...</span>
        </div>
        <div class="float-anim" style="position:absolute; top:40%; left:50%; transform:translate(-50%, -50%);">
          <div style="width:30px; height:40px; background:#ea4335; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; justify-content:center; align-items:center; box-shadow:2px 2px 6px rgba(0,0,0,0.3);">
            <div style="width:12px; height:12px; background:#fff; border-radius:50%;"></div>
          </div>
        </div>
        <svg style="width:100%; height:100%; opacity:0.2;">
          <path d="M0,100 Q150,50 300,150 T600,200 T900,100" stroke="#000" stroke-width="4" fill="none"/>
          <path d="M100,0 L150,400 M300,0 L250,400" stroke="#000" stroke-width="6" fill="none"/>
        </svg>
      </div>
    `;
  }

  // 6. Collab
  if (nid.includes('collab')) {
    return `
      <div style="width:100%; height:100%; background:#fff; padding:40px; position:relative; overflow:hidden;">
        <div style="width:80%; margin:0 auto;">
          <h1 style="color:#111; font-size:28px; border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:20px;">Project Specification</h1>
          <p style="color:#444; font-size:16px; line-height:1.6;">
            The goal of this project is to create an amazing user experience.
            <span style="background:rgba(236,72,153,0.2); position:relative;">
              Our platform will
              <div class="float-anim" style="position:absolute; top:-25px; left:0; background:var(--premium); color:#fff; font-size:11px; padding:2px 8px; border-radius:4px; white-space:nowrap;">Alice</div>
              <div style="position:absolute; top:0; left:0; width:2px; height:100%; background:var(--premium);"></div>
            </span>
          </p>
          <div style="margin-top:20px; display:flex; align-items:center; gap:4px;">
            <div style="width:2px; height:20px; background:var(--primary); animation:pulse 1s infinite;"></div>
            <div class="float-anim" style="background:var(--primary); color:#fff; font-size:11px; padding:2px 8px; border-radius:4px; animation-delay:1s;">Bob</div>
          </div>
        </div>
      </div>
    `;
  }

  // 7. Video / YouTube
  if (nid.includes('youtube') || nid.includes('video')) {
    return `
      <div style="width:100%; height:100%; background:#000; position:relative; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:url('https://source.unsplash.com/1600x900/?nature,landscape') center/cover; opacity:0.4;"></div>
        <div class="pulse" style="width:80px; height:56px; background:#f00; border-radius:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;">
          <div style="width:0; height:0; border-top:14px solid transparent; border-bottom:14px solid transparent; border-left:22px solid #fff; margin-left:6px;"></div>
        </div>
        <div style="position:absolute; bottom:0; left:0; right:0; height:60px; background:linear-gradient(transparent, rgba(0,0,0,0.8)); display:flex; align-items:flex-end; padding:16px;">
          <div style="width:100%; height:4px; background:rgba(255,255,255,0.2); border-radius:2px; position:relative;">
            <div style="position:absolute; top:0; left:0; height:100%; width:35%; background:#f00; border-radius:2px;"></div>
            <div style="position:absolute; top:-4px; left:35%; width:12px; height:12px; background:#f00; border-radius:50%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 8. Python / Terminal
  if (nid.includes('python') || nid.includes('console')) {
    return `
      <div style="width:100%; height:100%; background:#1e1e1e; color:#d4d4d4; font-family:monospace; padding:16px; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:12px;">
          <span>Python 3.10.2 Sandbox</span>
          <span style="color:#27c93f;">??Running</span>
        </div>
        <div style="color:#569cd6;">&gt;&gt;&gt; import pandas as pd</div>
        <div style="color:#569cd6;">&gt;&gt;&gt; df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})</div>
        <div style="color:#569cd6;">&gt;&gt;&gt; print(df.mean())</div>
        <div style="color:#ce9178; margin-top:8px;">A    1.5<br/>B    3.5<br/>dtype: float64</div>
        <div style="margin-top:8px; display:flex; align-items:center;">
          <span style="color:#569cd6;">&gt;&gt;&gt;&nbsp;</span>
          <span class="pulse" style="width:8px; height:16px; background:#d4d4d4;"></span>
        </div>
      </div>
    `;
  }

  // 9. Browser / Search
  if (nid.includes('browser') || nid.includes('search') || nid.includes('google') || nid.includes('naver')) {
    return `
      <div style="width:100%; height:100%; background:#fff; display:flex; flex-direction:column;">
        <div style="height:48px; background:#f1f5f9; display:flex; align-items:center; padding:0 16px; gap:16px; border-bottom:1px solid #e2e8f0;">
          <div style="display:flex; gap:8px;">
            <div style="width:12px; height:12px; border-radius:50%; border:2px solid #94a3b8;"></div>
            <div style="width:12px; height:12px; border-radius:50%; border:2px solid #94a3b8;"></div>
          </div>
          <div style="flex:1; background:#fff; height:28px; border-radius:14px; border:1px solid #cbd5e1; display:flex; align-items:center; padding:0 16px; color:#64748b; font-size:13px;">
            https://search.example.com/?q=AI+Agents
          </div>
        </div>
        <div style="flex:1; padding:32px; background:#fff; overflow:hidden;">
          <div class="shimmer" style="width:150px; height:32px; border-radius:8px; margin-bottom:24px;"></div>
          ${[1, 2, 3].map(i => `
            <div style="margin-bottom:24px;">
              <div class="shimmer" style="width:250px; height:16px; border-radius:4px; margin-bottom:8px; background:var(--primary);"></div>
              <div class="shimmer" style="width:100%; max-width:600px; height:12px; border-radius:4px; margin-bottom:6px;"></div>
              <div class="shimmer" style="width:80%; max-width:480px; height:12px; border-radius:4px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 10. Rest Client / Request Queue
  if (nid.includes('rest') || nid.includes('request')) {
    return `
      <div style="width:100%; height:100%; background:#282c34; color:#abb2bf; font-family:monospace; display:flex;">
        <div style="flex:1; border-right:1px solid #181a1f; display:flex; flex-direction:column;">
          <div style="padding:16px; border-bottom:1px solid #181a1f; display:flex; gap:12px;">
            <div style="background:#98c379; color:#282c34; padding:4px 8px; border-radius:4px; font-weight:bold;">GET</div>
            <div style="flex:1; background:#1e2227; padding:4px 8px; border-radius:4px;">https://api.example.com/v1/data</div>
            <div style="background:#61afef; color:#282c34; padding:4px 16px; border-radius:4px; font-weight:bold;">SEND</div>
          </div>
          <div style="padding:16px; flex:1;">
            <div style="color:#e06c75; margin-bottom:8px;">Headers</div>
            <div>Authorization: Bearer token...</div>
            <div>Content-Type: application/json</div>
          </div>
        </div>
        <div style="flex:1; padding:16px; background:#21252b;">
          <div style="color:#98c379; margin-bottom:12px; font-weight:bold;">200 OK &nbsp;&nbsp;&nbsp; 124ms</div>
          <div style="color:#d19a66;">{</div>
          <div style="padding-left:16px;">
            <span style="color:#e06c75;">"status"</span>: <span style="color:#98c379;">"success"</span>,<br/>
            <span style="color:#e06c75;">"data"</span>: [<span style="color:#d19a66;">...</span>]
          </div>
          <div style="color:#d19a66;">}</div>
        </div>
      </div>
    `;
  }

  // 11. Mindmap
  if (nid.includes('mind')) {
    return `
      <div style="width:100%; height:100%; background:#fafafa; position:relative; display:flex; align-items:center; justify-content:center;">
        <svg style="position:absolute; width:100%; height:100%; pointer-events:none;">
          <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#cbd5e1" stroke-width="2" />
          <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="#cbd5e1" stroke-width="2" />
          <line x1="50%" y1="50%" x2="50%" y2="70%" stroke="#cbd5e1" stroke-width="2" />
        </svg>
        <div class="pop-in" style="position:absolute; background:#3b82f6; color:#fff; padding:12px 24px; border-radius:24px; font-weight:bold; box-shadow:0 4px 12px rgba(59,130,246,0.4); z-index:2;">Main Idea</div>
        <div class="pop-in" style="position:absolute; top:25%; left:20%; background:#fff; color:#334155; padding:8px 16px; border-radius:16px; border:2px solid #3b82f6; z-index:2; animation-delay:0.2s; opacity:0;">Concept A</div>
        <div class="pop-in" style="position:absolute; top:25%; right:20%; background:#fff; color:#334155; padding:8px 16px; border-radius:16px; border:2px solid #3b82f6; z-index:2; animation-delay:0.4s; opacity:0;">Concept B</div>
        <div class="pop-in" style="position:absolute; bottom:25%; background:#fff; color:#334155; padding:8px 16px; border-radius:16px; border:2px solid #3b82f6; z-index:2; animation-delay:0.6s; opacity:0;">Concept C</div>
      </div>
    `;
  }

  // 12. Pomodoro / Calendar
  if (nid.includes('pomodoro') || nid.includes('calendar') || nid.includes('scheduler')) {
    return `
      <div style="width:100%; height:100%; background:linear-gradient(135deg, #fb7185, #f43f5e); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff;">
        <div style="width:200px; height:200px; border-radius:50%; border:8px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; position:relative;">
          <svg style="position:absolute; top:-8px; left:-8px; width:216px; height:216px;">
            <circle cx="108" cy="108" r="100" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="628" stroke-dashoffset="150" stroke-linecap="round" style="transform:rotate(-90deg); transform-origin:center;"/>
          </svg>
          <div style="font-size:48px; font-weight:bold; font-variant-numeric:tabular-nums;">24:59</div>
        </div>
        <div style="margin-top:32px; font-size:18px; font-weight:500; letter-spacing:1px; background:rgba(255,255,255,0.2); padding:8px 24px; border-radius:24px;">FOCUS MODE</div>
      </div>
    `;
  }

  // 13. Drawing / Wireframe / Presentation
  if (nid.includes('draw') || nid.includes('wireframe') || nid.includes('presentation')) {
    return `
      <div style="width:100%; height:100%; background:#e2e8f0; padding:24px; display:flex; justify-content:center; align-items:center; position:relative;">
        <div style="position:absolute; left:20px; top:50%; transform:translateY(-50%); width:48px; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); display:flex; flex-direction:column; padding:8px; gap:12px;">
          <div style="width:32px; height:32px; background:#f1f5f9; border-radius:4px;"></div>
          <div style="width:32px; height:32px; background:#3b82f6; border-radius:4px;"></div>
          <div style="width:32px; height:32px; background:#f1f5f9; border-radius:4px;"></div>
        </div>
        <div style="width:80%; height:90%; background:#fff; box-shadow:0 10px 30px rgba(0,0,0,0.1); display:flex; flex-direction:column; padding:40px;">
          <div class="shimmer" style="width:60%; height:32px; background:#cbd5e1; margin-bottom:20px;"></div>
          <div style="display:flex; gap:20px; flex:1;">
            <div class="shimmer" style="flex:1; background:#e2e8f0;"></div>
            <div class="shimmer" style="flex:1; background:#e2e8f0;"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 14. Voice Dictation
  if (nid.includes('voice')) {
    return `
      <div style="width:100%; height:100%; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff;">
        <div class="pulse" style="width:80px; height:80px; background:linear-gradient(135deg, #8b5cf6, #d946ef); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 30px rgba(217,70,239,0.5); margin-bottom:40px;">
          ?é§
        </div>
        <div style="display:flex; align-items:center; gap:6px; height:40px;">
          ${[1,2,3,4,5,4,3,2,1].map((h, i) => `
            <div class="float-anim" style="width:6px; height:${h*20}%; background:#d946ef; border-radius:3px; animation-delay:${i*0.1}s;"></div>
          `).join('')}
        </div>
        <div style="margin-top:24px; color:#cbd5e1; font-size:16px;">"Hello, this is a voice dictation test..."</div>
      </div>
    `;
  }

  // Default / Generic
  return `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg, var(--bg-color), color-mix(in srgb, var(--primary) 20%, var(--bg-color))); text-align:center; padding:40px;">
      <div class="pulse" style="font-size:64px; margin-bottom:24px;">??/div>
      <h3 style="color:#fff; margin-bottom:12px; font-size:24px;">Interactive Module Ready</h3>
      <p style="color:var(--text-muted); max-width:400px; line-height:1.6;">This plugin offers seamless integration with the AMEVA Workstation. Try clicking around the mock UI.</p>
      <button style="margin-top:24px; background:var(--primary); color:#fff; border:none; padding:10px 24px; border-radius:8px; font-weight:bold; cursor:pointer;">Simulate Action</button>
    </div>
  `;
}

function generatePreviewHtml(id, name, type) {
  const iconUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random&color=fff&size=128&bold=true";
  const isPremium = type === 'premium';
  
  const mockContent = getMockContent(id);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${name} Preview</title>
  <link rel="stylesheet" href="${isPremium ? '../' : ''}preview-shared.css">
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <img src="${iconUrl}" class="preview-icon" alt="icon" />
      <div class="preview-title">
        <h2>${name} <span style="font-size:12px; padding:2px 8px; border-radius:12px; background:${isPremium ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)'}; color:${isPremium ? 'var(--premium)' : 'var(--primary)'}; vertical-align:middle; margin-left:12px;">${isPremium ? '?ëë Premium' : 'Standard'}</span></h2>
        <p>AMEVA Workspace Simulation Engine</p>
      </div>
    </div>
    <div class="preview-body">
      <div class="mock-window">
        <div class="mock-titlebar">
          <div class="mock-dot r"></div><div class="mock-dot y"></div><div class="mock-dot g"></div>
          <div class="mock-title-text">${name} - Interactive Preview</div>
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
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.tsx')) {
      const ext = path.extname(file);
      const id = file.replace(ext, '');
      const name = id.split(/[-_]+|(?=[A-Z])/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      const htmlContent = generatePreviewHtml(id, name, type);
      const targetPath = path.join(dir, id + '-preview.html');
      
      fs.writeFileSync(targetPath, htmlContent, 'utf8');
      console.log('Generated rich preview for ' + id + ' -> ' + targetPath);
    }
  });
}

// 1. Í≥µÏö© ?åÎü¨Í∑∏Ïù∏ Ï≤òÎ¶¨
processDirectory(PLUGINS_DIR, 'standard');

// 2. ?ÑÎ¶¨ÎØ∏ÏóÑ ?åÎü¨Í∑∏Ïù∏ Ï≤òÎ¶¨
processDirectory(PREMIUM_DIR, 'premium');

// 3. SaaS ?ÑÎ¶¨ÎØ∏ÏóÑ Í∏∞Îä• Ï≤òÎ¶¨ (DuckDuckGo, Python, Queue)
const saasItems = [
  { id: 'webSearch', name: 'DuckDuckGo Web Search API (Pro)' },
  { id: 'pythonConsole', name: 'Python Sandbox Executor (Pro)' },
  { id: 'requestQueue', name: 'Sequential Request Queue (Pro)' }
];

saasItems.forEach(item => {
  const htmlContent = generatePreviewHtml(item.id, item.name, 'premium');
  const targetPath = path.join(PREMIUM_DIR, item.id + '-preview.html');
  fs.writeFileSync(targetPath, htmlContent, 'utf8');
  console.log('Generated rich preview for ' + item.id + ' -> ' + targetPath);
});

console.log('All beautiful preview pages generated successfully!');
