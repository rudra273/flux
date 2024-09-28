// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
      API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
  }
  
  export default nextConfig;