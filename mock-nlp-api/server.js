const express = require("express");
const { readFile } = require("fs/promises");
const { resolve } = require("path");
const multer = require("multer");

const PORT = process.env.API_PORT ?? 8081;

const app = express();
app.use(express.json());

async function getEntitiesMocked(filename, categories = []) {
  const resultMocked = JSON.parse(await readFile(resolve(__dirname, filename)));
  const entities = resultMocked.entities.filter((e) =>
    categories.includes(e.category),
  );
  return {
    ...resultMocked,
    entities,
  };
}

app.post("/ner", async (req, res) => {
  console.log(req.body);
  switch (req.body?.sourceName) {
    case "jurinet":
      return res
        .status(200)
        .json(await getEntitiesMocked("ner/cc.json", req.body?.categories));
    case "jurica":
      return res
        .status(200)
        .json(await getEntitiesMocked("ner/ca.json", req.body?.categories));
    case "juricav2":
      return res
        .status(200)
        .json(await getEntitiesMocked("ner/ca.json", req.body?.categories));
    case "juritj":
      return res
        .status(200)
        .json(await getEntitiesMocked("ner/tj.json", req.body?.categories));
    case "juritcom":
      return res
        .status(200)
        .json(await getEntitiesMocked("ner/tcom.json", req.body?.categories));
    case "portalis-cph":
      return res
        .status(200)
        .json(
          await getEntitiesMocked(
            "ner/portalis-cph.json",
            req.body?.categories,
          ),
        );
    default:
      return res.status(422).json({
        error: `[MOCK-API] sourceName ${req.body?.sourceName} not supported`,
      });
  }
});

app.post("/pdf-to-text", multer().single("pdf_file"), async (req, res) => {
  if (req.file?.originalname?.startsWith("TCOM_FAKE"))
    return res
      .status(200)
      .json(
        JSON.parse(await readFile(resolve(__dirname, "pdf-to-text/tcom.json"))),
      );
  else if (req.file?.originalname?.startsWith("CPH_FAKE"))
    return res
      .status(200)
      .json(
        JSON.parse(
          await readFile(resolve(__dirname, "pdf-to-text/portalis-cph.json")),
        ),
      );
  else
    return res.status(400).json({
      error:
        "[MOCK-API] filename not supported (should begins with TCOM_FAKE or CPH_FAKE)",
    });
});

app.listen(PORT, () => {
  console.log(`[MOCK-API] listen on port ${PORT}`);
});
