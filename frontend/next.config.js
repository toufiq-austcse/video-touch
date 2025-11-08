const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");
/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_CDN_DOMAIN
        ? new URL(process.env.NEXT_PUBLIC_CDN_DOMAIN).hostname
        : null
    ].filter(Boolean),
  },
};

module.exports = withPlugins([[withImages]], nextConfig);
