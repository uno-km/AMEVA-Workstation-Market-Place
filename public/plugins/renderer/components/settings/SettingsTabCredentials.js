"use strict";
/**
 * @file SettingsTabCredentials.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/settings/SettingsTabCredentials.tsx
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
exports.SettingsTabCredentials = SettingsTabCredentials;
const react_1 = require("react");
const ipc = __importStar(require("../../services/ipc/electronApiAdapter"));
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTabCredentials`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTabCredentials(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTabCredentials({ isOpen, activeTab }) {
    const [credStatus, setCredStatus] = (0, react_1.useState)({
        gemini: false,
        openai: false,
        claude: false,
        github: false,
        googleClientId: false,
    });
    const [newKeyInput, setNewKeyInput] = (0, react_1.useState)({
        gemini: '',
        openai: '',
        claude: '',
        github: '',
        googleClientId: '',
    });
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `loadCredentials`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const loadCredentials = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const loadCredentials = () => __awaiter(this, void 0, void 0, function* () {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!ipc.isElectronEnv())
            return;
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `geminiVal`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const geminiVal = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const geminiVal = yield ipc.keychainGet('gemini-api-key');
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `openaiVal`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const openaiVal = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const openaiVal = yield ipc.keychainGet('openai-api-key');
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `claudeVal`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const claudeVal = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const claudeVal = yield ipc.keychainGet('claude-api-key');
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `githubVal`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const githubVal = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const githubVal = yield ipc.keychainGet('github-token');
        const googleClientIdVal = yield ipc.keychainGet('google-client-id');
        setCredStatus({
            gemini: !!geminiVal,
            openai: !!openaiVal,
            claude: !!claudeVal,
            github: !!githubVal,
            googleClientId: !!googleClientIdVal,
        });
    });
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen && activeTab === 'Credentials'`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen && activeTab === 'Credentials')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen && activeTab === 'Credentials') {
            loadCredentials();
        }
    }, [isOpen, activeTab]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleSaveCredential`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleSaveCredential = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleSaveCredential = (service, keychainKey) => __awaiter(this, void 0, void 0, function* () {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `value`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const value = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const value = newKeyInput[service];
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!value || !value.trim()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!value || !value.trim())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!value || !value.trim())
            return;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!ipc.isElectronEnv())
            return;
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `res`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const res = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const res = yield ipc.keychainSet(keychainKey, value.trim());
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `res && res.success`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (res && res.success)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (res && res.success) {
            setNewKeyInput(prev => (Object.assign(Object.assign({}, prev), { [service]: '' })));
            loadCredentials();
        }
        else {
            alert(`키 저장 실패: ${(res === null || res === void 0 ? void 0 : res.error) || '알 수 없는 오류'}`);
        }
    });
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleClearCredential`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleClearCredential = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleClearCredential = (service, keychainKey) => __awaiter(this, void 0, void 0, function* () {
        void service;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!ipc.isElectronEnv())
            return;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!confirm('해당 자격 증명을 영구히 삭제하시겠습니까?')`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!confirm('해당 자격 증명을 영구히 삭제하시겠습니까?'))` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!confirm('해당 자격 증명을 영구히 삭제하시겠습니까?'))
            return;
        yield ipc.keychainDelete(keychainKey);
        loadCredentials();
    });
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `activeTab !== 'Credentials'`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (activeTab !== 'Credentials')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (activeTab !== 'Credentials')
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement("h3", { style: { fontSize: '13px', fontWeight: 700, margin: '0 0 6px' } }, "API Keys & Credentials"),
        React.createElement("p", { style: { fontSize: '9.5px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: '1.4' } },
            "\uC678\uBD80 AI \uC11C\uBE44\uC2A4 \uBC0F \uD50C\uB7AB\uD3FC \uC5F0\uB3D9\uC744 \uC704\uD55C API Key\uB4E4\uC744 \uB370\uC2A4\uD06C\uD1B1 \uD658\uACBD\uC758 ",
            React.createElement("strong", null, "OS \uC790\uACA9 \uC99D\uBA85 \uAD00\uB9AC\uC790(Keychain / safeStorage)"),
            "\uC5D0 \uC548\uC804\uD558\uAC8C \uC554\uD638\uD654\uD558\uC5EC \uC704\uC784 \uBCF4\uAD00\uD569\uB2C8\uB2E4. \uB4F1\uB85D\uB41C \uBE44\uBC00\uD0A4\uB294 \uD654\uBA74\uC5D0 \uB178\uCD9C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
            { id: 'gemini', keyName: 'gemini-api-key', label: 'Google Gemini API Key', placeholder: 'AQ.Ab8... 또는 AIzaSy...' },
            { id: 'openai', keyName: 'openai-api-key', label: 'OpenAI API Key', placeholder: 'sk-...' },
            { id: 'claude', keyName: 'claude-api-key', label: 'Anthropic Claude API Key', placeholder: 'sk-ant-...' },
            { id: 'github', keyName: 'github-token', label: 'GitHub Personal Access Token', placeholder: 'ghp_... 또는 github_pat_...' },
            { id: 'googleClientId', keyName: 'google-client-id', label: 'Google OAuth Client ID', placeholder: '109283748293-...apps.googleusercontent.com' },
        ].map(cred => {
            var _a, _b, _c, _d;
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `isRegistered`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const isRegistered = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const isRegistered = credStatus[cred.id];
            return (React.createElement("div", { key: cred.id, style: {
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                } },
                React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    React.createElement("span", { style: { fontSize: '11px', fontWeight: 700 } }, cred.label),
                    isRegistered ? (React.createElement("span", { style: {
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        } }, "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF \uB4F1\uB85D\uB428 (OS \uC554\uD638\uD654 \uBCF4\uAD00 \uC911)")) : (React.createElement("span", { style: {
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        } }, "\uBBF8\uB4F1\uB85D"))),
                React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                    React.createElement("input", { type: "password", value: newKeyInput[cred.id], onChange: e => setNewKeyInput(prev => (Object.assign(Object.assign({}, prev), { [cred.id]: e.target.value }))), placeholder: isRegistered ? "새로운 키로 덮어쓰려면 여기에 입력하세요" : cred.placeholder, style: {
                            flex: 1,
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid var(--border-muted)',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            color: 'var(--text-main)',
                            fontSize: '11px',
                            outline: 'none',
                        } }),
                    React.createElement("button", { onClick: () => handleSaveCredential(cred.id, cred.keyName), disabled: !((_a = newKeyInput[cred.id]) === null || _a === void 0 ? void 0 : _a.trim()), style: {
                            padding: '5px 12px',
                            background: ((_b = newKeyInput[cred.id]) === null || _b === void 0 ? void 0 : _b.trim()) ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                            color: ((_c = newKeyInput[cred.id]) === null || _c === void 0 ? void 0 : _c.trim()) ? '#fff' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: ((_d = newKeyInput[cred.id]) === null || _d === void 0 ? void 0 : _d.trim()) ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s',
                        } }, "\uB4F1\uB85D"),
                    isRegistered && (React.createElement("button", { onClick: () => handleClearCredential(cred.id, cred.keyName), style: {
                            padding: '5px 10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        } }, "\uC0AD\uC81C")))));
        }))));
}
