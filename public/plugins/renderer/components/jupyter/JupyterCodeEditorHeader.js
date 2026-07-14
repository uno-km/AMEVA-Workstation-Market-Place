"use strict";
/**
 * @file JupyterCodeEditorHeader.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/jupyter/JupyterCodeEditorHeader.tsx
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
exports.JupyterCodeEditorHeader = JupyterCodeEditorHeader;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const useCodeRuntime_1 = require("../../hooks/useCodeRuntime");
const langMeta_1 = require("./langMeta");
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `JupyterCodeEditorHeader`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `JupyterCodeEditorHeader(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function JupyterCodeEditorHeader({ code, language, blockId, editor, onRunStart, onRunSuccess, onRunFailure, isInputCollapsed = false, onToggleInputCollapse, }) {
    const { isRunning, runJSCode, runPythonCode, runSQLCode } = (0, useCodeRuntime_1.useCodeRuntime)();
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `meta`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const meta = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const meta = (0, langMeta_1.getLangMeta)(language);
    const [copied, setCopied] = (0, react_1.useState)(false);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleRun`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleRun = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleRun = () => __awaiter(this, void 0, void 0, function* () {
        onRunStart();
        try {
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `language === 'html'`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (language === 'html')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (language === 'html') {
                onRunSuccess(true, ['렌더링 완료']);
                return;
            }
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `result`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const result = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const result = (language === 'python' || language === 'py')
                ? yield runPythonCode(code)
                : (language === 'sql')
                    ? yield runSQLCode(code)
                    : yield runJSCode(code);
            onRunSuccess(result.success, (result.output || '').split('\n'), result.tableData);
        }
        catch (err) {
            onRunFailure(err.message || '알 수 없는 에러');
        }
    });
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleCopy`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleCopy = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleCopy = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch (_a) { }
    });
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `accentColor`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const accentColor = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const accentColor = meta.color;
    return (React.createElement("div", { className: "jupyter-cell-header editor-cell-header", style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            height: '100%',
            background: '#161821',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            userSelect: 'none',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        } },
        onToggleInputCollapse && (React.createElement("button", { onClick: onToggleInputCollapse, title: isInputCollapsed ? '코드 영역 펼치기' : '코드 영역 접기', style: {
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '2px',
                marginRight: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
            } },
            React.createElement(lucide_react_1.ChevronDown, { size: 14, style: {
                    transform: isInputCollapsed ? 'rotate(-90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                } }))),
        React.createElement("div", { style: {
                fontSize: '11px',
                fontWeight: 700,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",monospace',
            } },
            React.createElement("span", { style: {
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    display: 'inline-block'
                } }),
            React.createElement("select", { value: language, onChange: (e) => {
                    var _a;
                    /*
                     * [RUN-TIME STATE / INVARIANT]
                     * - 변수 명: `val`
                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                     * - 예시 코드: `const val = ...` 형태로 안전 캐싱 후 가공 기동.
                     */
                    const val = e.target.value;
                    editor.updateBlock(blockId, {
                        type: 'jupyter',
                        props: Object.assign(Object.assign({}, (_a = editor.getBlock(blockId)) === null || _a === void 0 ? void 0 : _a.props), { language: val, runState: JSON.stringify({ hasRun: false, success: null, outputLines: [] }) })
                    });
                }, style: {
                    background: 'transparent',
                    color: accentColor,
                    border: 'none',
                    outline: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    fontFamily: '"JetBrains Mono","Fira Code",monospace',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.background = 'transparent';
                } },
                React.createElement("option", { value: "javascript", style: { background: '#12131a', color: '#f59e0b' } }, "Javascript"),
                React.createElement("option", { value: "python", style: { background: '#12131a', color: '#3b82f6' } }, "Python"),
                React.createElement("option", { value: "sql", style: { background: '#12131a', color: '#06b6d4' } }, "SQL (SQLite)"),
                React.createElement("option", { value: "html", style: { background: '#12131a', color: '#14b8a6' } }, "HTML Sandbox"),
                React.createElement("option", { value: "mermaid", style: { background: '#12131a', color: '#8b5cf6' } }, "Mermaid"),
                React.createElement("option", { value: "plaintext", style: { background: '#12131a', color: '#6b7280' } }, "Plaintext"),
                React.createElement("option", { value: "text", style: { background: '#12131a', color: '#6b7280' } }, "Text"),
                React.createElement("option", { value: "json", style: { background: '#12131a', color: '#10b981' } }, "JSON"),
                React.createElement("option", { value: "bash", style: { background: '#12131a', color: '#ec4899' } }, "Bash"))),
        React.createElement("div", { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' } },
            meta.runnable && (React.createElement("button", { onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRun();
                }, disabled: isRunning, style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isRunning ? 'rgba(255, 255, 255, 0.1)' : accentColor,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    boxShadow: isRunning ? 'none' : `0 2px 8px ${accentColor}40`,
                    transition: 'all 0.15s ease',
                } },
                React.createElement(lucide_react_1.Play, { size: 10, fill: "#fff" }),
                "Run")),
            React.createElement("button", { onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopy();
                }, title: "\uCF54\uB4DC \uBCF5\uC0AC", style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: copied ? '#10b981' : '#e5e7eb',
                    transition: 'all 0.15s ease',
                } },
                React.createElement(lucide_react_1.Copy, { size: 11 }),
                copied ? 'Copied' : 'Copy'))));
}
