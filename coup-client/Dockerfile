# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app/coup-client

# Copy package.json and lock files to install dependencies
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN npm install
# If you use Yarn:
# RUN yarn install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Build the Next.js application for production
# For Next.js 12 (Pages Router):
# RUN npm run build
# For Next.js 13+ (App Router):
RUN npm run build


# Stage 2: Run the Next.js application
FROM node:20-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production for Next.js optimizations
ENV NODE_ENV production

# Copy only the necessary build artifacts and node_modules from the builder stage
COPY --from=builder /app/coup-client/.next ./.next
COPY --from=builder /app/coup-client/node_modules ./node_modules
COPY --from=builder /app/coup-client/public ./public
COPY --from=builder /app/coup-client/package.json ./package.json

# Expose the default port for Next.js (3000)
EXPOSE 3000

# Command to start the Next.js application in production
CMD ["npm", "start"]