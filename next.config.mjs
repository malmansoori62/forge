/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export so the app can be bundled into a Capacitor APK
  // (no server needed; entire app runs inside the WebView).
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ['lucide-react', 'recharts'] }
};
export default nextConfig;
