FROM node:22-slim
ARG http_proxy
ARG https_proxy

# WORKDIR /scripts

# RUN echo "Acquire::http::Proxy \"${http_proxy}/\";" > /etc/apt/apt.conf && \
#     echo "Acquire::https::Proxy \"${http_proxy}/\";" >> /etc/apt/apt.conf
RUN apt update
RUN apt install alien libaio1 -y
ADD https://download.oracle.com/otn_software/linux/instantclient/oracle-instantclient-basiclite-linuxx64.rpm /
RUN alien -i oracle-instantclient-basiclite-linuxx64.rpm
RUN rm -rf oracle-instantclient-basiclite-linuxx64.rpm

COPY fake-data/ ./

RUN npm ci
