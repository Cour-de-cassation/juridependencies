#!/bin/bash

INSTALLS_DIR=$(realpath "$(dirname "$0")")
JURIDEPENDENCIES_DIR=$(realpath "$INSTALLS_DIR/..")

OS=$(cat /etc/os-release | grep ^ID=)
OS=${OS#ID=*}
VERSION=$(cat /etc/os-release | grep ^VERSION_ID=)
VERSION=${VERSION#VERSION_ID=*}

if ! [ -f "$JURIDEPENDENCIES_DIR/.env" ]; then
    echo "env file missing at $JURIDEPENDENCIES_DIR/.env"
    exit 1
fi

install_ubuntu_dependencies() {
    SETUP_ORACLE_DEPENDENCIES="unzip wget libaio1t64"
    if ! dpkg -s $SETUP_ORACLE_DEPENDENCIES &>/dev/null; then
        sudo -S apt install $SETUP_ORACLE_DEPENDENCIES
    fi
    sudo -S ln -s /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1
}

install_debian_dependencies() {
    SETUP_ORACLE_DEPENDENCIES="unzip wget libaio1"
    if ! dpkg -s $SETUP_ORACLE_DEPENDENCIES &>/dev/null; then
        sudo -S apt install $SETUP_ORACLE_DEPENDENCIES
    fi
}

install_dependencies() {
    bash $INSTALLS_DIR/install-docker.sh
    bash $INSTALLS_DIR/install-node.sh

    if [ "$OS" = "ubuntu" ] && [ "$VERSION" > "24" ]; then 
        install_ubuntu_dependencies
    else 
        install_debian_dependencies
    fi

    if [ -d "/opt/oracle" ]; then
        echo "Oracle connector already exists"
        return 0
    fi

    sudo -S mkdir /opt/oracle
    wget https://download.oracle.com/otn_software/linux/instantclient/2340000/instantclient-basic-linux.x64-23.4.0.24.05.zip
    sudo -S unzip -d /opt/oracle instantclient-basic-linux.x64-23.4.0.24.05.zip 
    echo "oracle connector installed on /opt/oracle"

    if [ -f "$HOME/.bashrc" ]; then 
        echo -n  "export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_4:\$LD_LIBRARY_PATH" >> $HOME/.bashrc 
    fi

    if [ -f "$HOME/.zshrc" ]; then 
        echo -n "export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_4:\$LD_LIBRARY_PATH" >> $HOME/.zshrc 
    fi
}

install_oracle_project() {
    if [ -n "$(docker images -q oracle/database)" ]; then
        echo "Oracle docker image already exists"
        return 0
    fi

    if [ ! -d "$JURIDEPENDENCIES_DIR/docker-images" ]; then 
        git clone git@github.com:oracle/docker-images.git $JURIDEPENDENCIES_DIR/docker-images
    else 
        echo "Updating docker-images"
        git pull $JURIDEPENDENCIES_DIR/docker-images
    fi

    $JURIDEPENDENCIES_DIR/docker-images/OracleDatabase/SingleInstance/dockerfiles/buildContainerImage.sh -v 18.4.0 -x
}

setup_oracle_project() {
    DBDSI_NAME=$(grep '^DBDSI_NAME=' .env | cut -c 12-)
    if [ -n "$(docker ps -a | grep $DBDSI_NAME)" ]; then
        echo "Oracle docker container already exists"
        return 0
    fi

    echo "Docker building oracle for first time"
    node $JURIDEPENDENCIES_DIR/oracle/replace.js
    docker compose -f $JURIDEPENDENCIES_DIR/docker-compose.yml up -d dbdsi

    echo "Waiting for Oracle setup. This could be long. Take a break, get a coffee. What else ?"

    while sleep 5; do
        LOG=$(docker compose -f $JURIDEPENDENCIES_DIR/docker-compose.yml logs dbdsi)
        PROGRESSION_FLAG=$(echo "$LOG" | grep "% complete" | tail -1)

        if [ -n "$PROGRESSION_FLAG" ] && [ "$LAST_PROGRESSION_FLAG" != "$PROGRESSION_FLAG" ]; then 
            echo "$PROGRESSION_FLAG"
            LAST_PROGRESSION_FLAG="$PROGRESSION_FLAG"
        fi

        SAVE_STATE_FLAG=$(echo "$LOG" | grep "Completed: ALTER PLUGGABLE DATABASE XEPDB1 SAVE STATE")
        COMPLETED_FLAG=$(echo "$LOG" | grep "Completed: ALTER DATABASE OPEN")

        if [ -n "$COMPLETED_FLAG" ] || [ -n "$SAVE_STATE_FLAG" ]; then break; fi
    done

    if [ -n "$SAVE_STATE_FLAG" ]; then
        echo "SQL Schema migrating."
        node $JURIDEPENDENCIES_DIR/oracle/migrate.js up
    fi

    docker compose -f $JURIDEPENDENCIES_DIR/docker-compose.yml down
}

install_dependencies
install_oracle_project
setup_oracle_project
