---
id: wd1l4
world: wd1
order: 4
title: "NestJS Backend Dockerize করা"
titleEn: "Dockerize the NestJS Backend"
estMinutes: 30
type: lesson
---

## গল্প

ঢাকার একটা বিরিয়ানি রেস্তোরাঁর রান্নাঘরের কথা চিন্তা করো। কাঁচা মাংস থেকে শুরু হয়, সেটা মেরিনেট হয়, মশলা মাখানো হয়, ধীরে ধীরে রান্না হয়। রান্নাঘরে হাঁড়ি-পাতিল আছে, চুলো আছে, কাটার বোর্ড আছে — অনেক সরঞ্জাম। কিন্তু যখন customer-এর সামনে বিরিয়ানি যায়, তখন কি পুরো রান্নাঘর চলে যায়? না! যায় শুধু সুন্দর plate-এ সাজানো finished বিরিয়ানিটা। রান্নাঘরের সব tools রান্নাঘরেই থাকে।

NestJS backend-এর Dockerfile-এ ঠিক এই দুই পর্যায় আছে। **Stage 1** হলো রান্নাঘর — TypeScript compiler আছে, সব dev dependencies আছে (`@nestjs/cli`, `ts-node`, `@types/*`), এখানে `pnpm run build` চালালে TypeScript source code থেকে JavaScript `dist/` folder বের হয়। এটা হলো তোমার কাঁচা উপকরণ থেকে রান্না করার পর্যায়। **Stage 2** হলো serving plate — এখানে শুধু compiled `dist/` folder আসে আর production-এর জন্য শুধু দরকারি `node_modules`। TypeScript compiler? রান্নাঘরেই রইল। Dev dependencies? রান্নাঘরেই রইল।

এই দুই-পর্যায়ের রান্নার ফলে কী হয়? TypeScript source সমেত সব build tools থাকলে image হয় 1.2GB — এই পুরো রান্নাঘর production server-এ পাঠানো মানে বোকামি। কিন্তু multi-stage build দিয়ে final image হয় মাত্র ~250MB — শুধু রান্না করা বিরিয়ানি, রান্নাঘর ছাড়া। ঠিক এভাবেই Docker multi-stage build দিয়ে NestJS backend-কে production-ready করা হয়!

## Concept

### কেন এই App-এর Dockerfile একটু আলাদা?

এই learning platform একটা **monorepo** — মানে একটাই root directory থেকে frontend আর backend দুটোই manage হয়। Project structure এরকম:

```
learning-platform/          ← workspace root (build context এখান থেকে)
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   ├── Dockerfile      ← backend-এর Dockerfile
│   │   └── package.json
│   └── frontend/
├── package.json            ← workspace root package.json
└── pnpm-workspace.yaml     ← pnpm workspace config
```

**Monorepo-র মূল challenge:** Dockerfile `apps/backend/`-এর ভেতরে থাকলেও `docker build` চালাতে হবে workspace root থেকে — কারণ `pnpm-workspace.yaml` আর root `package.json` root-এ আছে, সেগুলো ছাড়া `pnpm install` কাজ করবে না।

---

### pnpm in Docker — corepack দিয়ে

`npm` আর `yarn`-এর মতো `pnpm` default-ভাবে node image-এ থাকে না। পুরানো পদ্ধতি ছিল `RUN npm install -g pnpm` — কিন্তু এটা deprecated। সঠিক পদ্ধতি হলো **corepack**:

```dockerfile
RUN corepack enable && corepack prepare pnpm@latest --activate
```

`corepack` হলো Node.js-এর built-in package manager switcher — `node:20-alpine`-এ আগে থেকেই আছে। এটা দিয়ে pnpm activate করলে correct version পাওয়া যায়।

---

### সম্পূর্ণ Dockerfile — এই App-এর Real Production Version

```dockerfile
# ============================================
# Stage 1: Builder (রান্নাঘর)
# TypeScript → JavaScript compile করার stage
# ============================================
FROM node:20-alpine AS builder

# pnpm activate করো (corepack node.js-এ built-in)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Workspace root-এর config files আগে copy করো (cache optimization)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Backend package.json copy করো
COPY apps/backend/package.json ./apps/backend/

# সব dependencies install করো (dev + production — build করতে দরকার)
RUN pnpm install --frozen-lockfile

# Source code copy করো
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/nest-cli.json ./apps/backend/

# TypeScript compile করো → dist/ বের হবে
RUN pnpm --filter backend run build

# ============================================
# Stage 2: Runner (Serving Plate)
# শুধু compiled output নিয়ে production চালানো
# ============================================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Production environment set করো
ENV NODE_ENV=production

# Workspace config copy করো (production install-এর জন্য)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# শুধু production dependencies install করো (dev deps বাদ!)
RUN pnpm install --frozen-lockfile --prod

# Builder stage থেকে compiled dist/ নিয়ে আসো
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Security: root user-এ না চালিয়ে node user-এ চালাও
USER node

# Backend port expose করো
EXPOSE 3001

# App start করো
CMD ["node", "apps/backend/dist/main"]
```

---

### Step by Step — প্রতিটা লাইন কেন

**`FROM node:20-alpine AS builder`**
`alpine` মানে lightweight Linux distro — base image মাত্র ~7MB। `AS builder` দিয়ে stage-এর নাম দেওয়া হলো।

**`RUN corepack enable && corepack prepare pnpm@latest --activate`**
Node.js-এর built-in `corepack` দিয়ে pnpm activate করা হলো — `npm install -g pnpm` এর চেয়ে এটাই সঠিক পদ্ধতি।

**`COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./`**
Workspace root-এর config আগে copy করো। এরপর `pnpm install` — এই দুই step এক সাথে cache হবে। `package.json` না বদলালে পরের build-এ `pnpm install` skip হবে।

**`RUN pnpm install --frozen-lockfile`**
`--frozen-lockfile` মানে `pnpm-lock.yaml` পরিবর্তন না করে exact version install করো — CI/CD-তে এটা must।

**`RUN pnpm --filter backend run build`**
Monorepo-তে specific workspace-এর script run করতে `--filter` flag ব্যবহার হয়। এটা `apps/backend/`-এর `build` script চালাবে।

**`COPY --from=builder /app/apps/backend/dist ./apps/backend/dist`**
Stage 2-এর magic line — Builder stage থেকে শুধু compiled `dist/` folder নিয়ে আসছে। TypeScript source, dev tools — কিছুই আসছে না।

**`USER node`**
`node:20-alpine` image-এ `node` নামে একটা non-root user আগে থেকেই আছে। Root user-এ app চালানো security risk — কেউ container breach করলে root access পেয়ে যাবে। `USER node` দিয়ে সেই ঝুঁকি কমানো হলো।

**`EXPOSE 3001`**
Documentation হিসেবে বলছে এই container 3001 port ব্যবহার করে। এটা actual port mapping করে না (সেটা `docker run -p`-এর কাজ), কিন্তু Docker Compose আর infrastructure tools এই info ব্যবহার করে।

---

### Image Size — Real Numbers

| Stage                        | কী আছে                                     | Size       |
| ---------------------------- | ------------------------------------------ | ---------- |
| Single-stage (naive)         | সব source + all deps + TypeScript compiler | ~1.2GB     |
| Builder stage (intermediate) | সব deps + compiled dist                    | ~800MB     |
| **Final image (runner)**     | **dist/ + production node_modules only**   | **~250MB** |

250MB vs 1.2GB — **5x ছোট**! AWS ECR-তে push, ECS-তে pull — সব কিছুতে এই পার্থক্য সরাসরি deploy time আর cost-এ দেখা যায়।

---

### Build ও Run — Real Commands

**Image build করো (workspace root থেকে চালাও):**

```bash
$ docker build -f apps/backend/Dockerfile -t learning-platform-backend .
```

`-f apps/backend/Dockerfile` — Dockerfile-এর location বলে দিচ্ছো
`.` (শেষে) — build context হলো current directory (workspace root)

**Build-এর পরে image দেখো:**

```bash
$ docker images learning-platform-backend
```

**Container চালাও:**

```bash
$ docker run -p 3001:3001 --env-file .env learning-platform-backend
```

`--env-file .env` — `.env` file থেকে সব environment variable inject করো (DATABASE_URL, JWT_SECRET, ইত্যাদি)

**Container-এর ভেতরে ঢোকো (debug করতে):**

```bash
$ docker exec -it backend_container sh
```

Alpine Linux-এ `bash` থাকে না — `sh` ব্যবহার করো।

---

### Health Check — TerminusModule

Production-এ Docker Compose বা Kubernetes জানতে চায় app আসলে healthy কিনা। NestJS-এ `@nestjs/terminus` দিয়ে health endpoint তৈরি করা হয়:

```typescript
// health.controller.ts
@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
```

Container run হওয়ার পরে test করো:

```bash
$ curl http://localhost:3001/health
# Response: {"status":"ok","info":{},"error":{},"details":{}}
```

Docker Compose-এ health check যোগ করতে পারো:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

### .dockerignore — Monorepo-তে অবশ্যই দরকার

```
# .dockerignore (workspace root-এ রাখো)
node_modules
**/node_modules
dist
**/dist
.git
*.md
.env
.env.*
coverage
.DS_Store
*.log
apps/frontend
```

`apps/frontend` বাদ দেওয়া হলো — backend image build করতে frontend source লাগে না, শুধু build context ছোট হবে।

## Tool Spotlight

**`pnpm --filter <workspace> run <script>`** — monorepo-তে specific package-এর script চালানোর command। `--filter backend` মানে `apps/backend/`-এর script। `pnpm --filter frontend run build` চালালে শুধু frontend build হবে। CI/CD pipeline-এ প্রতিটা app আলাদাভাবে build করতে এই flag অপরিহার্য।

## Real World

**Shopify-র monorepo Docker strategy:** Shopify তাদের massive monorepo-তে Docker build করার সময় `--filter` pattern ব্যবহার করে specific service-এর জন্য image build করে। প্রতিটা service-এর নিজস্ব Dockerfile থাকে, কিন্তু build context সবসময় monorepo root — কারণ shared packages আর workspace configuration root-এ থাকে। এই pattern টাই এই learning platform follow করছে।

**একটা common production mistake:** অনেক developer `USER node` দিতে ভুলে যান। Container root-এ চলে, সব ঠিকঠাক কাজ করে — কিন্তু এটা একটা নীরব security hole। যদি কোনো vulnerability থাকে আর attacker container-এ ঢুকতে পারে, root access পাওয়া মানে পুরো container দখল। `USER node` এক লাইনেই এই ঝুঁকি কমানো যায়। AWS, Google Cloud-এর security best practices সবই non-root user recommend করে।

## মনে রাখো

- Monorepo-তে `docker build` সবসময় **workspace root থেকে** চালাও — `-f apps/backend/Dockerfile .` (শেষে dot মানে current directory = build context)।
- `pnpm` install করতে `corepack enable && corepack prepare pnpm@latest --activate` — `npm install -g pnpm` নয়, এটাই সঠিক modern পদ্ধতি।
- `pnpm install --frozen-lockfile --prod` Stage 2-তে — dev dependencies বাদ দেওয়াটাই image ছোট করার মূল কৌশল।
- `USER node` মানে non-root user — production container কখনো root-এ চালানো উচিত না।
- Alpine Linux-এ `bash` থাকে না — container-এ ঢুকতে `docker exec -it <name> sh` ব্যবহার করো।
- `/health` endpoint রাখো — Docker Compose আর Kubernetes health check করতে এটা লাগে, না থাকলে orchestrator বুঝবে না app ready কিনা।
