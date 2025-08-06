const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const iconv = require('iconv-lite');
const oracledb = require('oracledb');

iconv.skipDecodeWarning = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

class JurinetOracle {
  constructor() {
    this.connected = false;
    this.connection = null;
  }

  async connect() {
    if (this.connected === false) {
      this.connection = await oracledb.getConnection({
        user: process.env.DBDSI_USER_JURINET,
        password: process.env.DBDSI_PASS_JURINET,
        connectString: process.env.DBDSI_HOST,
      });
      this.connected = true;
    } else {
      throw new Error('Jurinet.connect: already connected.');
    }
  }

  async close() {
    if (this.connected === true && this.connection !== null) {
      await this.connection.close();
    } else {
      throw new Error('Jurinet.close: not connected.');
    }
  }
}

exports.JurinetOracle = JurinetOracle;
