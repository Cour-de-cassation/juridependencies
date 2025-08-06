const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const iconv = require('iconv-lite');
const oracledb = require('oracledb');

iconv.skipDecodeWarning = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

class GRCOMOracle {
  constructor() {
    this.connected = false;
    this.connection = null;
  }

  async connect() {
    if (this.connected === false) {
      this.connection = await oracledb.getConnection({
        user: process.env.DBDSI_USER_GRCOM,
        password: process.env.DBDSI_PASS_GRCOM,
        connectString: process.env.DBDSI_HOST,
      });
      this.connected = true;
    } else {
      throw new Error('GRCOMOracle.connect: already connected.');
    }
  }

  async close() {
    if (this.connected === true && this.connection !== null) {
      await this.connection.close();
    } else {
      throw new Error('GRCOMOracle.close: not connected.');
    }
  }
}

exports.GRCOMOracle = GRCOMOracle;
