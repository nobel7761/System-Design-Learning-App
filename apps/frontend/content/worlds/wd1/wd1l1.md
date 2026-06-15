---
id: wd1l1
world: wd1
order: 1
title: "Multi-stage Builds — হালকা Image বানাও"
titleEn: "Multi-stage Builds — Slim Images"
estMinutes: 30
type: lesson
---

## গল্প

চিন্তা করো, Chittagong-এর একটা বড় গাড়ির কারখানা। সেখানে শত শত machine আছে — welding torch, paint booth, assembly line, quality testing equipment। এগুলো ছাড়া গাড়ি বানানো সম্ভব না। কিন্তু যখন গাড়ি তৈরি হয়ে যায়, Dhaka-র showroom-এ কি সেই welding torch পাঠানো হয়? অবশ্যই না! Showroom-এ যায় শুধু চকচকে finished গাড়িটা। Customer গাড়ি কিনতে আসে — কারখানার ধুলো-মাখা tools দেখতে না।

Docker multi-stage build ঠিক এই কারখানা আর showroom-এর মতো কাজ করে। তোমার NestJS app build করতে TypeScript compiler লাগে, `ts-node` লাগে, `@types/*` packages লাগে, dev dependencies লাগে — মোট মিলিয়ে 1.2GB-এর একটা দানব image। কিন্তু production-এ run করতে? শুধু compiled `dist/` folder আর `node_modules` (production-only) — মাত্র 180MB! বাকি সব build-time জিনিস, production image-এ নেওয়ার কোনো মানে নেই।

এখন ভাবো, তোমার company প্রতিদিন 100টা deployment করে। Single-stage build হলে প্রতিবার 1.2GB image pull করতে হয়, push করতে হয়, store করতে হয়। Multi-stage হলে সেটা 180MB — মানে প্রায় 7x দ্রুত deployment, 6x কম storage খরচ। আর bonus হিসেবে, ছোট image মানে ছোট attack surface — hacker-দের কম কিছু দেখার সুযোগ। ঠিক এভাবেই Docker multi-stage build তোমার production life পাল্টে দিতে পারে!

## Concept

### Single-stage এর সমস্যা

প্রথমে দেখো একটা naive single-stage Dockerfile কেমন হয়:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
```

এই Dockerfile দিয়ে image build করলে কী পাবে? `node:18` base image (~950MB) + সব dev dependencies + TypeScript compiler + source code + compiled output — মোট মিলিয়ে 1.2GB+ একটা image। Production-এ এই পুরো জিনিস পাঠাচ্ছো, যেখানে TypeScript compiler-এর কোনো কাজই নেই।

### Multi-stage Dockerfile এর structure

Multi-stage Dockerfile-এ একাধিক `FROM` instruction থাকে। প্রতিটা `FROM` একটা নতুন stage শুরু করে। আগের stage-এর সব intermediate layers final image-এ যায় না।

```dockerfile
# ===== STAGE 1: Builder (কারখানা) =====
FROM node:18-alpine AS builder

WORKDIR /app

# প্রথমে শুধু package files copy করো (caching এর জন্য)
COPY package*.json ./
RUN npm install

# তারপর source code copy করো
COPY . .

# TypeScript compile করো
RUN npm run build

# ===== STAGE 2: Runner (শোরুম) =====
FROM node:18-alpine AS runner

WORKDIR /app

# শুধু production dependencies install করো
COPY package*.json ./
RUN npm install --only=production

# Builder stage থেকে শুধু compiled output নিয়ে এসো
COPY --from=builder /app/dist ./dist

# Production-এ run করো
CMD ["node", "dist/main.js"]
```

**মূল magic হলো:** `COPY --from=builder /app/dist ./dist` — এই line-টা `builder` stage থেকে শুধু `dist/` folder নিয়ে আসছে। `builder` stage-এর বাকি সব (TypeScript source, dev dependencies, compiler) — সব বাদ।

### Stage naming এর নিয়ম

`AS builder` দিয়ে stage-এর নাম দেওয়া হয়। নাম যেকোনো কিছু হতে পারে:

```dockerfile
FROM node:18-alpine AS builder      # compile stage
FROM node:18-alpine AS tester       # test stage
FROM node:18-alpine AS runner       # final production stage
```

একটা specific stage পর্যন্ত build করতে চাইলে `--target` flag ব্যবহার করো:

```bash
$ docker build --target builder -t myapp:build-only .
```

এটা debugging-এর জন্য খুব useful — যদি build stage-এ কোনো problem হয়, শুধু সেই stage পর্যন্ত build করে check করতে পারবে।

### সম্পূর্ণ build এবং image দেখা

```bash
# Final image build করো
$ docker build -t myapp:slim .

# Image size compare করো
$ docker images | grep myapp
```

Output দেখবে এরকম:

```
REPOSITORY   TAG          IMAGE ID       SIZE
myapp        slim         a1b2c3d4e5f6   180MB
myapp        build-only   f6e5d4c3b2a1   1.2GB
```

180MB vs 1.2GB — পার্থক্যটা চোখে পড়ার মতো!

### ARG vs ENV — Build time vs Runtime

এই দুটো নিয়ে অনেকেই confuse হয়:

| Feature                            | `ARG`                        | `ENV`                      |
| ---------------------------------- | ---------------------------- | -------------------------- |
| কখন কাজ করে                        | শুধু build time-এ            | Build time + Runtime উভয়ে |
| Container run করার পর পাওয়া যায়? | না                           | হ্যাঁ                      |
| ব্যবহার                            | Build-time secrets, versions | App config, credentials    |
| উদাহরণ                             | `ARG NODE_VERSION=18`        | `ENV PORT=3000`            |

```dockerfile
# Build time-এ use হয়, container-এ থাকে না
ARG BUILD_ENV=production

# Runtime-এ app এই variable পাবে
ENV PORT=3000
ENV NODE_ENV=production
```

**সাবধান:** `ARG` দিয়ে sensitive secrets pass করো না — Docker image history-তে দেখা যায়!

### .dockerignore — অপ্রয়োজনীয় জিনিস বাদ দাও

`.dockerignore` file হলো `.gitignore`-এর মতো — এই file-এ লেখা জিনিসগুলো `COPY` command কখনো copy করবে না।

```
# .dockerignore
node_modules
.git
*.md
.env
.env.*
coverage
dist
.DS_Store
*.log
```

**কেন গুরুত্বপূর্ণ?**

- `node_modules` copy করলে host-এর OS-specific binaries Docker container-এ কাজ নাও করতে পারে
- `.git` directory অনেক বড় এবং production-এ একদম দরকার নেই
- `*.md` files production image-এ কোনো কাজে আসে না
- `.env` files কখনোই image-এ রাখা উচিত না — security risk!

`.dockerignore` ছাড়া `COPY . .` করলে host machine-এর `node_modules` (যেটা 500MB+ হতে পারে) পুরোটা container-এ যাবে। Build context অনেক বড় হবে, build time বাড়বে।

### Caching strategy — সঠিক order-এ COPY করো

Docker layer caching কীভাবে কাজ করে সেটা বুঝলে build অনেক দ্রুত হয়:

```dockerfile
# ভালো order (cache-friendly)
COPY package*.json ./          # Step 1: package files
RUN npm install                # Step 2: dependencies install (ধীর)
COPY . .                       # Step 3: source code
RUN npm run build              # Step 4: compile
```

**কেন এই order?**

`package.json` সাধারণত source code-এর চেয়ে কম বদলায়। Docker প্রতিটা layer cache করে রাখে। যদি `package.json` না বদলায়, `npm install` step-টা cached থাকবে — পরের build-এ skip হয়ে যাবে। তুমি শুধু source change করেছো? Docker দেখবে Step 1 আর Step 2 same আছে, তাই সেগুলো cache থেকে নেবে। শুধু Step 3 আর 4 নতুন করে run করবে।

**খারাপ order (cache bust করে):**

```dockerfile
# এভাবে করলে source বদলালে npm install-ও আবার run হবে
COPY . .                       # source বদলালেই...
RUN npm install                # ...এটাও নতুন করে হবে (ধীর!)
```

## Tool Spotlight

**`docker build --target`** দিয়ে multi-stage Dockerfile-এর যেকোনো intermediate stage পর্যন্ত build করা যায়। CI/CD pipeline-এ এটা খুব কাজে লাগে — test stage আলাদা করে run করতে, বা build artifact extract করতে। উদাহরণ: `docker build --target tester -t myapp:test .`

## Real World

**ঘটনা: একটা Dhaka-র startup-এর deployment nightmare।**

একটা Bangladeshi fintech startup তাদের NestJS backend single-stage Dockerfile দিয়ে চালাচ্ছিল। তাদের image size ছিল 1.4GB। AWS ECR-তে push করতে প্রতিবার 3-4 মিনিট, ECS-তে pull করতে আরো 2-3 মিনিট। মোট deployment time: প্রায় 8-10 মিনিট। দিনে 50টা deployment মানে ঘণ্টার পর ঘণ্টা নষ্ট।

Multi-stage build adopt করার পরে? Image size নামলো 190MB-তে। ECR push: 30 সেকেন্ড। ECS pull: 20 সেকেন্ড। Total deployment time: 1-2 মিনিট। শুধু Dockerfile পরিবর্তন করে deployment pipeline 6-7x দ্রুত হয়ে গেল।

**আরেকটা common mistake:** অনেক developer `.dockerignore` না দিয়ে `COPY . .` করেন। ফলে local-এর `node_modules` (যেটা macOS-এর জন্য compiled) Docker container-এ (Linux) কাজ করে না। App crash করে, developer confused হয়। সমাধান সহজ — `.dockerignore`-এ `node_modules` যোগ করো, Docker নিজে Linux-এর জন্য fresh `npm install` করুক।

## মনে রাখো

- Multi-stage build মানে একই Dockerfile-এ একাধিক `FROM` — প্রতিটা `FROM` একটা আলাদা stage, শুধু final stage-ই production image হয়
- `COPY --from=<stage-name>` দিয়ে আগের stage থেকে নির্দিষ্ট file/folder নিয়ে আসা যায় — বাকি সব automatically বাদ যায়
- `ARG` শুধু build time-এ কাজ করে, container run হওয়ার পরে পাওয়া যায় না; `ENV` runtime-এ app পায়
- `.dockerignore`-এ সবসময় `node_modules`, `.git`, `.env` রাখো — এগুলো কখনো image-এ নেওয়া উচিত না
- Caching-এর জন্য `package.json` আগে copy করো, `npm install` করো, তারপর source copy করো — এই order follow করলে unchanged dependencies-এর জন্য rebuild লাগবে না
