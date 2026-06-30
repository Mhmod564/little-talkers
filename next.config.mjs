/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The old vanilla prototype files live alongside the app as reference; ignore them.
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
