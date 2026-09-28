FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json ./
RUN pnpm install

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test
ARG NEXT_PUBLIC_DEFAULT_REGION=dk
ARG NEXT_PUBLIC_STORE_CATEGORY_CHANNEL=sminka

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_STORE_CATEGORY_CHANNEL=$NEXT_PUBLIC_STORE_CATEGORY_CHANNEL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8001
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8001

CMD ["pnpm", "start"]
