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
    unoptimized: true, // Netlify 배포를 위한 설정
  },
  // Netlify 배포를 위한 설정
  trailingSlash: true,
  // 정적 내보내기 설정
  output: 'export',
};

module.exports = nextConfig;
