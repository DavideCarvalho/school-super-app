FROM node:20-alpine

RUN npm i -g turbo

RUN npm i -g pnpm

RUN npm i -g prisma

COPY . .
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build
RUN pnpm install --frozen-lockfile

EXPOSE 3000

ENV NODE_ENV production

RUN cd ./apps/nextjs

CMD ["pnpm", "start"]