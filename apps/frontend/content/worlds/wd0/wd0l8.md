---
id: wd0l8
world: wd0
order: 8
title: "BOSS: একটা Express App পুরোপুরি Dockerize করো"
titleEn: "BOSS: Fully Dockerize an Express App"
estMinutes: 30
type: boss
---

## গল্প

ধরো তুমি একটা বড় বিয়ের অনুষ্ঠান আয়োজন করছো। বাড়িতে রান্না হচ্ছে, বাইরে থেকে ক্যাটারার আসছে, মঞ্চ বাঁধা হচ্ছে, আলো লাগানো হচ্ছে — সব কিছু আলাদা আলাদা মানুষ করছে। এখন কল্পনা করো কেউ একজন event manager নেই। রান্নাওয়ালা আসছে, কিন্তু চুলা নেই। চেয়ার এসেছে, কিন্তু মঞ্চ তৈরি হয়নি। মাইক আসছে কিন্তু বিদ্যুৎ নেই। সব কিছু আলাদা থাকলে chaos! এটাই হয় যখন তুমি Express app আর MongoDB আলাদা আলাদা manually চালাও — কেউ কাউকে ঠিকমতো চেনে না, order নেই, dependency নেই।

এখন সেই বিয়েতে একজন দক্ষ event manager আসলো। সে একটা master plan লিখলো — "প্রথমে বিদ্যুৎ আসবে, তারপর রান্না শুরু হবে, তারপর মাইক লাগবে, তারপর অতিথি আসবে।" সবাই একই network-এ কাজ করছে, সবাই একে অপরের নাম জানে। Express app হলো রান্নাওয়ালা, MongoDB হলো চুলা, Docker Network হলো সেই একই বাড়ির সীমানা যেখানে সবাই আছে, আর Docker Compose হলো সেই event manager যে একটা command-এ সব কিছু সঠিক order-এ তুলে দেয়।

এই boss battle-এ তুমি সেই event manager হবে। Dockerfile লিখবে, Volume দিয়ে MongoDB-র data রক্ষা করবে, Network দিয়ে app আর database-কে কানেক্ট করবে, আর Compose দিয়ে `docker compose up` এক command-এ পুরো system দাঁড় করাবে। wd0-এর সব কিছু এখানে একসাথে কাজে লাগবে — এটাই তোমার final test। তুমি পারবে, চলো শুরু করি!

---

## Concept

### পুরো Architecture একনজরে

আমরা যা বানাবো সেটা হলো একটা development-ready Express + MongoDB setup। Production-এ আরো অনেক কিছু লাগে, কিন্তু এটা দিয়ে পুরো team এক command-এ কাজ শুরু করতে পারবে।

```
project/
├── src/
│   └── index.js
├── Dockerfile
├── .dockerignore
└── docker-compose.yml
```

---

### ধাপ ১: Express App-এর Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# Stage: development image
FROM node:20-alpine

# Working directory সেট করো container-এর ভেতরে
WORKDIR /app

# আগে package files copy করো — layer caching-এর জন্য
COPY package*.json ./

# Dependencies install করো
RUN npm install

# বাকি source code copy করো
COPY . .

# App কোন port-এ শুনছে সেটা declare করো
EXPOSE 3000

# Container start হলে এই command চলবে
CMD ["node", "src/index.js"]
```

**কেন এই order?** `package*.json` আগে copy করা হচ্ছে কারণ `npm install` step টা cache হয়ে যাবে। যদি তুমি শুধু `src/index.js` change করো, Docker আবার `npm install` করবে না — cached layer ব্যবহার করবে। এতে build অনেক দ্রুত হয়।

---

### ধাপ ২: .dockerignore ফাইল

```
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
```

`node_modules` অবশ্যই ignore করতে হবে। না হলে তোমার local machine-এর `node_modules` container-এ copy হবে — যেটা wrong OS/architecture-এর জন্য compiled। Container নিজেই `npm install` করবে তার নিজের environment-এ।

---

### ধাপ ৩: docker-compose.yml — সব কিছু একসাথে

```yaml
version: "3.9"

services:
  # MongoDB database service
  db:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db # named volume — data persist থাকবে
    networks:
      - app_network

  # Express API service
  web:
    build: . # current directory-র Dockerfile ব্যবহার করো
    ports:
      - "3000:3000" # host:container
    environment:
      - MONGO_URL=mongodb://db:27017/myapp # db = service name = DNS hostname
    depends_on:
      - db # db আগে start হবে
    volumes:
      - .:/app # bind mount — live code reload
      - /app/node_modules # anonymous volume — node_modules protect করো
    networks:
      - app_network
    restart: unless-stopped

volumes:
  mongo_data: # named volume declare করো

networks:
  app_network: # user-defined bridge network
    driver: bridge
```

---

### Key Concepts যেগুলো এখানে একসাথে কাজ করছে

#### Named Volume vs Bind Mount — দুটোই আছে কেন?

|                              | Named Volume (`mongo_data`) | Bind Mount (`. :/app`) |
| ---------------------------- | --------------------------- | ---------------------- |
| কোথায় ব্যবহার               | MongoDB data                | Source code            |
| কে manage করে                | Docker                      | তুমি (host filesystem) |
| উদ্দেশ্য                     | Data persist রাখা           | Live code changes দেখা |
| `docker compose down` হলে    | Data থাকে                   | N/A (host-এ আছেই)      |
| `docker compose down -v` হলে | Data মুছে যায়              | N/A                    |

`/app/node_modules` anonymous volume কেন? কারণ bind mount (`. :/app`) করলে host-এর সব কিছু container-এ override হয়। Host-এ `node_modules` নাও থাকতে পারে বা wrong platform-এর জন্য compiled থাকতে পারে। তাই `/app/node_modules`-কে anonymous volume দিয়ে "protect" করা হয় — এটা container-এর নিজের থাকে।

#### Network DNS — `localhost` কেন কাজ করে না?

```
# ভুল ❌
MONGO_URL=mongodb://localhost:27017/myapp

# সঠিক ✓
MONGO_URL=mongodb://db:27017/myapp
```

`localhost` মানে সেই container নিজেই। `web` container-এর কাছে `localhost` মানে `web` container — সেখানে MongoDB নেই! Docker-এর user-defined network-এ প্রতিটি service তার **service name** দিয়ে DNS resolve করে। `db` নামে service আছে, তাই `db:27017` দিয়ে reach করা যাবে।

#### depends_on — কিন্তু এটা কি যথেষ্ট?

`depends_on: db` মানে Compose `db` container start করার পরে `web` container start করবে। কিন্তু "start" মানে MongoDB ready না — শুধু container উঠেছে। MongoDB আসলে ready হতে আরো কয়েক সেকেন্ড লাগে। Production-এ `healthcheck` দিয়ে ঠিক করতে হয়:

```yaml
db:
  image: mongo:7
  healthcheck:
    test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
    interval: 10s
    timeout: 5s
    retries: 5

web:
  depends_on:
    db:
      condition: service_healthy # শুধু healthy হলেই web start হবে
```

---

### Common Commands চিটশিট

```bash
# সব service build করে background-এ চালাও
docker compose up -d --build

# সব service-এর logs দেখো
docker compose logs -f

# শুধু web service-এর logs
docker compose logs -f web

# web container-এ shell ঢোকো
docker compose exec web sh

# সব বন্ধ করো (data রেখে)
docker compose down

# সব বন্ধ করো + named volumes মুছে ফেলো (সব data যাবে!)
docker compose down -v

# শুধু web service restart করো
docker compose restart web

# চলমান services দেখো
docker compose ps
```

---

### Debugging Scenarios

**"MongoDB data হারিয়ে গেছে!"**
কারণ: Volume ছাড়া container চালানো হয়েছিল বা `docker compose down -v` দেওয়া হয়েছিল। Fix: `mongo_data` named volume declare করো এবং `db` service-এ attach করো।

**"web container db-কে reach করতে পারছে না!"**
কারণ: হয় `localhost` use করা হচ্ছে, অথবা দুটো service একই network-এ নেই। Fix: service name (`db`) use করো এবং দুটোই `app_network`-এ রাখো।

**"web আগে start হচ্ছে, db-র আগে!"**
কারণ: `depends_on` নেই। Fix: `web` service-এ `depends_on: - db` যোগ করো।

---

## Tool Spotlight

`docker compose exec` হলো তোমার debugging superpower। `docker compose exec web sh` দিয়ে চলমান web container-এ ঢুকে সরাসরি দেখতে পারো environment variables আছে কিনা, db-কে ping করা যাচ্ছে কিনা (`mongosh mongodb://db:27017`), files সঠিক জায়গায় আছে কিনা।

---

## Real World

**ঘটনা ১: "আমার machine-এ চলছিল!"**
একটি Dhaka-based startup-এ নতুন developer join করলো। সে `git clone` করে app চালাতে গিয়ে দেখে কিছুই কাজ করছে না — Node version আলাদা, MongoDB version আলাদা, environment variables নেই। দুই দিন সময় নষ্ট। পরে team Docker Compose setup করার পরে নতুন developer join করলে শুধু `docker compose up` — ব্যাস, সব কাজ করছে। Onboarding time ২ দিন থেকে ২০ মিনিট।

**ঘটনা ২: Production data loss**
একটা common mistake — developer `docker run mongo` করে data ঢোকায়, কিন্তু volume attach করতে ভুলে যায়। পরে container restart হলে সব data উধাও। Volume হলো Docker-এর সেই "পাকা গুদামঘর" — container গেলেও data থাকে। Named volume সবসময় prefer করো bind mount-এর চেয়ে database-এর জন্য।

---

## মনে রাখো

- **`localhost` container-এর ভেতরে কাজ করে না** — service name (যেমন `db`) use করো যখন এক container আরেক container-কে call করে
- **Named volume database-এর জন্য, bind mount source code-এর জন্য** — দুটোর উদ্দেশ্য আলাদা
- **`depends_on` শুধু startup order নিশ্চিত করে**, service "ready" কিনা না — production-এ `healthcheck` লাগবে
- **`.dockerignore` ছাড়া `node_modules` copy হয়ে যাবে** — এটা সবসময় লিখতে হবে
- **`docker compose down -v` দিলে সব data যায়** — সাবধানে use করো, শুধু fresh start দরকার হলে
