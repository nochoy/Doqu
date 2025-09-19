import type { NextConfig } from 'next';
import path from 'path';
import dotenv from 'dotenv';

// Custom .env file path
dotenv.config({ path: path.resolve(__dirname, '../.envs/.local/.frontend') });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
