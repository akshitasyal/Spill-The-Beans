import { z } from 'zod';

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required for authentication'),
  VITE_API_URL: z.string().url('Invalid server api url specified').default('http://localhost:4000'),
  VITE_MAINTENANCE_MODE: z.string().transform(val => val === 'true').optional().default('false'),
});

const getEnv = () => {
  const result = envSchema.safeParse({
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE,
  });

  if (!result.success) {
    console.error('❌ Invalid or missing Environment Variables:', result.error.format());
    // Fallback/log warning, don't crash hard if it is a demo environment
    return {
      VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
      VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      VITE_MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    };
  }

  return result.data;
};

export const env = getEnv();
export default env;
