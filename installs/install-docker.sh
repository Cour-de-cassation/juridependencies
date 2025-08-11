#!/bin/bash

if command -v docker &> /dev/null; then
    echo "Docker already exists"
    exit 0
fi

OS=$(cat /etc/os-release | grep ^ID=)
OS=${OS#ID=*}

SETUP_DOCKER_DEPENDENCIES="ca-certificates wget"
if ! dpkg -s $SETUP_DOCKER_DEPENDENCIES &>/dev/null; then
    sudo -S apt install $SETUP_DOCKER_DEPENDENCIES
fi

if [ "$OS" = "ubuntu" ]; then 

    # Add Docker's official GPG key:
    sudo -S install -m 0755 -d /etc/apt/keyrings
    sudo -S wget -qO /etc/apt/keyrings/docker.asc https://download.docker.com/linux/ubuntu/gpg
    sudo -S chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
    sudo -S tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo -S apt-get update

elif [ "$OS" = "debian" ]; then 

    # Add Docker's official GPG key:
    sudo -S install -m 0755 -d /etc/apt/keyrings
    sudo -S wget -qO /etc/apt/keyrings/docker.asc https://download.docker.com/linux/debian/gpg
    sudo -S chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo -S tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo -S apt-get update

else 
    echo "Script only install docker for ubuntu or debian"
    exit 1
fi

sudo -S apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo -S groupadd docker
sudo -S usermod -aG docker $USER

# used to load group update:
CURRENT_PATH=$(pwd)
sudo -S su - $USER 
cd "$CURRENT_PATH"