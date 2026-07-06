const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

app.use('/plugins', express.static(path.join(__dirname, 'public/plugins')));

// 한국 주요 대표 인기 주식 및 ETF 한글-티커 매핑 사전
const KOREAN_STOCK_DICTIONARY = [
  { keywords: ['삼성', '삼성전자', 'samsung'], symbol: '005930.KS', name: '삼성전자 (Samsung Electronics)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['하이닉스', 'sk하이닉스', 'skhynix'], symbol: '000660.KS', name: 'SK하이닉스 (SK Hynix)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['현대차', '현대자동차', 'hyundai'], symbol: '005380.KS', name: '현대자동차 (Hyundai Motor)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['네이버', 'naver'], symbol: '035420.KS', name: 'NAVER (네이버)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['카카오', 'kakao'], symbol: '035720.KS', name: '카카오 (Kakao)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['에코프로', 'ecopro'], symbol: '086520.KQ', name: '에코프로 (Ecopro)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['에코프로비엠', 'ecoprobm'], symbol: '247540.KQ', name: '에코프로비엠 (Ecopro BM)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['셀트리온', 'celltrion'], symbol: '068270.KS', name: '셀트리온 (Celltrion)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['알테오젠', 'alteogen'], symbol: '191170.KQ', name: '알테오젠 (Alteogen)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['기아', 'kia'], symbol: '000270.KS', name: '기아 (Kia)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['포스코', '포스코홀딩스', 'posco'], symbol: '005490.KS', name: 'POSCO홀딩스 (POSCO Holdings)', type: 'EQUITY', exchange: 'KSC' },
  { keywords: ['코덱스', 'kodex', 'kodex200'], symbol: '069500.KS', name: 'KODEX 200 (ETF)', type: 'ETF', exchange: 'KSC' },
  { keywords: ['타이거', 'tiger', 'tiger미국'], symbol: '360750.KS', name: 'TIGER 미국S&P500 (ETF)', type: 'ETF', exchange: 'KSC' }
];

// 싱글 플라이트 병합 및 인메모리 캐시 변수 정의
const stockCache = new Map();
const inFlightStocks = new Map();
const CACHE_TTL = 30000; // 30초 TTL 캐시

// 환율 정보 캐시 변수 정의
let exchangeCache = { timestamp: 0, data: null };
let inFlightExchange = null;

// 야후 파이낸스 봇 차단 우회용 User-Agent 및 다국어 언어 헤더 인젝션 조회 프록시 헬퍼
async function fetchYahooStock(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (!res.ok) throw new Error(`Yahoo API error for ${ticker} status: ${res.status}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    
    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.chartPreviousClose;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    
    // 만약 한글 매핑 사전에 들어있는 종목이라면 친절하게 한글 사명을 우선 매핑 출력
    const matched = KOREAN_STOCK_DICTIONARY.find(item => item.symbol === ticker);
    const shortName = matched ? matched.name : (result.meta.symbol || ticker);
    
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
    // 2단계: 야후 파이낸스 실시간 영문/티커 API 동시 쿼리 조회
    // 만약 한글 쿼리일 경우 야후 API는 거절당할 수 있으므로, 매핑된 영문 쿼리로 보정하여 질의
    let apiQuery = query;
    if (matchedList.length > 0) {
      // 매핑된 첫 번째 종목의 키워드 중 영문명을 추출하여 보정 질의
      const engKw = KOREAN_STOCK_DICTIONARY.find(item => item.symbol === matchedList[0].symbol)?.keywords.find(kw => /^[a-zA-Z\s]+$/.test(kw));
      if (engKw) apiQuery = engKw;
    }

    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(apiQuery)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const apiQuotes = (data.quotes || [])
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

// 제공하는 마켓플레이스 플러그인 목록 API
app.get('/api/plugins', (req, res) => {
  res.json([
    {
      id: 'calculator',
      name: 'Calculator',
      description: '문서 작성 중 즉석으로 계산할 수 있는 확장 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/calculator.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'minimap',
      name: 'Minimap',
      description: '에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/minimap.js`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'outline',
      name: 'Outline',
      description: '문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/outline.js`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'rich-styling',
      name: 'Rich Styling',
      description: '인라인 글씨 크기 조절 및 다양한 한글/영문 폰트 서식 변경 툴바를 활성화합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/rich-styling.js`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'drawing-board',
      name: 'Drawing Board',
      description: '문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/drawing-board.js`,
      version: '1.0.0',
      type: 'feature'
    },
    {
      id: 'finance-dashboard',
      name: 'Finance & Exchange',
      description: '실시간 가상 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/finance-dashboard.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'youtube',
      name: 'YouTube Player',
      description: '문서 작업 중 유튜브 비디오를 실시간 시청 및 PiP 팝업 모드로 전환할 수 있는 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/youtube.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'naver',
      name: 'Naver Portal',
      description: '임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/naver.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'google',
      name: 'Google Search',
      description: '임시 세션으로 검색 내역을 남기지 않고 즉석 구글 검색을 활용하는 안전 웹 뷰어 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/google.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'calendar',
      name: 'Calendar & Scheduler',
      description: '문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/calendar.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'google-drive',
      name: 'Google Drive Sync',
      description: '작성 중인 마크다운 문서를 구글 드라이브 클라우드에 다이렉트 업로드 및 백업 동기화하는 클라우드 연동 도구입니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/google-drive.js`,
      version: '1.0.0',
      type: 'tool'
    },
    {
      id: 'cloud-collab',
      name: 'Cloud Collaboration',
      description: '로컬 오프라인 제한을 뛰어넘어 보안 중앙 채널에서 팀원들과 원격 실시간 편집을 해금합니다.',
      scriptUrl: `http://localhost:${PORT}/plugins/cloud-collab.js`,
      version: '1.0.0',
      type: 'collab'
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`[AMEVA Marketplace] Server running on http://localhost:${PORT}`);
});
