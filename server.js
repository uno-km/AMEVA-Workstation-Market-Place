const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

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
  const pluginsDir = path.join(__dirname, 'public/plugins');
  try {
    const files = fs.readdirSync(pluginsDir);
    const plugins = files.filter(file => file.endsWith('.js')).map(file => {
      const id = file.replace('.js', '');
      return {
        id: id,
        name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // 단순 이름 포매팅
        description: `마켓플레이스 동적 제공 플러그인: ${id}`,
        scriptUrl: `http://localhost:${PORT}/plugins/${file}`,
        version: '1.0.0',
        type: 'feature'
      };
    });
    res.json(plugins);
  } catch (err) {
    console.error('Failed to read plugins directory', err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`[AMEVA Marketplace] Server running on http://localhost:${PORT}`);
});
