import React, { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ChevronUp, ChevronDown, X } from 'lucide-react'

export default function AmevaBrowserView() {
  const [url, setUrl] = useState('https://google.com')
  const [inputUrl, setInputUrl] = useState('https://google.com')
  const webviewRef = useRef<any>(null)

  // [FEAT-FIND-IN-PAGE] 페이지 내 단어 찾기 상태 변수들
  const [showFind, setShowFind] = useState(false)
  const [findText, setFindText] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)

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
      webviewRef.current.stopFindInPage('clear')
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
        webviewRef.current.stopFindInPage('clear')
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

    webview.addEventListener('load-commit', handleLoadCommit)
    webview.addEventListener('found-in-page', handleFoundInPage)
    return () => {
      webview.removeEventListener('load-commit', handleLoadCommit)
      webview.removeEventListener('found-in-page', handleFoundInPage)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)' }}>
      {/* 브라우저 상단 제어 바 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: '#16161a',
          borderBottom: '1px solid var(--border-muted)',
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
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-muted)',
                borderRadius: '4px',
                color: 'var(--text-main)',
                fontSize: '11px',
                outline: 'none',
                height: '24px'
              }}
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
            /*
             * [CONTRACT]
             * - webviewRef.current가 유효한 경우에만 스크랩 태스크를 기동한다.
             */
            if (!webviewRef.current) return
            try {
              /*
               * [RUN-TIME STATE / INVARIANT]
               * - 변수 명: `result`
               * - 자료형 / 예상 값: string (마크다운 포맷 텍스트)
               * - 시나리오: 일렉트론 웹뷰 인스턴스에 강제로 JavaScript를 주입(executeJavaScript)하여
               *   문서 제목, URL 및 본문의 구조적 요소(h1~h6, p, li, pre)를 수집하여 마크다운 형태로 통합 추출한다.
               */
              const result = await webviewRef.current.executeJavaScript(`
                (() => {
                  const title = document.title || '스크랩한 페이지';
                  const url = window.location.href;
                  
                  let markdown = '# ' + title + '\\n\\n';
                  markdown += '*출처: [' + url + '](' + url + ')*\\n\\n';
                  
                  const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre');
                  let blockCount = 0;
                  
                  elements.forEach(el => {
                    const parent = el.parentElement;
                    if (parent) {
                      const skipRoles = ['navigation', 'banner', 'contentinfo'];
                      const parentRole = parent.getAttribute('role');
                      if (skipRoles.includes(parentRole || '')) return;
                      
                      const skipTags = ['nav', 'header', 'footer', 'aside'];
                      if (skipTags.includes(parent.tagName.toLowerCase())) return;
                    }
                    
                    const tag = el.tagName.toLowerCase();
                    const text = el.innerText.trim();
                    if (!text) return;
                    
                    blockCount++;
                    if (tag.startsWith('h')) {
                      const level = parseInt(tag[1], 10);
                      markdown += '#'.repeat(level) + ' ' + text + '\\n\\n';
                    } else if (tag === 'p') {
                      markdown += text + '\\n\\n';
                    } else if (tag === 'li') {
                      markdown += '* ' + text + '\\n';
                    } else if (tag === 'pre') {
                      markdown += '\\`\\`\\`\\n' + text + '\\n\\`\\`\\`\\n\\n';
                    }
                  });
                  
                  if (blockCount === 0) {
                    markdown += document.body.innerText.trim().slice(0, 1000) + '...\\n';
                  }
                  
                  return markdown;
                })()
              `);
              
              /*
               * [ALGORITHM BRANCH / DECISION]
               * - 조건 식: 수집된 마크다운 결과가 존재하면 전역 창에 app:insert-markdown 이벤트를 브로드캐스트하여 에디터 삽입을 연동한다.
               */
              if (result) {
                window.dispatchEvent(new CustomEvent('app:insert-markdown', {
                  detail: { markdownText: result }
                }));
                alert('현재 웹 페이지 내용이 마크다운으로 스크랩되어 에디터에 삽입되었습니다. (RPA 추출 완료)');
              }
            } catch (err: any) {
              console.error('RPA 스크랩 실패:', err);
              alert('웹 페이지 내용을 스크랩하는데 실패했습니다: ' + String(err));
            }
          }}
          style={{
            background: 'var(--primary-glow, rgba(99, 102, 241, 0.2))', 
            border: 'none', 
            color: 'var(--primary, #6366f1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 8px', height: '24px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}
          title="RPA 마크다운 스크랩"
        >
          마크다운 스크랩
        </button>

        {/* [FEAT] 페이지 내 찾기 토글 버튼 */}
        <button 
          onClick={() => {
            if (showFind) {
              stopFind()
            } else {
              setShowFind(true)
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
          title="페이지 내 단어 찾기"
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
    </div>
  )
}
