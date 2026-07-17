# DBDSIMONGO

L'objectif est de mettre à disposition le nécessaire pour reproduire la/les base(s) Mongo mise(s) en oeuvre par la DSI dans le contexte de la refonte de la collecte des décisions (d'abord CA, puis peut-être CC).

## Collections

* `cours_appel_decisions` : collection principale du flux Jurica v2, correspond au contenu "brut" alimenté en amont du SDER par le projet https://github.com/ccas-produits-numeriques/jurica.

## Scripts spécifiques

* `generate.js` : (re)génère le fichier `db/cours_appel_decisions.json` à partir des données concordantes tirées des fichiers `../dbsder/db/rawJurica.json` et `../dbsder/db/decisions.json` (ceci afin de maintenir la cohérence des "fake data")
* `push.js` : pousse les décisions contenus dans le fichier `db/cours_appel_decisions.json` dans l'API `jurica-collect` (qui doit être lancée manuellement par ailleurs)