/**
 * @file FinanceDashboardView.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/ai/FinanceDashboardView.tsx
 * @role Core module helper and integration logic
 * 
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/AppLayout.tsx): 레이아웃 그리드 내부 또는 플로팅 레이어 영역 내에서 그리기로 소비.
 * - 소비처 B (src/renderer/App.tsx): 전역 모달 매니저 및 뷰포트 상태 스위칭에 따라 동적 마운트되어 소비.
 * 
 * [책임 범위 - RESPONSIBILITY]
 * - 본 파일은 AMEVA 시스템 내에서 도메인 목적에 부합하는 연산 및 데이터 처리 흐름을 안전하게 캡슐화한다.
 * - 외부 라이브러리 및 하위 종속성을 조율하고 결과 규격을 일관되게 제공한다.
 * 
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 모든 예외 발생 시 에러를 침묵시키지 말고 에러 로그를 명확하게 남길 것.
 * - MUST NOT: TypeScript any 형식을 우회 수단으로 함부로 선언하지 말 것.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, X, ChevronDown, ChevronUp, FileText, Eye } from 'lucide-react';
const STOCK_MOCK_NEWS: Record<string, Array<{
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
}>> = {
  '^GSPC': [
    {
      id: 'gspc-1',
      title: 'S&P 500, 연준 금리 인하 기대감에 사상 최고가 랠리 지속',
      source: '블룸버그 파이낸셜',
      time: '10분 전',
      summary: '제롬 파월 연준 의장의 완화적 발언으로 금리 인하 사이클 도래 확신이 선 미국 증시가 테크 중심의 매수세에 힘입어 사상 최고치 경신 행진을 달리고 있습니다.'
    },
    {
      id: 'gspc-2',
      title: '인플레이션 지표 둔화 속 월가 기관들 "추가 상승 여력 충분"',
      source: '로이터 통신',
      time: '1시간 전',
      summary: '근원 소비자물가지수(CPI)가 예상을 하회하면서 거시 경제 불확실성이 해소되는 양상입니다. 골드만삭스를 비롯한 주요 IB는 S&P 500의 연말 목표치를 상향 조정했습니다.'
    }
  ],
  '^IXIC': [
    {
      id: 'ixic-1',
      title: '나스닥, 빅테크 강세 업고 20,000포인트 돌파 가시화',
      source: 'WSJ 테크',
      time: '5분 전',
      summary: '엔비디아, 애플, 마이크로소프트의 삼각 편대가 전반적인 인공지능(AI) 반도체 붐을 견인하고 있습니다. 나스닥 100 지수는 전일 대비 1.8% 상승 마감했습니다.'
    },
    {
      id: 'ixic-2',
      title: '중소형 기술주로도 AI 온기 확산... 중저가 반도체 장비 수요 급증',
      source: '마켓워치',
      time: '2시간 전',
      summary: '초대형 AI 가속기 위주의 상승장이 레거시 반도체 공급망 부품 사들로 넓어지며 나스닥 내 중소형 테크 스타트업들의 기업 가치가 동반 우상향하고 있습니다.'
    }
  ],
  '^KS11': [
    {
      id: 'ks11-1',
      title: '코스피, 외국인·기관 쌍끌이 매수에 2,800선 안착 시도',
      source: '연합인포맥스',
      time: '15분 전',
      summary: '반도체 대장주의 2분기 깜짝 실적(어닝서프라이즈) 예고에 힘입어 코스피가 외인들의 강력한 현물 순매수세를 바탕으로 견고한 흐름을 지속하고 있습니다.'
    },
    {
      id: 'ks11-2',
      title: '정부 "밸류업 가이드라인 강화 계획"... 주주 환원 우수 기업 세제 혜택',
      source: '한국경제',
      time: '3시간 전',
      summary: '금융당국이 코리아 디스카운트 해소를 위해 연말까지 배당 소득 분리과세 법안을 추진하겠다고 발표하면서, 저PBR 금융 및 지주사 위주로 강한 수급 유입이 발생했습니다.'
    }
  ],
  'AAPL': [
    {
      id: 'aapl-1',
      title: '애플, 자체 온디바이스 AI "Apple Intelligence" 출시 후 기기 교체 수요 급증',
      source: '테크크런치',
      time: '2분 전',
      summary: '아이폰 16 시리즈에 기본 탑재되는 신형 신경망 코어와 개인 맞춤형 AI 비서 기능이 얼리어답터를 넘어 대중 시장의 스마트폰 신규 교체 사이클을 강하게 자극하고 있습니다.'
    },
    {
      id: 'aapl-2',
      title: '애플 비전 프로 2세대 양산 돌입... 경량화 및 가격 접근성 향상',
      source: '9to5Mac',
      time: '45분 전',
      summary: '공급망 정보에 따르면 1세대 모델의 단점이었던 착용 무게를 15% 줄이고, 디스플레이 해상도를 강화한 보급형 공간 컴퓨터 헤드셋이 내년 상반기 조기 공개 예정입니다.'
    }
  ],
  'NVDA': [
    {
      id: 'nvda-1',
      title: '엔비디아, 차세대 블랙웰(Blackwell) 가속기 연말 출하량 전량 완판',
      source: 'DigiTimes',
      time: '1분 전',
      summary: 'TSMC의 CoWoS 어드밴스드 패키징 라인을 독점하다시피 한 엔비디아가 세계 하이퍼스케일 클라우드사(MS, 구글, 메타)들의 사전 예약 폭주로 향후 3개 분기 물량을 선점했습니다.'
    },
    {
      id: 'nvda-2',
      title: '자율주행용 칩 세트 "DRIVE Thor" 중국 자율차 신흥 거점 탑재 속도',
      source: '오토카 뉴스',
      time: '1시간 전',
      summary: '미국의 대중국 반도체 규제 우회 규격을 만족하면서도 차량 내 연산 처리 능력을 극대화한 신형 로보택시용 컴퓨터 모듈이 주요 전기차 브랜드 모델에 표준 탑재 계약을 맺었습니다.'
    }
  ],
  'TSLA': [
    {
      id: 'tsla-1',
      title: '테슬라 FSD V12, 규제당국 승인 임박에 자율주행 택시 사업 가시화',
      source: '일렉트렉',
      time: '8분 전',
      summary: '완전 엔드-투-엔드 신경망으로 교체된 Full Self-Driving 소프트웨어가 마일당 개입 횟수를 획기적으로 낮추면서 조만간 샌프란시스코 내 로보택시 면허 발급 가능성이 커졌습니다.'
    },
    {
      id: 'tsla-2',
      title: '기가팩토리 상하이, 3분기 생산 공정 최적화 완료... 모델 Y 주행거리 업그레이드',
      source: '시나파이낸스',
      time: '1.5시간 전',
      summary: '리튬인산철(LFP) 블레이드 배터리 장착 비율을 늘리고 기가캐스팅 설비를 고도화하여 조립 원가를 8% 추가 절감했습니다. 업그레이드된 차량은 주행 가능거리가 5% 상승합니다.'
    }
  ],
  'MSFT': [
    {
      id: 'msft-1',
      title: '마이크로소프트, GitHub Copilot 유료 구독자 200만 명 돌파',
      source: '인포월드',
      time: '12분 전',
      summary: '개발 환경의 차세대 AI 어시스턴트 유료 도입 증가세가 연 40% 이상의 가파른 성장을 견인하며, 클라우드 부문 마진을 기존 예측치보다 2.5%p 상향 개선시켰습니다.'
    },
    {
      id: 'msft-2',
      title: 'Azure AI, OpenAI 최신 모델 GPT-4o 멀티모달 서비스 전면 상용화',
      source: 'ZDNet',
      time: '2시간 전',
      summary: '음성, 비디오 실시간 인터랙션이 내장된 신규 API 엔드포인트를 글로벌 리전에 우선 배포하며 금융권 및 고객센터 자동화 솔루션 계약 수주를 대거 확보했습니다.'
    }
  ],
  '005930.KS': [
    {
      id: 'sec-1',
      title: '삼성전자, 3분기 HBM3E 12단 주요 고객사 납품 본격화',
      source: '디일렉',
      time: '5분 전',
      summary: '삼성전자가 5세대 고대역폭메모리(HBM)인 HBM3E 12단 제품의 엔비디아 등 주요 GPU 업체 신뢰성 테스트를 완료하고 본격적인 양산 납품에 돌입할 계획인 것으로 전해졌습니다.'
    },
    {
      id: 'sec-2',
      title: '파운드리 3나노 게이트올어라운드(GAA) 2세대 공정 수율 안정 궤도',
      source: '전자신문',
      time: '2시간 전',
      summary: '세계 최초로 GAA 아키텍처를 도입한 삼성전자가 3나노 2세대 미세 공정의 수율을 60% 이상으로 끌어올리며 글로벌 팹리스 고객사 유치 경쟁력을 강화하고 있습니다.'
    }
  ],
  '000660.KS': [
    {
      id: 'hynix-1',
      title: 'SK하이닉스, HBM 시장 지배력 기반 2분기 사상 최대 영업이익 전망',
      source: '조선비즈',
      time: '12분 전',
      summary: '독점 수준의 HBM3 및 HBM3E 공급 구도를 확립한 SK하이닉스가 서버용 고용량 eSSD 제품군의 동반 판매 호조로 2분기 5조 원을 상회하는 어닝 서프라이즈를 달성할 것으로 보입니다.'
    },
    {
      id: 'hynix-2',
      title: '차세대 HBM4 6세대 제품 개발 가속화... 세계 최초 패키징 혁신 예고',
      source: '디지털데일리',
      time: '3시간 전',
      summary: 'SK하이닉스가 파운드리 파트너사인 TSMC와의 베이스 다이 생산 협력을 강화하여 차세대 HBM4 16단 제품의 연내 설계 완료 및 내년 양산 일정을 공식화했습니다.'
    }
  ]
};

const DEFAULT_MOCK_NEWS = [
  {
    id: 'default-1',
    title: '글로벌 자금 흐름, 채권 시장에서 고위험 테크 주식으로 대거 이동',
    source: '파이낸셜 타임스',
    time: '20분 전',
    summary: '기준금리 인하 기조가 본격화됨에 따라 MMF에 묶여있던 대기성 자금이 글로벌 우량 성장주와 고배당 ETF로 유입되기 시작했습니다.'
  },
  {
    id: 'default-2',
    title: '원자재 시장 요동... 공급망 긴장 및 에너지 수요 반등에 원유 상승',
    source: 'CNBC',
    time: '2시간 전',
    summary: '지정학적 리스크 확산에 따른 글로벌 해상 운송 병목 현상과 제조업 가동률 회복세가 맞물려 서부 텍사스산 원유(WTI) 가격이 배럴당 80달러선 재진입을 모색하고 있습니다.'
  }
];

interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  currency: string;
  marketCap?: number;
  trailingPE?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  regularMarketVolume?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `INDEX_SYMBOLS`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const INDEX_SYMBOLS = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const INDEX_SYMBOLS = ['^GSPC', '^IXIC', '^KS11', '^N225', '^HSI', '^GDAXI'];
const INDEX_LABELS: Record<string, string> = {
  '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ', '^KS11': 'KOSPI',
  '^N225': '닛케이 225', '^HSI': '항셍', '^GDAXI': 'DAX',
};
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `FX_SYMBOLS`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const FX_SYMBOLS = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const FX_SYMBOLS = ['USDKRW=X', 'EURKRW=X', 'JPYKRW=X', 'CNYKRW=X'];
const FX_LABELS: Record<string, string> = {
  'USDKRW=X': 'USD / KRW', 'EURKRW=X': 'EUR / KRW',
  'JPYKRW=X': 'JPY / KRW', 'CNYKRW=X': 'CNY / KRW',
};
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `INTEREST_RATES`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const INTEREST_RATES = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const INTEREST_RATES = [
  { label: '미국 기준금리', value: '5.25~5.50%', note: 'Fed · 2024' },
  { label: '한국 기준금리', value: '3.50%', note: 'BOK · 2024' },
];
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `DEFAULT_STOCK_SYMBOLS`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const DEFAULT_STOCK_SYMBOLS = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const DEFAULT_STOCK_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', '005930.KS'];
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `AUTO_REFRESH_MS`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const AUTO_REFRESH_MS = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const AUTO_REFRESH_MS = 60000;

async function fetchQuotesBatch(symbols: string[]): Promise<StockQuote[]> {
  /*
   * [FIX-FINANCE-IPC] 렌더러의 fetch -> 메인 프로세스 IPC 위임으로 전환.
   * - 기존: 렌더러에서 query2.finance.yahoo.com 직접 fetch -> CORS/Cookie 차단으로 403 발생.
   * - 변경: window.electronAPI.getFinanceQuotes() IPC 채널을 통해 메인 프로세스가 Node.js fetch로 대신 조회.
   *
   * [FIX-FINANCE-FALLBACK-002] IPC 실패 시 마켓플레이스 서버(3010) 프록시로 3단계 폴백 체인 구성.
   * - 1단계: Electron IPC getFinanceQuotes (메인 프로세스 Node.js fetch — Yahoo v7)
   * - 2단계: 마켓플레이스 서버 /api/finance/stock-detail 프록시 (Yahoo v8 기반 — 더 안정적)
   * - 3단계: 렌더러 직접 fetch (비 Electron 환경 최후 폴백)
   */

  // 1단계: Electron IPC 채널을 통한 메인 프로세스 조회
  try {
    const api = (window as Window & { electronAPI?: { getFinanceQuotes?: (symbols: string[]) => Promise<{ success: boolean; result: StockQuote[]; error?: string }> } }).electronAPI
    if (api?.getFinanceQuotes) {
      const res = await api.getFinanceQuotes(symbols)
      if (res.success && res.result.length > 0) return res.result
      console.warn('[FinanceDashboard] IPC 결과 없음 또는 실패 — 마켓플레이스 서버로 폴백:', res.error)
    }
  } catch (ipcErr) {
    console.error('[FinanceDashboard] IPC 채널 오류:', ipcErr)
  }

  // 2단계: 마켓플레이스 서버 v8 기반 프록시 (심볼별 병렬 요청)
  // [ADAPTER-FINANCE-002] 마켓플레이스 서버 응답({ ticker, name, price, changePercent })을
  // StockQuote 인터페이스({ symbol, shortName, regularMarketPrice, ... })로 변환한다.
  try {
    const marketplaceResults = await Promise.allSettled(
      symbols.map(async (sym) => {
        const res = await fetch(
          `https://uno-km.github.io/AMEVA-Workstation-Market-Place/api/finance/stock-detail.json`,
          { signal: AbortSignal.timeout(6000) }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() as { success: boolean; stock?: { ticker: string; name: string; price: number; changePercent: number } }
        if (!json.success || !json.stock) throw new Error('No data')
        const s = json.stock
        return {
          symbol: s.ticker,
          shortName: s.name,
          regularMarketPrice: s.price,
          regularMarketChangePercent: s.changePercent,
          regularMarketChange: 0,
          currency: (sym.endsWith('.KS') || sym.endsWith('.KQ')) ? 'KRW' : 'USD',
        } as StockQuote
      })
    )
    const settled = marketplaceResults
      .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
      .map(r => r.value)
    if (settled.length > 0) return settled
    console.warn('[FinanceDashboard] 마켓플레이스 서버도 결과 없음 — 직접 fetch 시도')
  } catch (mktErr) {
    console.error('[FinanceDashboard] 마켓플레이스 서버 프록시 실패:', mktErr)
  }

  // 3단계: 비 Electron 환경 또는 최후 폴백 — 렌더러 직접 fetch
  try {
    const fields = 'shortName,regularMarketPrice,regularMarketChangePercent,regularMarketChange,currency,marketCap,trailingPE,fiftyTwoWeekLow,fiftyTwoWeekHigh,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow'
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&fields=${fields}`
    const res2 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) })
    if (!res2.ok) throw new Error('HTTP ' + res2.status)
    const data = await res2.json() as { quoteResponse?: { result?: StockQuote[] } }
    return data?.quoteResponse?.result || []
  } catch (e) {
    console.error('[FinanceDashboard] 직접 fetch 폴백도 실패:', e)
    return []
  }
}

const fmt = (n?: number, d = 2) => n != null && !isNaN(n) ? n.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '-';
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `fmtVol`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const fmtVol = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const fmtVol = (n?: number) => !n ? '-' : n >= 1e9 ? (n/1e9).toFixed(1) + 'B' : n >= 1e6 ? (n/1e6).toFixed(1) + 'M' : n >= 1e3 ? (n/1e3).toFixed(1) + 'K' : String(n);
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `fmtCap`
       * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
       * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
       * - 예시 코드: `const fmtCap = ...` 형태로 안전 캐싱 후 가공 기동.
       */
const fmtCap = (n?: number) => !n ? '-' : n >= 1e12 ? '$' + (n/1e12).toFixed(2) + 'T' : n >= 1e9 ? '$' + (n/1e9).toFixed(1) + 'B' : '$' + (n/1e6).toFixed(0) + 'M';

const KOREAN_STOCK_LABELS: Record<string, string> = {
  '005930.KS': '삼성전자',
  '000660.KS': 'SK하이닉스',
  '066570.KS': 'LG전자',
  '051910.KS': 'LG화학',
  '373220.KS': 'LG에너지솔루션',
  '005380.KS': '현대자동차',
  '035420.KS': 'NAVER',
  '035720.KS': '카카오',
  '086520.KQ': '에코프로',
  '247540.KQ': '에코프로비엠',
  '068270.KS': '셀트리온',
  '191170.KQ': '알테오젠',
  '000270.KS': '기아',
  '005490.KS': 'POSCO홀딩스',
  '069500.KS': 'KODEX 200',
  '360750.KS': 'TIGER 미국S&P500'
};

const getDisplayName = (q: StockQuote) => {
  if (INDEX_LABELS[q.symbol]) return INDEX_LABELS[q.symbol];
  if (FX_LABELS[q.symbol]) return FX_LABELS[q.symbol];
  if (q.symbol === '^TNX') return '미 10Y 국채 수익률';
  
  const symbolClean = q.symbol.replace(/^\^/, '');
  if (KOREAN_STOCK_LABELS[q.symbol]) {
    return `${KOREAN_STOCK_LABELS[q.symbol]} (${symbolClean})`;
  }
  
  const name = q.shortName && q.shortName !== q.symbol ? q.shortName : symbolClean;
  return `${name} (${symbolClean})`;
};

function Sparkline({ isUp }: { isUp: boolean }) {
  const points = isUp 
    ? '0,20 10,18 20,22 30,12 40,15 50,8 60,14 70,5 80,10 90,2'
    : '0,5 10,8 20,6 30,15 40,12 50,18 60,16 70,22 80,20 90,24';
  const color = isUp ? '#34d399' : '#ef4444';
  return (
    <svg width="90" height="26" viewBox="0 0 90 26" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0px 1px 3px ${color}55)` }}
      />
    </svg>
  );
}

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `SectionTitle`
   * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
   * - 예시: `SectionTitle(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
   */
function SectionTitle({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 0 4px', marginBottom: '4px', borderBottom: '1px solid var(--border-muted)' }}>
      <span style={{ fontSize: '10px' }}>{icon}</span>
      <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `QuoteRow`
   * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
   * - 예시: `QuoteRow(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
   */
function QuoteRow({ symbol, label, price, pct, currency = '', isUp, onClick, isActive, onContextMenu, draggable, onDragStart, hideSymbolLine }: {
  symbol: string; label: string; price: number; pct: number
  currency?: string; isUp: boolean; onClick?: () => void; isActive?: boolean; onContextMenu?: (e: React.MouseEvent) => void
  draggable?: boolean; onDragStart?: (e: React.DragEvent) => void; hideSymbolLine?: boolean
}) {
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `bg`
       * - 자료형 / 예상 값: 활성 여부 및 등락 상태에 따른 동적 배경색 값.
       */
  const bg = isActive
    ? (isUp ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)')
    : (isUp ? 'rgba(52,211,153,0.03)' : 'rgba(239,68,68,0.03)');

      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `border`
       * - 자료형 / 예상 값: 활성 여부 및 등락 상태에 따른 동적 테두리 색상 값.
       */
  const border = isActive
    ? (isUp ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)')
    : (isUp ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)');

  const cleanSymbol = symbol.replace(/^\^/, '');

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '7px', background: bg, border: '1px solid ' + border, cursor: (onClick || onContextMenu || draggable) ? 'grab' : 'default', transition: 'background 0.12s', marginBottom: '3px' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = isUp ? 'rgba(52,211,153,0.09)' : 'rgba(239,68,68,0.09)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = bg)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
        <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>{label}</span>
        {!hideSymbolLine && label !== cleanSymbol && <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{cleanSymbol}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px', flexShrink: 0, marginLeft: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
          {fmt(price)} <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 400 }}>{currency}</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {isUp ? <TrendingUp size={9} color="#34d399" /> : <TrendingDown size={9} color="#ef4444" />}
          <span style={{ fontSize: '9.5px', fontWeight: 600, color: isUp ? '#34d399' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
            {(isUp ? '+' : '') + fmt(pct)}%
          </span>
        </div>
      </div>
    </div>
  );
}

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `DetailPanel`
   * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
   * - 예시: `DetailPanel(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
   */
function DetailPanel({ q, onClose }: { q: StockQuote; onClose: () => void }) {
      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `isUp`
       * - 자료형 / 예상 값: q.regularMarketChangePercent가 0 이상인지 판단한 boolean 값.
       * - 시나리오: 본 패널의 색상 테마 및 화살표 방향 결정에 소비됨.
       */
  const isUp = q.regularMarketChangePercent >= 0;

  const cleanSymbol = q.symbol.replace(/^\^/, '');

      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `newsList`
       * - 자료형 / 예상 값: STOCK_MOCK_NEWS 맵에서 찾은 해당 심볼의 뉴스 목록 또는 기본 default 뉴스 목록.
       * - 시나리오: 하단 뉴스 리스트 렌더링에 반복적으로 맵핑되어 노출됨.
       */
  const newsList = STOCK_MOCK_NEWS[q.symbol] || DEFAULT_MOCK_NEWS;

      /*
       * [FUNCTION CONTRACT]
       * - 함수 명: `handleInsert`
       * - 역할: 현재가, 고가, 거래량 등 시세 정보를 마크다운 표로 만들어 에디터에 삽입한다.
       */
  const isIndex = q.type === 'INDEX' || q.symbol.startsWith('^');

  const handleInsert = () => {
    const now = new Date().toLocaleString('ko-KR');
    let md = '';
    if (isIndex) {
      md = [
        '### 📊 ' + getDisplayName(q) + ' 지수 스냅샷',
        '> 기준: ' + now,
        '',
        '| 지수 지표 | 실시간 정보 |',
        '|------|------|',
        '| **현재 지수** | **' + fmt(q.regularMarketPrice) + ' ' + (q.currency || '') + '** |',
        '| **등락폭** | ' + (isUp ? '▲' : '▼') + ' ' + fmt(Math.abs(q.regularMarketChange || 0)) + '포인트 (' + (isUp ? '+' : '') + fmt(q.regularMarketChangePercent || 0) + '%) |',
      ].join('\n');
    } else {
      md = [
        '### 📊 ' + getDisplayName(q) + ' 시세 스냅샷',
        '> 기준: ' + now,
        '',
        '| 항목 | 값 |',
        '|------|------|',
        '| 현재가 | **' + fmt(q.regularMarketPrice) + ' ' + q.currency + '** |',
        '| 등락 | ' + (isUp ? '▲' : '▼') + ' ' + fmt(Math.abs(q.regularMarketChange || 0)) + ' (' + (isUp ? '+' : '') + fmt(q.regularMarketChangePercent || 0) + '%) |',
        '| 시가 | ' + fmt(q.regularMarketOpen) + ' |',
        '| 고가 | ' + fmt(q.regularMarketDayHigh) + ' |',
        '| 저가 | ' + fmt(q.regularMarketDayLow) + ' |',
        '| 거래량 | ' + fmtVol(q.regularMarketVolume) + ' |',
        '| 시가총액 | ' + fmtCap(q.marketCap) + ' |',
        q.trailingPE ? '| PER | ' + fmt(q.trailingPE) + ' |' : null,
        '| 52주 범위 | ' + fmt(q.fiftyTwoWeekLow) + ' ~ ' + fmt(q.fiftyTwoWeekHigh) + ' |',
      ].filter(Boolean).join('\n');
    }
    window.dispatchEvent(new CustomEvent('ameva:insert-text', { detail: md }));
  };

      /*
       * [FUNCTION CONTRACT]
       * - 함수 명: `handleInsertNews`
       * - 역할: 선택한 뉴스의 헤드라인과 요약을 인용구 형식 마크다운으로 에디터에 전파한다.
       */
  const handleInsertNews = (news: typeof newsList[0]) => {
    const md = [
      `### 📰 [뉴스] ${news.title}`,
      `> 출처: ${news.source} · 스크랩 시점: ${new Date().toLocaleString('ko-KR')}`,
      `>`,
      `> ${news.summary}`,
      `>`,
      `> *본 뉴스 정보는 금융 탭에서 본문으로 스크랩되었습니다.*`
    ].join('\n');
    window.dispatchEvent(new CustomEvent('ameva:insert-text', { detail: md }));
  };

      /*
       * [RUN-TIME STATE / INVARIANT]
       * - 변수 명: `rows`
       * - 자료형 / 예상 값: 라벨과 가공된 포맷 가격의 튜플 쌍 2차원 배열.
       * - 시나리오: 상세 지표 테이블 렌더링에 반복적으로 소비됨.
       */
  const rows = [
    ['시가', fmt(q.regularMarketOpen)], ['고가', fmt(q.regularMarketDayHigh)],
    ['저가', fmt(q.regularMarketDayLow)], ['거래량', fmtVol(q.regularMarketVolume)],
    ['시가총액', fmtCap(q.marketCap)], ['PER', q.trailingPE ? fmt(q.trailingPE) : '-'],
    ['52주 고가', fmt(q.fiftyTwoWeekHigh)], ['52주 저가', fmt(q.fiftyTwoWeekLow)],
  ];

  return (
    <div 
      style={{ 
        margin: '0 0 6px', padding: '10px', borderRadius: '8px', 
        background: 'var(--bg-glass, rgba(15, 15, 20, 0.4))', 
        border: '1px solid ' + (isUp ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'),
        animation: 'financeAccordionOpen 0.25s ease-out forwards',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes financeAccordionOpen {
          from { max-height: 0; opacity: 0; transform: translateY(-5px); }
          to { max-height: 1200px; opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-main)' }}>{getDisplayName(q) + ' 상세 정보'}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
          <X size={13} />
        </button>
      </div>
      
      {isIndex ? (
        <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>현재 지수</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{fmt(q.regularMarketPrice)} {q.currency || ''}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>전일 대비 등락폭</span>
            <span style={{ fontWeight: 'bold', color: isUp ? '#34d399' : '#ef4444', fontFamily: 'var(--font-mono)' }}>{isUp ? '▲' : '▼'} {fmt(Math.abs(q.regularMarketChange || 0))} 포인트</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>등락율</span>
            <span style={{ fontWeight: 'bold', color: isUp ? '#34d399' : '#ef4444', fontFamily: 'var(--font-mono)' }}>{(isUp ? '+' : '') + fmt(q.regularMarketChangePercent || 0)}%</span>
          </div>
        </div>
      ) : (
        /* 상세 수치 그리드 */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', marginBottom: '10px' }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 시세 표 삽입 버튼 */}
      <button
        onClick={handleInsert}
        style={{ width: '100%', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--primary)', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'background 0.15s', marginBottom: '10px' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.22)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.12)')}
      >
        <FileText size={11} /> 본문에 시세 삽입 (마크다운 표)
      </button>

      {/* 실시간 종목 뉴스 목록 섹션 */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
        <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          📰 실시간 종목 뉴스 (클릭 시 본문 스크랩)
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {newsList.map(n => (
            <div
              key={n.id}
              onClick={() => handleInsertNews(n)}
              style={{
                padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{n.title}</span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{n.time}</span>
              </div>
              <p style={{ fontSize: '8.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3, textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {n.summary}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                <span style={{ fontSize: '7.5px', color: 'var(--primary)' }}>{n.source}</span>
                <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', opacity: 0.6 }}>스크랩하기 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `FinanceDashboardView`
   * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
   * - 예시: `FinanceDashboardView(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
   */
export function FinanceDashboardView() {
  const [indexQ, setIndexQ] = useState<StockQuote[]>([]);
  const [fxQ, setFxQ] = useState<StockQuote[]>([]);
  const [bondQ, setBondQ] = useState<StockQuote | null>(null);
  const [stockQ, setStockQ] = useState<StockQuote[]>([]);
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_STOCK_SYMBOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [searchDetailStock, setSearchDetailStock] = useState<StockQuote | null>(null);
  const [isSearchDetailExpanded, setIsSearchDetailExpanded] = useState(false);

  // 실시간 한글/영어 종목 검색 디바운스 이펙트
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryUrl = `https://uno-km.github.io/AMEVA-Workstation-Market-Place/api/finance/search.json`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.quotes)) {
            setSearchResults(json.quotes);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSearched = async (symbolToAdd: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchDetailExpanded(false);
    try {
      const quotes = await fetchQuotesBatch([symbolToAdd]);
      if (quotes.length > 0) {
        setSearchDetailStock(quotes[0]);
      }
    } catch (err) {
      console.error('Search detail fetch error:', err);
    }
  };

  const handleAddWatchlist = (symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    if (sym && !symbols.includes(sym)) {
      setSymbols(p => [...p, sym]);
    }
  };

  const handleDragStart = (e: React.DragEvent, q: StockQuote) => {
    const isUp = q.regularMarketChangePercent >= 0;
    const now = new Date().toLocaleString('ko-KR');
    const displayName = getDisplayName(q);

    const md = [
      `### 📊 ${displayName} 시세 스냅샷`,
      `> 📅 **기준 시점:** ${now}`,
      '',
      '| 금융 지표 | 실시간 시세 정보 |',
      '| :--- | :--- |',
      `| **현재가 (Price)** | **${fmt(q.regularMarketPrice)} ${q.currency || ''}** |`,
      `| **등락 (Change)** | ${isUp ? '🟢' : '🔴'} **${isUp ? '▲' : '▼'} ${fmt(Math.abs(q.regularMarketChange || 0))} (${isUp ? '+' : ''}${fmt(q.regularMarketChangePercent || 0)}%)** |`,
      q.regularMarketOpen ? `| **시가 (Open)** | ${fmt(q.regularMarketOpen)} |` : null,
      (q.regularMarketDayHigh || q.regularMarketDayLow) ? `| **하루 변동 (Day Range)** | ${fmt(q.regularMarketDayLow)} ~ ${fmt(q.regularMarketDayHigh)} |` : null,
      (q.fiftyTwoWeekLow || q.fiftyTwoWeekHigh) ? `| **52주 변동 (52W Range)** | ${fmt(q.fiftyTwoWeekLow)} ~ ${fmt(q.fiftyTwoWeekHigh)} |` : null,
      q.regularMarketVolume ? `| **거래량 (Volume)** | ${fmtVol(q.regularMarketVolume)} |` : null,
      q.marketCap ? `| **시가총액 (Market Cap)** | ${fmtCap(q.marketCap)} |` : null,
      q.trailingPE ? `| **PER** | ${fmt(q.trailingPE)} |` : null,
    ].filter(Boolean).join('\n');

    e.dataTransfer.setData('text/plain', md);
    e.dataTransfer.effectAllowed = 'copy';
  };

  /*
   * [RUN-TIME STATE / INVARIANT]
   * - 변수 명: `contextMenu`
   * - 자료형 / 예상 값: 우클릭 마우스 좌표 및 대상 종목 쿼리를 포함한 Object 또는 null.
   * - 시나리오: 커스텀 우클릭 팝업 창의 노출 조율에 소비됨.
   */
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; symbol: string; q: StockQuote
  } | null>(null);

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `handleContextMenu`
   * - 역할: 주식 항목 우클릭 이벤트를 차단하고 해당 마우스 좌표에 컨텍스트 메뉴 데이터를 수립한다.
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, symbol: string, q: StockQuote) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, symbol, q });
  }, []);

  /*
   * [FUNCTION CONTRACT]
   * - 함수 명: `handleInsertDirect`
   * - 역할: 우클릭 메뉴 액션 트리거 시, 디테일 패널 개방 없이 바로 해당 시세 정보를 마크다운 표로 에디터에 삽입한다.
   */
  const handleInsertDirect = (q: StockQuote) => {
    const isUp = q.regularMarketChangePercent >= 0;
    const now = new Date().toLocaleString('ko-KR');
    const displayName = getDisplayName(q);

    const md = [
      `### 📊 ${displayName} 시세 스냅샷`,
      `> 📅 **기준 시점:** ${now}`,
      '',
      '| 금융 지표 | 실시간 시세 정보 |',
      '| :--- | :--- |',
      `| **현재가 (Price)** | **${fmt(q.regularMarketPrice)} ${q.currency || ''}** |`,
      `| **등락 (Change)** | ${isUp ? '🟢' : '🔴'} **${isUp ? '▲' : '▼'} ${fmt(Math.abs(q.regularMarketChange || 0))} (${isUp ? '+' : ''}${fmt(q.regularMarketChangePercent || 0)}%)** |`,
      q.regularMarketOpen ? `| **시가 (Open)** | ${fmt(q.regularMarketOpen)} |` : null,
      (q.regularMarketDayHigh || q.regularMarketDayLow) ? `| **하루 변동 (Day Range)** | ${fmt(q.regularMarketDayLow)} ~ ${fmt(q.regularMarketDayHigh)} |` : null,
      (q.fiftyTwoWeekLow || q.fiftyTwoWeekHigh) ? `| **52주 변동 (52W Range)** | ${fmt(q.fiftyTwoWeekLow)} ~ ${fmt(q.fiftyTwoWeekHigh)} |` : null,
      q.regularMarketVolume ? `| **거래량 (Volume)** | ${fmtVol(q.regularMarketVolume)} |` : null,
      q.marketCap ? `| **시가총액 (Market Cap)** | ${fmtCap(q.marketCap)} |` : null,
      q.trailingPE ? `| **PER** | ${fmt(q.trailingPE)} |` : null,
    ].filter(Boolean).join('\n');
    window.dispatchEvent(new CustomEvent('ameva:insert-text', { detail: md }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = searchQuery.toUpperCase().trim();
    if (!sym) return;

    if (searchResults.length > 0) {
      handleSelectSearched(searchResults[0].symbol);
    } else {
      if (!symbols.includes(sym)) {
        setSymbols(p => [...p, sym]);
      }
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const skel = (n: number) => [...Array(n)].map((_, i) => (
    <div key={i} style={{ height: '32px', borderRadius: '7px', background: 'var(--bg-glass)', marginBottom: '3px', opacity: 0.45 }} />
  ));

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await fetchQuotesBatch([...INDEX_SYMBOLS, ...FX_SYMBOLS, '^TNX', ...symbols]);
      setIndexQ(all.filter(q => INDEX_SYMBOLS.includes(q.symbol)));
      setFxQ(all.filter(q => FX_SYMBOLS.includes(q.symbol)));
      setBondQ(all.find(q => q.symbol === '^TNX') || null);
      setStockQ(all.filter(q => symbols.includes(q.symbol)));
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) {
      setError('시세 데이터를 불러오지 못했습니다. 네트워크를 확인하세요.');
      console.error('[FinanceDashboard] fetch 실패:', e);
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={13} color="#34d399" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>글로벌 금융 대시보드</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {lastUpdated && <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>{lastUpdated} 갱신</span>}
          <button onClick={refresh} disabled={isLoading} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }} title="새로고침">
            <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div className="finance-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {error && <div style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '10px', color: '#ef4444', marginBottom: '8px' }}>⚠️ {error}</div>}
 
        {/* 상단 종목 검색 및 실시간 인스펙터 */}
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <SectionTitle label="종목 검색" icon="🔍" />
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '5px', marginBottom: '8px', position: 'relative' }}>
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="종목명 또는 심볼 검색 (예: 삼성전자, AAPL)"
              style={{ flex: 1, padding: '6px 9px', borderRadius: '6px', background: 'var(--bg-glass, rgba(255,255,255,0.03))', border: '1px solid var(--border-muted, rgba(255,255,255,0.08))', color: 'var(--text-main)', fontSize: '10.5px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--primary)', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Search size={10} /> 검색
            </button>

            {/* 자동완성 검색 추천 드롭다운 패널 */}
            {searchResults.length > 0 && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  background: 'var(--bg-deep, #0b0c10)', 
                  border: '1px solid var(--border-muted, rgba(255,255,255,0.08))', 
                  borderRadius: '6px', 
                  zIndex: 2000, 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  marginTop: '4px', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                {searchResults.map(item => (
                  <div 
                    key={item.symbol} 
                    onClick={() => handleSelectSearched(item.symbol)} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 10px', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid rgba(255,255,255,0.03)' 
                    }} 
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} 
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{item.symbol.replace(/^\^/, '')} · {item.exchange} ({item.type})</span>
                    </div>
                    <span style={{ fontSize: '9px', color: '#34d399', fontWeight: 600, alignSelf: 'center', flexShrink: 0, marginLeft: '8px' }}>선택</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* 검색한 종목 정보 및 차트, 추가 버튼 카드 */}
          {searchDetailStock && (() => {
            const q = searchDetailStock;
            const isUp = q.regularMarketChangePercent >= 0;
            const inWatchlist = symbols.includes(q.symbol);
            const displayName = getDisplayName(q);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-glass, rgba(15, 15, 20, 0.4))', 
                    border: '1px solid ' + (isUp ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'),
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}
                >
                  <button 
                    onClick={() => {
                      setSearchDetailStock(null);
                      setIsSearchDetailExpanded(false);
                    }} 
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
                  >
                    <X size={10} />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 2, textAlign: 'left' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {displayName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        {fmt(q.regularMarketPrice)} <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 400 }}>{q.currency || ''}</span>
                      </span>
                      <span style={{ fontSize: '8.5px', fontWeight: 600, color: isUp ? '#34d399' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
                        {isUp ? '▲' : '▼'} {fmt(Math.abs(q.regularMarketChange || 0))} ({(isUp ? '+' : '') + fmt(q.regularMarketChangePercent || 0)}%)
                      </span>
                    </div>
                  </div>

                  {/* 미니 스파크라인 차트 */}
                  <div style={{ flex: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
                    <Sparkline isUp={isUp} />
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0, marginLeft: '6px' }}>
                    <button 
                      onClick={() => handleInsertDirect(q)}
                      style={{ 
                        padding: '5px 8px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        background: 'rgba(139,92,246,0.12)', 
                        border: '1px solid rgba(139,92,246,0.3)',
                        color: '#a78bfa', 
                        fontSize: '9.5px', 
                        fontWeight: 700,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
                    >
                      본문에 넣기
                    </button>
                    <button 
                      onClick={() => {
                        setIsSearchDetailExpanded(prev => !prev);
                      }}
                      style={{ 
                        padding: '5px 8px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        background: isSearchDetailExpanded ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)', 
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#f59e0b', 
                        fontSize: '9.5px', 
                        fontWeight: 700,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.22)'}
                      onMouseLeave={e => !isSearchDetailExpanded && (e.currentTarget.style.background = 'rgba(245,158,11,0.12)')}
                    >
                      {isSearchDetailExpanded ? '뉴스 닫기' : '뉴스 보기'}
                    </button>
                    <button 
                      onClick={() => handleAddWatchlist(q.symbol)}
                      disabled={inWatchlist}
                      style={{ 
                        padding: '5px 8px', 
                        borderRadius: '5px', 
                        cursor: inWatchlist ? 'default' : 'pointer', 
                        background: inWatchlist ? 'rgba(255,255,255,0.04)' : 'rgba(52,211,153,0.12)', 
                        border: '1px solid ' + (inWatchlist ? 'rgba(255,255,255,0.08)' : 'rgba(52,211,153,0.3)'), 
                        color: inWatchlist ? 'var(--text-muted)' : '#34d399', 
                        fontSize: '9.5px', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => !inWatchlist && (e.currentTarget.style.background = 'rgba(52,211,153,0.22)')}
                      onMouseLeave={e => !inWatchlist && (e.currentTarget.style.background = 'rgba(52,211,153,0.12)')}
                    >
                      {inWatchlist ? '✓ 추가됨' : '+ 관심종목'}
                    </button>
                  </div>
                </div>
                {isSearchDetailExpanded && (
                  <DetailPanel q={q} onClose={() => setIsSearchDetailExpanded(false)} />
                )}
              </div>
            );
          })()}
        </div>

        <SectionTitle label="세계 주요 지수" icon="🌐" />
        {isLoading && indexQ.length === 0 ? skel(6) : indexQ.map(q => {
          const isUp = q.regularMarketChangePercent >= 0;
          const isExpanded = expandedSymbol === q.symbol;
          return (
            <div key={q.symbol}>
              <QuoteRow
                symbol={q.symbol} label={INDEX_LABELS[q.symbol] || q.symbol.replace(/^\^/, '')}
                price={q.regularMarketPrice} pct={q.regularMarketChangePercent}
                currency={q.currency} isUp={isUp}
                onClick={() => setExpandedSymbol(p => p === q.symbol ? null : q.symbol)}
                isActive={isExpanded}
                onContextMenu={(e) => handleContextMenu(e, q.symbol, q)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, q)}
              />
              {isExpanded && <DetailPanel q={q} onClose={() => setExpandedSymbol(null)} />}
            </div>
          );
        })}
 
        <div style={{ marginTop: '12px' }}>
          <SectionTitle label="주요 환율" icon="💱" />
          {isLoading && fxQ.length === 0 ? skel(4) : fxQ.map(q => {
            const isUp = q.regularMarketChangePercent >= 0;
            const isExpanded = expandedSymbol === q.symbol;
            return (
              <div key={q.symbol}>
                <QuoteRow
                  symbol={q.symbol} label={FX_LABELS[q.symbol] || q.symbol.replace(/^\^/, '')}
                  price={q.regularMarketPrice} pct={q.regularMarketChangePercent}
                  isUp={isUp}
                  onClick={() => setExpandedSymbol(p => p === q.symbol ? null : q.symbol)}
                  isActive={isExpanded}
                  onContextMenu={(e) => handleContextMenu(e, q.symbol, q)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, q)}
                />
                {isExpanded && <DetailPanel q={q} onClose={() => setExpandedSymbol(null)} />}
              </div>
            );
          })}
        </div>
 
        <div style={{ marginTop: '12px' }}>
          <SectionTitle label="주요 금리" icon="📊" />
          {bondQ && (() => {
            const isUp = bondQ.regularMarketChangePercent >= 0;
            const isExpanded = expandedSymbol === bondQ.symbol;
            return (
              <div key={bondQ.symbol}>
                <QuoteRow
                  symbol="^TNX" label="미 10Y 국채 수익률"
                  price={bondQ.regularMarketPrice} pct={bondQ.regularMarketChangePercent}
                  currency="%" isUp={isUp}
                  onClick={() => setExpandedSymbol(p => p === bondQ.symbol ? null : bondQ.symbol)}
                  isActive={isExpanded}
                  onContextMenu={(e) => handleContextMenu(e, bondQ.symbol, bondQ)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, bondQ)}
                />
                {isExpanded && <DetailPanel q={bondQ} onClose={() => setExpandedSymbol(null)} />}
              </div>
            );
          })()}
          {INTEREST_RATES.map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '3px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' }}>{r.label}</span>
                <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>{r.note}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#facc15', fontFamily: 'var(--font-mono)' }}>{r.value}</span>
            </div>
          ))}
        </div>
 
        <div style={{ marginTop: '12px' }}>
          <SectionTitle label="관심 종목" icon="⭐" />
 
          {stockQ.map(q => {
            const isUp = q.regularMarketChangePercent >= 0;
            const isExpanded = expandedSymbol === q.symbol;
            const itemLabel = getDisplayName(q);
            return (
              <div key={q.symbol}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <div style={{ flex: 1 }}>
                    <QuoteRow
                      symbol={q.symbol} label={itemLabel}
                      price={q.regularMarketPrice} pct={q.regularMarketChangePercent}
                      currency={q.currency} isUp={isUp}
                      onClick={() => setExpandedSymbol(p => p === q.symbol ? null : q.symbol)}
                      isActive={isExpanded}
                      onContextMenu={(e) => handleContextMenu(e, q.symbol, q)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, q)}
                      hideSymbolLine={true}
                    />
                  </div>
                  <button onClick={() => setExpandedSymbol(p => p === q.symbol ? null : q.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }} title={isExpanded ? '접기' : '상세 보기'}>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button onClick={() => { setSymbols(p => p.filter(s => s !== q.symbol)); if (expandedSymbol === q.symbol) setExpandedSymbol(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }} title="제거">
                    <X size={11} />
                  </button>
                </div>
                {isExpanded && <DetailPanel q={q} onClose={() => setExpandedSymbol(null)} />}
              </div>
            );
          })}
 
          {stockQ.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '10px', padding: '16px' }}>위에서 종목 코드를 추가하세요.</div>
          )}
        </div>
        <div style={{ height: '20px' }} />
      </div>

      {/* 우클릭 사제 컨텍스트 메뉴 팝업 */}
      {contextMenu && (
        <StockContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          symbol={contextMenu.symbol}
          onInsert={() => handleInsertDirect(contextMenu.q)}
          onDetail={() => setExpandedSymbol(contextMenu.symbol)}
          onDismiss={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface StockContextMenuProps {
  x: number;
  y: number;
  symbol: string;
  onInsert: () => void;
  onDetail: () => void;
  onDismiss: () => void;
}

/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `StockContextMenu`
 * - 역할: 주식 항목 우클릭 시 호출되며 [본문에 넣기, 자세히 보기] 기능을 제안하는 컨텍스트 윈도우를 띄운다.
 */
function StockContextMenu({ x, y, symbol, onInsert, onDetail, onDismiss }: StockContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const safeX = Math.min(x, window.innerWidth - 160);
  const safeY = Math.min(y, window.innerHeight - 100);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    const id = setTimeout(() => window.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(id);
      window.removeEventListener('mousedown', handler);
    };
  }, [onDismiss]);

  const btnStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', color: 'var(--text-main)',
    padding: '8px 12px', textAlign: 'left', cursor: 'pointer',
    fontSize: '11px', borderRadius: '4px', width: '100%',
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'background 0.12s',
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed', top: safeY, left: safeX,
        background: 'var(--bg-glass, rgba(15, 15, 20, 0.85))',
        border: '1px solid var(--border-muted, rgba(255,255,255,0.1))',
        borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column',
        zIndex: 99999, boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-sans)', minWidth: '150px', backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ padding: '4px 10px 6px', borderBottom: '1px solid var(--border-muted, rgba(255,255,255,0.1))', marginBottom: '2px' }}>
        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>{symbol} 작업</span>
      </div>

      <button
        style={btnStyle}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass-active, rgba(255,255,255,0.1))')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => { onInsert(); onDismiss(); }}
      >
        <FileText size={12} style={{ color: 'var(--primary)' }} />
        본문에 시세 넣기
      </button>

      <button
        style={btnStyle}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass-active, rgba(255,255,255,0.1))')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => { onDetail(); onDismiss(); }}
      >
        <Eye size={12} style={{ color: '#34d399' }} />
        자세히 보기 (뉴스)
      </button>
    </div>
  );
}

