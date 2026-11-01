/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "**.mypinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
  webpack: (config, { webpack }) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    // @rainbow-me/rainbowkit's default Coinbase Smart Wallet connector pulls in
    // @coinbase/cdp-sdk, which statically imports the @x402/* packages for
    // Coinbase's x402 payment protocol. Those packages are optional peer deps
    // that npm does NOT install, so webpack fails to resolve them at build time.
    // This app never uses x402 payments, so it's safe to stub these out.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@x402\//,
      })
    );

    return config;
  },
};

module.exports = nextConfig;
