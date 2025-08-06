#/bin/bash

UPDATES_DIR=$(realpath "$(dirname "$0")")
INSTALLS_DIR=$(realpath "$UPDATES_DIR/../installs")

if [ ! -d "$1" ]; then
  echo "Directory \"$1\" does not exists."
  echo "Usage: ./update-nlp.sh [ path where projects are installed ]"
  echo "ex: ./update-nlp.sh ~/Workspace"
  exit 1
fi

DIR=$(realpath "$1")

bash "$INSTALLS_DIR/install-docker.sh"
SETUP_PROJECTS_DEPENDENCIES="git"
if ! dpkg -s $SETUP_PROJECTS_DEPENDENCIES &>/dev/null; then
    sudo -S apt install $SETUP_PROJECTS_DEPENDENCIES
fi

update_jurizonage() {
    DIR_JURIZONAGE=$(realpath "$DIR/nlp-jurizonage")
    DIR_JURIZONAGE_API=$(realpath "$DIR/nlp-jurizonage-api")

    if [ ! -d "$DIR_JURIZONAGE" ] || [ ! -d "$DIR_JURIZONAGE_API" ]; then
        echo "One of this projects missing:"
        echo "$DIR_JURIZONAGE"
        echo "$DIR_JURIZONAGE_API"
        return 1
    fi

    echo "Build jurizonage image" 
    git pull $DIR_JURIZONAGE
    docker build -t cour-de-cassation/nlp-jurizonage/local .

    echo "Build jurizonage-api image"
    git pull $DIR_JURIZONAGE_API
    docker build \
        --build-arg CI_REGISTRY=docker.io \
        --build-arg CI_COMMIT_BRANCH=local \
        -t jurizonage-api .
}

upldate_nlp() {
    DIR_NLP_API=$(realpath "$DIR/nlp-api")
    DIR_JURITOOLS=$(realpath "$DIR/nlp-juritools")
    DIR_JURISPACY_TOKENIZER=$(realpath "$DIR/nlp-jurispacy-tokenizer")

    if [ ! -d "$DIR_NLP_API" ] || [ ! -d "$DIR_JURITOOLS" ] || [ ! -d "$DIR_JURISPACY_TOKENIZER" ]; then
        echo "One of this projects missing:"
        echo "$DIR_NLP_API"
        echo "$DIR_JURITOOLS"
        echo "$DIR_JURISPACY_TOKENIZER"
        return 1
    fi

    echo "Build jurispacy-tokenizer image"
    git pull $DIR_JURISPACY_TOKENIZER
    docker build \
        --build-arg IMAGE_NAME=ubuntu:22.04 \
        --build-arg REQUIREMENTS_FILENAME=requirements.txt \
        -t cour-de-cassation/nlp-jurispacy-tokenizer/local .

    echo "Build juritools image"
    git pull $DIR_JURITOOLS
    docker build \
        --build-arg CI_REGISTRY=docker.io \
        --build-arg CI_COMMIT_BRANCH=local \
        -t cour-de-cassation/nlp-juritools/local .

    echo "Build nlp-api image"
    git pull $DIR_NLP_API
    docker build \
        --build-arg CI_REGISTRY=docker.io \
        --build-arg CI_COMMIT_BRANCH=local \
        -t nlp-api .

}
