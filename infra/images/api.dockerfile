FROM node:7-alpine

# args
ARG ENV="prod"
ENV ENV=${ENV}

# import
RUN mkdir -p /repo
WORKDIR /repo

# add repo + this app
COPY ./.* ./package.json ./lerna.json ./shrinkwrap.yaml /repo/
COPY ./apps/api /repo/apps/api

# install
WORKDIR /repo/apps/api

# run
CMD npm run start-$ENV
EXPOSE 3000
