const { Client } = require("@elastic/elasticsearch")
const { readFile } = require('fs/promises')
const { resolve } = require('path')


if (!process.env.NODE_ENV) require('dotenv').config({ path: resolve(__dirname, '..', '..', '.env') })

async function insertData(client, indexName) {
    const raw = await readFile(resolve(__dirname, "db", `${indexName}.json`))

    const response = await client.bulk(
        { refresh: true, body: JSON.parse(raw).flatMap(doc => [{ index: { _index: indexName } }, doc]) }
    )
    return response.errors

}

async function main() {
    const client = new Client({ node: `${process.env.DB_ELASTIC_NODE}:${process.env.DB_ELASTIC_EXTERNAL_PORT}`, ssl: { rejectUnauthorized: false } })
    const indexes = [
        `${process.env.DB_ELASTIC_DECISIONS_INDEX}`,
        `${process.env.DB_ELASTIC_TRANSACTIONS_INDEX}`,
    ];
    console.log(indexes)

    return Promise.all(indexes.map(indexName => insertData(client, indexName)))
}


main()
    .then(console.log)
    .catch(console.error)
    .finally((_) => process.exit())
