FROM node:20-alpine

COPY . home/node/app

WORKDIR /home/node/app

# RUN cat .env

# RUN set -o allexport source .env set +o allexport
# RUN env
# RUN printenv

RUN npm i -g turbo

RUN npm i -g pnpm

RUN pnpm i --frozen-lockfile

RUN turbo -F @acme/db prisma:generate

RUN turbo build -F @anua/anua

EXPOSE 3000

ENV NODE_ENV production

CMD ["pnpm", "with-env", "turbo", "start", "--filter=anua"]