<div align="center">
  <h1>🌟 AMEVA Workstation Marketplace</h1>
  <p><b>AMEVA 워크스테이션 생태계를 위한 탈중앙화 확장 프로그램 및 플러그인 서버입니다.</b></p>
</div>

---

## 🚀 개요 (Overview)

**AMEVA 워크스테이션 마켓플레이스**는 다양한 플러그인과 컴포넌트, 그리고 실시간 금융 데이터를 호스팅하고 제공하는 중앙 허브 역할을 합니다. 가벼운 Express.js 아키텍처를 기반으로 구축된 이 백엔드 서버는 AMEVA 워크스테이션 클라이언트들에게 필요한 기능들을 빠르고 안정적으로 전송합니다.

## 📁 동적 플러그인 디렉터리 (Dynamic Plugins)

> 이 플러그인 목록은 `public/plugins` 폴더의 실제 파일들을 기반으로 **동적으로 생성**되었습니다. 새로운 기능 파일(`.js` 또는 `.tsx`)이 폴더에 추가되면 본 README 파일에도 자동으로 리스트업됩니다.

### 📂 기본 플러그인 (`public/plugins/`)
순수 JavaScript(`.js`)로 구축된 표준 도구 및 기본 확장 기능입니다.

<table>
  <thead>
    <tr>
      <th width="12%" align="center">Preview</th>
      <th width="28%">Plugin Info</th>
      <th width="60%">Description & Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=calculator&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🧮</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">calculator</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">calculator.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        문서 작성 중 즉석으로 계산할 수 있는 확장 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=calendar&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📅</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">calendar</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">calendar.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        문서 일정과 연동 가능한 나만의 미니 스마트 달력 스케줄러 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=cloud-collab&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🤝</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">cloud-collab</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">cloud-collab.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        로컬 오프라인 제한을 뛰어넘어 보안 중앙 채널에서 팀원들과 원격 실시간 편집을 해금합니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=db-explorer&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">db-explorer</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">db-explorer.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=drawing-board&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🖍️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">drawing-board</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">drawing-board.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        문서 중간에 Excalidraw 기반 화이트보드 드로잉판을 추가하여 그림을 그릴 수 있게 해줍니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=finance-dashboard&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">finance-dashboard</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">finance-dashboard.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=google-drive&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">☁️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">google-drive</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">google-drive.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        작성 중인 마크다운 문서를 구글 드라이브 클라우드에 다이렉트 업로드 및 백업 동기화하는 클라우드 연동 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=google-maps&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">google-maps</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">google-maps.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=google&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🔍</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">google</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">google.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        임시 세션으로 검색 내역을 남기지 않고 즉석 구글 검색을 활용하는 안전 웹 뷰어 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=mind-map&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">mind-map</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">mind-map.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=minimap&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🗺️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">minimap</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">minimap.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        에디터 우측에 실시간 텍스트 미니어처 미니맵을 활성화합니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=naver&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📗</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">naver</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">naver.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        임시 프라이버시 세션으로 안전하게 네이버 포털 검색 및 로그인을 지원하는 웹 뷰어 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=outline&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📑</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">outline</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">outline.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        문서의 제목 구조(TOC) 트리 네비게이션 탭을 활성화합니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=pdf-rag&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">pdf-rag</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">pdf-rag.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=pomodoro&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">pomodoro</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">pomodoro.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=presentation&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">presentation</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">presentation.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=rest-client&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">rest-client</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">rest-client.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=rich-styling&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🎨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">rich-styling</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">rich-styling.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        인라인 글씨 크기 조절 및 다양한 한글/영문 폰트 서식 변경 툴바를 활성화합니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=voice-dictation&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">voice-dictation</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">voice-dictation.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=web-browser&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">web-browser</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">web-browser.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=wireframe&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">✨</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">wireframe</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">wireframe.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        마켓플레이스에 새로 등록된 동적 확장 기능입니다. 자동으로 감지되어 서비스 중입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=youtube&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📺</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">youtube</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">youtube.js</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Active-4c1?style=flat-square" />
      </td>
      <td>
        문서 작업 중 유튜브 비디오를 실시간 시청 및 PiP 팝업 모드로 전환할 수 있는 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #4c1; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
  </tbody>
</table>


### 💎 프리미엄 플러그인 (`public/plugins/premium/`)
엔터프라이즈급 고급 기능을 제공하는 강력한 React 기반(`.tsx`) 컴포넌트입니다.

<table>
  <thead>
    <tr>
      <th width="12%" align="center">Preview</th>
      <th width="28%">Plugin Info</th>
      <th width="60%">Description & Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=AmevaBrowserView&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🌐</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">AmevaBrowserView</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">AmevaBrowserView.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        워크스테이션 내부에 독립적으로 탑재되는 강력한 인앱 웹 브라우저입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=DatabaseExplorerPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🗄️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">DatabaseExplorerPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">DatabaseExplorerPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        데이터베이스 구조 탐색 및 쿼리를 위한 고급 탐색기 컴포넌트입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=FinanceDashboardView&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📈</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">FinanceDashboardView</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">FinanceDashboardView.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        실시간 글로벌 주식 시세, 주요국 금리 현황, 베트남(VND) 포함 다자간 환율 양방향 변환 대시보드 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=GoogleMapsView&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📍</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">GoogleMapsView</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">GoogleMapsView.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        장소 검색 및 지도 탐색이 가능한 구글 지도 내장 뷰어 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=KanbanBoard&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📋</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">KanbanBoard</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">KanbanBoard.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        칸반 보드 형태로 직관적이고 시각적인 태스크(일정) 관리를 제공합니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=MindMapPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🧠</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">MindMapPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">MindMapPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        복잡한 아이디어와 개념을 시각적으로 구성할 수 있는 마인드맵 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=PdfRagPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📄</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">PdfRagPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">PdfRagPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        대용량 PDF 문서를 로드하고 AI를 통해 질의응답(RAG) 및 요약 분석을 수행하는 고급 AI 플러그인입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=PomodoroPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🍅</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">PomodoroPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">PomodoroPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        뽀모도로 기법을 적용하여 사용자의 작업 집중력을 극대화하고 시간을 관리해 주는 타이머입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=PresentationPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📽️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">PresentationPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">PresentationPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        작성된 마크다운 문서를 기반으로 즉석에서 발표용 슬라이드 모드를 구동하는 뷰어입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=RestClientPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🔌</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">RestClientPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">RestClientPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        API 개발 및 테스트를 위해 워크스테이션 내장형으로 제공되는 HTTP/REST 클라이언트 컴포넌트입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=VoiceDictationPlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">🎙️</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">VoiceDictationPlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">VoiceDictationPlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        실시간 음성 인식(STT)을 통해 음성을 텍스트로 즉각 변환하여 에디터에 타이핑하는 편의 도구입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://ui-avatars.com/api/?name=WireframePlugin&background=random&color=fff&size=128&font-size=0.4&bold=true" width="65" style="border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/><br/>
        <span style="font-size: 1.5rem;">📐</span>
      </td>
      <td>
        <b style="font-size: 1.1em; color: #2c3e50;">WireframePlugin</b><br/>
        <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: #e83e8c;">WireframePlugin.tsx</code><br/><br/>
        <img src="https://img.shields.io/badge/Status-Premium-ff69b4?style=flat-square" />
      </td>
      <td>
        신속한 UI/UX 와이어프레임 및 프로토타입 설계를 돕는 툴입니다.<br/><br/>
        <blockquote style="margin: 0; padding-left: 10px; border-left: 4px solid #ff69b4; color: #6c757d; font-size: 0.9em;">해당 모듈은 서버 구동 시 워크스테이션으로 실시간 동적 주입됩니다.</blockquote>
      </td>
    </tr>
  </tbody>
</table>


## ⚡ 핵심 아키텍처 (Core Architecture)

- **동적 로딩 (Dynamic Loading)**: 서버가 폴더 내의 플러그인 파일들을 자동으로 스캔하여 별도의 설정 없이도 API 엔드포인트에 동적으로 등록합니다.
- **고성능 캐싱 (High-Performance Caching)**: 외부 API 호출 시 인메모리 TTL 캐싱과 싱글 플라이트 패턴을 적용하여 중복 트래픽을 방어합니다.
- **자동 문서화 (Auto Documentation)**: `npm start` 실행 시 스크립트가 폴더를 읽어 README를 최신 상태로 조립합니다.

## 📦 시작하기 (Getting Started)

```bash
# 리포지토리 클론
git clone <repository-url>
cd AMEVA-Workstation-Market-Place

# 의존성 패키지 설치
npm install

# 서버 실행 (이때 README가 동적으로 자동 갱신됩니다!)
npm start
```

---

<div align="center">
  <p><b>Proprietary License. All rights reserved.</b></p>
</div>
