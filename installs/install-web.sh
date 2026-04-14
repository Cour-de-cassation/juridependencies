#!/bin/bash

if [ ! -d "$1" ]; then
  echo "Directory \"$1\" does not exists."
  echo "Usage: ./install-projects.sh [ path to an existent directory where install the projects ]"
  echo "ex: ./install-projects.sh ~/Workspace"
  exit 1
fi

DIR=$(realpath "$1")
echo "Install projects into: $DIR"

install_debian_dependencies() {
    SETUP_PROJECTS_DEPENDENCIES="git"
    if ! dpkg -s $SETUP_PROJECTS_DEPENDENCIES &>/dev/null; then
        sudo -S apt install $SETUP_PROJECTS_DEPENDENCIES
    fi
}

install_arch_dependencies() {
    SETUP_PROJECTS_DEPENDENCIES="git"
    if ! dpkg -s $SETUP_PROJECTS_DEPENDENCIES &>/dev/null; then
        sudo pacman -Sy $SETUP_PROJECTS_DEPENDENCIES
    fi
}

if grep -q "^ID_LIKE=debian" /etc/os-release || grep -q "^ID=debian" /etc/os-release; then
    install_debian_dependencies
elif grep -q "^ID_LIKE=arch" /etc/os-release; then
else
    echo "System unknown to install dependencies"
    return 1
fi

set_sources () {
  if [ ! -d "$DIR/$1" ]; then 
    echo "Fetching $1"
    git clone git@github.com:Cour-de-cassation/$1.git $DIR/$1
  else 
    echo "$DIR/$1 already exists"
  fi
}

set_sources "dbsder-api"
set_sources "juritj"
set_sources "juritcom"
set_sources "jurinorm"
set_sources "label-back"
set_sources "label-front"
set_sources "openjustice-sder"
set_sources "judilibre-sder"
set_sources "judilibre-admin"
set_sources "judilibre-search"
set_sources "portalis-collect"
set_sources "oddj-dashboard"
set_sources "jurinorm"