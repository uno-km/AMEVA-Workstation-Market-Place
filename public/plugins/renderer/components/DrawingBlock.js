"use strict";
/**
 * @file DrawingBlock.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/DrawingBlock.tsx
 * @role Core module helper and integration logic
 *
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/components/MarkdownEditor.tsx): BlockNote 커스텀 블록 스펙인 DrawingBlockSpec을 등록하여 소비.
 * - 소비처 B (src/renderer/editor/amevaBlockSchema.ts): 에디터 스키마 정의 내부에서 drawing 블록 타입 매핑을 위해 참조.
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 본 파일은 Excalidraw 라이브러리 및 경량 스케치패드(Canvas API) 폴백 뷰포트를 연동하여 블록 기반의 드로잉 필드를 지원한다.
 * - 0.5초 디바운스 저장을 처리하며, 컴포넌트 소멸(언마운트) 시점에 유실 없는 최후의 저장(Flush) 장치를 보증한다.
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST NOT: @excalidraw/excalidraw의 CSS 누락으로 인한 스타일 붕괴를 막기 위해 상단 index.css 임포트를 유지할 것.
 * - MUST: 보기 모드(!isEditing) 시 씌워지는 오버레이에 pointer-events: none을 선언하여 에디터 기본 포커스 전파를 훼방놓지 말 것.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingBlock = exports.DrawingBlockSpec = void 0;
const react_1 = __importStar(require("react"));
const react_2 = require("@blocknote/react");
const lucide_react_1 = require("lucide-react");
require("@excalidraw/excalidraw/index.css");
/*
 * [RUN-TIME STATE / INVARIANT]
 * - Excalidraw: 동적 import() 결과물을 캐싱하는 탑레벨 React 컴포넌트 참조 객체.
 * - excalidrawFailed: 로딩 시도 후 최종 실패(타임아웃 등) 시 세팅되는 글로벌 에러 플래그.
 * - isLoadingExcalidraw: 비동기 중복 요청 방지를 위한 로드 기동 락 변수.
 */
let Excalidraw = null;
let excalidrawFailed = false;
let isLoadingExcalidraw = false;
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `loadExcalidraw`
 * - 역할: 엑스칼리드로우 모듈을 비동기로 로드하며 10초 타임아웃 예외를 설정하여 electron 런타임 지연 시 복원을 시도한다.
 * - 예시: `loadExcalidraw(status => setStatus(status))` 호출로 동적 바인딩.
 */
const loadExcalidraw = (onStatusChange) => __awaiter(void 0, void 0, void 0, function* () {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `Excalidraw`
     * - 만족 시: 이미 로드가 성공한 상태이므로 즉시 성공 상태를 반환하고 탈출함.
     */
    if (Excalidraw) {
        onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange('loaded');
        return;
    }
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `isLoadingExcalidraw`
     * - 만족 시: 이미 다른 컴포넌트에서 비동기 로딩을 개시했으므로 중복 호출을 막고 무조건 리턴함.
     */
    if (isLoadingExcalidraw)
        return;
    isLoadingExcalidraw = true;
    excalidrawFailed = false;
    try {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - timeout: 10초 동안 로드가 지연될 때 에러를 강제 촉발하여 무한 펜딩 상태를 해결하는 탈출구 Promise.
         */
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Excalidraw 로딩 지연 (10초)')), 10000));
        const loaded = Promise.resolve().then(() => __importStar(require('@excalidraw/excalidraw'))).then(m => m.Excalidraw);
        Excalidraw = yield Promise.race([loaded, timeout]);
        excalidrawFailed = false;
        onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange('loaded');
    }
    catch (err) {
        console.warn('[DrawingBlock] Excalidraw 로드 실패 — Canvas 폴백 대기:', err);
        excalidrawFailed = true;
        onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange('failed');
    }
    finally {
        isLoadingExcalidraw = false;
    }
});
// CommonJS 환경 동기식 로드 선행 시도
try {
    const ex = require('@excalidraw/excalidraw');
    Excalidraw = ex.Excalidraw;
}
catch (_a) {
    // CommonJS require 에러 시 동적 비동기 로드 위임
    loadExcalidraw();
}
exports.DrawingBlockSpec = (0, react_2.createReactBlockSpec)({
    type: 'drawing',
    propSchema: {
        data: { default: '[]' }
    },
    content: 'none'
}, {
    render: ({ block, editor }) => {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - mounted: 클라이언트 DOM 마운트 완료 여부 플래그.
         * - isEditing: 캔버스를 수정 가능한 상태(Edit)와 읽기전용 프리뷰 상태(View)로 나눈 boolean.
         * - excalidrawState: 비동기 로딩을 리액티브하게 관제하는 상태값 ('loading' | 'loaded' | 'failed').
         * - useFallbackCanvas: 사용자가 명시적으로 실패를 인정하고 경량 캔버스로 진입하겠다고 누른 플래그.
         */
        const [mounted, setMounted] = (0, react_1.useState)(false);
        const [isEditing, setIsEditing] = (0, react_1.useState)(true);
        const [excalidrawState, setExcalidrawState] = (0, react_1.useState)(Excalidraw ? 'loaded' : (excalidrawFailed ? 'failed' : 'loading'));
        const [useFallbackCanvas, setUseFallbackCanvas] = (0, react_1.useState)(false);
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - saveTimeoutRef: 디바운스 저장을 관리하는 타이머 핸들.
         * - fallbackCanvasRef: Excalidraw 로드 실패 시 가동하는 Vanilla Canvas HTML element Ref.
         * - isDrawingRef: 경량 캔버스 모드 시 마우스 프레스 상태 플래그.
         * - lastPosRef: 드로잉 좌표 꼬리 추적용 오프셋 캐싱 객체.
         */
        const saveTimeoutRef = (0, react_1.useRef)(null);
        const fallbackCanvasRef = (0, react_1.useRef)(null);
        const isDrawingRef = (0, react_1.useRef)(false);
        const lastPosRef = (0, react_1.useRef)(null);
        // 마운트 시 로드 상태 폴링 및 비동기 콜백 리스너 바인딩
        (0, react_1.useEffect)(() => {
            setMounted(true);
            if (!Excalidraw && !excalidrawFailed) {
                loadExcalidraw((status) => {
                    setExcalidrawState(status);
                });
            }
        }, []);
        // 초기 직렬화 데이터 역파싱
        let initialElements = [];
        try {
            initialElements = JSON.parse(block.props.data || '[]');
        }
        catch (e) {
            console.error('Drawing data parse error:', e);
        }
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - latestElementsRef: 저장 디바운싱 중 발생하는 유실(언마운트 시)을 막기 위해 실시간 최신 캔버스 노드를 쥐고 있는 Ref 버퍼.
         * - lastSavedDataRef: 중복 쓰기 IO 낭비를 차단하기 위해 마지막 저장된 JSON 문자열 스냅샷을 쥐고 있는 Ref 버퍼.
         */
        const latestElementsRef = (0, react_1.useRef)(initialElements);
        const lastSavedDataRef = (0, react_1.useRef)(block.props.data || '[]');
        // [📝 데이터 유실 방지 (Debounce flush) 장치]
        // - 컴포넌트가 언마운트되거나 block.id가 바뀔 때, 아직 에디터로 발송되지 않고 대기 중인 타이머가 있다면 즉시 강제 플러시(flush)한다.
        (0, react_1.useEffect)(() => {
            return () => {
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                    const stringified = JSON.stringify(latestElementsRef.current);
                    if (stringified !== lastSavedDataRef.current) {
                        editor.updateBlock(block.id, {
                            type: 'drawing',
                            props: { data: stringified }
                        });
                    }
                }
            };
        }, [block.id]);
        /*
         * [FUNCTION CONTRACT]
         * - 함수 명: `handleCanvasChange`
         * - 역할: 드로잉 변화 이벤트를 포착하여 버퍼를 갱신하고, 500ms 디바운서로 에디터 블록 값을 업데이트한다.
         */
        const handleCanvasChange = (elements) => {
            latestElementsRef.current = elements;
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                const stringified = JSON.stringify(elements);
                if (stringified !== lastSavedDataRef.current) {
                    lastSavedDataRef.current = stringified;
                    editor.updateBlock(block.id, {
                        type: 'drawing',
                        props: { data: stringified }
                    });
                }
            }, 500);
        };
        /*
         * [FUNCTION CONTRACT]
         * - 함수 명: `handleRetryLoad`
         * - 역할: 지연된 엑스칼리드로우 모듈 로딩을 다시 호출하고 상태를 초기화한다.
         */
        const handleRetryLoad = () => {
            setExcalidrawState('loading');
            loadExcalidraw((status) => {
                setExcalidrawState(status);
            });
        };
        // 미마운트 시 임시 스케줄러 렌더
        if (!mounted) {
            return (react_1.default.createElement("div", { style: {
                    height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#16161a', border: '1px dashed #2e2e38', borderRadius: '8px',
                    color: 'var(--text-muted)', fontSize: '12px'
                } }, "\uB4DC\uB85C\uC789 \uBAA8\uB4C8\uC744 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4..."));
        }
        // [Excalidraw 로딩 뷰포트]
        if (excalidrawState === 'loading' && !useFallbackCanvas) {
            return (react_1.default.createElement("div", { style: {
                    height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#16161a', border: '1px dashed #2e2e38', borderRadius: '8px',
                    color: 'var(--text-muted)', fontSize: '12.5px', gap: '12px'
                } },
                react_1.default.createElement("div", { style: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' } }),
                react_1.default.createElement("span", null, "Excalidraw \uC5D4\uC9C4\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...")));
        }
        // [Excalidraw 로딩 실패 뷰포트 - 재시도 & 경량 전환 제안]
        if ((excalidrawState === 'failed' || !Excalidraw) && !useFallbackCanvas) {
            return (react_1.default.createElement("div", { style: {
                    height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#1c1c22', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '8px',
                    color: 'var(--text-main)', fontSize: '12px', gap: '14px', padding: '20px', textAlign: 'center'
                } },
                react_1.default.createElement("span", { style: { fontWeight: 700, color: '#fca5a5', fontSize: '13px' } }, "\u26A0\uFE0F \uB4DC\uB85C\uC789 \uBAA8\uB4C8 \uB85C\uB529 \uC9C0\uC5F0 \uB610\uB294 \uC2E4\uD328"),
                react_1.default.createElement("span", { style: { fontSize: '11px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: '1.4' } }, "\uD658\uACBD\uC5D0 \uB530\uB77C \uC5D1\uC2A4\uCE7C\uB9AC\uB4DC\uB85C\uC6B0(Excalidraw) \uD328\uD0A4\uC9C0 \uB85C\uB4DC\uAC00 \uC9C0\uC5F0\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uB85C\uB4DC\uD558\uAC70\uB098 \uC624\uD504\uB77C\uC778 \uACBD\uB7C9 \uBAA8\uB4DC\uB85C \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                react_1.default.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '6px' } },
                    react_1.default.createElement("button", { onClick: handleRetryLoad, style: {
                            padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                            color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px',
                            transition: 'background 0.2s'
                        }, onMouseEnter: e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)', onMouseLeave: e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)' },
                        react_1.default.createElement(lucide_react_1.RefreshCw, { size: 12 }),
                        " \uB2E4\uC2DC \uC2DC\uB3C4"),
                    react_1.default.createElement("button", { onClick: () => setUseFallbackCanvas(true), style: {
                            padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-main)', fontSize: '11px', transition: 'background 0.2s'
                        }, onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)', onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }, "\uACBD\uB7C9 \uC2A4\uCF00\uCE58\uD328\uB4DC\uB85C \uADF8\uB9AC\uAE30"))));
        }
        // [경량 캔버스 폴백 뷰포트]
        if (useFallbackCanvas || excalidrawState === 'failed' || !Excalidraw) {
            return (react_1.default.createElement("div", { className: "bn-block-content-wrapper", style: {
                    width: '100%', backgroundColor: '#18181c', border: '1px solid #2e2e38',
                    borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '10px'
                } },
                react_1.default.createElement("div", { style: { padding: '8px 12px', borderBottom: '1px solid #2e2e38', display: 'flex', alignItems: 'center', gap: '6px', background: '#121215' } },
                    react_1.default.createElement(lucide_react_1.FileImage, { size: 14, style: { color: 'var(--primary)' } }),
                    react_1.default.createElement("span", { style: { fontSize: '11px', fontWeight: 'bold', color: '#f8fafc' } }, "Drawing Pad (\uACBD\uB7C9 \uD3F4\uBC31 \uBAA8\uB4DC)"),
                    excalidrawState !== 'failed' && (react_1.default.createElement("button", { onClick: () => setUseFallbackCanvas(false), style: { marginLeft: '12px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' } },
                        react_1.default.createElement(lucide_react_1.RefreshCw, { size: 10 }),
                        " \uC6D0\uB798 \uBAA8\uB4C8\uB85C \uBCF5\uADC0")),
                    react_1.default.createElement("span", { style: { fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' } }, "\uB9C8\uC6B0\uC2A4\uB85C \uC790\uC720\uB86D\uAC8C \uADF8\uB9AC\uC138\uC694")),
                react_1.default.createElement("canvas", { ref: fallbackCanvasRef, width: 800, height: 380, style: { width: '100%', height: '380px', background: '#1e1e24', cursor: 'crosshair', display: 'block' }, onMouseDown: (e) => {
                        isDrawingRef.current = true;
                        const rect = e.currentTarget.getBoundingClientRect();
                        lastPosRef.current = { x: (e.clientX - rect.left) * (e.currentTarget.width / rect.width), y: (e.clientY - rect.top) * (e.currentTarget.height / rect.height) };
                    }, onMouseMove: (e) => {
                        if (!isDrawingRef.current || !lastPosRef.current)
                            return;
                        const canvas = fallbackCanvasRef.current;
                        if (!canvas)
                            return;
                        const ctx = canvas.getContext('2d');
                        if (!ctx)
                            return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                        ctx.strokeStyle = '#a78bfa';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        lastPosRef.current = { x, y };
                    }, onMouseUp: () => { isDrawingRef.current = false; lastPosRef.current = null; }, onMouseLeave: () => { isDrawingRef.current = false; lastPosRef.current = null; } })));
        }
        // [정상 Excalidraw 렌더링 뷰포트]
        return (react_1.default.createElement("div", { className: "bn-block-content-wrapper", style: {
                width: '100%',
                backgroundColor: '#18181c',
                border: '1px solid #2e2e38',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '10px'
            } },
            react_1.default.createElement("div", { style: {
                    padding: '8px 12px',
                    borderBottom: '1px solid #2e2e38',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#121215'
                } },
                react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    react_1.default.createElement(lucide_react_1.FileImage, { size: 14, style: { color: 'var(--primary)' } }),
                    react_1.default.createElement("span", { style: { fontSize: '11px', fontWeight: 'bold', color: '#f8fafc' } }, "Drawing Canvas")),
                react_1.default.createElement("button", { onClick: () => setIsEditing(!isEditing), style: {
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(139,92,246,0.1)',
                        transition: 'background 0.15s'
                    }, onMouseEnter: e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.2)', onMouseLeave: e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.1)' }, isEditing ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(lucide_react_1.Check, { size: 11 }),
                    "Done Sketching")) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(lucide_react_1.Edit2, { size: 11 }),
                    "Edit Sketch")))),
            react_1.default.createElement("div", { style: { height: '380px', width: '100%', position: 'relative', overflow: 'hidden' } }, isEditing ? (react_1.default.createElement(Excalidraw, { initialData: {
                    elements: initialElements,
                    appState: { viewBackgroundColor: '#1e1e24', theme: 'dark' }
                }, onChange: handleCanvasChange })) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(Excalidraw, { initialData: {
                        elements: initialElements,
                        appState: { viewBackgroundColor: '#1e1e24', theme: 'dark' }
                    }, viewModeEnabled: true }),
                react_1.default.createElement("div", { style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 5,
                        cursor: 'default',
                        pointerEvents: 'none'
                    } }))))));
    }
});
exports.DrawingBlock = (0, exports.DrawingBlockSpec)();
