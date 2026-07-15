// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Server, Send, Code, Copy, CheckCircle2, Plus, Trash2, AlertTriangle, Key, Layers, Settings, FileJson, Play } from 'lucide-react';

interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export function RestClientPlugin() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/users/1');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'history'>('params');
  const [history, setHistory] = useState<any[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ameva-rest-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load rest history:', e);
    }
  }, []);
  
  // Dynamic parameters & headers
  const [params, setParams] = useState<KeyValuePair[]>([
    { key: '', value: '', enabled: true }
  ]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { key: 'Accept', value: 'application/json', enabled: true },
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  
  // Request Body
  const [requestBody, setRequestBody] = useState('');
  
  // Auth helper state
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic'>('none');
  const [authToken, setAuthToken] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Response states
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState<'body' | 'headers'>('body');

  // Sync Auth State to Headers
  useEffect(() => {
    let newHeaders = headers.filter(h => h.key.toLowerCase() !== 'authorization');
    
    if (authType === 'bearer' && authToken) {
      newHeaders.push({ key: 'Authorization', value: `Bearer ${authToken}`, enabled: true });
    } else if (authType === 'basic' && (authUsername || authPassword)) {
      const credentials = btoa(`${authUsername}:${authPassword}`);
      newHeaders.push({ key: 'Authorization', value: `Basic ${credentials}`, enabled: true });
    }
    
    // Ensure we don't wipe out empty rows if user is typing
    if (newHeaders.length === 0) {
      newHeaders.push({ key: '', value: '', enabled: true });
    }
    setHeaders(newHeaders);
  }, [authType, authToken, authUsername, authPassword]);

  // Sync URL to Params on initial load and when URL changes manually
  const parseUrlParams = (targetUrl: string) => {
    try {
      const urlObj = new URL(targetUrl);
      const searchParams = Array.from(urlObj.searchParams.entries());
      if (searchParams.length > 0) {
        const newParams = searchParams.map(([key, value]) => ({ key, value, enabled: true }));
        setParams(newParams);
      }
    } catch (e) {
      // Not a valid absolute URL, ignore
    }
  };

  const updateUrlFromParams = (currentParams: KeyValuePair[]) => {
    try {
      const urlObj = new URL(url);
      urlObj.search = '';
      currentParams.forEach(p => {
        if (p.enabled && p.key) {
          urlObj.searchParams.append(p.key, p.value);
        }
      });
      setUrl(urlObj.toString());
    } catch (e) {
      // URL might be incomplete, ignore
    }
  };

  const handleParamChange = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: val };
    
    // Add new empty row if they type in the last row
    if (index === updated.length - 1 && (field === 'key' || field === 'value') && val !== '') {
      updated.push({ key: '', value: '', enabled: true });
    }
    
    setParams(updated);
    updateUrlFromParams(updated);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: val };
    
    // Add new empty row if they type in the last row
    if (index === updated.length - 1 && (field === 'key' || field === 'value') && val !== '') {
      updated.push({ key: '', value: '', enabled: true });
    }
    
    setHeaders(updated);
  };

  const deleteParam = (index: number) => {
    const updated = params.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({ key: '', value: '', enabled: true });
    }
    setParams(updated);
    updateUrlFromParams(updated);
  };

  const deleteHeader = (index: number) => {
    const updated = headers.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({ key: '', value: '', enabled: true });
    }
    setHeaders(updated);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert('올바른 JSON 형식이 아닙니다.');
    }
  };

  const handleSend = async () => {
    if (!url) return;
    setIsLoading(true);
    setResponseBody(null);
    setResponseStatus(null);
    setResponseStatusText(null);
    setResponseHeaders(null);
    setResponseTime(null);
    setResponseSize(null);

    const startTime = performance.now();

    // Prepare headers object
    const reqHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key) {
        reqHeaders[h.key] = h.value;
      }
    });

    try {
      let result;
      // Use IPC request to bypass CORS if available
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.httpRequest) {
        result = await electronAPI.httpRequest({
          url,
          method,
          headers: reqHeaders,
          body: ['GET', 'HEAD'].includes(method) ? undefined : requestBody
        });
      } else {
        // Fallback to normal fetch
        const response = await fetch(url, {
          method,
          headers: reqHeaders,
          body: ['GET', 'HEAD'].includes(method) ? undefined : requestBody
        });
        const bodyText = await response.text();
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val;
        });
        result = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: bodyText
        };
      }

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      if (result.success) {
        setResponseStatus(result.status);
        setResponseStatusText(result.statusText);
        setResponseHeaders(result.headers || {});
        
        // Format if JSON
        let displayBody = result.body;
        try {
          const parsed = JSON.parse(result.body);
          displayBody = JSON.stringify(parsed, null, 2);
        } catch (e) {
          // Keep raw text
        }
        setResponseBody(displayBody);

        // Calculate size
        const bytes = new Blob([result.body]).size;
        if (bytes > 1024) {
          setResponseSize((bytes / 1024).toFixed(2) + ' KB');
        } else {
          setResponseSize(bytes + ' B');
        }
        addHistoryItem(result.status, result.statusText);
      } else {
        setResponseStatus(500);
        setResponseStatusText('Internal Connection Error');
        setResponseBody(result.error || 'API 요청 전송에 실패하였습니다. URL 및 인터넷 연결 상태를 확인해주세요.');
        addHistoryItem(500, 'Internal Connection Error');
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(0);
      setResponseStatusText('Request Failed');
      setResponseBody(err.message || String(err));
      addHistoryItem(0, 'Request Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryItem = (status: number | null, statusText: string | null) => {
    try {
      const newItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        method,
        url,
        params: params.filter(p => p.key !== ''),
        headers: headers.filter(h => h.key !== ''),
        requestBody,
        authType,
        authToken,
        authUsername,
        authPassword,
        status,
        statusText
      };
      setHistory(prev => {
        const next = [newItem, ...prev].slice(0, 50);
        localStorage.setItem('ameva-rest-history', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error('Failed to save history item:', e);
    }
  };

  const handleLoadHistoryItem = (item: any) => {
    setMethod(item.method);
    setUrl(item.url);
    if (item.params) setParams(item.params.length > 0 ? [...item.params, { key: '', value: '', enabled: true }] : [{ key: '', value: '', enabled: true }]);
    if (item.headers) setHeaders(item.headers.length > 0 ? [...item.headers, { key: '', value: '', enabled: true }] : [{ key: '', value: '', enabled: true }]);
    if (item.requestBody !== undefined) setRequestBody(item.requestBody);
    if (item.authType) setAuthType(item.authType);
    if (item.authToken !== undefined) setAuthToken(item.authToken);
    if (item.authUsername !== undefined) setAuthUsername(item.authUsername);
    if (item.authPassword !== undefined) setAuthPassword(item.authPassword);
    alert('이전 API 요청 설정이 편집기에 로드되었습니다!');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('ameva-rest-history', JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    if (window.confirm('모든 API 전송 기록을 삭제하시겠습니까?')) {
      setHistory([]);
      localStorage.removeItem('ameva-rest-history');
    }
  };

  const handleInsert = () => {
    if (!responseBody) return;
    
    // Dispatch custom event to insert block in editor
    const event = new CustomEvent('app:insert-json', {
      detail: { jsonText: responseBody }
    });
    window.dispatchEvent(event);
    
    alert('에디터 커서 다음에 JSON 코드가 삽입되었습니다!');
  };

  const handleCopy = () => {
    if (!responseBody) return;
    try {
      navigator.clipboard.writeText(responseBody)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.warn('Modern clipboard copy failed, using fallback:', err);
          legacyCopyFallback(responseBody);
        });
    } catch (e) {
      console.warn('Modern clipboard API error, using fallback:', e);
      legacyCopyFallback(responseBody);
    }
  };

  const legacyCopyFallback = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        throw new Error('execCommand returned false');
      }
    } catch (err) {
      console.error('Legacy copy fallback failed:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  // Preset addition buttons
  const addHeaderPreset = (key: string, value: string) => {
    const exists = headers.some(h => h.key.toLowerCase() === key.toLowerCase());
    if (exists) {
      setHeaders(headers.map(h => h.key.toLowerCase() === key.toLowerCase() ? { ...h, value, enabled: true } : h));
    } else {
      const filtered = headers.filter(h => h.key !== '');
      setHeaders([...filtered, { key, value, enabled: true }, { key: '', value: '', enabled: true }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
        <div style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <Server size={16} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', color: '#fff' }}>REST API 클라이언트</h2>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>보안 우회 API 호출 및 응답 마크다운 변환</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', gap: '12px', overflowY: 'auto' }}>
        
        {/* URL & Method section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#13141a', padding: '12px', borderRadius: '10px', border: '1px solid #1f2029' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value)} 
              style={{ 
                background: '#1a1b23', 
                color: '#a78bfa', 
                border: '1px solid #2e303e', 
                borderRadius: '6px', 
                padding: '0 10px', 
                fontSize: '11px', 
                fontWeight: 'bold', 
                outline: 'none',
                cursor: 'pointer',
                height: '32px'
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
            </select>
            <input 
              type="text" 
              value={url} 
              onChange={e => {
                setUrl(e.target.value);
                parseUrlParams(e.target.value);
              }} 
              placeholder="https://api.example.com/v1/resource"
              style={{ 
                flex: 1, 
                background: '#1a1b23', 
                color: '#fff', 
                border: '1px solid #2e303e', 
                borderRadius: '6px', 
                padding: '0 12px', 
                fontSize: '11px', 
                outline: 'none',
                height: '32px'
              }}
            />
          </div>
          <button 
            onClick={handleSend} 
            disabled={isLoading || !url} 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', 
              color: '#fff', 
              border: 'none', 
              height: '34px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              cursor: (isLoading || !url) ? 'not-allowed' : 'pointer', 
              opacity: (isLoading || !url) ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {isLoading ? '요청 전송 중...' : <><Send size={12}/> 요청 보내기</>}
          </button>
        </div>

        {/* Configurations Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#13141a', borderRadius: '10px', border: '1px solid #1f2029', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
            {(['params', 'headers', 'body', 'auth', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  background: activeTab === tab ? '#13141a' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #8b5cf6' : 'none',
                  color: activeTab === tab ? '#c084fc' : '#9ca3af',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {tab === 'params' && 'Query Params'}
                {tab === 'headers' && 'Headers'}
                {tab === 'body' && 'Body'}
                {tab === 'auth' && 'Auth'}
                {tab === 'history' && 'History'}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px', minHeight: '130px', maxHeight: '180px', overflowY: 'auto' }}>
            
            {/* PARAMS TAB */}
            {activeTab === 'params' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {params.map((param, index) => (
                  <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={param.enabled} 
                      onChange={e => handleParamChange(index, 'enabled', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Parameter" 
                      value={param.key} 
                      onChange={e => handleParamChange(index, 'key', e.target.value)}
                      style={{ flex: 1, background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      value={param.value} 
                      onChange={e => handleParamChange(index, 'value', e.target.value)}
                      style={{ flex: 1, background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                    />
                    <button 
                      onClick={() => deleteParam(index)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setParams([...params, { key: '', value: '', enabled: true }])}
                  style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#c084fc', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 0' }}
                >
                  <Plus size={12}/> 매개변수 추가
                </button>
              </div>
            )}

            {/* HEADERS TAB */}
            {activeTab === 'headers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <button onClick={() => addHeaderPreset('Content-Type', 'application/json')} style={{ background: '#1a1b23', border: '1px solid #2e303e', borderRadius: '4px', color: '#9ca3af', padding: '2px 6px', fontSize: '9px', cursor: 'pointer' }}>+ Content-Type: JSON</button>
                  <button onClick={() => addHeaderPreset('User-Agent', 'Mozilla/5.0')} style={{ background: '#1a1b23', border: '1px solid #2e303e', borderRadius: '4px', color: '#9ca3af', padding: '2px 6px', fontSize: '9px', cursor: 'pointer' }}>+ User-Agent</button>
                </div>
                
                {headers.map((header, index) => (
                  <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={header.enabled} 
                      onChange={e => handleHeaderChange(index, 'enabled', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Header" 
                      value={header.key} 
                      onChange={e => handleHeaderChange(index, 'key', e.target.value)}
                      style={{ flex: 1, background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      value={header.value} 
                      onChange={e => handleHeaderChange(index, 'value', e.target.value)}
                      style={{ flex: 1, background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                    />
                    <button 
                      onClick={() => deleteHeader(index)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                  style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#c084fc', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 0' }}
                >
                  <Plus size={12}/> 헤더 추가
                </button>
              </div>
            )}

            {/* BODY TAB */}
            {activeTab === 'body' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
                {['GET', 'HEAD'].includes(method) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '11px', height: '80px', justifyContent: 'center' }}>
                    <AlertTriangle size={14} color="#f59e0b" />
                    <span>{method} 요청은 요청 본문을 전송하지 않습니다.</span>
                  </div>
                ) : (
                  <>
                    <textarea 
                      placeholder='{ "key": "value" }' 
                      value={requestBody} 
                      onChange={e => setRequestBody(e.target.value)}
                      style={{ width: '100%', height: '80px', background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '8px', fontSize: '11px', fontFamily: 'monospace', outline: 'none', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={formatJson} style={{ background: '#1a1b23', border: '1px solid #2e303e', borderRadius: '4px', color: '#c084fc', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                        JSON 정렬
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* AUTH TAB */}
            {activeTab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af', minWidth: '60px' }}>인증 방식:</span>
                  <select 
                    value={authType} 
                    onChange={e => setAuthType(e.target.value as any)} 
                    style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                  >
                    <option value="none">인증 없음 (None)</option>
                    <option value="bearer">Bearer 토큰</option>
                    <option value="basic">기본 인증 (Basic Auth)</option>
                  </select>
                </div>

                {authType === 'bearer' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#9ca3af' }}>토큰 (Token)</span>
                    <input 
                      type="text" 
                      placeholder="Bearer token string" 
                      value={authToken} 
                      onChange={e => setAuthToken(e.target.value)}
                      style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '6px 8px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                )}

                {authType === 'basic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>사용자 이름 (Username)</span>
                      <input 
                        type="text" 
                        placeholder="Username" 
                        value={authUsername} 
                        onChange={e => setAuthUsername(e.target.value)}
                        style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>비밀번호 (Password)</span>
                      <input 
                        type="password" 
                        placeholder="Password" 
                        value={authPassword} 
                        onChange={e => setAuthPassword(e.target.value)}
                        style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>전송 기록 (최근 50개)</span>
                  {history.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12}/> 전체 삭제
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', color: '#9ca3af', fontSize: '11px' }}>
                    전송된 API 요청 기록이 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {history.map((item) => {
                      const isSuccess = item.status && item.status >= 200 && item.status < 300;
                      const methodColor = 
                        item.method === 'GET' ? '#3b82f6' : 
                        item.method === 'POST' ? '#10b981' : 
                        item.method === 'PUT' ? '#f59e0b' : 
                        item.method === 'DELETE' ? '#ef4444' : '#8b5cf6';
                      return (
                        <div 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            background: '#1a1b23', 
                            border: '1px solid #2e303e', 
                            borderRadius: '6px', 
                            padding: '6px 10px', 
                            fontSize: '11px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, marginRight: '10px' }}>
                            <span style={{ 
                              color: '#fff', 
                              background: methodColor, 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '9px', 
                              fontWeight: 'bold',
                              minWidth: '45px',
                              textAlign: 'center'
                            }}>
                              {item.method}
                            </span>
                            <span 
                              style={{ 
                                color: '#d1d5db', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleLoadHistoryItem(item)}
                              title="설정 로드"
                            >
                              {item.url}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              color: isSuccess ? '#34d399' : '#f87171', 
                              fontWeight: 'bold',
                              fontSize: '10px'
                            }}>
                              {item.status ? `${item.status} ${item.statusText || ''}` : 'FAIL'}
                            </span>
                            <button 
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
                              title="기록 삭제"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Response Area */}
        <div style={{ flex: 1, background: '#13141a', borderRadius: '10px', border: '1px solid #1f2029', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Response Head Bar */}
          <div style={{ padding: '8px 12px', background: '#0e0f14', borderBottom: '1px solid #1f2029', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setActiveResponseTab('body')} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: activeResponseTab === 'body' ? '#c084fc' : '#9ca3af', 
                  fontWeight: 'bold', 
                  fontSize: '10px', 
                  cursor: 'pointer' 
                }}
              >
                Response Body
              </button>
              <button 
                onClick={() => setActiveResponseTab('headers')} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: activeResponseTab === 'headers' ? '#c084fc' : '#9ca3af', 
                  fontWeight: 'bold', 
                  fontSize: '10px', 
                  cursor: 'pointer' 
                }}
              >
                Headers
              </button>
            </div>
            
            {responseStatus !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {responseTime && <span style={{ fontSize: '9px', color: '#9ca3af' }}>{responseTime} ms</span>}
                {responseSize && <span style={{ fontSize: '9px', color: '#9ca3af' }}>{responseSize}</span>}
                <span 
                  style={{ 
                    fontSize: '9px', 
                    color: responseStatus >= 200 && responseStatus < 300 ? '#10b981' : '#f59e0b', 
                    background: responseStatus >= 200 && responseStatus < 300 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  {responseStatus} {responseStatusText}
                </span>
              </div>
            )}
          </div>

          {/* Response Content View */}
          <div style={{ flex: 1, padding: '12px', overflow: 'auto', background: '#090a0f' }}>
            {activeResponseTab === 'body' ? (
              responseBody ? (
                <pre style={{ margin: 0, color: '#e2e8f0', fontSize: '10.5px', fontFamily: 'Consolas, Monaco, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{responseBody}</pre>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: '11px', gap: '6px' }}>
                  <Play size={20} color="#4b5563" />
                  <span>요청 전송 시 응답 결과가 여기에 노출됩니다.</span>
                </div>
              )
            ) : (
              responseHeaders ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(responseHeaders).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', fontSize: '10px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#a78bfa', fontWeight: 'bold', minWidth: '120px' }}>{key}:</span>
                      <span style={{ color: '#e2e8f0', marginLeft: '6px', wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: '11px' }}>수신된 응답 헤더가 없습니다.</div>
              )
            )}
          </div>

          {/* Response Actions Footer */}
          {responseBody && activeResponseTab === 'body' && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #1f2029', background: '#0e0f14', display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button 
                onClick={handleCopy} 
                style={{ 
                  flex: 1, 
                  background: '#1a1b23', 
                  color: '#fff', 
                  border: '1px solid #2e303e', 
                  height: '30px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  cursor: 'pointer' 
                }}
              >
                <Copy size={12}/> {isCopied ? '복사 완료' : '응답 복사'}
              </button>
              <button 
                onClick={handleInsert} 
                style={{ 
                  flex: 1, 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: '#a5b4fc', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  height: '30px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  cursor: 'pointer' 
                }}
              >
                <CheckCircle2 size={12}/> 에디터에 JSON 삽입
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
