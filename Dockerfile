# Base image for building
FROM node:20-alpine AS builder

# Install necessary tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build && ls -la /app/.next

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=3017

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copy only necessary files

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./

USER nextjs

EXPOSE 3017

CMD ["node", "server.js"]
