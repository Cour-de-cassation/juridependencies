const { readFile, readdir } = require("fs/promises");
const { resolve, basename } = require("path");
const { program, Option, InvalidArgumentError } = require("commander");
const { JurinetOracle } = require("./tables/jurinet-oracle");

if (!process.env.DBDSI_TABLE_JURINET)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

function parseNumber(value) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
}

function arrayShuffle(array) {
  if (!Array.isArray(array)) {
    throw new TypeError(`Expected an array, got ${typeof array}`);
  }
  for (let index = array.length - 1; index > 0; index--) {
    const newIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[newIndex]] = [array[newIndex], array[index]];
  }
  return array;
}

async function replaceVariables(filePath) {
  const file = await readFile(filePath, "utf8");
  const content = file.replace(/\$\{[^}]+\}/g, (pattern) => {
    return process.env[pattern.match(/[^${}]+/)[0]];
  });
  return {
    name: basename(filePath, "_template.sql"),
    content: content,
  };
}

async function updateDecision(source, id) {
  const now = new Date();
  const query = `UPDATE ${process.env.DBDSI_TABLE_JURINET} SET DT_MODIF=:now WHERE ID_DOCUMENT=:id`;
  await source.connection.execute(query, [now, id], {
    autoCommit: true,
  });
}

async function main() {
  const source = new JurinetOracle();
  await source.connect();

  program
    .addOption(
      new Option("-o, --operation <operation>", "type d'opération à effectuer")
        .choices(["add", "remove"])
        .makeOptionMandatory(),
    )
    .addOption(
      new Option("-t, --type <type>", "type d'enrichissement à ajouter")
        .choices(["simple", "multiple", "complexe"])
        .default("simple"),
    )
    .addOption(
      new Option(
        "-i, --id <number>",
        "identifiant source (Oracle) de la décision CC à enrichir",
      )
        .argParser(parseNumber)
        .makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "-r, --randomize",
        "utilise un jeu de données au hasard, parmi ceux disponibles (sinon, on utilise toujours le premier)",
      ).default(false),
    );

  program.parse();
  const options = program.opts();
  process.env.SOURCEID = options.id;

  switch (options.operation) {
    case "add":
      try {
        const enrichissementsTemplates = (
          await readdir(resolve(__dirname, "enrichissement"))
        ).map((_) => resolve(__dirname, "enrichissement", _));

        const enrichissementsPromises = enrichissementsTemplates.map(
          async (_) => replaceVariables(_),
        );

        const enrichissements = (
          await Promise.all(enrichissementsPromises)
        ).filter((_) => _.name.includes(options.type));

        const enrichissement = options.randomize
          ? arrayShuffle(enrichissements)[0].content
          : enrichissements[0].content;

        const queries = enrichissement.replace(/;\s*$/, "").split(/;\r?\n/);
        for (const query of queries) {
          await source.connection.execute(query, [], {
            autoCommit: true,
          });
        }
        await updateDecision(source, options.id);
        console.log(
          `Successfully added some "enrichissements" of type "${options.type}" to decision ${options.id}.`,
        );
      } catch (_) {
        console.error(_);
      }
      break;
    case "remove":
      try {
        const queries = [
          `DELETE FROM ANALYSE WHERE ID_DOCUMENT=:id`,
          `DELETE FROM TITREREFERENCE WHERE ID_DOCUMENT=:id`,
        ];
        for (const query of queries) {
          await source.connection.execute(query, [options.id], {
            autoCommit: true,
          });
        }
        await updateDecision(source, options.id);
        console.log(
          `Successfully removed "enrichissements" from decision ${options.id}.`,
        );
      } catch (_) {
        console.error(_);
      }
      break;
  }

  await source.close();
}

main();
