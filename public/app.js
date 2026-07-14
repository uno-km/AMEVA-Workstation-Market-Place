document.addEventListener('DOMContentLoaded', () => {
  const premiumGrid = document.getElementById('premiumGrid');
  const standardGrid = document.getElementById('standardGrid');
  const searchInput = document.getElementById('searchInput');

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
      
      const card = document.createElement('div');
      card.className = 'plugin-card';
      
      card.innerHTML = `
        <div class="card-header">
          <div class="icon-wrapper">
            <img src="${iconUrl}" alt="${plugin.name} icon">
          </div>
          <div class="title-wrap">
            <h4>${plugin.name}</h4>
            <span class="version">v${plugin.version || '1.0.0'}</span>
          </div>
        </div>
        <p class="description">${plugin.description}</p>
        <div class="card-footer">
          <span class="type-tag">${plugin.type}</span>
          <button class="install-btn ${isPremium ? 'premium' : ''}" onclick="alert('${plugin.name} 클라우드 스트리밍이 워크스테이션으로 시작됩니다!')">
            ${isPremium ? 'Activate Premium' : 'Install Free'}
          </button>
        </div>
      `;

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
