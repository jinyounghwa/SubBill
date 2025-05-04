/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Next.js 13 이상에서는 i18n이 app 디렉토리와 호환되지 않으므로 제거
  // 대신 middleware를 사용하여 구현 가능
};

module.exports = nextConfig;
