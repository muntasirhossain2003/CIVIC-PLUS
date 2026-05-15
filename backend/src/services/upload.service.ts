import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env';

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId:     env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        sessionToken:    env.AWS_SESSION_TOKEN, // required for Learner Lab
      }
    : undefined,
});

export const uploadService = {
  async getPresignedUrl(filename: string, contentType: string, userId: string) {
    if (!env.AWS_S3_BUCKET) throw Object.assign(new Error('S3 not configured'), { status: 503 });

    const ext = filename.split('.').pop() ?? 'jpg';
    const key = `issues/${userId}/${uuid()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket:      env.AWS_S3_BUCKET,
      Key:         key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes

    return { url, key };
  },
};
