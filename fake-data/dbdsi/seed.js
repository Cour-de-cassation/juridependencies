const { resolve } = require("path");
const { readFile, readdir } = require("fs/promises");

const { JurinetOracle } = require("./tables/jurinet-oracle");
const { JuricaOracle } = require("./tables/jurica-oracle");

if (!process.env.NODE_ENV)
  require("dotenv").config({ path: resolve(__dirname, "..", "..", ".env") });

async function seeds(source, files) {
  await source.connect();

  return Promise.allSettled(
    files.map(async (fileName) => {
      const query = await readFile(
        resolve(__dirname, "seeds", fileName),
        "utf8"
      );
      return source.connection
        .execute(query.replace(/;$/, ""), [], {
          autoCommit: true,
        })
        .catch((_) => {
          _.message = fileName + ": " + _.message;
          throw _;
        });
    })
  );
}

async function main() {
  const jurinetSource = new JurinetOracle();
  const juricaSource = new JuricaOracle();

  const seedFiles = await readdir(resolve(__dirname, "seeds"));
  const queryFiles = seedFiles.filter((_) => !_.endsWith("template.sql"));

  return Promise.all([
    seeds(
      juricaSource,
      queryFiles.filter((_) => _.startsWith("CA"))
    ),
    seeds(
      jurinetSource,
      queryFiles.filter((_) => _.startsWith("CC"))
    ),
  ]);
}

main()
  .then((_) => console.dir(_, { depth: null }))
  .catch((_) => console.dir(_, { depth: null }));
