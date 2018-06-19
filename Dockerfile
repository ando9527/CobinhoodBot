FROM node:10

RUN /bin/bash -l -c "mkdir /root/.ssh"
ADD yk /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN echo "Host bitbucket.org\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

COPY . .
RUN yarn run build
RUN rm yk
RUN rm /root/.ssh/id_rsa

CMD ["node", "dist/index.js"]