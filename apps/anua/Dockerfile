FROM node:20-alpine

COPY . home/node/app

WORKDIR /home/node/app

# RUN cat .env

# RUN set -o allexport source .env set +o allexport
# RUN env
# RUN printenv


RUN npm i -g pnpm

RUN pnpm i --frozen-lockfile

RUN pnpm db:generate

RUN pnpm build:anua

EXPOSE 3000

ENV NODE_ENV production

CMD ["pnpm", "with-env", "turbo", "start", "--filter=anua"]