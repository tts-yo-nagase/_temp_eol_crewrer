/**
 * Next.js Configuration File
 * 
 * This file configures various aspects of the Next.js application, including:
 * - Custom HTTP headers for security and functionality
 * 
 * @type {import('next').NextConfig}
 */

// Define custom HTTP headers
const headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY', // Prevents clickjacking attacks
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff', // Prevents MIME type sniffing
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin', // Controls how much referrer information is included with requests
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()', // Restricts usage of browser features
        },
        {
          key: 'example',
          value: 'hogehogehoge' // Example custom header
        },
      ],
    },
  ];
};

// Next.js configuration object
const nextConfig = {
  headers, // Apply the custom headers
};

export default nextConfig;
