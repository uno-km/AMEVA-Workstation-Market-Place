(function () {
  window.AMEVA_PLUGINS = window.AMEVA_PLUGINS || {};
  window.AMEVA_PLUGINS["drawing-board"] = {
    name: "Drawing Board",
    description: "문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.",
    render: function (containerId) {
      console.log("[AMEVA Plugin] Drawing Board extension registered successfully.");
    }
  };
})();
