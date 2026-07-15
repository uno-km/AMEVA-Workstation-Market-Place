(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.calendar = {
    name: 'Calendar & Scheduler',
    description: '문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.',
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // ─────────────────────────────────────────────────────────────
      // [STATE & INITIALIZATION] 전역 캘린더 상태값들
      // ─────────────────────────────────────────────────────────────
      let currentDate = new Date();
      let selectedDate = new Date();
      let currentView = localStorage.getItem('ameva_calendar_view') || 'month'; // month, week, day, year

      // 로컬 스토리지에 저장되는 스케줄 데이터베이스 포맷
      // 구조: { 'YYYY-MM-DD': [ { id, title, time, repeat: 'none'|'weekly'|'monthly'|'yearly', repeatUntil, repeatCount } ] }
      let schedules = JSON.parse(localStorage.getItem('ameva_calendar_schedules_v2') || '{}');
      
      // 구 버전 마이그레이션 지원
      const legacyScheds = JSON.parse(localStorage.getItem('ameva_calendar_schedules') || '{}');
      if (Object.keys(legacyScheds).length > 0 && Object.keys(schedules).length === 0) {
        Object.keys(legacyScheds).forEach(dateStr => {
          schedules[dateStr] = legacyScheds[dateStr].map(item => ({
            id: 'legacy-' + Math.random().toString(36).substr(2, 9),
            title: typeof item === 'string' ? item : item.title || '',
            time: typeof item === 'string' ? '09:00' : item.time || '09:00',
            repeat: 'none'
          }));
        });
        localStorage.setItem('ameva_calendar_schedules_v2', JSON.stringify(schedules));
        localStorage.removeItem('ameva_calendar_schedules');
      }

      // 이미 발생 완료된 알림 기록 캐시
      let notifiedSchedules = {};

      // ─────────────────────────────────────────────────────────────
      // [HOLIDAYS DATABASE] 한국 공휴일 (양력 & 2024~2027 음력 하드코딩)
      // ─────────────────────────────────────────────────────────────
      const getKoreanHoliday = (year, month, day) => {
        // month는 0-based
        const m = month + 1;
        
        // 1. 양력 고정 공휴일
        if (m === 1 && day === 1) return '신정';
        if (m === 3 && day === 1) return '삼일절';
        if (m === 5 && day === 5) return '어린이날';
        if (m === 6 && day === 6) return '현충일';
        if (m === 8 && day === 15) return '광복절';
        if (m === 10 && day === 3) return '개천절';
        if (m === 10 && day === 9) return '한글날';
        if (m === 12 && day === 25) return '성탄절';

        // 2. 음력 유래 및 연휴 고정 공휴일 (2024~2027 하드코딩)
        const dateKey = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const lunarHolidays = {
          // 2024년
          '2024-02-09': '설날 연휴', '2024-02-10': '설날', '2024-02-11': '설날 연휴', '2024-02-12': '대체공휴일',
          '2024-05-15': '석가탄신일',
          '2024-09-16': '추석 연휴', '2024-09-17': '추석', '2024-09-18': '추석 연휴',
          // 2025년
          '2025-01-28': '설날 연휴', '2025-01-29': '설날', '2025-01-30': '설날 연휴', '2025-01-31': '대체공휴일',
          '2025-05-05': '석가탄신일/어린이날', '2025-05-06': '대체공휴일',
          '2025-10-05': '추석 연휴', '2025-10-06': '추석', '2025-10-07': '추석 연휴',
          // 2026년
          '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
          '2026-05-24': '석가탄신일', '2026-05-25': '대체공휴일',
          '2026-09-24': '추석 연휴', '2026-09-25': '추석', '2026-09-26': '추석 연휴',
          // 2027년
          '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일',
          '2027-05-13': '석가탄신일',
          '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴'
        };

        return lunarHolidays[dateKey] || null;
      };

      // ─────────────────────────────────────────────────────────────
      // [RECURRENCE LOGIC] 반복 일정을 고려한 특정일 일정 구하기
      // ─────────────────────────────────────────────────────────────
      const getSchedulesForDate = (dateStr) => {
        const targetDate = new Date(dateStr + 'T00:00:00');
        let list = [];

        // 1. 일반적인 다이렉트 일정 추가
        if (schedules[dateStr]) {
          list.push(...schedules[dateStr]);
        }

        // 2. 전체 스케줄을 순회하면서 반복(recurrence) 조건 매칭
        Object.keys(schedules).forEach(startDayStr => {
          if (startDayStr === dateStr) return; // 이미 위에서 직접 등록했으므로 패스
          
          const startDay = new Date(startDayStr + 'T00:00:00');
          if (targetDate < startDay) return; // 타겟 날짜가 시작일보다 이르면 당연히 반복 불가능

          schedules[startDayStr].forEach(item => {
            if (item.repeat === 'none' || !item.repeat) return;

            // 반복 한계 일자(repeatUntil) 도달 확인
            if (item.repeatUntil) {
              const untilDate = new Date(item.repeatUntil + 'T00:00:00');
              if (targetDate > untilDate) return;
            }

            // 조건별 매칭
            let isMatched = false;
            let occurrenceIdx = 0; // 반복 횟수 계산용

            if (item.repeat === 'weekly') {
              const diffTime = targetDate.getTime() - startDay.getTime();
              const diffDays = diffTime / (1000 * 60 * 60 * 24);
              if (diffDays % 7 === 0) {
                isMatched = true;
                occurrenceIdx = diffDays / 7;
              }
            } else if (item.repeat === 'monthly') {
              if (targetDate.getDate() === startDay.getDate()) {
                const monthsDiff = (targetDate.getFullYear() - startDay.getFullYear()) * 12 + (targetDate.getMonth() - startDay.getMonth());
                isMatched = true;
                occurrenceIdx = monthsDiff;
              }
            } else if (item.repeat === 'yearly') {
              if (targetDate.getDate() === startDay.getDate() && targetDate.getMonth() === startDay.getMonth()) {
                isMatched = true;
                occurrenceIdx = targetDate.getFullYear() - startDay.getFullYear();
              }
            }

            // 횟수 제한(repeatCount) 도달 확인
            if (isMatched && item.repeatCount) {
              if (occurrenceIdx >= parseInt(item.repeatCount, 10)) {
                isMatched = false;
              }
            }

            if (isMatched) {
              list.push({
                ...item,
                isRecurringInstance: true,
                parentDateStr: startDayStr
              });
            }
          });
        });

        // 일정 정렬 (시간순)
        return list.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
      };

      // ─────────────────────────────────────────────────────────────
      // [REMINDER ALERTS CHECKER] 시간 대조 후 리마인드 팝업창 렌더링
      // ─────────────────────────────────────────────────────────────
      const checkReminderAlerts = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const todayScheds = getSchedulesForDate(dateStr);
        todayScheds.forEach(sched => {
          if (sched.time === timeStr) {
            const cacheKey = `${sched.id}-${dateStr}-${timeStr}`;
            if (!notifiedSchedules[cacheKey]) {
              notifiedSchedules[cacheKey] = true;
              showSystemAlert(sched.title, sched.time);
            }
          }
        });
      };

      const showSystemAlert = (title, time) => {
        // 브라우저 팝업 알림 (권한 획득 시)
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('📅 AMEVA 캘린더 알림', {
            body: `[오후/오전 ${time}] ${title} 일정 시간입니다!`,
            icon: 'favicon.ico'
          });
        }

        // 앱 내부 커스텀 네온 알림창 모달 동적 생성
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
          position: fixed; bottom: 20px; right: 20px; z-index: 99999;
          background: rgba(15, 15, 20, 0.95); border: 1px solid var(--primary, #10b981);
          border-radius: 8px; padding: 12px 16px; width: 260px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          color: #fff; font-family: sans-serif;
          animation: slideUpAlert 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        alertBox.innerHTML = `
          <div style="font-weight: bold; font-size: 11.5px; color: var(--primary, #10b981); display: flex; justify-content: space-between; align-items: center;">
            <span>⏰ 일정 리마인더</span>
            <button class="alert-close" style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 11px;">✕</button>
          </div>
          <div style="font-size: 11px; margin-top: 6px; font-weight: bold;">${title}</div>
          <div style="font-size: 9px; color: var(--text-muted, #9ca3af); margin-top: 2px;">시간: ${time}</div>
        `;

        alertBox.querySelector('.alert-close').addEventListener('click', () => {
          alertBox.remove();
        });

        document.body.appendChild(alertBox);
        setTimeout(() => alertBox.remove(), 7000);
      };

      // 알림 권한 사전 획득 시도
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 30초마다 백그라운드 일정 체크 시작
      if (!window.ameva_calendar_timer) {
        window.ameva_calendar_timer = setInterval(checkReminderAlerts, 30000);
      }

      // ─────────────────────────────────────────────────────────────
      // [MAIN RENDER ENGINE] 메인 캘린더 렌더링 프레임워크
      // ─────────────────────────────────────────────────────────────
      const dateToString = (d) => {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const refreshCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // 4대 뷰 모드별 템플릿 분기
        let contentHtml = '';
        if (currentView === 'month') {
          contentHtml = buildMonthViewHtml(year, month);
        } else if (currentView === 'week') {
          contentHtml = buildWeekViewHtml();
        } else if (currentView === 'day') {
          contentHtml = buildDayViewHtml();
        } else if (currentView === 'year') {
          contentHtml = buildYearViewHtml(year);
        }

        container.innerHTML = `
          <div style="font-family: system-ui, -apple-system, sans-serif; color: #f3f4f6; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; background: #0b0c10; padding: 6px;">
            
            <!-- 상단 바: 타이틀 및 내보내기/복사 단축키 -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2029; padding-bottom: 6px;">
              <div style="display: flex; alignItems: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: bold; color: var(--primary, #10b981);">📅 스마트 스케줄러</span>
              </div>
              <div style="display: flex; gap: 4px;">
                <button id="btn-copy-markdown" style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer;">📋 복사</button>
                <button id="btn-insert-markdown" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer;">📝 본문 삽입</button>
              </div>
            </div>

            <!-- 세그먼티드 스위치 뷰 선택 헤더 -->
            <div style="display: flex; background: #13141a; padding: 3px; border-radius: 6px; border: 1px solid #1f2029; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 2px;">
                <button class="view-btn ${currentView === 'day' ? 'active' : ''}" data-view="day" style="background: transparent; border: none; color: #9ca3af; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">일별</button>
                <button class="view-btn ${currentView === 'week' ? 'active' : ''}" data-view="week" style="background: transparent; border: none; color: #9ca3af; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">주별</button>
                <button class="view-btn ${currentView === 'month' ? 'active' : ''}" data-view="month" style="background: transparent; border: none; color: #9ca3af; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">월별</button>
                <button class="view-btn ${currentView === 'year' ? 'active' : ''}" data-view="year" style="background: transparent; border: none; color: #9ca3af; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">년별</button>
              </div>
              <div style="display: flex; items: center; gap: 6px; background: #0b0c10; padding: 2px 8px; border-radius: 4px; border: 1px solid #1f2029;">
                <button id="cal-prev" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; font-size: 9px; padding: 1px 4px;">◀</button>
                <strong id="cal-header-title" style="font-size: 10px; letter-spacing: 0.5px; color: #fff;">${year}년 ${month+1}월</strong>
                <button id="cal-next" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; font-size: 9px; padding: 1px 4px;">▶</button>
              </div>
            </div>

            <!-- 메인 스케줄러 뷰 파트 -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; overflow: hidden;">
              ${contentHtml}
            </div>

            <!-- 리마인더 추가 및 반복 관리 패널 -->
            <div style="background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span id="selected-date-lbl" style="font-size: 10px; color: var(--primary, #10b981); font-weight: bold;">
                  선택일: ${dateToString(selectedDate)}
                </span>
                <span style="font-size: 8.5px; color: var(--text-muted, #9ca3af);">일정 추가</span>
              </div>
              
              <div style="display: flex; gap: 4px;">
                <input type="text" id="sched-title-input" placeholder="일정명을 입력하세요..." style="flex: 1.5; background: #0c0c0e; border: 1px solid #2e2e38; color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 10px; outline: none;" />
                <input type="time" id="sched-time-input" value="09:00" style="flex: 1; background: #0c0c0e; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 10px; outline: none;" />
              </div>

              <div style="display: flex; gap: 4px; align-items: center;">
                <select id="sched-repeat-select" style="flex: 1; background: #0c0c0e; border: 1px solid #2e2e38; color: #9ca3af; padding: 4px; border-radius: 4px; font-size: 9.5px; outline: none; cursor: pointer;">
                  <option value="none">반복 안함</option>
                  <option value="weekly">매주 반복</option>
                  <option value="monthly">매월 반복</option>
                  <option value="yearly">매년 반복</option>
                </select>
                
                <input type="number" id="sched-repeat-count" placeholder="횟수제한" style="width: 50px; display: none; background: #0c0c0e; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 9.5px; outline: none;" title="반복 횟수 제한" />
                <input type="date" id="sched-repeat-until" style="width: 90px; display: none; background: #0c0c0e; border: 1px solid #2e2e38; color: #fff; padding: 4px; border-radius: 4px; font-size: 9.5px; outline: none;" title="반복 종료 날짜" />

                <button id="btn-sched-add" style="background: var(--primary, #10b981); border: none; color: #052e16; padding: 4px 10px; border-radius: 4px; font-size: 9.5px; font-weight: bold; cursor: pointer; transition: background 0.12s;">추가</button>
              </div>
            </div>

          </div>

          <style>
            @keyframes slideUpAlert {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .view-btn.active {
              background: var(--primary, #10b981) !important;
              color: #052e16 !important;
            }
            .cal-cell:hover {
              background: rgba(255,255,255,0.03) !important;
              border-color: #1f2029 !important;
            }
            .cal-cell.selected {
              background: rgba(16, 185, 129, 0.12) !important;
              border: 1px solid var(--primary, #10b981) !important;
              color: #fff !important;
            }
            .holiday-red {
              color: #f87171 !important;
            }
            .holiday-label {
              font-size: 7.5px;
              color: #f87171;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 90%;
            }
          </style>
        `;

        bindCalendarEvents();
      };

      // ─────────────────────────────────────────────────────────────
      // [VIEW TEMPLATE BUILDERS] 일/주/월/년 뷰 HTML 렌더러
      // ─────────────────────────────────────────────────────────────
      
      // 1. 월간 뷰 그리드
      const buildMonthViewHtml = (year, month) => {
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        let cells = [];
        // 전달 빈칸
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
          const d = prevMonthLastDate - i;
          cells.push(`<div style="color: #4b5563; font-size: 10px; opacity: 0.35; padding: 4px; text-align: center;">${d}</div>`);
        }
        
        // 당월 날짜
        for (let d = 1; d <= lastDate; d++) {
          const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
          
          const schedList = getSchedulesForDate(dateStr);
          const holidayName = getKoreanHoliday(year, month, d);
          const dayOfWeek = new Date(year, month, d).getDay();

          const isRed = dayOfWeek === 0 || !!holidayName;

          cells.push(`
            <div class="cal-cell ${isSelected ? 'selected' : ''}" data-date="${dateStr}" style="
              aspect-ratio: 1.1; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
              border-radius: 6px; cursor: pointer; position: relative; font-size: 10.5px; padding: 4px;
              background: ${isToday ? 'rgba(139,92,246,0.1)' : 'transparent'};
              border: ${isToday ? '1px dashed #818cf8' : '1px solid transparent'};
              transition: all 0.15s;
            ">
              <span class="${isRed ? 'holiday-red' : ''}" style="font-weight: ${isToday || isSelected ? 'bold' : 'normal'}">${d}</span>
              ${holidayName ? `<span class="holiday-label" title="${holidayName}">${holidayName}</span>` : ''}
              <div style="display: flex; gap: 2px; justify-content: center; width: 100%; min-height: 4px;">
                ${schedList.slice(0, 3).map(s => `
                  <span style="width: 4px; height: 4px; background: ${s.repeat !== 'none' ? '#a78bfa' : '#10b981'}; border-radius: 50%;"></span>
                `).join('')}
                ${schedList.length > 3 ? '<span style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%;"></span>' : ''}
              </div>
            </div>
          `);
        }

        return `
          <!-- 요일 헤더 -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 9px; color: var(--text-muted, #9ca3af); font-weight: bold; text-transform: uppercase;">
            <div class="holiday-red">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <!-- 날짜 그리드 -->
          <div id="cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 6px; flex-shrink: 0;">
            ${cells.join('')}
          </div>
          <!-- 상세 리스트 -->
          <div style="background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 8px; flex: 1; overflow-y: auto; display: flex; flexDirection: column; gap: 4px;">
            <span style="font-size: 10px; font-weight: bold; color: var(--primary, #10b981);">오늘의 스케줄</span>
            <div id="sched-list" style="display: flex; flex-direction: column; gap: 4px;">
              ${buildScheduleListHtml(selectedDate)}
            </div>
          </div>
        `;
      };

      // 2. 주간 뷰 그리드
      const buildWeekViewHtml = () => {
        const currentDayOfWeek = selectedDate.getDay();
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - currentDayOfWeek);

        let dayColumns = [];
        for (let i = 0; i < 7; i++) {
          const wDay = new Date(startOfWeek);
          wDay.setDate(startOfWeek.getDate() + i);
          const dateStr = dateToString(wDay);
          const isToday = wDay.toDateString() === new Date().toDateString();
          const isSelected = wDay.toDateString() === selectedDate.toDateString();

          const schedList = getSchedulesForDate(dateStr);
          const holidayName = getKoreanHoliday(wDay.getFullYear(), wDay.getMonth(), wDay.getDate());
          const isRed = i === 0 || !!holidayName;

          dayColumns.push(`
            <div class="week-col cal-cell ${isSelected ? 'selected' : ''}" data-date="${dateStr}" style="
              flex: 1; display: flex; flex-direction: column; align-items: center; border-radius: 6px; padding: 6px 4px;
              background: ${isToday ? 'rgba(139,92,246,0.06)' : 'transparent'};
              border: ${isToday ? '1px dashed #818cf8' : '1px solid transparent'};
              min-width: 42px; cursor: pointer; transition: all 0.12s;
            ">
              <span style="font-size: 8.5px; color: var(--text-muted, #9ca3af); text-transform: uppercase;">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
              </span>
              <span class="${isRed ? 'holiday-red' : ''}" style="font-size: 13px; font-weight: bold; margin-top: 2px;">
                ${wDay.getDate()}
              </span>
              ${holidayName ? `<span style="font-size: 7px; color: #f87171; text-align: center; transform: scale(0.9); margin-top: 1px;">${holidayName}</span>` : ''}
              
              <!-- 일지 요약 리스트 -->
              <div style="display: flex; flex-direction: column; gap: 3px; width: 100%; margin-top: 8px; flex: 1; overflow-y: auto;">
                ${schedList.map(s => `
                  <div style="
                    font-size: 8px; padding: 2px; border-radius: 3px; background: ${s.repeat !== 'none' ? 'rgba(167,139,250,0.15)' : 'rgba(16,185,129,0.15)'};
                    border-left: 2px solid ${s.repeat !== 'none' ? '#a78bfa' : '#10b981'}; color: #fff;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                  " title="${s.time} - ${s.title}">
                    ${s.title}
                  </div>
                `).join('')}
              </div>
            </div>
          `);
        }

        return `
          <div id="cal-grid" style="display: flex; gap: 4px; background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 6px; flex: 1; overflow-x: auto;">
            ${dayColumns.join('')}
          </div>
          <!-- 아래에 상세 일과 요약 노출 -->
          <div style="background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 8px; height: 110px; overflow-y: auto;">
            <span style="font-size: 10px; font-weight: bold; color: var(--primary, #10b981);">상세 주간 분석 (${startOfWeek.getMonth()+1}월 ${startOfWeek.getDate()}일 ~ )</span>
            <div id="sched-list" style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
              ${buildScheduleListHtml(selectedDate)}
            </div>
          </div>
        `;
      };

      // 3. 일별 일과 타임라인
      const buildDayViewHtml = () => {
        const dateStr = dateToString(selectedDate);
        const schedList = getSchedulesForDate(dateStr);
        const holidayName = getKoreanHoliday(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        let hoursHtml = [];
        for (let h = 8; h <= 22; h++) {
          const timeLabel = `${String(h).padStart(2, '0')}:00`;
          const slotScheds = schedList.filter(s => {
            const sh = parseInt(s.time.split(':')[0], 10);
            return sh === h;
          });

          hoursHtml.push(`
            <div style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.02); padding: 4px 0; min-height: 24px;">
              <span style="width: 40px; font-size: 9px; color: var(--text-muted, #9ca3af); font-family: monospace; align-self: center;">${timeLabel}</span>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                ${slotScheds.map(s => `
                  <div style="
                    background: ${s.repeat !== 'none' ? 'rgba(167,139,250,0.12)' : 'rgba(16,185,129,0.12)'};
                    border: 1px solid ${s.repeat !== 'none' ? 'rgba(167,139,250,0.3)' : 'rgba(16,185,129,0.3)'};
                    border-left: 3px solid ${s.repeat !== 'none' ? '#a78bfa' : '#10b981'};
                    border-radius: 4px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center;
                  ">
                    <span style="font-size: 10px; font-weight: bold; color: #fff;">${s.title}</span>
                    <div style="display: flex; items: center; gap: 6px;">
                      <span style="font-size: 8px; color: var(--text-muted, #9ca3af);">${s.time} ${s.repeat !== 'none' ? '🔁' : ''}</span>
                      <button class="sched-del" data-date="${dateStr}" data-id="${s.id}" style="background: transparent; border: none; color: #ef4444; font-size: 9px; cursor: pointer; padding: 2px;">✕</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `);
        }

        return `
          <div style="background: #13141a; border: 1px solid #1f2029; border-radius: 8px; padding: 8px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2029; padding-bottom: 4px;">
              <span style="font-size: 10.5px; font-weight: bold; color: #fff;">하루 타임라인</span>
              ${holidayName ? `<span style="font-size: 9.5px; color: #f87171; font-weight: bold;">🎉 ${holidayName}</span>` : ''}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${hoursHtml.join('')}
            </div>
          </div>
        `;
      };

      // 4. 연간 미니 캘린더 모음
      const buildYearViewHtml = (year) => {
        let monthsGrid = [];
        
        for (let m = 0; m < 12; m++) {
          const firstDay = new Date(year, m, 1).getDay();
          const lastDate = new Date(year, m + 1, 0).getDate();
          
          let dayCells = [];
          for (let i = 0; i < firstDay; i++) {
            dayCells.push('<div></div>');
          }
          for (let d = 1; d <= lastDate; d++) {
            const dateStr = `${year}-${String(m+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === m && selectedDate.getDate() === d;
            const hasSched = getSchedulesForDate(dateStr).length > 0;
            const isRed = new Date(year, m, d).getDay() === 0 || !!getKoreanHoliday(year, m, d);

            dayCells.push(`
              <div class="mini-day-cell ${isSelected ? 'selected' : ''}" data-date="${dateStr}" style="
                font-size: 7.5px; text-align: center; cursor: pointer; border-radius: 2px;
                background: ${isSelected ? 'var(--primary, #10b981)' : 'transparent'};
                color: ${isSelected ? '#000' : isRed ? '#f87171' : '#9ca3af'};
                position: relative; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
              ">
                ${d}
                ${hasSched && !isSelected ? '<span style="width: 2px; height: 2px; background: #10b981; border-radius: 50%; position: absolute; bottom: 0.5px;"></span>' : ''}
              </div>
            `);
          }

          monthsGrid.push(`
            <div style="background: #13141a; border: 1px solid #1f2029; border-radius: 6px; padding: 6px; display: flex; flex-direction: column; gap: 3px;">
              <span class="mini-month-click" data-month-idx="${m}" style="font-size: 9px; font-weight: bold; color: var(--primary, #10b981); cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2px; text-align: center;">${m+1}월</span>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; font-size: 6px; color: #4b5563; text-align: center; font-weight: bold; margin-bottom: 2px;">
                <div style="color: #f87171;">S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px;">
                ${dayCells.join('')}
              </div>
            </div>
          `);
        }

        return `
          <div id="cal-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; overflow-y: auto; flex: 1; padding: 2px;">
            ${monthsGrid.join('')}
          </div>
        `;
      };

      // 스케줄 리스트 HTML 빌더 헬퍼
      const buildScheduleListHtml = (date) => {
        const dateStr = dateToString(date);
        const list = getSchedulesForDate(dateStr);
        if (list.length === 0) {
          return `<div style="color: var(--text-muted, #9ca3af); text-align: center; padding: 12px; font-size: 9.5px;">등록된 일정이 없습니다.</div>`;
        }
        
        return list.map(item => `
          <div style="background: #1c1d24; border: 1px solid #2e303e; border-radius: 5px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px;">
            <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
              <span style="font-size: 10px; font-weight: bold; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.title}</span>
              <span style="font-size: 8px; color: var(--text-muted, #9ca3af); display: flex; gap: 4px; align-items: center; margin-top: 1px;">
                ⏰ ${item.time}
                ${item.repeat !== 'none' ? `<span style="background: rgba(167,139,250,0.15); color: #a78bfa; padding: 0.5px 3px; border-radius: 2px; font-size: 7px;">매주/매월/매년 반복</span>` : ''}
              </span>
            </div>
            <button class="sched-del" data-date="${dateStr}" data-id="${item.id}" style="background: transparent; border: none; color: #ef4444; font-size: 10px; cursor: pointer; padding: 2px 4px;">✕</button>
          </div>
        `).join('');
      };

      // ─────────────────────────────────────────────────────────────
      // [EVENT BINDERS] DOM 요소 클릭 및 입력 폼 액션 바인딩
      // ─────────────────────────────────────────────────────────────
      const bindCalendarEvents = () => {
        container.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const nextView = e.currentTarget.getAttribute('data-view');
            currentView = nextView;
            localStorage.setItem('ameva_calendar_view', nextView);
            refreshCalendar();
          });
        });

        container.querySelector('#cal-prev').addEventListener('click', () => {
          if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
          } else if (currentView === 'week') {
            selectedDate.setDate(selectedDate.getDate() - 7);
            currentDate.setTime(selectedDate.getTime());
          } else if (currentView === 'day') {
            selectedDate.setDate(selectedDate.getDate() - 1);
            currentDate.setTime(selectedDate.getTime());
          } else if (currentView === 'year') {
            currentDate.setFullYear(currentDate.getFullYear() - 1);
          }
          refreshCalendar();
        });

        container.querySelector('#cal-next').addEventListener('click', () => {
          if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else if (currentView === 'week') {
            selectedDate.setDate(selectedDate.getDate() + 7);
            currentDate.setTime(selectedDate.getTime());
          } else if (currentView === 'day') {
            selectedDate.setDate(selectedDate.getDate() + 1);
            currentDate.setTime(selectedDate.getTime());
          } else if (currentView === 'year') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }
          refreshCalendar();
        });

        const titleLbl = container.querySelector('#cal-header-title');
        if (currentView === 'month') {
          titleLbl.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
        } else if (currentView === 'week') {
          const sunday = new Date(selectedDate);
          sunday.setDate(selectedDate.getDate() - selectedDate.getDay());
          const saturday = new Date(sunday);
          saturday.setDate(sunday.getDate() + 6);
          titleLbl.textContent = `${sunday.getMonth() + 1}/${sunday.getDate()} ~ ${saturday.getMonth() + 1}/${saturday.getDate()}`;
        } else if (currentView === 'day') {
          titleLbl.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
        } else if (currentView === 'year') {
          titleLbl.textContent = `${currentDate.getFullYear()}년`;
        }

        const grid = container.querySelector('#cal-grid');
        if (grid) {
          grid.addEventListener('click', (e) => {
            const cell = e.target.closest('.cal-cell, .mini-day-cell');
            if (!cell) return;

            const dateStr = cell.getAttribute('data-date');
            selectedDate = new Date(dateStr + 'T00:00:00');
            currentDate.setTime(selectedDate.getTime());

            if (currentView === 'year') {
              currentView = 'month';
              localStorage.setItem('ameva_calendar_view', 'month');
            }

            refreshCalendar();
          });
        }

        container.querySelectorAll('.mini-month-click').forEach(mBtn => {
          mBtn.addEventListener('click', (e) => {
            const mIdx = parseInt(e.currentTarget.getAttribute('data-month-idx'), 10);
            currentDate.setMonth(mIdx);
            selectedDate.setMonth(mIdx);
            currentView = 'month';
            localStorage.setItem('ameva_calendar_view', 'month');
            refreshCalendar();
          });
        });

        const repeatSelect = container.querySelector('#sched-repeat-select');
        const repeatCount = container.querySelector('#sched-repeat-count');
        const repeatUntil = container.querySelector('#sched-repeat-until');
        
        if (repeatSelect) {
          repeatSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'none') {
              repeatCount.style.display = 'none';
              repeatUntil.style.display = 'none';
            } else {
              repeatCount.style.display = 'block';
              repeatUntil.style.display = 'block';
            }
          });
        }

        const addBtn = container.querySelector('#btn-sched-add');
        const titleInput = container.querySelector('#sched-title-input');
        const timeInput = container.querySelector('#sched-time-input');

        const handleAddSchedule = () => {
          const title = titleInput.value.trim();
          const time = timeInput.value || '09:00';
          if (!title) return;

          const dateStr = dateToString(selectedDate);
          
          if (!schedules[dateStr]) {
            schedules[dateStr] = [];
          }

          const newSched = {
            id: 'sched-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            title: title,
            time: time,
            repeat: repeatSelect.value,
            repeatCount: repeatCount.value || null,
            repeatUntil: repeatUntil.value || null
          };

          schedules[dateStr].push(newSched);
          localStorage.setItem('ameva_calendar_schedules_v2', JSON.stringify(schedules));

          titleInput.value = '';
          timeInput.value = '09:00';
          if (repeatSelect) {
            repeatSelect.value = 'none';
            repeatCount.style.display = 'none';
            repeatUntil.style.display = 'none';
            repeatCount.value = '';
            repeatUntil.value = '';
          }
          
          refreshCalendar();
        };

        if (addBtn) {
          addBtn.addEventListener('click', handleAddSchedule);
        }
        if (titleInput) {
          titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAddSchedule();
          });
        }

        container.querySelectorAll('.sched-del').forEach(delBtn => {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dateStr = e.currentTarget.getAttribute('data-date');
            const schedId = e.currentTarget.getAttribute('data-id');
            
            if (schedules[dateStr]) {
              schedules[dateStr] = schedules[dateStr].filter(s => s.id !== schedId);
              if (schedules[dateStr].length === 0) {
                delete schedules[dateStr];
              }
              localStorage.setItem('ameva_calendar_schedules_v2', JSON.stringify(schedules));
              refreshCalendar();
            }
          });
        });

        const buildMarkdownSchedule = () => {
          const dateStr = dateToString(selectedDate);
          const list = getSchedulesForDate(dateStr);
          if (list.length === 0) {
            return `### 📅 ${dateStr} 일정\n\n> 등록된 스케줄이 존재하지 않습니다.`;
          }

          let md = `### 📅 ${dateStr} 일정 현황\n\n`;
          md += `| 시간 | 일정 내용 | 반복 여부 |\n`;
          md += `|:---|:---|:---|\n`;
          list.forEach(s => {
            md += `| ${s.time} | **${s.title}** | ${s.repeat !== 'none' ? `🔁 매주/매월/매년` : '1회성'} |\n`;
          });
          return md;
        };

        const copyBtn = container.querySelector('#btn-copy-markdown');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const md = buildMarkdownSchedule();
            navigator.clipboard.writeText(md).then(() => {
              copyBtn.textContent = '복사 완료! ✓';
              setTimeout(() => copyBtn.textContent = '📋 복사', 2000);
            });
          });
        }

        const insertBtn = container.querySelector('#btn-insert-markdown');
        if (insertBtn) {
          insertBtn.addEventListener('click', () => {
            const md = buildMarkdownSchedule();
            window.dispatchEvent(new CustomEvent('ameva:insert-text', { detail: md }));
            insertBtn.textContent = '삽입 완료! ✓';
            setTimeout(() => insertBtn.textContent = '📝 본문 삽입', 2000);
          });
        }
      };

      refreshCalendar();
    }
  };
})();
