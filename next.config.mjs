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
    // redirect / to /swap
    async redirects() {
        return [
            { source: '/', destination: '/swap', permanent: true },
        ]
    },
};

export default nextConfig;

