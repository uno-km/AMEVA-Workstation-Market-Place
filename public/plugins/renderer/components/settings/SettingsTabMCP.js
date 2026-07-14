"use strict";
/**
 * @file SettingsTabMCP.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/settings/SettingsTabMCP.tsx
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
exports.SettingsTabMCP = SettingsTabMCP;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const mcpClient_1 = require("../../utils/mcpClient");
const ipc = __importStar(require("../../services/ipc/electronApiAdapter"));
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTabMCP`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTabMCP(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTabMCP({ isProPlan, isOpen }) {
    const [mcpServers, setMcpServers] = (0, react_1.useState)([]);
    const [newMcpName, setNewMcpName] = (0, react_1.useState)('');
    const [newMcpType, setNewMcpType] = (0, react_1.useState)('http');
    const [newMcpUrl, setNewMcpUrl] = (0, react_1.useState)('');
    const [newMcpCmd, setNewMcpCmd] = (0, react_1.useState)('');
    const [newMcpArgs, setNewMcpArgs] = (0, react_1.useState)('');
    const [mcpTools, setMcpTools] = (0, react_1.useState)([]);
    const [isLoadingTools, setIsLoadingTools] = (0, react_1.useState)(false);
    const [expandedTool, setExpandedTool] = (0, react_1.useState)(null);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `refreshMcpTools`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const refreshMcpTools = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const refreshMcpTools = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        setIsLoadingTools(true);
        try {
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `tools`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const tools = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const tools = yield mcpClient_1.MCPClientManager.fetchAllTools();
            setMcpTools(tools);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setIsLoadingTools(false);
        }
    }), []);
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen) {
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `configs`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const configs = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const configs = mcpClient_1.MCPClientManager.loadConfigs();
            setMcpServers(configs);
            refreshMcpTools();
        }
    }, [isOpen, refreshMcpTools]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleAddMcp`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleAddMcp = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleAddMcp = () => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!newMcpName.trim()) return alert('서버 이름을 입력해 주세요.'`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!newMcpName.trim()) return alert('서버 이름을 입력해 주세요.')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!newMcpName.trim())
            return alert('서버 이름을 입력해 주세요.');
        const newServer = {
            id: `mcp-${Date.now()}`,
            name: newMcpName.trim(),
            type: newMcpType,
            enabled: true
        };
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `newMcpType === 'http'`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (newMcpType === 'http')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (newMcpType === 'http') {
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `!newMcpUrl.trim()) return alert('URL을 입력해 주세요.'`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (!newMcpUrl.trim()) return alert('URL을 입력해 주세요.')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (!newMcpUrl.trim())
                return alert('URL을 입력해 주세요.');
            newServer.url = newMcpUrl.trim();
        }
        else {
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `!newMcpCmd.trim()) return alert('실행 명령어를 입력해 주세요.'`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (!newMcpCmd.trim()) return alert('실행 명령어를 입력해 주세요.')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (!newMcpCmd.trim())
                return alert('실행 명령어를 입력해 주세요.');
            newServer.command = newMcpCmd.trim();
            newServer.args = newMcpArgs.trim() ? newMcpArgs.split(/\s+/) : [];
        }
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `updated`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const updated = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const updated = [...mcpServers, newServer];
        mcpClient_1.MCPClientManager.setConfigs(updated);
        setMcpServers(updated);
        setNewMcpName('');
        setNewMcpUrl('');
        setNewMcpCmd('');
        setNewMcpArgs('');
        setTimeout(() => refreshMcpTools(), 200);
    };
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleToggleMcp`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleToggleMcp = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleToggleMcp = (id) => {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `updated`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const updated = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const updated = mcpServers.map(s => s.id === id ? Object.assign(Object.assign({}, s), { enabled: !s.enabled }) : s);
        mcpClient_1.MCPClientManager.setConfigs(updated);
        setMcpServers(updated);
        setTimeout(() => refreshMcpTools(), 200);
    };
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleDeleteMcp`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleDeleteMcp = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleDeleteMcp = (id) => __awaiter(this, void 0, void 0, function* () {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `updated`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const updated = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const updated = mcpServers.filter(s => s.id !== id);
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (ipc.isElectronEnv()) {
            yield ipc.mcpKill(id);
        }
        mcpClient_1.MCPClientManager.setConfigs(updated);
        setMcpServers(updated);
        setTimeout(() => refreshMcpTools(), 200);
    });
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!isProPlan`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!isProPlan)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!isProPlan)
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' } },
            React.createElement("h3", { style: { fontSize: '13px', fontWeight: 700, margin: 0 } }, "MCP Server Manager"),
            React.createElement("button", { onClick: refreshMcpTools, style: {
                    fontSize: '10px', color: 'var(--primary)', background: 'none',
                    border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0
                } }, "\uC0C8\uB85C\uACE0\uCE68 \uD83D\uDD04")),
        React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '8px' } }, "\uC678\uBD80 Stdio \uC790\uC2DD \uD504\uB85C\uC138\uC2A4 \uB610\uB294 HTTP API \uAC8C\uC774\uD2B8\uC6E8\uC774 \uAE30\uBC18\uC758 MCP \uB3C4\uAD6C(Tools) \uC11C\uBC84\uB97C \uD558\uB4DC\uCF54\uB529 \uC5C6\uC774 \uD1B5\uD569 \uC81C\uC5B4\uD569\uB2C8\uB2E4."),
        React.createElement("div", { style: {
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-muted)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '10px'
            } },
            React.createElement("strong", { style: { fontSize: '10.5px', color: 'var(--primary)' } }, "\u2795 \uC0C8 MCP \uC11C\uBC84 \uCD94\uAC00"),
            React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                React.createElement("input", { type: "text", placeholder: "\uC11C\uBC84 \uC774\uB984 (\uC608: \uD30C\uC77C \uB9E4\uB2C8\uC800)", value: newMcpName, onChange: e => setNewMcpName(e.target.value), style: {
                        flex: 1, padding: '5px 8px', background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-muted)', borderRadius: '4px',
                        color: 'var(--text-main)', fontSize: '10.5px', outline: 'none'
                    } }),
                React.createElement("select", { value: newMcpType, onChange: e => setNewMcpType(e.target.value), style: {
                        padding: '4px 8px', background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-muted)', borderRadius: '4px',
                        color: 'var(--text-main)', fontSize: '10.5px', outline: 'none'
                    } },
                    React.createElement("option", { value: "http" }, "HTTP Gateway"),
                    React.createElement("option", { value: "stdio" }, "Stdio Process"))),
            newMcpType === 'http' ? (React.createElement("input", { type: "text", placeholder: "HTTP \uAC8C\uC774\uD2B8\uC6E8\uC774 \uC8FC\uC18C URL (\uC608: http://127.0.0.1:11553/mcp)", value: newMcpUrl, onChange: e => setNewMcpUrl(e.target.value), style: {
                    padding: '5px 8px', background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-muted)', borderRadius: '4px',
                    color: 'var(--text-main)', fontSize: '10.5px', outline: 'none'
                } })) : (React.createElement("div", { style: { display: 'flex', gap: '6px' } },
                React.createElement("input", { type: "text", placeholder: "\uC2E4\uD589 \uBA85\uB839\uC5B4 (\uC608: npx, python)", value: newMcpCmd, onChange: e => setNewMcpCmd(e.target.value), style: {
                        flex: 1, padding: '5px 8px', background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-muted)', borderRadius: '4px',
                        color: 'var(--text-main)', fontSize: '10.5px', outline: 'none'
                    } }),
                React.createElement("input", { type: "text", placeholder: "\uD30C\uB77C\uBBF8\uD130 (\uC608: -y @modelcontextprotocol/server-postgres)", value: newMcpArgs, onChange: e => setNewMcpArgs(e.target.value), style: {
                        flex: 1, padding: '5px 8px', background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-muted)', borderRadius: '4px',
                        color: 'var(--text-main)', fontSize: '10.5px', outline: 'none'
                    } }))),
            React.createElement("button", { onClick: handleAddMcp, style: {
                    padding: '6px', background: 'var(--primary)', border: 'none',
                    borderRadius: '4px', color: '#fff', fontSize: '10.5px',
                    fontWeight: 700, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '4px'
                } },
                React.createElement(lucide_react_1.Plus, { size: 12 }),
                " \uC11C\uBC84 \uCD94\uAC00 \uB4F1\uB85D")),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginBottom: '10px' } },
            React.createElement("span", { style: { fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' } }, "\u2699\uFE0F \uD65C\uC131 \uC11C\uBC84 \uC778\uC2A4\uD134\uC2A4"),
            mcpServers.length === 0 ? (React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' } }, "\uB4F1\uB85D\uB41C MCP \uC11C\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")) : (mcpServers.map(server => (React.createElement("div", { key: server.id, style: {
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                    borderRadius: '6px', padding: '6px 10px'
                } },
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                        React.createElement("div", { style: {
                                width: '6px', height: '6px', borderRadius: '50%',
                                backgroundColor: server.enabled ? '#10b981' : 'var(--text-muted)'
                            } }),
                        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700 } }, server.name),
                        React.createElement("span", { style: {
                                fontSize: '8.5px', color: 'var(--primary)',
                                background: 'rgba(168,85,247,0.1)', padding: '1px 4px', borderRadius: '3px'
                            } }, server.type.toUpperCase())),
                    React.createElement("div", { style: { fontSize: '8.5px', color: 'var(--text-muted)' } }, server.type === 'http' ? server.url : `${server.command} ${(server.args || []).join(' ')}`)),
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement("button", { onClick: () => handleToggleMcp(server.id), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, server.enabled ? React.createElement(lucide_react_1.ToggleRight, { size: 22 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 22, style: { color: 'var(--text-dark)' } })),
                    React.createElement("button", { onClick: () => handleDeleteMcp(server.id), style: { background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' } },
                        React.createElement(lucide_react_1.Trash2, { size: 13 })))))))),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            React.createElement("span", { style: { fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' } },
                "\uD83D\uDEE0\uFE0F \uC2E4\uC2DC\uAC04 \uC81C\uACF5 \uB3C4\uAD6C \uBAA9\uB85D (",
                mcpTools.length,
                "\uAC1C)"),
            isLoadingTools ? (React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' } }, "MCP \uC11C\uBC84\uB4E4\uB85C\uBD80\uD130 \uB3C4\uAD6C \uBA85\uC138\uB97C \uAC00\uC838\uC624\uB294 \uC911... \uD83D\uDD04")) : mcpTools.length === 0 ? (React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' } }, "\uD65C\uC131\uD654\uB41C \uC11C\uBC84\uAC00 \uC5C6\uAC70\uB098 \uC81C\uACF5\uD558\uB294 \uB3C4\uAD6C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' } }, mcpTools.map(tool => {
                var _a;
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `isExpanded`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const isExpanded = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const isExpanded = expandedTool === tool.name;
                return (React.createElement("div", { key: tool.name, style: {
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-muted)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    } },
                    React.createElement("div", { onClick: () => setExpandedTool(isExpanded ? null : tool.name), style: {
                            padding: '6px 10px', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center',
                            background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                            fontSize: '10.5px', fontWeight: 600
                        } },
                        React.createElement("span", { style: { color: 'var(--secondary)' } }, tool.name),
                        React.createElement("span", { style: { fontSize: '9px', color: 'var(--text-muted)' } }, isExpanded ? '접기 🔼' : '펼치기 🔽')),
                    isExpanded && (React.createElement("div", { style: {
                            padding: '8px 10px', borderTop: '1px solid var(--border-muted)',
                            background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '4px'
                        } },
                        React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-main)' } }, tool.description || '설명 없음'),
                        React.createElement("div", { style: { fontSize: '8.5px', color: 'var(--text-muted)', marginTop: '4px' } },
                            React.createElement("strong", null, "\uC785\uB825 \uBA85\uC138:"),
                            " ",
                            JSON.stringify(((_a = tool.inputSchema) === null || _a === void 0 ? void 0 : _a.properties) || {}))))));
            }))))));
}
