FROM node:9

WORKDIR /app
COPY . .

RUN /bin/bash -l -c "mkdir /root/.ssh"
ADD yk /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN echo "Host bitbucket.org\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

RUN yarn install
RUN yarn run build
RUN rm yk
RUN rm /root/.ssh/id_rsa

CMD ["node", "dist/index.js"]