# SubBill (구독 요금제 소개 서비스)

## 프로젝트 소개
SubBill은 정기적인 구독 결제가 필요한 모든 서비스를 소개하는 포털 웹사이트입니다. 사용자들이 다양한 구독 서비스에 대한 정보를 쉽게 찾고 비교할 수 있도록 도와주는 플랫폼입니다.

## 주요 기능
- 인기 구독 서비스 소개 및 추천
- 카테고리별 서비스 분류 (AI, 생산성, 영상·음성, 전문영역, 보안 등)
- 서비스 검색 기능
- 서비스 상세 정보 제공 (가격, 평점, 댓글, 좋아요/싫어요)
- 관리자 대시보드를 통한 서비스 관리

## 기술 스택
- **프론트엔드**: Next.js, TypeScript, React, Tailwind CSS
- **백엔드**: Supabase (PostgreSQL 데이터베이스, 인증, 스토리지)
- **배포**: Netlify

## 프로젝트 구조
```
subbill-web/
├── public/            # 정적 파일 (이미지, 아이콘 등)
├── src/
│   ├── components/    # 재사용 가능한 UI 컴포넌트
│   ├── lib/           # 라이브러리 및 유틸리티 함수
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── admin/     # 관리자 페이지
│   │   ├── category/  # 카테고리 페이지
│   │   └── index.tsx  # 메인 페이지
│   ├── styles/        # 스타일 관련 파일
│   ├── types/         # TypeScript 타입 정의
│   └── utils/         # 유틸리티 함수
├── next.config.js     # Next.js 설정
├── package.json       # 프로젝트 의존성 및 스크립트
└── tailwind.config.js # Tailwind CSS 설정
```

## 실행 방법

### 개발 환경 설정
1. 저장소 클론
   ```bash
   git clone https://github.com/jinyounghwa/SubBill.git
   cd SubBill/subbill-web
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   ```
   브라우저에서 http://localhost:3000 접속

### 배포
```bash
npm run build
```

## 카테고리 구조
SubBill은 다음과 같은 주요 카테고리와 하위 카테고리로 서비스를 분류합니다:

- **AI**
  - 생성형 AI (ChatGPT Plus, Claude Pro, Midjourney 등)
  - 코딩보조 (GitHub Copilot, Tabnine 등)
  - 챗봇 (Chatbase, ManyChat 등)

- **생산성**
  - 교육 (Khan Academy+, Udemy 등)
  - 데이터 분석 (Tableau GPT, ThoughtSpot 등)
  - 비즈니스 생산성 (Notion AI, Microsoft Copilot 등)

- **영상·음성**
  - 비디오 (Netflix, YouTube Premium 등)
  - TTS (ElevenLabs, Play.ht 등)
  - 음악 (Spotify, Apple Music 등)
  - 이미지 생성 (Midjourney, DALL·E 등)

- **전문영역**
  - 법률 (Harvey, Lexis+ 등)
  - 의료 (UpToDate, Glass Health 등)
  - 금융 (Bloomberg Terminal 등)
  - 재테크 (뱅크샐러드 프리미엄, 토스 프라임 등)

- **보안**
  - 백신 (Malwarebytes, Norton 등)
  - 암호관리 (1Password, Bitwarden 등)
  - VPN (NordVPN, ProtonVPN 등)
