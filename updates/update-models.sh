#!/bin/bash

UPDATES_DIR=$(realpath "$(dirname "$0")")
JURIDEPENDENCIES_DIR=$(realpath "$UPDATES_DIR/..")

if ! [ -f "$JURIDEPENDENCIES_DIR/.env" ]; then
    echo "env file missing at $JURIDEPENDENCIES_DIR/.env"
    exit 1
fi

install_debian_dependencies() {
    SETUP_MODELS_DEPENDENCIES="rclone"
    if ! dpkg -s $SETUP_MODELS_DEPENDENCIES &>/dev/null; then
        sudo -S apt install $SETUP_MODELS_DEPENDENCIES
    fi
}

install_arch_dependencies() {
    SETUP_MODELS_DEPENDENCIES="rclone"
    if ! dpkg -s $SETUP_MODELS_DEPENDENCIES &>/dev/null; then
        sudo pacman -Sy $SETUP_MODELS_DEPENDENCIES
    fi
}

if grep -q "^ID_LIKE=debian" /etc/os-release || grep -q "^ID=debian" /etc/os-release; then
    install_debian_dependencies
elif grep -q "^ID_LIKE=arch" /etc/os-release; then
else
    echo "System unknown to install dependencies"
    return 1
fi

S3_ACCESS_KEY=$(grep '^S3_ACCESS_KEY=' .env | cut -c 15-)
S3_SECRET_KEY=$(grep '^S3_SECRET_KEY=' .env | cut -c 15-)

if [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ]; then
    echo "S3_ACCESS_KEY and S3_SECRET_KEY are missing in .env"
    exit 1
fi

echo "Upserting AI models ..."
rclone \
    -v \
    --config ./.rclone.conf \
    --s3-access-key-id "$S3_ACCESS_KEY" \
    --s3-secret-access-key "$S3_SECRET_KEY" \
    sync ai-models:judilibre-nlp-models-821aa6e6-7658-4331-ab8c-c778ea4aeea8 "$JURIDEPENDENCIES_DIR/models"