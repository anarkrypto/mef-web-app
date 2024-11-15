# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY src ./src
COPY next.config.js .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.mjs .

RUN npx prisma generate

RUN npm run build && \
    npm prune --production && \
    npm cache clean --force

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs .

USER nextjs

CMD ["npm", "start"] 