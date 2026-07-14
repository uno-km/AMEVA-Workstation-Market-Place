"use strict";
/**
 * @file mcpAdapter.ts
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/services/ipc/adapters/mcpAdapter.ts
 * @role Core module helper and integration logic
 *
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/App.tsx): AMEVA OS 최상위 마운트 레이어에서 의존성 로더로 연동 소비.
 * - 소비처 B (src/renderer/main.tsx): 렌더러 엔트리 라이프사이클의 기본 기능으로 수입 소비.
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
exports.mcpSpawn = mcpSpawn;
exports.mcpCall = mcpCall;
exports.mcpKill = mcpKill;
exports.mcpGetToken = mcpGetToken;
function mcpSpawn(serverId, command, args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.mcpSpawn`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.mcpSpawn)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.mcpSpawn))
            return null;
        return window.electronAPI.mcpSpawn(serverId, command, args);
    });
}
function mcpCall(serverId, request) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.mcpCall`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.mcpCall)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.mcpCall))
            return null;
        return window.electronAPI.mcpCall(serverId, request);
    });
}
function mcpKill(serverId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.mcpKill`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.mcpKill)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.mcpKill))
            return null;
        return window.electronAPI.mcpKill(serverId);
    });
}
function mcpGetToken() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.mcpGetToken`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.mcpGetToken)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.mcpGetToken))
            return null;
        return window.electronAPI.mcpGetToken();
    });
}
