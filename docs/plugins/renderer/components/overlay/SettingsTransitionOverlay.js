"use strict";
/**
 * @file SettingsTransitionOverlay.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/overlay/SettingsTransitionOverlay.tsx
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsTransitionOverlay = SettingsTransitionOverlay;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
/*
 * [RUN-TIME STATE / INVARIANT]
 * - 변수 명: `TIPS`
 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
 * - 예시 코드: `const TIPS = ...` 형태로 안전 캐싱 후 가공 기동.
 */
const TIPS = [
    "💡 팁: Ctrl + N을 누르면 언제든지 새 문서를 생성할 수 있습니다.",
    "💡 팁: 사이드바의 스냅샷 기능을 통해 작업 내역을 버전별로 저장해 보세요.",
    "💡 팁: 'Turbo' 모드를 활성화하면 파일 시스템 접근 권한 확인을 생략하여 속도를 높일 수 있습니다.",
    "💡 팁: AMEVA OS는 로컬 브라우저 상의 WASM 코어를 활용하므로 오프라인 환경에서도 작동합니다.",
    "💡 팁: Llama.cpp 또는 Ollama 엔진을 통해 강력한 온디바이스 AI 어시스턴트와 대화해보세요.",
    "💡 팁: 마켓플레이스에서 다양한 플러그인과 기술(Skill)을 다운로드하여 IDE를 확장할 수 있습니다."
];
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTransitionOverlay`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTransitionOverlay(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTransitionOverlay({ isVisible }) {
    const [currentTip, setCurrentTip] = (0, react_1.useState)(TIPS[0]);
    const [opacity, setOpacity] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        /*
         * [ALGORITHM BRANCH / DECISION]
         * - 조건 식: `isVisible`
         * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
         * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
         * - 예시: `if (isVisible)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
         */
        if (isVisible) {
            setOpacity(1);
            // Randomize tip
            setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
            /*
             * [RUN-TIME STATE / INVARIANT]
             * - 변수 명: `interval`
             * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
             * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
             * - 예시 코드: `const interval = ...` 형태로 안전 캐싱 후 가공 기동.
             */
            const interval = setInterval(() => {
                setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
            }, 2500);
            return () => clearInterval(interval);
        }
        else {
            setOpacity(0);
        }
    }, [isVisible]);
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `!isVisible && opacity === 0`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (!isVisible && opacity === 0)` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (!isVisible && opacity === 0)
        return null;
    return (React.createElement("div", { style: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: opacity,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isVisible ? 'auto' : 'none'
        } },
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' } },
            React.createElement(lucide_react_1.Loader2, { className: "animate-spin", size: 48, color: "var(--primary)" }),
            React.createElement("div", { style: { textAlign: 'center' } },
                React.createElement("h2", { style: {
                        color: 'var(--text-main)',
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    } },
                    React.createElement(lucide_react_1.Sparkles, { size: 18, color: "#fcd34d" }),
                    "\uC5D4\uC9C4 \uC7AC\uAD6C\uB3D9 \uBC0F \uC2DC\uC2A4\uD15C \uB3D9\uAE30\uD654 \uC911..."),
                React.createElement("p", { style: { color: 'var(--text-muted)', fontSize: '13px' } }, "\uC0C8\uB85C\uC6B4 \uC124\uC815\uC744 \uC6CC\uD06C\uC2A4\uD14C\uC774\uC158 \uC778\uC2A4\uD134\uC2A4\uC5D0 \uC8FC\uC785\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.")),
            React.createElement("div", { style: {
                    marginTop: '32px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    maxWidth: '400px',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                } },
                React.createElement("span", { style: {
                        color: 'var(--text-muted)',
                        fontSize: '12.5px',
                        lineHeight: 1.5,
                        animation: 'fadeIn 0.3s ease-out'
                    } }, currentTip))),
        React.createElement("style", null, `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `)));
}
