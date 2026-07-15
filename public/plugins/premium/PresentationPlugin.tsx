// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MonitorPlay, Play, ChevronLeft, ChevronRight, Maximize2, RotateCw } from 'lucide-react';

interface SlideElement {
  type: 'paragraph' | 'bullet' | 'image' | 'code' | 'map' | 'youtube' | 'link' | 'table';
  text?: string;
  url?: string;
  code?: string;
  language?: string;
  lat?: string;
  lng?: string;
  locationName?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  tableRows?: any[];
}

interface Slide {
  title: string;
  parentTitle: string;
  elements: SlideElement[];
  score: number;
}

export function PresentationPlugin() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  // Extract text from block content safely
  const getBlockText = (block: any): string => {
    if (!block) return '';
    if (typeof block.content === 'string') return block.content;
    if (Array.isArray(block.content)) {
      return block.content.map((c: any) => c?.text || '').join('');
    }
    return '';
  };

  // Convert table cells into simple text array
  const parseTableRows = (block: any): any[] => {
    if (!block || !block.content) return [];
    if (Array.isArray(block.content)) {
      return block.content; // expected matrix structure [[cell1, cell2], ...]
    }
    return [];
  };

  // Build the intelligent, space-calculated, block-aware PPT slides
  const buildSlides = () => {
    const amevaCore = (window as any).AMEVA_CORE;
    /*
     * [CONTRACT]
     * - AMEVA_CORE 및 내장 editor가 존재할 때만 실시간 파싱 및 연산 스케줄링을 기동한다.
     */
    if (!amevaCore || !amevaCore.editor) {
      return [];
    }

    const editor = amevaCore.editor;
    const blocks = editor.document || [];
    const parsedSlides: Slide[] = [];

    // Try to get filename/document title from workspace store
    let filename = '새 프레젠테이션';
    try {
      if (amevaCore.useWorkspaceStore) {
        const workspace = amevaCore.useWorkspaceStore.getState();
        const filePath = workspace.filePath;
        if (filePath) {
          filename = filePath.split(/[\\/]/).pop()?.replace(/\.md$/, '') || filename;
        } else {
          // If file is not saved, grab the title of the current active tab
          const activeTab = workspace.tabs.find((t: any) => t.id === workspace.activeTabId);
          if (activeTab && activeTab.filePath) {
            filename = activeTab.filePath.split(/[\\/]/).pop()?.replace(/\.md$/, '') || filename;
          }
        }
      }
    } catch (e) {
      console.error('[PresentationPlugin] Error accessing workspace store:', e);
    }

    // Identify headings
    const headings = blocks.filter((b: any) => b.type === 'heading');
    const h1s = headings.filter((h: any) => h.props?.level === 1);

    // ㄱ. 슬라이드 제목 결정 로직
    let coverTitle = filename;
    let skipH1Id = '';

    if (h1s.length === 1) {
      // H1이 단 하나면 표지 슬라이드 제목으로 승격하고, 본문 장표에서는 제외
      coverTitle = getBlockText(h1s[0]) || coverTitle;
      skipH1Id = h1s[0].id;
    }

    // 표지 슬라이드 삽입
    parsedSlides.push({
      title: coverTitle,
      parentTitle: '발표 자료',
      elements: [
        { type: 'paragraph', text: 'AMEVA OS Workstation 실시간 슬라이드쇼' },
        { type: 'paragraph', text: new Date().toLocaleDateString() }
      ],
      score: 30
    });

    let currentSection = '';
    let currentElements: SlideElement[] = [];
    let currentScore = 0;

    // ㄹ. 수학적/휴리스틱 사이즈 고려 한계치 지정
    const MAX_BUDGET = 120;

    const pushCurrentSlide = (titleSuffix = '') => {
      if (currentElements.length > 0) {
        parsedSlides.push({
          title: currentSection || '본문',
          parentTitle: coverTitle + (titleSuffix ? ` > ${titleSuffix}` : ''),
          elements: [...currentElements],
          score: currentScore
        });
        currentElements = [];
        currentScore = 0;
      }
    };

    blocks.forEach((block: any) => {
      if (block.id === skipH1Id) return; // 표지 전용 H1은 본문 파트에서 생략

      const text = getBlockText(block);
      let blockScore = 15;
      let element: SlideElement | null = null;

      // ㄴ. #, ##, ### 단락 분할 기준
      if (block.type === 'heading') {
        const lvl = block.props?.level || 2;
        blockScore = lvl === 1 ? 40 : lvl === 2 ? 30 : 25;

        // 새 헤더 등장 시 기존 슬라이드 방출 후 섹션 타이틀 설정
        pushCurrentSlide();
        currentSection = text || '제목 없는 섹션';
        currentScore = blockScore;
        return;
      }

      // ㄷ. 다양한 내장/프리미엄 커스텀 블록 지원 매핑
      if (block.type === 'paragraph') {
        blockScore = Math.max(15, Math.ceil(text.length / 55) * 15);
        element = { type: 'paragraph', text };
      } else if (block.type === 'bulletListItem' || block.type === 'numberedListItem') {
        blockScore = Math.max(12, Math.ceil(text.length / 55) * 12);
        element = { type: 'bullet', text };
      } else if (block.type === 'image') {
        blockScore = 65;
        element = { type: 'image', url: block.props?.url || '' };
      } else if (block.type === 'codeBlock' || block.type === 'jupyter') {
        blockScore = 75;
        const codeText = block.props?.code || text || '';
        const lang = block.props?.language || 'javascript';
        element = { type: 'code', code: codeText, language: lang };
      } else if (block.type === 'map') {
        blockScore = 80;
        element = {
          type: 'map',
          lat: block.props?.lat || '37.5665',
          lng: block.props?.lng || '126.9780',
          locationName: block.props?.locationName || '서울시'
        };
      } else if (block.type === 'youtube') {
        blockScore = 85;
        element = {
          type: 'youtube',
          url: block.props?.url || '',
          // Extract videoId from YouTube URLs
          title: block.props?.videoId || block.props?.url?.split('v=')?.[1]?.split('&')?.[0] || ''
        };
      } else if (block.type === 'linkPreview') {
        blockScore = 55;
        element = {
          type: 'link',
          url: block.props?.url || '',
          title: block.props?.title || 'Link Preview',
          description: block.props?.description || '',
          thumbnail: block.props?.thumbnail || ''
        };
      } else if (block.type === 'table') {
        blockScore = 75;
        const rows = parseTableRows(block);
        element = { type: 'table', tableRows: rows };
      }

      if (element) {
        // ㄹ. 한 페이지에 너무 많은 정보가 들어가지 않도록 실시간 크기 계산 후 나눔
        if (currentScore + blockScore > MAX_BUDGET) {
          pushCurrentSlide('계속');
        }
        currentElements.push(element);
        currentScore += blockScore;
      }
    });

    // 마지막 남은 누적 요소 방출
    pushCurrentSlide();

    return parsedSlides;
  };

  const handleRefresh = () => {
    const nextSlides = buildSlides();
    setSlides(nextSlides);
    setSlideIdx(0);
  };

  // Sync with Editor key/mouse actions for auto refresh
  useEffect(() => {
    const handleEvents = () => {
      const nextSlides = buildSlides();
      setSlides(nextSlides);
    };

    window.addEventListener('keyup', handleEvents);
    window.addEventListener('mouseup', handleEvents);

    handleEvents();

    return () => {
      window.removeEventListener('keyup', handleEvents);
      window.removeEventListener('mouseup', handleEvents);
    };
  }, []);

  // Keyboard navigation for active slide deck presentation mode
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setSlideIdx((prev: number) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        setSlideIdx((prev: number) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, slides.length]);

  // Helper to render customized layout based on slide elements (split/centered/etc)
  const renderSlideContent = (slide: Slide) => {
    if (!slide) return null;

    // Check if the slide has any complex visual media block (image, map, code, video)
    const mediaEl = slide.elements.find(el => ['image', 'map', 'code', 'youtube', 'table'].includes(el.type));
    const textEls = slide.elements.filter(el => ['paragraph', 'bullet', 'link'].includes(el.type));

    // If both text and complex media exist, render a premium 2-column split screen!
    if (mediaEl && textEls.length > 0) {
      return (
        <div style={{ display: 'flex', width: '100%', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>

          {/* Left Column: Breadcrumb / Section Header / Text */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            {/* ㄴ. 상단 섹션 제목 고정 노출 */}
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
              {slide.parentTitle}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              {slide.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {textEls.map((el, i) => renderElement(el, i))}
            </div>
          </div>

          {/* Right Column: Visual Media Box */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {renderMediaElement(mediaEl)}
          </div>

        </div>
      );
    }

    // Default layout (Centered full-screen layout)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '80%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
          {slide.parentTitle}
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          {slide.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          {slide.elements.map((el, i) => renderElement(el, i))}
        </div>
      </div>
    );
  };

  // Render text elements inside slides
  const renderElement = (el: SlideElement, idx: number) => {
    switch (el.type) {
      case 'paragraph':
        return (
          <p key={idx} style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', margin: 0 }}>
            {el.text}
          </p>
        );
      case 'bullet':
        return (
          <div key={idx} style={{ fontSize: '13px', color: '#e5e7eb', display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'left', lineHeight: '1.6' }}>
            <span style={{ color: '#f59e0b', fontSize: '14px' }}>•</span>
            <span>{el.text}</span>
          </div>
        );
      case 'link':
        return (
          <a key={idx} href={el.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <div style={{ background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '8px', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center', textAlign: 'left' }}>
              {el.thumbnail && <img src={el.thumbnail} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />}
              <div>
                <h4 style={{ fontSize: '11px', color: '#38bdf8', margin: '0 0 4px 0', fontWeight: 'bold' }}>{el.title}</h4>
                <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0 }}>{el.description?.slice(0, 50)}...</p>
              </div>
            </div>
          </a>
        );
      default:
        // Complex media rendered separately in split column
        return renderMediaElement(el);
    }
  };

  // Render complex/rich graphics media elements
  const renderMediaElement = (el: SlideElement) => {
    switch (el.type) {
      case 'image':
        return (
          <img
            src={el.url}
            alt="Slide graphics"
            style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', boxShadow: '0 12px 24px rgba(0,0,0,0.6)', border: '1px solid #1f2029' }}
          />
        );
      case 'map':
        // Real Live Google Maps embed
        return (
          <div style={{ width: '100%', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '8px', padding: '8px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 'bold' }}>Google Maps: {el.locationName}</span>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${el.lat},${el.lng}&z=13&output=embed`}
              width="100%"
              height="180"
              style={{ border: 0, borderRadius: '6px', background: '#000' }}
              allowFullScreen
              title="Google Map embed"
            ></iframe>
          </div>
        );
      case 'youtube':
        // Real Live YouTube player iframe embed
        return (
          <div style={{ width: '100%', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '8px', padding: '8px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 'bold' }}>YouTube Video</span>
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${el.title}`}
              width="100%"
              height="180"
              style={{ border: 0, borderRadius: '6px', background: '#000' }}
              allowFullScreen
              title="YouTube embed player"
            ></iframe>
          </div>
        );
      case 'code':
        return (
          <div style={{ width: '100%', background: '#0d0e12', border: '1px solid #2e303e', borderRadius: '8px', overflow: 'hidden', textAlign: 'left', fontFamily: 'monospace' }}>
            <div style={{ background: '#1a1b23', padding: '6px 12px', display: 'flex', gap: '5px', alignItems: 'center', borderBottom: '1px solid #2e303e' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff5f56' }}></span>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ffbd2e' }}></span>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#27c93f' }}></span>
              <span style={{ fontSize: '8.5px', color: '#6b7280', marginLeft: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>{el.language}</span>
            </div>
            <pre style={{ margin: 0, padding: '12px', overflowX: 'auto', fontSize: '10px', color: '#a78bfa', lineHeight: '1.5' }}>
              <code>{el.code}</code>
            </pre>
          </div>
        );
      case 'table':
        return (
          <div style={{ width: '100%', overflowX: 'auto', background: '#1c1d24', border: '1px solid #2e303e', borderRadius: '8px', padding: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'left' }}>
              <thead>
                <tr>
                  {el.tableRows?.[0] && Object.keys(el.tableRows[0]).map((key, i) => (
                    <th key={i} style={{ borderBottom: '2px solid #2e303e', padding: '6px', color: '#f59e0b', fontWeight: 'bold' }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {el.tableRows?.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val: any, cellIdx) => (
                      <td key={cellIdx} style={{ borderBottom: '1px solid #2e303e', padding: '6px', color: '#d1d5db' }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <MonitorPlay size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', color: '#fff' }}>프레젠테이션 메이커</h2>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>코딩, 지도, 영상 등을 자동으로 최적 비율 배치하는 슬라이드쇼</p>
        </div>
        {!isPlaying && (
          <button
            title="슬라이드 새로고침"
            onClick={handleRefresh}
            style={{
              background: '#1a1b23',
              border: '1px solid #2e303e',
              color: '#9ca3af',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RotateCw size={13} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>

        {/* Presentation canvas container */}
        <div style={{ flex: 1, background: '#13141a', borderRadius: '10px', border: '1px solid #1f2029', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!isPlaying ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
              <MonitorPlay size={44} color="#374151" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '260px', lineHeight: '1.5', marginBottom: '12px' }}>
                문서에서 분석된 컴포넌트(지도, 코드, 영상, 리스트 등) 크기를 고려해 총 **{slides.length}장**의 맞춤형 슬라이드를 연산 생성했습니다.
              </p>
              <button
                onClick={() => setIsPlaying(true)}
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Play size={14} /> 슬라이드쇼 시작
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090a0f', color: '#fff', position: 'relative' }}>

              {/* Slide controls top header */}
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '8px', zIndex: 10 }}>
                <button
                  onClick={() => setIsPlaying(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  종료 (Esc)
                </button>
              </div>

              {/* Slide central display body */}
              <div style={{ flex: 1, display: 'flex', padding: '32px', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {slides[slideIdx] ? renderSlideContent(slides[slideIdx]) : (
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>슬라이드 정보가 존재하지 않습니다.</div>
                )}
              </div>

              {/* Bottom paging section */}
              <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e0f14', borderTop: '1px solid #1f2029' }}>
                <button
                  disabled={slideIdx === 0}
                  onClick={() => setSlideIdx((s: number) => Math.max(0, s - 1))}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: slideIdx === 0 ? 'not-allowed' : 'pointer',
                    opacity: slideIdx === 0 ? 0.3 : 1
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>{slideIdx + 1} / {slides.length}</span>
                <button
                  disabled={slideIdx === slides.length - 1}
                  onClick={() => setSlideIdx((s: number) => Math.min(slides.length - 1, s + 1))}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: slideIdx === slides.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: slideIdx === slides.length - 1 ? 0.3 : 1
                  }}
                >
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
