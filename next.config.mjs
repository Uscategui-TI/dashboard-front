/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  productionBrowserSourceMaps: false, // Deshabilitar mapas de fuentes en producción
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }; // Oculta advertencias de Webpack
    config.stats = 'errors-only'; 
    return config;
  },
};
export default nextConfig;
