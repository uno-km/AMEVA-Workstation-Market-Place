document.addEventListener('DOMContentLoaded', () => {
  const premiumGrid = document.getElementById('premiumGrid');
  const standardGrid = document.getElementById('standardGrid');
  const searchInput = document.getElementById('searchInput');

  // Preview Modal Elements
  const modalOverlay = document.createElement('div');
  modalOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);z-index:9999;display:none;align-items:center;justify-content:center;';
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = 'position:relative;width:90%;max-width:1100px;height:90vh;background:transparent;display:flex;flex-direction:column;animation:slideUp 0.3s ease;';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = 'position:absolute;top:-40px;right:0;background:transparent;border:none;color:#fff;font-size:24px;cursor:pointer;opacity:0.7;';
  closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
  closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';
  
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.5);';

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(iframe);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  const closePreview = () => {
    modalOverlay.style.display = 'none';
    iframe.src = '';
  };
  
  closeBtn.addEventListener('click', closePreview);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closePreview();
  });

  window.openPreview = (url) => {
    iframe.src = url;
    modalOverlay.style.display = 'flex';
  };

  let allPlugins = [];

  // Fetch plugins from the existing API
  fetch('/api/plugins')
    .then(res => res.json())
    .then(data => {
      allPlugins = data;
      renderPlugins(allPlugins);
    })
    .catch(err => {
      console.error('Error fetching plugins:', err);
      premiumGrid.innerHTML = '<p style="color: #ef4444;">데이터를 불러오는데 실패했습니다.</p>';
    });

  function renderPlugins(plugins) {
    premiumGrid.innerHTML = '';
    standardGrid.innerHTML = '';

    plugins.forEach(plugin => {
      // Determine if premium based on type or scriptUrl
      const isPremium = plugin.type === 'premium' || (plugin.scriptUrl && plugin.scriptUrl.includes('premium'));
      
      // Use ui-avatars to generate a gorgeous dynamic icon
      const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(plugin.name)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;
      
      // Ensure previewUrl is available. If not, fallback.
      const previewUrl = plugin.previewUrl || \`/plugins/\${isPremium ? 'premium/' : ''}\${plugin.id}-preview.html\`;

      const card = document.createElement('div');
      card.className = 'plugin-card';
      
      card.innerHTML = \`
        <div class="card-header">
          <div class="icon-wrapper">
            <img src="\${iconUrl}" alt="\${plugin.name} icon">
          </div>
          <div class="title-wrap">
            <h4>\${plugin.name}</h4>
            <span class="version">v\${plugin.version || '1.0.0'}</span>
          </div>
        </div>
        <p class="description">\${plugin.description}</p>
        <div class="card-footer" style="flex-wrap: wrap; gap: 8px;">
          <span class="type-tag">\${plugin.type}</span>
          <div style="display:flex; gap:8px; margin-left:auto;">
            <button class="install-btn" style="background:rgba(255,255,255,0.1); color:#fff;" onclick="window.openPreview('\${previewUrl}')">
              👁️ Preview
            </button>
            <button class="install-btn \${isPremium ? 'premium' : ''}" onclick="alert('\${plugin.name} 클라우드 스트리밍이 워크스테이션으로 시작됩니다!')">
              \${isPremium ? 'Activate' : 'Install'}
            </button>
          </div>
        </div>
      \`;

      if (isPremium) {
        premiumGrid.appendChild(card);
      } else {
        standardGrid.appendChild(card);
      }
    });

    if (premiumGrid.children.length === 0) premiumGrid.innerHTML = '<p class="text-muted">검색된 프리미엄 기능이 없습니다.</p>';
    if (standardGrid.children.length === 0) standardGrid.innerHTML = '<p class="text-muted">검색된 스탠다드 기능이 없습니다.</p>';
  }

  // Real-time search filtering
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allPlugins.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
    renderPlugins(filtered);
  });
});
