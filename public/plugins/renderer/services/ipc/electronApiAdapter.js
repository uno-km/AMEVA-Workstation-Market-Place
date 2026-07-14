"use strict";
/**
 * @file electronApiAdapter.ts
 * @system AMEVA OS Desktop Workstation - IPC Integration Layer
 * @location src/renderer/services/ipc/electronApiAdapter.ts
 * @role IPC Bridge API single point of access & global Window type adapter
 *
 * [설계 의도 - DESIGN INTENT / ADR]
 * - Electron 보안 가이드라인(Context Isolation)에 따라 브라우저 렌더러는 Node.js API에 직접 접근할 수 없으며,
 *   오직 `preload.js` 가 window.electronAPI 에 주입해 둔 컨텍스트 브릿지 채널만 사용할 수 있다.
 * - 본 파일은 이 IPC 채널 함수들의 TypeScript `Window` 전역 인터페이스 타이핑 계약을 명세하고,
 *   하위 서브 어댑터 모듈들(llm, file, mcp, keychain 등)의 실제 구현체 훅/함수를 렌더러에 단일 게이트웨이로 통합 재배포(re-export)한다.
 *
 * [책임 범위 - RESPONSIBILITY]
 * - window.electronAPI 규격의 타입 선언.
 * - 서브 어댑터 파일들의 1:1 re-export 대리.
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 기존 export/import 호환성을 보장하기 위해 어댑터 하위 경로 파일들의 export문을 그대로 보존할 것.
 * - MUST NOT: 본 어댑터를 통하지 않는 ad-hoc window 캐스팅(`(window as any).electronAPI`) 사용을 지양하고 본 어댑터 인터페이스를 타깃할 것.
 
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBypassNativeContextMenu = setBypassNativeContextMenu;
exports.executeTerminal = executeTerminal;
function setBypassNativeContextMenu(bypass) {
    var _a;
    if ((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.setBypassNativeContextMenu) {
        window.electronAPI.setBypassNativeContextMenu(bypass);
    }
}
function executeTerminal(cmd, cwd) {
    var _a;
    if ((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.executeTerminal) {
        return window.electronAPI.executeTerminal(cmd, cwd);
    }
    return Promise.resolve({ stdout: '', stderr: 'Not in electron environment', newCwd: '' });
}
/*
 * [SUB-ADAPTER IMPLEMENTATIONS RE-EXPORTS CONTRACT]
 * - Rationale: 기존 임포트 경로가 깨지지 않도록 모든 구현 어댑터를 전수 배포 대행한다.
 */
__exportStar(require("./adapters/llmAdapter"), exports);
__exportStar(require("./adapters/fileAdapter"), exports);
__exportStar(require("./adapters/appAdapter"), exports);
__exportStar(require("./adapters/keychainAdapter"), exports);
__exportStar(require("./adapters/mcpAdapter"), exports);
__exportStar(require("./adapters/exportAdapter"), exports);
__exportStar(require("./adapters/sandboxAdapter"), exports);
__exportStar(require("./adapters/collabAdapter"), exports);
__exportStar(require("./adapters/sttAdapter"), exports);
