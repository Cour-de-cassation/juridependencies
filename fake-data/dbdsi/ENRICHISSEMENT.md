# Ajout et suppression a posteriori d'enrichissements (titres et sommaires)

## Contexte

Aucune des décisions CC générées à partir des "fake data" ne contient ce que le métier nomme "enrichissements", c'est-à-dire un ensemble de titres et de sommaires.

En un sens c'est normal, car ces informations sont saisies dans une application spécifique (distincte de celle qui permet de saisir la décision), la plupart du temps _après_ la création de la décision concernée.

Ainsi, dans la grande majorité des cas, une décicion CC est d'abord publiée _sans enrichissement_, puis les enrichissements sont versés en base (tables Oracle `ANALYSE` et `TITREREFERENCE`), ce qui entraîne un changement du champ `DT_MODIF` de la décision, qui se retrouve donc dans le flux des mises à jour à traiter.

Par conséquent, plutôt que d'ajouter les enrichissements de manière statique et arbitraire dans le jeu de donnée initial, il me paraît plus pertinent de mettre à disposition un script permettant d'ajouter à la volée un jeu significatif de titres et de sommaires à une décision CC donnée (ou de les retirer), ceci afin de pouvoir reproduire dans le temps le workflow réel de publications et de mises à jour successives, suivant la plupart des scénarios possibles.

Ce script ne génère pas d'enrichissements immédiatement publiables (pas de modification de la décision dans Oracle — à part le champ `DT_MODIF` — pas d'alteration des bases MongoDB, ni d'interaction avec l'API Judilibre). Ce script simule uniquement les opérations effectuées en amont de la collecte, côté DSI, avec l'outil "Nomos Doc". Pour que les enrichissements ajoutés soient pris en compte et publiés, la décision doit être soumise au workflow habituel (depuis `openjustice-sder/import` jusqu'à `judilibre-sder/publishDecisions`).

## Utilisation

```
Usage: enrichissement [options]

Options:
  -o, --operation <operation>  type d'opération à effectuer (choices: "add", "remove")
  -t, --type <type>            type d'enrichissement à ajouter (choices: "simple", "multiple", "complexe", default: "simple")
  -i, --id <number>            identifiant source (Oracle) de la décision CC à enrichir
  -r, --randomize              utilise un jeu de données au hasard, parmi ceux disponibles (sinon, on utilise toujours le premier) (default: false)
  -h, --help                   display help for command
```

### Ajout d'enrichissements

`node enrichissement.js -o add -t <type> [-r] -i <id>`

Les enrichissements intégrés au projet proviennent de données de production réelles et sont répartis en trois types (paramètre `-t` ou `--type`) :

- `simple` : une seule chaîne de titrage et un seul sommaire (données en table `ANALYSE` seulement) ;
- `multiple` : deux chaînes de titrage et deux sommaires (données en table `ANALYSE` seulement) ;
- `complexe` : deux chaînes de titrage, deux sommaires et des titrages additionnels (données en table `ANALYSE` et `TITREREFERENCE`).

Pour chacun de ces trois types, il existe plusieurs jeux de données. Par défaut, afin de permettre des tests déterministes, seul le premier jeu est utilisé. En ajoutant l'option `-r` ou `--randomize`, le script va piocher au hasard l'un des jeux de données du type choisi pour l'associer à la décision.

La décision à "enrichir" est spécifiée, via l'option `-i` ou `--id`, au moyen de son identifiant Oracle (ou `sourceId` dans la base SDER).

Par exemple : `node enrichissement.js -o add -t complexe -i 2032029`

### Suppression d'enrichissements

`node enrichissement.js -o remove -i <id>`

Inversement, il arrive que les enrichissements soient retirés en amont (définitivement ou préalablement à une révision de ceux-ci).
