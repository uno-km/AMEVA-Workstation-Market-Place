"use strict";
/**
 * @file SettingsModal.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/SettingsModal.tsx
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
exports.SettingsTabCustomizations = exports.SettingsTabModels = exports.SettingsTabAppearance = exports.SettingsTabPermissions = exports.SettingsTabAccount = exports.SettingsTabAIEngine = exports.SettingsTabGeneral = void 0;
exports.SettingsModal = SettingsModal;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ipc = __importStar(require("../services/ipc/electronApiAdapter"));
const FreeModal_1 = require("./ui/modals/FreeModal");
const SettingsTabCredentials_1 = require("./settings/SettingsTabCredentials");
const SettingsTabMCP_1 = require("./settings/SettingsTabMCP");
const SettingsTabHotkeys_1 = require("./settings/SettingsTabHotkeys");
const SettingsTabGeneral_1 = require("./settings/SettingsTabGeneral");
const SettingsTabAccount_1 = require("./settings/SettingsTabAccount");
const SettingsTabPermissions_1 = require("./settings/SettingsTabPermissions");
const SettingsTabAppearance_1 = require("./settings/SettingsTabAppearance");
const SettingsTabModels_1 = require("./settings/SettingsTabModels");
const SettingsTabCustomizations_1 = require("./settings/SettingsTabCustomizations");
const SettingsTabAIEngine_1 = require("./settings/SettingsTabAIEngine");
const useSettingsDraft_1 = require("../hooks/app/useSettingsDraft");
const SettingsTransitionOverlay_1 = require("./overlay/SettingsTransitionOverlay");
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsModal`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsModal(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, aiSettings, onUpdateAISettings, initialTab, username = 'User', userColor = '#a855f7', onUpdateUser, onOpenModelHub, }) {
    void { Move: lucide_react_1.Move, ShieldAlert: lucide_react_1.ShieldAlert, onOpenModelHub };
    // 0. 설정 Draft 및 전환 상태
    const { draftSettings, updateDraft, resetDraft, isDirty: isAppDirty } = (0, useSettingsDraft_1.useSettingsDraft)(settings, isOpen);
    const [draftAISettings, setDraftAISettings] = (0, react_1.useState)(aiSettings);
    const [isAIDirty, setIsAIDirty] = (0, react_1.useState)(false);
    const [isApplying, setIsApplying] = (0, react_1.useState)(false);
    // 2. 활성 탭 상태 (기본 General 또는 initialTab)
    const [activeTab, setActiveTab] = (0, react_1.useState)(initialTab || 'General');
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
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `initialTab`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (initialTab)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (initialTab) {
                setActiveTab(initialTab);
            }
            else {
                // If it was closed and opened again without initialTab, maybe keep the last active tab or reset to General.
                // We'll just set it to initialTab if provided.
            }
        }
    }, [isOpen, initialTab]);
    // 3. 사용자 정보 폼 로컬 상태
    const [tempName, setTempName] = (0, react_1.useState)(username);
    const [tempColor, setTempColor] = (0, react_1.useState)(userColor);
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen) {
            setDraftAISettings(aiSettings);
            setIsAIDirty(false);
            setTempName(username);
            setTempColor(userColor);
        }
    }, [isOpen, aiSettings, username, userColor]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `updateDraftAI`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const updateDraftAI = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const updateDraftAI = (updates) => {
        setDraftAISettings(prev => (Object.assign(Object.assign({}, prev), updates)));
        setIsAIDirty(true);
    };
    // 4. 모델 탭 스캔 상태
    const [localModels, setLocalModels] = (0, react_1.useState)([]);
    const [localCodeModels, setLocalCodeModels] = (0, react_1.useState)([]);
    const [gpuName, setGpuName] = (0, react_1.useState)(undefined);
    // 🦾 Pro Plan 상태 (마켓플레이스 및 MCP 노출을 제어)
    const [isProPlan, setIsProPlan] = (0, react_1.useState)(() => {
        try {
            return localStorage.getItem('is-pro-plan') === 'true';
        }
        catch (_a) {
            return false;
        }
    });
    const [isFreeModeLocked, setIsFreeModeLocked] = (0, react_1.useState)(false);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `isUserDirty`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const isUserDirty = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const isUserDirty = tempName !== username || tempColor !== userColor;
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `isAnyDirty`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const isAnyDirty = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const isAnyDirty = isAppDirty || isAIDirty || isUserDirty;
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleSaveAndApply`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleSaveAndApply = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleSaveAndApply = () => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!isAnyDirty`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!isAnyDirty)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!isAnyDirty) {
            onClose();
            return;
        }
        setIsApplying(true);
        setTimeout(() => {
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `isAppDirty) onUpdateSettings(draftSettings`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (isAppDirty) onUpdateSettings(draftSettings)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (isAppDirty)
                onUpdateSettings(draftSettings);
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `isAIDirty) onUpdateAISettings(draftAISettings`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (isAIDirty) onUpdateAISettings(draftAISettings)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (isAIDirty)
                onUpdateAISettings(draftAISettings);
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `isUserDirty && onUpdateUser) onUpdateUser(tempName, tempColor`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (isUserDirty && onUpdateUser) onUpdateUser(tempName, tempColor)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (isUserDirty && onUpdateUser)
                onUpdateUser(tempName, tempColor);
            setIsApplying(false);
            onClose();
        }, 1800);
    };
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleCancel`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleCancel = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleCancel = () => {
        resetDraft();
        setDraftAISettings(aiSettings);
        setIsAIDirty(false);
        setTempName(username);
        setTempColor(userColor);
        onClose();
    };
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen) {
            // Pro 플랜 설정 실시간 반영
            try {
                setIsProPlan(localStorage.getItem('is-pro-plan') === 'true');
            }
            catch (_a) { }
            // 시작 시 무료 플래그 상태 체크
            if (ipc.isElectronEnv()) {
                ipc.isFreeMode().then(isFree => {
                    /*
                     * [ALGORITHM BRANCH / DECISION]
                     * - 조건 식: `isFree`
                     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                     * - 예시: `if (isFree)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                     */
                    if (isFree) {
                        setIsFreeModeLocked(true);
                        setIsProPlan(false);
                    }
                });
            }
        }
    }, [isOpen]);
    // 라이브 테마 프리뷰: Appearance 설정 탭에서 고르면 닫기 전까지 임시 적용
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen) {
            document.documentElement.setAttribute('data-theme', draftSettings.theme);
        }
        else {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
    }, [isOpen, draftSettings.theme, settings.theme]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleToggleProPlan`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleToggleProPlan = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleToggleProPlan = () => __awaiter(this, void 0, void 0, function* () {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isFreeModeLocked`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isFreeModeLocked)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isFreeModeLocked) {
            alert('⚠️ 무료 모드 데모 플래그(--free)로 실행되어 요금제 강제 전환이 불가능합니다.');
            return;
        }
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `nextVal`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const nextVal = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const nextVal = !isProPlan;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (ipc.isElectronEnv()) {
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `result`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const result = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const result = yield ipc.planSetStatus(nextVal);
            /*
             * [ALGORITHM BRANCH / DECISION]
             * - 조건 식: `result && !result.success`
             * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
             * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
             * - 예시: `if (result && !result.success)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
             */
            if (result && !result.success) {
                alert(`요금제 변경 실패: ${result.error}`);
                return;
            }
        }
        setIsProPlan(nextVal);
        localStorage.setItem('is-pro-plan', String(nextVal));
        // 탭 선택 보정: 유료에서 무료로 전환 시 현재 MCP 탭에 있었다면 General 탭으로 대피시킴
        if (!nextVal && activeTab === 'MCP') {
            setActiveTab('General');
        }
    });
    (0, react_1.useEffect)(() => {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isOpen && ipc.isElectronEnv()`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isOpen && ipc.isElectronEnv())` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isOpen && ipc.isElectronEnv()) {
            Promise.all([
                ipc.llmListModels('llm').catch(() => []),
                ipc.llmListModels('code').catch(() => [])
            ]).then(([llmList, codeList]) => {
                setLocalModels(llmList);
                setLocalCodeModels(codeList);
            });
            (_a = ipc.llmGetGpuName) === null || _a === void 0 ? void 0 : _a.call(ipc).then(name => {
                /*
                 * [ALGORITHM BRANCH / DECISION]
                 * - 조건 식: `name) setGpuName(name`
                 * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
                 * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
                 * - 예시: `if (name) setGpuName(name)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
                 */
                if (name)
                    setGpuName(name);
            }).catch(() => { });
        }
    }, [isOpen]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `startModelDownload`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const startModelDownload = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const startModelDownload = (url, filename, type) => __awaiter(this, void 0, void 0, function* () {
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
         * - 변수 명: `store`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const store = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const store = (yield Promise.resolve().then(() => __importStar(require('../stores/useProcessStore')))).useProcessStore.getState();
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `existing`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const existing = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const existing = store.downloadQueue.find((q) => q.filename === filename && (q.status === 'pending' || q.status === 'downloading'));
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `existing`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (existing)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (existing) {
            // 이미 큐에 있음
            return;
        }
        store.addDownloadToQueue({
            id: Math.random().toString(36).substring(2, 9),
            url,
            filename,
            type,
            status: 'pending',
            progress: 0
        });
    });
    const themes = [
        { id: 'dark', label: 'Dark (Antigravity)', previewColor: '#0a0a0f' },
        { id: 'gray', label: 'Carbon Gray', previewColor: '#1e1e2e' },
        { id: 'white', label: 'Light White', previewColor: '#f3f4f6' },
        { id: 'hacker', label: 'Hacker Green', previewColor: '#000000' },
        { id: 'nature', label: 'Fairytale Nature', previewColor: '#f0fdf4' },
        { id: 'win98', label: 'Retro Windows 98', previewColor: '#c0c0c0' },
    ];
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `handleSaveUser`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const handleSaveUser = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const handleSaveUser = () => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `onUpdateUser`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (onUpdateUser)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (onUpdateUser) {
            onUpdateUser(tempName.trim(), tempColor);
        }
    };
    /*
     * [FUNCTION CONTRACT]
     * - 함수 명: `formatBytes`
     * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
     * - 예시: `formatBytes(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
     */
    function formatBytes(bytes) {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `bytes === 0`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (bytes === 0)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (bytes === 0)
            return 'N/A';
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (bytes < 1024 * 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    }
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!isOpen`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!isOpen)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!isOpen)
        return null;
    return (React.createElement(FreeModal_1.FreeModal, { isOpen: isOpen, onClose: handleCancel, title: "AMEVA Workstation Settings", icon: React.createElement(lucide_react_1.Settings, { size: 18 }), initialWidth: 970, initialHeight: 680, hasBackdrop: true, closeOnBackdropClick: false },
        React.createElement("div", { style: { display: 'flex', flex: 1, overflow: 'hidden' } },
            React.createElement("div", { style: {
                    width: '150px',
                    borderRight: '1px solid var(--border-muted)',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px 8px',
                    gap: '4px',
                    flexShrink: 0,
                } }, [
                { id: 'General', label: 'General', icon: lucide_react_1.Sliders },
                { id: 'AIEngine', label: 'AI Engine', icon: lucide_react_1.Cpu },
                { id: 'Account', label: 'Account', icon: lucide_react_1.User },
                { id: 'Permissions', label: 'Permissions', icon: lucide_react_1.Shield },
                { id: 'Credentials', label: 'Credentials', icon: lucide_react_1.Key },
                { id: 'Appearance', label: 'Appearance', icon: lucide_react_1.Monitor },
                { id: 'Models', label: 'Models', icon: lucide_react_1.Bot },
                { id: 'Customizations', label: 'Customizations', icon: lucide_react_1.ToyBrick },
                { id: 'Hotkeys', label: 'Hotkeys', icon: lucide_react_1.Keyboard },
                ...(isProPlan ? [{ id: 'MCP', label: 'MCP Manager', icon: lucide_react_1.ToyBrick }] : [])
            ].map(t => {
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `Icon`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const Icon = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const Icon = t.icon;
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `isSelected`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const isSelected = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const isSelected = activeTab === t.id;
                return (React.createElement("button", { key: t.id, onClick: () => setActiveTab(t.id), style: {
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px', borderRadius: '6px', border: 'none',
                        background: isSelected ? 'var(--bg-glass-active)' : 'transparent',
                        color: isSelected ? 'var(--text-on-active)' : 'var(--text-muted)',
                        fontSize: '13px', fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s, color 0.15s',
                    } },
                    React.createElement(Icon, { size: 14 }),
                    React.createElement("span", null, t.label)));
            })),
            React.createElement("div", { style: { flex: 1, padding: '24px', overflowY: 'auto' } },
                React.createElement(SettingsTabGeneral_1.SettingsTabGeneral, { activeTab: activeTab, settings: draftSettings, onUpdateSettings: updateDraft, isProPlan: isProPlan, handleToggleProPlan: handleToggleProPlan }),
                React.createElement(SettingsTabAIEngine_1.SettingsTabAIEngine, { activeTab: activeTab, aiSettings: draftAISettings, onUpdateAISettings: updateDraftAI, gpuName: gpuName }),
                React.createElement(SettingsTabAccount_1.SettingsTabAccount, { activeTab: activeTab, tempName: tempName, setTempName: setTempName, tempColor: tempColor, setTempColor: setTempColor, handleSaveUser: handleSaveUser }),
                React.createElement(SettingsTabPermissions_1.SettingsTabPermissions, { activeTab: activeTab, settings: draftSettings, onUpdateSettings: updateDraft }),
                React.createElement(SettingsTabCredentials_1.SettingsTabCredentials, { isOpen: isOpen, activeTab: activeTab }),
                React.createElement(SettingsTabAppearance_1.SettingsTabAppearance, { activeTab: activeTab, settings: draftSettings, handleThemeChange: (theme) => updateDraft({ theme }), themes: themes }),
                React.createElement(SettingsTabModels_1.SettingsTabModels, { activeTab: activeTab, settings: draftSettings, onUpdateSettings: updateDraft, localModels: localModels, localCodeModels: localCodeModels, formatBytes: formatBytes, startModelDownload: startModelDownload }),
                React.createElement(SettingsTabCustomizations_1.SettingsTabCustomizations, { activeTab: activeTab, settings: draftSettings }),
                React.createElement(SettingsTabHotkeys_1.SettingsTabHotkeys, { activeTab: activeTab, settings: draftSettings, onUpdateSettings: updateDraft }),
                activeTab === 'MCP' && (React.createElement(SettingsTabMCP_1.SettingsTabMCP, { isProPlan: isProPlan, isOpen: isOpen })))),
        React.createElement("div", { style: {
                padding: '10px 18px',
                borderTop: '1px solid var(--border-muted)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                flexShrink: 0,
            } },
            React.createElement("button", { className: "btn btn-secondary", style: { padding: '5px 16px', fontSize: '13px', borderRadius: '6px', fontWeight: 600, border: '1px solid var(--border-muted)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }, onClick: handleCancel, disabled: isApplying }, "\uCDE8\uC18C"),
            React.createElement("button", { className: "btn btn-primary", style: { padding: '5px 16px', fontSize: '13px', borderRadius: '6px', fontWeight: 700, opacity: isApplying ? 0.7 : 1, cursor: isApplying ? 'wait' : 'pointer' }, onClick: handleSaveAndApply, disabled: isApplying }, isAnyDirty ? '적용 및 저장' : '닫기')),
        React.createElement(SettingsTransitionOverlay_1.SettingsTransitionOverlay, { isVisible: isApplying })));
}
var SettingsTabGeneral_2 = require("./settings/SettingsTabGeneral");
Object.defineProperty(exports, "SettingsTabGeneral", { enumerable: true, get: function () { return SettingsTabGeneral_2.SettingsTabGeneral; } });
var SettingsTabAIEngine_2 = require("./settings/SettingsTabAIEngine");
Object.defineProperty(exports, "SettingsTabAIEngine", { enumerable: true, get: function () { return SettingsTabAIEngine_2.SettingsTabAIEngine; } });
var SettingsTabAccount_2 = require("./settings/SettingsTabAccount");
Object.defineProperty(exports, "SettingsTabAccount", { enumerable: true, get: function () { return SettingsTabAccount_2.SettingsTabAccount; } });
var SettingsTabPermissions_2 = require("./settings/SettingsTabPermissions");
Object.defineProperty(exports, "SettingsTabPermissions", { enumerable: true, get: function () { return SettingsTabPermissions_2.SettingsTabPermissions; } });
var SettingsTabAppearance_2 = require("./settings/SettingsTabAppearance");
Object.defineProperty(exports, "SettingsTabAppearance", { enumerable: true, get: function () { return SettingsTabAppearance_2.SettingsTabAppearance; } });
var SettingsTabModels_2 = require("./settings/SettingsTabModels");
Object.defineProperty(exports, "SettingsTabModels", { enumerable: true, get: function () { return SettingsTabModels_2.SettingsTabModels; } });
var SettingsTabCustomizations_2 = require("./settings/SettingsTabCustomizations");
Object.defineProperty(exports, "SettingsTabCustomizations", { enumerable: true, get: function () { return SettingsTabCustomizations_2.SettingsTabCustomizations; } });
