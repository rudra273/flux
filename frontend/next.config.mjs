// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   output: 'standalone',
//   images: {
//     domains: ['unsplash.com'], 
//   },
//   // async headers() {
//   //   return [
//   //     {
//   //       source: '/:path*',
//   //       headers: [
//   //         {
//   //           key: 'Content-Security-Policy',
//   //           value: 'upgrade-insecure-requests'
//   //         }
//   //       ]
//   //     }
//   //   ]
//   // }
// }

// export default nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enabling or disabling strict mode in React
  reactStrictMode: false,

  // Output set to standalone, useful for Docker deployments
  output: 'standalone',

  // Configuring domains allowed for image loading
  images: {
    domains: ['unsplash.com'], // Add any other domains if necessary
  },

  // Function to set custom headers, applied only in production
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'; // Check if environment is production
    
    if (isProduction) {
      return [
        {
          source: '/:path*', // Apply to all routes
          headers: [
            {
              key: 'Content-Security-Policy',
              value: 'upgrade-insecure-requests', // Upgrading all HTTP requests to HTTPS
            },
          ],
        },
      ];
    }
    return []; // No headers applied in development
  },
};

export default nextConfig;


