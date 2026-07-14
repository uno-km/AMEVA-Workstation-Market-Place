"use strict";
/**
 * @file SettingsTabAccount.tsx
 * @system AMEVA Workstation - Client Settings Tab
 * @location src/renderer/components/settings/SettingsTabAccount.tsx
 * @role Google account centralized settings and integration view
 *
 * [책임 범위 - RESPONSIBILITY]
 * - 오직 구글 인증(Google Login)을 통한 로그인만 허용하며, 타사 로그인 및 임의 수동 닉네임 수정을 통제한다.
 * - 구글 드라이브(Google Drive) 스코프 통합 여부를 체크박스를 통해 동의받아 연동 처리한다.
 * - 안전 키체인과 연동되는 영속성 로그인 세션의 기동 시점 체크 및 갱신 상태를 UI에 표시한다.
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
exports.SettingsTabAccount = SettingsTabAccount;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const AppContext_1 = require("../../contexts/AppContext");
function SettingsTabAccount({ activeTab, tempName, setTempName, tempColor, setTempColor, handleSaveUser, }) {
    const { setUsername } = (0, AppContext_1.useAppContext)();
    const [googleUser, setGoogleUser] = (0, react_1.useState)(null);
    const [connectDrive, setConnectDrive] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [initialized, setInitialized] = (0, react_1.useState)(false);
    // 🦾 [SESSION AUTO-CONNECT] 설정 탭 활성화 시 암호화 보관소 자격 증명 상태 조회
    (0, react_1.useEffect)(() => {
        if (activeTab === 'Account' && !initialized) {
            checkLoginStatus();
        }
    }, [activeTab, initialized]);
    const checkLoginStatus = () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.googleAuthGetStatus))
            return;
        try {
            const res = yield window.electronAPI.googleAuthGetStatus();
            if (res.success && res.user) {
                setGoogleUser(res.user);
                setConnectDrive(res.user.isDriveConnected);
                setUsername(res.user.name);
                setTempName(res.user.name);
            }
            else {
                setGoogleUser(null);
            }
        }
        catch (err) {
            console.error('[AccountTab] 로그인 상태 검증 오류:', err);
        }
        finally {
            setInitialized(true);
        }
    });
    // 🦾 [GOOGLE OAUTH ACTION] 구글 로그인 시동
    const handleGoogleLogin = () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.googleAuthLogin))
            return;
        setLoading(true);
        try {
            const res = yield window.electronAPI.googleAuthLogin(connectDrive);
            if (res.success && res.user) {
                setGoogleUser(res.user);
                setUsername(res.user.name);
                setTempName(res.user.name);
                alert('구글 계정 인증 및 연동이 성공적으로 완료되었습니다!');
            }
            else {
                alert(res.error || '구글 로그인에 실패했습니다. 다시 시도해 주세요.');
            }
        }
        catch (err) {
            alert(`로그인 오류: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    });
    // 🦾 [GOOGLE SIGN OUT ACTION] 구글 로그아웃 진행
    const handleGoogleLogout = () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!((_a = window.electronAPI) === null || _a === void 0 ? void 0 : _a.googleAuthLogout))
            return;
        if (!confirm('정말로 로그아웃하고 구글 계정 연결을 해제하시겠습니까?'))
            return;
        setLoading(true);
        try {
            const res = yield window.electronAPI.googleAuthLogout();
            if (res.success) {
                setGoogleUser(null);
                setUsername('');
                setTempName('');
                alert('성공적으로 로그아웃되었습니다.');
            }
        }
        catch (err) {
            alert(`로그아웃 실패: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    });
    if (activeTab !== 'Account')
        return null;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("h3", { style: { fontSize: '13px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' } }, "\uAD6C\uAE00 \uACC4\uC815 \uAD00\uB9AC (Google Account)"),
        react_1.default.createElement("p", { style: { fontSize: '10.5px', color: 'var(--text-muted)', margin: '0 0 16px' } }, "AMEVA Workstation\uC740 \uC644\uBCBD\uD55C \uBCF4\uC548 \uD658\uACBD\uC744 \uC81C\uACF5\uD558\uAE30 \uC704\uD574 \uC624\uC9C1 Google \uACF5\uC2DD OAuth 2.0 \uBC0F \uC554\uD638\uD654 \uD0A4\uCCB4\uC778\uC744 \uD1B5\uD55C \uAD6C\uAE00 \uB2E8\uB3C5 \uB85C\uADF8\uC778\uB9CC \uD5C8\uC6A9\uD569\uB2C8\uB2E4."),
        googleUser ? (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            react_1.default.createElement("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-glass-subtle)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '8px',
                } },
                googleUser.picture ? (react_1.default.createElement("img", { src: googleUser.picture, alt: "Avatar", style: { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-glow)' }, referrerPolicy: "no-referrer" })) : (react_1.default.createElement("div", { style: {
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: '#f97316', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '16px'
                    } }, googleUser.name.slice(0, 1).toUpperCase())),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { style: { fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' } }, googleUser.name),
                    react_1.default.createElement("div", { style: { fontSize: '10.5px', color: 'var(--text-muted)' } }, googleUser.email))),
            react_1.default.createElement("div", { style: {
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: googleUser.isDriveConnected ? 'rgba(52,168,83,0.06)' : 'rgba(234,67,53,0.06)',
                    border: `1px solid ${googleUser.isDriveConnected ? 'rgba(52,168,83,0.2)' : 'rgba(234,67,53,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                } },
                react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, googleUser.isDriveConnected ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(lucide_react_1.CheckCircle2, { size: 14, style: { color: '#34a853' } }),
                    react_1.default.createElement("span", { style: { fontSize: '11px', color: '#34a853', fontWeight: 600 } }, "\uAD6C\uAE00 \uB4DC\uB77C\uC774\uBE0C \uC5F0\uACB0 \uC644\uB8CC (Active)"))) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(lucide_react_1.AlertTriangle, { size: 14, style: { color: '#ea4335' } }),
                    react_1.default.createElement("span", { style: { fontSize: '11px', color: '#ea4335', fontWeight: 600 } }, "\uAD6C\uAE00 \uB4DC\uB77C\uC774\uBE0C \uC5F0\uACB0 \uC5C6\uC74C (Disconnected)")))),
                !googleUser.isDriveConnected && (react_1.default.createElement("button", { onClick: () => {
                        setConnectDrive(true);
                        setTimeout(() => handleGoogleLogin(), 100);
                    }, style: {
                        padding: '4px 8px', borderRadius: '4px',
                        background: 'var(--primary)', border: 'none', color: '#fff',
                        fontSize: '9.5px', fontWeight: 600, cursor: 'pointer'
                    } }, "\uB4DC\uB77C\uC774\uBE0C \uC5F0\uACB0 \uCD94\uAC00"))),
            react_1.default.createElement("div", { style: { display: 'flex', gap: '8px' } },
                react_1.default.createElement("button", { onClick: checkLoginStatus, disabled: loading, style: {
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '6px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border-muted)',
                        color: 'var(--text-main)', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                    } },
                    react_1.default.createElement(lucide_react_1.RefreshCw, { size: 12, className: loading ? 'animate-spin' : '' }),
                    "\uB3D9\uAE30\uD654 \uD655\uC778"),
                react_1.default.createElement("button", { onClick: handleGoogleLogout, disabled: loading, style: {
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                    } },
                    react_1.default.createElement(lucide_react_1.LogOut, { size: 12 }),
                    "\uACC4\uC815 \uC5F0\uACB0 \uD574\uC81C (Sign Out)")))) : (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
            react_1.default.createElement("div", { style: {
                    padding: '16px',
                    background: 'var(--bg-glass-subtle)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '8px'
                } },
                react_1.default.createElement(lucide_react_1.Globe, { size: 32, style: { color: '#4285f4', marginBottom: '4px' } }),
                react_1.default.createElement("div", { style: { fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' } }, "\uAD6C\uAE00 \uD1B5\uD569 \uB85C\uADF8\uC778\uC73C\uB85C \uC548\uC804\uD558\uAC8C \uD611\uC5C5\uD558\uC138\uC694"),
                react_1.default.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', maxWidth: '280px' } }, "\uC0AC\uC6A9\uC790 \uAD6C\uAE00 \uD504\uB85C\uD544\uC740 \uB85C\uCEEC \uC7A5\uCE58\uC758 \uC548\uC804 \uC2A4\uD1A0\uB9AC\uC9C0 \uD0A4\uCCB4\uC778\uC73C\uB85C \uC5C4\uACA9\uD558\uAC8C \uC554\uD638\uD654\uB418\uC5B4 \uBCF4\uD638\uB429\uB2C8\uB2E4.")),
            react_1.default.createElement("div", { style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }, onClick: () => setConnectDrive(!connectDrive) },
                react_1.default.createElement("input", { type: "checkbox", checked: connectDrive, onChange: () => { }, style: { marginTop: '2px', cursor: 'pointer' } }),
                react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column' } },
                    react_1.default.createElement("span", { style: { fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 } }, "Google Drive (\uAD6C\uAE00 \uB4DC\uB77C\uC774\uBE0C) \uC5F0\uACB0"),
                    react_1.default.createElement("span", { style: { fontSize: '9px', color: 'var(--text-muted)' } }, "\uCCB4\uD06C \uC2DC \uBB38\uC11C \uBC31\uC5C5 \uBC0F \uD074\uB77C\uC6B0\uB4DC \uB3D9\uAE30\uD654\uB97C \uC704\uD55C \uB4DC\uB77C\uC774\uBE0C \uD1B5\uD569 \uAD8C\uD55C\uC744 \uC2B9\uC778\uD569\uB2C8\uB2E4."))),
            react_1.default.createElement("button", { onClick: handleGoogleLogin, disabled: loading, style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.25)',
                    transition: 'background 0.2s',
                }, onMouseEnter: e => (e.currentTarget.style.background = '#357ae8'), onMouseLeave: e => (e.currentTarget.style.background = '#4285f4') },
                react_1.default.createElement("svg", { style: { width: '15px', height: '15px', fill: '#fff' }, viewBox: "0 0 24 24" },
                    react_1.default.createElement("path", { d: "M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.445-2.89-6.445-6.445s2.89-6.445 6.445-6.445c1.554 0 2.97.553 4.076 1.472l3.19-3.19C19.26 1.839 15.932 1 12.24 1 5.866 1 .682 6.182.682 12.56S5.866 24.12 12.24 24.12c5.855 0 11.2-4.186 11.2-11.56 0-.742-.08-1.464-.22-2.164H12.24z" })),
                "Google \uACC4\uC815\uC73C\uB85C \uACC4\uC18D\uD558\uAE30")))));
}
