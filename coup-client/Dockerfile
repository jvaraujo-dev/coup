FROM node:20-alpine AS builder

WORKDIR /app/coup-client

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install

COPY src ./src
COPY public ./public
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/coup-client/.next ./.next
COPY --from=builder /app/coup-client/node_modules ./node_modules
COPY --from=builder /app/coup-client/public ./public
COPY --from=builder /app/coup-client/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]