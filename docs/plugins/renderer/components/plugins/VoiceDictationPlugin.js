"use strict";
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
exports.VoiceDictationPlugin = VoiceDictationPlugin;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const useLLMInference_1 = require("../../hooks/ai/useLLMInference");
function VoiceDictationPlugin() {
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [transcript, setTranscript] = (0, react_1.useState)('');
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const { generate } = (0, useLLMInference_1.useLLMInference)();
    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setIsProcessing(true);
            const rawText = '이 프로젝트의 마켓플레이스 기능은 10개로 기획되었고, 모두 로컬 오프라인 엣지 환경에서 구동 가능하도록 설계되어야 합니다. React 상태 관리 이슈는 다음 스프린트에서 해결합시다.';
            setTranscript('');
            generate(`다음 회의 내용을 마크다운 형태로 요약해줘:\n\n${rawText}`, (token) => {
                setTranscript(prev => prev + token);
            }, 'You are a helpful assistant that summarizes meeting notes in markdown.').then(() => {
                setIsProcessing(false);
            }).catch(err => {
                setTranscript(`[오류 발생] ${err.message}`);
                setIsProcessing(false);
            });
        }
        else {
            setIsRecording(true);
            setTranscript('');
        }
    };
    const handleInsert = () => {
        alert('에디터에 회의록이 삽입되었습니다!');
    };
    return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', padding: '2px' } },
        react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 8px' } },
            react_1.default.createElement("div", { style: { background: 'linear-gradient(135deg, #14b8a6, #0d9488)', padding: '8px', borderRadius: '8px' } },
                react_1.default.createElement(lucide_react_1.Mic, { size: 18, color: "#fff" })),
            react_1.default.createElement("div", null,
                react_1.default.createElement("h2", { style: { fontSize: '16px', fontWeight: 'bold', margin: 0 } }, "Voice & Meeting"),
                react_1.default.createElement("p", { style: { fontSize: '11px', color: 'var(--text-muted)', margin: 0 } }, "\uC74C\uC131 \uC778\uC2DD \uBC0F \uD68C\uC758\uB85D \uC694\uC57D"))),
        react_1.default.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 8px 8px' } },
            react_1.default.createElement("div", { style: { background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                react_1.default.createElement("button", { onClick: toggleRecording, style: { background: isRecording ? 'rgba(239,68,68,0.2)' : 'var(--bg-glass)', border: `2px solid ${isRecording ? '#ef4444' : 'var(--border-muted)'}`, color: isRecording ? '#ef4444' : 'var(--text-main)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px' } }, isRecording ? react_1.default.createElement(lucide_react_1.MicOff, { size: 28 }) : react_1.default.createElement(lucide_react_1.Mic, { size: 28 })),
                isRecording ? (react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    react_1.default.createElement("div", { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' } }),
                    react_1.default.createElement("span", { style: { fontSize: '12px', color: '#ef4444', fontWeight: 'bold' } }, "\uC74C\uC131 \uB4E3\uB294 \uC911..."))) : isProcessing ? (react_1.default.createElement("span", { style: { fontSize: '12px', color: 'var(--text-muted)' } }, "AI \uC694\uC57D \uC911...")) : (react_1.default.createElement("span", { style: { fontSize: '12px', color: 'var(--text-muted)' } }, "\uBC84\uD2BC\uC744 \uB20C\uB7EC \uB179\uC74C\uC744 \uC2DC\uC791\uD558\uC138\uC694")),
                react_1.default.createElement("style", null, `@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`)),
            react_1.default.createElement("div", { style: { flex: 1, background: '#1e1e24', borderRadius: '12px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
                react_1.default.createElement("div", { style: { padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-muted)', display: 'flex', alignItems: 'center', gap: '4px' } },
                    react_1.default.createElement(lucide_react_1.FileText, { size: 12, color: "var(--text-muted)" }),
                    react_1.default.createElement("span", { style: { fontSize: '11px', color: 'var(--text-muted)' } }, "Transcript & Summary")),
                react_1.default.createElement("div", { style: { flex: 1, padding: '16px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', overflowY: 'auto' } }, transcript ? (react_1.default.createElement("div", { style: { color: 'var(--text-main)', fontSize: '13px' } },
                    react_1.default.createElement("div", { style: { marginBottom: '16px', whiteSpace: 'pre-wrap' } }, transcript))) : isProcessing ? (react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' } }, "AI \uC694\uC57D \uC0DD\uC131 \uC911...")) : (react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' } }, "\uB179\uC74C\uC774 \uC644\uB8CC\uB418\uBA74 \uC694\uC57D\uC774 \uC0DD\uC131\uB429\uB2C8\uB2E4."))),
                transcript && (react_1.default.createElement("div", { style: { padding: '12px', borderTop: '1px solid var(--border-muted)', background: 'rgba(0,0,0,0.2)' } },
                    react_1.default.createElement("button", { onClick: handleInsert, style: { width: '100%', background: '#14b8a6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' } },
                        react_1.default.createElement(lucide_react_1.CheckCircle2, { size: 14 }),
                        " \uC5D0\uB514\uD130\uC5D0 \uC0BD\uC785\uD558\uAE30")))))));
}
