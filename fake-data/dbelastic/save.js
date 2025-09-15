const { Client } = require("@elastic/elasticsearch")
const { writeFile } = require('fs/promises')
const { existsSync, mkdirSync } = require('fs')
const { resolve } = require('path')


if (!process.env.NODE_ENV) require('dotenv').config({ path: resolve(__dirname, '..', '..', '.env') })


async function exportIndex(client, indexName) {
    const raw = await client.search({
        index: indexName,
        size: 10000,
        body: {
            query: {
                match_all: {}
            }
        }
    });
    const hits = raw.body.hits.hits.map(hit => hit._source);
    const dirPath = resolve(__dirname, 'db')

    if (!existsSync(dirPath)) mkdirSync(dirPath)

    await writeFile(resolve(dirPath, `${indexName}.json`), JSON.stringify(hits, null, 2), 'utf8')
    return hits.length;
}

async function main() {
    const client = new Client({ node: `${process.env.DB_ELASTIC_NODE}:${process.env.DB_ELASTIC_EXTERNAL_PORT}`, ssl: { rejectUnauthorized: false } })
    const indexes = [
        `${process.env.DB_ELASTIC_DECISIONS_INDEX}`, 
        `${process.env.DB_ELASTIC_TRANSACTIONS_INDEX}`,
    ];
    console.log(indexes)

    return Promise.all(indexes.map(indexName => exportIndex(client, indexName)))
}


main()
    .then(console.log)
    .catch(console.error)
    .finally((_) => process.exit())
