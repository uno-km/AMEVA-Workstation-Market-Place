(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.minimap = {
    name: "Minimap",
    description: "에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.",
    render: function (containerId) {
      // 기능해금형이므로 뷰 도킹 불필요
      console.log("[AMEVA Plugin] Minimap extension registered successfully.");
    }
  };
})();
