const { Client } = require("@elastic/elasticsearch")
const { resolve } = require("path")
const { readFile } = require('fs/promises')


if (!process.env.NODE_ENV) require('dotenv').config({ path: resolve(__dirname, '..', '..', '.env') })

    // async function deleteAllDataFromIndex(client, indexName) {
//     const response = await client.deleteByQuery({
//         index: indexName,
//         body: {
//             query: {
//                 match_all: {}
//             }
//         }
//     });
//     return response.deleted
// }

async function dropIndex(client, indexName) {
    const response = await client.indices.delete({
        index: indexName
    });
    return response.deleted
}

async function createIndex(client, indexName) {
    const properties = await readFile(resolve(__dirname, `mapping_${indexName}.json`))
    const raw = await client.indices.create({
        index: indexName,
        body: JSON.parse(properties)
        
    });
    return true;
}

async function main() {
    const client = new Client({ node: `${process.env.DB_ELASTIC_NODE}:${process.env.DB_ELASTIC_EXTERNAL_PORT}`, ssl: { rejectUnauthorized: false } })
    const indexes = [
        `${process.env.DB_ELASTIC_DECISIONS_INDEX}`,
        `${process.env.DB_ELASTIC_TRANSACTIONS_INDEX}`,
    ];
    console.log(indexes)

    await Promise.all(indexes.map(indexName => dropIndex(client, indexName)))
    return Promise.all(indexes.map(indexName=> createIndex(client, indexName)))
}


main()
    .then(console.log)
    .catch(console.error)
    .finally((_) => process.exit())
