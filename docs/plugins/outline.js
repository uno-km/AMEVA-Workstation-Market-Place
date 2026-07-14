(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS.outline = {
    name: "Outline",
    description: "문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.",
    render: function (containerId) {
      console.log("[AMEVA Plugin] Outline extension registered successfully.");
    }
  };
})();
