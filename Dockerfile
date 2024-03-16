FROM node:20-alpine

RUN npm i -g turbo

RUN npm i -g pnpm

RUN npm i -g prisma

COPY . home/node/app
WORKDIR /home/node/app
RUN pnpm install --frozen-lockfile
RUN turbo run build

RUN source .env

EXPOSE 3000

ENV NODE_ENV production

RUN ls -la

CMD ["pnpm", "start"]