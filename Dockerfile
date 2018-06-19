FROM node:10

RUN curl -L https://raw.githubusercontent.com/dockito/vault/master/ONVAULT > /usr/local/bin/ONVAULT && \
    chmod +x /usr/local/bin/ONVAULT

WORKDIR /app

COPY package.json yarn.lock ./
RUN ONVAULT yarn --unsafe-perm --pure-lockfile

COPY . .
RUN yarn run build

CMD ["node", "dist/index.js"]