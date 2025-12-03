#!/bin/bash

INSTALLS_DIR=$(realpath "$(dirname "$0")")
JURIDEPENDENCIES_DIR=$(realpath "$INSTALLS_DIR/..")

if ! [ -f "$JURIDEPENDENCIES_DIR/.env" ]; then
    echo "env file missing at $JURIDEPENDENCIES_DIR/.env"
    exit 1
fi

SETUP_MODELS_DEPENDENCIES="rclone"
if ! dpkg -s $SETUP_MODELS_DEPENDENCIES &>/dev/null ; then
    if grep -q "^ID_LIKE=debian" /etc/os-release || grep -q "^ID=debian" /etc/os-release; then
        sudo -S apt install "$SETUP_MODELS_DEPENDENCIES"
    elif grep -q "^ID_LIKE=arch" /etc/os-release; then
        sudo pacman -Sy rclone
    fi
fi

S3_ACCESS_KEY=$(grep '^S3_ACCESS_KEY=' $JURIDEPENDENCIES_DIR/.env | cut -c 15-)
S3_SECRET_KEY=$(grep '^S3_SECRET_KEY=' $JURIDEPENDENCIES_DIR/.env | cut -c 15-)

if [ -z "$S3_ACCESS_KEY" ]; then
    read -p "Setup AI models needs your S3 access key. S3 access key:" S3_ACCESS_KEY
    echo "add S3_ACCESS_KEY=$S3_ACCESS_KEY into .env"
    echo "S3_ACCESS_KEY=$S3_ACCESS_KEY" >> $JURIDEPENDENCIES_DIR/.env
fi

if [ -z "$S3_SECRET_KEY" ]; then
    read -p "Setup AI models needs your S3 secret key. S3 secret key:" S3_SECRET_KEY
    echo "add S3_SECRET_KEY=$S3_SECRET_KEY into .env"
    echo "S3_SECRET_KEY=$S3_SECRET_KEY" >> $JURIDEPENDENCIES_DIR/.env
fi

bash $JURIDEPENDENCIES_DIR/updates/update-models.sh
