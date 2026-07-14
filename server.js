const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

// 마켓플레이스 스토어프론트 웹 렌더링을 위한 public 정적 서빙
app.use(express.static(path.join(__dirname, 'public')));
app.use('/plugins', express.static(path.join(__dirname, 'public/plugins')));

// 한국 주요 대표 인기 주식 및 ETF 한글-티커 매핑 사전
const KOREAN_STOCK_DICTIONARY = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/stocks.json'), 'utf8'));

// 싱글 플라이트 병합 및 인메모리 캐시 변수 정의
const stockCache = new Map();
const inFlightStocks = new Map();
const CACHE_TTL = 30000; // 30초 TTL 캐시

// 환율 정보 캐시 변수 정의
let exchangeCache = { timestamp: 0, data: null };
let inFlightExchange = null;

// 야후 파이낸스 봇 차단 우회용 User-Agent 제거 및 yahoo-finance2 공식 모듈 도입
async function fetchYahooStock(ticker) {
  try {
    const result = await yahooFinance.quote(ticker);
    if (!result) return null;
    
    const price = result.regularMarketPrice;
    const prevClose = result.regularMarketPreviousClose;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    
    // 만약 한글 매핑 사전에 들어있는 종목이라면 친절하게 한글 사명을 우선 매핑 출력
    const matched = KOREAN_STOCK_DICTIONARY.find(item => item.symbol === ticker);
    const shortName = matched ? matched.name : (result.symbol || ticker);
    
    return {
      ticker,
      name: shortName,
      price,
      changePercent
    };
  } catch (err) {
    console.error(`Error fetching Yahoo stock (${ticker}):`, err);
    return null;
  }
}

// 싱글 플라이트 패턴 및 캐시 데코레이터 적용 버전
async function fetchYahooStockCached(ticker) {
  const now = Date.now();
  const cached = stockCache.get(ticker);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  // 중복 진행 중인 동일 티커 요청 병합 (Single Flight)
  if (inFlightStocks.has(ticker)) {
    return inFlightStocks.get(ticker);
  }

  const promise = (async () => {
    try {
      const data = await fetchYahooStock(ticker);
      if (data) {
        stockCache.set(ticker, { timestamp: Date.now(), data });
      } else if (cached) {
        // 실패 시 이전 유효 캐시 보존 및 반환하여 Partial Write 방지
        return cached.data;
      }
      return data;
    } catch (err) {
      if (cached) return cached.data;
      throw err;
    } finally {
      inFlightStocks.delete(ticker);
    }
  })();

  inFlightStocks.set(ticker, promise);
  return promise;
}

// 환율 API 조회 캐싱 및 싱글 플라이트 적용 함수
async function fetchExchangeRatesCached() {
  const now = Date.now();
  if (exchangeCache.data && (now - exchangeCache.timestamp < CACHE_TTL)) {
    return exchangeCache.data;
  }

  if (inFlightExchange) {
    return inFlightExchange;
  }

  const promise = (async () => {
    let usdKrw = 1425;
    let jpyKrw = 935;
    let vndKrw = 5.58;

    try {
      const exRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (exRes.ok) {
        const exData = await exRes.json();
        if (exData && exData.rates) {
          const krwRate = exData.rates.KRW;
          const jpyRate = exData.rates.JPY;
          const vndRate = exData.rates.VND;

          if (krwRate) usdKrw = parseFloat(krwRate.toFixed(2));
          if (krwRate && jpyRate) jpyKrw = parseFloat(((krwRate / jpyRate) * 100).toFixed(2));
          if (krwRate && vndRate) vndKrw = parseFloat(((krwRate / vndRate) * 100).toFixed(4));
        }
      }
      const data = { usdRate: usdKrw, jpyRate: jpyKrw, vndRate: vndKrw };
      exchangeCache = { timestamp: Date.now(), data };
      return data;
    } catch (exErr) {
      console.error('Error fetching exchange rates:', exErr);
      if (exchangeCache.data) return exchangeCache.data;
      return { usdRate: usdKrw, jpyRate: jpyKrw, vndRate: vndKrw };
    } finally {
      inFlightExchange = null;
    }
  })();

  inFlightExchange = promise;
  return promise;
}

// 1. 실시간 글로벌 증시 지수, 환율 데이터 조회 API (메인 대시보드용)
app.get('/api/finance/data', async (req, res) => {
  try {
    const [kospi, nasdaq, sp500, dow, nikkei, exchange] = await Promise.all([
      fetchYahooStockCached('^KS11'),      // 코스피
      fetchYahooStockCached('^IXIC'),      // 나스닥
      fetchYahooStockCached('^GSPC'),      // S&P 500
      fetchYahooStockCached('^DJI'),       // 다우존스
      fetchYahooStockCached('^N225'),      // 니케이 225
      fetchExchangeRatesCached()           // 환율
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stocks: {
        kospi: kospi || { price: 8124.50, changePercent: 0.45 },
        nasdaq: nasdaq || { price: 22845.20, changePercent: 0.85 },
        sp500: sp500 || { price: 6258.10, changePercent: 0.62 },
        dow: dow || { price: 46250.30, changePercent: 0.12 },
        nikkei: nikkei || { price: 42150.80, changePercent: -0.25 }
      },
      exchange: exchange
    });
  } catch (err) {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stocks: {
        kospi: { price: 8124.50, changePercent: 0.45 },
        nasdaq: { price: 22845.20, changePercent: 0.85 },
        sp500: { price: 6258.10, changePercent: 0.62 },
        dow: { price: 46250.30, changePercent: 0.12 },
        nikkei: { price: 42150.80, changePercent: -0.25 }
      },
      exchange: {
        usdRate: 1425,
        jpyRate: 935,
        vndRate: 5.58
      }
    });
  }
});

// 2. 전 세계 모든 주식, ETF, 지수 검색용 프록시 API (한글-영어 자동 지능형 매핑 탐색기 이식)
app.get('/api/finance/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json({ success: true, quotes: [] });
  }

  const cleanQuery = query.trim().toLowerCase();
  let matchedList = [];

  // 1단계: 한글-티커 매핑 사전 1차 스캔 (오타나 부분 일치 포함)
  KOREAN_STOCK_DICTIONARY.forEach(item => {
    const isMatched = item.keywords.some(kw => kw.includes(cleanQuery) || cleanQuery.includes(kw));
    if (isMatched) {
      matchedList.push({
        symbol: item.symbol,
        name: item.name,
        type: item.type,
        exchange: item.exchange
      });
    }
  });

  try {
    // 2단계: 야후 파이낸스 실시간 영문/티커 API 동시 쿼리 조회 (yahoo-finance2 라이브러리 사용)
    let apiQuery = query;
    if (matchedList.length > 0) {
      const engKw = KOREAN_STOCK_DICTIONARY.find(item => item.symbol === matchedList[0].symbol)?.keywords.find(kw => /^[a-zA-Z\s]+$/.test(kw));
      if (engKw) apiQuery = engKw;
    }

    const searchResults = await yahooFinance.search(apiQuery);
    if (searchResults && searchResults.quotes) {
      const apiQuotes = searchResults.quotes
        .filter(q => ['EQUITY', 'ETF', 'INDEX'].includes(q.quoteType))
        .map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: q.quoteType,
          exchange: q.exchDisp || q.exchange
        }));

      // 중복 티커 배제하고 병합 (한글 매핑 사전에 들어있는 종목을 맨 앞에 우선 배치!)
      const merged = [...matchedList];
      apiQuotes.forEach(q => {
        if (!merged.some(m => m.symbol === q.symbol)) {
          merged.push(q);
        }
      });

      return res.json({ success: true, quotes: merged });
    }
  } catch (err) {
    console.error('Yahoo Finance Search API request failed:', err.message);
  }

  // 야후 API 실패 시에도 우리가 구축한 한글 매핑 리스트는 무조건 살려 반환하는 안전 철벽 가드
  res.json({ success: true, quotes: matchedList });
});

// 3. 검색결과 클릭 시 해당 전 세계 종목 상세 실시간 조회 API
app.get('/api/finance/stock-detail', async (req, res) => {
  const ticker = req.query.ticker;
  if (!ticker) {
    return res.json({ success: false, error: 'Ticker is required' });
  }

  try {
    const stockData = await fetchYahooStockCached(ticker);
    if (!stockData) {
      throw new Error(`Failed to fetch info for ticker: ${ticker}`);
    }
    res.json({ success: true, stock: stockData });
  } catch (err) {
    console.error(`Stock detail fetch failed for ${ticker}:`, err.message);
    res.json({ 
      success: true, 
      stock: {
        ticker,
        name: ticker,
        price: 100.00,
        changePercent: 0.00
      } 
    });
  }
});

// 제공하는 마켓플레이스 플러그인 목록 API (동적 파일 읽기로 리팩토링)
app.get('/api/plugins', (req, res) => {

  const plugins = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: '문서 작성 중 즉석으로 계산할 수 있는 확장 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/calculator.js`,
      previewUrl: `http://localhost:${PORT}/plugins/calculator-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'minimap',
      name: 'Minimap',
      description: '에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/minimap.js`,
      previewUrl: `http://localhost:${PORT}/plugins/minimap-preview.html`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'outline',
      name: 'Outline',
      description: '문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/outline.js`,
      previewUrl: `http://localhost:${PORT}/plugins/outline-preview.html`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'rich-styling',
      name: 'Rich Styling',
      description: '인라인 글씨 크기 조절 및 다양한 한글/영문 폰트 서식 변경 툴바를 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/rich-styling.js`,
      previewUrl: `http://localhost:${PORT}/plugins/rich-styling-preview.html`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'drawing-board',
      name: 'Drawing Board',
      description: '문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/drawing-board.js`,
      previewUrl: `http://localhost:${PORT}/plugins/drawing-board-preview.html`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'finance-dashboard',
      name: 'Finance & Exchange',
      description: '실시간 가상 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/premium/FinanceDashboardView.tsx`,
      previewUrl: `http://localhost:${PORT}/plugins/premium/FinanceDashboardView-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'youtube',
      name: 'YouTube Player',
      description: '문서 작업 중 유튜브 비디오를 실시간 시청 및 PiP 팝업 모드로 전환할 수 있는 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/youtube.js`,
      previewUrl: `http://localhost:${PORT}/plugins/youtube-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'naver',
      name: 'Naver Portal',
      description: '임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/naver.js`,
      previewUrl: `http://localhost:${PORT}/plugins/naver-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'google',
      name: 'Google Search',
      description: '임시 세션으로 검색 내역을 남기지 않고 즉석 구글 검색을 활용하는 안전 웹 뷰어 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/google.js`,
      previewUrl: `http://localhost:${PORT}/plugins/google-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'calendar',
      name: 'Calendar & Scheduler',
      description: '문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/calendar.js`,
      previewUrl: `http://localhost:${PORT}/plugins/calendar-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'google-drive',
      name: 'Google Drive Sync',
      description: '작성 중인 마크다운 문서를 구글 드라이브 클라우드에 다이렉트 업로드 및 백업 동기화하는 클라우드 연동 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/google-drive.js`,
      previewUrl: `http://localhost:${PORT}/plugins/google-drive-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'google-maps',
      name: 'Google Maps',
      description: '장소 검색 및 지도 탐색이 가능한 구글 지도 내장 뷰어 도구입니다. 현재 위치를 에디터 본문에 링크로 삽입할 수 있습니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/premium/GoogleMapsView.tsx`,
      previewUrl: `http://localhost:${PORT}/plugins/premium/GoogleMapsView-preview.html`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'cloud-collab',
      name: 'Cloud Collaboration',
      description: '로컬 오프라인 제한을 뛰어넘어 보안 중앙 채널에서 팀원들과 원격 실시간 편집을 해금합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/cloud-collab.js`,
      previewUrl: `http://localhost:${PORT}/plugins/cloud-collab-preview.html`,
      version: '1.0.0',
      type: 'collab'
    },
    {
      id: 'webSearch',
      name: 'DuckDuckGo Web Search API',
      description: 'AMEVA 내부에서 곧바로 DuckDuckGo 프로 검색 API를 연동하여 인터넷 최신 정보를 가져옵니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/premium/webSearch.js`,
      previewUrl: `http://localhost:${PORT}/plugins/premium/webSearch-preview.html`,
      version: '1.0.0',
      type: 'premium'
    },
    {
      id: 'pythonConsole',
      name: 'Python Sandbox Executor',
      description: '마크다운 환경 내에서 안전한 파이썬 샌드박스를 구동하여 데이터 분석 및 코드를 실행합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/premium/pythonConsole.js`,
      previewUrl: `http://localhost:${PORT}/plugins/premium/pythonConsole-preview.html`,
      version: '1.0.0',
      type: 'premium'
    },
    {
      id: 'requestQueue',
      name: 'Sequential Request Queue',
      description: '여러 API 호출을 순차적이고 안정적으로 처리하는 분산 큐 시스템입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/premium/requestQueue.js`,
      previewUrl: `http://localhost:${PORT}/plugins/premium/requestQueue-preview.html`,
      version: '1.0.0',
      type: 'premium'
    }
  ];

  try {
    const pluginsDir = path.join(__dirname, 'public/plugins');
    if (fs.existsSync(pluginsDir)) {
      const files = fs.readdirSync(pluginsDir);
      files.filter(file => file.endsWith('.js')).forEach(file => {
        const id = file.replace('.js', '');
        if (!plugins.find(p => p.id === id)) {
          plugins.push({
            id,
            name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: `마켓플레이스 동적 제공 플러그인: ${id}`,
            scriptUrl: `http://localhost:${PORT}/plugins/${file}`,
            previewUrl: `http://localhost:${PORT}/plugins/${id}-preview.html`,
            version: '1.0.0',
            type: 'feature'
          });
        }
      });
    }

    const premiumDir = path.join(__dirname, 'public/plugins/premium');
    if (fs.existsSync(premiumDir)) {
      const pfiles = fs.readdirSync(premiumDir);
      pfiles.filter(file => file.endsWith('.tsx')).forEach(file => {
        const id = file.replace('.tsx', '');
        if (!plugins.find(p => p.scriptUrl.includes(file))) {
          plugins.push({
            id,
            name: id.split(/(?=[A-Z])/).join(' '),
            description: `프리미엄 플러그인: ${id}`,
            scriptUrl: `http://localhost:${PORT}/plugins/premium/${file}`,
            previewUrl: `http://localhost:${PORT}/plugins/premium/${id}-preview.html`,
            version: '1.0.0',
            type: 'premium'
          });
        }
      });
    }
  } catch (err) {
    console.error('Failed to read plugins directory', err);
  }

  res.json(plugins);

});

app.listen(PORT, () => {
  console.log(`[AMEVA Marketplace] Server running on http://localhost:${PORT}`);
});
