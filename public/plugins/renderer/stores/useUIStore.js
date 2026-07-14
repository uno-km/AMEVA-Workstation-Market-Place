"use strict";
/**
 * @file useUIStore.ts
 * @system AMEVA OS Desktop Workstation - Global State Store
 * @location src/renderer/stores/useUIStore.ts
 * @role UI Panel visibility & Modal popups Zustand Store
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 환경설정, 모델 설치창, 마켓플레이스, 스냅샷 비교(Diff), 웰컴 모달 등 화면 내 10여 개 레이아웃 다이얼로그의 노출 여부를 전역 통제한다.
 * - 좌측 문서 탐색 트리(showSidebar), 하단 정보창(showStatusBar), 우측 AI 패널(showAIPanel) 등의 레이아웃 개폐 상태를 동기 제어한다.
 * - 전역 알림(toastMessage), 찾기/바꾸기(showFindReplace) 및 협업 실시간 메신저(isChatFloating)의 활성화 및 안 읽은 메시지 뱃지(`hasChatUnread`) 트리거를 처리한다.
 * - 여러 레이아웃 팝업이 겹쳐서 기동될 때의 중첩 순서( baseZIndex )를 조정하여 윈도우 레이아웃 순서를 정리한다.
 *
 * [책임이 아닌 것 - NON-RESPONSIBILITY]
 * - 비즈니스 문서 텍스트 데이터의 버퍼링 및 디스크 로드/저장 관리 (useWorkspaceStore에서 전담).
 * - 백그라운드 LLM 모델 다운로드 진도율 관리 (useProcessStore에서 전담).
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 우측 패널 탭 토글 액션(`toggleRightTab`) 기동 시,
 *   이미 열려있는 탭을 한 번 더 선택한 경우에는 반드시 패널을 닫아버리는(`showAIPanel: false`) 직관적인 토글 Invariant 계약을 보존할 것.
 
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/hooks/): 도메인 훅 내부에서 상태 값 바인딩 및 변경 액션 호출 시 소비.
 * - 소비처 B (src/renderer/components/): 컴포넌트 내 렌더 조건 판단을 위해 실시간 구독(Subscribe) 소비.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUIStore = void 0;
/*
 * [IMPORT SEGMENTATION & CONTRACTS]
 * - create: Zustand 라이브러리의 불변 상태 트리 스토어 생성 빌더 API.
 */
const zustand_1 = require("zustand");
/**
 * useUIStore Zustand 스토어 본체 정의.
 */
exports.useUIStore = (0, zustand_1.create)((set, get) => ({
    // 모달 기본 비활성 기동
    isSettingsOpen: false,
    settingsInitialTab: undefined,
    setIsSettingsOpen: (val, tab) => set({ isSettingsOpen: val, settingsInitialTab: tab }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen, settingsInitialTab: undefined })),
    isAboutOpen: false,
    setIsAboutOpen: (val) => set({ isAboutOpen: val }),
    toggleAbout: () => set((state) => ({ isAboutOpen: !state.isAboutOpen })),
    isGuideOpen: false,
    setIsGuideOpen: (val) => set({ isGuideOpen: val }),
    toggleGuide: () => set((state) => ({ isGuideOpen: !state.isGuideOpen })),
    isDiffOpen: false,
    setIsDiffOpen: (val) => set({ isDiffOpen: val }),
    toggleDiff: () => set((state) => ({ isDiffOpen: !state.isDiffOpen })),
    showMarketplaceModal: false,
    setShowMarketplaceModal: (val) => set({ showMarketplaceModal: val }),
    toggleMarketplaceModal: () => set((state) => ({ showMarketplaceModal: !state.showMarketplaceModal })),
    showPricingModal: false,
    setShowPricingModal: (val) => set({ showPricingModal: val }),
    togglePricingModal: () => set((state) => ({ showPricingModal: !state.showPricingModal })),
    isInstallPromptOpen: false,
    setIsInstallPromptOpen: (val) => set({ isInstallPromptOpen: val }),
    showModelHub: false,
    setShowModelHub: (val) => set({ showModelHub: val }),
    toggleModelHub: () => set((state) => ({ showModelHub: !state.showModelHub })),
    showAIPanel: false,
    setShowAIPanel: (val) => set({ showAIPanel: val }),
    toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),
    activeRightTab: 'ai',
    setActiveRightTab: (tab) => set({ activeRightTab: tab }),
    showSidebar: true,
    setShowSidebar: (val) => set({ showSidebar: val }),
    toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
    showStatusBar: true,
    setShowStatusBar: (val) => set({ showStatusBar: val }),
    toggleStatusBar: () => set((state) => ({ showStatusBar: !state.showStatusBar })),
    toastMessage: null,
    setToastMessage: (msg) => set({ toastMessage: msg }),
    showFindReplace: false,
    setShowFindReplace: (val) => set({ showFindReplace: val }),
    toggleFindReplace: () => set((state) => ({ showFindReplace: !state.showFindReplace })),
    findReplaceMode: 'find',
    setFindReplaceMode: (mode) => set({ findReplaceMode: mode }),
    isChatFloating: false,
    setIsChatFloating: (val) => set({ isChatFloating: val }),
    toggleChatFloating: () => set((state) => ({ isChatFloating: !state.isChatFloating })),
    hasChatUnread: false,
    setHasChatUnread: (val) => set({ hasChatUnread: val }),
    isQuitConfirmOpen: false,
    setIsQuitConfirmOpen: (val) => set({ isQuitConfirmOpen: val }),
    isRefreshConfirmOpen: false,
    setIsRefreshConfirmOpen: (val) => set({ isRefreshConfirmOpen: val }),
    /**
     * [CONTRACT - Right Panel Tab Toggle Action]
     * - Rationale: 이미 활성화되어 있는 동일한 탭 클릭 시 패널을 닫고, 다른 탭 클릭 시 패널을 강제 노출한다.
     */
    toggleRightTab: (tab) => {
        const { showAIPanel, activeRightTab } = get();
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `showAIPanel && activeRightTab === tab`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (showAIPanel && activeRightTab === tab)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (showAIPanel && activeRightTab === tab) {
            set({ showAIPanel: false });
        }
        else {
            set({ activeRightTab: tab, showAIPanel: true });
        }
    },
    /**
     * [CONTRACT - Window Depth bringToFront Action]
     * - Rationale: 다중 오버레이가 중첩 팝업될 시, 뒤엉켜 가려지는 Z-index 무질서를 차단하기 위해
     *   기준 Z-Index를 10 단위로 자동 승격시킨 최신 절댓값을 반환해 준다.
     */
    baseZIndex: 10000,
    bringToFront: () => {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `newZ`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const newZ = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        let newZ = 10000;
        set(state => {
            newZ = state.baseZIndex + 10;
            return { baseZIndex: newZ };
        });
        return newZ;
    }
}));
