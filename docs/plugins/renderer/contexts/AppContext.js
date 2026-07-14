"use strict";
/**
 * @file AppContext.tsx
 * @system AMEVA OS Desktop Workstation - Client Renderer
 * @location src/renderer/contexts/AppContext.tsx
 * @role Application global context provider & consumer adapter (React Context)
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 리액트 Context API를 활용하여, 루트 노드(App.tsx)에서 조립된 전역 컨트롤러 메서드와 공용 설정들을 리프 뷰 노드까지 전달 전파한다.
 * - 에디터 조작(editor, editorMode), 파일 I/O(handleSaveFile 등), 히스토리 백업(snapshots), 실시간 협업(peers, ydoc), Yjs 채팅(chatMessages), MCP 서버 정보의 전달 통로로 기능한다.
 * - 컨텍스트 범위 외 호출 예외 가드(`useAppContext`)를 제공한다.
 *
 * [책임이 아닌 것 - NON-RESPONSIBILITY]
 * - 전역 상태를 직접 메모리에 수록 관리 (Zustand 스토어들에 책임을 위임).
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: `useAppContext` 호출 시 컨텍스트 바인딩이 누락되어 `null`이 잡히는 경우,
 *   런타임 NPE(NullPointerException) 오작동을 차단하기 위해 반드시 `'useAppContext must be used within an AppProvider'` 예외를 throw 하도록 가드 계약을 유지할 것.
 
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/App.tsx): AMEVA OS 최상위 마운트 레이어에서 의존성 로더로 연동 소비.
 * - 소비처 B (src/renderer/main.tsx): 렌더러 엔트리 라이프사이클의 기본 기능으로 수입 소비.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContext = void 0;
exports.AppProvider = AppProvider;
exports.useAppContext = useAppContext;
/*
 * [IMPORT SEGMENTATION & CONTRACTS]
 * - React, createContext, useContext: 전역 컨텍스트를 선언하고 하위 자식 노드에서 꺼내 쓰기 위한 React 코어 API.
 */
const react_1 = __importStar(require("react"));
/**
 * AppContext 전역 공유 저장소 선언 (초기값 null).
 */
exports.AppContext = (0, react_1.createContext)(null);
/**
 * @component AppProvider
 * @description Context.Provider의 가독성을 높이고 하위 Children 트리를 감싸는 전송 노드 컴포넌트.
 */
function AppProvider({ 
/*
 * [PROPERTY MAPPINGS]
 * - children: 하위 리프 레이아웃 컴포넌트 트리.
 * - value: 조립된 AppContextType 사양 개체.
 */
children, value }) {
    return (react_1.default.createElement(exports.AppContext.Provider, { value: value }, children));
}
/**
 * @hook useAppContext
 * @description 하위 컴포넌트에서 Context API에 접근하여 value 값을 안전하게 꺼내 쓰는 훅.
 */
function useAppContext() {
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `context`
     * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
     * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
     * - 예시 코드: `const context = ...` 형태로 안전 캐싱 후 가공 기동.
     */
    const context = (0, react_1.useContext)(exports.AppContext);
    // CONTRACT: null 검사 예외 가드 작동 계약 준수
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
