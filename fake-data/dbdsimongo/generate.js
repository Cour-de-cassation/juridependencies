const { readFile, writeFile } = require("fs/promises");
const { resolve } = require("path");

if (!process.env.NODE_ENV)
  require("dotenv").config({
    path: resolve(__dirname, "..", "..", ".env"),
    quiet: true,
  });

function buildDbdsiDecision(rawDecision, normalizedDecision) {
  const dbdsiDecision = {
    _id: normalizedDecision._id.$oid,
    numero_rg: rawDecision.JDEC_NUM_RG,
    numero_registre: rawDecision.JDEC_NUM_REGISTRE,
    date_decision: rawDecision.JDEC_DATE,
    juridiction_code: rawDecision.JDEC_ID_JURIDICTION,
    _meta: {
      autorite_extraction_method: null,
      composition_extraction_method: null,
      date_decision_extraction_method: null,
      juridiction_extraction_method: null,
      numero_rg_extraction_method: null,
      parties_extraction_method: null,
      pourvoi_sync_done: true,
    },
    annee_decision: rawDecision.JDEC_DATE.split("-")[0],
    auteur_anonymisation: null,
    autorite_code: rawDecision.JDEC_CODE_AUTORITE,
    autorite_label: rawDecision.JDEC_LIB_AUTORITE,
    code_juridiction_detail: normalizedDecision.jurisdictionCode,
    code_nac: rawDecision.JDEC_CODNAC,
    code_nac_partie: rawDecision.JDEC_CODNACPART,
    composition_tribunal: rawDecision.JDEC_COMPOSITION,
    created_at: normalizedDecision.dateCreation,
    date_anonymisation: null,
    date_envoi_abonnes: null,
    date_modif_anonymisation: null,
    decision_attaquees: [],
    decision_code: rawDecision.JDEC_CODE,
    decision_label: rawDecision.JDEC_LIBELLE,
    decision_text: normalizedDecision.originalText,
    fichier_archive: rawDecision.JDEC_FIC_ARCHIVE,
    ftp_sync: {
      source_folder: normalizedDecision.jurisdictionCode,
      processed_at: normalizedDecision.dateCreation,
      sync_type: "ftp",
    },
    has_pourvoi_cassation: false,
    has_pourvoi_local: false,
    html_anonymise: null,
    html_anonymise_traite: null,
    html_source: rawDecision.JDEC_HTML_SOURCE,
    html_traite: null,
    indicateur_anonymisation: 0,
    is_debat_public: true,
    is_decision_publique: true,
    is_matiere_determinee: false,
    is_qpc: false,
    is_selected: normalizedDecision.selection,
    juridiction_name: rawDecision.JDEC_JURIDICTION,
    label_nac: rawDecision.JDEC_LIBNAC,
    label_nac_partie: rawDecision.JDEC_LIBNACPART,
    notes_administratives: null,
    notice_format: rawDecision.JDEC_NOTICE_FORMAT,
    numero_portalis: rawDecision._portalis,
    occultation_complementaire: 1,
    occultation_complementaire_libre: null,
    oracle_id: rawDecision._id,
    parties: [],
    sommaire: null,
    updated_at: normalizedDecision.dateCreation,
    xml_anonymise: null,
    xml_anonymise_traite: null,
    xml_source: "{[]}",
    xml_traite: null,
  };
  return dbdsiDecision;
}

async function main() {
  try {
    const sourcePath = resolve(__dirname, "..", "dbsder", "db");
    const destinationPath = resolve(__dirname, "db");
    const rawDecisions = JSON.parse(
      await readFile(resolve(sourcePath, "rawJurica.json"), "utf8"),
    );
    const normalizedDecisions = JSON.parse(
      await readFile(resolve(sourcePath, "decisions.json"), "utf8"),
    );
    const dbdsiDecisions = [];
    for (let rawDecision of rawDecisions) {
      let dbdsiDecision = null;
      for (let normalizedDecision of normalizedDecisions) {
        if (
          normalizedDecision.sourceName === "jurica" &&
          normalizedDecision.sourceId === rawDecision._id
        ) {
          dbdsiDecision = buildDbdsiDecision(rawDecision, normalizedDecision);
          break;
        }
      }
      if (dbdsiDecision !== null) {
        dbdsiDecisions.push(dbdsiDecision);
      }
    }
    await writeFile(
      resolve(destinationPath, `cours_appel_decisions.json`),
      JSON.stringify(dbdsiDecisions, null, 2),
      "utf8",
    );
    console.log(
      `dbdsimongo data generated (${dbdsiDecisions.length} decisions)`,
    );
  } catch (e) {
    console.error(e);
  }
  process.exit();
}

main();
