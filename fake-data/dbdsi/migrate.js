const { resolve } = require("path");
const { readFile } = require("fs/promises");

const { JurinetOracle } = require("./tables/jurinet-oracle");
const { PenalOracle } = require("./tables/penal-oracle");
const { JuricaOracle } = require("./tables/jurica-oracle");
const { GRCOMOracle } = require("./tables/grcom-oracle");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

function splitQueries(queryString) {
  return queryString.replaceAll(";", "").split(/^\n/gm);
}

async function sequentialQueries(source, queries) {
  for (const query of queries) {
    await source.connection.execute(query);
  }
}

async function migrate(source,  schema) {
  await source.connect();

  const queryString = await readFile(
    resolve(__dirname, "migrations", schema),
    "utf8"
  );
  const queries = splitQueries(queryString);

  return sequentialQueries(source, queries)
    .finally(() => source.close());
}

async function main() {
  try {
    const command =
      process.argv[2] === "up"
        ? "create"
        : process.argv[2] === "down"
        ? "drop"
        : null;

    if (!command) {
      console.log(
        "node migrate.js [ACTION]\n\n" +
          "ACTION:\n" +
          "up: create all schema in database\n" +
          "down: drop all schema in database\n"
      );
      return;
    }

    const jurinetSource = new JurinetOracle();
    const juricaSource = new JuricaOracle();
    const penalSource = new PenalOracle();
    const grcomSource = new GRCOMOracle();

    await migrate(jurinetSource, `jurinet_${command}_schema.sql`);
    await migrate(juricaSource, `jurica_${command}_schema.sql`);
    await migrate(penalSource, `penal_${command}_schema.sql`);
    await migrate(grcomSource, `grcom_${command}_schema.sql`);

    console.log("Migrate exit with success");
  } catch (_) {
    console.error(_);
  }
}

main()
