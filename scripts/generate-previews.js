const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '../public/plugins');
const PREMIUM_DIR = path.join(__dirname, '../public/plugins/premium');

function getMockContent(id) {
  const nid = id.toLowerCase();

  // 1. Finance / Stock (FinanceDashboardView)
  if (nid.includes('finance')) {
    return `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; background:#0b0f19; overflow:hidden;">
        <div style="padding:16px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:baseline;">
            <div style="font-size:28px; font-weight:bold; color:#10b981;">$3,421.50</div>
            <div style="font-size:14px; color:#10b981; padding:2px 6px; background:rgba(16,185,129,0.1); border-radius:4px;">+2.4% Today</div>
          </div>
          <div style="display:flex; gap:8px;">
            <div style="padding:4px 12px; border-radius:4px; background:rgba(255,255,255,0.1); color:#fff; font-size:12px;">1D</div>
            <div style="padding:4px 12px; border-radius:4px; background:var(--primary); color:#fff; font-size:12px;">1W</div>
            <div style="padding:4px 12px; border-radius:4px; background:rgba(255,255,255,0.1); color:#fff; font-size:12px;">1M</div>
          </div>
        </div>
        <div style="flex:1; padding:20px; position:relative; display:flex; align-items:flex-end; gap:8px; justify-content:space-between;">
          <svg style="position:absolute; top:20px; left:0; width:100%; height:80%; opacity:0.3; pointer-events:none;">
            <path d="M0,200 L100,150 L200,180 L300,100 L400,120 L500,40 L600,60" fill="none" stroke="#10b981" stroke-width="3"/>
            <path d="M0,200 L100,150 L200,180 L300,100 L400,120 L500,40 L600,60 L600,300 L0,300 Z" fill="rgba(16,185,129,0.1)" stroke="none"/>
          </svg>
          <div class="shimmer" style="width:10%; height:40%; background:var(--success); border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:35%; background:#ef4444; border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:50%; background:var(--success); border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:45%; background:#ef4444; border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:70%; background:var(--success); border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:60%; background:#ef4444; border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:80%; background:var(--success); border-radius:4px 4px 0 0; z-index:2;"></div>
          <div class="shimmer" style="width:10%; height:90%; background:var(--success); border-radius:4px 4px 0 0; z-index:2;"></div>
        </div>
      </div>
    `;
  }

  // 2. Kanban Board
  if (nid.includes('kanban')) {
    return `
      <div style="width:100%; height:100%; display:flex; gap:16px; padding:16px; background:#f1f5f9; overflow-x:auto;">
        ${['To Do', 'In Progress', 'Done'].map((col, i) => `
          <div style="flex:1; min-width:260px; background:#e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:12px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-weight:bold; color:#334155; font-size:14px; text-transform:uppercase; display:flex; justify-content:space-between;">
              <span>${col}</span>
              <span style="background:#cbd5e1; color:#475569; padding:2px 8px; border-radius:12px; font-size:11px;">${i === 1 ? 2 : 1}</span>
            </div>
            <div class="pop-in" style="background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#0f172a; animation-delay:${i*0.2}s; border-left:4px solid ${i===0?'#ef4444':i===1?'#eab308':'#22c55e'}; cursor:grab;">
              <div style="font-weight:600; font-size:14px; margin-bottom:8px;">Design User Auth Flow</div>
              <div class="shimmer" style="width:100%; height:6px; border-radius:3px; margin-bottom:6px; background:#f1f5f9;"></div>
              <div class="shimmer" style="width:80%; height:6px; border-radius:3px; background:#f1f5f9;"></div>
              <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="width:24px; height:24px; background:#3b82f6; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px;">JD</div>
                <div style="font-size:11px; color:#94a3b8;">Today</div>
              </div>
            </div>
            ${i === 1 ? `
              <div class="pop-in" style="background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#0f172a; animation-delay:0.5s; border-left:4px solid #eab308; cursor:grab;">
                <div style="font-weight:600; font-size:14px; margin-bottom:8px;">Implement API endpoints</div>
                <div class="shimmer" style="width:90%; height:6px; border-radius:3px; margin-bottom:6px; background:#f1f5f9;"></div>
                <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="width:24px; height:24px; background:#ef4444; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px;">AK</div>
                  <div style="font-size:11px; color:#ef4444;">Overdue</div>
                </div>
              </div>
            ` : ''}
            <div style="margin-top:auto; padding:8px; border:2px dashed #cbd5e1; border-radius:6px; color:#64748b; text-align:center; font-size:12px; cursor:pointer;">
              + Add Task
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Database Explorer
  if (nid.includes('db') || nid.includes('database')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#1e1e1e; color:#d4d4d4; font-family:'Consolas', 'Courier New', monospace; font-size:13px;">
        <div style="width:220px; border-right:1px solid #333; display:flex; flex-direction:column;">
          <div style="padding:12px 16px; background:#252526; border-bottom:1px solid #333; font-weight:bold; color:#fff;">🗄️ Explorer</div>
          <div style="padding:12px 16px; overflow-y:auto; flex:1;">
            <div style="color:#569cd6; margin-bottom:8px; cursor:pointer;">▼ PostgreSQL (prod)</div>
            <div style="padding-left:16px; margin-bottom:4px; color:#cccccc;">▼ schemas</div>
            <div style="padding-left:32px; margin-bottom:4px; color:#cccccc;">▼ public</div>
            <div style="padding-left:48px; margin-bottom:4px; color:#ce9178; cursor:pointer; background:rgba(255,255,255,0.1); padding-top:2px; padding-bottom:2px;">📋 users</div>
            <div style="padding-left:64px; margin-bottom:2px; color:#9cdcfe; font-size:12px;">🔑 id (uuid)</div>
            <div style="padding-left:64px; margin-bottom:2px; color:#9cdcfe; font-size:12px;">email (varchar)</div>
            <div style="padding-left:48px; margin-bottom:4px; color:#ce9178; cursor:pointer;">📋 orders</div>
            <div style="padding-left:48px; margin-bottom:4px; color:#ce9178; cursor:pointer;">📋 products</div>
          </div>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
          <div style="height:40px; background:#1e1e1e; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 16px; gap:16px;">
            <div style="color:#fff; border-bottom:2px solid #007acc; padding:10px 0;">query.sql</div>
            <div style="color:#888;">users_data.csv</div>
            <button style="margin-left:auto; background:#0e639c; color:#fff; border:none; padding:4px 16px; border-radius:2px; cursor:pointer; font-weight:bold; display:flex; align-items:center; gap:6px;">▶ Run</button>
          </div>
          <div style="height:120px; border-bottom:2px solid #007acc; padding:16px; background:#1e1e1e;">
            <div style="display:flex; line-height:1.5;">
              <div style="color:#858585; padding-right:16px; text-align:right; user-select:none;">1<br>2<br>3</div>
              <div>
                <span style="color:#c586c0;">SELECT</span> id, email, status, created_at <span style="color:#c586c0;">FROM</span> <span style="color:#4ec9b0;">users</span><br/>
                <span style="color:#c586c0;">WHERE</span> status = <span style="color:#ce9178;">'active'</span><br/>
                <span style="color:#c586c0;">ORDER BY</span> created_at <span style="color:#c586c0;">DESC</span> <span style="color:#c586c0;">LIMIT</span> <span style="color:#b5cea8;">10</span>;
              </div>
            </div>
          </div>
          <div style="flex:1; background:#1e1e1e; overflow:auto;">
            <table style="width:100%; text-align:left; border-collapse:collapse; font-size:13px; white-space:nowrap;">
              <thead style="background:#252526; position:sticky; top:0; box-shadow:0 1px 0 #333;">
                <tr><th style="padding:8px 16px; border-right:1px solid #333;">id</th><th style="padding:8px 16px; border-right:1px solid #333;">email</th><th style="padding:8px 16px; border-right:1px solid #333;">status</th><th style="padding:8px 16px;">created_at</th></tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #333; background:rgba(255,255,255,0.02);"><td style="padding:8px 16px; color:#d4d4d4;">5f1b2...</td><td style="padding:8px 16px; color:#9cdcfe;">alice@example.com</td><td style="padding:8px 16px;"><span style="color:#4ec9b0; background:rgba(78,201,176,0.1); padding:2px 6px; border-radius:12px;">active</span></td><td style="padding:8px 16px; color:#b5cea8;">2023-10-24 14:00</td></tr>
                <tr style="border-bottom:1px solid #333;"><td style="padding:8px 16px; color:#d4d4d4;">8c4d9...</td><td style="padding:8px 16px; color:#9cdcfe;">bob@domain.com</td><td style="padding:8px 16px;"><span style="color:#4ec9b0; background:rgba(78,201,176,0.1); padding:2px 6px; border-radius:12px;">active</span></td><td style="padding:8px 16px; color:#b5cea8;">2023-10-24 13:45</td></tr>
                <tr style="border-bottom:1px solid #333; background:rgba(255,255,255,0.02);"><td style="padding:8px 16px; color:#d4d4d4;">2a7f1...</td><td style="padding:8px 16px; color:#9cdcfe;">charlie@company.com</td><td style="padding:8px 16px;"><span style="color:#4ec9b0; background:rgba(78,201,176,0.1); padding:2px 6px; border-radius:12px;">active</span></td><td style="padding:8px 16px; color:#b5cea8;">2023-10-24 11:20</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // 4. PDF RAG / AI Chat
  if (nid.includes('rag') || nid.includes('pdf')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="flex:1; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; padding:24px; align-items:center; overflow-y:auto; background:#cbd5e1;">
          <div style="width:100%; max-width:400px; background:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.1); padding:40px; display:flex; flex-direction:column; align-items:center; border:1px solid #e2e8f0;">
             <div style="width:60px; height:80px; background:#ef4444; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; margin-bottom:24px; position:relative;">
               PDF
               <div style="position:absolute; top:0; right:0; border-width:0 15px 15px 0; border-style:solid; border-color:#cbd5e1 #cbd5e1 #b91c1c #b91c1c;"></div>
             </div>
             <h2 style="font-size:18px; margin-bottom:24px; color:#334155; text-align:center;">Q3 Financial Report.pdf</h2>
             <div style="width:100%; height:12px; background:#f1f5f9; margin-bottom:12px; border-radius:2px;"></div>
             <div style="width:100%; height:12px; background:#f1f5f9; margin-bottom:12px; border-radius:2px;"></div>
             <div style="width:80%; height:12px; background:#f1f5f9; margin-bottom:12px; border-radius:2px; align-self:flex-start;"></div>
             <div style="width:100%; height:12px; background:#f1f5f9; margin-bottom:12px; border-radius:2px; margin-top:24px;"></div>
             <div style="width:90%; height:12px; background:#f1f5f9; margin-bottom:12px; border-radius:2px; align-self:flex-start;"></div>
          </div>
        </div>
        <div style="width:380px; background:#fff; display:flex; flex-direction:column;">
          <div style="padding:16px 20px; border-bottom:1px solid #e2e8f0; background:#f8fafc; font-weight:bold; color:#0f172a; display:flex; align-items:center; gap:12px;">
            <div style="width:32px; height:32px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff;">✨</div>
            Document AI
          </div>
          <div style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
            <div class="slide-in-right" style="align-self:flex-end; background:#3b82f6; color:#fff; padding:12px 16px; border-radius:16px 16px 0 16px; font-size:14px; max-width:85%; box-shadow:0 2px 4px rgba(59,130,246,0.2);">
              이 문서에서 3분기 총 매출액과 순이익을 요약해줘.
            </div>
            <div class="slide-in-right" style="align-self:flex-start; background:#f1f5f9; color:#334155; padding:12px 16px; border-radius:16px 16px 16px 0; font-size:14px; max-width:85%; animation-delay:0.5s; opacity:0; animation-fill-mode:forwards; box-shadow:0 2px 4px rgba(0,0,0,0.05); line-height:1.5;">
              문서 분석 결과, 3분기 총 매출액은 <strong>$45.2M</strong> 이며, 순이익은 <strong>$12.4M</strong> (전년 동기 대비 15% 상승)으로 나타납니다.
              <div style="margin-top:8px; display:inline-block; padding:2px 8px; background:#e2e8f0; border-radius:4px; font-size:11px; color:#64748b; font-family:monospace; cursor:pointer;">📄 Page 4 참조</div>
            </div>
            <div class="pulse" style="align-self:flex-start; font-size:24px; color:#3b82f6; animation-delay:1s;">...</div>
          </div>
          <div style="padding:16px; border-top:1px solid #e2e8f0;">
            <div style="background:#f1f5f9; border-radius:24px; padding:12px 20px; display:flex; align-items:center; border:1px solid #cbd5e1;">
              <div style="flex:1; color:#94a3b8; font-size:14px;">Ask anything about this document...</div>
              <div style="width:28px; height:28px; background:#3b82f6; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer;">↑</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Drawing Board / Wireframe
  if (nid.includes('draw') || nid.includes('wireframe')) {
    const isWireframe = nid.includes('wireframe');
    return `
      <div style="width:100%; height:100%; background:#f8fafc; display:flex; font-family:sans-serif; position:relative; overflow:hidden;">
        <!-- Left Toolbar -->
        <div style="width:60px; background:#fff; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:16px; z-index:10; box-shadow:2px 0 10px rgba(0,0,0,0.02);">
          <div style="width:36px; height:36px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px;">🖱️</div>
          <div style="width:36px; height:36px; border-radius:8px; background:#e0e7ff; color:#4f46e5; border:1px solid #c7d2fe; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px;">${isWireframe ? '🔲' : '✏️'}</div>
          <div style="width:36px; height:36px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px;">${isWireframe ? '📝' : '🧽'}</div>
          <div style="width:36px; height:36px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px;">${isWireframe ? '🖼️' : '🎨'}</div>
        </div>
        
        <!-- Canvas -->
        <div style="flex:1; position:relative; background-image:radial-gradient(#cbd5e1 1px, transparent 1px); background-size:20px 20px;">
          ${isWireframe ? `
            <div class="pop-in" style="position:absolute; top:20%; left:20%; width:400px; height:300px; background:#fff; border:2px solid #3b82f6; border-radius:12px; box-shadow:0 20px 40px rgba(0,0,0,0.1); padding:24px;">
              <div style="width:100%; height:40px; background:#f1f5f9; border-radius:6px; margin-bottom:20px; display:flex; align-items:center; padding:0 12px; font-weight:bold; color:#64748b;">Header Navigation</div>
              <div style="display:flex; gap:20px;">
                <div style="flex:1; height:150px; background:#e2e8f0; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:24px;">Image</div>
                <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                  <div style="width:100%; height:16px; background:#cbd5e1; border-radius:4px;"></div>
                  <div style="width:80%; height:16px; background:#cbd5e1; border-radius:4px;"></div>
                  <div style="width:100%; height:16px; background:#cbd5e1; border-radius:4px;"></div>
                  <div style="width:120px; height:40px; background:#3b82f6; border-radius:6px; margin-top:auto;"></div>
                </div>
              </div>
              <!-- Selection Box handles -->
              <div style="position:absolute; top:-5px; left:-5px; width:10px; height:10px; background:#fff; border:2px solid #3b82f6;"></div>
              <div style="position:absolute; top:-5px; right:-5px; width:10px; height:10px; background:#fff; border:2px solid #3b82f6;"></div>
              <div style="position:absolute; bottom:-5px; left:-5px; width:10px; height:10px; background:#fff; border:2px solid #3b82f6;"></div>
              <div style="position:absolute; bottom:-5px; right:-5px; width:10px; height:10px; background:#fff; border:2px solid #3b82f6;"></div>
            </div>
          ` : `
            <svg style="position:absolute; top:0; left:0; width:100%; height:100%;">
              <path class="float-anim" d="M100,100 C150,50 200,200 300,150 S400,300 500,100" fill="none" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
              <path class="pop-in" d="M150,250 C250,300 350,200 450,280" fill="none" stroke="#ec4899" stroke-width="8" stroke-linecap="round" style="animation-delay:0.5s;"/>
              <circle cx="500" cy="100" r="10" fill="#4f46e5" class="pulse"/>
            </svg>
          `}
        </div>

        <!-- Right Properties Panel (Wireframe only) -->
        ${isWireframe ? `
          <div style="width:240px; background:#fff; border-left:1px solid #e2e8f0; display:flex; flex-direction:column; padding:16px; font-size:13px; color:#334155;">
            <div style="font-weight:bold; margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid #e2e8f0;">Design Properties</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><span>W</span><span style="background:#f1f5f9; padding:2px 8px; border-radius:4px; border:1px solid #cbd5e1;">400</span></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><span>H</span><span style="background:#f1f5f9; padding:2px 8px; border-radius:4px; border:1px solid #cbd5e1;">300</span></div>
            <div style="margin-top:16px; font-weight:bold; margin-bottom:8px;">Fill</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:24px; height:24px; background:#fff; border:1px solid #cbd5e1; border-radius:4px;"></div>
              <span style="font-family:monospace;">FFFFFF</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 6. Presentation
  if (nid.includes('presentation')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#0f172a;">
        <div style="width:200px; background:#1e293b; border-right:1px solid #334155; padding:16px; display:flex; flex-direction:column; gap:16px; overflow-y:auto;">
          <div style="width:100%; height:100px; background:#fff; border-radius:4px; border:2px solid #3b82f6; padding:8px; position:relative;">
            <div style="font-size:8px; font-weight:bold; color:#000;">1. Overview</div>
            <div style="position:absolute; top:4px; left:-24px; color:#fff; font-size:12px;">1</div>
          </div>
          <div style="width:100%; height:100px; background:#fff; border-radius:4px; border:2px solid transparent; padding:8px; position:relative; opacity:0.6;">
            <div style="font-size:8px; font-weight:bold; color:#000;">2. Architecture</div>
            <div style="position:absolute; top:4px; left:-24px; color:#fff; font-size:12px;">2</div>
          </div>
          <div style="width:100%; height:100px; background:#fff; border-radius:4px; border:2px solid transparent; padding:8px; position:relative; opacity:0.6;">
            <div style="font-size:8px; font-weight:bold; color:#000;">3. Results</div>
            <div style="position:absolute; top:4px; left:-24px; color:#fff; font-size:12px;">3</div>
          </div>
        </div>
        <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:40px; position:relative;">
          <div class="pop-in" style="width:100%; max-width:800px; aspect-ratio:16/9; background:#fff; border-radius:12px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px; text-align:center;">
            <h1 style="font-size:48px; color:#0f172a; margin-bottom:24px; font-family:'Segoe UI', system-ui, sans-serif;">AMEVA Platform Overview</h1>
            <div style="width:60px; height:6px; background:#3b82f6; margin-bottom:32px;"></div>
            <p style="font-size:24px; color:#64748b; line-height:1.6; max-width:600px;">
              The next-generation workspace simulation engine powering AI-driven desktop applications.
            </p>
          </div>
          <div style="position:absolute; bottom:20px; display:flex; gap:16px;">
            <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.1); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer;">◀</div>
            <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.2); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer;">▶</div>
          </div>
        </div>
      </div>
    `;
  }

  // 7. Mind Map
  if (nid.includes('mind')) {
    return `
      <div style="width:100%; height:100%; background:#f8fafc; position:relative; overflow:hidden; font-family:sans-serif;">
        <svg style="position:absolute; width:100%; height:100%; pointer-events:none;">
          <!-- Using Bezier curves for a realistic mind map look -->
          <path d="M50%,50% C40%,30% 30%,30% 25%,25%" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          <path d="M50%,50% C60%,25% 70%,25% 75%,25%" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          <path d="M50%,50% C45%,75% 35%,75% 30%,80%" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          <path d="M50%,50% C60%,70% 70%,70% 75%,75%" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        </svg>
        
        <!-- Central Node -->
        <div class="pulse" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:linear-gradient(135deg, #3b82f6, #2563eb); color:#fff; padding:16px 32px; border-radius:30px; font-weight:bold; font-size:18px; box-shadow:0 10px 25px rgba(59,130,246,0.5); z-index:10; border:4px solid #fff;">
          Project Alpha
        </div>
        
        <!-- Child Nodes -->
        <div class="pop-in" style="position:absolute; top:25%; left:25%; transform:translate(-50%, -50%); background:#fff; color:#1e293b; padding:10px 20px; border-radius:20px; font-weight:600; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border:2px solid #e2e8f0; z-index:10; animation-delay:0.2s; opacity:0; animation-fill-mode:forwards;">
          Marketing
        </div>
        <div class="pop-in" style="position:absolute; top:25%; left:75%; transform:translate(-50%, -50%); background:#fff; color:#1e293b; padding:10px 20px; border-radius:20px; font-weight:600; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border:2px solid #e2e8f0; z-index:10; animation-delay:0.4s; opacity:0; animation-fill-mode:forwards;">
          Development
        </div>
        <div class="pop-in" style="position:absolute; top:80%; left:30%; transform:translate(-50%, -50%); background:#fff; color:#1e293b; padding:10px 20px; border-radius:20px; font-weight:600; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border:2px solid #e2e8f0; z-index:10; animation-delay:0.6s; opacity:0; animation-fill-mode:forwards;">
          Design UX/UI
        </div>
        <div class="pop-in" style="position:absolute; top:75%; left:75%; transform:translate(-50%, -50%); background:#fff; color:#1e293b; padding:10px 20px; border-radius:20px; font-weight:600; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border:2px solid #e2e8f0; z-index:10; animation-delay:0.8s; opacity:0; animation-fill-mode:forwards;">
          Launch Strategy
        </div>
      </div>
    `;
  }

  // 8. Cloud Collaboration
  if (nid.includes('collab')) {
    return `
      <div style="width:100%; height:100%; background:#f1f5f9; display:flex; justify-content:center; padding:40px; position:relative;">
        <!-- Online Users -->
        <div style="position:absolute; top:20px; right:20px; display:flex; gap:8px;">
          <div style="width:36px; height:36px; border-radius:50%; background:#ef4444; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.1);">AL</div>
          <div style="width:36px; height:36px; border-radius:50%; background:#3b82f6; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-left:-16px;">BO</div>
          <div style="width:36px; height:36px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-left:-16px;">CH</div>
        </div>
        
        <div style="width:80%; max-width:700px; background:#fff; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); padding:60px 40px; position:relative; overflow:hidden;">
          <h1 style="color:#0f172a; font-size:32px; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-bottom:24px;">Marketing Strategy 2024</h1>
          <p style="color:#334155; font-size:16px; line-height:1.8;">
            Our primary goal for the next quarter is to expand our reach in the European market. 
            <span style="position:relative;">
              <span style="background:rgba(239,68,68,0.2); padding:2px;">We will focus on targeted advertising</span>
              <div class="float-anim" style="position:absolute; top:-28px; left:0; background:#ef4444; color:#fff; font-size:11px; padding:4px 8px; border-radius:4px; font-weight:bold; white-space:nowrap; box-shadow:0 4px 6px rgba(239,68,68,0.3);">Alice (Editing)</div>
              <div style="position:absolute; top:0; left:0; width:2px; height:100%; background:#ef4444;"></div>
            </span>
            and local partnerships.
          </p>
          <br>
          <p style="color:#334155; font-size:16px; line-height:1.8;">
            Budget allocation has been approved by the board.
          </p>
          <div style="position:relative; margin-top:20px; display:inline-block;">
            <span style="color:#cbd5e1;">Next steps: </span>
            <div style="position:absolute; top:0; right:-2px; width:2px; height:24px; background:#3b82f6; animation:pulse 1s infinite;"></div>
            <div class="float-anim" style="position:absolute; top:28px; right:-20px; background:#3b82f6; color:#fff; font-size:11px; padding:4px 8px; border-radius:4px; font-weight:bold; animation-delay:1s; box-shadow:0 4px 6px rgba(59,130,246,0.3); z-index:10;">Bob</div>
          </div>
        </div>
      </div>
    `;
  }

  // 9. Voice Dictation
  if (nid.includes('voice')) {
    return `
      <div style="width:100%; height:100%; background:linear-gradient(135deg, #0f172a, #1e1b4b); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:sans-serif; position:relative;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:300px; height:300px; border-radius:50%; background:radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%); animation:pulse 2s infinite;"></div>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%); animation:pulse 2s infinite; animation-delay:0.5s;"></div>
        
        <div style="width:100px; height:100px; background:linear-gradient(135deg, #8b5cf6, #d946ef); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 40px rgba(217,70,239,0.6); margin-bottom:60px; z-index:10; font-size:40px;">
          🎙️
        </div>
        
        <div style="display:flex; align-items:center; gap:8px; height:60px; z-index:10;">
          ${[3,5,8,4,9,6,10,5,7,4,3].map((h, i) => `
            <div class="float-anim" style="width:6px; height:${h*10}%; background:linear-gradient(to top, #8b5cf6, #d946ef); border-radius:3px; animation-delay:${i*0.1}s; animation-duration:0.8s;"></div>
          `).join('')}
        </div>
        
        <div style="margin-top:40px; color:#e2e8f0; font-size:24px; font-weight:300; letter-spacing:1px; z-index:10; text-align:center;">
          "Listening to your voice..."<br>
          <span style="font-size:14px; color:#94a3b8; font-weight:bold; letter-spacing:2px; margin-top:16px; display:inline-block;">PROCESSING LIVE AUDIO</span>
        </div>
      </div>
    `;
  }

  // 10. Pomodoro / Calendar / Scheduler
  if (nid.includes('pomodoro') || nid.includes('calendar') || nid.includes('scheduler')) {
    const isCalendar = nid.includes('calendar') || nid.includes('scheduler');
    if (isCalendar) {
      return `
        <div style="width:100%; height:100%; background:#fff; display:flex; font-family:sans-serif;">
          <div style="width:200px; border-right:1px solid #e2e8f0; background:#f8fafc; padding:20px;">
            <div style="font-size:20px; font-weight:bold; margin-bottom:24px; color:#0f172a;">October 2024</div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; border-radius:50%; background:#ef4444;"></div>Work</div>
              <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; border-radius:50%; background:#3b82f6;"></div>Personal</div>
              <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; border-radius:50%; background:#10b981;"></div>Family</div>
            </div>
          </div>
          <div style="flex:1; padding:20px; overflow:hidden;">
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:1px; background:#e2e8f0; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; height:100%;">
              ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div style="background:#f8fafc; padding:8px; font-weight:bold; text-align:center; font-size:12px; color:#64748b;">${d}</div>`).join('')}
              ${Array(28).fill(0).map((_, i) => {
                let event = '';
                if (i === 12) event = '<div class="pop-in" style="background:#ef4444; color:#fff; font-size:10px; padding:2px 4px; border-radius:4px; margin-top:4px; margin-bottom:2px; cursor:pointer; box-shadow:0 2px 4px rgba(239,68,68,0.3);">Project Due</div>';
                if (i === 18) event = '<div class="pop-in" style="background:#3b82f6; color:#fff; font-size:10px; padding:2px 4px; border-radius:4px; margin-top:4px; cursor:pointer; animation-delay:0.2s;">Dentist</div>';
                if (i === 24) event = '<div class="pop-in" style="background:#10b981; color:#fff; font-size:10px; padding:2px 4px; border-radius:4px; margin-top:4px; cursor:pointer; animation-delay:0.4s;">Dinner</div>';
                
                return `<div style="background:#fff; min-height:80px; padding:8px; font-size:14px; color:#334155; font-weight:${i===14?'bold':'normal'}; ${i===14?'color:#3b82f6;':''}">${i+1}${event}</div>`;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
    // Pomodoro
    return `
      <div style="width:100%; height:100%; background:linear-gradient(135deg, #1e1b4b, #312e81); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:-apple-system, sans-serif;">
        <div style="width:280px; height:280px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; background:rgba(0,0,0,0.2); box-shadow:inset 0 10px 20px rgba(0,0,0,0.5), 0 0 50px rgba(236,72,153,0.2);">
          <svg style="position:absolute; top:0; left:0; width:100%; height:100%; transform:rotate(-90deg);">
            <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
            <circle cx="140" cy="140" r="130" fill="none" stroke="url(#gradient)" stroke-width="8" stroke-dasharray="816" stroke-dashoffset="200" stroke-linecap="round" style="transition:all 1s linear; filter:drop-shadow(0 0 8px rgba(236,72,153,0.8));"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ec4899" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:64px; font-weight:800; font-variant-numeric:tabular-nums; letter-spacing:-2px; background:linear-gradient(to right, #fff, #f8fafc); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">24:59</div>
            <div style="font-size:14px; font-weight:bold; letter-spacing:4px; color:#ec4899; margin-top:8px;">FOCUS</div>
          </div>
        </div>
        <div style="display:flex; gap:24px; margin-top:40px;">
          <div style="width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:24px; cursor:pointer; transition:0.2s;">⏸️</div>
          <div style="width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:24px; cursor:pointer; transition:0.2s;">⏹️</div>
        </div>
      </div>
    `;
  }

  // 11. Calculator
  if (nid.includes('calc')) {
    return `
      <div style="width:100%; height:100%; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); display:flex; align-items:center; justify-content:center; font-family:-apple-system, sans-serif;">
        <div style="width:320px; background:rgba(255,255,255,0.7); backdrop-filter:blur(20px); border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5); padding:24px; border:1px solid rgba(255,255,255,0.5); display:flex; flex-direction:column; gap:16px;">
          <div style="width:100%; height:80px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-end; padding:0 8px; margin-bottom:8px;">
            <div style="font-size:16px; color:#64748b; margin-bottom:4px;">1,024 × 2</div>
            <div style="font-size:48px; font-weight:300; color:#0f172a; letter-spacing:-1px;">2,048</div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;">
            ${['AC','±','%','÷', '7','8','9','×', '4','5','6','-', '1','2','3','+', '0','.','='].map(btn => {
              let bg = 'rgba(255,255,255,0.5)';
              let color = '#334155';
              let span = 1;
              if (['÷','×','-','+','='].includes(btn)) { bg = '#f97316'; color = '#fff'; }
              if (['AC','±','%'].includes(btn)) { bg = 'rgba(148,163,184,0.3)'; color = '#0f172a'; }
              if (btn === '0') span = 2;
              return `<div class="pop-in" style="grid-column:span ${span}; background:${bg}; color:${color}; height:56px; border-radius:${span===2?'28px':'50%'}; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:400; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.05); transition:transform 0.1s;">${btn}</div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 12. Rest Client / Request Queue
  if (nid.includes('rest') || nid.includes('request')) {
    return `
      <div style="width:100%; height:100%; background:#282c34; color:#abb2bf; font-family:'Fira Code', Consolas, monospace; display:flex; flex-direction:column;">
        <div style="padding:16px; border-bottom:1px solid #181a1f; display:flex; gap:12px; background:#21252b; align-items:center;">
          <select style="background:#98c379; color:#282c34; border:none; padding:8px 12px; border-radius:4px; font-weight:bold; font-size:14px; outline:none; appearance:none;">
            <option>POST</option>
          </select>
          <div style="flex:1; background:#1e2227; padding:8px 16px; border-radius:4px; border:1px solid #181a1f; font-size:14px;">https://api.ameva.io/v1/workspaces/sync</div>
          <button class="pulse" style="background:#61afef; color:#282c34; border:none; padding:8px 24px; border-radius:4px; font-weight:bold; font-size:14px; cursor:pointer;">Send 🚀</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden;">
          <div style="flex:1; border-right:1px solid #181a1f; display:flex; flex-direction:column;">
            <div style="display:flex; border-bottom:1px solid #181a1f;">
              <div style="padding:12px 20px; color:#fff; border-bottom:2px solid #e5c07b;">Body</div>
              <div style="padding:12px 20px; color:#5c6370;">Headers (2)</div>
              <div style="padding:12px 20px; color:#5c6370;">Auth</div>
            </div>
            <div style="padding:16px; flex:1; background:#282c34; overflow:auto; line-height:1.6;">
              <span style="color:#d19a66;">{</span><br/>
              &nbsp;&nbsp;<span style="color:#e06c75;">"workspace_id"</span>: <span style="color:#98c379;">"ws-7a9b2"</span>,<br/>
              &nbsp;&nbsp;<span style="color:#e06c75;">"action"</span>: <span style="color:#98c379;">"force_sync"</span><br/>
              <span style="color:#d19a66;">}</span>
            </div>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; background:#21252b;">
            <div style="padding:12px 20px; border-bottom:1px solid #181a1f; display:flex; justify-content:space-between; align-items:center;">
              <span style="color:#fff;">Response</span>
              <div style="display:flex; gap:16px; font-size:12px;">
                <span style="color:#98c379; font-weight:bold;">Status: 200 OK</span>
                <span style="color:#61afef;">Time: 124ms</span>
                <span style="color:#e5c07b;">Size: 1.2KB</span>
              </div>
            </div>
            <div style="padding:16px; flex:1; overflow:auto; line-height:1.6;">
              <span style="color:#d19a66;">{</span><br/>
              &nbsp;&nbsp;<span style="color:#e06c75;">"success"</span>: <span style="color:#d19a66;">true</span>,<br/>
              &nbsp;&nbsp;<span style="color:#e06c75;">"timestamp"</span>: <span style="color:#98c379;">"2026-07-14T23:45:00Z"</span>,<br/>
              &nbsp;&nbsp;<span style="color:#e06c75;">"synced_files"</span>: <span style="color:#d19a66;">42</span><br/>
              <span style="color:#d19a66;">}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 13. Minimap
  if (nid.includes('minimap')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#1e1e1e; color:#d4d4d4; font-family:'Consolas', monospace;">
        <div style="flex:1; padding:24px; font-size:14px; line-height:1.6; overflow:hidden;">
          <div style="color:#c586c0;">import</div> <div style="color:#4ec9b0; display:inline;">React</div> <div style="color:#c586c0; display:inline;">from</div> <div style="color:#ce9178; display:inline;">'react'</div>;<br/>
          <br/>
          <div style="color:#569cd6; display:inline;">export function</div> <div style="color:#dcdcaa; display:inline;">MarketplaceModal</div>() {<br/>
          &nbsp;&nbsp;<div style="color:#569cd6; display:inline;">const</div> [isOpen, setIsOpen] = <div style="color:#dcdcaa; display:inline;">useState</div>(<div style="color:#569cd6; display:inline;">false</div>);<br/>
          <br/>
          &nbsp;&nbsp;<div style="color:#6a9955;">// Render the modal UI</div><br/>
          &nbsp;&nbsp;<div style="color:#c586c0; display:inline;">return</div> (<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&lt;<div style="color:#569cd6; display:inline;">div</div> <div style="color:#9cdcfe; display:inline;">className</div>=<div style="color:#ce9178; display:inline;">"modal-backdrop"</div>&gt;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<div style="color:#569cd6; display:inline;">h1</div>&gt;Plugins&lt;/<div style="color:#569cd6; display:inline;">h1</div>&gt;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<div style="color:#569cd6; display:inline;">div</div>&gt;<br/>
          &nbsp;&nbsp;);<br/>
          }<br/>
          ${Array(10).fill('<div class="shimmer" style="width:60%; height:8px; margin:12px 0; border-radius:2px; background:rgba(255,255,255,0.05);"></div>').join('')}
        </div>
        <div style="width:100px; background:#1e1e1e; border-left:1px solid #333; position:relative; overflow:hidden; padding:4px 8px;">
          <!-- Viewport highlight -->
          <div class="float-anim" style="position:absolute; top:20px; left:0; width:100%; height:60px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); z-index:2; cursor:pointer;"></div>
          <!-- Code blocks representation -->
          <div style="width:40%; height:2px; background:#c586c0; margin:4px 0;"></div>
          <div style="width:80%; height:2px; background:#569cd6; margin:8px 0;"></div>
          <div style="width:60%; height:2px; background:#dcdcaa; margin:4px 0 4px 10px;"></div>
          <div style="width:50%; height:2px; background:#6a9955; margin:8px 0 4px 10px;"></div>
          <div style="width:30%; height:2px; background:#c586c0; margin:4px 0 4px 10px;"></div>
          <div style="width:70%; height:2px; background:#ce9178; margin:4px 0 4px 20px;"></div>
          <div style="width:40%; height:2px; background:#569cd6; margin:4px 0 4px 20px;"></div>
          <div style="width:30%; height:2px; background:#569cd6; margin:4px 0 8px 10px;"></div>
          <div style="width:10%; height:2px; background:#d4d4d4; margin:4px 0;"></div>
          ${Array(15).fill('<div style="width:'+(Math.random()*60+20)+'%; height:2px; margin:4px 0; background:rgba(255,255,255,0.2);"></div>').join('')}
        </div>
      </div>
    `;
  }

  // 14. Python Console
  if (nid.includes('python') || nid.includes('console')) {
    return `
      <div style="width:100%; height:100%; background:#000; color:#00ff00; font-family:'Courier New', Courier, monospace; padding:20px; overflow:hidden; font-size:15px; text-shadow:0 0 5px rgba(0,255,0,0.5);">
        <div style="color:#888; margin-bottom:16px;">Python 3.10.12 (main, Jun 11 2023, 05:26:28) [GCC 11.4.0] on linux<br>Type "help", "copyright", "credits" or "license" for more information.</div>
        <div><span style="color:#fff;">&gt;&gt;&gt;</span> import numpy as np</div>
        <div><span style="color:#fff;">&gt;&gt;&gt;</span> import matplotlib.pyplot as plt</div>
        <div><span style="color:#fff;">&gt;&gt;&gt;</span> x = np.linspace(0, 2*np.pi, 100)</div>
        <div><span style="color:#fff;">&gt;&gt;&gt;</span> y = np.sin(x)</div>
        <div><span style="color:#fff;">&gt;&gt;&gt;</span> print(f"Max value: {y.max():.2f}")</div>
        <div style="color:#00ff00; margin-top:4px;">Max value: 1.00</div>
        <div style="margin-top:8px; display:flex; align-items:center;">
          <span style="color:#fff;">&gt;&gt;&gt;&nbsp;</span>
          <span class="pulse" style="width:10px; height:18px; background:#00ff00; display:inline-block;"></span>
        </div>
        <!-- ASCII art chart floating -->
        <div class="pop-in" style="position:absolute; bottom:30px; right:30px; border:1px solid #00ff00; padding:10px; background:rgba(0,0,0,0.8); color:#00ff00; animation-delay:1s; white-space:pre;">
   1.0 |    *** 
       |  *     *
   0.0 | *       *
       |*---------*-----
  -1.0 |           *   *
       |             ***
        </div>
      </div>
    `;
  }

  // 15. Web Browser / Web Search / Naver / Google / DuckDuckGo
  if (nid.includes('browser') || nid.includes('search') || nid.includes('google') || nid.includes('naver') || nid.includes('duck')) {
    let logoColor = '#4285f4';
    let engine = 'Google';
    if (nid.includes('naver')) { logoColor = '#03c75a'; engine = 'NAVER'; }
    if (nid.includes('duck') || nid.includes('search')) { logoColor = '#de5833'; engine = 'DuckDuckGo'; }

    return `
      <div style="width:100%; height:100%; background:#fff; display:flex; flex-direction:column; font-family:sans-serif;">
        <!-- Browser Chrome -->
        <div style="height:48px; background:#f1f5f9; display:flex; align-items:center; padding:0 16px; gap:16px; border-bottom:1px solid #cbd5e1;">
          <div style="display:flex; gap:8px;">
            <div style="width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:bold; cursor:pointer;">←</div>
            <div style="width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-weight:bold;">→</div>
            <div style="width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:bold; cursor:pointer;">↻</div>
          </div>
          <div style="flex:1; max-width:600px; background:#fff; height:32px; border-radius:16px; border:1px solid #cbd5e1; display:flex; align-items:center; padding:0 16px; color:#334155; font-size:14px; gap:8px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.05);">
            <span style="color:#94a3b8;">🔒</span> https://search.example.com/?q=AI+Agents
          </div>
        </div>
        
        <!-- Search Page Content -->
        <div style="flex:1; padding:32px 10%; background:#fff; overflow-y:auto; display:flex; flex-direction:column;">
          <div style="display:flex; align-items:center; gap:24px; margin-bottom:32px; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
            <div style="font-size:32px; font-weight:900; color:${logoColor}; letter-spacing:-1px;">${engine}</div>
            <div style="flex:1; max-width:500px; height:44px; background:#fff; border-radius:22px; border:1px solid #dfe1e5; display:flex; align-items:center; padding:0 20px; box-shadow:0 1px 6px rgba(32,33,36,.28);">
              <span style="flex:1; font-size:16px; color:#000;">AI Agents</span>
              <span style="color:#4285f4; font-size:20px;">🔍</span>
            </div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:32px;">
            ${[1, 2, 3].map(i => `
              <div class="pop-in" style="animation-delay:${i*0.1}s;">
                <div style="font-size:14px; color:#202124; margin-bottom:4px;">https://example${i}.com &gt; ai &gt; agents</div>
                <div style="font-size:20px; color:#1a0dab; text-decoration:underline; margin-bottom:8px; cursor:pointer;">Understanding Autonomous AI Agents in 2024</div>
                <div style="font-size:14px; color:#4d5156; line-height:1.58; max-width:680px;">
                  An autonomous agent is an AI program that can make decisions and take actions to achieve a specific goal without continuous human intervention...
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 16. Google Drive / Files
  if (nid.includes('drive')) {
    return `
      <div style="width:100%; height:100%; background:#fff; display:flex; font-family:sans-serif;">
        <!-- Sidebar -->
        <div style="width:220px; border-right:1px solid #e2e8f0; padding:16px; display:flex; flex-direction:column; gap:20px;">
          <button style="background:#fff; border:1px solid #cbd5e1; border-radius:24px; padding:12px 24px; display:flex; align-items:center; gap:12px; font-weight:bold; color:#334155; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size:20px; color:#ea4335;">+</span> New
          </button>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="padding:10px 16px; background:#e8f0fe; color:#1a73e8; border-radius:0 20px 20px 0; font-weight:600; cursor:pointer; margin-left:-16px;">▶ My Drive</div>
            <div style="padding:10px 16px; color:#3c4043; cursor:pointer;">Shared with me</div>
            <div style="padding:10px 16px; color:#3c4043; cursor:pointer;">Recent</div>
            <div style="padding:10px 16px; color:#3c4043; cursor:pointer;">Starred</div>
          </div>
        </div>
        <!-- Main Content -->
        <div style="flex:1; display:flex; flex-direction:column; background:#fff;">
          <div style="height:64px; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; padding:0 24px; justify-content:space-between;">
            <h2 style="font-size:18px; color:#1f2937; font-weight:400;">My Drive</h2>
            <div style="width:240px; height:40px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; padding:0 16px; color:#64748b;">🔍 Search in Drive</div>
          </div>
          <div style="flex:1; padding:24px; display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); grid-auto-rows:max-content; gap:20px; overflow-y:auto;">
            ${[
              {name:'Project Alpha.pdf', color:'#ea4335', icon:'📄'},
              {name:'Q3 Financials.xlsx', color:'#10b981', icon:'📊'},
              {name:'Design Assets', color:'#64748b', icon:'📁'},
              {name:'Team Meeting.docx', color:'#4285f4', icon:'📝'},
              {name:'Architecture.drawio', color:'#ea4335', icon:'🎨'},
              {name:'Client List.csv', color:'#10b981', icon:'📊'}
            ].map((f, i) => `
              <div class="pop-in" style="border:1px solid #dadce0; border-radius:8px; display:flex; flex-direction:column; overflow:hidden; cursor:pointer; animation-delay:${i*0.05}s; transition:box-shadow 0.2s;">
                <div style="height:120px; background:#f8fafc; display:flex; align-items:center; justify-content:center; font-size:48px; border-bottom:1px solid #dadce0;">
                  ${f.icon}
                </div>
                <div style="padding:12px 16px; display:flex; align-items:center; gap:12px; background:#fff;">
                  <div style="width:16px; height:16px; background:${f.color}; border-radius:2px;"></div>
                  <div style="font-size:13px; font-weight:500; color:#3c4043; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 17. Google Maps
  if (nid.includes('map')) {
    return `
      <div style="width:100%; height:100%; background:#e5e3df; position:relative; overflow:hidden; font-family:sans-serif;">
        <!-- Map Background Grid/Roads -->
        <svg style="position:absolute; width:100%; height:100%; top:0; left:0;">
          <rect width="100%" height="100%" fill="#f8f9fa"/>
          <!-- Roads -->
          <path d="M0,100 L800,150 M0,200 L800,300 M300,0 L400,600 M600,0 L500,600" stroke="#fff" stroke-width="12" fill="none"/>
          <path d="M0,100 L800,150 M0,200 L800,300 M300,0 L400,600 M600,0 L500,600" stroke="#f1f3f4" stroke-width="8" fill="none"/>
          <!-- Highway -->
          <path d="M-100,500 C200,400 400,300 900,100" stroke="#fbc02d" stroke-width="14" fill="none"/>
          <path d="M-100,500 C200,400 400,300 900,100" stroke="#fff59d" stroke-width="10" fill="none"/>
          <!-- Water -->
          <path d="M-50,-50 C100,100 150,200 -50,400 Z" fill="#bbdefb"/>
        </svg>

        <!-- Search Box -->
        <div style="position:absolute; top:20px; left:20px; width:350px; height:48px; background:#fff; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.2); display:flex; align-items:center; padding:0 16px; z-index:10;">
          <span style="color:#1a73e8; font-size:20px; font-weight:bold; margin-right:12px;">≡</span>
          <span style="color:#70757a; font-size:15px; flex:1;">Search Google Maps</span>
          <span style="color:#1a73e8; font-size:20px;">🔍</span>
        </div>

        <!-- Location Pin -->
        <div class="float-anim" style="position:absolute; top:45%; left:50%; transform:translate(-50%, -100%); z-index:20;">
          <div style="width:36px; height:48px; background:#ea4335; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; justify-content:center; align-items:center; box-shadow:2px 2px 6px rgba(0,0,0,0.3); position:relative;">
            <div style="width:14px; height:14px; background:#fff; border-radius:50%; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(45deg);"></div>
          </div>
          <!-- Pin Shadow -->
          <div style="width:20px; height:6px; background:rgba(0,0,0,0.3); border-radius:50%; position:absolute; bottom:-4px; left:-8px; z-index:-1;"></div>
          <!-- Info Card -->
          <div class="pop-in" style="position:absolute; top:-80px; left:-80px; width:200px; background:#fff; border-radius:8px; padding:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15); animation-delay:0.5s;">
            <div style="font-weight:bold; font-size:14px; color:#202124; margin-bottom:4px;">AMEVA Headquarters</div>
            <div style="font-size:12px; color:#70757a; margin-bottom:8px;">4.9 ⭐ (1,024 reviews)</div>
            <div style="color:#1a73e8; font-size:12px; font-weight:500;">Directions</div>
          </div>
        </div>
      </div>
    `;
  }

  // 18. Outline
  if (nid.includes('outline')) {
    return `
      <div style="width:100%; height:100%; display:flex; background:#fff; overflow:hidden; font-family:sans-serif;">
        <div style="width:280px; background:#f8fafc; border-right:1px solid #e2e8f0; display:flex; flex-direction:column;">
          <div style="padding:20px 16px 12px; font-size:12px; font-weight:bold; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Table of Contents</div>
          <div style="flex:1; overflow-y:auto; padding:0 12px 20px;">
            <div style="padding:6px 8px; border-radius:6px; cursor:pointer; color:#334155; font-weight:bold; font-size:14px;">1. Introduction</div>
            <div style="padding:6px 8px 6px 24px; border-radius:6px; cursor:pointer; color:#1d4ed8; background:#eff6ff; font-weight:600; font-size:13px; margin:2px 0;">1.1 System Architecture</div>
            <div style="padding:6px 8px 6px 24px; border-radius:6px; cursor:pointer; color:#475569; font-size:13px; margin:2px 0;">1.2 Design Philosophy</div>
            <div style="padding:6px 8px; border-radius:6px; cursor:pointer; color:#334155; font-weight:bold; font-size:14px; margin-top:8px;">2. Core Modules</div>
            <div style="padding:6px 8px 6px 24px; border-radius:6px; cursor:pointer; color:#475569; font-size:13px; margin:2px 0;">2.1 RAG Engine</div>
            <div style="padding:6px 8px 6px 40px; border-radius:6px; cursor:pointer; color:#64748b; font-size:13px; margin:2px 0;">2.1.1 Vector DB Sync</div>
            <div style="padding:6px 8px 6px 24px; border-radius:6px; cursor:pointer; color:#475569; font-size:13px; margin:2px 0;">2.2 Collaboration Grid</div>
          </div>
        </div>
        <div style="flex:1; padding:40px 60px; overflow-y:auto; background:#fff;">
          <div style="font-size:14px; color:#94a3b8; font-family:monospace; margin-bottom:16px;">Section 1.1</div>
          <h1 style="font-size:32px; font-weight:800; color:#0f172a; margin-bottom:24px;">System Architecture</h1>
          <p style="font-size:16px; line-height:1.8; color:#334155; margin-bottom:24px;">
            The AMEVA framework is built upon a microkernel architecture where plugins dynamically register their capabilities. 
            This allows for seamless hot-reloading and modular scaling without restarting the core daemon.
          </p>
          <div class="shimmer" style="width:100%; height:16px; margin-bottom:12px; border-radius:4px; background:#f1f5f9;"></div>
          <div class="shimmer" style="width:90%; height:16px; margin-bottom:12px; border-radius:4px; background:#f1f5f9;"></div>
          <div class="shimmer" style="width:95%; height:16px; margin-bottom:32px; border-radius:4px; background:#f1f5f9;"></div>
          
          <h2 style="font-size:24px; font-weight:700; color:#1e293b; margin-bottom:16px;">Component Diagram</h2>
          <div style="width:100%; height:200px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
            [ Diagram Rendered Here ]
          </div>
        </div>
      </div>
    `;
  }

  // 19. Rich Styling
  if (nid.includes('rich') || nid.includes('styling')) {
    return `
      <div style="width:100%; height:100%; background:#f1f5f9; display:flex; flex-direction:column; align-items:center; padding:40px; font-family:sans-serif;">
        <!-- Floating Toolbar -->
        <div class="pop-in" style="background:#fff; padding:8px 16px; border-radius:30px; box-shadow:0 10px 25px rgba(0,0,0,0.1); display:flex; align-items:center; gap:16px; margin-bottom:32px; border:1px solid #e2e8f0;">
          <div style="display:flex; gap:4px;">
            <button style="width:32px; height:32px; border-radius:8px; border:none; background:#eff6ff; color:#2563eb; font-weight:bold; font-family:serif; font-size:16px; cursor:pointer;">B</button>
            <button style="width:32px; height:32px; border-radius:8px; border:none; background:#fff; color:#475569; font-style:italic; font-family:serif; font-size:16px; cursor:pointer;">I</button>
            <button style="width:32px; height:32px; border-radius:8px; border:none; background:#fff; color:#475569; text-decoration:underline; font-family:serif; font-size:16px; cursor:pointer;">U</button>
            <button style="width:32px; height:32px; border-radius:8px; border:none; background:#fff; color:#475569; text-decoration:line-through; font-family:serif; font-size:16px; cursor:pointer;">S</button>
          </div>
          <div style="width:1px; height:24px; background:#e2e8f0;"></div>
          <div style="display:flex; gap:8px;">
            <div style="width:20px; height:20px; border-radius:50%; background:#ef4444; cursor:pointer; border:2px solid #fff; box-shadow:0 0 0 1px #e2e8f0;"></div>
            <div style="width:20px; height:20px; border-radius:50%; background:#3b82f6; cursor:pointer; border:2px solid #fff; box-shadow:0 0 0 1px #3b82f6;"></div>
            <div style="width:20px; height:20px; border-radius:50%; background:#10b981; cursor:pointer; border:2px solid #fff; box-shadow:0 0 0 1px #e2e8f0;"></div>
            <div style="width:20px; height:20px; border-radius:50%; background:#eab308; cursor:pointer; border:2px solid #fff; box-shadow:0 0 0 1px #e2e8f0;"></div>
          </div>
          <div style="width:1px; height:24px; background:#e2e8f0;"></div>
          <div style="display:flex; align-items:center; gap:8px; font-size:14px; color:#475569; cursor:pointer;">
            Heading 1 <span style="font-size:10px;">▼</span>
          </div>
        </div>
        
        <!-- Editor Content -->
        <div style="width:100%; max-width:600px; background:#fff; border-radius:12px; padding:40px; box-shadow:0 4px 6px rgba(0,0,0,0.05); min-height:300px;">
          <h1 style="font-size:36px; font-weight:900; margin-bottom:16px; background:linear-gradient(90deg, #2563eb, #db2777); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Rich Text Editor</h1>
          <p style="font-size:18px; line-height:1.7; color:#334155;">
            This editor supports <span style="font-weight:bold; color:#ef4444;">beautifully rendered inline styles</span>. 
            You can effortlessly highlight <span style="background:#fef08a; padding:2px 4px; border-radius:4px;">important text</span>, 
            or use <span style="font-style:italic; color:#2563eb;">elegant italics</span> to emphasize your point.
          </p>
          <div style="margin-top:24px; padding:16px; border-left:4px solid #3b82f6; background:#f8fafc; font-style:italic; color:#475569;">
            "Simplicity is the ultimate sophistication."
          </div>
          <div class="pulse" style="width:2px; height:24px; background:#2563eb; margin-top:24px;"></div>
        </div>
      </div>
    `;
  }

  // 20. Youtube / Video Player
  if (nid.includes('youtube') || nid.includes('video')) {
    return `
      <div style="width:100%; height:100%; background:#000; position:relative; display:flex; align-items:center; justify-content:center; font-family:sans-serif; overflow:hidden;">
        <!-- Fake Video Background -->
        <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(45deg, #1a1a2e, #16213e, #0f3460); opacity:0.8;"></div>
        
        <!-- Big Play Button -->
        <div class="pulse" style="width:80px; height:56px; background:rgba(255,0,0,0.9); border-radius:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; box-shadow:0 0 20px rgba(255,0,0,0.5); transition:transform 0.2s;">
          <div style="width:0; height:0; border-top:14px solid transparent; border-bottom:14px solid transparent; border-left:22px solid #fff; margin-left:6px;"></div>
        </div>
        
        <!-- YouTube Controls UI -->
        <div style="position:absolute; bottom:0; left:0; width:100%; height:70px; background:linear-gradient(transparent, rgba(0,0,0,0.9)); display:flex; flex-direction:column; justify-content:flex-end; padding:0 20px 10px 20px; z-index:10;">
          <!-- Progress Bar -->
          <div style="width:100%; height:4px; background:rgba(255,255,255,0.3); border-radius:2px; margin-bottom:16px; position:relative; cursor:pointer;">
            <div style="position:absolute; top:0; left:0; height:100%; width:65%; background:rgba(255,255,255,0.5); border-radius:2px;"></div>
            <div style="position:absolute; top:0; left:0; height:100%; width:35%; background:#f00; border-radius:2px;"></div>
            <div style="position:absolute; top:-4px; left:35%; width:12px; height:12px; background:#f00; border-radius:50%; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>
          </div>
          
          <!-- Buttons Row -->
          <div style="display:flex; justify-content:space-between; align-items:center; color:#fff;">
            <div style="display:flex; align-items:center; gap:20px;">
              <span style="font-size:16px; cursor:pointer;">⏸</span>
              <span style="font-size:16px; cursor:pointer;">⏭</span>
              <span style="font-size:16px; cursor:pointer;">🔊</span>
              <span style="font-size:12px; font-family:monospace; margin-left:8px;">10:24 / 24:00</span>
            </div>
            <div style="display:flex; align-items:center; gap:20px;">
              <span style="font-size:16px; cursor:pointer;">⚙️</span>
              <span style="font-size:16px; cursor:pointer;">⛶</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Default / Generic (Should ideally not be hit, but kept as a gorgeous safety net)
  return `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg, #0f172a, #1e293b); text-align:center; padding:40px; font-family:sans-serif; color:#f8fafc;">
      <div class="pulse" style="width:80px; height:80px; border-radius:20px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); display:flex; align-items:center; justify-content:center; font-size:40px; margin-bottom:32px; box-shadow:0 10px 30px rgba(59,130,246,0.3);">✨</div>
      <h3 style="font-size:24px; font-weight:bold; margin-bottom:16px; letter-spacing:-0.5px;">Custom Module</h3>
      <p style="color:#94a3b8; max-width:400px; line-height:1.6; font-size:15px; margin-bottom:32px;">
        This module is currently being crafted. It will provide deep integration and powerful features directly within your workspace.
      </p>
      <button style="background:#fff; color:#0f172a; border:none; padding:12px 28px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition:transform 0.1s;">Initialize</button>
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
  <style>
    /* Reset & Base */
    * { box-sizing: border-box; }
    body, html { margin:0; padding:0; height:100%; width:100%; overflow:hidden; }
    /* Ensure content takes full space in mock-content */
    .mock-content { padding: 0 !important; overflow: hidden !important; }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <img src="${iconUrl}" class="preview-icon" alt="icon" />
      <div class="preview-title">
        <h2 style="font-size:1.4rem; display:flex; align-items:center; gap:8px;">
          ${name}
          <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:${isPremium ? 'rgba(236,72,153,0.15)' : 'rgba(59,130,246,0.15)'}; color:${isPremium ? 'var(--premium)' : 'var(--primary)'}; font-weight:bold; border:1px solid ${isPremium ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'};">
            ${isPremium ? '👑 Premium' : 'Standard'}
          </span>
        </h2>
        <p style="font-size:0.85rem; color:#64748b;">AMEVA Workspace Simulation Engine</p>
      </div>
    </div>
    <div class="preview-body">
      <div class="mock-window" style="box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="mock-titlebar">
          <div class="mock-dot r"></div><div class="mock-dot y"></div><div class="mock-dot g"></div>
          <div class="mock-title-text">${name} - Interactive Preview</div>
        </div>
        <div class="mock-content" style="height:100%; display:flex; flex-direction:column;">
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
      console.log('Generated bespoke preview for ' + id + ' -> ' + targetPath);
    }
  });
}

// 1. 공용 플러그인 처리
processDirectory(PLUGINS_DIR, 'standard');

// 2. 프리미엄 플러그인 처리
processDirectory(PREMIUM_DIR, 'premium');

// 3. SaaS 프리미엄 기능 처리 (DuckDuckGo, Python, Queue)
const saasItems = [
  { id: 'webSearch', name: 'DuckDuckGo Web Search API (Pro)' },
  { id: 'pythonConsole', name: 'Python Sandbox Executor (Pro)' },
  { id: 'requestQueue', name: 'Sequential Request Queue (Pro)' }
];

saasItems.forEach(item => {
  const htmlContent = generatePreviewHtml(item.id, item.name, 'premium');
  const targetPath = path.join(PREMIUM_DIR, item.id + '-preview.html');
  fs.writeFileSync(targetPath, htmlContent, 'utf8');
  console.log('Generated bespoke preview for ' + item.id + ' -> ' + targetPath);
});

console.log('All gorgeous, handcrafted preview pages generated successfully!');
