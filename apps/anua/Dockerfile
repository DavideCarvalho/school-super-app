# Alpine image
FROM node:20-alpine

# Atualiza e instala dependências
RUN apk update && apk add --no-cache libc6-compat

# Instala pnpm e turbo globalmente
RUN npm install -g pnpm turbo
RUN pnpm config set store-dir ~/.pnpm-store

WORKDIR /app

# Copia todos os arquivos para o diretório de trabalho
COPY . .

RUN ls -la

# Prune dependências não necessárias para o escopo @anua/anua
RUN pnpm turbo prune --scope=@anua/anua --docker && \
    cp .env out/.env && \
    mv out/full /home/node/temp_out && \
    mv out/pnpm-lock.yaml /home/node/temp_out && \
    rm -rf /app/* && \
    mv /home/node/temp_out/* /app/ && \
    rm -rf /home/node/temp_out

RUN ls -la

# Instala as dependências de produção com --frozen-lockfile para garantir que o lockfile seja respeitado
RUN pnpm i

# Gera os artefatos do prisma
RUN pnpm db:generate

# Constrói a aplicação
RUN pnpm build:anua

# Remove arquivos de código-fonte após a construção
RUN rm -rf ./**/*/src

# Cria usuário nodejs e muda para ele
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app/apps/anua

# Define a variável de ambiente NODE_ENV como produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
