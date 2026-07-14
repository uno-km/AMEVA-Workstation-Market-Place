document.addEventListener('DOMContentLoaded', () => {
  const premiumGrid = document.getElementById('premiumGrid');
  const standardGrid = document.getElementById('standardGrid');
  const searchInput = document.getElementById('searchInput');

  // Preview Sidebar Elements
  const previewSidebar = document.getElementById('previewSidebar');
  const previewIframe = document.getElementById('previewIframe');
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');
  const previewInstallBtn = document.getElementById('previewInstallBtn');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  
  // Resizer Elements
  const resizer = document.getElementById('dragMe');
  const leftPane = document.querySelector('.plugin-list');
  const rightPane = previewSidebar;
  
  // Toggle Sidebar Logic
  let isSidebarOpen = false;
  
  // Initialize collapsed state
  previewSidebar.classList.add('sidebar-collapsed');
  toggleSidebarBtn.textContent = '◀';
  resizer.style.display = 'none';

  toggleSidebarBtn.addEventListener('click', () => {
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      previewSidebar.classList.remove('sidebar-collapsed');
      toggleSidebarBtn.textContent = '▶';
      resizer.style.display = 'block';
    } else {
      previewSidebar.classList.add('sidebar-collapsed');
      toggleSidebarBtn.textContent = '◀';
      resizer.style.display = 'none';
    }
  });

  // Resizer Logic
  let isDragging = false;

  resizer.addEventListener('mousedown', function(e) {
    if(!isSidebarOpen) return; // Don't resize if collapsed
    isDragging = true;
    resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    // Prevent iframe from intercepting mouse events during drag
    previewIframe.style.pointerEvents = 'none';
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // Calculate new flex basis
    const containerWidth = document.getElementById('layoutContainer').offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    // Restrict dragging boundaries (20% to 80%)
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      leftPane.style.flex = `1 1 ${newLeftWidth}%`;
      rightPane.style.flex = `1 1 ${100 - newLeftWidth}%`;
    }
  });

  document.addEventListener('mouseup', function(e) {
    if (isDragging) {
      isDragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      previewIframe.style.pointerEvents = 'auto';
    }
  });

  window.openPreview = (url, name, description, isPremium) => {
    if (!isSidebarOpen) {
      isSidebarOpen = true;
      previewSidebar.classList.remove('sidebar-collapsed');
      toggleSidebarBtn.textContent = '▶';
      resizer.style.display = 'block';
    }
    previewIframe.src = url;
    previewTitle.textContent = name;
    previewDesc.textContent = description;
    
    // Update active style on cards
    document.querySelectorAll('.plugin-card').forEach(c => c.classList.remove('active'));
    // We can't easily find the exact card here without passing ID, so we'll do it inside renderPlugins
    
    previewInstallBtn.className = `install-btn ${isPremium ? 'premium' : ''}`;
    previewInstallBtn.textContent = isPremium ? 'Activate' : 'Install';
    previewInstallBtn.onclick = () => alert(`${name} 클라우드 스트리밍이 워크스테이션으로 시작됩니다!`);
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
      const isPremium = plugin.type === 'premium' || (plugin.scriptUrl && plugin.scriptUrl.includes('premium'));
      const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(plugin.name)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;
      const previewUrl = plugin.previewUrl || `/plugins/${isPremium ? 'premium/' : ''}${plugin.id}-preview.html`;

      const card = document.createElement('div');
      card.className = 'plugin-card';
      // Store ID to help with active state if needed
      card.dataset.id = plugin.id;
      
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
        <div class="card-footer" style="flex-wrap: wrap; gap: 8px;">
          <span class="type-tag">${plugin.type}</span>
        </div>
      `;

      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        document.querySelectorAll('.plugin-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        window.openPreview(previewUrl, plugin.name, plugin.description, isPremium);
      });

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
