(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.calculator = {
    name: 'Advanced Calculator',
    description: '일반 자판, 공학 수학, 각국 금리 연동 복리, 물가상승 실질수익, 채권 YTM, CAGR 및 실시간 외환 환율 변환을 지원하는 종합 금융 계산기입니다.',
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // HTML 구조 렌더링
      container.innerHTML = `
        <div style="font-family: 'Pretendard', sans-serif; color: #f8fafc; display: flex; flex-direction: column; gap: 10px; height: 100%; box-sizing: border-box;">
          
          <!-- 1. 수식 입력/출력 헤더 영역 (공통) -->
          <div style="background: #0f0f11; border: 1px solid #2e2e38; borderRadius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Formula / Expression</div>
            <input type="text" id="calc-display" placeholder="15 + 13 * 2" style="width: 100%; background: transparent; border: none; color: #fff; font-size: 17px; font-family: 'Consolas', monospace; outline: none; padding: 2px 0;" />
            <div style="border-top: 1px solid #2e2e38; padding-top: 4px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 9px; color: var(--text-muted);">Result:</span>
              <span id="calc-result" style="font-size: 15px; font-weight: bold; color: var(--primary); font-family: 'Consolas', monospace;">0</span>
            </div>
          </div>

          <!-- 2. 계산기 모드 선택기 탭 -->
          <div style="display: flex; background: #0c0c0e; border: 1px solid #2e2e38; border-radius: 6px; padding: 2px;">
            <button id="mode-btn-standard" style="flex: 1; background: var(--primary); border: none; color: #000; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.15s;">Standard</button>
            <button id="mode-btn-scientific" style="flex: 1; background: transparent; border: none; color: var(--text-muted); padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.15s;">Scientific</button>
            <button id="mode-btn-financial" style="flex: 1; background: transparent; border: none; color: var(--text-muted); padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.15s;">Financial</button>
          </div>

          <!-- 3. 표준 계산기 패널 (Standard) -->
          <div id="panel-standard" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; flex: 1;">
            <button class="calc-btn action" data-val="C">C</button>
            <button class="calc-btn action" data-val="back">⌫</button>
            <button class="calc-btn op" data-val="(">(</button>
            <button class="calc-btn op" data-val=")">)</button>

            <button class="calc-btn num" data-val="7">7</button>
            <button class="calc-btn num" data-val="8">8</button>
            <button class="calc-btn num" data-val="9">9</button>
            <button class="calc-btn op" data-val="/">/</button>

            <button class="calc-btn num" data-val="4">4</button>
            <button class="calc-btn num" data-val="5">5</button>
            <button class="calc-btn num" data-val="6">6</button>
            <button class="calc-btn op" data-val="*">*</button>

            <button class="calc-btn num" data-val="1">1</button>
            <button class="calc-btn num" data-val="2">2</button>
            <button class="calc-btn num" data-val="3">3</button>
            <button class="calc-btn op" data-val="-">-</button>

            <button class="calc-btn num" data-val="0">0</button>
            <button class="calc-btn num" data-val=".">.</button>
            <button class="calc-btn run" id="btn-eval" style="grid-column: span 2;">RUN</button>
          </div>

          <!-- 4. 공학용 계산기 패널 (Scientific) -->
          <div id="panel-scientific" style="display: none; grid-template-columns: repeat(4, 1fr); gap: 6px; flex: 1;">
            <button class="calc-btn sc" data-val="sin(">sin</button>
            <button class="calc-btn sc" data-val="cos(">cos</button>
            <button class="calc-btn sc" data-val="tan(">tan</button>
            <button class="calc-btn sc" data-val="sqrt(">√</button>

            <button class="calc-btn sc" data-val="log10(">log</button>
            <button class="calc-btn sc" data-val="log(">ln</button>
            <button class="calc-btn sc" data-val="*3.141592">π</button>
            <button class="calc-btn sc" data-val="^">^</button>

            <button class="calc-btn num" data-val="7">7</button>
            <button class="calc-btn num" data-val="8">8</button>
            <button class="calc-btn num" data-val="9">9</button>
            <button class="calc-btn op" data-val="/">/</button>

            <button class="calc-btn num" data-val="4">4</button>
            <button class="calc-btn num" data-val="5">5</button>
            <button class="calc-btn num" data-val="6">6</button>
            <button class="calc-btn op" data-val="*">*</button>

            <button class="calc-btn num" data-val="1">1</button>
            <button class="calc-btn num" data-val="2">2</button>
            <button class="calc-btn num" data-val="3">3</button>
            <button class="calc-btn op" data-val="-">-</button>

            <button class="calc-btn num" data-val="0">0</button>
            <button class="calc-btn action" data-val="C">C</button>
            <button class="calc-btn run" id="btn-eval-sc" style="grid-column: span 2;">RUN</button>
          </div>

          <!-- 5. 금융 계산기 패널 (Financial) -->
          <div id="panel-financial" style="display: none; flex-direction: column; gap: 6px; background: #0c0c0e; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; flex: 1; overflow-y: auto;">
            
            <!-- 금융 모드 내장 서브 선택 셀렉트박스 -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2e2e38; padding-bottom: 6px; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: bold; color: var(--primary);">Financial Tools</span>
              <select id="fin-sub-select" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; font-size: 10px; padding: 2px 4px; border-radius: 4px; outline: none; cursor: pointer;">
                <option value="compound">복리 예적금 (Compound)</option>
                <option value="exchange">외화 환율 변환 (Exchange)</option>
                <option value="inflation">물가상승 실질수익 (Inflation)</option>
                <option value="bond">채권 만기수익률 (Bond YTM)</option>
                <option value="cagr">연평균 성장률 (CAGR)</option>
              </select>
            </div>

            <!-- 모듈 A. 복리 계산기 (+ 기준 금리 연동 단추 탑재) -->
            <div id="fin-mod-compound" style="display: flex; flex-direction: column; gap: 5px;">
              
              <!-- 퀵 기준 금리 대입 단추 -->
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 9px; color: var(--text-muted);">퀵 국가별 기준금리 연동</span>
                <div style="display: flex; gap: 4px;">
                  <button class="rate-quick-btn" data-rate="3.50">🇰🇷 KR (3.5%)</button>
                  <button class="rate-quick-btn" data-rate="5.25">🇺🇸 US (5.25%)</button>
                  <button class="rate-quick-btn" data-rate="0.25">🇯🇵 JP (0.25%)</button>
                  <button class="rate-quick-btn" data-rate="4.25">🇪🇺 EU (4.25%)</button>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">원금 (Principal, 원)</span>
                <input type="number" id="fin-p-principal" value="1000000" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">적용 연이율 (Annual Rate, %)</span>
                <input type="number" id="fin-p-rate" value="3.5" step="0.1" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">기간 (Period, 년)</span>
                <input type="number" id="fin-p-period" value="3" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <button id="btn-run-compound" style="background: var(--primary); border: none; color: #000; padding: 6px 12px; border-radius: 4px; font-size: 10.5px; font-weight: bold; cursor: pointer; margin-top: 2px;">복리 만기수령액 계산</button>
            </div>

            <!-- 모듈 E. 실시간 외화 환율 변환기 (원달러, 원엔, 달러엔 등) -->
            <div id="fin-mod-exchange" style="display: none; flex-direction: column; gap: 6px;">
              
              <!-- 환율 편집 패널 -->
              <div style="background: #141416; border: 1px solid #2e2e38; padding: 6px 8px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 9px; color: var(--text-muted); font-weight: bold;">기준 환율 고시 튜닝</span>
                <div style="display: flex; gap: 8px; font-size: 9.5px;">
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 1px;">
                    <span>USD/KRW</span>
                    <input type="number" id="ex-rate-usdkrw" value="1380" style="background: #000; border: 1px solid #2e2e38; color: #fff; font-size: 9.5px; padding: 2px; border-radius: 4px; outline: none;" />
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 1px;">
                    <span>JPY/KRW (100엔)</span>
                    <input type="number" id="ex-rate-jpykrw" value="860" style="background: #000; border: 1px solid #2e2e38; color: #fff; font-size: 9.5px; padding: 2px; border-radius: 4px; outline: none;" />
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 1px;">
                    <span>USD/JPY</span>
                    <input type="number" id="ex-rate-usdjpy" value="160.5" step="0.1" style="background: #000; border: 1px solid #2e2e38; color: #fff; font-size: 9.5px; padding: 2px; border-radius: 4px; outline: none;" />
                  </div>
                </div>
              </div>

              <!-- 양방향 금액 변환 폼 -->
              <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 2px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="number" id="ex-val-krw" value="100000" style="flex: 2; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
                  <span style="flex: 1; font-size: 10.5px; font-weight: bold; color: var(--primary);">KRW (원)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="number" id="ex-val-usd" style="flex: 2; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
                  <span style="flex: 1; font-size: 10.5px; font-weight: bold; color: #22d3ee;">USD (달러)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="number" id="ex-val-jpy" style="flex: 2; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
                  <span style="flex: 1; font-size: 10.5px; font-weight: bold; color: #ec4899;">JPY (엔화)</span>
                </div>
              </div>
            </div>

            <!-- 모듈 B. 물가상승 실질수익 계산기 -->
            <div id="fin-mod-inflation" style="display: none; flex-direction: column; gap: 5px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">투자 원금 (원)</span>
                <input type="number" id="fin-i-principal" value="10000000" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">예상 명목 수익률 (Nominal Rate, %)</span>
                <input type="number" id="fin-i-nominal" value="7.0" step="0.1" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">연평균 예상 물가상승률 (Inflation Rate, %)</span>
                <input type="number" id="fin-i-rate" value="3.0" step="0.1" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">기간 (년)</span>
                <input type="number" id="fin-i-period" value="5" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <button id="btn-run-inflation" style="background: var(--primary); border: none; color: #000; padding: 6px 12px; border-radius: 4px; font-size: 10.5px; font-weight: bold; cursor: pointer; margin-top: 2px;">물가 반영 실질 가치 연산</button>
            </div>

            <!-- 모듈 C. 채권 수익률 계산기 (YTM) -->
            <div id="fin-mod-bond" style="display: none; flex-direction: column; gap: 5px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">채권 액면가 (Face Value, 원)</span>
                <input type="number" id="fin-b-face" value="10000" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">표면이율 (Coupon Rate, 연 %)</span>
                <input type="number" id="fin-b-coupon" value="5.0" step="0.1" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">현재 채권 구매가 (Current Price, 원)</span>
                <input type="number" id="fin-b-price" value="9500" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">만기까지 잔존기간 (Maturity, 년)</span>
                <input type="number" id="fin-b-period" value="4" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <button id="btn-run-bond" style="background: var(--primary); border: none; color: #000; padding: 6px 12px; border-radius: 4px; font-size: 10.5px; font-weight: bold; cursor: pointer; margin-top: 2px;">만기수익률(YTM) 산출</button>
            </div>

            <!-- 모듈 D. CAGR 계산기 -->
            <div id="fin-mod-cagr" style="display: none; flex-direction: column; gap: 5px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">초기 투자자금 (원)</span>
                <input type="number" id="fin-c-initial" value="5000000" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">최종 평가금액 (Final Value, 원)</span>
                <input type="number" id="fin-c-final" value="8500000" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 10px; color: var(--text-muted);">투자 기간 (년)</span>
                <input type="number" id="fin-c-period" value="5" style="background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10.5px; outline: none;" />
              </div>
              <button id="btn-run-cagr" style="background: var(--primary); border: none; color: #000; padding: 6px 12px; border-radius: 4px; font-size: 10.5px; font-weight: bold; cursor: pointer; margin-top: 2px;">CAGR 산정하기</button>
            </div>

            <!-- 금융 연산 최종 출력 창 -->
            <div style="border-top: 1px solid #2e2e38; padding-top: 6px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; background: #08080a; border-radius: 6px; padding: 8px; margin-top: 4px;">
              <div style="display: flex; justify-content: space-between;"><span id="fin-lbl-res1" style="color: var(--text-muted);">계산 결과 1:</span><strong id="fin-val-res1" style="color: #34d399;">0</strong></div>
              <div style="display: flex; justify-content: space-between;"><span id="fin-lbl-res2" style="color: var(--text-muted);">계산 결과 2:</span><strong id="fin-val-res2" style="color: #a78bfa;">0</strong></div>
            </div>

          </div>

        </div>

        <style>
          .calc-btn {
            background: #1f1f24;
            border: 1px solid #2e2e38;
            border-radius: 6px;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            padding: 8px 4px;
            cursor: pointer;
            outline: none;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .calc-btn:hover {
            background: #2a2a30;
            border-color: var(--primary);
          }
          .calc-btn.op {
            background: rgba(139, 92, 246, 0.12);
            color: #c084fc;
          }
          .calc-btn.sc {
            background: rgba(6, 181, 212, 0.1);
            color: #22d3ee;
            font-size: 11px;
          }
          .calc-btn.action {
            background: #2e2e38;
            color: #f87171;
          }
          .calc-btn.run {
            background: var(--primary);
            color: #000;
          }
          .calc-btn.run:hover {
            background: #9067eb;
          }
          
          /* 퀵 금리 링크 단추 스타일링 */
          .rate-quick-btn {
            flex: 1;
            background: #141416;
            border: 1px solid #2e2e38;
            border-radius: 4px;
            color: var(--text-muted);
            font-size: 9px;
            padding: 3px 0;
            cursor: pointer;
            transition: all 0.15s;
            outline: none;
          }
          .rate-quick-btn:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: var(--primary);
            color: #fff;
          }
        </style>
      `;

      // 6. DOM 요소들 잡기
      const display = container.querySelector('#calc-display');
      const resultSpan = container.querySelector('#calc-result');

      const btnStandard = container.querySelector('#mode-btn-standard');
      const btnScientific = container.querySelector('#mode-btn-scientific');
      const btnFinancial = container.querySelector('#mode-btn-financial');

      const panelStandard = container.querySelector('#panel-standard');
      const panelScientific = container.querySelector('#panel-scientific');
      const panelFinancial = container.querySelector('#panel-financial');

      // 금융 서브 모듈 제어 DOM
      const finSubSelect = container.querySelector('#fin-sub-select');
      const finModCompound = container.querySelector('#fin-mod-compound');
      const finModExchange = container.querySelector('#fin-mod-exchange');
      const finModInflation = container.querySelector('#fin-mod-inflation');
      const finModBond = container.querySelector('#fin-mod-bond');
      const finModCagr = container.querySelector('#fin-mod-cagr');

      const finLblRes1 = container.querySelector('#fin-lbl-res1');
      const finValRes1 = container.querySelector('#fin-val-res1');
      const finLblRes2 = container.querySelector('#fin-lbl-res2');
      const finValRes2 = container.querySelector('#fin-val-res2');

      // 7. 모드 스위칭 핸들러
      const switchMode = (mode) => {
        const activeColor = 'var(--primary)';
        const activeText = '#000';
        const inactiveColor = 'transparent';
        const inactiveText = 'var(--text-muted)';

        btnStandard.style.background = mode === 'standard' ? activeColor : inactiveColor;
        btnStandard.style.color = mode === 'standard' ? activeText : inactiveText;
        btnScientific.style.background = mode === 'scientific' ? activeColor : inactiveColor;
        btnScientific.style.color = mode === 'scientific' ? activeText : inactiveText;
        btnFinancial.style.background = mode === 'financial' ? activeColor : inactiveColor;
        btnFinancial.style.color = mode === 'financial' ? activeText : inactiveText;

        panelStandard.style.display = mode === 'standard' ? 'grid' : 'none';
        panelScientific.style.display = mode === 'scientific' ? 'grid' : 'none';
        panelFinancial.style.display = mode === 'financial' ? 'flex' : 'none';
      };

      btnStandard.addEventListener('click', () => switchMode('standard'));
      btnScientific.addEventListener('click', () => switchMode('scientific'));
      btnFinancial.addEventListener('click', () => switchMode('financial'));

      // 금융 서브 모듈 스위칭
      finSubSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        finModCompound.style.display = val === 'compound' ? 'flex' : 'none';
        finModExchange.style.display = val === 'exchange' ? 'flex' : 'none';
        finModInflation.style.display = val === 'inflation' ? 'flex' : 'none';
        finModBond.style.display = val === 'bond' ? 'flex' : 'none';
        finModCagr.style.display = val === 'cagr' ? 'flex' : 'none';

        // 라벨 초기 리셋
        if (val === 'compound') {
          finLblRes1.textContent = '총 만기수령액:';
          finLblRes2.textContent = '순수 이자 수익:';
        } else if (val === 'exchange') {
          finLblRes1.textContent = '원화 기준 환산 (KRW):';
          finLblRes2.textContent = '외화 기준 상태 (USD/JPY):';
        } else if (val === 'inflation') {
          finLblRes1.textContent = '실질 수익률 (Real Rate):';
          finLblRes2.textContent = '물가반영 실질가치:';
        } else if (val === 'bond') {
          finLblRes1.textContent = '만기수익률 (YTM):';
          finLblRes2.textContent = '총 연간 쿠폰이자액:';
        } else if (val === 'cagr') {
          finLblRes1.textContent = '연평균 성장률 (CAGR):';
          finLblRes2.textContent = '총 투자배수 (Multiple):';
        }
        finValRes1.textContent = '0';
        finValRes2.textContent = '0';
      });

      // 8. 수식 파서 (안전한 연산 실행)
      const evaluateExpr = () => {
        const expr = display.value.trim();
        if (!expr) {
          resultSpan.textContent = '0';
          return;
        }

        try {
          let sanitized = expr
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log10\(/g, 'Math.log10(')
            .replace(/log\(/g, 'Math.log(')
            .replace(/\^/g, '**');

          const val = new Function(`return (${sanitized})`)();
          resultSpan.textContent = typeof val === 'number' ? Number(val.toFixed(6)).toString() : val;
        } catch (e) {
          resultSpan.textContent = 'Syntax Error';
        }
      };

      // 9. 자판 버튼 이벤트 리스너 바인딩 (Standard & Scientific)
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.calc-btn');
        if (!btn) return;

        const val = btn.getAttribute('data-val');
        if (!val) return;

        if (val === 'C') {
          display.value = '';
          resultSpan.textContent = '0';
        } else if (val === 'back') {
          display.value = display.value.slice(0, -1);
        } else {
          display.value += val;
        }
      });

      // 엔터 평가 키 바인딩
      container.querySelector('#btn-eval').addEventListener('click', evaluateExpr);
      container.querySelector('#btn-eval-sc').addEventListener('click', evaluateExpr);
      display.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') evaluateExpr();
      });

      // 10. 주요국 기준금리 퀵 세팅 바인딩
      container.querySelectorAll('.rate-quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rateVal = e.target.getAttribute('data-rate');
          container.querySelector('#fin-p-rate').value = rateVal;
        });
      });

      // 11. 외환 환율 실시간 변환 이벤트 제어
      const exRateUsdKrw = container.querySelector('#ex-rate-usdkrw');
      const exRateJpyKrw = container.querySelector('#ex-rate-jpykrw');
      const exRateUsdJpy = container.querySelector('#ex-rate-usdjpy');

      const exValKrw = container.querySelector('#ex-val-krw');
      const exValUsd = container.querySelector('#ex-val-usd');
      const exValJpy = container.querySelector('#ex-val-jpy');

      const syncExchange = (sourceCurrency) => {
        const rateUsdKrw = parseFloat(exRateUsdKrw.value) || 1380;
        const rateJpyKrw = (parseFloat(exRateJpyKrw.value) || 860) / 100; // 100엔당 기준 -> 1엔당 기준
        const rateUsdJpy = parseFloat(exRateUsdJpy.value) || 160.5;

        finLblRes1.textContent = '원화 기준 환산 (KRW):';
        finLblRes2.textContent = '달러-엔화 변동 환율:';

        if (sourceCurrency === 'krw') {
          const krw = parseFloat(exValKrw.value) || 0;
          exValUsd.value = (krw / rateUsdKrw).toFixed(2);
          exValJpy.value = (krw / rateJpyKrw).toFixed(2);
          
          finValRes1.textContent = krw.toLocaleString() + ' 원';
          finValRes2.textContent = `USD: $${(krw / rateUsdKrw).toLocaleString(undefined, {maximumFractionDigits:2})} / JPY: ¥${(krw / rateJpyKrw).toLocaleString(undefined, {maximumFractionDigits:2})}`;
        } else if (sourceCurrency === 'usd') {
          const usd = parseFloat(exValUsd.value) || 0;
          exValKrw.value = Math.round(usd * rateUsdKrw);
          exValJpy.value = (usd * rateUsdJpy).toFixed(2);

          finValRes1.textContent = Math.round(usd * rateUsdKrw).toLocaleString() + ' 원';
          finValRes2.textContent = `USD: $${usd.toLocaleString()} -> JPY: ¥${(usd * rateUsdJpy).toLocaleString(undefined, {maximumFractionDigits:2})}`;
        } else if (sourceCurrency === 'jpy') {
          const jpy = parseFloat(exValJpy.value) || 0;
          exValKrw.value = Math.round(jpy * rateJpyKrw);
          exValUsd.value = (jpy / rateUsdJpy).toFixed(2);

          finValRes1.textContent = Math.round(jpy * rateJpyKrw).toLocaleString() + ' 원';
          finValRes2.textContent = `JPY: ¥${jpy.toLocaleString()} -> USD: $${(jpy / rateUsdJpy).toLocaleString(undefined, {maximumFractionDigits:2})}`;
        }
      };

      exValKrw.addEventListener('input', () => syncExchange('krw'));
      exValUsd.addEventListener('input', () => syncExchange('usd'));
      exValJpy.addEventListener('input', () => syncExchange('jpy'));

      // 기준환율 바뀔때 자동 업데이트
      exRateUsdKrw.addEventListener('change', () => syncExchange('krw'));
      exRateJpyKrw.addEventListener('change', () => syncExchange('krw'));
      exRateUsdJpy.addEventListener('change', () => syncExchange('krw'));

      // 12. 금융 연산 기능 구현부
      
      // 모듈 A: 복리 연산
      container.querySelector('#btn-run-compound').addEventListener('click', () => {
        const p = parseFloat(container.querySelector('#fin-p-principal').value) || 0;
        const r = parseFloat(container.querySelector('#fin-p-rate').value) / 100 || 0;
        const n = parseFloat(container.querySelector('#fin-p-period').value) || 0;

        const timesPerYear = 12;
        const totalAmount = p * Math.pow(1 + r / timesPerYear, timesPerYear * n);
        const totalInterest = totalAmount - p;

        finLblRes1.textContent = '총 만기수령액:';
        finValRes1.textContent = Math.round(totalAmount).toLocaleString() + ' 원';
        finLblRes2.textContent = '순수 이자 수익:';
        finValRes2.textContent = Math.round(totalInterest).toLocaleString() + ' 원';
      });

      // 모듈 B: 물가상승 실질수익 연산
      container.querySelector('#btn-run-inflation').addEventListener('click', () => {
        const p = parseFloat(container.querySelector('#fin-i-principal').value) || 0;
        const nominalRate = parseFloat(container.querySelector('#fin-i-nominal').value) / 100 || 0;
        const inflationRate = parseFloat(container.querySelector('#fin-i-rate').value) / 100 || 0;
        const n = parseFloat(container.querySelector('#fin-i-period').value) || 0;

        const realRate = ((1 + nominalRate) / (1 + inflationRate)) - 1;
        const nominalFutureValue = p * Math.pow(1 + nominalRate, n);
        const realFutureValue = p * Math.pow(1 + realRate, n);

        finLblRes1.textContent = '실질 수익률 (Real Rate):';
        finValRes1.textContent = (realRate * 100).toFixed(2) + ' %';
        finLblRes2.textContent = '물가반영 실질가치:';
        finValRes2.textContent = Math.round(realFutureValue).toLocaleString() + ' 원 (명목: ' + Math.round(nominalFutureValue).toLocaleString() + '원)';
      });

      // 모듈 C: 채권 수익률 YTM 연산
      container.querySelector('#btn-run-bond').addEventListener('click', () => {
        const face = parseFloat(container.querySelector('#fin-b-face').value) || 0;
        const couponRate = parseFloat(container.querySelector('#fin-b-coupon').value) / 100 || 0;
        const price = parseFloat(container.querySelector('#fin-b-price').value) || 0;
        const period = parseFloat(container.querySelector('#fin-b-period').value) || 0;

        const coupon = face * couponRate;
        const numerator = coupon + ((face - price) / period);
        const denominator = (face + price) / 2;
        const ytm = denominator > 0 ? (numerator / denominator) : 0;

        finLblRes1.textContent = '만기수익률 (YTM Approx):';
        finValRes1.textContent = (ytm * 100).toFixed(2) + ' %';
        finLblRes2.textContent = '연간 쿠폰이자액:';
        finValRes2.textContent = Math.round(coupon).toLocaleString() + ' 원';
      });

      // 모듈 D: CAGR 연산
      container.querySelector('#btn-run-cagr').addEventListener('click', () => {
        const initial = parseFloat(container.querySelector('#fin-c-initial').value) || 0;
        const finalVal = parseFloat(container.querySelector('#fin-c-final').value) || 0;
        const period = parseFloat(container.querySelector('#fin-c-period').value) || 0;

        const cagr = (initial > 0 && period > 0) ? Math.pow(finalVal / initial, 1 / period) - 1 : 0;
        const multiple = initial > 0 ? (finalVal / initial) : 0;

        finLblRes1.textContent = '연평균 성장률 (CAGR):';
        finValRes1.textContent = (cagr * 100).toFixed(2) + ' %';
        finLblRes2.textContent = '총 투자배수 (Multiple):';
        finValRes2.textContent = multiple.toFixed(2) + ' 배';
      });

      // 최초 환율 동기화 1회 가동
      syncExchange('krw');
    }
  };
})();
