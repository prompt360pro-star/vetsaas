/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@vetsaas/shared'],
    images: {
        domains: ['localhost'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
