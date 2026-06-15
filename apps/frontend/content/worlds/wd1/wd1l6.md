---
id: wd1l6
world: wd1
order: 6
title: "Full-Stack Compose — NestJS + Next.js + MongoDB"
titleEn: "Full-Stack Compose — NestJS + Next.js + MongoDB"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি একটা নতুন শহর পরিকল্পনা করছো — একটা পুরোপুরি নতুন টাউনশিপ। প্রথমে কী লাগবে? পানির ট্যাংক। কারণ পানি ছাড়া কিছুই চলে না। শহরের সবাই পানির উপর নির্ভরশীল। আমাদের stack-এ **MongoDB** হলো এই পানির ট্যাংক — সব service-এর আগে ready থাকতে হবে, কারণ বাকি সবাই তার উপর নির্ভরশীল। পানির ট্যাংক চালু না হলে পুরো শহর অচল।

এরপর আসে **পানি পরিশোধন কেন্দ্র বা water treatment plant** — কাঁচা পানি নিয়ে সেটাকে পরিষ্কার করে সরবরাহ করে। আমাদের **NestJS backend** ঠিক এই ভূমিকায়। সে MongoDB থেকে raw data নেয়, process করে, API বানিয়ে serve করে। কিন্তু treatment plant চালু হতে পারে শুধুমাত্র পানির ট্যাংক ready হলে — MongoDB health check pass না করলে NestJS শুরু হবে না। তারপর আসে বাড়িতে কলের কাজ — **Next.js frontend**। কলের কাজ মানে user-এর হাতের কাছে পানি পৌঁছানো। কিন্তু treatment plant না চাললে কলে পানি আসবে না। এই তিনটা service মিলে তৈরি হয় একটা সম্পূর্ণ শহর।

এই "শহরের" ভেতরে আছে **internal road network** — শুধু service-গুলো নিজেদের মধ্যে কথা বলার জন্য, বাইরের মানুষ এই রাস্তায় আসতে পারে না। আর আছে **external gate** — শুধু Next.js-এর জন্য, যেখান থেকে সাধারণ মানুষ (browser) শহরে প্রবেশ করতে পারে। Docker Compose দিয়ে পুরো এই শহর একটা `docker compose up -d` command-এ চালু হয়ে যায়। ঠিক এভাবেই Docker Compose full-stack application পরিচালনা করে!

## Concept

### কেন Full-Stack Compose দরকার?

পুরো stack আলাদা আলাদা `docker run` command দিয়ে চালানো ঝামেলার — ৩টা terminal window, ৩টা আলাদা network, আলাদা volume, আলাদা environment variable। নতুন developer join করলে তাকে বলতে হবে "প্রথমে MongoDB চালাও, তারপর backend, তারপর frontend, আর network connect করতে ভুলো না।" এটা nightmare। **Docker Compose** এই পুরো setup একটা YAML file-এ describe করে দেয় এবং একটা command-এ সব চালু করে।

### আমাদের Stack-এর আর্কিটেকচার

```
[Browser / User]
      |
      | port 3000 (public)
      v
[Next.js Frontend]
      |
      | internal network
      v
[NestJS Backend]  (port 3001 — শুধু internal, বাইরে দেখা যায় না)
      |
      | internal network
      v
[MongoDB]  (port 27017 — শুধু internal)
      |
      v
[mongo-data volume]  ← data persist এখানে
```

### পূর্ণ docker-compose.yml

```yaml
version: "3.8"

services:
  # ===== DATABASE LAYER =====
  mongodb:
    image: mongo:7
    container_name: learning_mongodb
    restart: unless-stopped
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

  # ===== BACKEND LAYER =====
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    container_name: learning_backend
    restart: unless-stopped
    env_file:
      - ./apps/backend/.env
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/learning_platform
      - NODE_ENV=production
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
      start_period: 30s

  # ===== FRONTEND LAYER =====
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://backend:3001
    container_name: learning_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - internal

# ===== NETWORKS =====
networks:
  internal:
    driver: bridge

# ===== VOLUMES =====
volumes:
  mongo-data:
    driver: local
```

### প্রতিটা অংশ কেন এভাবে লেখা — বিস্তারিত

**MongoDB service:**

`image: mongo:7` — official MongoDB image, version 7 pinned। `latest` use করা ঠিক না, কারণ হঠাৎ breaking change আসতে পারে।

`volumes: - mongo-data:/data/db` — named volume দিয়ে data persist। `/data/db` হলো MongoDB-র default data directory।

`networks: - internal` — শুধু internal network-এ। Browser থেকে MongoDB সরাসরি access করার কোনো উপায় নেই।

`healthcheck` — এটা critical! MongoDB ready হতে সময় লাগে। `mongosh --eval "db.adminCommand('ping')"` MongoDB সত্যিই ready কিনা check করে। `start_period: 20s` মানে প্রথম ২০ সেকেন্ড health check failure ignore করবে — startup time দেওয়া হচ্ছে।

**Backend service:**

`build: context + dockerfile` — local code থেকে image build করবে।

`env_file: - ./apps/backend/.env` — secret API keys, JWT secret, etc. `.env` file থেকে আসবে। এই file git-এ commit হয় না।

`environment: - MONGODB_URI=mongodb://mongodb:27017/learning_platform` — এখানে hostname হলো `mongodb` — Docker Compose-এর service name। Compose automatically internal DNS create করে দেয়। Atlas URI না দিয়ে internal URI দিলাম, কারণ MongoDB container-ই আমাদের DB।

`depends_on: mongodb: condition: service_healthy` — শুধু `depends_on: mongodb` দিলেই হতো না। সেটা শুধু container start হওয়া দেখে, ready হওয়া না। `condition: service_healthy` মানে MongoDB-র healthcheck pass না করা পর্যন্ত backend start হবেই না।

`networks: - internal` — backend port 3001-এ চলবে কিন্তু `ports:` section নেই। মানে এই port শুধু internal network-এর অন্য service-রা (frontend) access করতে পারবে, বাইরের world পারবে না।

**Frontend service:**

`build: args: - NEXT_PUBLIC_API_URL=http://backend:3001` — Next.js-এ `NEXT_PUBLIC_` variables build time-এ inject হয়। এজন্য build arg হিসেবে দিতে হচ্ছে। এখানে `backend` হলো service name — internal DNS।

`ports: - "3000:3000"` — এটাই একমাত্র published port। শুধু frontend বাইরের world-এ দেখা যায়। Host-এর port 3000 → container-এর port 3000।

`depends_on: backend: condition: service_healthy` — backend ready না হলে frontend start হবে না।

### Network Architecture — Internal vs Public

```
[Internet / Browser]
        |
        | :3000 only
        v
   [internal network]
   ┌────────────────────────────────┐
   │  frontend ←→ backend ←→ mongodb│
   └────────────────────────────────┘
        backend :3001 (internal only)
        mongodb :27017 (internal only)
```

| Service  | External Access   | Internal Access | কারণ                       |
| -------- | ----------------- | --------------- | -------------------------- |
| mongodb  | না                | হ্যাঁ           | Direct DB access নিরাপদ না |
| backend  | না                | হ্যাঁ           | API শুধু frontend-এর কাছে  |
| frontend | হ্যাঁ (port 3000) | হ্যাঁ           | User-facing, public        |

### কাজের Commands

```bash
# পুরো stack চালু করো (detached mode — background-এ)
$ docker compose up -d

# Output দেখতে কেমন হবে:
# [+] Running 4/4
#  ✔ Network internal        Created
#  ✔ Container learning_mongodb   Started
#  ✔ Container learning_backend   Started
#  ✔ Container learning_frontend  Started

# Backend-এর live log দেখো
$ docker compose logs -f backend

# সব service-এর status দেখো
$ docker compose ps

# সব বন্ধ করো (volume রেখে)
$ docker compose down

# সব বন্ধ করো + volume মুছে দাও (data যাবে!)
$ docker compose down --volumes
```

### নতুন Developer Onboarding — ২ মিনিটে Ready

```bash
# Step 1: Code নামাও
$ git clone https://github.com/your-org/learning-platform
$ cd learning-platform

# Step 2: Environment file তৈরি করো
$ cp apps/backend/.env.example apps/backend/.env
# .env file-এ দরকারি values দাও

# Step 3: সব চালু করো
$ docker compose up -d

# Step 4: Check করো সব ঠিকঠাক আছে কিনা
$ docker compose ps
# NAME                   STATUS
# learning_mongodb       Up (healthy)
# learning_backend       Up (healthy)
# learning_frontend      Up

# Done! http://localhost:3000 খোলো
```

আগে এই কাজ করতে লাগতো: Node.js install, MongoDB install, npm install for backend, npm install for frontend, MongoDB start করো, env setup করো, backend start করো, frontend start করো — মিনিমাম ৩০ মিনিট। এখন? ২ মিনিট।

## Tool Spotlight

**`docker compose logs -f backend`** — `-f` flag মানে "follow" — live streaming log। Backend crash করলে বা কোনো error হলে এই command দিয়ে real-time দেখতে পাবে কী হচ্ছে। `docker compose logs --tail=50 backend` দিয়ে শেষ ৫০ লাইন দেখা যায়। একাধিক service-এর log একসাথে দেখতে `docker compose logs -f backend frontend` চালাও।

## Real World

**"Works on my machine" সমস্যার সমাধান:**

একটা startup-এ ৫ জন developer। Local machine-এ code চলছে, কিন্তু colleague-এর machine-এ চলছে না। কারণ — Node.js version আলাদা, MongoDB version আলাদা, OS আলাদা। Product lead রেগে যাচ্ছেন। তারপর team Docker Compose setup করল। এরপর থেকে সবার machine-এ একই version, একই environment। "Works on my machine" সমস্যা সম্পূর্ণ শেষ। Onboarding নতুন developer-এর জন্য: git clone + docker compose up — ব্যস।

**depends_on-এর ফাঁদ — একটা সত্যিকারের ভুল:**

অনেক developer `depends_on` দেয় এভাবে:

```yaml
depends_on:
  - mongodb # শুধু এটুকু!
```

এটা দিয়ে শুধু MongoDB container start হওয়া নিশ্চিত হয় — ready হওয়া না। MongoDB startup নিতে পারে ৫-১৫ সেকেন্ড। এর মধ্যে backend connect করতে গিয়ে fail করে, container crash করে, restart করে। Log-এ দেখায় `MongooseError: Connection refused`। এই ফাঁদ থেকে বাঁচার উপায় হলো `condition: service_healthy` + healthcheck — যেটা আমরা উপরে করেছি। Production deployment-এ এই ভুলটা খুব common।

## মনে রাখো

- Docker Compose একটা YAML file-এ পুরো multi-service stack describe করে — একটা `docker compose up -d`-এ সব চালু।
- `depends_on: condition: service_healthy` লেখো — শুধু `depends_on` দিলে service start হওয়া নিশ্চিত হয়, ready হওয়া না; healthcheck pass করা দরকার।
- MongoDB URI-তে hostname হয় service name (`mongodb://mongodb:27017`) — Docker Compose internal DNS automatically তৈরি করে।
- Database আর backend-এর port `ports:` section-এ দেওয়া উচিত না — শুধু internal network-এ রাখো; শুধু frontend-এর port publish করো।
- `docker compose down --volumes` মানে সব data মুছে যাবে — production-এ ভুল করে দিলে বিপদ; আর শুধু `docker compose down` দিলে volume থাকে।
