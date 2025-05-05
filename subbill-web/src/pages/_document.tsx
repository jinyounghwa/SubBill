import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 파비콘 */}
        <link rel="icon" href="/search-icon.svg" />
        
        {/* 메타 태그 */}
        <meta name="description" content="다양한 구독 서비스를 한눈에 비교하고 확인하세요. SubBill에서 최적의 구독 서비스를 찾아보세요." />
        <meta name="keywords" content="구독, 서비스, 비교, 리뷰, AI, 생산성, 엔터테인먼트" />
        <meta name="author" content="SubBill" />
        
        {/* 오픈그래프 태그 */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://subbill.com" />
        <meta property="og:title" content="SubBill - 구독 서비스 비교 플랫폼" />
        <meta property="og:description" content="다양한 구독 서비스를 한눈에 비교하고 확인하세요. SubBill에서 최적의 구독 서비스를 찾아보세요." />
        <meta property="og:image" content="/subbill-logo.svg" />
        
        {/* 트위터 카드 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SubBill - 구독 서비스 비교 플랫폼" />
        <meta name="twitter:description" content="다양한 구독 서비스를 한눈에 비교하고 확인하세요. SubBill에서 최적의 구독 서비스를 찾아보세요." />
        <meta name="twitter:image" content="/subbill-logo.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
