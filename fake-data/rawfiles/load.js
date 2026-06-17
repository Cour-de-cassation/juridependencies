const { MongoClient, BSON } = require("mongodb");
const { readFile, readdir } = require("fs/promises");
const { resolve } = require("path");
const { program } = require("commander");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

program.option("-c, --collection <name>").parse();
const { collection: targetCollection } = program.opts();

async function readCollections() {
  const path = resolve(__dirname, "db");
  const files = targetCollection
    ? [`${targetCollection}.json`]
    : await readdir(path);

  return files.map((_) => ({
    collectionName: _.slice(0, _.length - ".json".length),
    path: resolve(path, _),
  }));
}

async function saveCollections(client, { collectionName, path }) {
  const collection = await client.db().createCollection(collectionName);
  const save = await readFile(path, "utf8");

  const saveParse = BSON.EJSON.parse(save);

  if (saveParse.length <= 0) return;
  return collection.insertMany(saveParse);
}

async function main() {
  const client = new MongoClient(
    `mongodb://localhost:${process.env.DBSDER_PORT}/rawFiles`
  );
  await client.connect();

  const collections = await readCollections();

  return Promise.all(collections.map((_) => saveCollections(client, _)));
}

main()
  .then(() => console.log("rawFiles loaded"))
  .catch(console.error)
  .finally(() => process.exit());
