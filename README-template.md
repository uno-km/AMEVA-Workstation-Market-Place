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

<!-- INJECT_BASIC_PLUGINS -->

### 💎 프리미엄 플러그인 (`public/plugins/premium/`)
엔터프라이즈급 고급 기능을 제공하는 강력한 React 기반(`.tsx`) 컴포넌트입니다.

<!-- INJECT_PREMIUM_PLUGINS -->

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
