// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MonitorPlay, Play, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

// ── MERMAID RENDERER ──────────────────────────────────────────────────────────
function MermaidRenderer({ code }) {
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState('');
  const idRef = useRef('mm-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!window.mermaid) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const m = window.mermaid;
        m.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        const { svg: rendered } = await m.render(idRef.current, code);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Render failed');
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (err) return (
    <div style={{ color: '#ef4444', fontSize: '11px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px' }}>
      ⚠️ Mermaid Error: {err}
    </div>
  );
  if (!svg) return <div style={{ color: '#9ca3af', fontSize: '11px', padding: '16px', textAlign: 'center' }}>🔄 다이어그램 렌더링 중...</div>;
  return (
    <div
      style={{ width: '100%', background: '#1a1b23', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ── CODE RUNNER ───────────────────────────────────────────────────────────────
function CodeRunner({ code, language }) {
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true); setOutput('실행 중...');
    setTimeout(() => {
      const lang = (language || 'javascript').toLowerCase();
      if (lang === 'html') { setOutput('__HTML__'); setRunning(false); return; }
      if (lang !== 'javascript' && lang !== 'js') {
        setOutput('[' + (language || 'CODE').toUpperCase() + '] 환경 실행이 완료되었습니다.\n(AMEVA OS 가상 샌드박스)');
        setRunning(false); return;
      }
      const logs = []; const orig = console.log;
      console.log = (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '));
      try {
        const r = eval(code);
        if (r !== undefined) logs.push('=> ' + (typeof r === 'object' ? JSON.stringify(r) : String(r)));
        setOutput(logs.join('\n') || 'Success (수행 완료)');
      } catch (e) { setOutput('⚠️ Error: ' + e.message); }
      finally { console.log = orig; setRunning(false); }
    }, 400);
  };

  return (
    <div style={{ marginTop: '10px', width: '100%' }}>
      <button onClick={run} disabled={running} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>
        {running ? 'Running...' : '▶ 코드 실행'}
      </button>
      {output && (output === '__HTML__'
        ? <div style={{ marginTop: '10px', padding: '12px', background: '#fff', color: '#000', borderRadius: '6px', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: code }} />
        : <pre style={{ marginTop: '10px', padding: '12px', background: '#090a0f', border: '1px solid #1f2029', borderRadius: '6px', color: '#34d399', fontSize: '11px', fontFamily: 'monospace', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{output}</pre>
      )}
    </div>
  );
}

// ── MINI KANBAN (reads KanbanBlock columns/cards structure) ─────────────────
function MiniKanban({ board }) {
  const parseBoard = () => {
    try {
      if (!board) return { columns: [] };
      if (typeof board === 'string') return JSON.parse(board);
      return board;
    } catch { return { columns: [] }; }
  };
  const data = parseBoard();
  const cols = data.columns || [];

  if (cols.length === 0) return (
    <div style={{ color: '#9ca3af', fontSize: '11px', padding: '12px', textAlign: 'center' }}>칸반 데이터 없음</div>
  );

  const colColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];

  return (
    <div style={{ width: '100%', background: '#13141f', border: '1px solid #2e303e', borderRadius: '10px', padding: '12px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', display:'inline-block' }}></span>
        <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold' }}>칸반 보드</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {cols.map((col, ci) => {
          const cards = col.cards || [];
          const color = colColors[ci % colColors.length];
          return (
            <div key={col.id || ci} style={{ flex: '1 1 0', minWidth: '80px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color, marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:color, display:'inline-block' }}></span>
                {col.title || 'Untitled'}
                <span style={{ background: '#3f3f46', color: '#fff', borderRadius: '8px', padding: '0px 5px', fontSize: '9px', marginLeft: 'auto' }}>{cards.length}</span>
              </div>
              {cards.slice(0, 3).map(card => (
                <div key={card.id} style={{ background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '5px', padding: '5px 7px', fontSize: '10px', color: '#d1d5db', marginBottom: '4px' }}>
                  {card.title || '(제목 없음)'}
                </div>
              ))}
              {cards.length === 0 && <div style={{ fontSize: '9px', color: '#4b5563', textAlign: 'center', marginTop: '6px' }}>비어있음</div>}
              {cards.length > 3 && <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>+{cards.length - 3}개 더...</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── EXCEL VIEWER (preview table + 더보기 modal) ───────────────────────────────
function getExcelGrid(sheet) {
  if (!sheet) return { grid: [], maxR: -1, maxC: -1 };
  if (sheet.data && Array.isArray(sheet.data) && sheet.data.length > 0) {
    const matrix = sheet.data;
    let maxC = 0;
    matrix.forEach(r => { if (Array.isArray(r) && r.length > maxC) maxC = r.length; });
    return { grid: matrix, maxR: matrix.length - 1, maxC: maxC - 1 };
  }
  const celldata = sheet.celldata || [];
  if (celldata.length === 0) return { grid: [], maxR: -1, maxC: -1 };
  let maxR = 0, maxC = 0;
  for (const cell of celldata) {
    if (cell.r > maxR) maxR = cell.r;
    if (cell.c > maxC) maxC = cell.c;
  }
  const grid = Array(maxR + 1).fill(null).map(() => Array(maxC + 1).fill(''));
  for (const cell of celldata) {
    const v = cell.v;
    grid[cell.r][cell.c] = v?.m ?? v?.v ?? (typeof v === 'string' || typeof v === 'number' ? v : '');
  }
  return { grid, maxR, maxC };
}

function ExcelModal({ data, onClose }) {
  const [sheetIdx, setSheetIdx] = useState(0);
  if (!data?.sheets?.length) return null;
  const sheet = data.sheets[sheetIdx];
  const { grid, maxR, maxC } = getExcelGrid(sheet);
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1a1b23', border: '1px solid #2e303e', borderRadius: '12px', overflow: 'hidden', width: '90vw', maxWidth: '1100px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#13141f', borderBottom: '1px solid #2e303e' }}>
          <span style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '14px' }}>📊 Excel Spreadsheet</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', background: '#111218', borderBottom: '1px solid #2e303e', gap: '2px', padding: '4px 8px 0', flexShrink: 0 }}>
          {data.sheets.map((s, i) => (
            <button key={i} onClick={() => setSheetIdx(i)} style={{ padding: '5px 14px', background: i === sheetIdx ? '#1a1b23' : 'transparent', border: 'none', fontSize: '11px', cursor: 'pointer', color: i === sheetIdx ? '#f59e0b' : '#9ca3af', fontWeight: i === sheetIdx ? 'bold' : 'normal', borderRadius: '4px 4px 0 0' }}>{s.name}</button>
          ))}
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '12px', color: '#e5e7eb', minWidth: '100%' }}>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '4px 8px', color: '#4b5563', fontSize: '10px', background: '#111218', borderRight: '1px solid #2e303e', textAlign: 'center', minWidth: '30px', position: 'sticky', left: 0 }}>{ri + 1}</td>
                  {(row || []).map((cell, ci) => (
                    <td key={ci} style={{ padding: '5px 10px', border: '1px solid #2e303e', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                      {cell !== null && cell !== undefined ? String(cell) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExcelViewer({ data }) {
  const [sheetIdx, setSheetIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  if (!data?.sheets?.length) return <div style={{ color: '#9ca3af', fontSize: '11px', padding: '12px' }}>엑셀 데이터 없음</div>;
  const sheet = data.sheets[sheetIdx];
  const { grid, maxR } = getExcelGrid(sheet);
  
  // Show only first 5 rows (0~4 index) as preview
  const previewRows = grid.slice(0, 5);
  const hasMore = grid.length > 5;
  return (
    <>
      {showModal && <ExcelModal data={data} onClose={() => setShowModal(false)} />}
      <div style={{ width: '100%', background: '#1a1b23', border: '1px solid #2e303e', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#111218', borderBottom: '1px solid #2e303e', gap: '2px', padding: '4px 4px 0' }}>
          {data.sheets.map((s, i) => (
            <button key={i} onClick={() => setSheetIdx(i)} style={{ padding: '4px 12px', background: i === sheetIdx ? '#1a1b23' : 'transparent', border: 'none', fontSize: '10px', cursor: 'pointer', color: i === sheetIdx ? '#f59e0b' : '#9ca3af', fontWeight: i === sheetIdx ? 'bold' : 'normal', borderRadius: '4px 4px 0 0' }}>{s.name}</button>
          ))}
          <button onClick={() => setShowModal(true)} style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>📊 전체보기</button>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '180px' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '10.5px', color: '#e5e7eb', minWidth: '100%' }}>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '3px 6px', color: '#4b5563', fontSize: '9px', background: '#111218', borderRight: '1px solid #2e303e', textAlign: 'center', minWidth: '24px' }}>{ri + 1}</td>
                  {(row || []).map((cell, ci) => (
                    <td key={ci} style={{ padding: '4px 8px', border: '1px solid #2e303e', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                      {cell !== null && cell !== undefined ? String(cell) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div style={{ padding: '6px 10px', background: '#111218', borderTop: '1px solid #2e303e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '9px', color: '#6b7280' }}>미리보기: 5/{grid.length}행 표시 중</span>
            <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer' }}>📊 전체 시트 보기 ({grid.length}행)</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export function PresentationPlugin() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slides, setSlides] = useState([]);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFs = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => setIsFullscreen(true));
    else document.exitFullscreen();
  };

  const getText = (block) => {
    if (!block) return '';
    if (typeof block.content === 'string') return block.content;
    if (Array.isArray(block.content)) return block.content.map(c => c?.text || '').join('');
    return '';
  };

  const parseTableRows = (block) => {
    const rows = block.tableRows || block.props?.tableRows || [];
    return rows.map(row => {
      const cells = Array.isArray(row.cells) ? row.cells : [];
      return cells.map(cell => {
        if (typeof cell === 'string') return cell;
        if (Array.isArray(cell)) return cell.map(c => c?.text || '').join('');
        return '';
      });
    });
  };

  const parseExcel = (block) => {
    try {
      const raw = block.props?.data || block.props?.sheets || block.data;
      if (!raw) return null;
      let sheets = [];
      if (typeof raw === 'string') {
        const p = JSON.parse(raw);
        sheets = Array.isArray(p) ? p : [p];
      } else if (Array.isArray(raw)) {
        sheets = raw[0]?.name ? raw : [{ name: 'Sheet1', celldata: raw }];
      }

      const processedSheets = sheets.map(sheet => {
        if (!sheet) return { name: 'Sheet', data: [] };
        const sheetName = sheet.name || 'Sheet';
        if (sheet.data && Array.isArray(sheet.data)) {
          return { name: sheetName, data: sheet.data };
        }
        const cellList = sheet.celldata || [];
        if (!Array.isArray(cellList) || cellList.length === 0) {
          return { name: sheetName, data: [] };
        }
        let maxR = 0;
        let maxC = 0;
        cellList.forEach(cell => {
          if (cell && typeof cell.r === 'number' && cell.r > maxR) maxR = cell.r;
          if (cell && typeof cell.c === 'number' && cell.c > maxC) maxC = cell.c;
        });
        const matrix = Array.from({ length: maxR + 1 }, () => Array(maxC + 1).fill(''));
        cellList.forEach(cell => {
          if (cell && typeof cell.r === 'number' && typeof cell.c === 'number') {
            const val = cell.v?.m || cell.v?.v || '';
            matrix[cell.r][cell.c] = String(val);
          }
        });
        return { name: sheetName, data: matrix };
      });
      return { sheets: processedSheets };
    } catch (_) {}
    return null;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // HEURISTIC SLIDE BUILDER
  //  #  H1  → Cover slide (title page)
  //  ## H2  → Chapter intro slide
  //  ### H3 → Content slide (section)
  //  #### H4+ → Sub-heading divider within current slide
  //  Content blocks → appended to current slide
  // ──────────────────────────────────────────────────────────────────────────
  const buildSlides = useCallback(() => {
    const core = window.AMEVA_CORE;
    if (!core?.editor) return [];
    const blocks = core.editor.document || [];

    // Debug unknown types
    const seen = new Set();
    blocks.forEach(b => {
      if (!seen.has(b.type)) { seen.add(b.type); console.log('[Presentation] block:', b.type, b.props ? Object.keys(b.props) : ''); }
    });

    let docTitle = '새 프레젠테이션';
    try {
      const ws = core.useWorkspaceStore?.getState();
      const tab = ws?.tabs?.find(t => t.id === ws?.activeTabId);
      const fp = tab?.filePath || ws?.filePath;
      if (fp) docTitle = fp.split(/[\\\/]/).pop()?.replace(/\.md$/, '') || docTitle;
    } catch (_) {}

    const result = [];
    let current = null;
    let chapterNum = 0;
    let checklist = [];

    const pushSlide = () => {
      if (current && (current.slideType !== 'content' || current.elements.length > 0)) result.push(current);
      current = null;
    };
    const flushChecklist = () => {
      if (!checklist.length) return;
      ensureContent();
      current.elements.push({ type: 'kanban', tasks: [...checklist] });
      checklist = [];
    };
    const ensureContent = () => {
      if (!current) current = { slideType: 'content', title: '본문', parentTitle: docTitle, elements: [] };
    };

    blocks.forEach(block => {
      const text = getText(block);
      const btype = block.type || '';

      // ── Headings → slide structure ──────────────────────────────────────
      if (btype === 'heading') {
        flushChecklist();
        const lvl = block.props?.level || 2;

        if (lvl === 1) {
          // # → Cover slide
          pushSlide();
          result.push({ slideType: 'cover', title: text || docTitle, subtitle: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }), parentTitle: '', elements: [] });
          return;
        }
        if (lvl === 2) {
          // ## → Chapter intro + begin new content slide
          pushSlide();
          chapterNum++;
          result.push({ slideType: 'chapter', title: text || '챕터', chapterNum, parentTitle: docTitle, elements: [] });
          current = { slideType: 'content', title: text || '챕터', parentTitle: `${docTitle} › Ch.${chapterNum}`, elements: [] };
          return;
        }
        if (lvl === 3) {
          // ### → New content slide
          pushSlide();
          current = { slideType: 'content', title: text || '섹션', parentTitle: `${docTitle}${chapterNum ? ` › Ch.${chapterNum}` : ''}`, elements: [] };
          return;
        }
        // #### + → sub-heading divider within current slide
        ensureContent();
        current.elements.push({ type: 'divider', text });
        return;
      }

      // ── CheckList accumulator → Kanban ──────────────────────────────────
      if (btype === 'checkListItem') { checklist.push(block); return; }
      else flushChecklist();

      // ── Other blocks ────────────────────────────────────────────────────
      let el = null;

      if (btype === 'paragraph') {
        if (!text.trim()) return;
        el = { type: 'paragraph', text };
      } else if (btype === 'bulletListItem') {
        el = { type: 'bullet', text };
      } else if (btype === 'numberedListItem') {
        el = { type: 'bullet', text: '• ' + text };
      } else if (btype === 'image') {
        el = { type: 'image', url: block.props?.url || '' };
      } else if (btype === 'codeBlock' || btype === 'jupyter') {
        const code = block.props?.code || text || '';
        const lang = (block.props?.language || 'text').toLowerCase();
        el = lang === 'mermaid' ? { type: 'mermaid', code } : { type: 'code', code, language: block.props?.language || 'text' };
      } else if (btype === 'map') {
        el = { type: 'map', lat: block.props?.lat || '37.5665', lng: block.props?.lng || '126.9780', locationName: block.props?.locationName || '서울' };
      } else if (btype === 'youtube') {
        const vid = block.props?.videoId || block.props?.url?.split('v=')?.[1]?.split('&')?.[0] || '';
        el = { type: 'youtube', title: vid, url: block.props?.url || '' };
      } else if (btype === 'linkPreview' || btype === 'link') {
        el = { type: 'link', url: block.props?.url || '', title: block.props?.title || block.props?.url || 'Link', description: block.props?.description || '', thumbnail: block.props?.thumbnail || block.props?.image || '' };
      } else if (btype === 'table') {
        el = { type: 'table', tableRows: parseTableRows(block) };
      } else if (['kanban', 'kanbanBoard', 'KanbanBoard', 'kanban_board', 'taskBoard'].includes(btype)) {
        // KanbanBlock stores data in block.props.data as JSON string with {columns:[...]}
        const boardData = block.props?.data || block.props?.tasks || block.props || '{}';
        el = { type: 'kanban', board: boardData };
      } else if (['spreadsheet', 'excel', 'excelSpreadsheet', 'ExcelSpreadsheet', 'sheet'].includes(btype)) {
        const d = parseExcel(block);
        if (d) el = { type: 'excel', excelData: d };
      }

      if (el) { ensureContent(); current.elements.push(el); }
    });

    flushChecklist();
    pushSlide();

    if (!result.length) result.push({ slideType: 'cover', title: docTitle, subtitle: '문서에 # 제목을 추가하면 슬라이드가 생성됩니다.', parentTitle: '', elements: [] });
    return result;
  }, []);

  const handleRefresh = () => { const s = buildSlides(); setSlides(s); setSlideIdx(0); };

  useEffect(() => {
    const h = () => { const s = buildSlides(); setSlides(s); };
    window.addEventListener('keyup', h); window.addEventListener('mouseup', h); h();
    return () => { window.removeEventListener('keyup', h); window.removeEventListener('mouseup', h); };
  }, [buildSlides]);

  useEffect(() => {
    if (!isPlaying) return;
    const h = (e) => {
      if (['ArrowRight', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); setSlideIdx(p => Math.min(slides.length - 1, p + 1)); }
      else if (['ArrowLeft', 'Backspace'].includes(e.key)) { e.preventDefault(); setSlideIdx(p => Math.max(0, p - 1)); }
      else if (e.key === 'Escape') { e.preventDefault(); setIsPlaying(false); if (document.fullscreenElement) document.exitFullscreen(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isPlaying, slides.length]);

  // ── MEDIA ELEMENT RENDERER ──────────────────────────────────────────────
  const renderMedia = (el, key) => {
    switch (el.type) {
      case 'mermaid':
        return <div key={key} style={{ width: '100%' }}><MermaidRenderer code={el.code || ''} /></div>;
      case 'image':
        return <img key={key} src={el.url} alt="" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', objectFit: 'contain' }} />;
      case 'map':
        return (
          <div key={key} style={{ width: '100%', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px' }}>📍 {el.locationName}</div>
            <iframe src={`https://maps.google.com/maps?q=${el.lat},${el.lng}&z=13&output=embed`} width="100%" height="380" style={{ border: 0, borderRadius: '6px' }} allowFullScreen title="Map" />
          </div>
        );
      case 'youtube':
        return (
          <div key={key} style={{ width: '100%', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px' }}>▶ YouTube</div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '6px', overflow: 'hidden' }}>
              <iframe src={`https://www.youtube.com/embed/${el.title}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen title="YouTube" />
            </div>
          </div>
        );
      case 'code':
        return (
          <div key={key} style={{ width: '100%', background: '#0d0e12', border: '1px solid #2e303e', borderRadius: '10px', overflow: 'hidden', textAlign: 'left' }}>
            <div style={{ background: '#1a1b23', padding: '8px 16px', display: 'flex', gap: '6px', alignItems: 'center', borderBottom: '1px solid #2e303e' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{el.language}</span>
            </div>
            <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '12px', color: '#a78bfa', lineHeight: '1.6', maxHeight: '360px', fontFamily: 'monospace' }}>
              <code>{el.code}</code>
            </pre>
            <div style={{ padding: '0 16px 16px' }}><CodeRunner code={el.code || ''} language={el.language || ''} /></div>
          </div>
        );
      case 'table': {
        const hRow = (el.tableRows || [])[0] || [];
        const bRows = (el.tableRows || []).slice(1);
        return (
          <div key={key} style={{ width: '100%', overflowX: 'auto', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '10px', padding: '10px', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead><tr>{hRow.map((c, i) => <th key={i} style={{ borderBottom: '2px solid #3b3c4a', padding: '8px 10px', color: '#f59e0b', fontWeight: 'bold', background: '#13141a' }}>{c}</th>)}</tr></thead>
              <tbody>{bRows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>{row.map((c, ci) => <td key={ci} style={{ borderBottom: '1px solid #2e303e', padding: '7px 10px', color: '#d1d5db' }}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      }
      case 'kanban':
        return <MiniKanban key={key} board={el.board} />;
      case 'excel':
        return el.excelData ? <ExcelViewer key={key} data={el.excelData} /> : null;
      default:
        return null;
    }
  };

  const MEDIA_TYPES = new Set(['image', 'map', 'youtube', 'code', 'table', 'kanban', 'excel', 'mermaid']);

  // ── INLINE ELEMENT RENDERER ─────────────────────────────────────────────
  const renderInline = (el, idx) => {
    if (MEDIA_TYPES.has(el.type)) return renderMedia(el, idx);
    switch (el.type) {
      case 'paragraph':
        return <p key={idx} style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.7', margin: '0 0 4px 0', textAlign: 'left' }}>{el.text}</p>;
      case 'bullet':
        return (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{ color: '#f59e0b', fontSize: '16px', lineHeight: '1.5', flexShrink: 0 }}>▸</span>
            <span style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.6' }}>{el.text}</span>
          </div>
        );
      case 'divider':
        return (
          <div key={idx} style={{ marginTop: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#a78bfa', borderBottom: '1px solid rgba(167,139,250,0.3)', paddingBottom: '4px', display: 'block', textAlign: 'left' }}>◆ {el.text}</span>
          </div>
        );
      case 'link':
        return (
          <a key={idx} href={el.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <div style={{ background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '10px', padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              {el.thumbnail
                ? <img src={el.thumbnail} alt="" style={{ width: '72px', height: '72px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: '72px', height: '72px', borderRadius: '6px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '28px' }}>🔗</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.title}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{el.description || el.url}</div>
              </div>
            </div>
          </a>
        );
      default: return null;
    }
  };

  // ── SLIDE LAYOUT ────────────────────────────────────────────────────────
  const renderSlide = (slide) => {
    if (!slide) return null;

    if (slide.slideType === 'cover') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', minHeight: '55vh', gap: '20px', padding: '40px 60px' }}>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>🚀 AMEVA WORKSTATION</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,64px)', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>{slide.title}</h1>
          <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg,#f59e0b,#a78bfa)', borderRadius: '2px' }}></div>
          {slide.subtitle && <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0, maxWidth: '500px', lineHeight: 1.5 }}>{slide.subtitle}</p>}
          {slide.elements.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '700px', marginTop: '12px' }}>
              {slide.elements.map((el, i) => renderInline(el, i))}
            </div>
          )}
        </div>
      );
    }

    if (slide.slideType === 'chapter') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', minHeight: '45vh', gap: '16px', padding: '40px 60px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>CHAPTER {slide.chapterNum}</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: '800', color: '#fff', margin: 0, lineHeight: 1.15 }}>{slide.title}</h2>
          <div style={{ width: '60px', height: '3px', background: '#f59e0b', borderRadius: '2px' }}></div>
          {slide.elements.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '700px', marginTop: '8px' }}>
              {slide.elements.map((el, i) => renderInline(el, i))}
            </div>
          )}
        </div>
      );
    }

    const mediaEls = slide.elements.filter(el => MEDIA_TYPES.has(el.type));
    const textEls = slide.elements.filter(el => !MEDIA_TYPES.has(el.type));

    const header = (
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        {slide.parentTitle && <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{slide.parentTitle}</div>}
        <h2 style={{ fontSize: 'clamp(20px,2.5vw,34px)', fontWeight: '800', color: '#fff', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', lineHeight: 1.2 }}>{slide.title}</h2>
      </div>
    );

    if (mediaEls.length > 0 && textEls.length > 0) {
      return (
        <div style={{ display: 'flex', width: '100%', gap: '40px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {header}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{textEls.map((el, i) => renderInline(el, i))}</div>
          </div>
          <div style={{ flex: 1.3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>{mediaEls.map((el, i) => renderMedia(el, i))}</div>
        </div>
      );
    }
    if (mediaEls.length > 0) {
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {header}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>{mediaEls.map((el, i) => renderMedia(el, i))}</div>
        </div>
      );
    }
    return (
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{slide.elements.map((el, i) => renderInline(el, i))}</div>
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  const btnStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14', flexShrink: 0 }}>
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', padding: '6px', borderRadius: '6px', display: 'flex' }}>
          <MonitorPlay size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#fff' }}>프레젠테이션 메이커</h2>
          <p style={{ fontSize: '9.5px', color: '#9ca3af', margin: 0 }}># 표지 · ## 챕터 · ### 섹션 · #### 소제목 으로 자동 슬라이드 생성</p>
        </div>
        {!isPlaying && (
          <button onClick={handleRefresh} title="새로고침" style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCw size={12} />
          </button>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div ref={containerRef} style={{ flex: 1, background: '#13141a', borderRadius: '10px', border: '1px solid #1f2029', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!isPlaying ? (
            /* Preview mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
              <MonitorPlay size={44} color="#374151" style={{ marginBottom: '14px' }} />
              <p style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '320px', lineHeight: '1.6', marginBottom: '16px' }}>
                총 <strong style={{ color: '#f59e0b' }}>{slides.length}장</strong>의 슬라이드가 생성됐습니다.
                {slides.length > 0 && ` (표지 ${slides.filter(s=>s.slideType==='cover').length} · 챕터 ${slides.filter(s=>s.slideType==='chapter').length} · 콘텐츠 ${slides.filter(s=>s.slideType==='content').length})`}
              </p>
              {/* Thumbnails */}
              {slides.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px', maxWidth: '520px' }}>
                  {slides.slice(0, 16).map((s, i) => (
                    <div key={i} onClick={() => { setSlideIdx(i); setIsPlaying(true); }}
                      style={{ width: '72px', height: '44px', background: s.slideType==='cover' ? 'linear-gradient(135deg,#1e1b4b,#4338ca)' : s.slideType==='chapter' ? 'linear-gradient(135deg,#18181b,#3f3f46)' : '#1c1d24', border: '1px solid #2e303e', borderRadius: '5px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ fontSize: '7px', color: '#9ca3af', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', padding: '0 2px' }}>{s.title}</div>
                      <div style={{ position: 'absolute', bottom: '2px', right: '3px', fontSize: '6px', color: '#4b5563' }}>{i+1}</div>
                    </div>
                  ))}
                  {slides.length > 16 && <div style={{ fontSize: '9px', color: '#6b7280', alignSelf: 'center' }}>+{slides.length-16}장 더</div>}
                </div>
              )}
              <button onClick={() => setIsPlaying(true)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Play size={15} /> 슬라이드쇼 시작
              </button>
            </div>
          ) : (
            /* Presentation mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090a0f', color: '#fff', position: 'relative' }}>
              {/* Top controls */}
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '8px', zIndex: 10 }}>
                <button onClick={() => setShowToc(p=>!p)} style={btnStyle}>목차</button>
                <button onClick={toggleFs} style={btnStyle}>{isFullscreen ? '창 모드' : '전체보기'}</button>
                <button onClick={() => { setIsPlaying(false); if (document.fullscreenElement) document.exitFullscreen(); }} style={btnStyle}>종료 (Esc)</button>
              </div>

              {/* TOC panel */}
              {showToc && (
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '180px', background: 'rgba(9,10,15,0.96)', borderRight: '1px solid #1f2029', zIndex: 20, overflowY: 'auto', padding: '48px 8px 8px' }}>
                  {slides.map((s, i) => (
                    <div key={i} onClick={() => { setSlideIdx(i); setShowToc(false); }}
                      style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px', background: i===slideIdx ? 'rgba(245,158,11,0.15)' : 'transparent', borderLeft: i===slideIdx ? '2px solid #f59e0b' : '2px solid transparent' }}>
                      <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '2px' }}>{i+1} · {s.slideType==='cover' ? '표지' : s.slideType==='chapter' ? `Ch.${s.chapterNum}` : '내용'}</div>
                      <div style={{ fontSize: '10px', color: i===slideIdx ? '#f59e0b' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: i===slideIdx ? 'bold' : 'normal' }}>{s.title}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide body */}
              <div style={{ flex: 1, display: 'flex', padding: '48px', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', marginLeft: showToc ? '180px' : 0, transition: 'margin 0.2s' }}>
                {slides[slideIdx] ? renderSlide(slides[slideIdx]) : <div style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>슬라이드 없음</div>}
              </div>

              {/* Bottom navigation */}
              <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', background: '#0e0f14', borderTop: '1px solid #1f2029', flexShrink: 0 }}>
                <button disabled={slideIdx===0} onClick={() => setSlideIdx(p=>Math.max(0,p-1))}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '50%', cursor: slideIdx===0?'not-allowed':'pointer', opacity: slideIdx===0?0.3:1, display: 'flex' }}>
                  <ChevronLeft size={16} />
                </button>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', maxWidth: '260px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {slides.map((_, i) => (
                    <div key={i} onClick={() => setSlideIdx(i)}
                      style={{ width: i===slideIdx?'20px':'6px', height: '6px', borderRadius: '3px', background: i===slideIdx?'#f59e0b':'#3f3f46', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>{slideIdx+1} / {slides.length}</span>
                <button disabled={slideIdx===slides.length-1} onClick={() => setSlideIdx(p=>Math.min(slides.length-1,p+1))}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '50%', cursor: slideIdx===slides.length-1?'not-allowed':'pointer', opacity: slideIdx===slides.length-1?0.3:1, display: 'flex' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
