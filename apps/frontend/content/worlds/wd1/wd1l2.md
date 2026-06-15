---
id: wd1l2
world: wd1
order: 2
title: "Docker Compose Advanced — Health Checks ও Depends-on"
titleEn: "Docker Compose Advanced — Health Checks & Depends-on"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি একটা বড় হাসপাতালে গেছো। ডাক্তার বললো — "রোগী ICU থেকে সাধারণ ward-এ shift হয়েছে, তুমি এখন দেখতে যেতে পারো।" তুমি খুশিমনে গেলে, কিন্তু গিয়ে দেখলে রোগী এখনো অজ্ঞান, কথা বলতে পারছে না। Ward-এ transfer হওয়া মানেই কি সুস্থ হওয়া? মোটেই না! Docker Compose-এ `depends_on: db` ঠিক এইরকম — এটা শুধু বলে "db container চালু হলেই web container শুরু করো।" কিন্তু container চালু হওয়া মানে MongoDB বা PostgreSQL আসলে query নেওয়ার জন্য ready হয়ে গেছে — এটা কিন্তু guarantee না। Container চালু হতে ১ সেকেন্ড লাগলেও, MongoDB-র পুরোপুরি initialize হতে ৫-১০ সেকেন্ড লাগতে পারে।

এখানে health check হলো সেই ডাক্তার যিনি সত্যিকারের পরীক্ষা করেন — pulse দেখেন, blood pressure দেখেন, চোখ খুলতে পারছে কিনা দেখেন। "বিছানায় আছে" আর "সুস্থ" এক কথা না। Docker-এর `healthcheck` ঠিক এই কাজটাই করে — container-এর ভেতরে ঢুকে একটা real test চালায়। MongoDB-র ক্ষেত্রে সেটা হতে পারে `mongosh --eval "db.adminCommand('ping')"` — এটা সফল হলে বোঝা যাবে MongoDB সত্যিই connection নিতে পারছে। `depends_on: condition: service_healthy` মানে হলো — "db container শুধু চালু হলেই না, ডাক্তারের certificate পেলে তবেই web চালু করো।"

বাস্তব জীবনে এই পার্থক্যটা production-এ বিশাল। তুমি রাত ২টায় deploy করলে, MongoDB container "Up" দেখাচ্ছে কিন্তু NestJS বারবার crash করছে — কারণ MongoDB তখনো startup initialization-এ আছে। Logs দেখলে শুধু "MongoServerSelectionError: connect ECONNREFUSED" — কিন্তু `docker ps` বলছে সব container healthy! এই intermittent startup failure production-এ nightmare হয়ে যায়। Health check add করলে এই সমস্যা চিরতরে শেষ। ঠিক এভাবেই Docker Compose তোমার multi-service app-কে reliable করে তোলে!

---

## Concept

### ১. Health Check: Container কি সত্যিই Ready?

`healthcheck` হলো Docker-কে বলার উপায় — "এই command চালিয়ে দেখো, container আসলে কাজ করছে কিনা।" Docker নিজে periodically এই test চালায় এবং container-এর status আপডেট করে।

**Compose-এ healthcheck লেখার format:**

```yaml
services:
  db:
    image: mongo:7
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s # প্রতি ১০ সেকেন্ডে একবার test চালাও
      timeout: 5s # ৫ সেকেন্ডের মধ্যে জবাব না পেলে fail ধরো
      retries: 5 # ৫ বার fail হলে container "unhealthy" mark করো
      start_period: 30s # প্রথম ৩০ সেকেন্ড grace period — এই সময় fail হলে retry count-এ ধরে না
```

**প্রতিটি parameter কী কাজ করে:**

| Parameter      | Default | কাজ                                              |
| -------------- | ------- | ------------------------------------------------ |
| `test`         | —       | যে command চালিয়ে health check হবে              |
| `interval`     | 30s     | কত পর পর test চালাবে                             |
| `timeout`      | 30s     | কত সময়ের মধ্যে response না পেলে fail            |
| `retries`      | 3       | কতবার fail হলে "unhealthy" বলবে                  |
| `start_period` | 0s      | Startup-এর পর এতটুকু সময় failure-কে ignore করবে |

`start_period` অনেক important — বড় service যেমন Elasticsearch বা MongoDB replica set initialize হতে সময় লাগে। `start_period: 30s` দিলে প্রথম ৩০ সেকেন্ডে failure হলেও retry count বাড়বে না।

**Health check-এর পর container-এর তিনটা possible status:**

- `starting` — এখনো healthy/unhealthy decide হয়নি
- `healthy` — test সফল হচ্ছে
- `unhealthy` — retries শেষ, তবুও fail

---

### ২. depends_on: কখন কোন condition ব্যবহার করবে

`depends_on` শুধু startup order নিয়ন্ত্রণ করে। কিন্তু `condition` দিলে সেই order আরও precise হয়।

```yaml
services:
  web:
    image: my-nestjs-app
    depends_on:
      db:
        condition: service_healthy # db healthy না হওয়া পর্যন্ত web চালু হবে না
      cache:
        condition: service_started # cache শুধু started হলেই চলবে
```

**তিনটা condition-এর তুলনা:**

| Condition                        | কখন পূরণ হয়                        | কখন ব্যবহার করবে                    |
| -------------------------------- | ----------------------------------- | ----------------------------------- |
| `service_started`                | Container শুধু start হলে (default)  | Simple dependency, health check নেই |
| `service_healthy`                | Container-এর health check pass করলে | Database, cache, message broker     |
| `service_completed_successfully` | Container exit code 0 দিয়ে শেষ হলে | DB migration job, init script       |

`service_completed_successfully` কখন কাজে লাগে? ধরো তোমার একটা migration service আছে যেটা চালু হয়, migration run করে, তারপর বন্ধ হয়। NestJS app শুধু তখনই চালু হবে যখন migration সফলভাবে শেষ হবে।

---

### ৩. Complete Example: NestJS + MongoDB

```yaml
version: "3.9"

services:
  db:
    image: mongo:7
    container_name: my_mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    volumes:
      - mongo_data:/data/db

  api:
    build: ./api
    container_name: my_nestjs
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://admin:secret@db:27017
    depends_on:
      db:
        condition: service_healthy # MongoDB ready না হওয়া পর্যন্ত NestJS চালু হবে না
    restart: on-failure # Crash হলে restart করো

volumes:
  mongo_data:
```

---

### ৪. Restart Policies: Container Crash হলে কী হবে?

```yaml
restart: no              # (default) কখনো restart করবে না
restart: always          # সবসময় restart করবে — Docker daemon restart হলেও
restart: on-failure      # Exit code non-zero হলে restart করবে
restart: unless-stopped  # manually stop না করলে সবসময় restart করবে
```

**কোনটা কখন ব্যবহার করবে:**

| Policy           | Use Case                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| `no`             | Development-এ, manually manage করো                                                  |
| `always`         | Production critical service (সবসময় চালু থাকা দরকার)                                |
| `on-failure`     | NestJS API — crash হলে restart, কিন্তু manually stop করলে না                        |
| `unless-stopped` | Production-এ সবচেয়ে নিরাপদ — reboot-এ auto start, কিন্তু তুমি বন্ধ করলে বন্ধ থাকবে |

---

### ৫. Profiles: Development Tools শুধু Dev-এ চালাও

Production-এ তুমি Mongo Express (DB GUI) বা Redis Commander চালাতে চাও না। `profiles` দিয়ে সেটা control করা যায়।

```yaml
services:
  db:
    image: mongo:7
    # কোনো profile নেই — সবসময় চলবে

  api:
    build: ./api
    # কোনো profile নেই — সবসময় চলবে

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    profiles:
      - dev # শুধু dev profile-এ চলবে
    depends_on:
      - db

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev # শুধু dev profile-এ চলবে
```

**চালানোর command:**

```bash
# Production — শুধু db এবং api চালু হবে
$ docker compose up -d

# Development — সব service চালু হবে (dev profile সহ)
$ docker compose --profile dev up -d
```

---

### ৬. Multiple Compose Files: Override Pattern

`docker-compose.yml` হলো base config। `docker-compose.override.yml` automatically merge হয় যখন তুমি `docker compose up` চালাও।

**docker-compose.yml (base — production config):**

```yaml
services:
  api:
    image: my-nestjs-app:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
```

**docker-compose.override.yml (development-এ automatically merge হয়):**

```yaml
services:
  api:
    build: ./api # Image-এর বদলে local build
    volumes:
      - ./api:/app # Code hot-reload-এর জন্য
    environment:
      NODE_ENV: development
      DEBUG: "true"
```

Development-এ `docker compose up` চালালে override file automatically apply হয়। Production-এ শুধু base file ব্যবহার করতে:

```bash
$ docker compose -f docker-compose.yml up -d
```

---

### ৭. docker compose watch: Auto-Rebuild on File Change

`docker compose watch` হলো development-এর জন্য দারুণ feature — তুমি code change করলে Docker নিজে থেকে rebuild করে।

```yaml
services:
  api:
    build: ./api
    develop:
      watch:
        - action: sync # File change হলে container-এ sync করো
          path: ./api/src
          target: /app/src
        - action: rebuild # package.json change হলে পুরো rebuild করো
          path: ./api/package.json
```

```bash
$ docker compose watch
```

এটা চললে তুমি `./api/src` folder-এ কোনো file change করলে সাথে সাথে container-এ reflect হবে — আলাদা করে restart করতে হবে না।

---

### Health Status Check: কীভাবে দেখবে?

```bash
# সব container-এর status দেখো
$ docker compose ps

# একটা নির্দিষ্ট container-এর health details দেখো
$ docker inspect --format="{{json .State.Health}}" container_name

# সুন্দরভাবে formatted দেখতে
$ docker inspect --format="{{json .State.Health}}" my_mongo | python3 -m json.tool
```

`docker inspect` output-এ দেখবে: `Status` (healthy/unhealthy/starting), `FailingStreak`, এবং শেষ কয়েকটা `Log` entry — কোন test চালানো হয়েছিল এবং output কী ছিল।

---

## Tool Spotlight

**`docker inspect --format="{{json .State.Health}}" container_name`** হলো health check debug করার সেরা tool। এটা দেখায় container এখন `healthy` নাকি `unhealthy`, কতবার fail হয়েছে, এবং শেষ health check-এর exact output — যেটা দিয়ে কোথায় সমস্যা সেটা pinpoint করা যায়।

---

## Real World

**NestJS + MongoDB Race Condition: Production Incident**

একটি Bangladeshi fintech startup-এর production deployment-এ intermittent failure ছিল। প্রতি ৩-৪ deploy-এ একবার NestJS container crash করত। Log দেখলে `MongoServerSelectionError: connect ECONNREFUSED 172.18.0.2:27017`। কিন্তু `docker ps` বলছে MongoDB container "Up 2 seconds" — কোনো error নেই।

সমস্যা ছিল: MongoDB container start হওয়ার পর port 27017 listen শুরু করে, কিন্তু replica set initialize এবং primary election শেষ হতে আরো ৫-১৫ সেকেন্ড লাগে। NestJS ঠিক সেই উইন্ডোতে connection করতে গিয়ে fail করত। `depends_on: db` ছিল, কিন্তু `condition: service_healthy` ছিল না।

Fix ছিল দুই লাইন — MongoDB-তে healthcheck যোগ করা এবং depends_on-এ `condition: service_healthy` দেওয়া। এরপর আর কোনো intermittent failure হয়নি। এই bug ধরতে ৩ সপ্তাহ লেগেছিল; fix করতে লাগল ৫ মিনিট।

**Netflix-এর Service Dependency Management**

Netflix-এর microservice architecture-এ শত শত service একে অপরের উপর depend করে। তারা health check-এর উপর ভিত্তি করে traffic routing করে — কোনো service "unhealthy" হলে সেই instance-এ নতুন request পাঠানো বন্ধ হয়, এবং healthy instance-এ redirect হয়। Docker-এর health check এই concept-এরই simplified version।

---

## মনে রাখো

- `depends_on: db` মানে শুধু "db container started হলে চালাও" — MongoDB ready হওয়ার guarantee নয়; `condition: service_healthy` ব্যবহার করো real readiness নিশ্চিত করতে
- `start_period` হলো startup grace period — বড় service যেমন MongoDB বা Elasticsearch initialize হতে সময় নেয়, এই সময়ে failure retry count-এ ধরা হয় না
- `restart: unless-stopped` production-এর জন্য সবচেয়ে balanced policy — server reboot-এ auto-start কিন্তু manually stop করলে বন্ধ থাকে
- `profiles` দিয়ে development-only tools (Mongo Express, MailHog) আলাদা রাখো; production-এ `docker compose up` চালালে সেগুলো automatically বাদ যাবে
- `docker inspect --format="{{json .State.Health}}" container_name` দিয়ে health check fail করার exact কারণ দেখতে পাবে — debugging-এ এটা সবচেয়ে কাজের command
