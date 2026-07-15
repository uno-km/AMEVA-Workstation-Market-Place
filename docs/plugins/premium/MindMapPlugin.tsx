// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize, Play, RotateCw, Download, RefreshCw, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, GripVertical } from 'lucide-react';

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

function HeadingInput({ block, onUpdate }: { block: any, onUpdate: (id: string, text: string) => void }) {
  const [val, setVal] = useState('');
  
  const getBlockText = (b: any): string => {
    if (!b) return '';
    if (typeof b.content === 'string') return b.content;
    if (Array.isArray(b.content)) {
      return b.content.map((c: any) => c?.text || '').join('');
    }
    return '';
  };

  useEffect(() => {
    setVal(getBlockText(block));
  }, [block]);

  return (
    <input 
      type="text" 
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onUpdate(block.id, val)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onUpdate(block.id, val);
          (e.target as any).blur();
        }
      }}
      style={{
        flex: 1,
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid transparent',
        color: '#fff',
        fontSize: '11px',
        outline: 'none',
        padding: '2px 4px',
        transition: 'border-color 0.2s',
        minWidth: '50px'
      }}
      onFocus={e => { e.target.style.borderBottomColor = '#10b981'; }}
    />
  );
}

export function MindMapPlugin() {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<MindMapEdge[]>([]);
  const [headingsList, setHeadingsList] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Drag-and-drop state for individual nodes
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const amevaCore = (window as any).AMEVA_CORE;
  const useLLMInference = amevaCore?.useLLMInference;
  const llm = useLLMInference ? useLLMInference() : null;

  // Map viewport pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const isResizing = useRef(false);

  // List Reordering and AI Node Expansion States
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isExpandingNodeId, setIsExpandingNodeId] = useState<string | null>(null);

  const handleListDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleListDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleListDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const targetHeading = headingsList[draggedItemIndex];
    if (!targetHeading) return;
    
    changeOrder(targetHeading.id, String(index + 1));
    setDraggedItemIndex(null);
  };

  const handleAIExpandNode = async (nodeId: string, label: string, level: number) => {
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    if (!llm || !llm.generate) {
      alert('AI 엔진을 사용할 수 없습니다.');
      return;
    }

    setIsExpandingNodeId(nodeId);
    try {
      const prompt = `마인드맵에서 '${label}' 주제(H${level} 레벨)를 확장하기 위해 브레인스토밍을 수행하고 있습니다. 이 주제의 하위 주제 또는 연관된 핵심 아이디어 3개를 리스트 형태로 추천해 주세요. 한국어로 답변해 주세요. 각 연관 아이디어는 한 줄짜리 명사형 문장으로 간결하게 답변해 주세요. 예시:\n1. 하위아이디어 A\n2. 하위아이디어 B\n3. 하위아이디어 C\n\n다른 설명이나 부가적인 말 없이 오직 숫자 번호와 아이디어 제목만 리스트 형태로 답변하세요.`;
      
      const response = await llm.generate(prompt, () => {}, 'You are a helpful mindmap brainstorming assistant.');
      
      const lines = response.split('\n').map(l => l.trim()).filter(l => /^\d+\./.test(l));
      let ideas = lines.map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).slice(0, 3);
      
      if (ideas.length === 0) {
        const genericLines = response.split('\n').map(l => l.trim().replace(/^[-*•\d.]\s*/, '')).filter(Boolean);
        ideas = genericLines.slice(0, 3);
      }

      if (ideas.length > 0) {
        const nextLevel = Math.min(3, level + 1);
        const newBlocks = ideas.map(idea => ({
          type: 'heading',
          props: { level: nextLevel },
          content: [{ type: 'text', text: idea, styles: {} }]
        }));

        const doc = editor.document;
        const parentIndex = doc.findIndex((b: any) => b.id === nodeId);
        if (parentIndex !== -1) {
          const parentHeading = doc[parentIndex];
          const section = getSectionBlocks(parentHeading, doc);
          const lastBlockOfSection = section[section.length - 1];
          editor.insertBlocks(newBlocks, lastBlockOfSection.id, 'after');
        } else {
          editor.insertBlocks(newBlocks, doc[doc.length - 1].id, 'after');
        }

        setTimeout(() => {
          const { newNodes, newEdges } = buildMindMap();
          setNodes(newNodes);
          setEdges(newEdges);
          setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
        }, 100);
      } else {
        alert('AI가 연관 아이디어를 제안하지 못했습니다. 다시 시도해 주세요.');
      }
    } catch (err: any) {
      console.error('[MindMapPlugin] AI Expansion failed:', err);
      alert(`AI 확장 실패: ${err.message || err}`);
    } finally {
      setIsExpandingNodeId(null);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX - 24;
    if (newWidth > 180 && newWidth < 900) {
      setRightPanelWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Extract plain text from block content safely
  const getBlockText = (block: any): string => {
    if (!block) return '';
    if (typeof block.content === 'string') return block.content;
    if (Array.isArray(block.content)) {
      return block.content.map((c: any) => c?.text || '').join('');
    }
    return '';
  };

  // Helper to fetch persistent node coordinates from localStorage
  const getNodeCoordinates = (nodeId: string, defaultX: number, defaultY: number): { x: number; y: number } => {
    const amevaCore = (window as any).AMEVA_CORE;
    const tabId = amevaCore?.useWorkspaceStore?.getState()?.activeTabId || 'default';
    const cached = localStorage.getItem(`mindmap-pos-${tabId}-${nodeId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      } catch (e) {
        console.error('[MindMapPlugin] Error parsing cached coords:', e);
      }
    }
    return { x: defaultX, y: defaultY };
  };

  // Build the hierarchical mind map tree dynamically from active editor document
  const buildMindMap = () => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) {
      return { newNodes: [], newEdges: [] };
    }

    const editor = amevaCore.editor;
    const blocks = editor.document || [];
    
    // Extract heading blocks
    const headings = blocks.filter((b: any) => b.type === 'heading');

    if (headings.length === 0) {
      const paragraphs = blocks.filter((b: any) => b.type === 'paragraph' && getBlockText(b).trim() !== '').slice(0, 5);
      if (paragraphs.length === 0) {
        return { newNodes: [], newEdges: [] };
      }
      
      const rootCoords = getNodeCoordinates('root', 180, 200);
      const newNodes: MindMapNode[] = [{ id: 'root', label: '문서 개요', x: rootCoords.x, y: rootCoords.y, depth: 0 }];
      const newEdges: MindMapEdge[] = [];
      
      paragraphs.forEach((p: any, idx: number) => {
        const text = getBlockText(p).slice(0, 16) || `본문 단락 #${idx + 1}`;
        const angle = (idx * 2 * Math.PI) / paragraphs.length;
        const defaultX = 180 + 110 * Math.cos(angle);
        const defaultY = 200 + 110 * Math.sin(angle);
        const coords = getNodeCoordinates(p.id, defaultX, defaultY);
        
        newNodes.push({ id: p.id, label: text, x: coords.x, y: coords.y, depth: 1 });
        newEdges.push({ source: 'root', target: p.id });
      });
      return { newNodes, newEdges };
    }

    const h1s = headings.filter((h: any) => h.props?.level === 1);
    
    let rootNodeId = '';
    let rootNodeLabel = '';
    let isVirtualRoot = false;
    let rootLvl = 1;

    if (h1s.length === 1) {
      rootNodeId = h1s[0].id;
      rootNodeLabel = getBlockText(h1s[0]).slice(0, 18);
      isVirtualRoot = false;
      rootLvl = h1s[0].props?.level || 1;
    } else if (h1s.length >= 2) {
      rootNodeId = 'doc-virtual-root';
      rootNodeLabel = '(문서)';
      isVirtualRoot = true;
      rootLvl = 0;
    } else {
      if (headings.length > 0) {
        rootNodeId = headings[0].id;
        rootNodeLabel = getBlockText(headings[0]).slice(0, 18);
        isVirtualRoot = false;
        rootLvl = headings[0].props?.level || 1;
      } else {
        return { newNodes: [], newEdges: [] };
      }
    }

    const newNodes: MindMapNode[] = [];
    const newEdges: MindMapEdge[] = [];
    
    const centerX = 180;
    const centerY = 200;

    const rootCoords = getNodeCoordinates(rootNodeId, centerX, centerY);
    newNodes.push({ 
      id: rootNodeId, 
      label: rootNodeLabel, 
      x: rootCoords.x, 
      y: rootCoords.y, 
      depth: 0 
    });

    const activeParents: Record<number, string> = {
      [rootLvl]: rootNodeId
    };

    const parentToChildren: Record<string, any[]> = {};

    headings.forEach((h: any) => {
      if (!isVirtualRoot && h.id === rootNodeId) return;

      const level = h.props?.level || 1;
      
      let parentId = rootNodeId;
      for (let lvl = level - 1; lvl >= 1; lvl--) {
        if (activeParents[lvl]) {
          parentId = activeParents[lvl];
          break;
        }
      }
      
      if (!parentToChildren[parentId]) {
        parentToChildren[parentId] = [];
      }
      parentToChildren[parentId].push(h);
      
      activeParents[level] = h.id;
      for (let lvl = level + 1; lvl <= 6; lvl++) {
        delete activeParents[lvl];
      }
    });

    const layoutQueue: Array<{ id: string; x: number; y: number; angle: number; depth: number }> = [
      { id: rootNodeId, x: rootCoords.x, y: rootCoords.y, angle: 0, depth: 0 }
    ];

    while (layoutQueue.length > 0) {
      const current = layoutQueue.shift()!;
      const children = parentToChildren[current.id] || [];
      if (children.length === 0) continue;

      children.forEach((child, idx) => {
        let childAngle = 0;
        let distance = 80;

        if (current.id === rootNodeId) {
          childAngle = (idx * 2 * Math.PI) / children.length;
          distance = 110;
        } else {
          const parentAngle = current.angle;
          const spread = Math.PI / 2.5;
          childAngle = children.length === 1 
            ? parentAngle 
            : parentAngle + (idx - (children.length - 1) / 2) * (spread / (children.length - 1));
          distance = 80;
        }

        const defaultX = current.x + distance * Math.cos(childAngle);
        const defaultY = current.y + distance * Math.sin(childAngle);
        const coords = getNodeCoordinates(child.id, defaultX, defaultY);

        newNodes.push({
          id: child.id,
          label: getBlockText(child).slice(0, 15),
          x: coords.x,
          y: coords.y,
          depth: current.depth + 1
        });

        newEdges.push({
          source: current.id,
          target: child.id
        });

        layoutQueue.push({
          id: child.id,
          x: coords.x,
          y: coords.y,
          angle: childAngle,
          depth: current.depth + 1
        });
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

  // Reset all saved positions back to default layout coordinates
  const handleResetPositions = () => {
    const amevaCore = (window as any).AMEVA_CORE;
    const tabId = amevaCore?.useWorkspaceStore?.getState()?.activeTabId || 'default';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`mindmap-pos-${tabId}-`)) {
        localStorage.removeItem(key);
      }
    }
    const { newNodes, newEdges } = buildMindMap();
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Sync / Listen to Editor changes reactively
  useEffect(() => {
    const handleEvents = (e?: KeyboardEvent | MouseEvent) => {
      // Ignore global keyup/mouseup events originating from inputs/textareas to allow typing in our structure editor
      if (e && e.target && ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA')) {
        return;
      }
      
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
      
      const amevaCore = (window as any).AMEVA_CORE;
      if (amevaCore && amevaCore.editor) {
        const list = (amevaCore.editor.document || []).filter((b: any) => b.type === 'heading');
        setHeadingsList(list);
      }
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
    if (draggedNodeId) return; // Ignore clicks during drag
    const amevaCore = (window as any).AMEVA_CORE;
    if (amevaCore && amevaCore.editor && nodeId !== 'root' && nodeId !== 'doc-virtual-root') {
      try {
        amevaCore.editor.setTextCursorPosition(nodeId, 'start');
        amevaCore.editor.focus();
      } catch (e) {
        console.error('[MindMapPlugin] Failed to focus editor block:', e);
      }
    }
  };

  // Node Drag and Drop Math Handlers
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgMouseX = (e.clientX - rect.left - pan.x) / zoom;
    const svgMouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    const node = nodes.find((n: MindMapNode) => n.id === nodeId);
    if (node) {
      dragOffset.current = {
        x: svgMouseX - node.x,
        y: svgMouseY - node.y
      };
      setDraggedNodeId(nodeId);
    }
  };

  // Viewport Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgMouseX = (e.clientX - rect.left - pan.x) / zoom;
      const svgMouseY = (e.clientY - rect.top - pan.y) / zoom;
      
      const targetX = svgMouseX - dragOffset.current.x;
      const targetY = svgMouseY - dragOffset.current.y;
      
      setNodes((prev: MindMapNode[]) => prev.map((n: MindMapNode) => {
        if (n.id === draggedNodeId) {
          const updated = { ...n, x: targetX, y: targetY };
          const amevaCore = (window as any).AMEVA_CORE;
          const tabId = amevaCore?.useWorkspaceStore?.getState()?.activeTabId || 'default';
          localStorage.setItem(`mindmap-pos-${tabId}-${draggedNodeId}`, JSON.stringify({ x: targetX, y: targetY }));
          return updated;
        }
        return n;
      }));
      return;
    }

    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const zoomIn = () => setZoom((z: number) => Math.min(2.5, z + 0.15));
  const zoomOut = () => setZoom((z: number) => Math.max(0.5, z - 0.15));
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

  // Heading Section Helper
  const getSectionBlocks = (targetHeading: any, doc: any[]) => {
    const targetIndex = doc.findIndex(b => b.id === targetHeading.id);
    if (targetIndex === -1) return [];
    
    const section: any[] = [targetHeading];
    const targetLevel = targetHeading.props?.level || 1;
    
    for (let i = targetIndex + 1; i < doc.length; i++) {
      const b = doc[i];
      if (b.type === 'heading' && (b.props?.level || 1) <= targetLevel) {
        break;
      }
      section.push(b);
    }
    return section;
  };

  const moveNode = (nodeId: string, direction: 'up' | 'down') => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    const doc = [...editor.document];
    
    const headingsInDoc = doc.filter((b: any) => b.type === 'heading');
    const hIdx = headingsInDoc.findIndex((h: any) => h.id === nodeId);
    if (hIdx === -1) return;
    
    const targetHeading = headingsInDoc[hIdx];
    const targetSection = getSectionBlocks(targetHeading, doc);
    const targetIds = new Set(targetSection.map((b: any) => b.id));
    const docWithoutTarget = doc.filter((b: any) => !targetIds.has(b.id));
    
    const targetIndexInDoc = doc.findIndex((b: any) => b.id === targetHeading.id);

    if (direction === 'up') {
      // Find the last heading in docWithoutTarget that lies before targetIndexInDoc
      const prevHeadings = docWithoutTarget.slice(0, targetIndexInDoc).filter((b: any) => b.type === 'heading');
      if (prevHeadings.length === 0) return; // Cannot move up
      
      const prevHeading = prevHeadings[prevHeadings.length - 1];
      const insertIndex = docWithoutTarget.findIndex((b: any) => b.id === prevHeading.id);
      if (insertIndex === -1) return;
      
      const nextDocBlocks = [
        ...docWithoutTarget.slice(0, insertIndex),
        ...targetSection,
        ...docWithoutTarget.slice(insertIndex)
      ];
      editor.replaceBlocks(editor.document, nextDocBlocks);
    } else {
      // Find the first heading in docWithoutTarget that lies after targetIndexInDoc
      const nextHeading = docWithoutTarget.slice(targetIndexInDoc).find((b: any) => b.type === 'heading');
      if (!nextHeading) return; // Cannot move down
      
      const nextHeadingSection = getSectionBlocks(nextHeading, docWithoutTarget);
      if (nextHeadingSection.length === 0) return;
      
      const lastBlockOfNextSection = nextHeadingSection[nextHeadingSection.length - 1];
      const insertIndex = docWithoutTarget.findIndex((b: any) => b.id === lastBlockOfNextSection.id);
      if (insertIndex === -1) return;
      
      const nextDocBlocks = [
        ...docWithoutTarget.slice(0, insertIndex + 1),
        ...targetSection,
        ...docWithoutTarget.slice(insertIndex + 1)
      ];
      editor.replaceBlocks(editor.document, nextDocBlocks);
    }
    
    setTimeout(() => {
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
      setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
    }, 100);
  };

  const changeOrder = (nodeId: string, newOrderVal: string) => {
    const newOrder = parseInt(newOrderVal, 10);
    if (isNaN(newOrder) || newOrder < 1) return;
    
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    const doc = [...editor.document];
    
    const headingsInDoc = doc.filter((b: any) => b.type === 'heading');
    const hIdx = headingsInDoc.findIndex((h: any) => h.id === nodeId);
    if (hIdx === -1) return;
    
    const targetOrderIndex = Math.max(0, Math.min(headingsInDoc.length - 1, newOrder - 1));
    if (hIdx === targetOrderIndex) return;
    
    const targetHeading = headingsInDoc[hIdx];
    const targetSection = getSectionBlocks(targetHeading, doc);
    const targetIds = new Set(targetSection.map((b: any) => b.id));
    const docWithoutTarget = doc.filter((b: any) => !targetIds.has(b.id));
    
    const headingsAfterRemove = docWithoutTarget.filter((b: any) => b.type === 'heading');
    const safeTargetIndex = Math.max(0, Math.min(headingsAfterRemove.length - 1, targetOrderIndex));
    const refHeading = headingsAfterRemove[safeTargetIndex];
    if (!refHeading) return;
    
    let insertIndex;
    if (safeTargetIndex === 0 && targetOrderIndex <= hIdx) {
      insertIndex = docWithoutTarget.findIndex((b: any) => b.id === refHeading.id);
      if (insertIndex === -1) return;
      const nextDocBlocks = [
        ...docWithoutTarget.slice(0, insertIndex),
        ...targetSection,
        ...docWithoutTarget.slice(insertIndex)
      ];
      editor.replaceBlocks(editor.document, nextDocBlocks);
    } else {
      const refHeadingSection = getSectionBlocks(refHeading, docWithoutTarget);
      if (refHeadingSection.length === 0) return;
      const lastBlockOfRefSection = refHeadingSection[refHeadingSection.length - 1];
      insertIndex = docWithoutTarget.findIndex((b: any) => b.id === lastBlockOfRefSection.id);
      if (insertIndex === -1) return;
      const nextDocBlocks = [
        ...docWithoutTarget.slice(0, insertIndex + 1),
        ...targetSection,
        ...docWithoutTarget.slice(insertIndex + 1)
      ];
      editor.replaceBlocks(editor.document, nextDocBlocks);
    }
    
    setTimeout(() => {
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
      setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
    }, 100);
  };

  const addRootNode = () => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    const newBlock = {
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: '새 노드', styles: {} }]
    };
    const doc = editor.document;
    if (doc.length > 0) {
      editor.insertBlocks([newBlock], doc[doc.length - 1].id, 'after');
    } else {
      editor.replaceBlocks([], [newBlock]);
    }
    setTimeout(() => {
      const { newNodes, newEdges } = buildMindMap();
      setNodes(newNodes);
      setEdges(newEdges);
      setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
    }, 100);
  };

  const addSubNode = (parentBlockId: string) => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    const parentBlock = editor.document.find((b: any) => b.id === parentBlockId);
    if (parentBlock) {
      const nextLevel = Math.min(3, (parentBlock.props?.level || 1) + 1);
      const newBlock = {
        type: 'heading',
        props: { level: nextLevel },
        content: [{ type: 'text', text: '새 하위 노드', styles: {} }]
      };
      editor.insertBlocks([newBlock], parentBlockId, 'after');
      setTimeout(() => {
        const { newNodes, newEdges } = buildMindMap();
        setNodes(newNodes);
        setEdges(newEdges);
        setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
      }, 100);
    }
  };

  const deleteNode = (nodeId: string) => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    
    if (window.confirm('이 노드와 하위 본문 단락을 모두 삭제하시겠습니까?')) {
      const doc = [...editor.document];
      const targetHeading = doc.find((b: any) => b.id === nodeId);
      if (!targetHeading) return;
      const targetSection = getSectionBlocks(targetHeading, doc);
      const targetIds = new Set(targetSection.map((b: any) => b.id));
      const nextDocBlocks = doc.filter((b: any) => !targetIds.has(b.id));
      editor.replaceBlocks(editor.document, nextDocBlocks);
      
      setTimeout(() => {
        const { newNodes, newEdges } = buildMindMap();
        setNodes(newNodes);
        setEdges(newEdges);
        setHeadingsList(editor.document.filter((b: any) => b.type === 'heading'));
      }, 100);
    }
  };

  const updateNodeText = (nodeId: string, newText: string) => {
    const amevaCore = (window as any).AMEVA_CORE;
    if (!amevaCore || !amevaCore.editor) return;
    const editor = amevaCore.editor;
    editor.updateBlock(nodeId, { content: [{ type: 'text', text: newText, styles: {} }] });
    
    setNodes((prev: MindMapNode[]) => prev.map((n: MindMapNode) => {
      if (n.id === nodeId) {
        return { ...n, label: newText.slice(0, 15) };
      }
      return n;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <Network size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', color: '#fff' }}>마인드맵 분석기</h2>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>노드를 자유롭게 배치할 수 있으며 위치가 자동 저장됩니다</p>
        </div>
        <button 
          title="노드 배치 기본값 복원" 
          onClick={handleResetPositions} 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#ef4444', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '10px', 
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={10} /> 배치 초기화
        </button>
      </div>

      <div style={{ flex: 1, padding: '12px', display: 'flex', gap: '12px', overflow: 'hidden' }}>
        
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
            <div style={{ flex: 1, position: 'relative', cursor: draggedNodeId ? 'grabbing' : isPanning ? 'grabbing' : 'grab' }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                style={{ background: '#13141a' }}
              >
                {/* SVG Transformation Group for Zoom & Pan */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Draw connection lines */}
                  {edges.map((e: MindMapEdge, i: number) => {
                    const src = nodes.find((n: MindMapNode) => n.id === e.source);
                    const tgt = nodes.find((n: MindMapNode) => n.id === e.target);
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
                  {nodes.map((n: MindMapNode) => {
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
                        onMouseDown={(e: React.MouseEvent) => handleNodeDragStart(e, n.id)}
                        onClick={() => handleNodeClick(n.id)}
                        style={{ cursor: 'pointer' }}
                        title={n.id !== 'root' ? "드래그하여 배치 이동 / 클릭 시 본문 이동" : ""}
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

        {/* Resizable Divider Handle */}
        <div 
          onMouseDown={startResize}
          style={{
            width: '6px',
            cursor: 'col-resize',
            background: 'transparent',
            alignSelf: 'stretch',
            transition: 'background 0.2s',
            zIndex: 10,
            borderRadius: '3px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        />

        {/* Right: Structure Editor Panel */}
        <div style={{
          width: `${rightPanelWidth}px`,
          background: '#13141a',
          borderRadius: '10px',
          border: '1px solid #1f2029',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 12px', background: '#0e0f14', borderBottom: '1px solid #1f2029', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>마인드맵 구조 편집기</span>
            <button 
              onClick={addRootNode}
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', color: '#10b981', padding: '3px 8px', fontSize: '9.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Plus size={10}/> 루트 노드 추가 (#)
            </button>
          </div>
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {headingsList.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>
                구조화된 헤더가 없습니다.<br/>루트 노드 추가 버튼을 누르거나<br/>본문에 # 헤더를 작성하세요.
              </div>
            ) : (
              headingsList.map((h, index) => {
                const level = h.props?.level || 1;
                const indent = (level - 1) * 12;
                const tagColor = level === 1 ? '#a78bfa' : level === 2 ? '#818cf8' : '#34d399';
                const tagBg = level === 1 ? 'rgba(167,139,250,0.1)' : level === 2 ? 'rgba(129,140,248,0.1)' : 'rgba(52,211,153,0.1)';
                
                return (
                  <div 
                    key={h.id} 
                    onDragOver={(e) => handleListDragOver(e, index)}
                    onDrop={(e) => handleListDrop(e, index)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginLeft: `${indent}px`,
                      background: '#1a1b23', 
                      border: '1px solid #2e303e', 
                      borderRadius: '6px', 
                      padding: '4px 6px',
                      gap: '4px',
                      transition: 'all 0.2s',
                      opacity: draggedItemIndex === index ? 0.4 : 1
                    }}
                  >
                    <div
                      draggable={true}
                      onDragStart={(e) => handleListDragStart(e, index)}
                      style={{ cursor: 'grab', display: 'flex', alignItems: 'center', paddingRight: '2px', color: '#4b5563' }}
                      title="드래그하여 순서 변경"
                    >
                      <GripVertical size={12} />
                    </div>

                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 'bold', 
                      color: tagColor, 
                      background: tagBg, 
                      padding: '2px 4px', 
                      borderRadius: '4px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      H{level}
                    </span>
                    
                    <HeadingInput block={h} onUpdate={updateNodeText} />
                    
                    <input 
                      type="text"
                      value={index + 1}
                      onChange={e => changeOrder(h.id, e.target.value)}
                      style={{
                        width: '20px',
                        background: '#0f1015',
                        border: '1px solid #2e303e',
                        borderRadius: '4px',
                        color: '#9ca3af',
                        fontSize: '9.5px',
                        textAlign: 'center',
                        padding: '1px 0',
                        outline: 'none'
                      }}
                      title="순서 입력 (숫자 변경 시 이동)"
                    />
                    
                    <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleAIExpandNode(h.id, getBlockText(h), level)}
                        disabled={isExpandingNodeId !== null}
                        style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '1px' }}
                        title="AI 아이디어 브레인스토밍 확장"
                      >
                        {isExpandingNodeId === h.id ? '⏳' : <Sparkles size={11} />}
                      </button>
                      <button 
                        onClick={() => moveNode(h.id, 'up')}
                        disabled={index === 0}
                        style={{ background: 'transparent', border: 'none', color: index === 0 ? '#4b5563' : '#9ca3af', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '1px' }}
                        title="위로 이동"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button 
                        onClick={() => moveNode(h.id, 'down')}
                        disabled={index === headingsList.length - 1}
                        style={{ background: 'transparent', border: 'none', color: index === headingsList.length - 1 ? '#4b5563' : '#9ca3af', cursor: index === headingsList.length - 1 ? 'not-allowed' : 'pointer', padding: '1px' }}
                        title="아래로 이동"
                      >
                        <ArrowDown size={11} />
                      </button>
                      {level < 3 && (
                        <button 
                          onClick={() => addSubNode(h.id)}
                          style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '1px' }}
                          title="하위 노드 추가"
                        >
                          <Plus size={11} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNode(h.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '1px' }}
                        title="삭제"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
