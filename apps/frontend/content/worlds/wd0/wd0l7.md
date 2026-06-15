---
id: wd0l7
world: wd0
order: 7
title: "Docker Compose — Multiple Services একসাথে"
titleEn: "Docker Compose — Multiple Services Together"
estMinutes: 30
type: lesson
---

## গল্প

তুমি কি কখনো একটা ব্যান্ড concert দেখেছ? গিটারিস্ট আলাদা, ড্রামার আলাদা, কীবোর্ড বাজায় আরেকজন — সবাই আলাদা মানুষ, আলাদা instrument। কিন্তু concert-এ সব একসাথে কাজ করে, একই তালে, একই সুরে। এই পুরো ব্যাপারটা কে মেলায়? Conductor! Conductor এক হাত তুললে সবাই শুরু করে, হাত নামালে সবাই থামে। কেউ বেতাল বাজালে conductor ধরে ফেলে। ঠিক এভাবেই **Docker Compose** কাজ করে — তোমার পুরো application-এর conductor।

তোমার web app হলো গিটারিস্ট, database হলো ড্রামার, cache (Redis) হলো কীবোর্ড বাদক। প্রত্যেকে আলাদা **container** — নিজের নিজের দুনিয়ায় চলে। কিন্তু এদের একসাথে মেলানোর জন্য দরকার একটা "sheet music" — যেখানে লেখা থাকবে কে কোন instrument বাজাবে, কখন শুরু করবে, কার পরে কে আসবে। Docker Compose-এ এই sheet music-এর নাম হলো **`docker-compose.yml`** ফাইল।

আগের দিনে নতুন developer team-এ join করলে senior বলত: "ভাই, আগে Node install করো, তারপর MongoDB install করো, এই version-এ কিন্তু, তারপর এই config file-টা এখানে রাখো..." — ঘণ্টার পর ঘণ্টা setup। এখন? `git clone` করো, একটা `docker compose up -d` দাও — চা বানিয়ে আসো, সব ready! ঠিক এভাবেই Docker Compose development team-এর জীবন বদলে দিয়েছে।

## Concept

### Docker Compose কী এবং কেন?

Docker Compose হলো একটা tool যা দিয়ে তুমি **multiple Docker containers** একটা single YAML file-এ define করতে পারো এবং একটা command দিয়ে সব start/stop করতে পারো।

**ছাড়া Compose:** প্রতিটা container আলাদা আলাদা `docker run` command — network manually connect করো, volume manually create করো, environment variable manually pass করো। ৫টা service = ৫টা লম্বা command মুখস্থ রাখো।

**Compose দিয়ে:** একটা `docker-compose.yml` ফাইলে সব লেখো, একটা command — শেষ।

---

### `docker-compose.yml` Structure

```yaml
version: "3.8" # Compose file format version

services: # তোমার containers এখানে
  web: # service-এর নাম (তুমি রাখতে পারো যা খুশি)
    build: . # এই directory-র Dockerfile দিয়ে build করো
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGO_URL=mongodb://db:27017/myapp
    depends_on:
      - db
    networks:
      - app-network

  db: # MongoDB service
    image: mongo:6.0 # Docker Hub থেকে নামাও
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db # data persistent রাখো
    networks:
      - app-network

volumes: # Named volumes define করো
  mongo-data:

networks: # Custom network define করো
  app-network:
    driver: bridge
```

---

### Service Definition — প্রতিটা Musician-এর Part

**`build` বনাম `image`:**

| Field              | কখন ব্যবহার             | উদাহরণ                   |
| ------------------ | ----------------------- | ------------------------ |
| `build: .`         | নিজের Dockerfile আছে    | Custom Express app       |
| `image: mongo:6.0` | Ready-made image নামাবে | MongoDB, Redis, Postgres |

**গুরুত্বপূর্ণ fields:**

```yaml
services:
  web:
    build: . # Dockerfile-এর location
    image: myapp:latest # build করা image-এর নাম (optional)
    ports:
      - "HOST:CONTAINER" # host_port:container_port
    volumes:
      - ./src:/app/src # bind mount (live code reload)
      - node_modules:/app/node_modules # named volume
    environment:
      - DATABASE_URL=mongodb://db:27017/myapp
      - JWT_SECRET=supersecret
    env_file:
      - .env # .env file থেকে পড়ো
    depends_on:
      - db # db start হলে তবেই web start
    restart: unless-stopped # crash হলে auto restart
    networks:
      - app-network
```

---

### `depends_on` — Concert-এর Order

ড্রামার আগে না বাজালে গিটারিস্ট তাল পাবে না। তেমনি database না চাললে web app connect করতে পারবে না।

```yaml
depends_on:
  - db # db service আগে start হবে
```

**Important:** `depends_on` শুধু container start হওয়া wait করে, database "ready" হওয়া না। Production-এ retry logic রাখতে হয়। Development-এ সাধারণত কাজ করে।

---

### Networking — Musician-রা কীভাবে কথা বলে

Compose automatically সব service-কে একটা default network-এ রাখে। একই network-এ থাকা container গুলো **service name দিয়ে** একে অপরকে চেনে।

```javascript
// web container-এর ভেতর থেকে db-কে এভাবে পাবে:
const url = "mongodb://db:27017/myapp";
//                       ^^
//                  service নাম = hostname
```

`localhost` দিলে হবে না! `db` service-এর নাম দিয়ে connect করতে হবে। এটাই Docker networking-এর magic।

---

### Essential Commands

**পুরো orchestra শুরু করো:**

```bash
$ docker compose up -d
```

`-d` মানে detached — background-এ চলবে, terminal block করবে না।

**সব container-এর log দেখো:**

```bash
$ docker compose logs -f
```

`-f` মানে follow — real-time live log stream। একটা specific service-এর জন্য: `docker compose logs -f web`

**কোন container কোন অবস্থায় আছে:**

```bash
$ docker compose ps
```

**একটা running container-এ ঢুকো:**

```bash
$ docker compose exec web sh
```

Container-এর ভেতরে গিয়ে debug করতে পারবে।

**সব বন্ধ করো:**

```bash
$ docker compose down
```

**সব বন্ধ করো + data মুছে দাও:**

```bash
$ docker compose down --volumes
```

`--volumes` দিলে named volumes-ও মুছবে — database data গেলে যাবে! সাবধান।

**Image rebuild করো:**

```bash
$ docker compose build
```

Code change করলে image নতুন করে build করতে হবে (তারপর `up -d`)।

**একটা service restart করো:**

```bash
$ docker compose restart web
```

---

### Complete Example: Express + MongoDB

**Project structure:**

```
myapp/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env
└── src/
    └── index.js
```

**`docker-compose.yml`:**

```yaml
version: "3.8"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src # live reload
    environment:
      - NODE_ENV=development
    env_file:
      - .env
    depends_on:
      - db
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

**`.env`:**

```env
MONGO_URL=mongodb://db:27017/myapp
JWT_SECRET=your-secret-here
PORT=3000
```

**`Dockerfile`:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js"]
```

এখন একটাই command:

```bash
$ docker compose up -d
```

Express চলবে port 3000-এ, MongoDB চলবে আলাদা container-এ, দুজন একই network-এ কথা বলবে।

## Tool Spotlight

**`docker compose exec`** — running container-এর ভেতরে ঢুকে যে কোনো command চালাও।

```bash
$ docker compose exec web sh          # shell-এ ঢুকো
$ docker compose exec db mongosh      # MongoDB shell
$ docker compose exec web npm test    # test চালাও container-এ
```

`docker exec` আর `docker compose exec`-এ পার্থক্য: Compose version-এ container-এর নামের বদলে **service নাম** ব্যবহার করো।

## Real World

**"আমার machine-এ কাজ করে" সমস্যার মৃত্যু:**

একটা Dhaka-based startup-এ নতুন backend developer join করল। আগে setup লাগত দুই দিন — Node version mismatch, MongoDB version আলাদা, environment variable ভুল জায়গায়। এখন? `git clone` + `docker compose up -d` + ৫ মিনিট। প্রথম দিনেই feature লেখা শুরু। এটাই Compose-এর real-world জাদু।

**Common mistake:** অনেকে `docker compose down --volumes` দিয়ে development database-এর সব data মুছে ফেলে ভুল করে। `down` আর `down --volumes` আলাদা — `--volumes` flag শুধু তখন দাও যখন সত্যিই fresh start চাও।

## মনে রাখো

- `docker-compose.yml` হলো তোমার পুরো application-এর "blueprint" — সব service, network, volume এক জায়গায়
- একই Compose file-এ থাকা service গুলো **service name দিয়ে** একে অপরকে চেনে — `localhost` না, `db` বা `redis` লেখো
- `depends_on` শুধু start order ঠিক করে, service "ready" হওয়া guarantee দেয় না
- `docker compose down` শুধু container বন্ধ করে; `--volumes` দিলে data-ও যাবে — সাবধান!
- নতুন developer onboard করা = `git clone` + `docker compose up -d` — এটাই Compose-এর সবচেয়ে বড় শক্তি
