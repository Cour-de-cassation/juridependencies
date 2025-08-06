# JURIDEPENDENCIES

## Definition

Juridependencies se veut être un répertoire git de scripts utiles à l'intallation des briques logiciels de l'ODDJ et à leur maintenance dans le travail courant. Juridependencies propose plusieurs outils pour faciliter la gestion des multiples dépendances d'installation du projet et pour centraliser leur articulation en un seul repo.

Il reprend la base de ce qui était proposé par dev-backend mais de manière plus modulable, sans imposer l'utilisation de docker compose pour les projets, et en laissant le développeur plus libre de son fonctionnement.

## Contenu notable

### installs

Contient des scripts d'aide à l'installation du projet et de ses dépendances (installation de docker, node, oracle, modèles IA ou projets ...).
Il existe un script "install.sh" qui permet de les compiler pour faciliter une première installation.

### updates

Contient des scripts d'aide courant, notamment pour rebuild les images docker des logiciels NLP en fonction de leur dépendances ou pour updater les modèles AI installé en local.

### oracle

Contient des scripts JS et SQL facilitant les migrations de schéma SQL.
Ils peuvent être appliqués sur une base oracle destinée à simuler des données de PROD.

### docker-compose.yml

Ce docker-compose doit permettre de lancer, avec docker, des bases de données ou des outils non managés par l'ODDJ mais essentiels à son fonctionnement.

## Prochaines versions:

- Ajout des scripts de gestion des fausses données.
- Ajout d'un script d'aide à l'harmonisation des variables d'env entre les différents projets.
