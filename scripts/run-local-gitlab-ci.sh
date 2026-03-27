#! /usr/bin/bash

jobs=${1}

echo Running $jobs

gitlab-ci-local --privileged --network gitlab-ci-local-network \
--volume /var/run/docker.sock:/var/run/docker.sock \
--volume ../../gitlab-ci-local-parameters/ansible-secret/vault-password.secret:/secrets/vault-password.secret:ro \
--volume ../../gitlab-ci-local-parameters/k3d-kubeconfig.yaml:/root/.kube/config:ro \
--volume ../../gitlab-ci-local-parameters/local-python-packages:/usr/local/lib/python3.12/site-packages:ro \
--variable ANSIBLE_VAULT_PASS=/secrets/vault-password.secret \
--variable CI_REGISTRY=localhost:5000 \
--variable CI_REGISTRY_USER=test \
--variable CI_JOB_TOKEN=test \
--variable CI_COMMIT_BRANCH=local \
--variable HTTP_PROXY= \
--variable HTTPS_PROXY= $jobs 
