# JURIDEPENDENCIES

## Sommaire

- Définition
- Contenu notable
    - installs
    - updates
    - fake-data
    - docker-compose.yml
- SETUP dans un nouveau contexte
    - pré-requis
    - clone
    - installation du projet open data
        - installation automatique
        - installation choisie
- SETUP dans un contexte existant
    - pré-requis
    - clone
    - installer les models
    - installer les projets NLP
    - installer les projets Web
    - installer Docker
    - installer Oracle
- Lancer les bases de données et les docker nlp
- Maintenances courantes

## Definition

Juridependencies se veut être un répertoire git de scripts utiles à l'intallation des briques logiciels de l'ODDJ et à leur maintenance dans le travail courant. Juridependencies propose plusieurs outils pour faciliter la gestion des multiples dépendances d'installation du projet et pour centraliser leur articulation en un seul repo.

Il reprend la base de ce qui était proposé par dev-backend mais de manière plus modulable, sans imposer l'utilisation de docker compose pour les projets, et en laissant le développeur plus libre de son fonctionnement.

## Contenu notable

### installs

Contient des scripts d'aide à l'installation du projet et de ses dépendances (installation de docker, node, oracle, modèles IA ou projets ...).
Il existe un script "install.sh" qui permet de les compiler pour faciliter une première installation.

### updates

Contient des scripts d'aide courant, notamment pour rebuild les images docker des logiciels NLP en fonction de leur dépendances ou pour updater les modèles AI installé en local.

### fake-data

Contient des scripts JS facilitant les migrations de schéma SQL ainsi que toute l'hydrataion des fausses données en SQL et Mongo.
On y retrouve des fausses données pour:
- DBSDSI (oracle: jurica et jurinet)
- DBSDER (mongo)
- INDEX (mongo: judilibre-index)
- LABEL (mongo: labeldb)

Le package.json propose des scripts pour combiner les les différentes actions de clean et générations de fausses données (seed).

### docker-compose.yml

Ce docker-compose doit permettre de lancer, avec docker, des bases de données et des outils managés ou non par l'ODDJ mais essentiels à son fonctionnement.
Attention, il est dépendant des applications de data sciences (elles peuvent être installées avec le script d'installation install-data-oddj.sh ou bien commentées).

## SETUP dans un nouveau contexte

### pré-requis

Le seul outil nécessaire au démarrage est GIT.

### clone

Installez juridependencies où vous le souhaitez:

`git clone git@github.com:Cour-de-cassation/juridependencies.git && cd juridependencies`

Générez un fichier d'environnement (à partir du fichier d'exemple fourni):

`cp .env-sample .env`

### installation du projet open data

#### installation automatique

Pour l'installation automatique vous devez disposer d'un S3 contenant les models IA et vous munir de vos identifiant.
Lancer le script d'installation principal en lui donnant le chemin du dossier où vous souhaitez installer vos projets:

`chmod +x ./installs/install.sh && ./installs/install.sh .`

Le projet devrait ainsi installer, tour à tour, l'ensemble des composantes et dépendances nécessaire au fonctionnement du projet.
Le script vous interrogera sur vos identifiants S3 s'ils ne sont pas déjà indiqué dans votre .env (S3_ACCESS_KEY et S3_SECRET_KEY).

#### installation choisie

Libre à vous de ne pas utiliser le script `./installs/install.sh` et de choisir de n'installer que les parties du projet qui vous intéresse (voir SETUP dans un contexte existant).
J'ai essayé de rendre facile au rétro-engineering la lecture des scripts d'installation de sorte à permettre une certaine forme de modularité dans l'approche.

## SETUP dans un contexte existant

### pré-requis

Le seul outil nécessaire au démarrage est GIT.

### clone

Installez juridependencies où vous le souhaitez:

`git clone git@github.com:Cour-de-cassation/juridependencies.git && cd juridependencies`

Générez un fichier d'environnement (à partir du fichier d'exemple fourni):

`cp .env-sample .env`

### installer les models

Si vous disposez déjà d'un repository contenant les models IA, déplacez ce repository dans `./models` et renseignez seulement leur nom dans votre ficher `.env`.
Si ce dossier est un S3 synchronisé, vous pouvez utiliser le script: `chmod +x ./updates/update-models.sh && ./updates/update-models.sh`
Un fichier .rclone.conf est à votre disposition pour un setup S3 personnalisé. 

Si vous ne disposez pas d'un repository contenant les models IA mais que vous possédez les identifiants du S3 de la cour de cassation: `chmod +x ./installs/install-models.sh && ./installs/install-models.sh`

### installer les projets NLP

Si vous diposez déjà des repositories NLP, ils doivent être rangés dans un même dossier et porter le nom par défaut du repository github:

```
x --- nlp-api
  --- nlp-jurispacy-tokenizer
  --- nlp-juritools
  --- nlp-jurizonage
  --- nlp-jurizonage-api
```

s'ils ne sont pas dans cet état, déplacez les avec la commande `mv`.

Lancez ensuite le script `chmod +x ./updates/update-nlp.sh && ./updates/update-nlp.sh [chemin de votre dossier contenant les projets NLP]`

Si vous ne disposez pas des repositories NLP vous pouvez les installer en utilisant le script d'installation dédié et en lui donnant votre dossier d'installation en argument:

`chmod +x ./installs/install-nlp.sh && ./installs/install-nlp.sh [chemin du dossier d'installation souaité]`

### installer les projets Web

Si vous disposez déjà des projets Web, assurez vous d'avoir NVM ou un gestionnaire de version de node équivalent.

Si vous ne disposez pas des projets Web, ils peuvent être installé dans un dossier grâce au script: 

`chmod +x ./installs/install-web.sh && ./installs/install-web.sh [chemin du dossier d'installation souaité]`

### installer Docker

Si vous ne disposez pas de docker, lancez le script: `chmod +x ./installs/install-docker.sh && ./installs/install-docker.sh`

### installer Oracle

Si vous disposez déjà d'un container docker nommé selon la variable d'environnement $DBDSI_NAME ("dbdsi" par défaut), alors supprimez votre container docker et lancez le script: `chmod +x ./installs/install-oracle.sh && ./installs/install-oracle.sh`

Autrement, lancez le script: `chmod +x ./installs/install-oracle.sh && ./installs/install-oracle.sh`

## Lancer les bases de données et les docker nlp

Depuis la racine de juridependencies: `docker compose up -d`

Pour un management plus fin, n'hésitez pas à vous renseigner sur les commandes docker.

## Maintenances courantes

Si les versions des projets NLP ou que les models venaient à évoluer, vous pourriez utilisez les scripts d'updates `./updates/update-nlp.sh` et `./updates/update-models.sh`.

