# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN npm i -g turbo

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml turbo.json ./

# Copy all package.json files for dependency resolution
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# =============================================================================
# Stage 2: Build the API
# =============================================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/validators/node_modules ./packages/validators/node_modules

# Copy source
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build API
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN cd apps/api && npx nest build

# =============================================================================
# Stage 3: Production image
# =============================================================================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/db/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages/db/prisma ./prisma

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/main.js"]
