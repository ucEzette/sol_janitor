/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: false, // CRITICAL: Must remain FALSE
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana/web3.js',
    'gamba-react-v2',
    'gamba-react-ui-v2',
    'gamba-core-v2',
    '@preact/signals-react',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@preact/signals-react': path.resolve(__dirname, 'node_modules/@preact/signals-react'),
    };
    config.resolve.fallback = {
      fs: false, path: false, os: false, crypto: false, stream: false, pino: false,
    };
    return config;
  },
};

export default nextConfig;