const { MongoClient } = require("mongodb");
const { resolve } = require("path");

if (!process.env.NODE_ENV)
  require("dotenv").config({ path: resolve(__dirname, "..", "..", ".env") });

async function main() {
  const client = new MongoClient(
    `mongodb://localhost:${process.env.JURIPILOTDB_PORT}/${process.env.JURIPILOT_DATABASE}`,
  );
  await client.connect();

  const dbCollections = await client.db().collections();
  const collections = dbCollections.flat();

  return Promise.all(collections.map((_) => _.drop()));
}

main()
  .then(() => console.log("Juripilot deleted"))
  .catch(console.error)
  .finally(() => process.exit());
