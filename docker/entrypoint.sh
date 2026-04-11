#!/bin/sh
set -e

echo "Aguardando PostgreSQL ficar disponível..."

until node -e "
const net = require('net');
const socket = net.createConnection({ host: 'postgres', port: 5432 });
socket.on('connect', () => { socket.end(); process.exit(0); });
socket.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 2000);
"; do
  echo 'PostgreSQL ainda não está pronto...'
  sleep 2
done

echo "Aplicando migrations..."
npx prisma migrate deploy --schema=src/infra/database/prisma/schema.prisma

echo "Gerando Prisma Client..."
npx prisma generate --schema=src/infra/database/prisma/schema.prisma

echo "Iniciando API..."
node dist/index.js