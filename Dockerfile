FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate --schema=src/infra/database/prisma/schema.prisma
RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/infra/database/prisma ./src/infra/database/prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate --schema=src/infra/database/prisma/schema.prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
