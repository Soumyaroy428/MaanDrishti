/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.leaflet = require.resolve("./lib/leaflet-ssr-shim.js");
      config.resolve.alias["leaflet/dist/leaflet.css"] = require.resolve("./lib/leaflet-ssr-shim.css");
      config.resolve.alias["react-router-dom"] = require.resolve("./lib/router-ssr-shim.js");
    }
    return config;
  },
};

module.exports = nextConfig;
