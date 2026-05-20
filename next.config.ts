import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Os erros são causados pelo stub em src/types/database.ts.
    // Gere os tipos reais com:
    //   npx supabase gen types typescript --project-id gmtfebfazptpmnnfiygh > src/types/database.ts
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
