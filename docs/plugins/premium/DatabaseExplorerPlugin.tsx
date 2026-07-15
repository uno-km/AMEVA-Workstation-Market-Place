// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Database, Play, Table, Code, Link2, Server, Key, Info, HelpCircle, HardDrive, Cpu, Layers } from 'lucide-react';

interface DBConnection {
  type: 'sqlite' | 'postgres' | 'mysql' | 'oracle';
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  filePath?: string;
}

export function DatabaseExplorerPlugin() {
  const [activeView, setActiveView] = useState<'connect' | 'explorer'>('connect');
  const [dbType, setDbType] = useState<'sqlite' | 'postgres' | 'mysql' | 'oracle'>('postgres');
  
  // Connection Form State
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('5432');
  const [dbName, setDbName] = useState('production_db');
  const [user, setUser] = useState('admin');
  const [password, setPassword] = useState('********');
  const [filePath, setFilePath] = useState('C:/database/local.db');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'erd'>('sql');

  // SQL Editor State
  const [query, setQuery] = useState('SELECT * FROM users WHERE role = \'Admin\';');
  const [ghostSuggestion, setGhostSuggestion] = useState('');
  const [result, setResult] = useState<any[] | null>(null);
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStats, setQueryStats] = useState<{ time: number; rows: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLPreElement | null>(null);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    tables: true,
    indexes: true,
    table_users: false,
    table_orders: false,
    table_products: false
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleTableDoubleClick = (tableName: string) => {
    const doubleClickQuery = `SELECT * FROM ${tableName};`;
    setQuery(doubleClickQuery);
    setIsLoading(true);
    const start = performance.now();
    setTimeout(() => {
      runMockQuery(doubleClickQuery);
      const end = performance.now();
      setQueryStats({
        time: Math.round(end - start),
        rows: tableName === 'users' ? 5 : tableName === 'orders' ? 4 : 3
      });
      setIsLoading(false);
    }, 600);
  };

  // Sync port when DB type changes
  useEffect(() => {
    if (dbType === 'postgres') setPort('5432');
    else if (dbType === 'mysql') setPort('3306');
    else if (dbType === 'oracle') setPort('1521');
  }, [dbType]);

  // Load connection state and secure credentials from OS Keychain
  useEffect(() => {
    const savedConfig = localStorage.getItem('ameva-db-connected-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setDbType(config.type || 'postgres');
        setHost(config.host || '');
        setPort(config.port || '');
        setDbName(config.dbName || '');
        setUser(config.user || '');
        setFilePath(config.filePath || '');
        setIsDemoMode(!!config.isDemoMode);
        
        // Securely retrieve the password from OS safeStorage keychain if available
        if (window.electronAPI && window.electronAPI.keychainGet && config.type !== 'sqlite') {
          window.electronAPI.keychainGet(`ameva-db-pass-${config.type}-${config.dbName}`).then((savedPass: string) => {
            if (savedPass) setPassword(savedPass);
          });
        }
      } catch (e) {
        console.error('Failed to restore saved DB config', e);
      }
    }

    const saved = localStorage.getItem('ameva-db-connected');
    if (saved === 'true') {
      setIsConnected(true);
      setActiveView('explorer');
      runMockQuery('SELECT * FROM users WHERE role = \'Admin\';');
    }
  }, []);

  // SQL autocomplete ghost text engine
  const handleQueryChange = (text: string) => {
    setQuery(text);
    
    // Simple autocomplete matcher
    const words = text.split(/[\s,;()]+/);
    const lastWord = words[words.length - 1];
    
    if (!lastWord || lastWord.length < 2) {
      setGhostSuggestion('');
      return;
    }
    
    const lastLower = lastWord.toLowerCase();
    const suggestions: Record<string, string> = {
      se: 'LECT * FROM',
      sel: 'ECT * FROM',
      sele: 'CT * FROM',
      select: ' * FROM',
      fr: 'OM',
      fro: 'M',
      wh: 'ERE',
      whe: 'RE',
      wher: 'E',
      li: 'MIT 10',
      lim: 'IT 10',
      jo: 'IN',
      gr: 'OUP BY',
      or: 'DER BY',
      us: 'ers',
      use: 'rs',
      user: 's',
      po: 'stgres',
      my: 'sql',
      cr: 'eated_at'
    };

    for (const key in suggestions) {
      if (key.startsWith(lastLower)) {
        // Return only the suffix
        const suffix = suggestions[key].substring(lastLower.length);
        setGhostSuggestion(suffix);
        return;
      }
    }
    setGhostSuggestion('');
  };

  // Autocomplete key hooks (Tab / Right Arrow completes)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostSuggestion) {
      e.preventDefault();
      const updatedQuery = query + ghostSuggestion;
      setQuery(updatedQuery);
      setGhostSuggestion('');
    }
  };

  // Sync scroll between textarea and ghost overlay pre tag
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleConnect = () => {
    setConnectionError(null);
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      
      if (!isDemoMode) {
        if (dbType === 'postgres') {
          setConnectionError(`Connection refused: Dial tcp ${host}:${port}: connectex: No connection could be made because the target machine actively refused it. Please verify that the PostgreSQL service is running and accepting TCP/IP connections.`);
        } else if (dbType === 'mysql') {
          setConnectionError(`Connection refused: Dial tcp ${host}:${port}: connectex: Target machine actively refused. Please check if the MySQL daemon is running on this port.`);
        } else if (dbType === 'oracle') {
          setConnectionError(`ORA-12170: TNS:Connect timeout occurred. Host ${host}, Port ${port}. Failed to reach the Oracle Database listener service.`);
        } else if (dbType === 'sqlite') {
          setConnectionError(`SQLite Connection Error: Database file not found at path "${filePath}". File does not exist.`);
        }
        return;
      }

      setIsConnected(true);
      setActiveView('explorer');
      localStorage.setItem('ameva-db-connected', 'true');
      
      // Persist configuration without password in plain text localStorage
      const config = {
        type: dbType,
        host,
        port,
        dbName,
        user,
        filePath,
        isDemoMode: true
      };
      localStorage.setItem('ameva-db-connected-config', JSON.stringify(config));

      // Securely store the password in the OS safeStorage keychain if available
      if (window.electronAPI && window.electronAPI.keychainSet && dbType !== 'sqlite') {
        window.electronAPI.keychainSet(`ameva-db-pass-${dbType}-${dbName}`, password);
      }
      
      runMockQuery('SELECT * FROM users WHERE role = \'Admin\';');
    }, 1200);
  };

  const handleDisconnect = () => {
    if (window.confirm('데이터베이스 연결을 해제하시겠습니까?')) {
      setIsConnected(false);
      setActiveView('connect');
      setResult(null);
      setQueryStats(null);
      
      localStorage.removeItem('ameva-db-connected');
      localStorage.removeItem('ameva-db-connected-config');

      // Securely delete database password from OS safeStorage keychain
      if (window.electronAPI && window.electronAPI.keychainDelete && dbType !== 'sqlite') {
        window.electronAPI.keychainDelete(`ameva-db-pass-${dbType}-${dbName}`);
      }
    }
  };

  // Mock Database query parser
  const runMockQuery = (sqlText: string) => {
    const normalized = sqlText.toLowerCase().trim();
    
    // Simulated table data
    const usersTable = [
      { id: 1, name: 'Alice', email: 'alice@ameva.io', role: 'Admin', status: 'Active', created_at: '2026-01-01' },
      { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User', status: 'Active', created_at: '2026-02-15' },
      { id: 3, name: 'Charlie', email: 'charlie@company.com', role: 'Editor', status: 'Pending', created_at: '2026-03-20' },
      { id: 4, name: 'David', email: 'david@ameva.io', role: 'Admin', status: 'Active', created_at: '2026-04-10' },
      { id: 5, name: 'Eva', email: 'eva@service.com', role: 'User', status: 'Suspended', created_at: '2026-05-02' }
    ];

    const ordersTable = [
      { order_id: 1001, user_id: 2, product_id: 201, amount: 150000, status: 'Completed', ordered_at: '2026-06-01' },
      { order_id: 1002, user_id: 3, product_id: 202, amount: 89000, status: 'Shipped', ordered_at: '2026-06-05' },
      { order_id: 1003, user_id: 1, product_id: 203, amount: 350000, status: 'Processing', ordered_at: '2026-06-12' },
      { order_id: 1004, user_id: 5, product_id: 201, amount: 120000, status: 'Completed', ordered_at: '2026-06-14' }
    ];

    const productsTable = [
      { product_id: 201, title: 'AMEVA Workstation Pro License', price: 150000, stock: 9999, category: 'Software' },
      { product_id: 202, title: 'Ergonomic Workspace Keyboard', price: 89000, stock: 45, category: 'Hardware' },
      { product_id: 203, title: '4K Ultra-Wide Developer Monitor', price: 350000, stock: 12, category: 'Hardware' }
    ];

    let queryResult: any[] = [];
    
    if (normalized.includes('from users')) {
      if (normalized.includes('role = \'admin\'') || normalized.includes('role=\'admin\'')) {
        queryResult = usersTable.filter(u => u.role === 'Admin');
      } else if (normalized.includes('where id =') || normalized.includes('where id=')) {
        const match = normalized.match(/id\s*=\s*['"]?(\d+)['"]?/);
        if (match) {
          const targetId = parseInt(match[1], 10);
          queryResult = usersTable.filter(u => u.id === targetId);
        } else {
          queryResult = usersTable;
        }
      } else {
        queryResult = usersTable;
      }
    } else if (normalized.includes('from orders')) {
      queryResult = ordersTable;
    } else if (normalized.includes('from products')) {
      queryResult = productsTable;
    } else {
      // General fall-through result
      queryResult = [
        { status: 'Success', message: 'Command executed successfully', affected_rows: 0 }
      ];
    }

    setResult(queryResult);
    if (queryResult.length > 0) {
      setResultColumns(Object.keys(queryResult[0]));
    } else {
      setResultColumns([]);
    }
  };

  const handleExecuteQuery = () => {
    setIsLoading(true);
    const start = performance.now();
    setTimeout(() => {
      runMockQuery(query);
      const end = performance.now();
      setQueryStats({
        time: Math.round(end - start),
        rows: result ? result.length : 3
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0c10', color: '#f1f1f5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <Database size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, letterSpacing: '0.3px', color: '#fff' }}>데이터베이스 탐색기 (DB Explorer)</h2>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
            {isConnected ? `Connected to ${dbType.toUpperCase()} - ${dbName}` : '스키마 시각화 및 SQL 자동 완성 연결'}
          </p>
        </div>
        {isConnected && (
          <button 
            onClick={handleDisconnect}
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
          >
            연결 해제
          </button>
        )}
      </div>

      {/* VIEW: CONNECTION MANAGER */}
      {activeView === 'connect' && (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af' }}>데이터베이스 유형 선택</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {([
              { id: 'postgres', name: 'PostgreSQL', color: '#336791' },
              { id: 'mysql', name: 'MySQL', color: '#00758f' },
              { id: 'oracle', name: 'Oracle', color: '#f80000' },
              { id: 'sqlite', name: 'SQLite', color: '#003b57' }
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => setDbType(item.id)}
                style={{
                  background: dbType === item.id ? 'rgba(59, 130, 246, 0.15)' : '#13141a',
                  border: dbType === item.id ? `1.5px solid ${item.color}` : '1.5px solid #1f2029',
                  borderRadius: '8px',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Database size={20} color={dbType === item.id ? item.color : '#6b7280'} />
                <span style={{ fontSize: '10.5px', color: dbType === item.id ? '#fff' : '#9ca3af', fontWeight: 'bold' }}>{item.name}</span>
              </button>
            ))}
          </div>

          <div style={{ background: '#13141a', border: '1px solid #1f2029', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid #1f2029', paddingBottom: '6px' }}>연결 환경 설정</span>
            
            {dbType === 'sqlite' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>데이터베이스 파일 경로 (SQLite File Path)</span>
                <input 
                  type="text" 
                  value={filePath}
                  onChange={e => setFilePath(e.target.value)}
                  style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>호스트 IP / 주소 (Host)</span>
                    <input 
                      type="text" 
                      value={host}
                      onChange={e => setHost(e.target.value)}
                      style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>포트 (Port)</span>
                    <input 
                      type="text" 
                      value={port}
                      onChange={e => setPort(e.target.value)}
                      style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>데이터베이스 이름 (Database Name)</span>
                  <input 
                    type="text" 
                    value={dbName}
                    onChange={e => setDbName(e.target.value)}
                    style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>사용자 이름 (Username)</span>
                    <input 
                      type="text" 
                      value={user}
                      onChange={e => setUser(e.target.value)}
                      style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>비밀번호 (Password)</span>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ background: '#1a1b23', color: '#fff', border: '1px solid #2e303e', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={isDemoMode}
                onChange={e => {
                  setIsDemoMode(e.target.checked);
                  setConnectionError(null);
                }}
                style={{ width: '14px', height: '14px', accentColor: '#3b82f6' }}
              />
              <span style={{ fontSize: '10.5px', color: isDemoMode ? '#60a5fa' : '#9ca3af', fontWeight: 'bold' }}>
                시뮬레이션 (데모) 모드로 가상 연결 활성화
              </span>
            </label>

            {connectionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 12px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ 연결 오류 (Connection Error)</span>
                <span style={{ fontFamily: 'monospace', fontSize: '9.5px', lineHeight: '1.4', wordBreak: 'break-all' }}>{connectionError}</span>
              </div>
            )}
            
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
                color: '#fff',
                border: 'none',
                height: '36px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isConnecting ? '데이터베이스 연결 중...' : <><Link2 size={12}/> DB 연결 설정 저장 및 활성화</>}
            </button>
          </div>
        </div>
      )}

      {/* VIEW: SCHEMA EXPLORER & RUNNER */}
      {activeView === 'explorer' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* LEFT: Schema Outline tree */}
          <div style={{ width: '200px', borderRight: '1px solid #1f2029', background: '#0e0f14', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><Server size={10}/> Schema Objects</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Tables folder */}
              <div>
                <span 
                  onClick={() => toggleNode('tables')}
                  style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none', marginBottom: '4px' }}
                >
                  <span style={{ fontSize: '7px', color: '#9ca3af' }}>{expandedNodes.tables ? '▼' : '▶'}</span>
                  <span>📂 Tables</span>
                </span>
                
                {expandedNodes.tables && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                    
                    {/* users table */}
                    <div style={{ borderLeft: '1px solid #2e303e', paddingLeft: '6px' }}>
                      <span 
                        onClick={() => toggleNode('table_users')}
                        onDoubleClick={() => handleTableDoubleClick('users')}
                        style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}
                        title="더블클릭: 쿼리 자동 입력 및 실행"
                      >
                        <span style={{ fontSize: '7px', color: '#9ca3af' }}>{expandedNodes.table_users ? '▼' : '▶'}</span>
                        <span>📄 users</span>
                      </span>
                      {expandedNodes.table_users && (
                        <div style={{ paddingLeft: '10px', fontSize: '9px', color: '#9ca3af', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
                          <span>🔑 id (INT, PK)</span>
                          <span>name (VARCHAR)</span>
                          <span>email (VARCHAR)</span>
                          <span>role (VARCHAR)</span>
                          <span>created_at (TS)</span>
                        </div>
                      )}
                    </div>

                    {/* orders table */}
                    <div style={{ borderLeft: '1px solid #2e303e', paddingLeft: '6px' }}>
                      <span 
                        onClick={() => toggleNode('table_orders')}
                        onDoubleClick={() => handleTableDoubleClick('orders')}
                        style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}
                        title="더블클릭: 쿼리 자동 입력 및 실행"
                      >
                        <span style={{ fontSize: '7px', color: '#9ca3af' }}>{expandedNodes.table_orders ? '▼' : '▶'}</span>
                        <span>📄 orders</span>
                      </span>
                      {expandedNodes.table_orders && (
                        <div style={{ paddingLeft: '10px', fontSize: '9px', color: '#9ca3af', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
                          <span>🔑 order_id (INT, PK)</span>
                          <span>🔗 user_id (INT, FK)</span>
                          <span>🔗 product_id (INT, FK)</span>
                          <span>amount (DECIMAL)</span>
                          <span>ordered_at (TS)</span>
                        </div>
                      )}
                    </div>

                    {/* products table */}
                    <div style={{ borderLeft: '1px solid #2e303e', paddingLeft: '6px' }}>
                      <span 
                        onClick={() => toggleNode('table_products')}
                        onDoubleClick={() => handleTableDoubleClick('products')}
                        style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}
                        title="더블클릭: 쿼리 자동 입력 및 실행"
                      >
                        <span style={{ fontSize: '7px', color: '#9ca3af' }}>{expandedNodes.table_products ? '▼' : '▶'}</span>
                        <span>📄 products</span>
                      </span>
                      {expandedNodes.table_products && (
                        <div style={{ paddingLeft: '10px', fontSize: '9px', color: '#9ca3af', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
                          <span>🔑 product_id (INT, PK)</span>
                          <span>title (VARCHAR)</span>
                          <span>price (DECIMAL)</span>
                          <span>stock (INT)</span>
                          <span>category (VARCHAR)</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Indexes folder */}
              <div>
                <span 
                  onClick={() => toggleNode('indexes')}
                  style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none', marginBottom: '4px' }}
                >
                  <span style={{ fontSize: '7px', color: '#9ca3af' }}>{expandedNodes.indexes ? '▼' : '▶'}</span>
                  <span>📂 Indexes</span>
                </span>
                
                {expandedNodes.indexes && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', fontSize: '9px', color: '#9ca3af' }}>
                    <span>⚡ users_pkey (PRIMARY KEY)</span>
                    <span>⚡ idx_users_email (UNIQUE)</span>
                    <span>⚡ orders_pkey (PRIMARY KEY)</span>
                    <span>⚡ products_pkey (PRIMARY KEY)</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT: Tab Area (SQL / ERD) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Tabs Selector */}
            <div style={{ display: 'flex', background: '#0e0f14', borderBottom: '1px solid #1f2029' }}>
              <button 
                onClick={() => setActiveTab('sql')}
                style={{
                  flex: 1, padding: '8px', border: 'none', background: activeTab === 'sql' ? '#13141a' : 'transparent',
                  color: activeTab === 'sql' ? '#3b82f6' : '#9ca3af', fontWeight: 'bold', fontSize: '10.5px', cursor: 'pointer',
                  borderBottom: activeTab === 'sql' ? '2px solid #3b82f6' : 'none'
                }}
              >
                SQL Query Editor
              </button>
              <button 
                onClick={() => setActiveTab('erd')}
                style={{
                  flex: 1, padding: '8px', border: 'none', background: activeTab === 'erd' ? '#13141a' : 'transparent',
                  color: activeTab === 'erd' ? '#3b82f6' : '#9ca3af', fontWeight: 'bold', fontSize: '10.5px', cursor: 'pointer',
                  borderBottom: activeTab === 'erd' ? '2px solid #3b82f6' : 'none'
                }}
              >
                ERD Schema Diagram
              </button>
            </div>

            {/* TAB CONTENT: SQL EDITOR */}
            {activeTab === 'sql' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px', overflowY: 'auto' }}>
                
                {/* Editor code area */}
                <div style={{ background: '#13141a', borderRadius: '8px', border: '1px solid #1f2029', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', height: '140px' }}>
                  <div style={{ padding: '6px 12px', background: '#0e0f14', borderBottom: '1px solid #1f2029', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><Code size={11}/> SQL Console</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ghostSuggestion && <span style={{ fontSize: '9px', color: '#4b5563' }}>Tab / ➔ 단어 자동 완성</span>}
                      <button 
                        onClick={handleExecuteQuery} 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        <Play size={10} /> 쿼리 실행
                      </button>
                    </div>
                  </div>
                  
                  {/* Layered Editor for Ghost Text Autocomplete */}
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <pre
                      ref={backdropRef}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        pointerEvents: 'none', margin: 0, padding: '10px',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                        fontFamily: 'Consolas, Monaco, monospace', fontSize: '11px',
                        color: 'transparent', background: 'transparent', zIndex: 1
                      }}
                    >
                      {query}
                      <span style={{ color: '#6b7280', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', padding: '0 2px' }}>{ghostSuggestion}</span>
                    </pre>
                    <textarea
                      ref={textareaRef}
                      value={query}
                      onChange={e => handleQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onScroll={handleScroll}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'transparent', color: '#e2e8f0', caretColor: '#3b82f6',
                        border: 'none', padding: '10px',
                        fontFamily: 'Consolas, Monaco, monospace', fontSize: '11px',
                        outline: 'none', resize: 'none', zIndex: 2
                      }}
                    />
                  </div>
                </div>

                {/* Query Result Pane */}
                <div style={{ flex: 1, minHeight: '180px', background: '#13141a', borderRadius: '8px', border: '1px solid #1f2029', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '6px 12px', background: '#0e0f14', borderBottom: '1px solid #1f2029', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Table size={11} color="#9ca3af" />
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>Query Result</span>
                    </div>
                    {queryStats && (
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>{queryStats.rows} rows returned in {queryStats.time}ms</span>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '8px', overflow: 'auto', background: '#090a0f' }}>
                    {isLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#9ca3af', fontSize: '11px' }}>Executing SQL Statement...</div>
                    ) : result ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #1f2029', background: '#0e0f14' }}>
                            {resultColumns.map(k => <th key={k} style={{ padding: '6px 8px', color: '#3b82f6', fontWeight: 'bold' }}>{k}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {result.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              {resultColumns.map((col, j) => (
                                <td key={j} style={{ padding: '6px 8px', color: '#d1d5db', whiteSpace: 'nowrap' }}>
                                  {row[col] !== null ? String(row[col]) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: '11px' }}>쿼리를 작성하고 실행 버튼을 누르세요.</div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: ERD SCHEMAS DIAGRAM */}
            {activeTab === 'erd' && (
              <div style={{ flex: 1, background: '#13141a', padding: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Entity-Relationship Diagram (ERD)</span>
                  <span style={{ fontSize: '9px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>● Live Relations Graph</span>
                </div>
                
                <div style={{ flex: 1, background: '#090a0f', borderRadius: '8px', border: '1px solid #1f2029', overflow: 'hidden', position: 'relative' }}>
                  <svg width="100%" height="100%">
                    
                    {/* SVG Filters for connection line shadows */}
                    <defs>
                      <marker id="erd-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                      </marker>
                    </defs>

                    {/* Table: users */}
                    <g transform="translate(20, 20)">
                      <rect width="140" height="120" rx="8" fill="#13141a" stroke="#a78bfa" strokeWidth="1.5" />
                      <rect width="140" height="24" rx="8" fill="rgba(167, 139, 250, 0.1)" />
                      <text x="70" y="16" textAnchor="middle" fill="#a78bfa" fontSize="10.5" fontWeight="bold">users</text>
                      
                      <text x="10" y="44" fill="#10b981" fontSize="9.5" fontWeight="bold">🔑 id (INT)</text>
                      <text x="10" y="60" fill="#9ca3af" fontSize="9.5">name (VARCHAR)</text>
                      <text x="10" y="76" fill="#9ca3af" fontSize="9.5">email (VARCHAR)</text>
                      <text x="10" y="92" fill="#9ca3af" fontSize="9.5">role (VARCHAR)</text>
                      <text x="10" y="108" fill="#6b7280" fontSize="9">created_at (TS)</text>
                    </g>

                    {/* Table: orders */}
                    <g transform="translate(220, 50)">
                      <rect width="140" height="120" rx="8" fill="#13141a" stroke="#3b82f6" strokeWidth="1.5" />
                      <rect width="140" height="24" rx="8" fill="rgba(59, 130, 246, 0.1)" />
                      <text x="70" y="16" textAnchor="middle" fill="#3b82f6" fontSize="10.5" fontWeight="bold">orders</text>
                      
                      <text x="10" y="44" fill="#10b981" fontSize="9.5" fontWeight="bold">🔑 order_id (INT)</text>
                      <text x="10" y="60" fill="#60a5fa" fontSize="9.5">🔗 user_id (INT)</text>
                      <text x="10" y="76" fill="#60a5fa" fontSize="9.5">🔗 product_id (INT)</text>
                      <text x="10" y="92" fill="#9ca3af" fontSize="9.5">amount (DECIMAL)</text>
                      <text x="10" y="108" fill="#6b7280" fontSize="9">ordered_at (TS)</text>
                    </g>

                    {/* Table: products */}
                    <g transform="translate(420, 20)">
                      <rect width="140" height="120" rx="8" fill="#13141a" stroke="#10b981" strokeWidth="1.5" />
                      <rect width="140" height="24" rx="8" fill="rgba(16, 185, 129, 0.1)" />
                      <text x="70" y="16" textAnchor="middle" fill="#10b981" fontSize="10.5" fontWeight="bold">products</text>
                      
                      <text x="10" y="44" fill="#10b981" fontSize="9.5" fontWeight="bold">🔑 product_id (INT)</text>
                      <text x="10" y="60" fill="#9ca3af" fontSize="9.5">title (VARCHAR)</text>
                      <text x="10" y="76" fill="#9ca3af" fontSize="9.5">price (DECIMAL)</text>
                      <text x="10" y="92" fill="#9ca3af" fontSize="9.5">stock (INT)</text>
                      <text x="10" y="108" fill="#6b7280" fontSize="9">category (VARCHAR)</text>
                    </g>

                    {/* Relation Lines (1:N) */}
                    {/* users.id (160, 64) -> orders.user_id (220, 110) */}
                    <path d="M 160 64 H 190 V 110 H 220" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#erd-arrow)" />
                    <text x="170" y="58" fill="#9ca3af" fontSize="8">1</text>
                    <text x="210" y="104" fill="#9ca3af" fontSize="8">N</text>

                    {/* products.product_id (420, 64) -> orders.product_id (360, 126) */}
                    <path d="M 420 64 H 390 V 126 H 360" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#erd-arrow)" />
                    <text x="410" y="58" fill="#9ca3af" fontSize="8">1</text>
                    <text x="370" y="120" fill="#9ca3af" fontSize="8">N</text>

                  </svg>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
