const express = require("express")
const { readFile } = require("fs/promises")
const { resolve } = require("path")
const multer = require("multer")

const PORT = process.env.API_PORT ?? 8081

const app = express()
app.use(express.json())

async function getEntitiesMocked(filename, categories = []) {
    const resultMocked = JSON.parse(await readFile(resolve(__dirname, filename)))
    const entities = resultMocked.entities.filter(e => categories.includes(e.category))
    return {
        ...resultMocked,
        entities
    }
}

app.post("/ner", async (req, res) => {
    const sourceName = req.body?.sourceName
    console.log(`[MOCK-API] POST /ner — sourceName=${sourceName}`)
    switch (sourceName) {
        case "jurinet": return res.status(200).json(await getEntitiesMocked("ner/cc.json", req.body?.categories))
        case "jurica": return res.status(200).json(await getEntitiesMocked("ner/ca.json", req.body?.categories))
        case "juritj": return res.status(200).json(await getEntitiesMocked("ner/tj.json", req.body?.categories))
        case "juritcom": return res.status(200).json(await getEntitiesMocked("ner/tcom.json", req.body?.categories))
        case "portalis-cph": return res.status(200).json(await getEntitiesMocked("ner/portalis-cph.json", req.body?.categories))
        default: return res.status(422).json({ error: "[MOCK-API] sourceName not supported" })
    }
})

app.post("/pdf-to-text", multer().single("pdf_file"), async (req, res) => {
    const filename = req.file?.originalname
    console.log(`[MOCK-API] POST /pdf-to-text — filename=${filename}`)
    if (filename?.startsWith('CPH_FAKE')) {
        const result = JSON.parse(await readFile(resolve(__dirname, "pdf-to-text/portalis-cph.json")))
        console.log(`[MOCK-API] /pdf-to-text OK — CPH`)
        return res.status(200).json(result)
    } else {
        const result = JSON.parse(await readFile(resolve(__dirname, "pdf-to-text/tcom.json")))
        console.log(`[MOCK-API] /pdf-to-text OK — TCOM`)
        return res.status(200).json(result)
    }
})

app.listen(PORT, () => console.log(`[MOCK-API] listen on port ${PORT}`))