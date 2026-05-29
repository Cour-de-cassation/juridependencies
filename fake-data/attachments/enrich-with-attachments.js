const { MongoClient, ObjectId } = require("mongodb");
const { writeFile } = require("fs/promises");
const { resolve } = require("path");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

async function main() {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error("Usage: node enrich-with-attachments.js <decisionId>");
    process.exit(1);
  }

  const client = new MongoClient(`mongodb://localhost:${process.env.DBSDER_PORT}`);
  await client.connect();

  const sderDb = client.db(process.env.DBSDER_DATABASE);
  const attachmentsDb = client.db(process.env.ATTACHMENTS_DATABASE);

  const decision = await sderDb
    .collection("decisions")
    .findOne({ _id: new ObjectId(targetId), sourceName: "jurinet" });

  if (!decision) throw new Error(`No jurinet decision found for id: ${targetId}`);

  const files = await attachmentsDb
    .collection("files")
    .find({})
    .limit(1)
    .toArray();

  if (!files.length) throw new Error("No files found in attachments — run attachments:seeds first");

  const decisionId = decision._id.toString();
  const [file] = files;

  await attachmentsDb
    .collection("files")
    .updateOne({ _id: file._id }, { $set: { decisionId } });

  await attachmentsDb
    .collection("latest")
    .updateOne(
      { userId: file.userId, decisionId },
      { $set: { userId: file.userId, decisionId, date: file.date } },
      { upsert: true }
    );

  await attachmentsDb.collection("logs").insertOne({
    action: "Document added",
    fileId: file._id,
    decisionId,
    userId: file.userId,
    date: file.date,
  });

  const dirPath = resolve(__dirname, "..", "attachments", "db");

  await Promise.all(
    ["files", "latest", "logs"].map(async (collectionName) => {
      const data = await attachmentsDb.collection(collectionName).find({}).toArray();
      await writeFile(
        resolve(dirPath, `${collectionName}.json`),
        JSON.stringify(data, null, 2),
        "utf8"
      );
    })
  );

  console.log(`Enriched decision ${targetId} with attachment ${file._id}`);

  await client.close();
}

main().catch(console.error).finally(() => process.exit());