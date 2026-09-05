/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "https://api.razorpay.com/v1/:path*",
      },
      {
        source: "/v2/:path*",
        destination: "https://api.razorpay.com/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
