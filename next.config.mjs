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
            {
                hostname: 'ipfs.plyr.network',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    
    // redirect / to /swap
    async redirects() {
        return [
            { source: '/', destination: '/intro', permanent: false },
            {
                source: "/intro",
                destination: "/swap?intro=true",
                permanent: false,
              },
        ]
    },
};

export default nextConfig;

