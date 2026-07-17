const { readFile } = require("fs/promises");
const { resolve } = require("path");
const { ClientCredentials } = require("simple-oauth2");
const axios = require("axios");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

if (!process.env.JURICA_COLLECT_ACCESS_ID) {
  console.error("Missing env variable JURICA_COLLECT_ACCESS_ID");
  process.exit(1);
}

if (!process.env.JURICA_COLLECT_ACCESS_KEY) {
  console.error("Missing env variable JURICA_COLLECT_ACCESS_KEY");
  process.exit(1);
}

if (!process.env.JURICA_COLLECT_ACCESS_URL) {
  console.error("Missing env variable JURICA_COLLECT_ACCESS_URL");
  process.exit(1);
}

const oAuthConfig = {
  client: {
    id: process.env.JURICA_COLLECT_ACCESS_ID,
    secret: process.env.JURICA_COLLECT_ACCESS_KEY,
  },
  auth: {
    tokenHost: process.env.JURICA_COLLECT_ACCESS_URL,
    tokenPath: "/token",
  },
};

async function readData() {
  const path = resolve(__dirname, "db");
  const data = await readFile(
    resolve(path, "cours_appel_decisions.json"),
    "utf8",
  );
  return JSON.parse(data);
}

async function pushData(data, accessToken) {
  try {
    const response = await axios.post(
      `${process.env.JURICA_COLLECT_ACCESS_URL}/decision`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken.token.access_token}` },
      },
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  try {
    const client = new ClientCredentials(oAuthConfig);
    const tokenParams = {};
    const accessToken = await client.getToken(tokenParams);
    const data = await readData();
    if (Array.isArray(data) && data.length > 0) {
      let success = 0;
      let failure = 0;
      for (let i = 0; i < data.length; i++) {
        const done = await pushData(data[i], accessToken);
        if (done) {
          success++;
        } else {
          failure++;
        }
      }
      console.log(
        `dbdsimongo pushed ${data.length} decisions: ${success} done, ${failure} failed.`,
      );
    } else {
      throw new Error("No data to push.");
    }
  } catch (e) {
    console.error(e);
  }
  process.exit();
}

main();
