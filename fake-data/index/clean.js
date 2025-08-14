const { MongoClient } = require('mongodb')
const { resolve } = require("path")

if (!process.env.NODE_ENV) require('dotenv').config({ path: resolve(__dirname, '..', '..', '.env') })

async function main() {
  const client = new MongoClient(`mongodb://localhost:${process.env.DBSDER_PORT}/${process.env.INDEX_DATABASE}`)
  await client.connect()

  const collections = await client.db().collections()
  
  return Promise.all(collections.map((_) => _.drop()))
}

main()
  .then(console.log)
  .catch(console.error)
  .finally((_) => process.exit())
