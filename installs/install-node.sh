#!/bin/bash

if command -v node &> /dev/null; then
    echo "Node already exists"
    exit 0
fi

install_debian_dependencies() {
    SETUP_NVM_DEPENDENCIES="wget"
    if ! dpkg -s $SETUP_NVM_DEPENDENCIES &>/dev/null; then
        sudo -S apt install $SETUP_NVM_DEPENDENCIES
    fi
}

install_arch_dependencies() {
    SETUP_NVM_DEPENDENCIES="wget"
    if ! dpkg -s $SETUP_NVM_DEPENDENCIES &>/dev/null; then
        sudo pacman -Sy $SETUP_NVM_DEPENDENCIES
    fi
}

if grep -q "^ID_LIKE=debian" /etc/os-release || grep -q "^ID=debian" /etc/os-release; then
    install_debian_dependencies
elif grep -q "^ID_LIKE=arch" /etc/os-release; then
    install_arch_dependencies
else
    echo "System unknown to install dependencies"
    return 1
fi

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

nvm install --lts
nvm use --lts

echo "Node installed by nvm"
