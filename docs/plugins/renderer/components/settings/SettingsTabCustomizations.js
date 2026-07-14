"use strict";
/**
 * @file SettingsTabCustomizations.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/settings/SettingsTabCustomizations.tsx
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
exports.SettingsTabCustomizations = SettingsTabCustomizations;
/*
 * [FUNCTION CONTRACT]
 * - 함수 명: `SettingsTabCustomizations`
 * - 역할: 인자 정보를 검수하고 비즈니스 계약 조건에 맞춰 최종 바인딩 결과물/바이너리 버퍼를 반환함.
 * - 예시: `SettingsTabCustomizations(...)` 호출 시 런타임 비동기/동기 연쇄 반응 유도.
 */
function SettingsTabCustomizations({ activeTab, settings, }) {
    /*
     * [ALGORITHM BRANCH / DECISION]
     * - 조건 식: `activeTab !== 'Customizations'`
     * - 만족 시: 비즈니스 요구사항을 만족하여 대응 내부 분기 블록을 구동함.
     * - 불만족 시: 바이패스(Bypass)하여 하위 연산으로 폴백하거나 조건 스택을 탈출함.
     * - 예시: `if (activeTab !== 'Customizations')` 만족 시 런타임 내포 연산 및 데이터 매핑 즉시 활성화.
     */
    if (activeTab !== 'Customizations')
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement("h3", { style: { fontSize: '13px', fontWeight: 700, margin: '0 0 6px' } }, "Customizations & Extensions"),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
            React.createElement("span", { style: { fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 } }, "\uC5D0\uB514\uD130\uC758 \uB7F0\uD0C0\uC784 \uAE30\uB2A5 \uD655\uC7A5\uC744 \uB85C\uB4DC\uD558\uAC70\uB098 \uB9C8\uCF13\uD50C\uB808\uC774\uC2A4\uC5D0\uC11C \uCD94\uAC00\uD55C \uC678\uBD80 \uD50C\uB7EC\uADF8\uC778\uC744 \uC628/\uC624\uD504 \uD1A0\uAE00\uD569\uB2C8\uB2E4."),
            [
                { id: 'outline', name: 'Outline Document Navigator', desc: 'H1~H3 문맥 개요 네비게이션 활성화' },
                { id: 'minimap', name: 'Minimap Visual Bar', desc: '에디터 우측 전체 문서 그래픽 미니맵 로딩' },
                { id: 'canvas', name: 'Free Drawing Canvas', desc: '자유 드로잉 및 다이어그램 스케치 삽입 플러그인' }
            ].map(p => {
                /*
                 * [RUN-TIME STATE / INVARIANT]
                 * - 변수 명: `isInstalled`
                 * - 자료형 / 예상 값: 우변 식 계산 결과에 따라 런타임 할당되는 적격 데이터 타입 (예: string, number, boolean, Object 등).
                 * - 시나리오: 본 함수 영역 내에서 상태 생명주기를 유지하며 데이터 보존 및 후속 분기 연산에 소비됨.
                 * - 예시 코드: `const isInstalled = ...` 형태로 안전 캐싱 후 가공 기동.
                 */
                const isInstalled = (settings.installedPlugins || []).includes(p.id);
                return (React.createElement("div", { key: p.id, style: {
                        padding: '8px 12px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: '11px', fontWeight: 700 } }, p.name),
                        React.createElement("div", { style: { fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' } }, p.desc)),
                    React.createElement("span", { style: {
                            fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                            background: isInstalled ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                            color: isInstalled ? '#10b981' : 'var(--text-muted)',
                            border: isInstalled ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-muted)',
                        } }, isInstalled ? 'Loaded' : 'Inactive')));
            }))));
}
