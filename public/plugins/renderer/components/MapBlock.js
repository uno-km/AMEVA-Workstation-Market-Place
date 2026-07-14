"use strict";
/**
 * @file MapBlock.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/MapBlock.tsx
 * @role Core module helper and integration logic
 *
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/AppLayout.tsx): 레이아웃 그리드 내부 또는 플로팅 레이어 영역 내에서 그리기로 소비.
 * - 소비처 B (src/renderer/App.tsx): 전역 모달 매니저 및 뷰포트 상태 스위칭에 따라 동적 마운트되어 소비.
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 본 파일은 AMEVA 시스템 내에서 도메인 목적에 부합하는 연산 및 데이터 처리 흐름을 안전하게 캡슐화한다.
 * - 외부 라이브러리 및 하위 종속성을 조율하고 결과 규격을 일관되게 제공한다.
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 모든 예외 발생 시 에러를 침묵시키지 말고 에러 로그를 명확하게 남길 것.
 * - MUST NOT: TypeScript any 형식을 우회 수단으로 함부로 선언하지 말 것.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapBlock = exports.MapBlockSpec = void 0;
const react_1 = require("@blocknote/react");
const lucide_react_1 = require("lucide-react");
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `MapBlockSpec`
 * - 역할: 유입 인자를 가공하고 비즈니스 계약 조건에 맞춰 최종 객체/바이너리를 생산함.
 * - 예시: `MapBlockSpec(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
exports.MapBlockSpec = (0, react_1.createReactBlockSpec)({
    type: 'map',
    propSchema: {
        lat: { default: '37.5665' },
        lng: { default: '126.9780' },
        zoom: { default: '14' },
        locationName: { default: '서울 특별시' },
        destination: { default: '' },
        destLat: { default: '' },
        destLng: { default: '' },
        legend: { default: '' },
        memo: { default: '' },
        routeType: { default: 'none' }, // 'none' | 'car' | 'bicycle' | 'foot'
        routingEngine: { default: 'osrm' } // 'osrm' | 'graphhopper' | 'valhalla'
    },
    content: 'none'
}, {
    render: ({ block, editor }) => {
        const { lat, lng, destLat, destLng, zoom, locationName, destination, legend, memo, routeType, routingEngine } = block.props;
        // 메모 실시간 갱신 핸들러 (입력 완료 시점에 editor.updateBlock 호출하여 문서에 영구 보존)
        const handleMemoBlur = (newMemo) => {
            if (editor) {
                editor.updateBlock(block, {
                    props: Object.assign(Object.assign({}, block.props), { memo: newMemo })
                });
            }
        };
        // 줌 슬라이더 조절 핸들러
        const handleZoomChange = (newZoom) => {
            if (editor) {
                editor.updateBlock(block, {
                    props: Object.assign(Object.assign({}, block.props), { zoom: String(newZoom) })
                });
            }
        };
        const isEditable = editor.isEditable;
        return (React.createElement("div", { className: "bn-block-content-wrapper", style: {
                width: '100%',
                backgroundColor: '#18181c',
                border: '1px solid var(--border-muted)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            } },
            React.createElement("div", { style: {
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: '#121215'
                } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                        React.createElement(lucide_react_1.MapPin, { size: 14, style: { color: '#10b981' } }),
                        destination ? (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: '#f8fafc' } },
                            React.createElement("span", { style: { color: '#38bdf8' } }, "[\uCD9C\uBC1C]"),
                            " ",
                            locationName,
                            React.createElement("span", { style: { color: 'var(--text-muted)', fontWeight: 'normal' } }, "\u2794"),
                            React.createElement("span", { style: { color: '#facc15' } }, "[\uB3C4\uCC29]"),
                            " ",
                            destination)) : (React.createElement("span", { style: { fontSize: '11.5px', fontWeight: 'bold', color: '#f8fafc' } }, locationName)),
                        React.createElement("span", { style: { fontSize: '9px', color: 'var(--text-muted)' } },
                            "(",
                            lat,
                            ", ",
                            lng,
                            ")")),
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                        React.createElement("span", { style: { fontSize: '9.5px', color: 'var(--text-muted)' } },
                            "\uD655\uB300: ",
                            zoom,
                            "x"),
                        isEditable && (React.createElement("input", { type: "range", min: "10", max: "18", value: zoom, onChange: e => handleZoomChange(parseInt(e.target.value, 10)), style: { width: '50px', height: '3px', accentColor: '#10b981', cursor: 'pointer' } })))),
                legend && (React.createElement("div", { style: {
                        marginTop: '4px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'rgba(56,189,248,0.08)',
                        border: '1px solid rgba(56,189,248,0.2)',
                        fontSize: '10px',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    } },
                    React.createElement("span", null, "\u2139\uFE0F"),
                    React.createElement("span", { style: { fontWeight: 'bold' } }, "\uBC94\uB840/\uACBD\uB85C \uC815\uBCF4:"),
                    React.createElement("span", null, legend)))),
            React.createElement("div", { style: {
                    position: 'relative',
                    width: '100%',
                    height: '480px',
                    backgroundColor: '#000',
                    overflow: 'hidden'
                } },
                React.createElement("webview", { src: (() => {
                        const latNum = parseFloat(lat);
                        const lngNum = parseFloat(lng);
                        const destLatNum = destLat ? parseFloat(destLat) : null;
                        const destLngNum = destLng ? parseFloat(destLng) : null;
                        if (destLatNum !== null && destLngNum !== null && !isNaN(destLatNum) && !isNaN(destLngNum)) {
                            let engineParam = 'fossgis_osrm_car';
                            if (routingEngine === 'osrm') {
                                engineParam = routeType === 'car' ? 'fossgis_osrm_car' : routeType === 'bicycle' ? 'fossgis_osrm_bike' : 'fossgis_osrm_foot';
                            }
                            else if (routingEngine === 'graphhopper') {
                                engineParam = routeType === 'car' ? 'graphhopper_car' : routeType === 'bicycle' ? 'graphhopper_bicycle' : 'graphhopper_foot';
                            }
                            else if (routingEngine === 'valhalla') {
                                engineParam = routeType === 'car' ? 'valhalla_car' : routeType === 'bicycle' ? 'valhalla_bicycle' : 'valhalla_foot';
                            }
                            return 'https://www.openstreetmap.org/directions?engine=' + engineParam + '&route=' + lat + ',' + lng + ';' + destLat + ',' + destLng;
                        }
                        else {
                            const z = parseInt(zoom, 10) || 14;
                            const delta = Math.max(0.001, 0.5 / Math.pow(2, z - 10));
                            const bbox = `${lngNum - delta},${latNum - delta},${lngNum + delta},${latNum + delta}`;
                            return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lngNum}`;
                        }
                    })(), style: {
                        position: 'absolute',
                        top: '-50px',
                        left: 0,
                        width: '100%',
                        height: 'calc(100% + 50px)',
                        border: 0,
                        filter: 'invert(0.9) hue-rotate(180deg)'
                    }, title: `지도: ${locationName}` })),
            React.createElement("div", { style: {
                    padding: '10px 14px',
                    borderTop: '1px solid var(--border-muted)',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement("span", { style: { fontSize: '10.5px', fontWeight: 'bold', color: 'var(--text-main)' } }, "\uD83D\uDCDD \uC0AC\uC6A9\uC790 \uBA54\uBAA8"),
                    React.createElement("span", { style: { fontSize: '8.5px', color: 'var(--text-muted)' } }, "(\uC785\uB825 \uD6C4 \uB2E4\uB978 \uACF3\uC744 \uD074\uB9AD\uD558\uBA74 \uBCF8\uBB38\uC5D0 \uC601\uAD6C \uC800\uC7A5\uB429\uB2C8\uB2E4)")),
                isEditable ? (React.createElement("textarea", { defaultValue: memo, onBlur: e => handleMemoBlur(e.target.value), placeholder: "\uC5EC\uAE30\uC5D0 \uC774 \uC7A5\uC18C\uC5D0 \uAD00\uD55C \uC911\uC694\uD55C \uBA54\uBAA8, \uACBD\uB85C \uC124\uBA85 \uB4F1\uC744 \uB0A8\uAE30\uC138\uC694...", style: {
                        width: '100%',
                        minHeight: '45px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)',
                        fontSize: '11px',
                        lineHeight: '1.4',
                        resize: 'vertical',
                        outline: 'none'
                    } })) : memo ? (React.createElement("div", { style: {
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        color: 'var(--text-main)',
                        fontSize: '11px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'left'
                    } }, memo)) : (React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'left' } }, "\uB0A8\uACA8\uC9C4 \uBA54\uBAA8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")))));
    }
});
exports.MapBlock = (0, exports.MapBlockSpec)();
