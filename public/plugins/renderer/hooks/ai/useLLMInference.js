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
exports.useLLMInference = useLLMInference;
const react_1 = require("react");
const AppContext_1 = require("../../contexts/AppContext");
const ipc = __importStar(require("../../../services/ipc/electronApiAdapter"));
const WebLLMEngine_1 = require("../../../services/ai/WebLLMEngine");
const useAIIpc_1 = require("./useAIIpc");
function useLLMInference() {
    const { settings } = (0, AppContext_1.useAppContext)();
    const { subscribeSession, unsubscribeSession } = (0, useAIIpc_1.useAIIpc)();
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const generate = (0, react_1.useCallback)((prompt_1, onToken_1, ...args_1) => __awaiter(this, [prompt_1, onToken_1, ...args_1], void 0, function* (prompt, onToken, systemPrompt = 'You are a helpful AI assistant.') {
        setIsGenerating(true);
        const sessId = crypto.randomUUID();
        try {
            if ((settings === null || settings === void 0 ? void 0 : settings.apiType) === 'wasm') {
                const webLLM = WebLLMEngine_1.WebLLMEngine.getInstance();
                const history = [{ role: 'user', content: prompt }];
                const finalAnswer = yield webLLM.generateStream(history, {
                    systemPrompt,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens,
                    gpuOnly: settings.gpuOnly
                }, (tokenText) => {
                    onToken(tokenText);
                });
                setIsGenerating(false);
                return finalAnswer;
            }
            else {
                // For ollama, local, api
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    let accumulated = '';
                    subscribeSession(sessId, (token) => {
                        accumulated += token;
                        onToken(token);
                    }, (data) => {
                        setIsGenerating(false);
                        unsubscribeSession(sessId);
                        if (data.success) {
                            resolve(data.text || accumulated);
                        }
                        else {
                            reject(new Error(data.error || 'Generation failed'));
                        }
                    });
                    const result = yield ipc.llmGenerate({
                        sessionId: sessId,
                        modelPath: (settings === null || settings === void 0 ? void 0 : settings.modelPath) || '',
                        prompt,
                        systemPrompt,
                        maxTokens: settings === null || settings === void 0 ? void 0 : settings.maxTokens,
                        temperature: settings === null || settings === void 0 ? void 0 : settings.temperature,
                        apiType: (settings === null || settings === void 0 ? void 0 : settings.apiType) || 'ollama',
                        apiKey: settings === null || settings === void 0 ? void 0 : settings.apiKey,
                        apiEndpoint: settings === null || settings === void 0 ? void 0 : settings.apiEndpoint,
                        apiModel: settings === null || settings === void 0 ? void 0 : settings.apiModel,
                        gpuOnly: settings === null || settings === void 0 ? void 0 : settings.gpuOnly,
                        history: []
                    });
                    if (!result.success && result.error) {
                        setIsGenerating(false);
                        unsubscribeSession(sessId);
                        reject(new Error(result.error));
                    }
                }));
            }
        }
        catch (e) {
            setIsGenerating(false);
            throw e;
        }
    }), [settings, subscribeSession, unsubscribeSession]);
    return { generate, isGenerating };
}
