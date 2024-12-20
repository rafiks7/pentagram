"use server";

import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export async function uploadImage(imageBuffer: ArrayBuffer, filename: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: new Uint8Array(imageBuffer),
    ContentType: "image/jpeg",
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error("Error while uploading image:", error);
  }

  const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
  return publicUrl;
}

export async function listImages() {
  // list images from s3
  const command = new ListObjectsCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
  });

  const images: string[] = [];

  try {
    const response = await client.send(command);
    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          console.log("Key:", obj.Key);
          images.push(
            `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${obj.Key}`
          );
        }
      }
    }

    console.log("Images received from s3:", images);
    return images;
  } catch (error) {
    console.error("Error while listing images:", error);
  }
}

export async function deleteImage(imageUrl: string) {
  console.log("Deleting image:", imageUrl);
  const filename = imageUrl.split("/").pop();
  if (!filename) {
    console.error("Invalid image URL:", imageUrl);
    return;
  }
  console.log("Filename:", filename);

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
  });

  try {
    await client.send(command);
    console.log("Image deleted successfully:", imageUrl);
  } catch (error) {
    console.error("Error while deleting image:", error);
  }
}
