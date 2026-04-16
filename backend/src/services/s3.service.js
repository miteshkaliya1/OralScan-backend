import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";

const s3 = new S3Client({
  region: env.s3.region,
  endpoint: env.s3.endpoint || undefined,
  forcePathStyle: Boolean(env.s3.endpoint),
  credentials: env.s3.accessKey
    ? {
        accessKeyId: env.s3.accessKey,
        secretAccessKey: env.s3.secretKey,
      }
    : undefined,
});

export async function uploadImage({ buffer, mimeType, originalName }) {
  const extension = (originalName.split(".").pop() || "jpg").toLowerCase();
  const objectKey = `cases/${uuidv4()}.${extension}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const fileUrl = env.s3.publicBaseUrl
      ? `${env.s3.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`
      : `${env.s3.endpoint.replace(/\/$/, "")}/${env.s3.bucket}/${objectKey}`;

    return { objectKey, fileUrl };
  } catch (error) {
    if (env.nodeEnv !== "development") {
      throw error;
    }

    const localKey = `local/${uuidv4()}.${extension}`;
    const relativePath = path.join("uploads-local", localKey);
    const absolutePath = path.resolve(process.cwd(), relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
      objectKey: localKey,
      fileUrl: `${env.apiBaseUrl}/uploads-local/${localKey}`,
    };
  }
}
