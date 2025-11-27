const express = require("express")
const { readFile } = require("fs/promises")
const { resolve } = require("path")
const multer = require("multer")

const PORT = process.env.API_PORT ?? 8081

const app = express()
app.use(express.json())

async function getEntitiesMocked(filename, categories = []) {
    const entitiesMocked = JSON.parse(await readFile(resolve(__dirname, filename)))
    const entities = entitiesMocked.entities.filter(e => categories.includes(e.category))
    return {
        ...entitiesMocked,
        entities
    }
    
}

app.post("/ner", async (req, res) => {
    switch (req.body?.sourceName) {
        case "jurinet": return res.status(200).json(await getEntitiesMocked("ner/cc.json", req.body?.category))
        case "jurica": return res.status(200).json(await getEntitiesMocked("ner/ca.json", req.body?.category))
        case "juritj": return res.status(200).json(await getEntitiesMocked("ner/tj.json", req.body?.category))
        case "juritcom": return res.status(200).json(await getEntitiesMocked("ner/tcom.json", req.body?.category))
        default: return res.status(422).json({ error: "[MOCK-API] sourceName not supported" })
    }
})

app.post("/pdf-to-text", multer().single("pdf_file"), async (req, res) => {
    console.log(req.file)
    if (req.file?.originalname?.startsWith('TCOM_FAKE')) return res.status(200).json(JSON.parse(await readFile(resolve(__dirname, "pdf-to-text/tcom.json"))))
    else return res.status(400).json({ error: "[MOCK-API] filename not supported (should begins with TCOM_FAKE)" })
})

app.listen(PORT, () => console.log(`[MOCK-API] listen on port ${PORT}`))