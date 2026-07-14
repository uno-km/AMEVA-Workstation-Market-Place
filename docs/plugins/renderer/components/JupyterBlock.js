"use strict";
/**
 * @file JupyterBlock.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/JupyterBlock.tsx
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
exports.JupyterBlock = void 0;
const react_1 = __importStar(require("react"));
const react_2 = require("@blocknote/react");
const JupyterCodeEditor_1 = require("./JupyterCodeEditor");
const useCodeRuntime_1 = require("../hooks/useCodeRuntime");
// ─── 0. 자동완성용 정적 키워드 사전 ───────────────────────────
const KEYWORDS = {
    javascript: ['console', 'const', 'let', 'function', 'return', 'import', 'export', 'await', 'async', 'document', 'window', 'Promise', 'setTimeout', 'setInterval', 'querySelector', 'addEventListener', 'stringify', 'parse', 'forEach', 'map', 'filter', 'reduce'],
    python: ['print', 'def', 'import', 'return', 'class', 'self', 'lambda', 'yield', 'try', 'except', 'finally', 'global', 'numpy', 'pandas', 'matplotlib', 'range', 'len', 'append', 'dict', 'list', 'split', 'join'],
    sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'COUNT', 'SUM'],
    html: ['div', 'span', 'class', 'id', 'style', 'script', 'href', 'iframe', 'button', 'canvas', 'input', 'head', 'body', 'section', 'header', 'footer', 'meta', 'link', 'title'],
    bash: ['echo', 'cd', 'ls', 'pwd', 'mkdir', 'rm', 'git', 'npm', 'node', 'python', 'pip', 'grep', 'cat', 'install', 'run', 'build', 'sudo', 'chmod', 'clear'],
    cmd: ['echo', 'cd', 'dir', 'mkdir', 'del', 'rmdir', 'copy', 'move', 'cls', 'path', 'taskkill', 'tasklist', 'netstat', 'ipconfig']
};
// 본문 문서 내 최근 단어 토크나이저 (최소 2글자 이상으로 완화하여 짧은 변수도 파싱)
function getDocWords(text) {
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `matches`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const matches = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const matches = text.match(/\b[a-zA-Z_]\w{1,25}\b/g);
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!matches`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!matches)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!matches)
        return [];
    return Array.from(new Set(matches));
}
// 1. 커스텀 Jupyter React 블록 정의
const JupyterBlockSpec = (0, react_2.createReactBlockSpec)({
    type: 'jupyter',
    propSchema: {
        language: { default: 'javascript' },
        code: { default: '' },
        runState: { default: '{"hasRun":false,"success":null,"outputLines":[]}' }
    },
    content: 'none'
}, {
    render: ({ block, editor }) => {
        try {
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `code`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const code = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const code = block.props.code || '';
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `language`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const language = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const language = block.props.language || 'javascript';
            const { runJSCode, runPythonCode, runSQLCode } = (0, useCodeRuntime_1.useCodeRuntime)();
            const [isInputCollapsed, setIsInputCollapsed] = (0, react_1.useState)(false);
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `textareaRef`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const textareaRef = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const textareaRef = (0, react_1.useRef)(null);
            const [cursorPos, setCursorPos] = (0, react_1.useState)(0);
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `mirrorRef`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const mirrorRef = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const mirrorRef = (0, react_1.useRef)(null);
            // 로컬 입력 버퍼 캐시 (랙 방지)
            const [localCode, setLocalCode] = (0, react_1.useState)(code);
            // 부모의 code prop이 변경되면 로컬 캐시 동기화 (단, 포커스 중이 아닐 때만)
            (0, react_1.useEffect)(() => {
                /*
                 * [ALGORITHM BRANCH / DECISION]
                 * - 조건 식: `document.activeElement !== textareaRef.current`
                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                 * - 예시: `if (document.activeElement !== textareaRef.current)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                 */
                if (document.activeElement !== textareaRef.current) {
                    setLocalCode(code);
                }
            }, [code]);
            // 텍스트 스크롤 동기화 핸들러
            const handleScroll = (e) => {
                /*
                 * [ALGORITHM BRANCH / DECISION]
                 * - 조건 식: `mirrorRef.current`
                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                 * - 예시: `if (mirrorRef.current)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                 */
                if (mirrorRef.current) {
                    mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
                }
            };
            // 제안 단어 실시간 계산 (로컬 캐시 기준)
            let suggestion = '';
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `beforeCursor`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const beforeCursor = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const beforeCursor = localCode.substring(0, cursorPos);
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `prefixMatch`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const prefixMatch = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const prefixMatch = beforeCursor.match(/([a-zA-Z_]\w*)$/);
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `prefix`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const prefix = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const prefix = prefixMatch ? prefixMatch[1] : '';
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `prefix.length >= 1`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (prefix.length >= 1)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (prefix.length >= 1) {
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `langKeywords`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const langKeywords = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const langKeywords = KEYWORDS[language] || [];
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `docWords`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const docWords = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const docWords = getDocWords(localCode);
                // 0순위로 본문 로컬 변수명(docWords)을 매핑! 그 뒤에 정적 키워드 결합!
                const allCandidates = Array.from(new Set([...docWords, ...langKeywords]));
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `match`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const match = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const match = allCandidates.find(w => w.toLowerCase().startsWith(prefix.toLowerCase()) && w.toLowerCase() !== prefix.toLowerCase());
                /*
                 * [ALGORITHM BRANCH / DECISION]
                 * - 조건 식: `match`
                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                 * - 예시: `if (match)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                 */
                if (match) {
                    suggestion = match.substring(prefix.length);
                }
            }
            let parsedRunState = { hasRun: false, success: null, outputLines: [] };
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `block.props.runState`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (block.props.runState)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (block.props.runState) {
                try {
                    parsedRunState = JSON.parse(block.props.runState);
                }
                catch (e) {
                    console.error('runState 파싱 에러:', e);
                }
            }
            // 블록 props 변경 유틸 (로컬과 부모 상태 둘 다 갱신)
            const updateCode = (newCode) => {
                setLocalCode(newCode);
                editor.updateBlock(block.id, {
                    type: 'jupyter',
                    props: Object.assign(Object.assign({}, block.props), { code: newCode })
                });
            };
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `updateRunState`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const updateRunState = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const updateRunState = (newRunState) => {
                editor.updateBlock(block.id, {
                    type: 'jupyter',
                    props: Object.assign(Object.assign({}, block.props), { runState: JSON.stringify(newRunState) })
                });
            };
            // Ctrl+Enter 실행 로직
            const handleCtrlEnterRun = () => __awaiter(void 0, void 0, void 0, function* () {
                updateRunState({
                    hasRun: true,
                    success: null,
                    outputLines: [{ type: 'info', text: '▶ 실행 중...' }]
                });
                try {
                    /*
                     * [ALGORITHM BRANCH / DECISION]
                     * - 조건 식: `language === 'html'`
                     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                     * - 예시: `if (language === 'html')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                     */
                    if (language === 'html') {
                        updateRunState({
                            hasRun: true,
                            success: true,
                            outputLines: [{ type: 'info', text: '렌더링 완료' }]
                        });
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
                    updateRunState({
                        hasRun: true,
                        success: result.success,
                        outputLines: (result.output || '').split('\n').map(text => ({
                            type: result.success ? 'stdout' : 'stderr',
                            text
                        })),
                        tableData: result.tableData
                    });
                }
                catch (err) {
                    updateRunState({
                        hasRun: true,
                        success: false,
                        outputLines: [{ type: 'stderr', text: err.message || '알 수 없는 에러' }]
                    });
                }
            });
            // 갓 생성된 빈 코드블록인 경우 인풋 textarea에 자동 포커스
            (0, react_1.useEffect)(() => {
                /*
                 * [ALGORITHM BRANCH / DECISION]
                 * - 조건 식: `textareaRef.current && code === ''`
                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                 * - 예시: `if (textareaRef.current && code === '')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                 */
                if (textareaRef.current && code === '') {
                    /*
                     * [RUN-TIME STATE / INVARIANT]
                     * - 변수 명: `timer`
                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                     * - 예시 코드: `const timer = ...` 형태로 안전 캐싱 후 가공 기동.
                     */
                    const timer = setTimeout(() => {
                        var _a;
                        (_a = textareaRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    }, 60);
                    return () => clearTimeout(timer);
                }
            }, [block.id]);
            return (react_1.default.createElement(react_2.BlockContentWrapper, { blockType: "jupyter", blockProps: block.props, propSchema: {
                    language: { default: 'javascript' },
                    code: { default: '' },
                    runState: { default: '{"hasRun":false,"success":null,"outputLines":[]}' }
                } },
                react_1.default.createElement("div", { className: "custom-jupyter-card", style: {
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#12131a',
                        border: '1.5px solid rgba(139, 92, 246, 0.25)',
                        borderRadius: '10px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden',
                        margin: '14px 0',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",monospace',
                    } },
                    react_1.default.createElement("div", { style: { height: '36px', width: '100%' } },
                        react_1.default.createElement(JupyterCodeEditor_1.JupyterCodeEditorHeader, { code: code, language: language, blockId: block.id, editor: editor, isInputCollapsed: isInputCollapsed, onToggleInputCollapse: () => setIsInputCollapsed(!isInputCollapsed), onRunStart: () => {
                                updateRunState({
                                    hasRun: true,
                                    success: null,
                                    outputLines: [{ type: 'info', text: '▶ 실행 중...' }]
                                });
                            }, onRunSuccess: (success, lines, tableData) => {
                                updateRunState({
                                    hasRun: true,
                                    success,
                                    outputLines: lines.map(text => ({ type: success ? 'stdout' : 'stderr', text })),
                                    tableData
                                });
                            }, onRunFailure: (errMessage) => {
                                updateRunState({
                                    hasRun: true,
                                    success: false,
                                    outputLines: [{ type: 'stderr', text: errMessage }]
                                });
                            } })),
                    react_1.default.createElement("div", { style: {
                            padding: isInputCollapsed ? '0px 14px' : '12px 14px',
                            background: '#12131a',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: isInputCollapsed ? '0px' : '500px',
                            overflow: 'hidden',
                            transition: 'max-height 0.25s ease-out, padding 0.25s ease-out',
                            position: 'relative'
                        } },
                        !isInputCollapsed && (react_1.default.createElement("div", { ref: mirrorRef, style: {
                                position: 'absolute',
                                top: '12px',
                                left: '14px',
                                right: '14px',
                                bottom: '12px',
                                pointerEvents: 'none',
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace",
                                fontSize: '13px',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                color: 'transparent',
                                overflow: 'hidden',
                                textAlign: 'left'
                            } },
                            react_1.default.createElement("span", null, localCode.substring(0, cursorPos)),
                            suggestion && (react_1.default.createElement("span", { style: { color: '#6b7280', opacity: 0.8, background: 'rgba(255,255,255,0.06)', borderRadius: '2px', padding: '0 2px' } }, suggestion)))),
                        react_1.default.createElement("textarea", { ref: textareaRef, value: localCode, onChange: (e) => {
                                updateCode(e.target.value);
                                setCursorPos(e.target.selectionStart);
                            }, onSelect: (e) => {
                                setCursorPos(e.currentTarget.selectionStart);
                            }, onKeyUp: (e) => {
                                setCursorPos(e.currentTarget.selectionStart);
                            }, onScroll: handleScroll, onKeyDown: (e) => {
                                /*
                                 * [ALGORITHM BRANCH / DECISION]
                                 * - 조건 식: `e.key === 'Enter' && (e.ctrlKey || e.metaKey)`
                                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                 * - 예시: `if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                 */
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleCtrlEnterRun();
                                    return;
                                }
                                /*
                                 * [RUN-TIME STATE / INVARIANT]
                                 * - 변수 명: `textarea`
                                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                 * - 예시 코드: `const textarea = ...` 형태로 안전 캐싱 후 가공 기동.
                                 */
                                const textarea = textareaRef.current;
                                /*
                                 * [ALGORITHM BRANCH / DECISION]
                                 * - 조건 식: `!textarea`
                                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                 * - 예시: `if (!textarea)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                 */
                                if (!textarea)
                                    return;
                                /*
                                 * [RUN-TIME STATE / INVARIANT]
                                 * - 변수 명: `start`
                                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                 * - 예시 코드: `const start = ...` 형태로 안전 캐싱 후 가공 기동.
                                 */
                                const start = textarea.selectionStart;
                                /*
                                 * [RUN-TIME STATE / INVARIANT]
                                 * - 변수 명: `end`
                                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                 * - 예시 코드: `const end = ...` 형태로 안전 캐싱 후 가공 기동.
                                 */
                                const end = textarea.selectionEnd;
                                /*
                                 * [RUN-TIME STATE / INVARIANT]
                                 * - 변수 명: `text`
                                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                 * - 예시 코드: `const text = ...` 형태로 안전 캐싱 후 가공 기동.
                                 */
                                const text = textarea.value;
                                // 1. Tab 키 자동완성 수락 혹은 들여쓰기
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    /*
                                     * [ALGORITHM BRANCH / DECISION]
                                     * - 조건 식: `suggestion`
                                     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                     * - 예시: `if (suggestion)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                     */
                                    if (suggestion) {
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `newCode`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const newCode = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const newCode = text.substring(0, start) + suggestion + text.substring(end);
                                        updateCode(newCode);
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `newPos`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const newPos = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const newPos = start + suggestion.length;
                                        setTimeout(() => {
                                            textarea.selectionStart = textarea.selectionEnd = newPos;
                                            setCursorPos(newPos);
                                        }, 0);
                                    }
                                    else {
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `space`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const space = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const space = '  ';
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `newCode`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const newCode = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const newCode = text.substring(0, start) + space + text.substring(end);
                                        updateCode(newCode);
                                        setTimeout(() => {
                                            textarea.selectionStart = textarea.selectionEnd = start + space.length;
                                            setCursorPos(start + space.length);
                                        }, 0);
                                    }
                                    return;
                                }
                                // 2. 괄호 / 따옴표 자동 닫힘
                                const pairs = {
                                    '(': ')',
                                    '{': '}',
                                    '[': ']',
                                    '"': '"',
                                    "'": "'",
                                    '`': '`'
                                };
                                /*
                                 * [ALGORITHM BRANCH / DECISION]
                                 * - 조건 식: `pairs[e.key] !== undefined`
                                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                 * - 예시: `if (pairs[e.key] !== undefined)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                 */
                                if (pairs[e.key] !== undefined) {
                                    e.preventDefault();
                                    /*
                                     * [RUN-TIME STATE / INVARIANT]
                                     * - 변수 명: `closingChar`
                                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                     * - 예시 코드: `const closingChar = ...` 형태로 안전 캐싱 후 가공 기동.
                                     */
                                    const closingChar = pairs[e.key];
                                    /*
                                     * [RUN-TIME STATE / INVARIANT]
                                     * - 변수 명: `selection`
                                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                     * - 예시 코드: `const selection = ...` 형태로 안전 캐싱 후 가공 기동.
                                     */
                                    const selection = text.substring(start, end);
                                    /*
                                     * [RUN-TIME STATE / INVARIANT]
                                     * - 변수 명: `newCode`
                                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                     * - 예시 코드: `const newCode = ...` 형태로 안전 캐싱 후 가공 기동.
                                     */
                                    const newCode = text.substring(0, start) + e.key + selection + closingChar + text.substring(end);
                                    updateCode(newCode);
                                    setTimeout(() => {
                                        textarea.selectionStart = start + 1;
                                        textarea.selectionEnd = start + 1 + selection.length;
                                        setCursorPos(start + 1);
                                    }, 0);
                                    return;
                                }
                                // 3. 닫는 문자 스킵
                                const closers = [')', '}', ']', '"', "'", '`'];
                                /*
                                 * [ALGORITHM BRANCH / DECISION]
                                 * - 조건 식: `closers.includes(e.key) && text[start] === e.key`
                                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                 * - 예시: `if (closers.includes(e.key) && text[start] === e.key)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                 */
                                if (closers.includes(e.key) && text[start] === e.key) {
                                    e.preventDefault();
                                    setTimeout(() => {
                                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                                        setCursorPos(start + 1);
                                    }, 0);
                                    return;
                                }
                                // 4. HTML 태그 자동 닫힘
                                if (language === 'html' && e.key === '>') {
                                    /*
                                     * [RUN-TIME STATE / INVARIANT]
                                     * - 변수 명: `beforeText`
                                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                     * - 예시 코드: `const beforeText = ...` 형태로 안전 캐싱 후 가공 기동.
                                     */
                                    const beforeText = text.substring(0, start);
                                    /*
                                     * [RUN-TIME STATE / INVARIANT]
                                     * - 변수 명: `tagMatch`
                                     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                     * - 예시 코드: `const tagMatch = ...` 형태로 안전 캐싱 후 가공 기동.
                                     */
                                    const tagMatch = beforeText.match(/<([a-zA-Z1-6]+)(?:\s+[^>]*)?$/);
                                    /*
                                     * [ALGORITHM BRANCH / DECISION]
                                     * - 조건 식: `tagMatch`
                                     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                                     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                                     * - 예시: `if (tagMatch)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                                     */
                                    if (tagMatch) {
                                        e.preventDefault();
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `tagName`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const tagName = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const tagName = tagMatch[1];
                                        /*
                                         * [RUN-TIME STATE / INVARIANT]
                                         * - 변수 명: `newCode`
                                         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                                         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                                         * - 예시 코드: `const newCode = ...` 형태로 안전 캐싱 후 가공 기동.
                                         */
                                        const newCode = beforeText + '>' + '</' + tagName + '>' + text.substring(end);
                                        updateCode(newCode);
                                        setTimeout(() => {
                                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                                            setCursorPos(start + 1);
                                        }, 0);
                                        return;
                                    }
                                }
                            }, placeholder: "// \uC774\uACF3\uC5D0 \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694... (JavaScript \uB610\uB294 Python)", style: {
                                width: '100%',
                                minHeight: '80px',
                                background: 'transparent',
                                border: 'none',
                                color: '#f3f4f6',
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace",
                                fontSize: '13px',
                                lineHeight: '1.6',
                                resize: 'vertical',
                                outline: 'none',
                                padding: '0',
                                margin: '0',
                                zIndex: 2,
                                caretColor: '#a78bfa'
                            } })),
                    parsedRunState.hasRun && (react_1.default.createElement("div", { style: { width: '100%' } },
                        react_1.default.createElement(JupyterCodeEditor_1.JupyterCodeEditorTerminal, { language: language, runState: parsedRunState, code: code, blockId: block.id }))))));
        }
        catch (err) {
            return (react_1.default.createElement("div", { style: {
                    padding: '16px',
                    margin: '14px 0',
                    background: '#fef2f2',
                    border: '1.5px solid #f87171',
                    borderRadius: '10px',
                    color: '#991b1b',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                } },
                "Jupyter \uBE14\uB85D \uB80C\uB354\uB9C1 \uC2E4\uD328: ",
                err.message));
        }
    },
    toExternalHTML: ({ block }) => {
        return (react_1.default.createElement("pre", { "data-content-type": "jupyter", "data-language": block.props.language },
            react_1.default.createElement("code", null, block.props.code)));
    }
});
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `JupyterBlock`
 * - 역할: 유입 인자를 가공하고 비즈니스 계약 조건에 맞춰 최종 객체/바이너리를 생산함.
 * - 예시: `JupyterBlock(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
exports.JupyterBlock = JupyterBlockSpec();
