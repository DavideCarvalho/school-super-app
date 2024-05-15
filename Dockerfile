FROM node:20-alpine

COPY . home/node/app

WORKDIR /home/node/app

# RUN cat .env

# RUN set -o allexport source .env set +o allexport
# RUN env
# RUN printenv


RUN npm i -g turbo

RUN npm i -g pnpm

RUN npm i -g prisma

RUN pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3000

ENV NODE_ENV production

CMD ["pnpm", "start"]