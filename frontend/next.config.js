const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_CDN_DOMAIN
        ? (() => {
          try {
            return new URL(process.env.NEXT_PUBLIC_CDN_DOMAIN).hostname;
          } catch (error) {
            console.warn('Invalid NEXT_PUBLIC_CDN_DOMAIN URL:', process.env.NEXT_PUBLIC_CDN_DOMAIN);
            return null;
          }
        })()
        : null
    ].filter(Boolean),
  },
};

module.exports = withPlugins([[withImages]], nextConfig);
