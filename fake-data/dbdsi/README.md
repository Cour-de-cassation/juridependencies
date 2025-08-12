# Initialisation locale de la base de donnée Oracle 

## A quoi ça sert ?

Si vous souhaitez créer votre propre base de donnée oracle en locale pour communiquer avec votre application openjustice, vous aurez besoin de l'initialiser avec les schémas correspondant. Ce répertoire contient des schémas SQL, des templates (permettant de construire les schémas lorsque le nom des tables est caché) ainsi que les scripts JS qui facilitent leur déploiement.

## Comment l'utiliser ?

Tout d'abord, il convient d'avoir lancé un oracle en local. Les commandes pour créer l'image docker correspondant au docker-compose.yml joint dans ce projet sont disponibles sur le readme racine.

Le projet utilisera par défaut les variables d'environnement présentes dans le .env racine de juridependencies.

Le script replace.js doit être lancé à chaque modification des informations de schéma contenu dans les variables d'environnements, on peut, pour être sûr, le lancer avant chaque création de schéma:
`node replace.js`

Attention: la modification des 4 utilisateurs ou de leur pass de connexion nécessite de tuer le container et d'en recréer un nouveau (ce qui peut être fait grâce au script d'installation install-oracle.sh).

Le script migrate.js permet à loisir de créer les schémas ou de les détruire. Le script nécessite un argument d'action à son appel: 
- 'up' va créer les schémas nécessaire
- 'down' va supprimer les schémas

Attention toutefois, à la différence de librairie de migrations comme "knexJs", l'historique des migrations n'est pas préservé et les requêtes ne sont pas effectuées en transaction ce qui signifie qu'en cas d'erreur au cours de la lecture d'un SQL, il sera peut-être nécessaire de corriger le schéma à la main dans votre base de donnée.
`node migration.js up`

Le script seeds.js permet de générer un set de fausses données.

## Comment le lire

- replace.js: Tous les fichiers en "template.sql" sont traités par le script "replace.js" qui remplace toute occurrence en ${EXAMPLE} par la variable d'environnement correspondant au nom entre brackets (dans cet exemple: process.env.EXAMPLE). 
Le fichier de sorti est renommé à l'identique sans mention du "template".

- oracle_init.sql (généré à partir de oracle_init_template.sql): C'est un fichier particulier, il doit s'exécuter en premier, lors de l'initialisation de la base de donnée et par l'utilisateur SYSTEM (le root d'oracle). Le docker-compose l'intègre dans son volume pour le faire exécuter en startup d'oracle. Le script crée dans une seule base de données les 4 utilisateurs, ce n'est pas iso prod mais permet une bonne correspondance pour une utilisation locale.

- migrate.js: Le script associe les connexions aux 4 instances DB (host + user) et les schémas leur correspondant. Il prend une action en argument qui lui permet de choisir entre les schémas en "create" et les schémas en "drop". Lorsqu'il est appelé, le script exécute en parallèle les 4 scripts SQL. Les scripts SQL étant composés de plusieurs requêtes, pour chacun des 4 il agit de la même manière: il lit et exécute les requêtes séquentiellement de sorte à pouvoir créer les schémas et les tables dans l'ordre.
