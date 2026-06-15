---
id: wd1l8
world: wd1
order: 8
title: "BOSS: Production-Ready Deployment"
titleEn: "BOSS: Production-Ready Deployment"
estMinutes: 30
type: boss
---

## গল্প

ধরো তুমি একটা বড় রেস্তোরাঁ চালাচ্ছো — শুধু নিজের পরিবারের জন্য না, হাজার মানুষের জন্য। সকালে বাড়িতে রান্না আর বড় রেস্তোরাঁর রান্নাঘর কিন্তু এক জিনিস না। বাড়িতে চুলা খোলা থাকলেও চলে, কিন্তু রেস্তোরাঁয় লাগে — fire safety, proper ventilation, quality control, security guard যাতে unauthorized কেউ kitchen-এ না ঢোকে, এবং একটা main gate যেখান থেকে সব customer আসে। কোনো রান্নাঘরে সরাসরি ঢোকার সুযোগ নেই — সব কিছু main gate দিয়ে। আমাদের Docker production setup-ও ঠিক এরকম — development-এ যা চলে তা production-এ যথেষ্ট না।

তাহলে production মানে কী কী বদলায়? প্রথমত **multi-stage build** — development-এ যে সব build tool, compiler, dev dependency আছে সেগুলো production image-এ দরকার নেই। রেস্তোরাঁর kitchen-এ হয়তো বিশাল industrial mixer আছে, কিন্তু customer-এর টেবিলে শুধু সুন্দর প্লেটে খাবার যায়, mixer না। Multi-stage build দিয়ে আমরা "builder stage"-এ সব compile করি, তারপর শুধু compiled output "runner stage"-এ নিয়ে যাই। দ্বিতীয়ত **Nginx reverse proxy** — এটাই সেই main gate। সব external traffic প্রথমে Nginx-এ আসে, সে decide করে কোনটা frontend-এ পাঠাবে, কোনটা backend API-তে। কেউ সরাসরি backend বা database-এ ঢুকতে পারে না। তৃতীয়ত **non-root user, pinned tags, health checks, secrets management** — এগুলো হলো রেস্তোরাঁর safety certificate, quality seal।

এই boss battle-এ তুমি World 1-এর সব জ্ঞান একসাথে apply করবে। Multi-stage Dockerfile থেকে শুরু করে Nginx configuration, health checks দিয়ে service dependency, secrets management, security hardening — সব একটা `docker-compose.prod.yml` file-এ। একটাই command: `docker compose -f docker-compose.prod.yml up -d` — এবং তোমার পুরো stack production-ready হয়ে উঠবে। ঠিক এভাবেই real-world production deployment কাজ করে!

## Concept

### Production vs Development — মূল পার্থক্য

| বিষয়          | Development    | Production                      |
| -------------- | -------------- | ------------------------------- |
| Image size     | বড় হলেও চলে   | যতটা সম্ভব ছোট (multi-stage)    |
| Secrets        | .env file      | Docker secrets / secret manager |
| Exposed ports  | সব port খোলা   | শুধু Nginx-এর 80/443            |
| User           | root-এ চলে     | non-root user                   |
| Image tags     | `latest`       | pinned (`mongo:7.0.14`)         |
| Health checks  | optional       | mandatory সব service-এ          |
| Restart policy | নাও থাকতে পারে | `unless-stopped`                |
| Reverse proxy  | নেই            | Nginx mandatory                 |

---

### Multi-Stage Dockerfile — NestJS Backend

```dockerfile
# ===== STAGE 1: builder =====
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies আগে copy (layer cache optimization)
COPY package*.json ./
RUN npm ci --only=production=false

# Source code copy করো
COPY . .

# Build করো (TypeScript → JavaScript)
RUN npm run build

# ===== STAGE 2: runner (production) =====
FROM node:20-alpine AS runner

# Non-root user তৈরি করো
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# শুধু production deps install
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Builder থেকে শুধু compiled output নাও
COPY --from=builder /app/dist ./dist

# User বদলাও (non-root)
USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**কেন এই structure?**

- `AS builder` — এই stage শুধু build করার জন্য। এতে TypeScript compiler, dev tools সব আছে।
- `COPY --from=builder /app/dist ./dist` — builder stage-এর compiled output (`dist/`) শুধু runner-এ নিই।
- Final image-এ TypeScript, ts-node, nodemon — কিছুই নেই। Image size ১.২ GB থেকে নেমে আসে ~১৫০ MB-তে।
- `npm ci --only=production` — `devDependencies` skip করে। শুধু runtime-এ লাগে এমন packages।

---

### Multi-Stage Dockerfile — Next.js Frontend

```dockerfile
# ===== STAGE 1: dependencies =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ===== STAGE 2: builder =====
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ variables build time-এ inject হয় — এজন্য ARG লাগে
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# next.config.js-এ output: 'standalone' থাকতে হবে!
RUN npm run build

# ===== STAGE 3: runner =====
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production

# Standalone output copy
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

**Critical — `NEXT_PUBLIC_` কেন build-time-এ দিতে হয়:**

Next.js `NEXT_PUBLIC_` variables bundle করে JavaScript-এ। Build হওয়ার সময় এই value hardcode হয়ে যায়। Container চলার সময় (runtime-এ) এই variable দিলে কোনো কাজ হবে না — bundle ইতোমধ্যে তৈরি। তাই Dockerfile-এ `ARG` + `ENV` এবং Compose-এ `build.args` দিয়ে build-time-এ inject করতে হবে।

---

### Nginx Reverse Proxy Configuration

```nginx
# nginx/nginx.conf
events {
  worker_connections 1024;
}

http {
  upstream frontend {
    server frontend:3000;
  }

  upstream backend {
    server backend:3001;
  }

  server {
    listen 80;
    server_name _;

    # Frontend — সব request এখানে যাবে by default
    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # API requests — /api/ দিয়ে শুরু হলে backend-এ যাবে
    location /api/ {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

Nginx হলো একমাত্র "গেট" — port 80/443। Frontend বা backend-এর port বাইরে থেকে কেউ দেখতে পায় না।

---

### Production docker-compose.prod.yml — পূর্ণ Setup

```yaml
version: "3.8"

services:
  # ===== NGINX REVERSE PROXY (একমাত্র public-facing service) =====
  nginx:
    image: nginx:1.27-alpine
    container_name: prod_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      frontend:
        condition: service_healthy
      backend:
        condition: service_healthy
    networks:
      - public
      - internal

  # ===== FRONTEND =====
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      args:
        # Build-time inject — runtime-এ দিলে কাজ করে না
        - NEXT_PUBLIC_API_URL=/api
    image: myapp/frontend:1.0.0
    container_name: prod_frontend
    restart: unless-stopped
    # ports নেই — Nginx দিয়ে access হবে
    networks:
      - internal
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000",
        ]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

  # ===== BACKEND =====
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    image: myapp/backend:1.0.0
    container_name: prod_backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/myapp_prod
      # SECRET values: env_file থেকে আসে, git-এ নেই
    env_file:
      - ./apps/backend/.env.prod
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - internal
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3001/health",
        ]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 40s

  # ===== DATABASE =====
  mongodb:
    image: mongo:7.0.14 # pinned tag — latest না!
    container_name: prod_mongodb
    restart: unless-stopped
    # ports নেই — শুধু internal network
    volumes:
      - mongo-data:/data/db
    networks:
      - internal
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

# ===== NETWORKS =====
networks:
  public:
    driver: bridge
  internal:
    driver: bridge
    internal: true # এই network থেকে internet access নেই

# ===== VOLUMES =====
volumes:
  mongo-data:
    driver: local
```

---

### Secrets Management — ARG vs ENV

```
ARG  →  শুধু build time-এ available। Final image-এ নেই।
ENV  →  Container runtime-এ available। `docker inspect`-এ দেখা যায়!
```

**Sensitive secrets (JWT_SECRET, DB_PASSWORD):**

- `.env.prod` file-এ রাখো — git-এ commit করো না (`.gitignore`-এ যোগ করো)
- `env_file` দিয়ে Compose-এ inject করো
- Production-এ cloud secret manager (AWS Secrets Manager, GCP Secret Manager) ব্যবহার করো

**`.dockerignore` — অবশ্যই থাকতে হবে:**

```
node_modules
.env
.env.*
.git
*.md
coverage
.next/cache
dist
```

---

### Security Hardening Checklist

| Security মাপকাঠি          | কীভাবে করবে                                 |
| ------------------------- | ------------------------------------------- |
| Non-root user             | `USER nestjs` Dockerfile-এ                  |
| Pinned image tags         | `mongo:7.0.14` — `latest` না                |
| No exposed internal ports | শুধু Nginx-এর port publish                  |
| Secrets in env_file       | `.env.prod` — git-এ না                      |
| `.dockerignore`           | build context ছোট রাখো                      |
| Image scanning            | `docker scout cves myapp/backend:1.0.0`     |
| Read-only filesystem      | `read_only: true` + tmpfs যেখানে write লাগে |

## Tool Spotlight

**`docker scout cves <image>`** — Docker Scout image-এর সব known vulnerability scan করে দেখায়। `docker scout cves myapp/backend:1.0.0` চালালে CVE list, severity (critical/high/medium/low), এবং কোন package-এ সমস্যা সেটা দেখাবে। CI/CD pipeline-এ যোগ করো যাতে vulnerable image কখনো production-এ না যায়।

## Real World

**"Image 1.2 GB" — Shopify-র real story:**

একটা real startup-এর backend image ছিল ১.৪ GB। Deployment নিত ৭-৮ মিনিট। CI/CD pipeline slow, cloud storage cost বেশি। Multi-stage build add করার পর image নামে ১৪০ MB-তে। Deployment সময় নামে ৪৫ সেকেন্ডে। শুধু Dockerfile optimize করে infrastructure cost ৬০% কমে। আর শুধু তাই না — ছোট image মানে attack surface কম — vulnerability কম।

**Root user-এ চলার বিপদ — একটা real incident:**

২০১৯ সালে একটা company-র container-এ vulnerability exploit হয়। কারণ container root-এ চলছিল। Attacker container থেকে বের হয়ে host machine-এ access পেয়েছিল (container escape)। যদি non-root user হতো, attack অনেক সীমিত থাকতো। OWASP Docker security top-10-এ "running as root" একটা critical risk। Production-এ সব container-এ `USER` instruction mandatory।

## মনে রাখো

- Multi-stage build-এ `COPY --from=builder` দিয়ে শুধু compiled output নাও — dev tools, source code final image-এ রাখা উচিত না; image size ৫-১০x ছোট হয়।
- `NEXT_PUBLIC_` variables Next.js bundle-এ hardcode হয় — build time-এ `ARG` দিয়ে inject করতে হবে, runtime environment দিয়ে কাজ হবে না।
- Production-এ শুধু Nginx-এর port (80/443) publish করো — frontend, backend, database-এর port কখনো বাইরে expose করো না।
- সব service-এ non-root user (`USER` instruction) এবং pinned image tags (`mongo:7.0.14` না `mongo:latest`) — এই দুটো security-র জন্য mandatory।
- `depends_on: condition: service_healthy` + healthcheck ছাড়া NestJS database ready হওয়ার আগেই start করে crash করবে — `service_started` নয়, `service_healthy` condition ব্যবহার করো।
