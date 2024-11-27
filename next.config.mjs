/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    //assetPrefix: 'http://localhost:3000/',
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                hostname: 'tokenlist.onplyr.com',
            },
        ],
    },
};

export default nextConfig;

