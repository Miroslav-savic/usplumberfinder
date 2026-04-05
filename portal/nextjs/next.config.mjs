/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages that use ES modules
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
};

export default nextConfig;
