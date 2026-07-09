(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS["google-maps"] = {
    name: "Google Maps",
    description: "장소 검색 및 지도 탐색이 가능한 구글 지도 내장 뷰어 도구입니다.",
    render: function (containerId) {
      // 본 기능은 AIPluginViews.tsx 내에서 직접 탭 렌더링되므로, 등록 신호만 반환합니다.
      console.log("[AMEVA Plugin] Google Maps extension registered successfully.");
    }
  };
})();
