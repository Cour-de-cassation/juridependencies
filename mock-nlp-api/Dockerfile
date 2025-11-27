FROM node:22-slim

USER node
WORKDIR /home/node

COPY --chown=node:node ./pdf-to-text /home/node/pdf-to-text
COPY --chown=node:node ./ner /home/node/ner
COPY --chown=node:node ./pdf-to-text /home/node/pdf-to-text
COPY --chown=node:node ./package.json /home/node/package.json
COPY --chown=node:node ./package-lock.json /home/node/package-lock.json
COPY --chown=node:node ./server.js /home/node/server.js

RUN npm i

CMD ["npm", "run", "start"]

