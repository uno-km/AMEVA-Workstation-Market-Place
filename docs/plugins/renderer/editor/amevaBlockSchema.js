"use strict";
/**
 * @file amevaBlockSchema.ts
 * @system AMEVA OS Desktop Workstation - Editor Core
 * @location src/renderer/editor/amevaBlockSchema.ts
 * @role Editor Custom Block Spec Schema definition
 *
 * [책임 범위 - RESPONSIBILITY]
 * - BlockNote WYSIWYG 에디터가 인식할 수 있는 커스텀 블록 사양(Jupyter, Drawing, LinkPreview, Youtube, Map)을 기본 사양에 병합 정의한다.
 * - 프로젝트 전역에서 공유할 에디터 타입(`AmevaEditor`), 블록 타입(`AmevaBlock`), 부분 블록 타입(`AmevaPartialBlock`)의 타입 별칭을 엑스포트 제공한다.
 *
 * [책임이 아닌 것 - NON-RESPONSIBILITY]
 * - 커스텀 블록들의 렌더링 세부 뷰 구현 (각 블록 컴포넌트 내부에서 담당).
 *
 * [절대 깨면 안 되는 계약 - CONTRACT]
 * - MUST: 커스텀 블록 타입(AmevaBlock, AmevaPartialBlock)의 제네릭 매핑 사양을 흐리거나 변경하지 말 것.
 *   타입이 흐려지면 `MarkdownEditor` 및 `useAppAISuggestions` 등의 인라인 제안 이식 구문에서 심각한 TS 컴파일 에러를 뿜음.
 
 * [소비처 - CONSUMERS / USAGE CONTEXT]
 * - 소비처 A (src/renderer/App.tsx): AMEVA OS 최상위 마운트 레이어에서 의존성 로더로 연동 소비.
 * - 소비처 B (src/renderer/main.tsx): 렌더러 엔트리 라이프사이클의 기본 기능으로 수입 소비.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.amevaSchema = void 0;
/*
 * [IMPORT SEGMENTATION & CONTRACTS]
 * - BlockNoteSchema: 기본 블록 스펙에 커스텀 사양을 가미하기 위한 스키마 생성 팩토리.
 * - defaultBlockSpecs: 문단, 헤더, 리스트, 인용구 등 BlockNote 순정 기본 블록 스펙.
 * - BlockNoteEditor: 제네릭 스펙이 가미될 에디터 본체 인프라 타입.
 * - Block, PartialBlock: 블록 정보 조작 및 부분 변경용 core 타입.
 * - BlockSchemaFromSpecs, InlineContentSchemaFromSpecs, StyleSchemaFromSpecs: 스펙 레코드로부터 타입을 역추출하기 위한 유틸리티 제네릭.
 */
const core_1 = require("@blocknote/core");
/*
 * [CUSTOM BLOCK SPEC COMPONENT IMPORTS]
 * - JupyterBlock: SQL/JavaScript/Python 코드 실행 및 실시간 ASCII/HTML 콘솔 테이블 출력 블록.
 * - DrawingBlock: Excalidraw 기반 백터 그래픽 스케치 및 펜 그리기 블록.
 * - LinkPreviewBlock: 외부 웹 URL 기재 시 카드 형태 메타데이터 표출 블록.
 * - YoutubeBlock: 유튜브 동영상 임베딩 및 플로팅 PIP 플레이어 연동 블록.
 * - MapBlock: 가상 맵/위치 데이터 오버레이 정보 뷰 블록.
 */
const JupyterBlock_1 = require("../components/JupyterBlock");
const DrawingBlock_1 = require("../components/DrawingBlock");
const LinkPreviewBlock_1 = require("../components/LinkPreviewBlock");
const YoutubeBlock_1 = require("../components/YoutubeBlock");
const MapBlock_1 = require("../components/MapBlock");
const PresentationBlock_1 = require("../components/PresentationBlock");
/**
 * [CONTRACT - Root Custom Schema Configuration]
 * - amevaSchema: 커스텀 사양이 병합된 중앙 스키마 인스턴스.
 * - Rationale: 이 사양에 선언된 키값(jupyter, drawing 등)으로 마크다운 파서 및 플러그인이 동작한다.
 */
exports.amevaSchema = core_1.BlockNoteSchema.create({
    blockSpecs: Object.assign(Object.assign({}, core_1.defaultBlockSpecs), { jupyter: JupyterBlock_1.JupyterBlock, drawing: DrawingBlock_1.DrawingBlock, linkPreview: LinkPreviewBlock_1.LinkPreviewBlock, youtube: YoutubeBlock_1.YoutubeBlock, map: MapBlock_1.MapBlock, presentation: PresentationBlock_1.PresentationBlock })
});
