(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS["finance-dashboard"] = {
    name: "Finance & Exchange",
    description: "실시간 실제 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.",
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // 1. HTML 레이아웃 뼈대 마운트 (자동 갱신 대신 수동 새로고침 버튼 추가)
      container.innerHTML = `
        <div style="font-family: 'Pretendard', sans-serif; color: #f8fafc; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box; overflow-y: auto; padding-right: 4px;">
          
          <!-- 탭 헤더 -->
          <div style="font-size: 13px; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #2e2e38; padding-bottom: 6px; flex-shrink: 0;">
            <span>📈 Finance & Exchange Dashboard</span>
          </div>

          <!-- Section 1. 실시간 글로벌 주요 증시 지수 (수동 새로고침 단추 배치로 트래픽 최적화) -->
          <div style="background: #0f0f11; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; color: var(--text-muted); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Global Market Indices</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span id="stock-sync-lbl" style="font-size: 9px; color: #34d399; background: rgba(52,211,153,0.1); padding: 1px 4px; border-radius: 3px;">● READY</span>
                <button id="btn-finance-refresh" style="background: var(--bg-glass); border: 1px solid var(--border-muted); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 3px; transition: all 0.15s;">
                  🔄 새로고침
                </button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div class="stock-card" id="stock-kospi" style="background: #141416; border: 1px solid #2e2e38; padding: 6px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px;">
                <span style="color: var(--text-muted); font-size: 9.5px;">코스피 KOSPI</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong class="stock-price" style="font-size: 12px;">Loading...</strong>
                  <span class="stock-change" style="color: var(--text-muted); font-size: 9.5px;">0.00%</span>
                </div>
              </div>

              <div class="stock-card" id="stock-nasdaq" style="background: #141416; border: 1px solid #2e2e38; padding: 6px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px;">
                <span style="color: var(--text-muted); font-size: 9.5px;">나스닥 NASDAQ</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong class="stock-price" style="font-size: 12px;">Loading...</strong>
                  <span class="stock-change" style="color: var(--text-muted); font-size: 9.5px;">0.00%</span>
                </div>
              </div>

              <div class="stock-card" id="stock-sp500" style="background: #141416; border: 1px solid #2e2e38; padding: 6px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px;">
                <span style="color: var(--text-muted); font-size: 9.5px;">S&P 500 지수</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong class="stock-price" style="font-size: 12px;">Loading...</strong>
                  <span class="stock-change" style="color: var(--text-muted); font-size: 9.5px;">0.00%</span>
                </div>
              </div>

              <div class="stock-card" id="stock-dow" style="background: #141416; border: 1px solid #2e2e38; padding: 6px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px;">
                <span style="color: var(--text-muted); font-size: 9.5px;">다우존스 DOW</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong class="stock-price" style="font-size: 12px;">Loading...</strong>
                  <span class="stock-change" style="color: var(--text-muted); font-size: 9.5px;">0.00%</span>
                </div>
              </div>

              <div class="stock-card" id="stock-nikkei" style="background: #141416; border: 1px solid #2e2e38; padding: 6px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px; grid-column: span 2;">
                <span style="color: var(--text-muted); font-size: 9.5px;">니케이 NIKKEI 225</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong class="stock-price" style="font-size: 12px;">Loading...</strong>
                  <span class="stock-change" style="color: var(--text-muted); font-size: 9.5px;">0.00%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2. 주요국 기준금리 요약 -->
          <div style="background: #0f0f11; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
            <span style="font-size: 10px; color: var(--text-muted); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Central Bank Rates</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; text-align: center;">
              <div style="background: #141416; padding: 8px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 9px; color: var(--text-muted);">🇰🇷 한국 기준금리 (BOK)</div>
                <strong style="color: var(--primary); font-size: 12px;">3.00%</strong>
              </div>
              <div style="background: #141416; padding: 8px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 9px; color: var(--text-muted);">🇺🇸 미국 기준금리 (Fed)</div>
                <strong style="color: #22d3ee; font-size: 12px;">4.50%</strong>
              </div>
            </div>
          </div>

          <!-- Section 3. 전 세계 모든 주식 / ETF 실시간 검색 엔진 -->
          <div style="background: #0f0f11; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
            <span style="font-size: 10px; color: var(--primary); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">🔍 Global Stock & ETF Search</span>
            
            <div style="display: flex; gap: 4px;">
              <input type="text" id="gstock-search-input" placeholder="삼성전자, 삼성, SPY, TSLA 등 검색..." style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 11px; outline: none;" />
              <button id="btn-gstock-search" style="background: var(--primary); border: none; color: #000; padding: 6px 12px; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer;">검색</button>
            </div>

            <!-- 검색 결과 목록 수신기 -->
            <div id="gstock-search-results" style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; font-size: 10px;">
              <div style="color: var(--text-muted); text-align: center; padding: 8px 0; font-size: 9.5px;">전 세계 주식, ETF, 지수를 입력해 실시간 검색하세요.</div>
            </div>

            <!-- 종목 상세 정보 단말 디스플레이 -->
            <div id="gstock-detail-panel" style="display: none; background: #141416; border: 1px solid rgba(139,92,246,0.3); border-radius: 6px; padding: 8px; margin-top: 6px; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e38; padding-bottom: 4px;">
                <strong id="det-name" style="font-size: 11px; color: #fff; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</strong>
                <span id="det-ticker" style="font-size: 8.5px; color: var(--primary); background: rgba(139,92,246,0.1); padding: 1px 4px; border-radius: 3px;">-</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
                <span style="font-size: 9.5px; color: var(--text-muted);">실시간 가격</span>
                <div>
                  <strong id="det-price" style="font-size: 14px; color: #fff;">-</strong>
                  <span id="det-change" style="font-size: 10px; margin-left: 6px;">0.00%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4. 실시간 환율 및 다자간 변환기 -->
          <div style="background: #0f0f11; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; margin-bottom: 10px;">
            <span style="font-size: 10px; color: var(--text-muted); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Real-Time Exchange (Open ER API)</span>
            
            <div style="background: #141416; border: 1px solid #2e2e38; border-radius: 6px; padding: 6px; font-size: 9px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-weight: bold; color: var(--text-muted);">실시간 고시 환율 (수동 조정 가능)</span>
              <div style="display: flex; gap: 4px;">
                <div style="flex:1;">USD/KRW: <input type="number" id="ex-rate-usd" value="1425" style="width:100%; background:#000; border:1px solid #2e2e38; color:#fff; font-size:9px; padding:1px;" /></div>
                <div style="flex:1;">JPY/KRW(100): <input type="number" id="ex-rate-jpy" value="935" style="width:100%; background:#000; border:1px solid #2e2e38; color:#fff; font-size:9px; padding:1px;" /></div>
                <div style="flex:1;">VND/KRW(100): <input type="number" id="ex-rate-vnd" value="5.58" step="0.01" style="width:100%; background:#000; border:1px solid #2e2e38; color:#fff; font-size:9px; padding:1px;" /></div>
              </div>
            </div>

            <!-- 다자간 인풋 폼 -->
            <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 50px; font-size: 10.5px; font-weight: bold; color: var(--primary);">KRW (원)</span>
                <input type="number" id="ex-krw" value="100000" style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; outline: none;" />
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 50px; font-size: 10.5px; font-weight: bold; color: #22d3ee;">USD (달러)</span>
                <input type="number" id="ex-usd" style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; outline: none;" />
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 50px; font-size: 10.5px; font-weight: bold; color: #ec4899;">JPY (엔화)</span>
                <input type="number" id="ex-jpy" style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; outline: none;" />
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 50px; font-size: 10.5px; font-weight: bold; color: #34d399;">VND (동)</span>
                <input type="number" id="ex-vnd" style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; outline: none;" />
              </div>
            </div>

            <!-- 환산 요약 텍스트 -->
            <div style="background: #08080a; border-radius: 4px; padding: 6px 8px; font-size: 10px; color: var(--text-muted); margin-top: 4px; text-align: center;">
              입력 기준 환산: <span id="ex-summary" style="color: #fff; font-weight: bold;">0 KRW</span>
            </div>
          </div>

        </div>
      `;

      // 2. 환율 동기화 제어 로직 바인딩
      const rateUsd = container.querySelector('#ex-rate-usd');
      const rateJpy = container.querySelector('#ex-rate-jpy');
      const rateVnd = container.querySelector('#ex-rate-vnd');

      const valKrw = container.querySelector('#ex-krw');
      const valUsd = container.querySelector('#ex-usd');
      const valJpy = container.querySelector('#ex-jpy');
      const valVnd = container.querySelector('#ex-vnd');
      const summary = container.querySelector('#ex-summary');

      const syncExchange = (source) => {
        const u = parseFloat(rateUsd.value) || 1425;
        const j = (parseFloat(rateJpy.value) || 935) / 100; // 1엔당 가격
        const v = (parseFloat(rateVnd.value) || 5.58) / 100; // 1동당 가격

        if (source === 'krw') {
          const krw = parseFloat(valKrw.value) || 0;
          valUsd.value = (krw / u).toFixed(2);
          valJpy.value = (krw / j).toFixed(2);
          valVnd.value = (krw / v).toFixed(2);
          summary.textContent = `${krw.toLocaleString()} KRW 환산 완료`;
        } else if (source === 'usd') {
          const usd = parseFloat(valUsd.value) || 0;
          valKrw.value = Math.round(usd * u);
          valJpy.value = ((usd * u) / j).toFixed(2);
          valVnd.value = ((usd * u) / v).toFixed(2);
          summary.textContent = `$${usd.toLocaleString()} USD 기준 환산`;
        } else if (source === 'jpy') {
          const jpy = parseFloat(valJpy.value) || 0;
          valKrw.value = Math.round(jpy * j);
          valUsd.value = ((jpy * j) / u).toFixed(2);
          valVnd.value = ((jpy * j) / v).toFixed(2);
          summary.textContent = `¥${jpy.toLocaleString()} JPY 기준 환산`;
        } else if (source === 'vnd') {
          const vnd = parseFloat(valVnd.value) || 0;
          valKrw.value = Math.round(vnd * v);
          valUsd.value = ((vnd * v) / u).toFixed(2);
          valJpy.value = ((vnd * v) / j).toFixed(2);
          summary.textContent = `₫${vnd.toLocaleString()} VND 기준 환산`;
        }
      };

      valKrw.addEventListener('input', () => syncExchange('krw'));
      valUsd.addEventListener('input', () => syncExchange('usd'));
      valJpy.addEventListener('input', () => syncExchange('jpy'));
      valVnd.addEventListener('input', () => syncExchange('vnd'));

      rateUsd.addEventListener('change', () => syncExchange('krw'));
      rateJpy.addEventListener('change', () => syncExchange('krw'));
      rateVnd.addEventListener('change', () => syncExchange('krw'));

      // 3. 실제 API 서버로부터 실시간 지표 & 환율 로딩 및 렌더링 (수동 기동)
      const syncLbl = container.querySelector('#stock-sync-lbl');
      const refreshBtn = container.querySelector('#btn-finance-refresh');
      
      const fetchLiveFinance = async () => {
        if (syncLbl) {
          syncLbl.textContent = '● SYNCING...';
          syncLbl.style.color = '#eab308';
          syncLbl.style.background = 'rgba(234,179,8,0.1)';
        }

        try {
          const response = await fetch('https://uno-km.github.io/AMEVA-Workstation-Market-Place/api/finance/data.json');
          if (!response.ok) throw new Error('Finance live API failed');
          const data = await response.json();
          if (data && data.success) {
            // 주요 글로벌 지수 반영
            updateStockUI('stock-kospi', data.stocks.kospi, 2, '');
            updateStockUI('stock-nasdaq', data.stocks.nasdaq, 2, '');
            updateStockUI('stock-sp500', data.stocks.sp500, 2, '');
            updateStockUI('stock-dow', data.stocks.dow, 2, '');
            updateStockUI('stock-nikkei', data.stocks.nikkei, 2, '');

            // 실시간 환율 반영 (수동 조정 중이 아닐 때만 동기화)
            if (document.activeElement !== rateUsd && document.activeElement !== rateJpy && document.activeElement !== rateVnd) {
              rateUsd.value = data.exchange.usdRate;
              rateJpy.value = data.exchange.jpyRate;
              rateVnd.value = data.exchange.vndRate;
              syncExchange('krw');
            }

            if (syncLbl) {
              syncLbl.textContent = '● UPDATED';
              syncLbl.style.color = '#34d399';
              syncLbl.style.background = 'rgba(52,211,153,0.1)';
            }
          }
        } catch (e) {
          console.warn('실시간 수집 실패:', e);
          if (syncLbl) {
            syncLbl.textContent = '● OFFLINE';
            syncLbl.style.color = '#f87171';
            syncLbl.style.background = 'rgba(248,113,113,0.1)';
          }
        }
      };

      const updateStockUI = (id, stock, digits, prefix) => {
        const el = container.querySelector(`#${id}`);
        if (!el || !stock) return;

        const priceEl = el.querySelector('.stock-price');
        const changeEl = el.querySelector('.stock-change');

        if (priceEl && changeEl) {
          const isUp = stock.changePercent >= 0;
          priceEl.textContent = (prefix || '') + stock.price.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
          });
          changeEl.textContent = (isUp ? '+' : '') + stock.changePercent.toFixed(2) + '%';
          changeEl.style.color = isUp ? '#f87171' : '#3b82f6';
        }
      };

      // 최초 1회 즉시 조회
      fetchLiveFinance();

      // 수동 새로고침 버튼 바인딩 (수동 기동만 수행, setInterval 자동 갱신 삭제!)
      refreshBtn.addEventListener('click', () => {
        // 새로고침 버튼 애니메이션 효과 피드백
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
          refreshBtn.style.transform = 'none';
          refreshBtn.style.transition = 'none';
        }, 500);

        fetchLiveFinance();
      });

      // 4. 전 세계 모든 주식 / ETF 실시간 검색 기능 바인딩 (에러 방어 장치 보강)
      const searchInput = container.querySelector('#gstock-search-input');
      const searchBtn = container.querySelector('#btn-gstock-search');
      const resultsContainer = container.querySelector('#gstock-search-results');
      
      const detailPanel = container.querySelector('#gstock-detail-panel');
      const detName = container.querySelector('#det-name');
      const detTicker = container.querySelector('#det-ticker');
      const detPrice = container.querySelector('#det-price');
      const detChange = container.querySelector('#det-change');

      const executeSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 8px 0; font-size: 9.5px;">Searching Yahoo Database...</div>';

        try {
          const response = await fetch(`https://uno-km.github.io/AMEVA-Workstation-Market-Place/api/finance/search.json`);
          if (!response.ok) throw new Error('Search API status failed');
          const data = await response.json();
          
          if (data && data.success && data.quotes && data.quotes.length > 0) {
            resultsContainer.innerHTML = data.quotes.map(q => `
              <div class="search-item" data-ticker="${q.symbol}" style="
                background: #141416; border: 1px solid #2e2e38; border-radius: 4px; padding: 6px 8px;
                display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.12s;
              ">
                <div style="display: flex; flex-direction: column; gap: 1px; max-width: 70%;">
                  <span style="color: #fff; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${q.name}</span>
                  <span style="font-size: 8px; color: var(--text-muted);">${q.exchange} · ${q.type}</span>
                </div>
                <span style="font-size: 9px; color: var(--primary); font-weight: bold; background: rgba(139,92,246,0.08); padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(139,92,246,0.15);">${q.symbol}</span>
              </div>
            `).join('');

            // 클릭 시 종목 상세 정보 로드 바인딩
            resultsContainer.querySelectorAll('.search-item').forEach(item => {
              item.addEventListener('click', async (e) => {
                const ticker = e.currentTarget.getAttribute('data-ticker');
                if (!ticker) return;

                e.currentTarget.style.borderColor = 'var(--primary)';
                
                try {
                  const detRes = await fetch(`https://uno-km.github.io/AMEVA-Workstation-Market-Place/api/finance/stock-detail.json`);
                  if (!detRes.ok) throw new Error('Detail fetch failed');
                  const detData = await detRes.json();
                  
                  if (detData && detData.success && detData.stock) {
                    const st = detData.stock;
                    detName.textContent = st.name;
                    detTicker.textContent = st.ticker;
                    
                    const isUp = st.changePercent >= 0;
                    detPrice.textContent = st.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    detChange.textContent = (isUp ? '+' : '') + st.changePercent.toFixed(2) + '%';
                    detChange.style.color = isUp ? '#f87171' : '#3b82f6';
                    
                    detailPanel.style.display = 'flex';
                  }
                } catch (detErr) {
                  console.error('Detail load error:', detErr);
                }
              });
            });
          } else {
            resultsContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 8px 0; font-size: 9.5px;">검색된 종목이 없습니다. 영어 또는 티커(예: SPY, AAPL)로 검색해 보세요.</div>';
          }
        } catch (err) {
          console.error('Search request failed:', err);
          resultsContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 8px 0; font-size: 9.5px;">검색결과 없음 (티커 혹은 영어 약어로 검색해 보세요)</div>';
        }
      };

      searchBtn.addEventListener('click', executeSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
    }
  };
})();
