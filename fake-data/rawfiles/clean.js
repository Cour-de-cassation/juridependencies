const { MongoClient } = require("mongodb");
const { resolve } = require("path");
const { program } = require("commander");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

program.option("-c, --collection <name>").parse();
const { collection: targetCollection } = program.opts();

async function main() {
  const client = new MongoClient(
    `mongodb://localhost:${process.env.DBSDER_PORT}/rawFiles`
  );
  await client.connect();

  const collections = await client.db().collections();
  const target = targetCollection
    ? collections.filter((_) => _.collectionName === targetCollection)
    : collections;

  return Promise.all(target.map((_) => _.drop()));
}

main()
  .then(() => console.log("rawFiles deleted"))
  .catch(console.error)
  .finally(() => process.exit());
