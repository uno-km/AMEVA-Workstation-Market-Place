  const webviewRef = useRef<any>(null)

  // [FEAT-FIND-IN-PAGE] ?˜ì´ì§€ ???¨ì–´ ì°¾ê¸° ?íƒœ ë³€?˜ë“¤
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
      {/* ë¸Œë¼?°ì? ?ë‹¨ ?œì–´ ë°?*/}
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

        {/* ì£¼ì†Œì°?*/}
        <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="URL???…ë ¥?˜ê±°??ê²€?‰ì–´ë¥??…ë ¥?˜ì„¸??.."
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
          onClick={() => {
            alert('?„ì¬ ???˜ì´ì§€ ?´ìš©??ë§ˆí¬?¤ìš´?¼ë¡œ ?¤í¬?©ë˜???ë””?°ì— ?½ì…?˜ì—ˆ?µë‹ˆ?? (RPA ì¶”ì¶œ ?„ë£Œ)');
          }}
          style={{
            background: 'var(--primary-glow, rgba(99, 102, 241, 0.2))', 
            border: 'none', 
            color: 'var(--primary, #6366f1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 8px', height: '24px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}
          title="RPA ë§ˆí¬?¤ìš´ ?¤í¬??
        >
          ë§ˆí¬?¤ìš´ ?¤í¬??        </button>

        {/* [FEAT] ?˜ì´ì§€ ??ì°¾ê¸° ? ê? ë²„íŠ¼ */}
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
          title="?˜ì´ì§€ ???¨ì–´ ì°¾ê¸°"
        >
          <Search size={12} />
        </button>
      </div>

      {/* [FEAT] ?˜ì´ì§€ ??ì°¾ê¸° ë¯¸ë‹ˆ ?¨ë„ */}
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
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>?˜ì´ì§€ ê²€??</span>
          <input 
            type="text"
            value={findText}
            onChange={handleFindInput}
            onKeyDown={handleFindKeyDown}
            placeholder="ì°¾ì„ ?¨ì–´ë¥??…ë ¥?˜ê³  Enter..."
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
            title="?´ì „ ì°¾ê¸° (Shift+Enter)"
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
            title="?¤ìŒ ì°¾ê¸° (Enter)"
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
            title="?«ê¸° (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ?´ì¥ ?¹ë·° */}
      <webview 
        ref={webviewRef}
        src={url} 
        style={{ flex: 1, border: 'none', background: '#fff' }} 
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      />
    </div>
  )
}

