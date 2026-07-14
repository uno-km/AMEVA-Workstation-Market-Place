"use strict";
/**
 * @file useProcessStore.ts
 * @system AMEVA OS Desktop Workstation - Global State Store
 * @location src/renderer/stores/useProcessStore.ts
 * @role Local model download queues & Document exporter progress Zustand Store
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 로컬 LLM 구동용 GGUF 모델들의 백그라운드 다운로드 진행 상황(downloadStatus), 대기열 큐 목록(downloadQueue)을 동적 보존한다.
 * - 마크다운 문서를 PDF/Word/hwp 등으로 내보내는 인쇄 트랜잭션의 진행률(exportProgress) 및 상태바 최소화 축소 여부(exportMinimized)를 통제한다.
 * - 멤버십 프로 플랜 활성화 상태(isProPlan, 로컬스토리지 연동) 및 무료 사용 일일제한 횟수 도달 가드 락(isFreeModeLocked) 상태를 유지한다.
 * - MCP(Model Context Protocol) 서버 인스턴스 어레이(mcpServersState) 및 활성화된 부가 플러그인 리스트(activePlugins)를 보존한다.
 * - 마크다운 에디터 화면(editorZoom) 및 가상 브라우저 패널(browserZoom)의 텍스트 확대 비율(배율 0.4x ~ 2.5x 범위 제한)을 조절한다.
 *
 * [책임이 아닌 것 - NON-RESPONSIBILITY]
 * - UI 오버레이 컴포넌트의 노출 여부 (useUIStore에서 전담).
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 에디터 줌 및 가상 브라우저 줌 수동 조절(`adjustEditorZoom`, `adjustBrowserZoom`) 액션 구동 시,
 *   화면 렌더 텍스트 붕괴 및 아웃오브바운드 붕괴를 막기 위해 **최소 0.4배(40%) ~ 최대 2.5배(250%)**의 하드 한계 배율(Math.min, Math.max) 가드 Invariant를 보존할 것.
 
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/hooks/): 도메인 훅 내부에서 상태 값 바인딩 및 변경 액션 호출 시 소비.
 * - 소비처 B (src/renderer/components/): 컴포넌트 내 렌더 조건 판단을 위해 실시간 구독(Subscribe) 소비.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProcessStore = exports.IDLE_EXPORT_PROGRESS = void 0;
/*
 * [IMPORT SEGMENTATION & CONTRACTS]
 * - create: Zustand 라이브러리의 불변 상태 트리 스토어 생성 빌더 API.
 */
const zustand_1 = require("zustand");
/**
 * 기본 내보내기 상태 (idle 상태 구조 객체 상수).
 */
exports.IDLE_EXPORT_PROGRESS = {
    phase: 'idle',
    format: '',
    percent: 0,
    message: ''
};
/**
 * 요금제 초기값: LocalStorage에서 안전하게 동기 복원하여 반환하는 헬퍼 함수.
 */
function loadIsProPlan() {
    try {
        return localStorage.getItem('is-pro-plan') === 'true';
    }
    catch (_a) {
        return false;
    }
}
/**
 * useProcessStore Zustand 스토어 본체 정의.
 */
exports.useProcessStore = (0, zustand_1.create)((set) => ({
    downloadStatus: null,
    setDownloadStatus: (status) => set((state) => ({ downloadStatus: typeof status === 'function' ? status(state.downloadStatus) : status })),
    downloadQueue: [],
    addDownloadToQueue: (item) => set((state) => ({ downloadQueue: [...state.downloadQueue, item] })),
    removeDownloadFromQueue: (id) => set((state) => ({
        downloadQueue: state.downloadQueue.filter((q) => q.id !== id)
    })),
    updateDownloadInQueue: (id, updates) => set((state) => ({
        downloadQueue: state.downloadQueue.map((q) => q.id === id ? Object.assign(Object.assign({}, q), updates) : q)
    })),
    clearCompletedDownloads: () => set((state) => ({
        downloadQueue: state.downloadQueue.filter((q) => q.status !== 'completed' && q.status !== 'error')
    })),
    exportProgress: exports.IDLE_EXPORT_PROGRESS,
    setExportProgress: (progress) => set({ exportProgress: progress }),
    updateExportProgress: (fields) => set((state) => ({
        exportProgress: Object.assign(Object.assign({}, state.exportProgress), fields)
    })),
    resetExportProgress: () => set({ exportProgress: exports.IDLE_EXPORT_PROGRESS }),
    exportMinimized: false,
    setExportMinimized: (val) => set({ exportMinimized: val }),
    toggleExportMinimized: () => set((state) => ({ exportMinimized: !state.exportMinimized })),
    isProPlan: loadIsProPlan(),
    setIsProPlan: (val) => set({ isProPlan: val }),
    isFreeModeLocked: false,
    setIsFreeModeLocked: (val) => set({ isFreeModeLocked: val }),
    mcpServersState: [],
    setMcpServersState: (servers) => set({ mcpServersState: servers }),
    activePlugins: [],
    setActivePlugins: (plugins) => set({ activePlugins: plugins }),
    editorZoom: 1.0,
    setEditorZoom: (val) => set({ editorZoom: val }),
    /**
     * [CONTRACT - Editor Zoom Adjust Action]
     * - Rationale: 배율 범위를 40% ~ 250%로 가드하고, 부동 소수점 오차 방지를 위해 소수점 첫째 자리에서 반올림 동기화한다.
     */
    adjustEditorZoom: (delta) => set((state) => {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `next`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const next = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const next = Math.min(2.5, Math.max(0.4, Math.round((state.editorZoom + delta) * 10) / 10));
        return { editorZoom: next };
    }),
    browserZoom: 1.0,
    setBrowserZoom: (val) => set({ browserZoom: val }),
    /**
     * [CONTRACT - Browser Zoom Adjust Action]
     * - Rationale: 배율 범위를 40% ~ 250%로 가드하고, 부동 소수점 오차 방지를 위해 소수점 첫째 자리에서 반올림 동기화한다.
     */
    adjustBrowserZoom: (delta) => set((state) => {
        /*
         * [RUN-TIME STATE / INVARIANT]
         * - 변수 명: `next`
         * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
         * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
         * - 예시 코드: `const next = ...` 형태로 안전 캐싱 후 가공 기동.
         */
        const next = Math.min(2.5, Math.max(0.4, Math.round((state.browserZoom + delta) * 10) / 10));
        return { browserZoom: next };
    })
}));
// MCP Circuit Breaker 연동
if (typeof window !== 'undefined') {
    window.addEventListener('mcp_circuit_breaker_open', () => {
        exports.useProcessStore.setState((state) => {
            const updatedServers = state.mcpServersState.map((server) => (Object.assign(Object.assign({}, server), { status: 'UNAVAILABLE' })));
            return { mcpServersState: updatedServers };
        });
    });
}
