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

# Détection du package manager
if command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
    PKG_CHECK="rpm -q"
    PKG_INSTALL="sudo dnf install -y"
elif command -v apt &>/dev/null; then
    PKG_MANAGER="apt"
    PKG_CHECK="dpkg -s"
    PKG_INSTALL="sudo apt install -y"
else
    echo "Package manager non supporté"
    exit 1
fi

# Installation si absent
for dep in $SETUP_PROJECTS_DEPENDENCIES; do
    if ! $PKG_CHECK "$dep" &>/dev/null; then
        echo "Installation de $dep..."
        $PKG_INSTALL "$dep"
    fi
done

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
        -t jurizonage-api \
        -f api/api.Dockerfile \
        .

    cd $DIR_PREVIOUS
}

update_nlp() {
    DIR_JURITOOLS=$(realpath "$DIR/nlp-juritools")

    if [ ! -d "$DIR_JURITOOLS" ]; then
        echo "DIR_JURITOOLS missing:"
        return 1
    fi

    echo "Build juritools image"
    cd $DIR_JURITOOLS
    git pull
    docker build \
        -t nlp-api \
        -f api/api.Dockerfile \
        .
    
    cd $DIR_PREVIOUS
}

update_jurizonage
update_nlp
