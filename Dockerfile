# Multi-stage build for GLACIER AI Receptionist

# Stage 1: Python Backend
FROM python:3.11-slim as backend-builder

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Stage 2: Node.js Frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production=false

# Copy frontend code
COPY . .

# Build Next.js app
RUN npm run build

# Stage 3: Production Runtime
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for running Next.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy Python backend from builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /app/backend /app/backend

# Copy Next.js app from builder
COPY --from=frontend-builder /app/.next /app/.next
COPY --from=frontend-builder /app/public /app/public
COPY --from=frontend-builder /app/node_modules /app/node_modules
COPY package.json next.config.js ./

# Create a startup script
RUN echo '#!/bin/bash\n\
python /app/backend/main.py &\n\
node -e "require(\"next/dist/bin/next\").nextStart()" -- start &\n\
wait' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["/app/start.sh"]
