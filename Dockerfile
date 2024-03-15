FROM node:20-alpine

RUN npm i -g turbo

RUN npm i -g pnpm

RUN npm i -g prisma

COPY . .
RUN pnpm install --frozen-lockfile
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build

EXPOSE 3000

ENV NODE_ENV production

RUN cd ./apps/nextjs

CMD ["pnpm", "start"]