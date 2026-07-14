"use strict";
/**
 * @file SettingsTabGeneral.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/settings/SettingsTabGeneral.tsx
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
exports.SettingsTabGeneral = SettingsTabGeneral;
const lucide_react_1 = require("lucide-react");
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTabGeneral`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTabGeneral(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTabGeneral({ activeTab, settings, onUpdateSettings, isProPlan, handleToggleProPlan, }) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `activeTab !== 'General'`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (activeTab !== 'General')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (activeTab !== 'General')
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement("h3", { style: { fontSize: '13px', fontWeight: 700, margin: '0 0 6px' } }, "General Settings"),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700 } }, "\uC2E4\uC2DC\uAC04 \uD0C0\uC778 \uD3EC\uC778\uD130 \uD45C\uC2DC"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uB3D9\uB8CC\uC758 \uC2E4\uC2DC\uAC04 \uB9C8\uC6B0\uC2A4 \uC6C0\uC9C1\uC784\uC744 \uD654\uBA74\uC5D0 \uD22C\uC0AC\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: () => onUpdateSettings({ showPeersPointer: !settings.showPeersPointer }), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, settings.showPeersPointer ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700 } }, "\uD0C0\uC778 \uD14D\uC2A4\uD2B8 \uB4DC\uB798\uADF8 \uB3D9\uAE30\uD654"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uB3D9\uB8CC\uC758 \uC120\uD0DD \uC601\uC5ED \uB809\uD2B8 \uD558\uC774\uB77C\uC774\uD2B8\uB97C \uC2E4\uC2DC\uAC04 \uD45C\uC2DC\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: () => onUpdateSettings({ showPeersDrag: !settings.showPeersDrag }), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, settings.showPeersDrag ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700 } }, "\uCF54\uB4DC \uC0CC\uB4DC\uBC15\uC2A4 \uCF58\uC194 \uB3C4\uD06C"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uC5D0\uB514\uD130 \uC544\uB798\uC5D0 \uCF54\uB4DC \uD035 \uB7F0\uD0C0\uC784 \uC704\uC82F\uC744 \uC0C1\uC2DC \uB178\uCD9C\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: () => onUpdateSettings({ showCodeConsole: !settings.showCodeConsole }), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, settings.showCodeConsole ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700 } }, "\uC904\uBC14\uAFC8 \uBE44\uD65C\uC131\uD654 (\uAC00\uB85C \uC2A4\uD06C\uB864)"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uD14D\uC2A4\uD2B8 \uC790\uB3D9 \uC904\uBC14\uAFC8\uC744 \uD480\uACE0 \uAC00\uB85C \uC2A4\uD06C\uB864\uB85C \uBB38\uC7A5\uC744 \uD45C\uCD9C\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: () => onUpdateSettings({ wordWrap: !settings.wordWrap }), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, !settings.wordWrap ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700 } }, "\uC5D0\uB514\uD130 \uC6B0\uCE21 \uBBF8\uB2C8\uB9F5 \uD45C\uC2DC"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uC624\uB978\uCABD\uC5D0 \uC804\uCCB4 \uB808\uC774\uC544\uC6C3 \uC2DC\uAC01\uD654 Minimap \uBC14\uB97C \uD45C\uC2DC\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: () => onUpdateSettings({ showMinimap: !settings.showMinimap }), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, settings.showMinimap ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))),
            React.createElement("div", { style: { height: '1px', backgroundColor: 'var(--border-muted)', margin: '4px 0' } }),
            React.createElement("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(168, 85, 247, 0.05)',
                    border: '1px dashed rgba(168, 85, 247, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: '11.5px', fontWeight: 700, color: 'var(--primary)' } }, "\uD83D\uDC51 AMEVA Pro \uD50C\uB79C \uD65C\uC131\uD654"),
                    React.createElement("div", { style: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' } }, "\uC720\uB8CC \uAE30\uB2A5\uC744 \uD65C\uC131\uD654\uD569\uB2C8\uB2E4. \uB9C8\uCF13\uD50C\uB808\uC774\uC2A4 \uC811\uADFC \uBC0F \uC678\uBD80 MCP \uC11C\uBC84(Stdio/HTTP) \uB9E4\uB2C8\uC800 \uD0ED\uC774 \uAC1C\uBC29\uB429\uB2C8\uB2E4.")),
                React.createElement("button", { onClick: handleToggleProPlan, style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' } }, isProPlan ? React.createElement(lucide_react_1.ToggleRight, { size: 26 }) : React.createElement(lucide_react_1.ToggleLeft, { size: 26, style: { color: 'var(--text-dark)' } }))))));
}
