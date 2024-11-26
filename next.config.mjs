/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    //assetPrefix: 'http://localhost:3000/',
    reactStrictMode: false,
    images: {
        domains: ['tokenlist.onplyr.com'],
    },
};

export default nextConfig;

