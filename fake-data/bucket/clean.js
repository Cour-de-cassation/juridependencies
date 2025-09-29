const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const { resolve } = require("path");

if (!process.env.NODE_ENV)
  require("dotenv").config({ path: resolve(__dirname, "..", "..", ".env") });

const {
  BUCKET_ACCESS_KEY,
  BUCKET_ACCESS_SECRET,
  BUCKET_PORT,
  BUCKET_JURITJ_NAME_NORMALIZED,
  BUCKET_JURITJ_NAME_RAW,
  BUCKET_JURITCOM_NAME_NORMALIZED,
  BUCKET_JURITCOM_NAME_RAW,
  BUCKET_JURITCOM_NAME_PDF2TEXT_SUCCESS,
  BUCKET_JURITCOM_NAME_PDF2TEXT_FAILED,
  BUCKET_JURITCOM_NAME_DELETION,
  BUCKET_JURITCOM_NAME_PDF,
  BUCKET_PORTALIS_COLLECT_NAME,
} = process.env;

const S3Options = {
  endpoint: "http://localhost:" + BUCKET_PORT,
  forcePathStyle: true,
  region: "us-east-1",
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_ACCESS_SECRET,
  },
};

const s3Client = new S3Client(S3Options);

async function listAll(name, continuationToken) {
  const result = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: name,
      ContinuationToken: continuationToken,
    })
  );
  if (result.IsTruncated)
    return [
      ...(result.Contents ?? []),
      ...listAll(name, result.NextContinuationToken),
    ];
  return result.Contents ?? [];
}

function deleteFile(bucket, name) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: name,
    })
  );
}

async function dropAll(name) {
  const list = await listAll(name);
  return Promise.all(list.map((_) => deleteFile(name, _.Key)));
}

async function main() {
  const buckets = [
    BUCKET_JURITJ_NAME_NORMALIZED,
    BUCKET_JURITJ_NAME_RAW,
    BUCKET_JURITCOM_NAME_NORMALIZED,
    BUCKET_JURITCOM_NAME_RAW,
    BUCKET_JURITCOM_NAME_PDF2TEXT_SUCCESS,
    BUCKET_JURITCOM_NAME_PDF2TEXT_FAILED,
    BUCKET_JURITCOM_NAME_DELETION,
    BUCKET_JURITCOM_NAME_PDF,
    BUCKET_PORTALIS_COLLECT_NAME,
  ];

  return Promise.all(buckets.map(dropAll));
}

main()
  .then(console.log)
  .catch(console.error)
  .finally((_) => process.exit());
