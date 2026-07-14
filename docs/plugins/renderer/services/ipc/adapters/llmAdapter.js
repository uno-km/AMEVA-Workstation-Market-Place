"use strict";
/**
 * @file llmAdapter.ts
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/services/ipc/adapters/llmAdapter.ts
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
exports.llmGenerate = llmGenerate;
exports.llmAbort = llmAbort;
exports.onLLMToken = onLLMToken;
exports.onLLMDone = onLLMDone;
exports.onLLMLog = onLLMLog;
exports.llmGetLogs = llmGetLogs;
exports.llmAddLog = llmAddLog;
exports.llmCheckHealth = llmCheckHealth;
exports.llmListModels = llmListModels;
exports.llmImportModel = llmImportModel;
exports.onModelDownloadProgress = onModelDownloadProgress;
exports.llmDownloadModel = llmDownloadModel;
exports.onLLMDownloadProgress = onLLMDownloadProgress;
exports.llmRestart = llmRestart;
exports.llmStart = llmStart;
exports.llmStop = llmStop;
exports.llmGetGpuName = llmGetGpuName;
function llmGenerate(params) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!window.electronAPI) {
            return { success: false, error: 'Electron API not available' };
        }
        return window.electronAPI.llmGenerate(params);
    });
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `llmAbort`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `llmAbort(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function llmAbort(sessionId) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!window.electronAPI)
        return;
    window.electronAPI.llmAbort(sessionId);
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `onLLMToken`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `onLLMToken(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function onLLMToken(sessionId, callback) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI) return (`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI) return ()` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!window.electronAPI)
        return () => { };
    return window.electronAPI.onLLMToken(sessionId, callback);
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `onLLMDone`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `onLLMDone(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function onLLMDone(sessionId, callback) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI) return (`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI) return ()` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!window.electronAPI)
        return () => { };
    return window.electronAPI.onLLMDone(sessionId, callback);
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `onLLMLog`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `onLLMLog(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function onLLMLog(callback) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI) return (`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI) return ()` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!window.electronAPI)
        return () => { };
    return window.electronAPI.onLLMLog(callback);
}
function llmGetLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmGetLogs`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmGetLogs)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmGetLogs))
            return '';
        try {
            return yield window.electronAPI.llmGetLogs();
        }
        catch (e) {
            console.error('[llmGetLogs] 로그 조회 실패:', e);
            return '';
        }
    });
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `llmAddLog`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `llmAddLog(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function llmAddLog(data) {
    var _a;
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI?.llmAddLog`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI?.llmAddLog)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmAddLog))
        return;
    window.electronAPI.llmAddLog(data);
}
function llmCheckHealth() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmCheckHealth`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmCheckHealth)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmCheckHealth)) {
            return { status: 'error', message: 'API not available' };
        }
        try {
            return yield window.electronAPI.llmCheckHealth();
        }
        catch (e) {
            console.error('[llmCheckHealth] 헬스 체크 실패:', e);
            return { status: 'error' };
        }
    });
}
function llmListModels(type) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!window.electronAPI)
            return [];
        try {
            return yield window.electronAPI.llmListModels(type);
        }
        catch (e) {
            console.error('[llmListModels] 모델 목록 조회 실패:', e);
            return [];
        }
    });
}
function llmImportModel(sourcePath) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!window.electronAPI)
            return { success: false, error: 'API not available' };
        return window.electronAPI.llmImportModel(sourcePath);
    });
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `onModelDownloadProgress`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `onModelDownloadProgress(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function onModelDownloadProgress(callback) {
    var _a;
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI?.onModelDownloadProgress) return (`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI?.onModelDownloadProgress) return ()` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.onModelDownloadProgress))
        return () => { };
    return window.electronAPI.onModelDownloadProgress(callback);
}
function llmDownloadModel(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmDownloadModel`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmDownloadModel)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmDownloadModel)) {
            return { success: false, error: 'API not available' };
        }
        return window.electronAPI.llmDownloadModel(payload);
    });
}
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `onLLMDownloadProgress`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `onLLMDownloadProgress(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function onLLMDownloadProgress(callback) {
    var _a;
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!window.electronAPI?.onLLMDownloadProgress) return (`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!window.electronAPI?.onLLMDownloadProgress) return ()` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.onLLMDownloadProgress))
        return () => { };
    return window.electronAPI.onLLMDownloadProgress(callback);
}
function llmRestart() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmRestart`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmRestart)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmRestart)) {
            return { success: false, error: 'API not available' };
        }
        return window.electronAPI.llmRestart();
    });
}
function llmStart(modelPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmStart`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmStart)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmStart)) {
            return { success: false, error: 'API not available' };
        }
        return window.electronAPI.llmStart(modelPath);
    });
}
function llmStop() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmStop`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmStop)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmStop))
            return;
        return window.electronAPI.llmStop();
    });
}
function llmGetGpuName() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `!window.electronAPI?.llmGetGpuName`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (!window.electronAPI?.llmGetGpuName)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.llmGetGpuName))
            return '';
        return window.electronAPI.llmGetGpuName();
    });
}
