FROM node:20-alpine

RUN npm i -g turbo

RUN npm i -g pnpm

RUN npm i -g prisma

COPY . home/node/app
WORKDIR /home/node/app
RUN ls -la
RUN pnpm install --frozen-lockfile
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build

EXPOSE 3000

ENV NODE_ENV production

RUN ls -la

CMD ["pnpm", "start"]