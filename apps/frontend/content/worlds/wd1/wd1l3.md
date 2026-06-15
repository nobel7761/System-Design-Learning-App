---
id: wd1l3
world: wd1
order: 3
title: "Environment Variables ও Secrets"
titleEn: "Environment Variables & Secrets"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তোমার বাড়ির একটা চাবির গোছা আছে — মেইন গেটের চাবি, ছাদের চাবি, আলমারির চাবি, সব এক জায়গায়। এই চাবির গোছাটাই হলো তোমার `.env` file — `JWT_SECRET`, `DB_PASSWORD`, `AWS_ACCESS_KEY`, `STRIPE_SECRET_KEY` সব সেখানে। এখন ভাবো, তুমি বাড়ি থেকে বের হওয়ার সময় ভুল করে সেই পুরো চাবির গোছাটা সামনের দরজায় ঝুলিয়ে রেখে গেলে। সারা পাড়ার লোক দেখতে পাবে। যে খুশি ঢুকতে পারবে। ঠিক এই কাজটাই হয় যখন কেউ `.env` file GitHub-এ push করে দেয় — সারা পৃথিবী তোমার database password দেখতে পায়, তোমার AWS key দেখতে পায়। এই একটা ভুল তোমার সব কিছু শেষ করে দিতে পারে।

কিন্তু secrets তো কোথাও না কোথাও রাখতে হবে — app চালাতে হলে password দরকার! এখানেই আসে Docker-এর smart approach। ভাবো একটা bank vault-এর কথা। Vault-এর মধ্যে টাকা আছে, কিন্তু শুধু authorized person-ই ঢুকতে পারে — বাইরে থেকে কেউ দেখতে পারে না কী আছে ভেতরে। Docker secrets ঠিক সেই bank vault-এর মতো কাজ করে। Secret একবার create করো, শুধু যে service-এর দরকার সে পাবে, আর কেউ না। Image-এর layer-এ কোনো trace থাকে না, `docker history` দিয়েও দেখা যায় না।

এই lesson-এ আমরা শিখবো — কীভাবে environment variables সঠিকভাবে manage করতে হয়, `ARG` আর `ENV`-এর পার্থক্য কী, `.env` file কীভাবে Compose-এ use করতে হয়, আর সবচেয়ে গুরুত্বপূর্ণ — কীভাবে secrets কখনো image-এ বা GitHub-এ যাবে না সেটা নিশ্চিত করতে হয়। এটা শুধু Docker শেখা না — এটা professional developer হওয়ার একটা জরুরি ধাপ!

---

## Concept

### ARG vs ENV: Build-time vs Runtime

Dockerfile-এ দুটো variable type আছে — `ARG` আর `ENV`। এদের পার্থক্যটা না বুঝলে বড় ভুল হয়ে যায়।

| বিষয়                  | `ARG`                                                      | `ENV`                                        |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| কখন কাজ করে            | শুধু build time-এ (`docker build`-এর সময়)                 | Container runtime-এ (container চালানোর পরেও) |
| কীভাবে pass করো        | `docker build --build-arg NAME=value .`                    | `docker run -e NAME=value` অথবা `.env` file  |
| Image-এ থাকে?          | না — build শেষে চলে যায়                                   | হ্যাঁ — image layer-এ থেকে যায়              |
| Container-এ দেখা যায়? | না                                                         | হ্যাঁ — `docker exec container env` দিয়ে    |
| ব্যবহার                | Build-time configuration (base image version, build flags) | App configuration (PORT, NODE_ENV, API_URL)  |

```dockerfile
# Dockerfile example
FROM node:20-alpine

# ARG: শুধু build time-এ কাজ করে
ARG NODE_ENV=production
ARG APP_VERSION=1.0.0

# ENV: runtime-এ কাজ করে, app পড়তে পারে
ENV PORT=3000
ENV NODE_ENV=${NODE_ENV}

# build করার সময় ARG pass করা যায়:
# docker build --build-arg NODE_ENV=development .

WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server.js"]
```

**একটা গুরুত্বপূর্ণ সতর্কতা:** `ARG` দিয়ে secret pass করো না। যদিও runtime-এ দেখা যায় না, `docker history` command দিয়ে build layers-এ ARG value দেখা যেতে পারে। Secret-এর জন্য আলাদা mechanism আছে — নিচে শিখবো।

---

### .env File with Docker Compose

`.env` file হলো সবচেয়ে common pattern। Docker Compose automatically `.env` file পড়তে পারে compose.yml-এর same directory থেকে।

**প্রথমে `.env` file:**

```bash
# .env  (এটা কখনো GitHub-এ যাবে না — .gitignore-এ রাখো)
POSTGRES_DB=myapp_db
POSTGRES_USER=appuser
POSTGRES_PASSWORD=supersecret123
JWT_SECRET=my-very-long-random-secret-key
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=3000
```

**Compose-এ দুটো উপায়ে use করা যায়:**

```yaml
# compose.yml — উপায় ১: env_file দিয়ে পুরো file load করো
services:
  app:
    image: myapp:latest
    env_file:
      - .env # পুরো .env file load হবে
    ports:
      - "3000:3000"

  db:
    image: postgres:16
    env_file:
      - .env # POSTGRES_* variables এখানেও যাবে
```

```yaml
# compose.yml — উপায় ২: নির্দিষ্ট variables specify করো
services:
  app:
    image: myapp:latest
    environment:
      - NODE_ENV=${NODE_ENV} # .env থেকে নেবে
      - PORT=${PORT:-3000} # .env না থাকলে default 3000
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "${PORT:-3000}:3000"
```

**Variable Substitution with Defaults:**

Compose-এ `${VARIABLE:-default}` syntax আছে — variable না থাকলে default value use করবে।

```yaml
environment:
  - PORT=${PORT:-3000} # PORT না থাকলে 3000
  - LOG_LEVEL=${LOG_LEVEL:-info} # LOG_LEVEL না থাকলে "info"
  - NODE_ENV=${NODE_ENV:-development}
```

এটা খুব useful — তোমার `.env` file optional হয়ে যায়, আর সব developer আলাদা locally override করতে পারে।

---

### NEVER Hardcode Secrets — docker history দিয়ে দেখা যায়!

এটা সবচেয়ে গুরুত্বপূর্ণ rule। এই Dockerfile টা দেখো:

```dockerfile
# ভুল! এটা কখনো করো না
FROM node:20-alpine
ENV DB_PASSWORD=supersecret123    # এটা image layer-এ থেকে যায়
ENV API_KEY=sk-abc123xyz
RUN npm install
```

এখন `docker history myapp:latest` চালাও — output-এ দেখবে:

```
IMAGE          CREATED        CREATED BY                                      SIZE
a1b2c3d4e5f6   2 minutes ago  ENV DB_PASSWORD=supersecret123 API_KEY=sk-a…   0B
```

Password image-এর layer history-তে লেখা থাকবে চিরকালের জন্য। Image share করলে, Docker Hub-এ push করলে — সবাই দেখতে পাবে। এটা avoid করার সঠিক pattern হলো runtime-এ inject করা:

```bash
# সঠিক পদ্ধতি: runtime-এ env var inject করো
$ docker run --env-file .env myapp

# অথবা specific variable:
$ docker run -e DB_PASSWORD="$DB_PASSWORD" myapp
```

---

### .dockerignore-এ .env রাখো

Docker build context-এর সাথে `.env` file Docker daemon-এ যেন না যায়, সেজন্য `.dockerignore` file-এ add করতে হবে:

```
# .dockerignore
.env
.env.local
.env.*.local
.env.production
node_modules
.git
*.log
```

এটা দুটো কারণে দরকার — ১. Build context ছোট রাখে (faster build), ২. `.env` accidentally `COPY . .` দিয়ে image-এ ঢুকে যাওয়া prevent করে।

---

### .env.example Pattern: Safe to Commit

সবচেয়ে professional pattern হলো দুটো file রাখা:

```bash
# .env.example  (GitHub-এ commit করো — real values ছাড়া)
POSTGRES_DB=your_database_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=         # এখানে real password দিও না
JWT_SECRET=                # randomly generate করো: openssl rand -base64 32
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
```

```bash
# .env  (gitignore করো — real values এখানে)
POSTGRES_DB=myapp_db
POSTGRES_USER=appuser
POSTGRES_PASSWORD=Xk9#mP2@nQ5
JWT_SECRET=YWJjZGVmZ2hpamtsbW5vcHFyc3Q=
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
```

`.gitignore`-এ:

```
.env
.env.local
.env.production
.env.staging
```

New developer join করলে `.env.example` দেখে বুঝবে কোন variables দরকার, নিজের values fill করে `.env` বানাবে।

---

### Multi-Environment: .env.dev, .env.prod

Different environment-এর জন্য আলাদা files:

```bash
# Development এ
$ docker compose --env-file .env.dev up

# Production এ
$ docker compose --env-file .env.prod up
```

অথবা Compose-এ:

```yaml
# compose.prod.yml
services:
  app:
    env_file:
      - .env.prod
```

```bash
$ docker compose -f compose.yml -f compose.prod.yml up -d
```

---

### Docker Secrets (Swarm Mode): Bank Vault

Docker Swarm mode-এ আরও secure secret management আছে। Secrets encrypted হয়ে store হয় — শুধু assigned service-ই পায়।

**Secret create করো:**

```bash
# File থেকে secret create করো
$ echo "mysupersecretpassword" > secret.txt
$ docker secret create db_password secret.txt
$ rm secret.txt  # file delete করো — secret Docker-এ safe আছে

# অথবা stdin থেকে:
$ echo "mysupersecretpassword" | docker secret create db_password -
```

**Compose-এ secrets use করো:**

```yaml
# compose.yml (Swarm mode)
services:
  app:
    image: myapp:latest
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password # app এখান থেকে পড়বে

secrets:
  db_password:
    external: true # docker secret create দিয়ে আগেই create করা
  jwt_secret:
    external: true
```

Container-এর ভেতরে secret `/run/secrets/db_password` file-এ থাকে — in-memory tmpfs, disk-এ লেখা হয় না। App সেই file পড়ে value নেয়।

---

### Build Secrets: Private Registry Auth

`npm install` করার সময় যদি private package registry লাগে (GitHub Packages, npm private), তখন `.npmrc` file-এ token থাকে। এটা image-এ include করা বিপজ্জনক। Docker BuildKit-এর `--secret` flag এই সমস্যা solve করে:

```dockerfile
# Dockerfile (BuildKit secret mount)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./

# --secret দিয়ে pass করা file শুধু এই RUN-এর সময় থাকে
# image layer-এ কোনো trace থাকে না
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --only=production

COPY . .
CMD ["node", "server.js"]
```

```bash
# Build করার সময়:
$ docker build --secret id=npmrc,src=$HOME/.npmrc .
```

`.npmrc` file শুধু `npm ci` চলার মুহূর্তে available — তারপর automatically মুছে যায়। `docker history` দিয়েও দেখা যাবে না।

---

## Tool Spotlight

**`docker secret create`** — Docker Swarm-এর encrypted secret store-এ secret save করে। Secret একবার create হলে আর পড়া যায় না — শুধু service-এ assign করা যায়। `docker secret ls` দিয়ে list দেখো, `docker secret inspect` দিয়ে metadata দেখো (value না)। এটা production Swarm deployment-এর জন্য gold standard।

---

## Real World

**GitHub Secrets Scanning: প্রতিদিন হাজারো লিক**

GitHub-এ প্রতিদিন হাজার হাজার MongoDB Atlas URI, AWS Access Key, Stripe Secret Key push হয় — accidentally। GitHub-এর automated secrets scanning এগুলো detect করে এবং automatically revoke করার জন্য provider-কে notify করে। MongoDB Atlas, AWS, Stripe — সবাই GitHub-এর partner। তুমি push করার কয়েক মিনিটের মধ্যে তোমার key revoke হয়ে যায়। কিন্তু সেই কয়েক মিনিটেই automated bots key scan করে নেয় — ঘটনা ঘটে যায়। 2022-এ Samsung-এর confidential source code GitHub-এ leak হয়েছিল — এর একটা বড় কারণ ছিল hardcoded credentials এবং improper secret management। এই একটা ভুল কোম্পানির লক্ষ টাকার ক্ষতি করতে পারে, customer trust নষ্ট করতে পারে, regulatory fine আনতে পারে।

**সঠিক প্যাটার্ন:**

তোমার project-এ এই structure রাখো:

```
.env.example    ← commit করো (safe template)
.env            ← gitignore করো (real secrets)
.dockerignore   ← .env include করো
```

CI/CD-এ (GitHub Actions, GitLab CI) secrets environment variables হিসেবে inject করো — কোনো file commit করো না।

---

## মনে রাখো

- `ARG` শুধু build time-এ থাকে, `ENV` runtime-এ থাকে — কখনো `ARG` বা `ENV` দিয়ে Dockerfile-এ secret hardcode করো না, `docker history` দিয়ে দেখা যায়
- `.env` file সবসময় `.gitignore` এবং `.dockerignore`-এ রাখো — `.env.example` commit করো, real `.env` কখনো না
- Compose-এ `env_file: [.env]` দিয়ে পুরো file load করো, অথবা `environment` section-এ `${VAR:-default}` pattern ব্যবহার করো
- `docker run --env-file .env myapp` — runtime-এ env inject করার সঠিক উপায়; Dockerfile-এ hardcode করা নয়
- Build-time private token দরকার হলে `docker build --secret id=npmrc,src=$HOME/.npmrc .` ব্যবহার করো — secret image layer-এ থাকে না
