#/bin/bash

if command -v node &> /dev/null; then
    echo "Node already exists"
    exit 0
fi

SETUP_NVM_DEPENDENCIES="wget"
if ! dpkg -s $SETUP_NVM_DEPENDENCIES &>/dev/null; then
    sudo -S apt install $SETUP_NVM_DEPENDENCIES
fi

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

nvm install --lts
nvm use --lts

echo "Node installed by nvm"
