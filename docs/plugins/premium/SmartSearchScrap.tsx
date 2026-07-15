// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ChevronUp, ChevronDown, X, CheckSquare, Square, FileText } from 'lucide-react'

export default function SmartSearchScrap() {
  const [url, setUrl] = useState('https://google.com')
  const [inputUrl, setInputUrl] = useState('https://google.com')
  const webviewRef = useRef<any>(null)
  const findInputRef = useRef<HTMLInputElement>(null)

  // [FEAT-FIND-IN-PAGE] 페이지 내 단어 찾기 상태 변수들
  const [showFind, setShowFind] = useState(false)
  const [findText, setFindText] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)

  const [scrapedBlocks, setScrapedBlocks] = useState<any[] | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState(false)

  const handleCopyToClipboard = () => {
    if (!scrapedBlocks) return
    const selected = scrapedBlocks.filter(b => b.selected)
    if (selected.length === 0) {
      alert('클립보드에 복사할 문단을 선택해 주세요.')
      return
    }

    let markdown = ''
    const ticks = String.fromCharCode(96, 96, 96)

    selected.forEach((block, index) => {
      if (block.type === 'title') {
        markdown += '# ' + block.text + '\n\n'
      } else if (block.type === 'meta') {
        markdown += '> [!NOTE]\n> ' + block.text + '\n\n'
      } else if (block.type === 'header') {
        markdown += '#'.repeat(block.level || 1) + ' ' + block.text + '\n\n'
      } else if (block.type === 'paragraph') {
        markdown += block.text + '\n\n'
      } else if (block.type === 'image') {
        markdown += '![' + (block.alt || 'image') + '](' + block.text + ')\n\n'
      } else if (block.type === 'list-item') {
        markdown += '* ' + block.text + '\n'
        const nextBlock = selected[index + 1]
        if (!nextBlock || nextBlock.type !== 'list-item') {
          markdown += '\n'
        }
      } else if (block.type === 'code') {
        markdown += ticks + '\n' + block.text + '\n' + ticks + '\n\n'
      }
    })

    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedMsg(true)
      setTimeout(() => setCopiedMsg(false), 2000)
    }).catch(err => {
      console.error('Failed to copy text: ', err)
      alert('클립보드 복사에 실패했습니다.')
    })
  }

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    let targetUrl = inputUrl.trim()
    if (!targetUrl) return

    if (!/^https?:\/\//i.test(targetUrl)) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl
      } else {
        targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(targetUrl)
      }
    }
    setUrl(targetUrl)
    setInputUrl(targetUrl)
    if (webviewRef.current) {
      webviewRef.current.src = targetUrl
    }
  }

  const goBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack()
    }
  }

  const goForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) {
      webviewRef.current.goForward()
    }
  }

  const reload = () => {
    if (webviewRef.current) {
      webviewRef.current.reload()
    }
  }

  const goHome = () => {
    setUrl('https://google.com')
    setInputUrl('https://google.com')
    if (webviewRef.current) {
      webviewRef.current.src = 'https://google.com'
    }
  }

  const startFind = (text: string, forward = true, findNext = false) => {
    if (!text || !webviewRef.current) return
    webviewRef.current.findInPage(text, { forward, findNext })
  }

  const stopFind = () => {
    if (webviewRef.current) {
      webviewRef.current.stopFindInPage('clearSelection')
    }
    setFindText('')
    setCurrentMatch(0)
    setTotalMatches(0)
    setShowFind(false)
  }

  const handleFindInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFindText(val)
    if (val) {
      startFind(val, true, false)
    } else {
      if (webviewRef.current) {
        webviewRef.current.stopFindInPage('clearSelection')
      }
      setCurrentMatch(0)
      setTotalMatches(0)
    }
  }

  const handleFindKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      startFind(findText, !e.shiftKey, true)
    } else if (e.key === 'Escape') {
      stopFind()
    }
  }

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    const handleLoadCommit = (e: any) => {
      if (e.isMainFrame) {
        setInputUrl(e.url)
        setUrl(e.url)
      }
    }

    const handleFoundInPage = (e: any) => {
      if (e.result) {
        setCurrentMatch(e.result.activeMatchOrdinal || 0)
        setTotalMatches(e.result.matches || 0)
      }
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setShowFind(prev => {
          const next = !prev
          if (next) {
            setTimeout(() => {
              findInputRef.current?.focus()
              findInputRef.current?.select()
            }, 50)
          } else {
            if (webviewRef.current) {
              webviewRef.current.stopFindInPage('clearSelection')
            }
          }
          return next
        })
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    webview.addEventListener('load-commit', handleLoadCommit)
    webview.addEventListener('found-in-page', handleFoundInPage)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      webview.removeEventListener('load-commit', handleLoadCommit)
      webview.removeEventListener('found-in-page', handleFoundInPage)
    }
  }, [])

  // [FEAT-RPA-SELECTOR] 선택 컨트롤러 연동 핸들러들
  const toggleBlock = (index: number) => {
    if (!scrapedBlocks) return
    const newBlocks = [...scrapedBlocks]
    newBlocks[index] = { ...newBlocks[index], selected: !newBlocks[index].selected }
    setScrapedBlocks(newBlocks)
  }

  const handleSelectAll = () => {
    if (!scrapedBlocks) return
    setScrapedBlocks(scrapedBlocks.map(b => ({ ...b, selected: true })))
  }

  const handleDeselectAll = () => {
    if (!scrapedBlocks) return
    setScrapedBlocks(scrapedBlocks.map(b => ({ ...b, selected: false })))
  }

  const handleInsertSelected = () => {
    if (!scrapedBlocks) return
    const selected = scrapedBlocks.filter(b => b.selected)
    if (selected.length === 0) {
      alert('본문에 삽입할 문단을 선택해 주세요.')
      return
    }

    let markdown = ''
    const ticks = String.fromCharCode(96, 96, 96)

    selected.forEach((block, index) => {
      if (block.type === 'title') {
        markdown += '# ' + block.text + '\n\n'
      } else if (block.type === 'meta') {
        markdown += '> [!NOTE]\n> ' + block.text + '\n\n'
      } else if (block.type === 'header') {
        markdown += '#'.repeat(block.level || 1) + ' ' + block.text + '\n\n'
      } else if (block.type === 'paragraph') {
        markdown += block.text + '\n\n'
      } else if (block.type === 'image') {
        markdown += '![' + (block.alt || 'image') + '](' + block.text + ')\n\n'
      } else if (block.type === 'list-item') {
        markdown += '* ' + block.text + '\n'
        const nextBlock = selected[index + 1]
        if (!nextBlock || nextBlock.type !== 'list-item') {
          markdown += '\n'
        }
      } else if (block.type === 'code') {
        markdown += ticks + '\n' + block.text + '\n' + ticks + '\n\n'
      }
    })

    window.dispatchEvent(new CustomEvent('app:insert-markdown', {
      detail: { markdownText: markdown }
    }))
    setScrapedBlocks(null)
  }

  const getBadgeBg = (type: string) => {
    switch (type) {
      case 'title': return 'rgba(59, 130, 246, 0.15)'
      case 'meta': return 'rgba(107, 114, 128, 0.15)'
      case 'header': return 'rgba(139, 92, 246, 0.15)'
      case 'paragraph': return 'rgba(16, 185, 129, 0.15)'
      case 'list-item': return 'rgba(245, 158, 11, 0.15)'
      case 'code': return 'rgba(236, 72, 153, 0.15)'
      case 'image': return 'rgba(6, 182, 212, 0.15)'
      default: return 'rgba(255, 255, 255, 0.08)'
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'title': return '#3b82f6'
      case 'meta': return '#9ca3af'
      case 'header': return '#8b5cf6'
      case 'paragraph': return '#10b981'
      case 'list-item': return '#f59e0b'
      case 'code': return '#ec4899'
      case 'image': return '#06b6d4'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
      {/* 브라우저 상단 제어 바 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(22, 22, 26, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <button 
          onClick={goBack}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={13} />
        </button>
        <button 
          onClick={goForward}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowRight size={13} />
        </button>
        <button 
          onClick={reload}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <RotateCw size={12} />
        </button>
        <button 
          onClick={goHome}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Home size={13} />
        </button>

        {/* 주소창 */}
        <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="URL을 입력하거나 검색어를 입력하세요..."
              style={{
                width: '100%',
                padding: '4px 28px 4px 8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '4px',
                color: 'var(--text-main)',
                fontSize: '11px',
                outline: 'none',
                height: '24px',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
            />
            <button 
              type="submit"
              style={{
                position: 'absolute', right: '4px', background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                height: '100%', padding: '0 4px'
              }}
            >
              <Search size={11} />
            </button>
          </div>
        </form>

        <button
          onClick={async () => {
            if (!webviewRef.current || isScraping) return
            setIsScraping(true)
            try {
              const result = await webviewRef.current.executeJavaScript(`
                (() => {
                  const title = document.title || '스크랩한 페이지';
                  const rawUrl = window.location.href;
                  
                  const getCleanUrl = (urlStr) => {
                    try {
                      const urlObj = new URL(urlStr);
                      if (urlObj.hostname.includes('google.com') && urlObj.pathname.includes('/search')) {
                        const q = urlObj.searchParams.get('q');
                        return 'https://www.google.com/search?q=' + encodeURIComponent(q || '');
                      }
                      if (urlObj.hostname.includes('search.naver.com')) {
                        const q = urlObj.searchParams.get('query');
                        return 'https://search.naver.com/search.naver?query=' + encodeURIComponent(q || '');
                      }
                      const cleanParams = new URLSearchParams();
                      urlObj.searchParams.forEach((val, key) => {
                        if (!key.startsWith('utm_') && !['ref', 'fbclid', 'gclid', 'ved', 'ei', 'gs_lcp'].includes(key)) {
                          cleanParams.append(key, val);
                        }
                      });
                      urlObj.search = cleanParams.toString();
                      return urlObj.toString();
                    } catch (e) {
                      return urlStr;
                    }
                  };
                  
                  const cleanUrl = getCleanUrl(rawUrl);
                  
                  const blocks = [];
                  blocks.push({ id: 'title', type: 'title', text: title, selected: true });
                  blocks.push({ id: 'meta', type: 'meta', text: '출처: ' + cleanUrl, selected: true });
                  
                  // iframe 내부 데이터(네이버 블로그 등) 검사기 가동
                  let targetDoc = document;
                  const mainFrame = document.getElementById('mainFrame') || document.querySelector('iframe');
                  if (mainFrame) {
                    try {
                      if (mainFrame.contentDocument) {
                        targetDoc = mainFrame.contentDocument;
                      } else if (mainFrame.contentWindow && mainFrame.contentWindow.document) {
                        targetDoc = mainFrame.contentWindow.document;
                      }
                    } catch (e) {
                      console.warn('Iframe CORS block fallback:', e);
                    }
                  }
                  
                  // CASE 1: Google Search Page Results
                  if (rawUrl.includes('google.com/search')) {
                    const qVal = new URL(rawUrl).searchParams.get('q') || '';
                    document.querySelectorAll('div.g, div.MjjYud').forEach((el, idx) => {
                      const linkEl = el.querySelector('a[href]');
                      const titleEl = el.querySelector('h3');
                      if (linkEl && titleEl) {
                        const titleText = titleEl.innerText.trim();
                        const href = linkEl.getAttribute('href');
                        
                        if (href.startsWith('/') || (href.includes('google.com') && !href.includes('google.com/search'))) return;
                        
                        let snippet = '';
                        const snippetEl = el.querySelector('.VwiC3b, .yGrid, div[style*="line-height:"]');
                        if (snippetEl) {
                          snippet = snippetEl.innerText.trim();
                        } else {
                          const p = el.querySelector('p');
                          if (p) snippet = p.innerText.trim();
                        }
                        
                        if (titleText && href) {
                          blocks.push({
                            id: 'search_' + idx,
                            type: 'list-item',
                            text: titleText + ' (' + href + ')\\n> ' + snippet.replace(/\\n/g, ' '),
                            selected: true
                          });
                        }
                      }
                    });
                    return blocks;
                  }
                  
                  // CASE 2: Naver Search Page Results
                  if (rawUrl.includes('search.naver.com')) {
                    document.querySelectorAll('.news_wrap, .api_ani_send, .blog_box, .bx').forEach((el, idx) => {
                      const titleEl = el.querySelector('.news_tit, .api_txt_lines, .lnk_tit, .title');
                      if (titleEl) {
                        const titleText = titleEl.innerText.trim();
                        const href = titleEl.getAttribute('href') || (titleEl.querySelector('a') && titleEl.querySelector('a').getAttribute('href'));
                        if (!href || href.startsWith('#')) return;
                        
                        let snippet = '';
                        const snippetEl = el.querySelector('.api_txt_dsc, .dsc_txt, .dsc_txt_wrap');
                        if (snippetEl) {
                          snippet = snippetEl.innerText.trim();
                        }
                        
                        if (titleText && href) {
                          blocks.push({
                            id: 'search_' + idx,
                            type: 'list-item',
                            text: titleText + ' (' + href + ')\\n> ' + snippet.replace(/\\n/g, ' '),
                            selected: true
                          });
                        }
                      }
                    });
                    return blocks;
                  }
                  
                  // CASE 3: Standard Web Page Heuristic Readability Mode
                  let bestContainer = targetDoc.body;
                  let maxScore = 0;
                  
                  const candidates = targetDoc.querySelectorAll('article, main, .se-viewer, .se-main-container, #postViewArea, [id*="content"], [id*="main"], [class*="article"], [class*="post"], [class*="content"]');
                  candidates.forEach(el => {
                    const pCount = el.querySelectorAll('p, .se-text-paragraph, [class*="text-paragraph"]').length;
                    const charCount = el.innerText.length;
                    const links = el.querySelectorAll('a');
                    const linkDensity = links.length > 0 ? (links.length / el.querySelectorAll('*').length) : 0;
                    
                    let score = pCount * 15 + (charCount / 100);
                    score = score * (1 - linkDensity);
                    
                    if (score > maxScore) {
                      maxScore = score;
                      bestContainer = el;
                    }
                  });
                  
                  const elements = bestContainer.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, code, img, .se-text-paragraph, .se-title-text, .se-header, .se-section-header');
                  const elementsList = Array.from(elements);
                  let imgCount = 0;
                  
                  elementsList.forEach((el, idx) => {
                    // Skip nested children to avoid duplicate text extraction
                    let parent = el.parentElement;
                    while (parent && parent !== bestContainer) {
                      if (elementsList.includes(parent)) {
                        return;
                      }
                      parent = parent.parentElement;
                    }
                    
                    // Skip if parent is inside header, footer, or navigation
                    let navParent = el.parentElement;
                    while (navParent && navParent !== bestContainer) {
                      const tag = navParent.tagName.toLowerCase();
                      const cls = navParent.className || '';
                      const id = navParent.id || '';
                      if (['nav', 'header', 'footer', 'aside'].includes(tag) || /menu|nav|sidebar|footer/i.test(cls + ' ' + id)) {
                        return;
                      }
                      navParent = navParent.parentElement;
                    }
                    
                    const tag = el.tagName.toLowerCase();
                    const cls = el.className || '';
                    
                    if (tag === 'img') {
                      const src = el.src || el.getAttribute('src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-src');
                      if (src && !src.startsWith('data:') && !src.includes('clear.gif') && !src.includes('static.naver.net') && !src.includes('ssl.pstatic.net') && !src.includes('post.editor.naver.com/sticker')) {
                        const w = el.naturalWidth || el.width || 0;
                        const h = el.naturalHeight || el.height || 0;
                        if (w > 0 && h > 0 && (w < 80 || h < 80)) return;
                        if (cls.includes('sticker') || cls.includes('profile') || src.includes('sticker') || src.includes('emoji')) return;

                        imgCount++;
                        // Heuristic: Uncheck the second image specifically (often repeated thumbnail/intro banner)
                        const isSelected = imgCount !== 2;
                        blocks.push({ id: 'img_' + idx, type: 'image', text: src, selected: isSelected });
                      }
                      return;
                    }

                    const text = el.innerText.trim();
                    if (!text || text.length < 3) return;
                    
                    if (tag.startsWith('h') || cls.includes('se-header') || cls.includes('se-section-header') || cls.includes('se-title-text')) {
                      const level = tag.startsWith('h') ? (Math.min(6, parseInt(tag[1], 10) || 1)) : 2;
                      blocks.push({ id: 'h_' + idx, type: 'header', level, text, selected: true });
                    } else if (tag === 'p' || cls.includes('se-text-paragraph')) {
                      blocks.push({ id: 'p_' + idx, type: 'paragraph', text, selected: true });
                    } else if (tag === 'li') {
                      blocks.push({ id: 'li_' + idx, type: 'list-item', text, selected: true });
                    } else if (tag === 'pre' || tag === 'code') {
                      blocks.push({ id: 'c_' + idx, type: 'code', text, selected: true });
                    }
                  });
                  
                  if (blocks.length <= 2) {
                    // 기상천외한 사이트 대응용 초강력 유니버셜 텍스트 세그먼터 가동
                    const bodyText = targetDoc.body.innerText || '';
                    const rawLines = bodyText.split('\\n');
                    const filteredLines = [];
                    
                    rawLines.forEach(line => {
                      const text = line.trim();
                      if (!text || text.length < 15) return;
                      if (/로그인|로그아웃|회원가입|My 블로그|이웃추가|공유하기|신고하기|맨 위로|맨위로|목록보기|글쓰기|PC버전|이용약관|개인정보|고객센터|Copyright|All rights reserved/i.test(text)) {
                        return;
                      }
                      filteredLines.push(text);
                    });
                    
                    const finalLines = [];
                    filteredLines.forEach(line => {
                      if (finalLines.length === 0 || finalLines[finalLines.length - 1] !== line) {
                        finalLines.push(line);
                      }
                    });
                    
                    finalLines.forEach((line, idx) => {
                      blocks.push({
                        id: 'fallback_' + idx,
                        type: 'paragraph',
                        text: line,
                        selected: true
                      });
                    });
                  }
                  
                  return blocks;
                })()
              `)

              if (Array.isArray(result) && result.length > 0) {
                setScrapedBlocks(result)
              } else {
                alert('추출할 콘텐츠를 찾지 못했습니다.')
              }
            } catch (err: any) {
              console.error('RPA 스크랩 실패:', err)
              alert('웹 페이지 내용을 스크랩하는데 실패했습니다: ' + String(err))
            } finally {
              setIsScraping(false)
            }
          }}
          disabled={isScraping}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', 
            color: '#fff',
            cursor: isScraping ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 10px', height: '24px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
            opacity: isScraping ? 0.7 : 1,
            transition: 'opacity 0.2s ease',
          }}
          title="RPA 마크다운 스크랩"
        >
          {isScraping ? '추출 분석 중...' : '마크다운 스크랩'}
        </button>

        {/* [FEAT] 페이지 내 찾기 토글 버튼 */}
        <button 
          onClick={() => {
            if (showFind) {
              stopFind()
            } else {
              setShowFind(true)
              setTimeout(() => {
                findInputRef.current?.focus()
                findInputRef.current?.select()
              }, 50)
            }
          }}
          style={{
            background: showFind ? 'var(--primary-glow, rgba(99, 102, 241, 0.2))' : 'transparent', 
            border: 'none', 
            color: showFind ? 'var(--primary, #6366f1)' : 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '4px'
          }}
          onMouseEnter={e => !showFind && (e.currentTarget.style.background = 'var(--bg-glass-active)')}
          onMouseLeave={e => !showFind && (e.currentTarget.style.background = 'transparent')}
          title="페이지 내 단어 찾기 (Ctrl+F)"
        >
          <Search size={12} />
        </button>
      </div>

      {/* [FEAT] 페이지 내 찾기 미니 패널 */}
      {showFind && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-glass, rgba(30, 30, 35, 0.85))',
            borderBottom: '1px solid var(--border-muted)',
            backdropFilter: 'blur(8px)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>페이지 검색</span>
          <input 
            ref={findInputRef}
            type="text"
            value={findText}
            onChange={handleFindInput}
            onKeyDown={handleFindKeyDown}
            placeholder="찾을 단어를 입력하고 Enter..."
            autoFocus
            style={{
              flex: 1,
              padding: '3px 8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-muted)',
              borderRadius: '4px',
              color: 'var(--text-main)',
              fontSize: '11px',
              outline: 'none',
              height: '22px'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
            {totalMatches > 0 ? `${currentMatch}/${totalMatches}` : '0/0'}
          </span>
          <button 
            onClick={() => startFind(findText, false, true)}
            disabled={!findText}
            style={{
              background: 'transparent', border: 'none', color: findText ? 'var(--text-main)' : 'var(--text-muted)',
              cursor: findText ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '4px'
            }}
            onMouseEnter={e => findText && (e.currentTarget.style.background = 'var(--bg-glass-active)')}
            onMouseLeave={e => findText && (e.currentTarget.style.background = 'transparent')}
            title="이전 찾기 (Shift+Enter)"
          >
            <ChevronUp size={13} />
          </button>
          <button 
            onClick={() => startFind(findText, true, true)}
            disabled={!findText}
            style={{
              background: 'transparent', border: 'none', color: findText ? 'var(--text-main)' : 'var(--text-muted)',
              cursor: findText ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '4px'
            }}
            onMouseEnter={e => findText && (e.currentTarget.style.background = 'var(--bg-glass-active)')}
            onMouseLeave={e => findText && (e.currentTarget.style.background = 'transparent')}
            title="다음 찾기 (Enter)"
          >
            <ChevronDown size={13} />
          </button>
          <button 
            onClick={stopFind}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-active)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="닫기 (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 내장 웹뷰 */}
      <webview 
        ref={webviewRef}
        src={url} 
        style={{ flex: 1, border: 'none', background: '#fff' }} 
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      />

      {/* [FEAT-RPA-SELECTOR] 추출 분석본 실시간 선택 패널 */}
      {scrapedBlocks && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '62%',
          background: 'var(--bg-deep, #0b0c10)',
          borderTop: '2px solid var(--primary, #10b981)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(16px)',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          animation: 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* 패널 헤더 바 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-muted)',
            background: 'rgba(255, 255, 255, 0.01)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={12} color="var(--primary)" /> RPA 추출 콘텐츠 맞춤 필터링
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>본문에 삽입하고 싶은 단락들을 골라서 체크해 주세요.</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={handleSelectAll} 
                style={{ 
                  padding: '3px 8px', fontSize: '10px', borderRadius: '4px', 
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-muted)', 
                  color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                전체 선택
              </button>
              <button 
                onClick={handleDeselectAll} 
                style={{ 
                  padding: '3px 8px', fontSize: '10px', borderRadius: '4px', 
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-muted)', 
                  color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                전체 해제
              </button>
              <button 
                onClick={handleCopyToClipboard} 
                style={{ 
                  padding: '3px 12px', fontSize: '10px', borderRadius: '4px', 
                  background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', 
                  color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', 
                  transition: 'background 0.2s', marginRight: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
              >
                {copiedMsg ? '복사 완료! ✓' : '저장 (클립보드 복사)'}
              </button>
              <button 
                onClick={handleInsertSelected} 
                style={{ 
                  padding: '3px 12px', fontSize: '10px', borderRadius: '4px', 
                  background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', 
                  color: '#fff', fontWeight: 'bold', cursor: 'pointer', 
                  boxShadow: '0 2px 6px rgba(16,185,129,0.3)', transition: 'transform 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                선택 본문 삽입
              </button>
              <button 
                onClick={() => setScrapedBlocks(null)} 
                style={{ 
                  padding: '3px 8px', fontSize: '10px', borderRadius: '4px', 
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', 
                  color: '#ef4444', cursor: 'pointer', transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                취소
              </button>
            </div>
          </div>

          {/* 스크롤 가능한 단락 리스트 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scrapedBlocks.map((block, idx) => (
              <div 
                key={block.id || idx} 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: block.selected ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: block.selected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                }} 
                onClick={() => toggleBlock(idx)}
                onMouseEnter={e => {
                  if (!block.selected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={e => {
                  if (!block.selected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                {/* 커스텀 체크박스 아이콘 */}
                <div style={{ marginTop: '2px', color: block.selected ? 'var(--primary, #10b981)' : 'var(--text-muted)' }}>
                  {block.selected ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '8px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: getBadgeBg(block.type),
                      color: getBadgeColor(block.type),
                      fontWeight: 'bold',
                      letterSpacing: '0.05em'
                    }}>{block.type.toUpperCase()}</span>
                    {block.type === 'header' && <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500 }}>Level {block.level}</span>}
                  </div>
                  {block.type === 'image' ? (
                    <div style={{ marginTop: '6px', borderRadius: '4px', overflow: 'hidden', maxWidth: '200px', border: '1px solid var(--border-muted, rgba(255,255,255,0.08))' }}>
                      <img src={block.text} alt="preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '120px', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: block.selected ? 'var(--text-main)' : 'var(--text-muted)', wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {block.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
