#!/bin/bash

INSTALLS_DIR=$(realpath "$(dirname "$0")")
JURIDEPENDENCIES_DIR=$(realpath "$INSTALLS_DIR/..")

if [ ! -d "$1" ]; then
  echo "Directory \"$1\" does not exists."
  echo "Usage: ./install-projects.sh [ path to an existent directory where install the projects ]"
  echo "ex: ./install-projects.sh ~/Workspace"
  exit 1
fi

DIR=$(realpath "$1")
echo "Install projects into: $DIR"

SETUP_PROJECTS_DEPENDENCIES="git"
if ! dpkg -s $SETUP_PROJECTS_DEPENDENCIES &>/dev/null; then
    sudo -S apt install $SETUP_PROJECTS_DEPENDENCIES
fi

set_sources () {
  if [ ! -d "$DIR/$1" ]; then 
    echo "Fetching $1"
    git clone git@github.com:Cour-de-cassation/$1.git $DIR/$1
  else 
    echo "$DIR/$1 already exists"
  fi
}

set_sources "nlp-api"
set_sources "nlp-juritools"
set_sources "nlp-jurispacy-tokenizer"
set_sources "nlp-jurizonage"
set_sources "nlp-jurizonage-api"

bash $JURIDEPENDENCIES_DIR/updates/update-nlp.sh $DIR
