/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost', 
      'www.gstatic.com', 
      'www.notion.so',
      'cdn-cgi',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'assets.nflxext.com',
      'storage.googleapis.com',
      'i.scdn.co',
      'cnbl-cdn.bamgrid.com',
      'lumiere-a.akamaihd.net',
      'www.apple.com',
      'img-prod-cms-rt-microsoft-com.akamaized.net',
      'cdn-dynmedia-1.microsoft.com',
      'www.adobe.com',
      'assets.nintendo.com',
      's.udemycdn.com',
      'a.slack-edge.com',
      'cdn.midjourney.com',
      'github.githubassets.com',
      'nordvpn.com',
      'static.vecteezy.com',
      'kmqjbmchpupkxcysywor.supabase.co' // Supabase Storage 도메인 추가
    ],
  },
  // Next.js 13 이상에서는 i18n이 app 디렉토리와 호환되지 않으므로 제거
  // 대신 middleware를 사용하여 구현 가능
};

module.exports = nextConfig;
