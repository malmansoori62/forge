/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ['lucide-react', 'recharts'] }
};
export default nextConfig;
