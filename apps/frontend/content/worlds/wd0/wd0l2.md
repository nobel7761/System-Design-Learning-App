---
id: wd0l2
world: wd0
order: 2
title: "প্রথম Container চালাও!"
titleEn: "Run Your First Container!"
estMinutes: 30
type: lesson
---

## গল্প

ঢাকার রাস্তায় রিকশা চলে হাজারে হাজারে — কিন্তু তুমি একটা কিনে ঘরে রাখো না। দরকার হলে রিকশা স্ট্যান্ড থেকে ডাকো, চড়ো, গন্তব্যে পৌঁছাও, তারপর ছেড়ে দাও। পরের দিন আবার দরকার হলে আবার ডাকো — একই রিকশা পাবে কিনা জানো না, কিন্তু একই রকম রিকশাই পাবে। এই ব্যবস্থাটা কতটা সহজ, তাই না?

Docker Container ঠিক এভাবেই কাজ করে। তুমি **Docker Hub** থেকে একটা image `pull` করো — এটা হলো রিকশা স্ট্যান্ড যেখান থেকে নতুন রিকশা আসে। সেই image থেকে একটা container তৈরি হয় এবং চালু হয় — রিকশা ভাড়া নেওয়া হলো। কাজ শেষে `docker stop` দিয়ে রিকশা থামাও, আর `docker rm` দিয়ে ফিরিয়ে দাও। Container-এর একটা নম্বর থাকে (Container ID) — ঠিক রিকশার নম্বর প্লেটের মতো, কিন্তু তুমি নিজেও একটা সুন্দর নাম (`--name mynginx`) দিতে পারো যাতে মনে রাখা সহজ হয়।

সবচেয়ে চমকের ব্যাপারটা হলো: তুমি কোনো software install করোনি, কোনো configuration করোনি — শুধু একটা command চালালে, আর একটা পুরো web server তোমার machine-এ চলতে শুরু করলো! প্রথমবার `docker run -d -p 8080:80 nginx` চালিয়ে `localhost:8080` খুললে যে "Welcome to nginx!" page দেখা যায় — সেই অনুভূতি developer জীবনে একটু আলাদাই। ঠিক এভাবেই Docker দিয়ে মুহূর্তেই যেকোনো software চালানো যায়!

## Concept

### `docker run` — সব কিছুর শুরু

`docker run` একটাই command, কিন্তু ভেতরে তিনটা কাজ করে:

1. **Pull** — Docker Hub থেকে image নামায় (যদি local-এ না থাকে)
2. **Create** — সেই image থেকে container তৈরি করে
3. **Start** — container চালু করে

```bash
$ docker run nginx
```

এই একটা command-এই nginx চলে গেল! কিন্তু এটা foreground-এ চলে — terminal আটকে যায়।

---

### গুরুত্বপূর্ণ flags — রিকশার বিভিন্ন option

| Flag             | পুরো নাম              | কাজ                                                   |
| ---------------- | --------------------- | ----------------------------------------------------- |
| `-d`             | `--detach`            | Background-এ চালাও, terminal ছেড়ে দাও                |
| `-p 8080:80`     | `--publish`           | Host-এর 8080 port → Container-এর 80 port-এ map করো    |
| `--name mynginx` | —                     | Container-কে একটা সুন্দর নাম দাও                      |
| `-it`            | `--interactive --tty` | Interactive terminal খোলো (কমান্ড চালাতে ভেতরে ঢুকতে) |

**Real command — nginx web server চালানো:**

```bash
$ docker run -d -p 8080:80 --name mynginx nginx
```

এটা চালালে:

- `-d` — background-এ চলে, terminal মুক্ত থাকে
- `-p 8080:80` — তোমার browser `localhost:8080`-এ গেলে সেটা container-এর 80 port-এ পৌঁছায়
- `--name mynginx` — container-এর নাম mynginx, ID মনে না রাখলেও চলবে

---

### Port Mapping বিস্তারিত: `-p host:container`

```
তোমার browser  →  localhost:8080  →  Container-এর port 80
```

```
-p 8080:80
     ↑    ↑
  Host  Container
```

Port mapping ছাড়া container isolated — বাইরে থেকে কেউ ঢুকতে পারবে না। `-p 3000:3000` মানে host-এর 3000 → container-এর 3000।

---

### Container Lifecycle — জন্ম থেকে মৃত্যু

```
created → running → stopped → removed
```

| অবস্থা    | মানে                             |
| --------- | -------------------------------- |
| `created` | তৈরি হয়েছে কিন্তু start হয়নি   |
| `running` | চলছে                             |
| `stopped` | থামানো হয়েছে, কিন্তু disk-এ আছে |
| `removed` | পুরোপুরি মুছে গেছে               |

---

### Container দেখা ও পরিচালনা

```bash
# চলমান container-গুলো দেখো
$ docker ps

# সব container দেখো (stopped সহ)
$ docker ps -a
```

**Log দেখা:**

```bash
$ docker logs mynginx
```

Container কী output দিচ্ছে, কোনো error আছে কিনা — সব এখানে।

**Container-এর ভেতরে ঢোকো:**

```bash
$ docker exec -it mynginx bash
```

এটা চালালে তুমি container-এর ভেতরে terminal পাবে — যেন একটা ভিন্ন Linux machine-এ ঢুকে গেছো। `exit` দিয়ে বের হবে।

---

### Container থামানো ও মোছা

```bash
# ভদ্রভাবে থামাও (graceful shutdown — SIGTERM পাঠায়)
$ docker stop mynginx

# জোর করে থামাও (SIGKILL — তাৎক্ষণিক)
$ docker kill mynginx

# Container মুছে ফেলো (আগে stop করতে হবে)
$ docker rm mynginx

# Image মুছে ফেলো
$ docker rmi nginx
```

**`docker stop` vs `docker kill`:**

|         | `stop`                                   | `kill`                  |
| ------- | ---------------------------------------- | ----------------------- |
| Signal  | SIGTERM                                  | SIGKILL                 |
| কাজ     | App-কে gracefully বন্ধ হওয়ার সুযোগ দেয় | তাৎক্ষণিক kill          |
| ব্যবহার | সবসময় এটাই prefer করো                   | App respond করছে না তখন |

---

### Container inspect

```bash
$ docker inspect mynginx
```

Container-এর সব detail — IP address, মাউন্ট করা volume, environment variable, network — সব JSON আকারে দেখা যায়।

---

### Container ID vs Name

```
CONTAINER ID   IMAGE   ...   NAMES
a1b2c3d4e5f6   nginx   ...   mynginx
```

Docker প্রতিটা container-কে একটা unique ID দেয় (যেমন `a1b2c3d4e5f6`f6)। কিন্তু `--name` দিলে নাম দিয়েই কাজ করা যায়। Command-এ যেকোনোটাই চলে:

```bash
$ docker stop a1b2c3d4e5f6   # ID দিয়ে
$ docker stop mynginx         # নাম দিয়ে — এটাই সহজ
```

---

### Interactive container — Ubuntu-তে ঢোকো

```bash
$ docker run -it ubuntu bash
```

এখানে কোনো `-d` নেই — foreground-এ চলে, তুমি সরাসরি Ubuntu-র shell পাবে। `exit` দিলে container বন্ধ।

## Tool Spotlight

`docker logs` command টা প্রতিদিনের সবচেয়ে কাজের tool। `docker logs mynginx` চালালে container-এর সব output দেখা যায়। `docker logs -f mynginx` চালালে real-time-এ log stream হতে থাকে — ঠিক `tail -f`-এর মতো। কোনো error debug করতে হলে এটাই প্রথম দেখো।

## Real World

**প্রথম দিনের "ম্যাজিক" মুহূর্ত:** অনেক developer মনে রাখেন সেই দিনটা যেদিন প্রথম `docker run -d -p 8080:80 nginx` চালিয়ে browser-এ `localhost:8080` খুলেছিলেন। কোনো apt install নেই, কোনো config file নেই — শুধু একটা command, আর nginx চলছে। এটাই Docker-এর শক্তি বোঝার প্রথম ধাপ। অনেকে এরপর পুরানো "আমার machine-এ চলছে, তোমার কেন চলছে না?" সমস্যার সমাধান খুঁজে পান।

**Production-এ `docker stop` vs `docker kill`:** একটা বড় e-commerce site-এ একজন junior developer ভুল করে `docker kill` দিয়ে payment processing container বন্ধ করেন। তখন container টা মাঝপথের transaction গুলো লিখতে পারেনি, কিছু payment incomplete হয়ে যায়। শিক্ষা: production-এ সবসময় `docker stop` ব্যবহার করো — app-কে নিজে clean up করার সময় দাও।

## মনে রাখো

- `docker run` = pull + create + start — তিনটা কাজ এক command-এ।
- `-d` মানে detach (background-এ চালাও), `-p host:container` মানে port mapping, `--name` মানে নিজে নাম দাও।
- Port mapping ছাড়া container isolated — বাইরে থেকে access নেই।
- `docker stop` graceful (SIGTERM), `docker kill` brutal (SIGKILL) — production-এ stop prefer করো।
- Container মানে temporary রিকশা — `docker rm` দিয়ে ফিরিয়ে দাও; image হলো রিকশার ছাঁচ (`docker rmi` দিয়ে মোছো)।
- ভেতরে কী হচ্ছে জানতে: `docker logs`, ভেতরে ঢুকতে: `docker exec -it <name> bash`।
