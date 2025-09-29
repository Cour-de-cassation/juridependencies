const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const { readdir, readFile } = require("fs/promises");
const { resolve } = require("path");

if (!process.env.NODE_ENV)
  require("dotenv").config({ path: resolve(__dirname, "..", "..", ".env") });

const {
  BUCKET_ACCESS_KEY,
  BUCKET_ACCESS_SECRET,
  BUCKET_PORT,
  BUCKET_JURITJ_NAME_RAW,
  BUCKET_JURITCOM_NAME_RAW,
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

function saveFile(bucket, name, buffer) {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: name,
      Body: buffer,
    })
  );
}

async function main() {
  const tjPaths = await readdir(resolve(__dirname, "tj"));
  const tcomPaths = await readdir(resolve(__dirname, "tcom"));
  const cphPaths = await readdir(resolve(__dirname, "cph"));

  const tcomPdf = tcomPaths.filter(_ => _.endsWith('.pdf')) 
  const tcomJson = tcomPaths.filter(_ => _.endsWith('.json')) 

  return Promise.all([
    Promise.all(
      tjPaths.map(async (_) => {
        const file = await readFile(resolve(__dirname, "tj", _));
        return saveFile(BUCKET_JURITJ_NAME_RAW, _, file);
      })
    ),
    Promise.all(
      tcomJson.map(async (_) => {
        const file = await readFile(resolve(__dirname, "tcom", _));
        return saveFile(BUCKET_JURITCOM_NAME_RAW, _, file);
      })
    ),
    Promise.all(
      tcomPdf.map(async (_) => {
        const file = await readFile(resolve(__dirname, "tcom", _));
        return saveFile(BUCKET_JURITCOM_NAME_PDF, _, file);
      })
    ),
    Promise.all(
      cphPaths.map(async (_) => {
        const file = await readFile(resolve(__dirname, "cph", _));
        return saveFile(BUCKET_PORTALIS_COLLECT_NAME, _, file);
      })
    ),
  ]);
}

main()
  .then(console.log)
  .catch(console.error)
  .finally((_) => process.exit());
