import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const schema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // AWS common
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SESSION_TOKEN: z.string().optional(),   // required for Learner Lab
  AWS_REGION: z.string().default('us-east-1'),

  // AWS Cognito
  COGNITO_USER_POOL_ID: z.string().min(1, 'COGNITO_USER_POOL_ID is required'),
  COGNITO_CLIENT_ID: z.string().min(1, 'COGNITO_CLIENT_ID is required'),
  COGNITO_CLIENT_SECRET: z.string().optional(), // required only if app client has a secret

  // AWS S3
  AWS_S3_BUCKET: z.string().optional(),

  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
