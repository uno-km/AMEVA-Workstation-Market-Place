(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.naver = {
    name: 'Naver Portal',
    description: '임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.',
    render: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div style="font-family: 'Pretendard', sans-serif; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; gap: 8px;">
          
          <div style="font-size: 13px; font-weight: bold; color: #1EC800; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2e2e38; padding-bottom: 6px;">
            <span>🟢 Naver Secure Search</span>
            <span style="font-size: 9px; color: #34d399; background: rgba(52,211,153,0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(52,211,153,0.2);">🔒 Temp Session</span>
          </div>

          <div style="flex: 1; border: 1px solid #2e2e38; border-radius: 8px; overflow: hidden; background: #000; position: relative;">
            <webview 
              id="naver-webview"
              src="https://www.naver.com" 
              partition="temp-session" 
              style="width: 100%; height: 100%; display: inline-flex;"
            ></webview>
          </div>
          
          <div style="font-size: 9.5px; color: var(--text-muted); line-height: 1.4; text-align: center;">
            ※ 임시 보안 파티션 세션이 가동 중입니다. 로그인 정보는 앱 종료 시 안전하게 소멸합니다.
          </div>

        </div>
      `;

      const webview = container.querySelector('#naver-webview');
      if (webview) {
        webview.addEventListener('context-menu', (e) => {
          e.preventDefault();
          const params = e.params;
          if (!params || !params.selectionText) return;

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
          menu.style.minWidth = '160px';
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

          const text = params.selectionText.trim();

          menu.appendChild(createItem('본문에 삽입하기', '📝', () => {
            if (typeof window.AMEVA_INSERT_TEXT_TO_EDITOR === 'function') {
              window.AMEVA_INSERT_TEXT_TO_EDITOR(text);
            }
          }));

          menu.appendChild(createItem('에이전트에 문의하기', '💬', () => {
            if (typeof window.AMEVA_ASK_AGENT === 'function') {
              window.AMEVA_ASK_AGENT(text);
            }
          }));

          menu.appendChild(createItem('텍스트 복사하기', '📋', () => {
            navigator.clipboard.writeText(text);
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
    }
  };
})();
