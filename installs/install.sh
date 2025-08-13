#!/bin/bash

INSTALLS_DIR=$(realpath "$(dirname "$0")")

if [ ! -d "$1" ]; then
  echo "Directory \"$1\" does not exists."
  echo "Usage: ./install.sh [ path to an existent directory where install the project ]"
  echo "ex: ./install.sh ~/Workspace"
  exit 1
fi

DIR=$(realpath "$1")

bash $INSTALLS_DIR/install-models.sh
bash $INSTALLS_DIR/install-nlp.sh $DIR
bash $INSTALLS_DIR/install-web.sh $DIR
bash $INSTALLS_DIR/install-oracle.sh
