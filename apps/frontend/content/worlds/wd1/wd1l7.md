---
id: wd1l7
world: wd1
order: 7
title: "Docker Security ও Best Practices"
titleEn: "Docker Security & Best Practices"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি নতুন বাড়ি বানিয়েছো আর একজন contractor-কে ডেকেছো মেরামতের কাজে। তুমি কি তাকে বাড়ির master key দেবে — যেটা দিয়ে মেইন গেট, শোবার ঘর, ড্রেসিং রুম, আলমারি সব খোলা যায়? নিশ্চয়ই না! তুমি বলবে, "ভাই, শুধু রান্নাঘরের চাবিটা নাও, কাজ শেষ হলে ফেরত দিও।" এটাই হলো **non-root user**-এর concept। Docker container যখন `root` user হিসেবে চলে, তখন সে পুরো system-এর master key পেয়ে যায় — কোনো vulnerability exploit হলে attacker-ও সেই সুযোগ পাবে। কিন্তু তুমি যদি আলাদা `appuser` বানাও এবং শুধু কাজের জায়গাটুকু দাও, তাহলে সবচেয়ে খারাপ দিনেও ক্ষতি সীমিত থাকবে।

এবার ভাবো read-only filesystem-এর কথা। তুমি একজন ছাত্রকে পরীক্ষার হলে canvas দিয়েছো ছবি আঁকার জন্য। কিন্তু সে বাইরে গিয়ে রং কিনে আসতে পারবে না, দোকান থেকে নতুন붓 আনতে পারবে না। হলের ভেতরে যা আছে, তাই দিয়েই কাজ করতে হবে। `--read-only` flag দিলে container-এর filesystem তেমনই হয়ে যায় — malware বা attacker চাইলেও নতুন কিছু লিখতে বা script install করতে পারবে না। আর minimal base image যেমন **Alpine** বা **Distroless** হলো যেন ছোট্ট একটা টিফিন বক্সে শুধু ভাত-তরকারি — অতিরিক্ত ketchup, ছুরি, বড় থালা কিছুই নেই। কম জিনিস মানে কম vulnerability!

সবশেষে আসো **secrets**-এর কথায়। তোমার ATM PIN কি তুমি চিরকুটে লিখে মানিব্যাগে রাখো? অথবা WhatsApp status-এ দাও? না! কিন্তু অনেক developer ঠিক এটাই করে — Dockerfile-এ `ENV DB_PASSWORD=12345` লিখে রাখে। এই Dockerfile GitHub-এ গেলে পুরো পৃথিবী সেই password দেখতে পারে। Docker secrets, environment injection, বা vault ব্যবহার করো — কখনো plaintext-এ credentials রাখো না। Security মানে শুধু fancy firewall না — এই ছোট ছোট অভ্যাসগুলোই production-এ তোমাকে রক্ষা করবে।

## Concept

### ১. Non-Root User: Master Key না দিয়ে কাজের চাবি দাও

Default-এ Docker container-এ app `root` হিসেবে চলে। এটা অনেক বড় risk — container escape হলে attacker host machine-এ root access পেতে পারে। Solution হলো Dockerfile-এ dedicated user বানানো:

```dockerfile
FROM node:20.11-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# নতুন group ও user তৈরি করো (system user, no login shell)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Files-এর ownership দাও নতুন user-কে
RUN chown -R appuser:appgroup /app

# এখন থেকে এই user-এ চলবে
USER appuser

CMD ["node", "dist/main.js"]
```

Runtime-এও user specify করা যায়:

```bash
$ docker run --user 1000:1000 myapp
```

`1000:1000` মানে UID:GID — Linux-এ প্রথম non-root user সাধারণত 1000।

### ২. Read-Only Filesystem: লেখার অধিকার নেই

```bash
$ docker run --read-only --tmpfs /tmp myapp
```

`--read-only` দিলে container-এর পুরো filesystem read-only হয়। কিন্তু অনেক app-এর `/tmp`-তে temporary file লেখার দরকার হয় — তাই `--tmpfs /tmp` দিয়ে শুধু সেই directory-টা writable in-memory mount হিসেবে দাও। বাকি সব locked।

### ৩. Minimal Base Images: ছোট বাক্সে কম ঝামেলা

| Base Image                   | Size    | CVE Count (approx) | Use Case                 |
| ---------------------------- | ------- | ------------------ | ------------------------ |
| `node:18`                    | ~1 GB   | 100+ CVEs          | Development only         |
| `node:18-alpine`             | ~180 MB | 10-20 CVEs         | General production       |
| `gcr.io/distroless/nodejs18` | ~120 MB | Near zero          | High-security production |

**Alpine** Linux হলো ultra-minimal — শুধু musl libc আর busybox। Shell আছে, debugging possible। **Distroless** আরো এক ধাপ এগিয়ে — কোনো shell নেই, কোনো package manager নেই, শুধু runtime। Attacker ঢুকলেও কিছু করার নেই।

```dockerfile
# Production-grade multi-stage build
FROM node:20.11-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Distroless final image
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot
CMD ["dist/main.js"]
```

### ৪. Never Use `latest` Tag in Production

```dockerfile
# ভুল — latest কোন version সেটা নিশ্চিত না
FROM node:latest

# সঠিক — exact version pin করা
FROM node:20.11-alpine3.19
```

`latest` tag মানে আজ যে build হলো সেটা, কাল হয়তো অন্য কিছু। Production-এ image rebuild করলে behavior বদলে যেতে পারে। Always pin করো — `node:20.11-alpine3.19` এর মতো specific version।

### ৫. Secrets Management: ATM PIN চিরকুটে লেখো না

```dockerfile
# কখনো এটা করো না!
ENV DB_PASSWORD=supersecret123
ENV API_KEY=abc123xyz
```

এই Dockerfile Docker Hub বা GitHub-এ গেলে সবাই দেখতে পারবে। সঠিক পদ্ধতি:

```bash
# Runtime-এ inject করো (environment variable হিসেবে)
$ docker run -e DB_PASSWORD="$DB_PASSWORD" myapp

# Docker secret ব্যবহার করো (Swarm mode)
$ echo "mysecretpassword" | docker secret create db_password -

# BuildKit secret (build time-এ, image-এ থাকে না)
$ docker buildx build --secret id=npmrc,src=$HOME/.npmrc .
```

Dockerfile-এ শুধু লিখবে `ENV DB_PASSWORD=` — empty placeholder, value আসবে runtime-এ।

### ৬. .dockerignore: কী copy করা যাবে না

`.dockerignore` file বানাও project root-এ:

```
# Version control
.git
.gitignore

# Secrets & env
.env
.env.*
*.pem
*.key

# Dependencies (image-এ fresh install হবে)
node_modules

# Dev files
*.md
*.test.ts
*.spec.ts
__tests__/
coverage/

# Build artifacts (যদি multi-stage না হয়)
dist/
build/
```

এটা না থাকলে `COPY . .` দিলে `.git` folder, `.env` file সব image-এ ঢুকে যাবে!

### ৭. Resource Limits: একজন tenant পুরো বিল্ডিং দখল নিতে পারবে না

```bash
# Memory সর্বোচ্চ 512MB, CPU সর্বোচ্চ 0.5 core
$ docker run --memory=512m --cpus=0.5 myapp

# Process ID limit (fork bomb prevent করে)
$ docker run --pids-limit=100 myapp
```

Resource limit না দিলে একটা buggy container পুরো host-এর memory বা CPU খেয়ে ফেলতে পারে এবং বাকি সব container crash করতে পারে।

### ৮. Linux Capabilities: শুধু যা দরকার

```bash
# সব capability drop করো, শুধু প্রয়োজনীয়টা add করো
$ docker run --cap-drop ALL --cap-add NET_BIND_SERVICE myapp

# Privilege escalation বন্ধ করো
$ docker run --no-new-privileges myapp
```

Linux capabilities হলো root power-এর ছোট ছোট টুকরো। `NET_BIND_SERVICE` মানে 1024-এর নিচের port bind করার অধিকার। বাকি সব drop করলে container অনেক কম powerful হয় — ভালো কথা!

## Tool Spotlight

### `docker scout` — Image Vulnerability Scanner

```bash
# Image-এর CVE list দেখো
$ docker scout cves myimage

# Quick summary
$ docker scout quickview node:18
```

Docker Scout image-এর প্রতিটি layer scan করে known CVE (Common Vulnerabilities and Exposures) দেখায়। Free tier-এ local image scan করা যায়। `docker scout quickview` দিলে critical/high/medium/low — কতটা vulnerability আছে তার summary পাও।

## Real World

### ঘটনা ১: runc Vulnerability — CVE-2019-5736

2019 সালে আবিষ্কার হয় যে Docker-এর container runtime `runc`-এ একটা vulnerability আছে। যদি container-এর ভেতরে কেউ root হিসেবে চলে, তাহলে সে host machine-এর `runc` binary overwrite করতে পারে — এবং host-এ arbitrary command execute করতে পারে। মানে container থেকে পুরো server দখল!

কিন্তু যদি container non-root user-এ চলতো? তাহলে `runc` binary-তে write করার permission-ই থাকতো না। Attack কাজ করতো না। এই একটা ঘটনা industry-কে শিখিয়ে দিয়েছে কেন non-root container এত জরুরি।

### ঘটনা ২: `node:18` vs `node:18-alpine` — CVE Count

```bash
$ docker scout quickview node:18
# ফলাফল: 3 critical, 12 high, 47 medium, 89 low — মোট 151 CVE!

$ docker scout quickview node:18-alpine
# ফলাফল: 0 critical, 1 high, 5 medium, 8 low — মোট 14 CVE
```

শুধু base image বদলানোয় 90% vulnerability কমে গেল। Production-এ node:18 চালানোর কোনো কারণ নেই — সব কিছু node:18-alpine বা distroless দিয়ে করা যায়।

## মনে রাখো

- **কখনো root-এ চালাবে না** — Dockerfile-এ `adduser` করো এবং `USER appuser` set করো; runtime-এ `--user 1000:1000` দাও
- **`latest` tag production-এ নিষিদ্ধ** — সব সময় exact version pin করো, যেমন `node:20.11-alpine3.19`
- **Secrets কখনো Dockerfile বা image-এ রাখবে না** — ENV-এ placeholder রাখো, value runtime-এ inject করো
- **`.dockerignore` ছাড়া project অসম্পূর্ণ** — `.git`, `.env`, `node_modules` কখনো image-এ ঢুকতে দেবে না
- **`docker scout cves`** দিয়ে নিয়মিত image scan করো এবং Alpine বা Distroless base image ব্যবহারে অভ্যস্ত হও
