# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

# Copy package manifests for dependency installation
COPY 4event-backend/4event-server/package.json 4event-backend/4event-server/pnpm-lock.yaml* ./

# Install production + dev dependencies (dev needed for build step)
RUN pnpm install --frozen-lockfile || pnpm install

# =============================================================================
# Stage 2: Build the Next.js application
# =============================================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY 4event-backend/4event-server/ .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
# DATABASE_URL is required at build time for Prisma but not used
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# =============================================================================
# Stage 3: Production image
# =============================================================================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema for runtime migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
