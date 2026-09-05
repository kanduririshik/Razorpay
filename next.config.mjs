/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "https://api.razorpay.com/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
