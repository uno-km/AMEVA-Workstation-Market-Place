"use strict";
/**
 * @file SettingsTabAIEngine.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/settings/SettingsTabAIEngine.tsx
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
exports.SettingsTabAIEngine = SettingsTabAIEngine;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const aiSettings_1 = require("../../../shared/constants/aiSettings");
const WebLLMEngine_1 = require("../../services/ai/WebLLMEngine");
const WebCPUEngine_1 = require("../../services/ai/WebCPUEngine");
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTabAIEngine`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTabAIEngine(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTabAIEngine({ activeTab, aiSettings, onUpdateAISettings, gpuName }) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `activeTab !== 'AIEngine'`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (activeTab !== 'AIEngine')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (activeTab !== 'AIEngine')
        return null;
    const { apiType = 'wasm', apiProvider = 'gemini', apiEndpoint = '', apiModel = '', gpuOnly = true, temperature = 0.7, maxTokens = 1024, deepReasoning = false, maxAgentTurns = 10000, agentContextPoolSize = 32768 } = aiSettings;
    const [ollamaModels, setOllamaModels] = (0, react_1.useState)([]);
    const [isOllamaLoading, setIsOllamaLoading] = (0, react_1.useState)(false);
    /*
     * [FEAT-WEBGPU-STATE] WebGPU (WASM) 엔진 로딩 상태 및 진단 변수
     */
    const [wasmLoading, setWasmLoading] = (0, react_1.useState)(false);
    const [wasmProgressText, setWasmProgressText] = (0, react_1.useState)('');
    const [wasmLoaded, setWasmLoaded] = (0, react_1.useState)(() => WebLLMEngine_1.WebLLMEngine.getInstance().isModelLoaded());
    const [wasmDiagnostic, setWasmDiagnostic] = (0, react_1.useState)(null);
    const WEBGPU_CATALOG = [
        { label: 'Qwen2.5 1.5B Instruct (가장 빠름, 추천)', value: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC' },
        { label: 'Llama 3.2 1B Instruct (가벼움, 초고속)', value: 'Llama-3.2-1B-Instruct-q4f16_1-MLC' },
        { label: 'Llama 3.2 3B Instruct (정확성 우수)', value: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' },
        { label: 'Gemma 2 2B IT (구글 최신)', value: 'gemma-2-2b-it-q4f16_1-MLC' },
        { label: 'SmolLM2 1.7B Instruct (최경량 코딩/챗)', value: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC' },
    ];
    /*
     * [FIX-OLLAMA-STATE] Ollama 자동화 상태 변수 그룹
     * - ollamaInstalled: Ollama CLI 바이너리 설치 여부 (null=미확인, true=설치됨, false=미설치)
     * - ollamaServerStarting: ollama serve IPC 진행 중 플래그
     * - ollamaPulling: 현재 다운로드 중인 모델 이름 (없으면 null)
     * - ollamaPullPercent: 다운로드 진행률 (0~100)
     * - ollamaPullLog: 최신 다운로드 상태 텍스트
     */
    const [ollamaInstalled, setOllamaInstalled] = (0, react_1.useState)(null);
    const [ollamaServerStarting, setOllamaServerStarting] = (0, react_1.useState)(false);
    const [ollamaPulling, setOllamaPulling] = (0, react_1.useState)(null);
    const [installedModelNames, setInstalledModelNames] = (0, react_1.useState)([]);
    /*
     * [RUN-TIME STATE / INVARIANT]
     * - 변수 명: `downloadQueue`, `queueStatus`
     * - 자료형: string[], Record<string, { percent: number, log: string, status: 'queued' | 'downloading' }>
     * - 시나리오: 여러 개의 모델 다운로드 클릭 시 즉시 큐 대기열에 적재하고 순차적으로 풀(pull) 처리를 관리하는 시스템.
     */
    const [downloadQueue, setDownloadQueue] = (0, react_1.useState)([]);
    const [queueStatus, setQueueStatus] = (0, react_1.useState)({});
    const queueRef = (0, react_1.useRef)([]);
    const queueStatusRef = (0, react_1.useRef)({});
    (0, react_1.useEffect)(() => {
        queueRef.current = downloadQueue;
    }, [downloadQueue]);
    (0, react_1.useEffect)(() => {
        queueStatusRef.current = queueStatus;
    }, [queueStatus]);
    /*
     * [FEAT-OLLAMA-CATALOG] 다운로드 가능한 대표 모델 카탈로그 상수 (3종 × 3사이즈)
     * - 각 항목: { label, model, sizeMB } 형태
     * - 메인 프로세스의 ollama:pull-model IPC 채널로 다운로드를 실행한다.
     */
    const OLLAMA_CATALOG = [
        { group: 'Qwen 2.5', color: '#10b981', models: [
                { label: 'Qwen2.5 1.5B', model: 'qwen2.5:1.5b', sizeGb: '1.0GB' },
                { label: 'Qwen2.5 3B', model: 'qwen2.5:3b', sizeGb: '2.0GB' },
                { label: 'Qwen2.5 7B', model: 'qwen2.5:7b', sizeGb: '4.7GB' },
            ] },
        { group: 'Gemma 3', color: '#6366f1', models: [
                { label: 'Gemma3 1B', model: 'gemma3:1b', sizeGb: '0.9GB' },
                { label: 'Gemma3 2B', model: 'gemma3:2b', sizeGb: '1.9GB' },
                { label: 'Gemma3 8B', model: 'gemma3:8b', sizeGb: '5.1GB' },
            ] },
        { group: 'Llama', color: '#f59e0b', models: [
                { label: 'Llama3.2 1B', model: 'llama3.2:1b', sizeGb: '1.3GB' },
                { label: 'Llama3.2 3B', model: 'llama3.2:3b', sizeGb: '2.0GB' },
                { label: 'Llama3.1 8B', model: 'llama3.1:8b', sizeGb: '5.0GB' },
            ] },
    ];
    // WPU(CPU/GPU) 환경 자동 진단 및 싱글톤 로드 상태 실시간 매핑
    (0, react_1.useEffect)(() => {
        if (apiType === 'wasm') {
            WebLLMEngine_1.WebLLMEngine.getInstance().checkWebGPUSupport().then(res => {
                setWasmDiagnostic(res);
            });
            /*
             * [SIDE EFFECT / POLLING]
             * - 싱글톤인 WebLLMEngine/WebCPUEngine의 로딩 상태는 React 생명주기 외부에서 비동기로 완료됩니다.
             * - 따라서 0.5초 주기로 실제 로드 여부 및 현재 활성화된 모델 ID와 프리셋 매칭을 감시하여 배지를 실시간 동기화합니다.
             */
            const interval = setInterval(() => {
                const engine = gpuOnly ? WebLLMEngine_1.WebLLMEngine.getInstance() : WebCPUEngine_1.WebCPUEngine.getInstance();
                const engineLoaded = engine.isModelLoaded();
                const currentId = engine.getCurrentModelId();
                setWasmLoaded(engineLoaded && currentId === apiModel);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [apiType, apiModel, gpuOnly]);
    /**
     * [FEAT-WEBGPU-INIT] WebGPU 온디바이스 모델을 브라우저 캐시에 수동 로드/다운로드하는 핸들러
     */
    const handleLoadWebGPUModel = (modelIdToLoad) => __awaiter(this, void 0, void 0, function* () {
        setWasmLoading(true);
        setWasmProgressText('초기화 준비 중...');
        try {
            const success = gpuOnly
                ? yield WebLLMEngine_1.WebLLMEngine.getInstance().initModel(modelIdToLoad, (report) => {
                    setWasmProgressText(report.text);
                })
                : yield WebCPUEngine_1.WebCPUEngine.getInstance().initModel(modelIdToLoad, (report) => {
                    setWasmProgressText(report.text);
                });
            if (success) {
                setWasmLoaded(true);
                onUpdateAISettings({ apiModel: modelIdToLoad });
            }
        }
        catch (e) {
            /*
             * [ERROR HANDLING - EXCEPTION LOGGING]
             * - WPU 모델 다운로드/초기화 실패 시 에러 메시지를 로그로 기록하고 UI에 상태를 전파한다.
             * - e.message 접근 전 instanceof Error 타입 가드로 안전하게 메시지를 추출한다.
             */
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.error('[SettingsTabAIEngine] WPU 모델 로딩 실패:', errorMsg);
            setWasmProgressText(`로딩 실패: ${errorMsg}`);
        }
        finally {
            setWasmLoading(false);
        }
    });
    // 📥 [FEAT-OLLAMA-QUEUE] 다운로드 대기열 순차 처리기
    const triggerNextQueueDownload = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        const currentQueue = queueRef.current;
        if (currentQueue.length === 0)
            return;
        const nextModel = currentQueue[0];
        // 현재 진행 중인 다운로드 활성화
        setOllamaPulling(nextModel);
        setQueueStatus(prev => (Object.assign(Object.assign({}, prev), { [nextModel]: { percent: 0, log: '다운로드 준비 중...', status: 'downloading' } })));
        const eAPI = window.electronAPI;
        if (!(eAPI === null || eAPI === void 0 ? void 0 : eAPI.pullOllamaModel)) {
            setOllamaPulling(null);
            return;
        }
        try {
            const res = yield eAPI.pullOllamaModel(nextModel);
            if (res.success) {
                // 다운로드 완료 시 1초 후 대기열에서 제거하고 목록 갱신 및 후속 다운로드 트리거
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    setDownloadQueue(prev => prev.filter(m => m !== nextModel));
                    setQueueStatus(prev => {
                        const nextMap = Object.assign({}, prev);
                        delete nextMap[nextModel];
                        return nextMap;
                    });
                    setOllamaPulling(null);
                    // 모델 목록 갱신
                    try {
                        const tagsRes = yield fetch('http://127.0.0.1:11434/api/tags');
                        if (tagsRes.ok) {
                            const tagsData = yield tagsRes.json();
                            if (tagsData.models) {
                                setOllamaModels(tagsData.models);
                                setInstalledModelNames(tagsData.models.map((m) => m.name));
                            }
                        }
                    }
                    catch (err) {
                        console.error('모델 목록 자동 갱신 실패:', err);
                    }
                    // 재귀적 다음 다운로드 스케줄링
                    setTimeout(() => {
                        triggerNextQueueDownload();
                    }, 100);
                }), 1000);
            }
            else {
                console.error('[OllamaDownload] 실패:', res.error);
                handleQueueFailure(nextModel);
            }
        }
        catch (e) {
            console.error('[OllamaDownload] 예외:', e);
            handleQueueFailure(nextModel);
        }
    }), []);
    // 다운로드 중 오류 발생 시의 예외 대기열 건너뛰기
    const handleQueueFailure = (model) => {
        setDownloadQueue(prev => prev.filter(m => m !== model));
        setQueueStatus(prev => {
            const nextMap = Object.assign({}, prev);
            delete nextMap[model];
            return nextMap;
        });
        setOllamaPulling(null);
        // 실패하더라도 멈추지 않고 대기열 내 다음 모델로 진행
        setTimeout(() => {
            triggerNextQueueDownload();
        }, 500);
    };
    // 📥 [FEAT-OLLAMA-QUEUE] 사용자의 다운로드 버튼 클릭 시 대기열에 적재
    const handleAddToDownloadQueue = (0, react_1.useCallback)((model) => {
        if (installedModelNames.includes(model) || queueRef.current.includes(model)) {
            return;
        }
        setDownloadQueue(prev => {
            const nextQueue = [...prev, model];
            setQueueStatus(qs => (Object.assign(Object.assign({}, qs), { [model]: { percent: 0, log: '대기열 등록 완료 (대기 중...)', status: 'queued' } })));
            // 현재 다운로드 중인 모델이 없다면 즉시 트리거 개시
            if (!ollamaPulling) {
                setTimeout(() => {
                    triggerNextQueueDownload();
                }, 50);
            }
            return nextQueue;
        });
    }, [installedModelNames, ollamaPulling, triggerNextQueueDownload]);
    // apiType이 ollama로 진입할 때 설치 여부 자동 체크 및 모델 목록 조회
    (0, react_1.useEffect)(() => {
        if (apiType === 'ollama') {
            setIsOllamaLoading(true);
            /*
             * [FIX-OLLAMA-CHECK] 설치 여부를 IPC로 확인한다.
             * - checkOllamaInstalled() 미지원 환경(웹 등)이면 기존 fetch 방식을 폴백으로 사용한다.
             */
            const api = window.electronAPI;
            if (api === null || api === void 0 ? void 0 : api.checkOllamaInstalled) {
                api.checkOllamaInstalled()
                    .then(res => setOllamaInstalled(res.installed))
                    .catch(() => setOllamaInstalled(false));
            }
            // Ollama API에서 직접 모델 목록을 취득한다.
            fetch('http://127.0.0.1:11434/api/tags')
                .then(res => res.json())
                .then(data => {
                if (data.models && Array.isArray(data.models)) {
                    setOllamaModels(data.models);
                    setInstalledModelNames(data.models.map(m => m.name));
                    if (!apiModel && data.models.length > 0) {
                        onUpdateAISettings({ apiModel: data.models[0].name });
                    }
                }
            })
                .catch(err => {
                console.error('Ollama 모델 목록을 가져오는데 실패했습니다:', err);
                setOllamaModels([]);
            })
                .finally(() => setIsOllamaLoading(false));
            // pull 진행률 구독 등록
            if (api === null || api === void 0 ? void 0 : api.onOllamaPullProgress) {
                const unsub = api.onOllamaPullProgress((d) => {
                    // 대기열 세부 맵 정보 실시간 업데이트
                    setQueueStatus(prev => {
                        if (prev[d.modelName]) {
                            return Object.assign(Object.assign({}, prev), { [d.modelName]: Object.assign(Object.assign({}, prev[d.modelName]), { percent: d.percent, log: d.text, status: 'downloading' }) });
                        }
                        return prev;
                    });
                });
                return unsub;
            }
        }
    }, [apiType, triggerNextQueueDownload]);
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto', paddingRight: '4px' } },
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            React.createElement("div", { style: { borderBottom: '1px solid var(--border-muted)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.Cpu, { size: 14, color: "var(--primary)" }),
                React.createElement("h4", { style: { fontSize: '12.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' } }, "AI \uC5D4\uC9C4 \uBC0F \uC2E4\uD589 \uC720\uD615")),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' } }, "\uAE30\uBCF8 \uC2E4\uD589 \uBAA8\uB4DC"),
                React.createElement("select", { value: apiType, onChange: e => onUpdateAISettings({ apiType: e.target.value }), style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11.5px', outline: 'none'
                    } },
                    React.createElement("option", { value: "wasm" }, "\uB85C\uCEEC \uC6F9LM \uAC00\uC18D (\uBB34\uC124\uCE58, CPU/GPU)"),
                    React.createElement("option", { value: "local" }, "\uB85C\uCEEC \uACE0\uC131\uB2A5 \uC5D4\uC9C4 (llama-cli)"),
                    React.createElement("option", { value: "ollama" }, "\uB85C\uCEEC \uBC31\uADF8\uB77C\uC6B4\uB4DC \uC11C\uBE44\uC2A4 (Ollama)"),
                    React.createElement("option", { value: "api" }, "\uD074\uB77C\uC6B0\uB4DC \uC678\uBD80 API (OpenAI \uB4F1)")),
                React.createElement("p", { style: { fontSize: '9.5px', color: 'var(--text-muted)', margin: 0 } },
                    apiType === 'wasm' && '웹LM 모드를 사용하면 브라우저 내부에서 안전하게 로컬 모델(CPU/GPU)이 실행됩니다.',
                    apiType === 'local' && '사용자의 로컬 환경에 llama-cli를 구동하여 최대한의 고성능을 발휘합니다.',
                    apiType === 'ollama' && '백그라운드에 구동 중인 Ollama 서버를 통해 외부 통신 없이 실행합니다.',
                    apiType === 'api' && '보유하고 있는 API 키를 사용하여 강력한 클라우드 모델을 직접 호출합니다.')),
            apiType !== 'api' && (React.createElement("div", { style: { padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement("input", { type: "checkbox", id: "gpuOnly-checkbox", checked: gpuOnly, onChange: e => onUpdateAISettings({ gpuOnly: e.target.checked }), style: { accentColor: 'var(--primary)' } }),
                    React.createElement("label", { htmlFor: "gpuOnly-checkbox", style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' } }, "GPU \uC804\uC6A9 \uAC00\uC18D \uD65C\uC131\uD654 (\uAD8C\uC7A5)")),
                gpuName && (React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', marginLeft: '22px' } },
                    "\uAC10\uC9C0\uB41C \uADF8\uB798\uD53D \uC7A5\uCE58: ",
                    React.createElement("span", { style: { color: 'var(--secondary)', fontWeight: 'bold' } }, gpuName))),
                React.createElement("p", { style: { fontSize: '9.5px', color: 'var(--text-muted)', margin: '0 0 0 22px' } },
                    "\uD574\uC81C \uC2DC CPU \uBAA8\uB4DC\uB85C \uAE30\uB3D9\uB418\uC5B4 \uC18D\uB3C4\uAC00 \uD06C\uAC8C \uC800\uD558\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
                    apiType === 'local' && ' 로컬 고성능 엔진 사용 시 C:\\ameva\\llama\\llama-cli.exe 가 필요합니다.')))),
        apiType === 'api' && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'rgba(52, 211, 153, 0.03)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.Zap, { size: 14, color: "#34d399" }),
                React.createElement("h4", { style: { fontSize: '11.5px', fontWeight: 700, margin: 0, color: '#34d399' } }, "\uD074\uB77C\uC6B0\uB4DC \uC5F0\uB3D9")),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "API \uC81C\uACF5\uC0AC"),
                React.createElement("select", { value: apiProvider, onChange: e => onUpdateAISettings({ apiProvider: e.target.value }), style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                    } },
                    React.createElement("option", { value: "gemini" }, "Google Gemini (AI Studio)"),
                    React.createElement("option", { value: "openai" }, "OpenAI"),
                    React.createElement("option", { value: "anthropic" }, "Anthropic (Claude)"),
                    React.createElement("option", { value: "custom" }, "Custom (\uC9C1\uC811 \uC785\uB825)"))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "API \uBAA8\uB378\uBA85"),
                apiProvider === 'custom' ? (React.createElement("input", { type: "text", value: apiModel, onChange: e => onUpdateAISettings({ apiModel: e.target.value }), placeholder: "gpt-4o-mini | claude-3-5-sonnet", style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                    } })) : (React.createElement("select", { value: apiModel, onChange: e => onUpdateAISettings({ apiModel: e.target.value }), style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                    } }, (aiSettings_1.PROVIDER_MODELS[apiProvider] || []).map((m) => (React.createElement("option", { key: m.value, value: m.value }, m.label)))))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "Custom API \uC5D4\uB4DC\uD3EC\uC778\uD2B8"),
                React.createElement("input", { type: "text", value: apiEndpoint, onChange: e => onUpdateAISettings({ apiEndpoint: e.target.value }), disabled: apiProvider !== 'custom', placeholder: "https://api.openai.com/v1/chat/completions", style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: apiProvider === 'custom' ? 'var(--bg-glass)' : 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-muted)',
                        color: apiProvider === 'custom' ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: '11px', outline: 'none',
                        cursor: apiProvider === 'custom' ? 'text' : 'not-allowed'
                    } })),
            React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px' } },
                React.createElement(lucide_react_1.Shield, { size: 14, color: "var(--text-muted)", style: { marginTop: '2px', flexShrink: 0 } }),
                React.createElement("p", { style: { margin: 0, fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4' } },
                    "API Key\uB294 \uC88C\uCE21\uC758 ",
                    React.createElement("strong", null, "Credentials"),
                    " \uD0ED\uC5D0\uC11C \uC548\uC804\uD558\uAC8C \uC2DC\uC2A4\uD15C KeyChain\uC5D0 \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
                    apiProvider === 'anthropic' && React.createElement("span", { style: { color: 'var(--accent)', display: 'block', marginTop: '4px' } }, "\u26A0\uFE0F Anthropic \uACF5\uC2DD API\uB294 \uD5E4\uB354 \uADDC\uACA9\uC774 \uB2EC\uB77C \uC9C1\uC811 \uC5F0\uB3D9 \uC2DC \uC5D0\uB7EC\uAC00 \uB0A0 \uC218 \uC788\uC2B5\uB2C8\uB2E4. OpenRouter \uD504\uB85D\uC2DC \uC0AC\uC6A9\uC744 \uAD8C\uC7A5\uD569\uB2C8\uB2E4."))))),
        apiType === 'wasm' && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.Cpu, { size: 14, color: "#a855f7" }),
                React.createElement("h4", { style: { fontSize: '11.5px', fontWeight: 700, margin: 0, color: '#a855f7' } }, gpuOnly ? '웹LM (WebGPU 가속) 온디바이스 AI (@mlc-ai/web-llm)' : '웹LM (Wasm CPU) 온디바이스 AI (폴백 런타임)'),
                React.createElement("span", { style: { marginLeft: 'auto', fontSize: '9.5px', padding: '2px 8px', borderRadius: '99px',
                        background: wasmLoaded ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: wasmLoaded ? '#10b981' : '#f59e0b', fontWeight: 700 } }, wasmLoaded ? (gpuOnly ? '⚡ GPU 캐시 로드됨 (준비 완료)' : '🟢 CPU Wasm 가동 중 (준비 완료)') : '⏳ 미초기화 / 다운로드 필요')),
            gpuOnly && wasmDiagnostic && (React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'center', background: wasmDiagnostic.supported ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${wasmDiagnostic.supported ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` } },
                wasmDiagnostic.supported ? React.createElement(lucide_react_1.CheckCircle2, { size: 14, color: "#10b981" }) : React.createElement(lucide_react_1.AlertCircle, { size: 14, color: "#ef4444" }),
                React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-main)', lineHeight: '1.4' } },
                    React.createElement("strong", { style: { display: 'block', color: wasmDiagnostic.supported ? '#10b981' : '#ef4444' } }, wasmDiagnostic.supported ? '웹LM (WebGPU 가속) 사용 가능' : '웹LM (WebGPU) 진단 알림'),
                    React.createElement("span", null, wasmDiagnostic.message)))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "\uC6F9LM \uC628\uB514\uBC14\uC774\uC2A4 \uBAA8\uB378 \uD504\uB9AC\uC14B \uC120\uD0DD"),
                React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                    React.createElement("select", { value: WEBGPU_CATALOG.some(m => m.value === apiModel) ? apiModel : WEBGPU_CATALOG[0].value, onChange: e => {
                            onUpdateAISettings({ apiModel: e.target.value });
                            const engine = gpuOnly ? WebLLMEngine_1.WebLLMEngine.getInstance() : WebCPUEngine_1.WebCPUEngine.getInstance();
                            setWasmLoaded(engine.isModelLoaded() && engine.getCurrentModelId() === e.target.value);
                        }, disabled: wasmLoading, style: {
                            flex: 1, padding: '8px 10px', borderRadius: '6px',
                            background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                            color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                        } }, WEBGPU_CATALOG.map(m => (React.createElement("option", { key: m.value, value: m.value },
                        m.label,
                        " (",
                        m.value,
                        ")")))),
                    React.createElement("button", { type: "button", onClick: () => {
                            const modelToLoad = WEBGPU_CATALOG.some(m => m.value === apiModel) ? apiModel : WEBGPU_CATALOG[0].value;
                            handleLoadWebGPUModel(modelToLoad);
                        }, disabled: wasmLoading || (gpuOnly && !(wasmDiagnostic === null || wasmDiagnostic === void 0 ? void 0 : wasmDiagnostic.supported)), style: {
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '0 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                            background: wasmLoading ? 'var(--border-muted)' : '#a855f7',
                            color: '#fff', border: 'none', cursor: wasmLoading ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap', transition: 'all 0.15s'
                        } },
                        React.createElement(lucide_react_1.HardDriveDownload, { size: 13 }),
                        wasmLoading ? '초기화 중...' : (wasmLoaded ? '다시 로드' : '모델 다운로드/로드')))),
            wasmProgressText && (React.createElement("div", { style: { padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-muted)' } },
                React.createElement("div", { style: { fontSize: '10px', color: '#a855f7', fontWeight: 600, marginBottom: '2px' } }, wasmLoading ? '🔄 처리 중...' : 'ℹ️ 최근 로딩 상태'),
                React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' } }, wasmProgressText))),
            React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px' } },
                React.createElement(lucide_react_1.Shield, { size: 14, color: "var(--text-muted)", style: { marginTop: '2px', flexShrink: 0 } }),
                React.createElement("p", { style: { margin: 0, fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4' } },
                    React.createElement("strong", null, "100% \uC644\uC804 \uB3C5\uB9BD \uC791\uB3D9:"),
                    " Llama.cpp \uB124\uC774\uD2F0\uBE0C \uBC14\uC774\uB108\uB9AC\uB098 Ollama \uC11C\uBC84\uAC00 \uD544\uC694\uD558\uC9C0 \uC54A\uC73C\uBA70, \uADF8\uB798\uD53D \uCE74\uB4DC\uC758 VRAM \uBC0F \uC170\uC774\uB354\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBE0C\uB77C\uC6B0\uC800 \uB80C\uB354\uB7EC \uB0B4\uBD80\uC5D0\uC11C \uB3C5\uB9BD \uCD94\uB860\uD569\uB2C8\uB2E4. \uB2E4\uC6B4\uB85C\uB4DC\uB41C \uBAA8\uB378\uC740 \uBE0C\uB77C\uC6B0\uC800 Cache Storage\uC5D0 \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uB429\uB2C8\uB2E4.")))),
        apiType === 'ollama' && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.Server, { size: 14, color: "#3b82f6" }),
                React.createElement("h4", { style: { fontSize: '11.5px', fontWeight: 700, margin: 0, color: '#3b82f6' } }, "Ollama \uB85C\uCEEC \uC5F0\uB3D9"),
                ollamaInstalled !== null && (React.createElement("span", { style: { marginLeft: 'auto', fontSize: '9.5px', padding: '2px 8px', borderRadius: '99px',
                        background: ollamaInstalled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: ollamaInstalled ? '#10b981' : '#ef4444', fontWeight: 700 } }, ollamaInstalled ? '✅ 설치됨' : '❌ 미설치'))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "\uC11C\uBC84 \uC5D4\uB4DC\uD3EC\uC778\uD2B8"),
                React.createElement("input", { type: "text", value: apiEndpoint, onChange: e => onUpdateAISettings({ apiEndpoint: e.target.value }), placeholder: "http://127.0.0.1:11434", style: {
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                    } })),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement("label", { style: { fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' } }, "\uC0AC\uC6A9\uD560 \uBAA8\uB378 \uC120\uD0DD"),
                React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                    React.createElement("select", { value: apiModel, onChange: e => onUpdateAISettings({ apiModel: e.target.value }), disabled: isOllamaLoading || ollamaModels.length === 0, style: {
                            flex: 1, padding: '8px 10px', borderRadius: '6px',
                            background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                            color: 'var(--text-main)', fontSize: '11px', outline: 'none'
                        } }, isOllamaLoading ? (React.createElement("option", { value: "" }, "\uBAA8\uB378 \uBD88\uB7EC\uC624\uB294 \uC911...")) : ollamaModels.length > 0 ? (React.createElement(React.Fragment, null,
                        React.createElement("option", { value: "", disabled: true }, "\uBAA8\uB378\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694"),
                        ollamaModels.map(m => (React.createElement("option", { key: m.name, value: m.name }, m.name))))) : (React.createElement("option", { value: "" }, "\uC124\uCE58\uB41C \uBAA8\uB378 \uC5C6\uC74C"))),
                    React.createElement("button", { onClick: () => __awaiter(this, void 0, void 0, function* () {
                            setIsOllamaLoading(true);
                            try {
                                const res = yield fetch((apiEndpoint || 'http://127.0.0.1:11434') + '/api/tags');
                                if (!res.ok)
                                    throw new Error('Ollama 서버 응답 없음');
                                const data = yield res.json();
                                if (data.models) {
                                    setOllamaModels(data.models);
                                    setInstalledModelNames(data.models.map(m => m.name));
                                }
                            }
                            catch (e) {
                                console.error('Ollama 연결 실패:', e);
                            }
                            finally {
                                setIsOllamaLoading(false);
                            }
                        }), style: { padding: '0 12px', background: 'var(--bg-glass-active)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '11px', cursor: 'pointer' } }, "\uC0C8\uB85C\uACE0\uCE68")),
                ollamaModels.length === 0 && !isOllamaLoading && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px' } },
                    React.createElement("p", { style: { margin: 0, fontSize: '10px', color: '#ef4444', fontWeight: 600 } }, "\u26A0\uFE0F Ollama \uC11C\uBC84\uAC00 \uC751\uB2F5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
                    React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                        React.createElement("button", { disabled: ollamaServerStarting, onClick: () => __awaiter(this, void 0, void 0, function* () {
                                setOllamaServerStarting(true);
                                try {
                                    const eAPI = window.electronAPI;
                                    if (eAPI === null || eAPI === void 0 ? void 0 : eAPI.startOllamaServer) {
                                        yield eAPI.startOllamaServer();
                                    }
                                    // 기동 후 모델 목록 재조회
                                    const res = yield fetch((apiEndpoint || 'http://127.0.0.1:11434') + '/api/tags');
                                    if (res.ok) {
                                        const data = yield res.json();
                                        if (data.models) {
                                            setOllamaModels(data.models);
                                            setInstalledModelNames(data.models.map(m => m.name));
                                        }
                                    }
                                }
                                catch (e) {
                                    console.error('Ollama 서버 시작 실패:', e);
                                }
                                finally {
                                    setOllamaServerStarting(false);
                                }
                            }), style: {
                                padding: '6px 12px', background: 'rgba(59,130,246,0.15)',
                                border: '1px solid rgba(59,130,246,0.4)', borderRadius: '6px',
                                color: ollamaServerStarting ? 'var(--text-muted)' : '#3b82f6',
                                fontSize: '10.5px', cursor: ollamaServerStarting ? 'not-allowed' : 'pointer', fontWeight: 600
                            } }, ollamaServerStarting ? '⏳ 기동 중...' : '▶ Ollama 서버 자동 시작'),
                        React.createElement("p", { style: { margin: 'auto 0', fontSize: '9.5px', color: 'var(--text-muted)' } },
                            "\uB610\uB294 \uD130\uBBF8\uB110\uC5D0\uC11C ",
                            React.createElement("code", null, "ollama serve"),
                            "\uB97C \uC2E4\uD589\uD558\uC138\uC694."))))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-muted)', paddingTop: '10px' } },
                    React.createElement("span", { style: { fontSize: '10.5px', fontWeight: 700, color: 'var(--text-main)' } }, "\uD83D\uDCE6 \uBAA8\uB378 \uCE74\uD0C8\uB85C\uADF8 \u2014 \uC6D0\uD074\uB9AD \uB2E4\uC6B4\uB85C\uB4DC")),
                downloadQueue.length > 0 && (React.createElement("div", { style: { padding: '10px 12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                    React.createElement("span", { style: { fontSize: '10.5px', color: '#6366f1', fontWeight: 700 } },
                        "\uD83D\uDCE5 \uBAA8\uB378 \uB2E4\uC6B4\uB85C\uB4DC \uB300\uAE30\uC5F4 \uAD00\uB9AC (",
                        downloadQueue.length,
                        "\uAC1C \uBAA8\uB378)"),
                    downloadQueue.map((qModel, idx) => {
                        const info = queueStatus[qModel];
                        const isCurrent = qModel === ollamaPulling;
                        const percent = info ? info.percent : 0;
                        const logText = info ? info.log : '대기 중...';
                        return (React.createElement("div", { key: qModel, style: { padding: '6px 8px', background: isCurrent ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.3)' : 'var(--border-muted)'}`, borderRadius: '6px' } },
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } },
                                React.createElement("span", { style: { fontSize: '10px', color: isCurrent ? '#818cf8' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 500 } },
                                    idx + 1,
                                    ". ",
                                    isCurrent ? '▶ 다운로드 중' : '⏳ 대기 중',
                                    ": ",
                                    qModel),
                                React.createElement("span", { style: { fontSize: '10px', color: isCurrent ? '#818cf8' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' } },
                                    percent,
                                    "%")),
                            isCurrent && (React.createElement(React.Fragment, null,
                                React.createElement("div", { style: { height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' } },
                                    React.createElement("div", { style: { height: '100%', width: `${percent}%`, background: '#6366f1', borderRadius: '99px', transition: 'width 0.3s ease' } })),
                                logText && (React.createElement("p", { style: { margin: '4px 0 0', fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, logText))))));
                    }))),
                OLLAMA_CATALOG.map(group => (React.createElement("div", { key: group.group, style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                    React.createElement("span", { style: { fontSize: '9.5px', fontWeight: 700, color: group.color, letterSpacing: '0.04em', textTransform: 'uppercase' } }, group.group),
                    React.createElement("div", { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, group.models.map(m => {
                        const isInstalled = installedModelNames.includes(m.model);
                        const isQueued = downloadQueue.includes(m.model) && ollamaPulling !== m.model;
                        const isPulling = ollamaPulling === m.model;
                        const statusInfo = queueStatus[m.model];
                        const percent = statusInfo ? statusInfo.percent : 0;
                        const isDisabled = isInstalled || isQueued || isPulling;
                        let buttonLabel = `⬇ ${m.label} (${m.sizeGb})`;
                        if (isInstalled) {
                            buttonLabel = `✅ ${m.label}`;
                        }
                        else if (isQueued) {
                            buttonLabel = `⏳ 대기 중 (${m.label})`;
                        }
                        else if (isPulling) {
                            buttonLabel = `⬇️ 다운로드 중 ${percent}% (${m.label})`;
                        }
                        return (React.createElement("button", { key: m.model, disabled: isDisabled, onClick: () => handleAddToDownloadQueue(m.model), style: {
                                padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                background: isInstalled
                                    ? 'rgba(16,185,129,0.12)'
                                    : isQueued
                                        ? 'rgba(245,158,11,0.08)'
                                        : isPulling
                                            ? 'rgba(99,102,241,0.2)'
                                            : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isInstalled
                                    ? 'rgba(16,185,129,0.4)'
                                    : isQueued
                                        ? 'rgba(245,158,11,0.35)'
                                        : isPulling
                                            ? 'rgba(99,102,241,0.5)'
                                            : 'var(--border-muted)'}`,
                                color: isInstalled
                                    ? '#10b981'
                                    : isQueued
                                        ? '#f59e0b'
                                        : isPulling
                                            ? '#6366f1'
                                            : 'var(--text-main)',
                                transition: 'all 0.15s'
                            } }, buttonLabel));
                    })))))),
            React.createElement("div", { style: { display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px' } },
                React.createElement(lucide_react_1.ExternalLink, { size: 14, color: "var(--text-muted)", style: { marginTop: '2px', flexShrink: 0 } }),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                    React.createElement("p", { style: { margin: 0, fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4' } }, "\uCD94\uAC00 \uBAA8\uB378\uC740 Ollama \uACF5\uC2DD \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0\uC11C \uAC80\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("a", { href: "https://ollama.com/library", target: "_blank", rel: "noreferrer", style: { fontSize: '9.5px', color: '#3b82f6', textDecoration: 'none' } }, "Ollama \uACF5\uC2DD \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0\uC11C \uBAA8\uB378 \uCC3E\uAE30 \u2192"))))),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            React.createElement("div", { style: { borderBottom: '1px solid var(--border-muted)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.SlidersHorizontal, { size: 14, color: "var(--primary)" }),
                React.createElement("h4", { style: { fontSize: '12.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' } }, "\uCD9C\uB825 \uD30C\uB77C\uBBF8\uD130 \uD29C\uB2DD")),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-muted)' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                        React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' } }, "Temperature (\uCC3D\uC758\uC131)"),
                        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: 'var(--primary)' } }, temperature.toFixed(1))),
                    React.createElement("input", { type: "range", min: "0", max: "1", step: "0.1", value: temperature, onChange: e => onUpdateAISettings({ temperature: parseFloat(e.target.value) }), style: { width: '100%', accentColor: 'var(--primary)' } }),
                    React.createElement("p", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '4px 0 0 0' } }, "\uAC12\uC774 \uB192\uC744\uC218\uB85D \uB2E4\uC591\uD558\uACE0 \uCC3D\uC758\uC801\uC778 \uB2F5\uBCC0\uC774, \uB0AE\uC744\uC218\uB85D \uC77C\uAD00\uB418\uACE0 \uC815\uC81C\uB41C \uB2F5\uBCC0\uC774 \uCD9C\uB825\uB429\uB2C8\uB2E4.")),
                React.createElement("div", { style: { marginTop: '12px', borderTop: '1px solid var(--border-muted)', paddingTop: '12px' } },
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                        React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' } }, "Max Tokens (\uCD5C\uB300 \uAE38\uC774)"),
                        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: 'var(--primary)' } }, maxTokens)),
                    React.createElement("input", { type: "range", min: "128", max: "4096", step: "128", value: maxTokens, onChange: e => onUpdateAISettings({ maxTokens: parseInt(e.target.value) }), style: { width: '100%', accentColor: 'var(--primary)' } }),
                    React.createElement("p", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '4px 0 0 0' } }, "\uBAA8\uB378\uC774 \uD55C \uBC88\uC5D0 \uCD9C\uB825\uD560 \uC218 \uC788\uB294 \uCD5C\uB300 \uB2E8\uC5B4(\uD1A0\uD070) \uC218\uB97C \uC81C\uD55C\uD569\uB2C8\uB2E4.")))),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' } },
                React.createElement("span", { style: { fontSize: '14px' } }, "\uD83E\uDDE0"),
                React.createElement("h4", { style: { fontSize: '12.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' } }, "\uB525 \uB9AC\uC988\uB2DD (Agent Orchestrator)")),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-muted)' } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                    React.createElement("div", null,
                        React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', display: 'block' } }, "\uB525 \uB9AC\uC988\uB2DD \uBAA8\uB4DC"),
                        React.createElement("p", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '3px 0 0 0' } },
                            "\uD65C\uC131\uD654 \uC2DC AgentOrchestrator\uAC00 \uAD6C\uB3D9\uB429\uB2C8\uB2E4. ",
                            '<thought>',
                            "/",
                            '<tool_call>',
                            " \uD0DC\uADF8 \uAE30\uBC18 ReAct \uB8E8\uD504\uB97C \uC218\uD589\uD558\uBA70 \uB3C4\uAD6C\uB97C \uC790\uC728\uC801\uC73C\uB85C \uC2E4\uD589\uD569\uB2C8\uB2E4.")),
                    React.createElement("div", { role: "switch", "aria-checked": deepReasoning, tabIndex: 0, onClick: () => onUpdateAISettings({ deepReasoning: !deepReasoning }), onKeyDown: (e) => e.key === 'Enter' && onUpdateAISettings({ deepReasoning: !deepReasoning }), style: {
                            width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer',
                            background: deepReasoning ? 'var(--primary)' : 'var(--border-muted)',
                            position: 'relative', transition: 'background 0.2s ease',
                            flexShrink: 0, marginLeft: '12px'
                        } },
                        React.createElement("div", { style: {
                                width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: '3px',
                                left: deepReasoning ? '21px' : '3px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            } }))),
                React.createElement("div", { style: { borderTop: '1px solid var(--border-muted)', paddingTop: '12px', opacity: deepReasoning ? 1 : 0.4, pointerEvents: deepReasoning ? 'auto' : 'none', transition: 'opacity 0.2s' } },
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                        React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' } }, "\uCD5C\uB300 \uC5D0\uC774\uC804\uD2B8 \uD134 \uC218"),
                        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' } }, maxAgentTurns >= 10000 ? '∞ (무제한)' : maxAgentTurns.toLocaleString())),
                    React.createElement("input", { id: "agent-max-turns", type: "range", min: "1", max: "10000", step: "100", value: maxAgentTurns, onChange: e => onUpdateAISettings({ maxAgentTurns: parseInt(e.target.value) }), style: { width: '100%', accentColor: 'var(--primary)' } }),
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between' } },
                        React.createElement("p", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '4px 0 0 0' } }, "ReAct \uB8E8\uD504\uC758 \uCD5C\uB300 \uBC18\uBCF5 \uD69F\uC218. 10,000 = \uC0AC\uC2E4\uC0C1 \uBB34\uC81C\uD55C (\uCEE8\uD14D\uC2A4\uD2B8 \uD480 \uAC00\uB4DC\uB808\uC77C\uC774 \uC6B0\uC120 \uC801\uC6A9)."),
                        React.createElement("span", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '4px 0 0 0', whiteSpace: 'nowrap' } }, "\uAE30\uBCF8: 10,000"))),
                React.createElement("div", { style: { borderTop: '1px solid var(--border-muted)', paddingTop: '12px', opacity: deepReasoning ? 1 : 0.4, pointerEvents: deepReasoning ? 'auto' : 'none', transition: 'opacity 0.2s' } },
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                        React.createElement("label", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' } }, "\uCEE8\uD14D\uC2A4\uD2B8 \uD480 \uD06C\uAE30"),
                        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' } },
                            (agentContextPoolSize / 1000).toFixed(1),
                            "K \uD1A0\uD070")),
                    React.createElement("input", { id: "agent-context-pool", type: "range", min: "4096", max: "131072", step: "4096", value: agentContextPoolSize, onChange: e => onUpdateAISettings({ agentContextPoolSize: parseInt(e.target.value) }), style: { width: '100%', accentColor: 'var(--primary)' } }),
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between' } },
                        React.createElement("p", { style: { fontSize: '9px', color: 'var(--text-muted)', margin: '4px 0 0 0' } }, "\uCEE8\uD14D\uC2A4\uD2B8 \uD480 \uCD08\uACFC \uC2DC \uB8E8\uD504\uAC00 \uC790\uB3D9 \uC885\uB8CC\uB429\uB2C8\uB2E4. 7B \uBAA8\uB378 \uAD8C\uC7A5: 32,768 \uD1A0\uD070."),
                        React.createElement("div", { style: { display: 'flex', gap: '4px', marginTop: '4px' } }, [8192, 16384, 32768, 65536].map((v) => (React.createElement("button", { key: v, onClick: () => onUpdateAISettings({ agentContextPoolSize: v }), style: {
                                fontSize: '9px', padding: '1px 5px', borderRadius: '4px', cursor: 'pointer',
                                background: agentContextPoolSize === v ? 'var(--primary)' : 'var(--bg-glass)',
                                color: agentContextPoolSize === v ? '#fff' : 'var(--text-muted)',
                                border: '1px solid var(--border-muted)', transition: 'all 0.15s'
                            } }, v >= 1000 ? `${(v / 1024).toFixed(0)}K` : v))))))))));
}
