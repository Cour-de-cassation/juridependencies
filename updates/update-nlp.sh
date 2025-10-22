#!/bin/bash

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
    DIR_PREVIOUS=$(pwd)
    DIR_JURIZONAGE=$(realpath "$DIR/nlp-jurizonage")

    if [ ! -d "$DIR_JURIZONAGE" ]; then
        echo "$DIR_JURIZONAGE missing"
        return 1
    fi

    echo "Build jurizonage image"
    cd $DIR_JURIZONAGE
    git pull
    docker build \
        -t cour-de-cassation/nlp-jurizonage:local \
        -f api/api.Dockerfile \
        .

    cd $DIR_PREVIOUS
}

update_nlp() {
    DIR_NLP_API=$(realpath "$DIR/nlp-api")
    DIR_JURITOOLS=$(realpath "$DIR/nlp-juritools")
    DIR_JURISPACY_TOKENIZER=$(realpath "$DIR/nlp-jurispacy-tokenizer")

    if [ ! -d "$DIR_JURITOOLS" ]; then
        echo "DIR_JURITOOLS missing:"
        return 1
    fi

    echo "Build juritools image"
    cd $DIR_JURITOOLS
    git pull
    docker build \
        --build-arg CI_REGISTRY=docker.io \
        --build-arg HARDWARE_TARGET=cpu \
        --build-arg JURISPACY_VERSION=local \
        -t cour-de-cassation/nlp-juritools/cpu:local \
        -f api/api.Dockerfile \
        .
    
    cd $DIR_PREVIOUS
}

update_jurizonage
update_nlp
