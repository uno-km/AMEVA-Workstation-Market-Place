import React, { useState, useEffect, useRef } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize, Play, RotateCw, Download } from 'lucide-react';

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  depth: number;
}

interface MindMapEdge {
  source: string;
  target: string;
}

export function MindMapPlugin() {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<MindMapEdge[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Extract plain text from block content
  const getBlockText = (block: any): string => {
    if (typeof block.content === 'string') return block.content;
    if (Array.isArray(block.content)) {
      return block.content.map((c: any) => c.text || '').join('');
    }
    return '';
  };

  // Build the hierarchical mind map tree dynamically from active editor document
  const buildMindMap = () => {
    const amevaCore = (window as any).AMEVA_CORE;
    /*
     * [CONTRACT]
     * - AMEVA_CORE 및 내장 editor가 존재할 때만 실제 AST 파싱 및 노드 연산을 수행한다.
     */
    if (!amevaCore || !amevaCore.editor) {
      return { newNodes: [], newEdges: [] };
    }

    const editor = amevaCore.editor;
    const blocks = editor.document || [];
    
    // Extract heading blocks
    const headings = blocks.filter((b: any) => b.type === 'heading');

    if (headings.length === 0) {
      /*
       * [ALGORITHM BRANCH / DECISION]
       * - 헤딩 블록이 없는 경우: 문서 내 단락(paragraph) 블록들 상위 5개를 가져와 리프 노드로 연결한다.
       */
      const paragraphs = blocks.filter((b: any) => b.type === 'paragraph').slice(0, 5);
      if (paragraphs.length === 0) {
        return {
          newNodes: [{ id: 'root', label: '빈 문서 (본문을 작성해보세요)', x: 250, y: 220, depth: 0 }],
          newEdges: []
        };
      }
      
      const newNodes: MindMapNode[] = [{ id: 'root', label: '문서 개요', x: 250, y: 220, depth: 0 }];
      const newEdges: MindMapEdge[] = [];
      
      paragraphs.forEach((p: any, idx: number) => {
        const text = getBlockText(p).slice(0, 16) || `본문 단락 #${idx + 1}`;
        const angle = (idx * 2 * Math.PI) / paragraphs.length;
        const x = 250 + 130 * Math.cos(angle);
        const y = 220 + 130 * Math.sin(angle);
        newNodes.push({ id: p.id, label: text, x, y, depth: 1 });
        newEdges.push({ source: 'root', target: p.id });
      });
      return { newNodes, newEdges };
    }

    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `h1s`, `h2s`, `h3s`
     * - 시나리오: 각 헤딩 블록을 level 크기에 따라 분류하여 H1 -> H2 -> H3 계층구조로 트리를 생성한다.
     */
    const h1s = headings.filter((h: any) => h.props?.level === 1);
    const h2s = headings.filter((h: any) => h.props?.level === 2);
    const h3s = headings.filter((h: any) => h.props?.level === 3);

    const newNodes: MindMapNode[] = [];
    const newEdges: MindMapEdge[] = [];
    
    // SVG center point
    const centerX = 250;
    const centerY = 220;

    let rootId = 'root';
    let rootLabel = '문서 제목';
    
    if (h1s.length > 0) {
      rootId = h1s[0].id;
      rootLabel = getBlockText(h1s[0]).slice(0, 18);
    } else if (headings.length > 0) {
      rootId = headings[0].id;
      rootLabel = getBlockText(headings[0]).slice(0, 18);
    }

    newNodes.push({ id: rootId, label: rootLabel, x: centerX, y: centerY, depth: 0 });

    const l1Headings = h1s.length > 0 ? h2s : headings.filter((h: any) => h.id !== rootId && h.props?.level === 2);
    const l2Headings = h1s.length > 0 ? h3s : headings.filter((h: any) => h.id !== rootId && h.props?.level === 3);

    if (l1Headings.length > 0) {
      l1Headings.forEach((h: any, idx: number) => {
        const angle = (idx * 2 * Math.PI) / l1Headings.length;
        const x = centerX + 150 * Math.cos(angle);
        const y = centerY + 150 * Math.sin(angle);
        
        newNodes.push({ id: h.id, label: getBlockText(h).slice(0, 15), x, y, depth: 1 });
        newEdges.push({ source: rootId, target: h.id });

        // Find H3 items under this H2
        const currentIndex = headings.findIndex((x: any) => x.id === h.id);
        const nextL1Index = headings.findIndex((x: any, i: number) => i > currentIndex && l1Headings.some((l: any) => l.id === x.id));
        const limitIndex = nextL1Index !== -1 ? nextL1Index : headings.length;
        
        const subHeadings = headings.slice(currentIndex + 1, limitIndex).filter((x: any) => l2Headings.some((l: any) => l.id === x.id));

        if (subHeadings.length > 0) {
          subHeadings.forEach((sub: any, subIdx: number) => {
            const spread = Math.PI / 2.5; // Spread arc (around 72 deg)
            const subAngle = angle + (subIdx - (subHeadings.length - 1) / 2) * (spread / Math.max(1, subHeadings.length - 1));
            const subX = x + 90 * Math.cos(subAngle);
            const subY = y + 90 * Math.sin(subAngle);
            newNodes.push({ id: sub.id, label: getBlockText(sub).slice(0, 12), x: subX, y: subY, depth: 2 });
            newEdges.push({ source: h.id, target: sub.id });
          });
        }
      });
    }

    return { newNodes, newEdges };
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
      setIsGenerating(false);
    }, 400);
  };

  // Sync / Listen to Editor changes reactively using global keyup/mouseup hooks
  useEffect(() => {
    const handleEvents = () => {
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
    };

    window.addEventListener('keyup', handleEvents);
    window.addEventListener('mouseup', handleEvents);
    
    // Initial run
    handleEvents();

    return () => {
      window.removeEventListener('keyup', handleEvents);
      window.removeEventListener('mouseup', handleEvents);
    };
  }, []);

  // Jump editor cursor and focus to corresponding block in editor
  const handleNodeClick = (nodeId: string) => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (amevaCore && amevaCore.editor && nodeId !== 'root') {
      try {
        amevaCore.editor.setTextCursorPosition(nodeId, 'start');
        amevaCore.editor.focus();
      } catch (e) {
        console.error('[MindMapPlugin] Failed to focus editor block:', e);
      }
    }
  };

  // Panning/Zooming handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drag
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom(z => Math.min(2.5, z + 0.15));
  const zoomOut = () => setZoom(z => Math.max(0.5, z - 0.15));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export Mind Map SVG as file
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `mindmap-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('[MindMapPlugin] Failed to download SVG:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <Network size={16} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', color: '#fff' }}>마인드맵 분석기</h2>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>문서 구조를 인식해 계층적 노드 맵으로 시각화</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
        
        {/* Graph canvas container */}
        <div 
          style={{ 
            flex: 1, 
            background: '#13141a', 
            borderRadius: '10px', 
            border: '1px solid #1f2029', 
            overflow: 'hidden', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom/Download floating buttons */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '6px', zIndex: 10 }}>
            <button title="확대" onClick={zoomIn} style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={14}/></button>
            <button title="축소" onClick={zoomOut} style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomOut size={14}/></button>
            <button title="초기화" onClick={resetZoom} style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Maximize size={14}/></button>
            <button title="SVG 내보내기" onClick={handleDownloadSVG} style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#10b981', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={14}/></button>
            <button title="마인드맵 갱신" onClick={handleGenerate} style={{ background: '#1a1b23', border: '1px solid #2e303e', color: '#a78bfa', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCw size={13}/></button>
          </div>

          {nodes.length === 0 || (nodes.length === 1 && nodes[0].id === 'root' && nodes[0].label.includes('빈 문서')) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
              <Network size={44} color="#374151" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '240px', lineHeight: '1.5', marginBottom: '12px' }}>
                에디터에 제목(H1 ~ H3) 또는 문장들을 작성하시면 입체적인 마인드맵 분석 구조가 실시간 생성됩니다.
              </p>
              <button onClick={handleGenerate} disabled={isGenerating} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: isGenerating ? 'not-allowed' : 'pointer' }}>
                {isGenerating ? '갱신 중...' : <><Play size={12}/> 마인드맵 로드</>}
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                style={{ background: '#13141a' }}
              >
                {/* SVG Transformation Group for Zoom & Pan */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Draw connection lines */}
                  {edges.map((e, i) => {
                    const src = nodes.find(n => n.id === e.source);
                    const tgt = nodes.find(n => n.id === e.target);
                    if (!src || !tgt) return null;
                    return (
                      <path 
                        key={i}
                        d={`M ${src.x} ${src.y} Q ${(src.x + tgt.x) / 2} ${(src.y + tgt.y) / 2 + 10}, ${tgt.x} ${tgt.y}`}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.25)" 
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                      />
                    );
                  })}
                  
                  {/* Draw nodes */}
                  {nodes.map(n => {
                    const isRoot = n.depth === 0;
                    const isLevel1 = n.depth === 1;
                    
                    const fill = isRoot ? 'rgba(16, 185, 129, 0.15)' : isLevel1 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 30, 35, 0.7)';
                    const stroke = isRoot ? '#10b981' : isLevel1 ? '#818cf8' : '#4b5563';
                    const textFill = isRoot ? '#34d399' : isLevel1 ? '#a5b4fc' : '#d1d5db';
                    const rx = isRoot ? '18' : '6';
                    
                    return (
                      <g 
                        key={n.id} 
                        transform={`translate(${n.x}, ${n.y})`} 
                        onClick={() => handleNodeClick(n.id)}
                        style={{ cursor: 'pointer' }}
                        title={n.id !== 'root' ? "클릭 시 에디터 본문 해당 구절로 커서 이동" : ""}
                      >
                        <rect 
                          x="-58" 
                          y="-16" 
                          width="116" 
                          height="32" 
                          rx={rx} 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth={isRoot ? '2' : '1'} 
                        />
                        <text 
                          x="0" 
                          y="4" 
                          textAnchor="middle" 
                          fill={textFill} 
                          fontSize="9.5" 
                          fontWeight={isRoot ? 'bold' : 'normal'}
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
