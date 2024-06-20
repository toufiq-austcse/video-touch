const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
   domains:["cdn.toufiq.dev"],
  }
};

module.exports = withPlugins([[withImages]], nextConfig)
