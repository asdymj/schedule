/** @type {import('next').NextConfig} */
const nextConfig = {
  // M1~M4: Vercel 통합 배포 (Frontend + API Routes). output: 'export' 사용 금지 — 동적 라우트(app/g/[gid]/*)와 충돌
  reactStrictMode: true,
  images: {
    // 목업/외부(Supabase Storage, Kakao Map 등) 이미지 도메인 다양성 대응 — 서버리스 환경 최적화 비용 회피
    unoptimized: true,
  },
};

module.exports = nextConfig;
