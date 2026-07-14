"use strict";
/**
 * @file PresentationBlock.tsx
 * @system AMEVA OS Desktop Workstation
 * @location src/renderer/components/PresentationBlock.tsx
 * @role BlockNote custom React block component for PPTX slide show presentation playback.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationBlock = exports.PresentationBlockSpec = exports.PresentationBlockComponent = void 0;
const react_1 = require("react");
const react_2 = require("@blocknote/react");
const lucide_react_1 = require("lucide-react");
/**
 * @component PresentationBlockComponent
 * @description PPTX 프레젠테이션 슬라이드를 캐러셀 형태로 뷰잉하고,
 *              전체 화면 슬라이드 쇼 형태로 재생할 수 있는 반응형 에디터 블록 컴포넌트입니다.
 */
const PresentationBlockComponent = ({ block, editor: _editor }) => {
    var _a, _b, _c;
    const props = block.props;
    const { pptxPath = '', slides = '', fallback = false, slidesText = '[]' } = props;
    const slidesArray = typeof slides === 'string' ? (slides ? slides.split(',') : []) : (Array.isArray(slides) ? slides : []);
    const [currentSlide, setCurrentSlide] = (0, react_1.useState)(0);
    const [isFullscreen, setIsFullscreen] = (0, react_1.useState)(false);
    // 텍스트 폴백 데이터 파싱
    const parsedSlidesText = (() => {
        try {
            return slidesText ? JSON.parse(slidesText) : [];
        }
        catch (_a) {
            return [];
        }
    })();
    const totalSlides = fallback ? parsedSlidesText.length : slidesArray.length;
    const handlePrev = (0, react_1.useCallback)(() => {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
    }, [totalSlides]);
    const handleNext = (0, react_1.useCallback)(() => {
        setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
    }, [totalSlides]);
    // 전체화면 슬라이드 쇼 조율 키보드 리스너
    (0, react_1.useEffect)(() => {
        if (!isFullscreen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                handleNext();
            }
            else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
            else if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen, handleNext, handlePrev]);
    if (totalSlides === 0) {
        return (React.createElement("div", { className: "bn-custom-block", style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted, #9ca3af)',
                textAlign: 'center',
                margin: '12px 0'
            } },
            React.createElement(lucide_react_1.Presentation, { size: 36, style: { marginBottom: '8px', opacity: 0.6 } }),
            React.createElement("p", { style: { margin: 0, fontSize: '14px', fontWeight: 500 } }, "\uD504\uB808\uC820\uD14C\uC774\uC158 \uB370\uC774\uD130\uB97C \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4..."),
            React.createElement("p", { style: { margin: '4px 0 0 0', fontSize: '12px', opacity: 0.5 } }, pptxPath || 'PPTX 파일 변환 중')));
    }
    return (React.createElement("div", { className: `bn-custom-block presentation-block-wrapper ${isFullscreen ? 'fullscreen-slide' : ''}`, style: isFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#0a0a0c',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
        } : {
            position: 'relative',
            width: '100%',
            maxWidth: '720px',
            margin: '16px auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #18181f 0%, #121217 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, border-color 0.3s ease'
        } },
        React.createElement("div", { style: {
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                background: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            } },
            fallback ? (React.createElement("div", { style: {
                    padding: '40px',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    color: '#f3f4f6',
                    background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f0d2c 100%)',
                    textAlign: 'left',
                    overflowY: 'auto'
                } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', opacity: 0.7 } },
                    React.createElement(lucide_react_1.AlertCircle, { size: 16, color: "#8b5cf6" }),
                    React.createElement("span", { style: { fontSize: '11px', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em' } }, "Text Outline Fallback Mode")),
                React.createElement("h3", { style: { margin: '0 0 12px 0', fontSize: isFullscreen ? '32px' : '22px', color: '#fff', fontWeight: 700 } },
                    "Slide ", (_a = parsedSlidesText[currentSlide]) === null || _a === void 0 ? void 0 :
                    _a.slide_index),
                React.createElement("div", { style: { width: '100%', fontSize: isFullscreen ? '22px' : '15px', lineHeight: 1.6, opacity: 0.85 } }, ((_c = (_b = parsedSlidesText[currentSlide]) === null || _b === void 0 ? void 0 : _b.texts) === null || _c === void 0 ? void 0 : _c.map((t, i) => (React.createElement("p", { key: i, style: { margin: '8px 0', display: 'flex', alignItems: 'flex-start', gap: '8px' } },
                    React.createElement("span", { style: { color: '#8b5cf6', fontWeight: 'bold' } }, "\u2022"),
                    React.createElement("span", null, t))))) || React.createElement("p", { style: { fontStyle: 'italic', opacity: 0.5 } }, "\uBCF8\uBB38\uC5D0 \uD14D\uC2A4\uD2B8 \uB0B4\uC6A9\uC774 \uC5C6\uB294 \uC2AC\uB77C\uC774\uB4DC\uC785\uB2C8\uB2E4.")))) : (React.createElement("img", { src: slidesArray[currentSlide], alt: `Slide ${currentSlide + 1}`, style: {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                } })),
            React.createElement("div", { className: "slide-controls", style: {
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    background: 'rgba(15, 15, 20, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 10
                } },
                React.createElement("button", { onClick: handlePrev, style: {
                        border: 'none',
                        background: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s'
                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent' },
                    React.createElement(lucide_react_1.ChevronLeft, { size: 20 })),
                React.createElement("span", { style: { color: '#fff', fontSize: '13px', fontWeight: 600, minWidth: '50px', textAlign: 'center' } },
                    currentSlide + 1,
                    " / ",
                    totalSlides),
                React.createElement("button", { onClick: handleNext, style: {
                        border: 'none',
                        background: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s'
                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent' },
                    React.createElement(lucide_react_1.ChevronRight, { size: 20 }))),
            React.createElement("button", { onClick: () => setIsFullscreen(!isFullscreen), style: {
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(15, 15, 20, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s, transform 0.2s',
                    zIndex: 10
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                } }, isFullscreen ? React.createElement(lucide_react_1.Minimize2, { size: 16 }) : React.createElement(lucide_react_1.Maximize2, { size: 16 }))),
        !isFullscreen && (React.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                fontSize: '11px',
                color: '#9ca3af',
                background: 'rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement(lucide_react_1.Presentation, { size: 12, color: "#8b5cf6" }),
                React.createElement("span", { style: { fontWeight: 600, color: '#f3f4f6' } }, pptxPath.split(/[\\/]/).pop() || 'Presentation')),
            React.createElement("span", { style: { opacity: 0.6 } }, fallback ? 'Text Mode (PowerPoint 미검출)' : 'Image Mode')))));
};
exports.PresentationBlockComponent = PresentationBlockComponent;
/**
 * BlockNote amevaSchema 에 병합할 Presentation 커스텀 블록 사양 정의
 */
exports.PresentationBlockSpec = (0, react_2.createReactBlockSpec)({
    type: 'presentation',
    propSchema: {
        pptxPath: { default: '' },
        slides: { default: '' },
        fallback: { default: false },
        slidesText: { default: '[]' }
    },
    content: 'none'
}, {
    render: (props) => (React.createElement(exports.PresentationBlockComponent, { block: props.block, editor: props.editor }))
});
exports.PresentationBlock = (0, exports.PresentationBlockSpec)();
