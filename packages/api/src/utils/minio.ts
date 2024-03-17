import * as Minio from "minio";

console.log(`process.env.MINIO_ENDPOINT`, process.env.MINIO_ENDPOINT);
console.log(`process.env.MINIO_ACCESS_KEY`, process.env.MINIO_ACCESS_KEY);
console.log(`process.env.MINIO_SECRET_KEY`, process.env.MINIO_SECRET_KEY);

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT as string,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});
