(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.youtube = {
    name: 'YouTube Player',
    description: '임시 세션으로 안전하게 유튜브 사이트를 웹 뷰어로 시청하고, 시청 중인 영상을 실시간 PiP 플로팅 카드로 분리하는 도구입니다.',
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div style="font-family: 'Pretendard', sans-serif; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; gap: 8px;">
          
          <!-- 제어바 -->
          <div style="font-size: 13px; font-weight: bold; color: #ff0000; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2e2e38; padding-bottom: 6px; flex-shrink: 0;">
            <span style="display: flex; align-items: center; gap: 6px;">🎬 YouTube Web Portal</span>
            <div style="display: flex; gap: 6px;">
              <button id="btn-yt-home" style="background: #2e2e38; border: none; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 9.5px; cursor: pointer;">🏠 홈</button>
              <button id="btn-yt-pip-wv" style="background: var(--primary); border: none; color: #000; padding: 3px 8px; border-radius: 4px; font-size: 9.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 2px;">
                ✨ 현재 시청 영상 PiP 전환
              </button>
            </div>
          </div>

          <!-- 진짜 유튜브 사이트를 temp-session 파티션 웹뷰어로 마운트 -->
          <div style="flex: 1; border: 1px solid #2e2e38; border-radius: 8px; overflow: hidden; background: #000; position: relative;">
            <webview 
              id="yt-webview"
              src="https://www.youtube.com" 
              partition="temp-session" 
              style="width: 100%; height: 100%; display: inline-flex;"
            ></webview>
          </div>
          
          <div style="font-size: 8.5px; color: var(--text-muted); line-height: 1.4; text-align: center; flex-shrink: 0;">
            ※ 영상 시청 중 우측 상단 **[현재 시청 영상 PiP 전환]**을 누르면 에디터 화면에 둥둥 뜨는 플로팅 플레이어로 즉시 전환됩니다.
          </div>

        </div>
      `;

      const webview = container.querySelector('#yt-webview');
      const homeBtn = container.querySelector('#btn-yt-home');
      const pipBtn = container.querySelector('#btn-yt-pip-wv');

      // 1. 홈 버튼 클릭 시 유튜브 홈으로 복귀
      homeBtn.addEventListener('click', () => {
        if (webview) {
          webview.src = "https://www.youtube.com";
        }
      });

      // 2. 실시간 감지하여 현재 재생 중인 영상 PiP 모드로 전환
      pipBtn.addEventListener('click', () => {
        if (!webview) return;
        
        try {
          // Electron webview의 실시간 URL 주소 획득
          const currentUrl = webview.getURL();
          
          let videoId = null;
          if (currentUrl.includes('watch?v=')) {
            videoId = currentUrl.split('watch?v=')[1].split('&')[0];
          } else if (currentUrl.includes('embed/')) {
            videoId = currentUrl.split('embed/')[1].split('?')[0];
          } else if (currentUrl.includes('youtu.be/')) {
            videoId = currentUrl.split('youtu.be/')[1].split('?')[0];
          } else if (currentUrl.includes('/v/')) {
            videoId = currentUrl.split('/v/')[1].split('?')[0];
          }

          if (videoId) {
            if (typeof window.AMEVA_TRIGGER_YOUTUBE_PIP === 'function') {
              window.AMEVA_TRIGGER_YOUTUBE_PIP(videoId);
              alert('현재 시청 중인 영상이 에디터 PiP 플로팅 창으로 분리되었습니다!');
            } else {
              alert('PiP 모듈이 로드되지 않았습니다.');
            }
          } else {
            alert('현재 재생 중인 YouTube 동영상 페이지가 아닙니다.\n동영상을 클릭해 시청하고 있는 상태에서 눌러주세요!');
          }
        } catch (e) {
          console.error('URL 파싱 실패:', e);
          alert('영상의 URL 정보를 읽어오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
      });

      // 3. 우클릭 시 유튜브 주소 공유/문의 컨텍스트 메뉴
      webview.addEventListener('context-menu', (e) => {
        e.preventDefault();
        
        const oldMenu = document.getElementById('ameva-webview-context-menu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'ameva-webview-context-menu';
        menu.style.position = 'fixed';
        const rect = webview.getBoundingClientRect();
        menu.style.left = (rect.left + e.clientX) + 'px';
        menu.style.top = (rect.top + e.clientY) + 'px';
        menu.style.zIndex = '99999';
        menu.style.backgroundColor = 'rgba(24, 24, 32, 0.95)';
        menu.style.backdropFilter = 'blur(10px)';
        menu.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        menu.style.borderRadius = '8px';
        menu.style.padding = '4px 0';
        menu.style.minWidth = '190px';
        menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';

        const createItem = (label, icon, onClick) => {
          const item = document.createElement('button');
          item.innerHTML = '<span style="margin-right: 8px;">' + icon + '</span>' + label;
          item.style.padding = '8px 12px';
          item.style.border = 'none';
          item.style.background = 'none';
          item.style.color = '#fff';
          item.style.textAlign = 'left';
          item.style.fontSize = '12px';
          item.style.cursor = 'pointer';
          item.style.transition = 'background 0.2s';
          item.onmouseenter = () => item.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
          item.onmouseleave = () => item.style.backgroundColor = 'transparent';
          item.addEventListener('click', (ev) => {
            ev.stopPropagation();
            onClick();
            menu.remove();
          });
          return item;
        };

        let currentUrl = '';
        try {
          currentUrl = webview.getURL();
        } catch (err) {}

        if (!currentUrl || !currentUrl.startsWith('http')) {
          currentUrl = 'https://www.youtube.com';
        }

        menu.appendChild(createItem('현재 영상 주소 본문에 삽입', '🔗', () => {
          if (typeof window.AMEVA_INSERT_TEXT_TO_EDITOR === 'function') {
            window.AMEVA_INSERT_TEXT_TO_EDITOR(currentUrl);
          }
        }));

        menu.appendChild(createItem('영상 주소 복사하기', '📋', () => {
          navigator.clipboard.writeText(currentUrl);
        }));

        menu.appendChild(createItem('이 영상에 대해 문의하기', '💬', () => {
          if (typeof window.AMEVA_ASK_AGENT === 'function') {
            window.AMEVA_ASK_AGENT('이 유튜브 영상에 대해 설명해줘: ' + currentUrl);
          }
        }));

        document.body.appendChild(menu);

        const closeMenu = () => {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        };
        setTimeout(() => {
          document.addEventListener('click', closeMenu);
        }, 50);
      });
    }
  };
})();
