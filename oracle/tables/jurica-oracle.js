const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const iconv = require('iconv-lite');
const oracledb = require('oracledb');

iconv.skipDecodeWarning = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Switch to "Thick Mode" (because Jurica uses an archaic version of Oracle, cf. https://node-oracledb.readthedocs.io/en/latest/user_guide/initialization.html#enabling-node-oracledb-thick-mode-on-linux-and-related-platforms):
// oracledb.initOracleClient();

class JuricaOracle {
  constructor() {
    this.connected = false;
    this.connection = null;
  }

  async connect() {
    if (this.connected === false) {
      this.connection = await oracledb.getConnection({
        user: process.env.DBDSI_USER_JURICA,
        password: process.env.DBDSI_PASS_JURICA,
        connectString: process.env.DBDSI_HOST,
      });
      this.connected = true;
    } else {
      throw new Error('Jurica.connect: already connected.');
    }
  }

  async close() {
    if (this.connected === true && this.connection !== null) {
      await this.connection.close();
    } else {
      throw new Error('Jurica.close: not connected.');
    }
  }
}

exports.JuricaOracle = JuricaOracle;
