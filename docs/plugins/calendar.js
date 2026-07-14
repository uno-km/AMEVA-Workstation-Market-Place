(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.calendar = {
    name: 'Calendar & Scheduler',
    description: '문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.',
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const date = new Date();
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth(); // 0-based
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      // 메모를 로컬 스토리지에서 안전 보존
      let schedules = JSON.parse(localStorage.getItem('ameva_calendar_schedules') || '{}');

      // 렌더링을 갱신하는 헬퍼 함수
      const renderCalendar = (year, month) => {
        // 첫번째 날과 마지막 날 계산
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        // 날짜 칸 그리드 생성
        let cells = [];
        // 빈칸 채우기
        for (let i = 0; i < firstDayIndex; i++) {
          cells.push('<div style="color: transparent; pointer-events: none;"></div>');
        }
        
        // 날짜들 채우기
        for (let d = 1; d <= lastDate; d++) {
          const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const hasSchedule = schedules[dateStr] && schedules[dateStr].length > 0;
          const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

          cells.push(`
            <div class="cal-cell" data-date="${dateStr}" style="
              aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
              border-radius: 6px; cursor: pointer; position: relative; font-size: 11px;
              background: ${isToday ? 'rgba(139,92,246,0.15)' : 'transparent'};
              border: ${isToday ? '1px solid var(--primary)' : '1px solid transparent'};
              transition: all 0.15s;
            ">
              <span>${d}</span>
              ${hasSchedule ? '<span style="width: 4px; height: 4px; background: #ef4444; border-radius: 50%; position: absolute; bottom: 3px;"></span>' : ''}
            </div>
          `);
        }

        container.innerHTML = `
          <div style="font-family: 'Pretendard', sans-serif; color: #f8fafc; display: flex; flex-direction: column; gap: 10px; height: 100%; box-sizing: border-box;">
            
            <div style="font-size: 13px; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #2e2e38; padding-bottom: 6px;">
              <span>📅 Calendar Planner</span>
            </div>

            <!-- 월 스위치 헤더 -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #0f0f11; padding: 6px 12px; border: 1px solid #2e2e38; border-radius: 6px;">
              <button id="cal-prev" style="background: transparent; border: none; color: #fff; cursor: pointer; font-size: 12px;">◀</button>
              <strong id="cal-month-title" style="font-size: 12px; letter-spacing: 0.5px;">${monthNames[month]} ${year}</strong>
              <button id="cal-next" style="background: transparent; border: none; color: #fff; cursor: pointer; font-size: 12px;">▶</button>
            </div>

            <!-- 요일 헤더 -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 9px; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <!-- 날짜 그리드 -->
            <div id="cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: #0c0c0e; border: 1px solid #2e2e38; border-radius: 8px; padding: 8px; flex-shrink: 0;">
              ${cells.join('')}
            </div>

            <!-- 일정 입력 & 상세 내역 하단 패널 -->
            <div style="background: #0f0f11; border: 1px solid #2e2e38; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="selected-date-lbl" style="font-size: 10px; color: var(--primary); font-weight: bold;">선택된 날짜가 없습니다.</span>
                <span style="font-size: 8px; color: var(--text-muted);">Schedules</span>
              </div>

              <!-- 일정 추가 입력 폼 -->
              <div style="display: flex; gap: 4px;">
                <input type="text" id="sched-input" placeholder="새로운 일정을 입력하세요..." style="flex: 1; background: #18181c; border: 1px solid #2e2e38; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10.5px; outline: none;" />
                <button id="btn-sched-add" style="background: var(--primary); border: none; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">추가</button>
              </div>

              <!-- 일정 목록 -->
              <div id="sched-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; margin-top: 4px; overflow-y: auto; flex: 1;">
                <div style="color: var(--text-muted); text-align: center; padding-top: 20px; font-size: 10px;">날짜를 선택해 일정을 관리하세요.</div>
              </div>
            </div>

          </div>

          <style>
            .cal-cell:hover {
              background: rgba(255,255,255,0.04) !important;
              border-color: #2e2e38 !important;
            }
            .cal-cell.selected {
              background: var(--primary) !important;
              color: #000 !important;
              font-weight: bold;
            }
          </style>
        `;

        // 요일 헤더 및 월 스위치 바인딩
        let activeYear = year;
        let activeMonth = month;
        let activeDateStr = '';

        const monthTitle = container.querySelector('#cal-month-title');
        const grid = container.querySelector('#cal-grid');

        container.querySelector('#cal-prev').addEventListener('click', () => {
          activeMonth--;
          if (activeMonth < 0) {
            activeMonth = 11;
            activeYear--;
          }
          renderCalendar(activeYear, activeMonth);
        });

        container.querySelector('#cal-next').addEventListener('click', () => {
          activeMonth++;
          if (activeMonth > 11) {
            activeMonth = 0;
            activeYear++;
          }
          renderCalendar(activeYear, activeMonth);
        });

        // 캘린더 날짜 클릭 바인딩
        const dateLbl = container.querySelector('#selected-date-lbl');
        const schedInput = container.querySelector('#sched-input');
        const schedAddBtn = container.querySelector('#btn-sched-add');
        const schedList = container.querySelector('#sched-list');

        const updateSchedList = (dateStr) => {
          const list = schedules[dateStr] || [];
          if (list.length === 0) {
            schedList.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding-top: 20px; font-size: 10px;">등록된 일정이 없습니다.</div>`;
          } else {
            schedList.innerHTML = list.map((item, idx) => `
              <div style="background: #18181c; border: 1px solid #2e2e38; border-radius: 4px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center;">
                <span>${item}</span>
                <button class="sched-del" data-idx="${idx}" style="background: transparent; border: none; color: #ef4444; font-size: 10px; cursor: pointer;">삭제</button>
              </div>
            `).join('');

            // 삭제 버튼 바인딩
            schedList.querySelectorAll('.sched-del').forEach(delBtn => {
              delBtn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                schedules[dateStr].splice(idx, 1);
                if (schedules[dateStr].length === 0) delete schedules[dateStr];
                localStorage.setItem('ameva_calendar_schedules', JSON.stringify(schedules));
                updateSchedList(dateStr);
                
                // 달력 빨간 점 갱신용으로 캘린더 리렌더링
                const sel = grid.querySelector('.cal-cell.selected');
                const lastSelDate = sel ? sel.getAttribute('data-date') : '';
                renderCalendar(activeYear, activeMonth);
                if (lastSelDate) {
                  const targetCell = grid.querySelector(`.cal-cell[data-date="${lastSelDate}"]`);
                  if (targetCell) {
                    targetCell.classList.add('selected');
                    dateLbl.textContent = lastSelDate;
                    activeDateStr = lastSelDate;
                    updateSchedList(lastSelDate);
                  }
                }
              });
            });
          }
        };

        grid.addEventListener('click', (e) => {
          const cell = e.target.closest('.cal-cell');
          if (!cell) return;

          grid.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          
          const dateStr = cell.getAttribute('data-date');
          activeDateStr = dateStr;
          dateLbl.textContent = dateStr;
          updateSchedList(dateStr);
        });

        // 일정 추가 핸들러
        const addSchedule = () => {
          if (!activeDateStr) {
            alert('날짜를 먼저 선택해 주세요.');
            return;
          }
          const text = schedInput.value.trim();
          if (!text) return;

          if (!schedules[activeDateStr]) {
            schedules[activeDateStr] = [];
          }
          schedules[activeDateStr].push(text);
          localStorage.setItem('ameva_calendar_schedules', JSON.stringify(schedules));
          schedInput.value = '';
          updateSchedList(activeDateStr);

          // 캘린더 리렌더링으로 빨간 점 찍기
          renderCalendar(activeYear, activeMonth);
          // 선택 날짜 유지 복원
          const targetCell = grid.querySelector(`.cal-cell[data-date="${activeDateStr}"]`);
          if (targetCell) {
            targetCell.classList.add('selected');
            dateLbl.textContent = activeDateStr;
            updateSchedList(activeDateStr);
          }
        };

        schedAddBtn.addEventListener('click', addSchedule);
        schedInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') addSchedule();
        });
      };

      // 초기 가동
      renderCalendar(currentYear, currentMonth);
    }
  };
})();
