---
id: wd0l5
world: wd0
order: 5
title: "Docker Volumes — Data হারিয়ে যায় কেন?"
titleEn: "Docker Volumes — Why Does Data Disappear?"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি ঢাকায় একটা ভাড়া ফ্ল্যাটে থাকো। বাসায় থাকার সময় তুমি নিজের মতো সাজাও — ফার্নিচার রাখো, দেয়ালে ছবি টাঙাও, ফ্রিজে বাজার ভরো। কিন্তু বাসার মেয়াদ শেষ হলে কী হয়? বাড়িওয়ালা ফ্ল্যাট ঝাড়ু দিয়ে পরিষ্কার করে দেন — পরের ভাড়াটের জন্য খালি করা হয়। তুমি যদি জিনিসপত্র সাথে নিয়ে না যাও, সব গায়েব। Docker-এর container ঠিক এই ভাড়া ফ্ল্যাটের মতো — `docker run` করলে container তৈরি হয়, `docker stop` বা `docker rm` করলে সব data মুছে যায়, পরের বার নতুন container শুরু হয় একদম fresh।

এখন ভাবো তোমার দরকারি কাগজপত্র — জমির দলিল, পাসপোর্ট, ব্যাংকের চেকবই। এগুলো কি বাসায় রাখবে? রাখলে বাসা ছাড়লে হারিয়ে যাবে! বুদ্ধিমান মানুষ এগুলো রাখে **bank locker**-এ। বাসা পরিবর্তন করো, শহর বদলাও — bank locker-এ রাখা জিনিস সব সময় সেখানেই থাকে, নিরাপদ। Docker Volume হলো এই bank locker — container বন্ধ হোক, মুছে যাক, নতুন করে তৈরি হোক — volume-এ রাখা data কোথাও যায় না।

এই ধারণাটা না বুঝলে অনেক বড় বিপদ হতে পারে। অনেক নতুন developer production-এ MongoDB চালায়, কয়েক মাস ধরে হাজার হাজার user-এর data জমা হয়, তারপর একদিন server restart — আর সব ফাঁকা! ঠিক এভাবেই Docker Volume-এর গুরুত্ব বোঝা যায়!

## Concept

### Container Storage কেন Ephemeral (অস্থায়ী)?

Docker container-এর ভেতরে যে filesystem আছে সেটা তৈরি হয় **layered architecture** দিয়ে। Image-এর layers গুলো read-only — তুমি কিছু পরিবর্তন করতে পারবে না। Container চালু হলে উপরে একটা **writable layer** যোগ হয় — এখানেই তুমি নতুন file বানাও, data লেখো। কিন্তু container মুছে গেলে এই writable layer-ও মুছে যায়। পরের বার নতুন container উঠলে আবার fresh writable layer — আগের কিছুই নেই।

```
[Container Writable Layer]  ← তোমার data এখানে → মুছলে শেষ!
[Image Layer 3 - read only]
[Image Layer 2 - read only]
[Image Layer 1 - read only]
```

### তিন ধরনের Storage

Docker-এ data persist করার তিনটা উপায় আছে:

| Type             | কোথায় থাকে                 | কে manage করে | কখন ব্যবহার করবে                    |
| ---------------- | --------------------------- | ------------- | ----------------------------------- |
| **Named Volume** | Docker-managed directory    | Docker        | Production data — database, uploads |
| **Bind Mount**   | Host machine-এর যেকোনো path | তুমি নিজে     | Development — live code reload      |
| **tmpfs**        | RAM (memory)-তে             | OS            | Sensitive temporary data — secrets  |

### Named Volume

Named volume হলো Docker নিজে manage করা storage। তুমি শুধু নাম দাও, Docker বাকি কাজ করে।

```bash
# প্রথমে volume তৈরি করো
$ docker volume create mydata

# Volume list দেখো
$ docker volume ls

# Output দেখতে এরকম হবে:
# DRIVER    VOLUME NAME
# local     mydata

# Volume-এর বিস্তারিত দেখো
$ docker volume inspect mydata
```

`docker volume inspect` করলে দেখবে volume-টা actually কোথায় আছে:

```json
[
  {
    "Name": "mydata",
    "Driver": "local",
    "Mountpoint": "/var/lib/docker/volumes/mydata/_data",
    "Labels": {},
    "Scope": "local"
  }
]
```

এই path-টা host machine-এ, Docker-এর নিজস্ব জায়গায়। Container আসুক যাক — এই জায়গার data থাকবে।

Container-এ volume mount করতে `-v` flag ব্যবহার করো:

```bash
# Syntax: docker run -v <volume-name>:<container-path> <image>
$ docker run -v mydata:/data/db mongo
```

এখানে `mydata` volume-টা container-এর `/data/db` path-এ mount হয়েছে। MongoDB এই path-এ data রাখে — মানে সব database data আমাদের volume-এ যাচ্ছে!

### Bind Mount

Bind mount-এ তুমি host machine-এর একটা specific path সরাসরি container-এ দেখাও। Development-এ এটা অসাধারণ কাজের।

```bash
# Syntax: docker run -v <host-path>:<container-path> <image>
$ docker run -v $(pwd):/app -p 3000:3000 myapp
```

`$(pwd)` মানে current directory — তোমার project folder। এই command-এ তোমার local project folder container-এর `/app`-এ দেখাচ্ছে। তুমি VS Code-এ file save করো — container-এর ভেতরে সাথে সাথে change reflect হয়। Nodemon দিয়ে server restart হয়ে যায় — হট রিলোড!

```
[তোমার laptop]          [Container]
/home/user/project  ==  /app
     ↕ (same files, live sync)
```

**Bind mount vs Named volume — key difference:**

- Named volume: Docker manage করে, portable, production-safe
- Bind mount: তুমি control করো, host-specific, development-এ ideal

### Volume Management Commands

```bash
# সব volume দেখো
$ docker volume ls

# নির্দিষ্ট volume-এর details
$ docker volume inspect mydata

# Volume মুছে দাও (data সহ!)
$ docker volume rm mydata

# Unused সব volume মুছো (সাবধানে!)
$ docker volume prune
```

`docker volume prune` — এটা অনেকটা ঘরবাড়ি পরিষ্কারের মতো। কোনো container-এ attached নেই এমন সব volume মুছে দেয়। Production-এ এই command ভুল করে দিলে data loss হতে পারে — সাবধান!

### MongoDB Persistence — সঠিক উপায়

```bash
# ভুল উপায় — restart করলে সব data যাবে!
$ docker run -d --name mydb mongo

# সঠিক উপায় — volume দিলে data থাকবে
$ docker run -d --name mydb -v mongo-data:/data/db mongo

# এখন container বন্ধ করো, আবার চালু করো
$ docker stop mydb
$ docker rm mydb
$ docker run -d --name mydb -v mongo-data:/data/db mongo
# Data ঠিকঠাক আছে!
```

### কখন কোনটা?

| Situation                                        | কোনটা ব্যবহার করবে |
| ------------------------------------------------ | ------------------ |
| Production database (MySQL, MongoDB, PostgreSQL) | Named Volume       |
| Development-এ code live reload                   | Bind Mount         |
| Temporary secret/config যা disk-এ লিখতে চাও না   | tmpfs              |
| CI/CD pipeline-এ build artifacts                 | Named Volume       |
| Host-এর config file container-এ দিতে             | Bind Mount         |

## Tool Spotlight

**`docker volume inspect`** — এই command দিয়ে volume-এর exact location, creation date, আর configuration দেখা যায়। কোনো data হারিয়ে গেলে প্রথমে এই command দিয়ে volume এখনো আছে কিনা চেক করো। `Mountpoint` field দেখিয়ে দেবে data host machine-এ ঠিক কোথায় আছে।

## Real World

**"সব data গেল কোথায়?" — একটা সত্যিকারের ভুল:**

একজন developer startup-এ MongoDB container চালাচ্ছিলেন production-এ, volume ছাড়া। তিন মাস ধরে user registration হচ্ছে, data জমছে। একদিন server-এ space কম হওয়ায় টিম `docker system prune` চালাল। সব container, unused image মুছে গেল। পরে `docker run mongo` করে নতুন container তুললে — তিন মাসের সব data উধাও। Backup ছিল না, volume ছিল না। এই একটা ভুলে company-র কয়েক লক্ষ টাকার সমপরিমাণ ক্ষতি হলো।

**Development-এ bind mount-এর জাদু:**

Node.js project-এ bind mount + nodemon combination দারুণ কাজ করে। `docker run -v $(pwd):/app -p 3000:3000 my-node-app` — এরপর তুমি host machine-এ যেকোনো `.js` file save করো, container-এর ভেতরে nodemon সেটা detect করে server restart করে ফেলে। আলাদা করে `docker build` করতে হয় না প্রতিটা change-এর জন্য। এভাবে development cycle অনেক দ্রুত হয়।

## মনে রাখো

- Container হলো ভাড়া ফ্ল্যাট — মুছলে সব data যায়; Volume হলো bank locker — container না থাকলেও data থাকে।
- **Named Volume** production-এর জন্য — Docker manage করে, portable, নির্ভরযোগ্য।
- **Bind Mount** development-এর জন্য — host folder সরাসরি container-এ দেখায়, live reload কাজ করে।
- MongoDB বা যেকোনো database container চালাতে হলে **সবসময়** volume দাও, না হলে restart-এ data হারাবে।
- `docker volume prune` সাবধানে ব্যবহার করো — unused volume মুছে দেয়, production-এ ভুল করলে data loss!
