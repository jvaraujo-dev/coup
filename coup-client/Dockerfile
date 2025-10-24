FROM node:20 AS builder

WORKDIR /app/coup-client

ARG NEXT_PUBLIC_WEBSOCKET_URL
ARG NEXT_PUBLIC_BACKEND_HTTP_URL

ENV NEXT_PUBLIC_WEBSOCKET_URL=$NEXT_PUBLIC_WEBSOCKET_URL
ENV NEXT_PUBLIC_BACKEND_HTTP_URL=$NEXT_PUBLIC_BACKEND_HTTP_URL

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install

COPY src ./src
COPY public ./public
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./

RUN npm run build

FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/coup-client/.next ./.next
COPY --from=builder /app/coup-client/node_modules ./node_modules
COPY --from=builder /app/coup-client/public ./public
COPY --from=builder /app/coup-client/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]