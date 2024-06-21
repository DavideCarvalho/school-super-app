FROM node:20-alpine

WORKDIR /home/node/app

# Copie todos os arquivos para o diretório de trabalho
COPY . .

# Instale as dependências globais necessárias
RUN npm install -g turbo pnpm

# Prune dependências não necessárias para o escopo @anua/anua e mova o resultado para o diretório de trabalho
RUN pnpm turbo prune --scope @anua/anua

# Copie o arquivo .env para a pasta out e mova o resultado para o diretório de trabalho
RUN cp .env out/.env && \
    mv out /home/node/temp_out && \
    rm -rf /home/node/app/* && \
    mv /home/node/temp_out/* /home/node/app/ && \
    rm -rf /home/node/temp_out

# Instale as dependências de produção com --frozen-lockfile para garantir que o lockfile seja respeitado
RUN pnpm install --frozen-lockfile --no-cache

# Gere os artefatos do prisma
RUN pnpm db:generate

# Construa a aplicação
RUN pnpm build:anua

# Remova caches do pnpm e npm
RUN pnpm store prune && \
    npm cache clean --force && \
    npm uninstall -g turbo pnpm

# Exponha a porta da aplicação
EXPOSE 80

# Defina a variável de ambiente NODE_ENV como produção
ENV NODE_ENV production

# Comando para iniciar a aplicação em modo de produção
CMD ["pnpm", "start:anua"]
