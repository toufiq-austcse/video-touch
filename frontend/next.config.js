const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");
/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_CDN_DOMAIN, "eogwqo2k9i.gpcdn.net"],
  },
};

module.exports = withPlugins([[withImages]], nextConfig);
