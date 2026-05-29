# Attachments fake data

## Enrichir une décision jurinet avec un attachment

Le script `enrich-with-attachments.js` associe un fichier d'attachment existant à une décision jurinet spécifique.

### Prérequis

Les seeds attachments doivent être chargés dans MongoDB :

```bash
npm run attachments:seeds
```

### Usage

```bash
node attachments/enrich-with-attachments.js <decisionId>
```

ou depuis la racine de `fake-data` :

```bash
npm run dbsder:enrich:attachments -- <decisionId>
```

### Exemple

```bash
npm run dbsder:enrich:attachments -- 69427fdc62345a940dcc7cc1
```

### Ce que fait le script

1. Vérifie que la décision existe dans SDER avec `sourceName: "jurinet"`
2. Prend le premier fichier disponible dans la collection `files` des attachments
3. Met à jour son `decisionId` pour qu'il pointe vers la décision donnée
4. Upsert une entrée dans `latest` pour tracer le dernier ajout
5. Insère une entrée dans `logs` pour tracer l'opération
6. Sauvegarde `files.json`, `latest.json` et `logs.json` sur disque