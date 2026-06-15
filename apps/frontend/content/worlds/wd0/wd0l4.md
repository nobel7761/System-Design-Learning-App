---
id: wd0l4
world: wd0
order: 4
title: "Dockerfile লেখা — নিজের Image বানাও"
titleEn: "Write a Dockerfile — Build Your Own Image"
estMinutes: 30
type: lesson
---

## গল্প

তোমার দাদির হাতের বিরিয়ানির কথা ভাবো। সেই অসাধারণ রান্নার পেছনে কী আছে? একটা রেসিপি খাতা — যেখানে লেখা আছে কোন মশলা কতটুকু, কোন ধাপে কী করতে হবে, কতক্ষণ রান্না করতে হবে। এই রেসিপি খাতাটাই হলো **Dockerfile**। রেসিপি অনুসরণ করে যখন রান্না সম্পন্ন হয়, তখন যে বিরিয়ানি তৈরি হয় সেটা হলো **Docker Image** — মানে রান্না করা, পরিবেশনের জন্য প্রস্তুত খাবার। আর যখন সেই বিরিয়ানি থালায় তুলে কাউকে পরিবেশন করা হয়, সেটা হলো **Container** — চলমান, ব্যবহারযোগ্য।

এখন চমৎকার ব্যাপার হলো — একটা রেসিপি থেকে হাজারটা একই বিরিয়ানি বানানো যায়, তাই না? ঠিক তেমনি একটা Dockerfile থেকে হাজারটা একই Container চালানো যায়। বিয়েবাড়িতে হাজার মানুষের জন্য রান্না করতে হলে রেসিপি একটাই, শুধু পরিমাণ বাড়ে। Netflix-এও একই Docker Image থেকে হাজারটা Container চলে — প্রতিটা Container একটা করে user serve করে। রেসিপি না থাকলে প্রতিবার রান্নার সময় ভুল হওয়ার সম্ভাবনা থাকে, কিন্তু ভালো রেসিপি থাকলে নতুন বাবুর্চিও একই স্বাদের রান্না করতে পারে।

তুমি হয়তো এখন ভাবছো — "ভাই, আমি তো code লিখি, রান্না করি না!" কিন্তু এই analogy-টা আসলে software deployment-এর সবচেয়ে বড় সমস্যার সমাধান বলে দিচ্ছে। আগে developer বলতো "আমার machine-এ তো কাজ করে!" আর production server-এ গিয়ে সব ভেঙে পড়তো। Dockerfile মানে হলো environment-এর রেসিপিটাও code-এর সাথে commit করে রাখো — যাতে যে কোনো machine-এ, যে কোনো সময়, একই পরিবেশ তৈরি হয়। ঠিক এভাবেই Docker আমাদের "আমার machine-এ কাজ করে" সমস্যা থেকে মুক্তি দেয়!

## Concept

### Dockerfile কী?

Dockerfile হলো একটা plain text file — নাম literally `Dockerfile` (কোনো extension নেই)। এর মধ্যে instruction-এর পর instruction লেখা থাকে। Docker এই file পড়ে, ধাপে ধাপে execute করে, এবং শেষে একটা Image তৈরি করে।

### Dockerfile Instructions — পুরো গাইড

#### `FROM` — ভিত্তি স্থাপন

```dockerfile
FROM node:18-alpine
```

প্রতিটা Dockerfile শুরু হয় `FROM` দিয়ে। এটা বলে "আমি এই base image-এর উপর দাঁড়িয়ে আছি।" `node:18-alpine` মানে Node.js version 18, Alpine Linux-এ (Alpine হলো ছোট্ট, মাত্র 5MB-এর Linux distro — production-এর জন্য পারফেক্ট)।

Base image না থাকলে Docker জানবে না কোথা থেকে শুরু করবে। এটা বাড়ি বানানোর আগে জমি নির্বাচনের মতো।

#### `WORKDIR` — কাজের জায়গা ঠিক করো

```dockerfile
WORKDIR /app
```

Container-এর ভেতরে কোন directory-তে বসে কাজ করবো সেটা বলে দেয়। এরপর থেকে সব command এই `/app` directory থেকে চলবে। না দিলেও চলে, কিন্তু দিলে সবকিছু organized থাকে। Root (`/`) থেকে কাজ করা বিপজ্জনক — system file ভেঙে যেতে পারে।

#### `COPY` — ফাইল নিয়ে আসো

```dockerfile
COPY package*.json ./
COPY . .
```

Host machine (তোমার laptop) থেকে Image-এর ভেতরে file কপি করে। `COPY <source> <destination>` format।

- `package*.json ./` মানে `package.json` আর `package-lock.json` দুটোই কপি করো current WORKDIR-এ।
- `. .` মানে সব কিছু কপি করো (কিন্তু `.dockerignore`-এ listed ফাইল বাদ দিয়ে)।

#### `RUN` — build-এর সময় command চালাও

```dockerfile
RUN npm ci
```

Image তৈরির সময় shell command execute করে। `npm ci` হলো `npm install`-এর cleaner version — exactly `package-lock.json` অনুযায়ী install করে, production-এর জন্য better।

`RUN apt-get install`, `RUN pip install`, `RUN go build` — যাই হোক, build-এর সময় যা করতে চাও সব `RUN` দিয়ে।

#### `ENV` — environment variable সেট করো

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

Container-এর ভেতরে environment variable define করে। App-এর code এগুলো `process.env.NODE_ENV` দিয়ে পড়তে পারবে।

#### `EXPOSE` — port document করো

```dockerfile
EXPOSE 3000
```

এটা আসলে কোনো port open করে না — এটা শুধু documentation। বলছে "এই Container-টা port 3000-এ listen করবে।" Real port mapping হয় `docker run -p` দিয়ে।

#### `CMD` বনাম `ENTRYPOINT` — Container চালু হলে কী করবে

| বিষয়              | `CMD`                               | `ENTRYPOINT`                                |
| ------------------ | ----------------------------------- | ------------------------------------------- |
| কাজ                | Default command define করে          | Fixed command define করে                    |
| Override করা যায়? | হ্যাঁ, `docker run` এ argument দিলে | না (শুধু `--entrypoint` flag দিয়ে)         |
| ব্যবহার            | General apps                        | Specific tools/scripts                      |
| Example            | `CMD ["node", "index.js"]`          | `ENTRYPOINT ["nginx", "-g", "daemon off;"]` |

```dockerfile
CMD ["node", "index.js"]
```

Array format (exec form) ব্যবহার করো — shell form (`CMD node index.js`) এড়াও। Exec form সরাসরি process চালায়, shell form আরেকটা shell spawn করে যা signal handling ভেঙে দেয়।

---

### .dockerignore — কিছু কপি করবে না

`.gitignore`-এর মতোই `.dockerignore` file তৈরি করো — এই file-এর listed items `COPY . .` এ কপি হবে না।

```
node_modules
.git
.env
.env.local
*.log
dist
coverage
.DS_Store
```

**কেন এটা critical?**

- `node_modules` — Image-এর ভেতরে `npm install` করবে, তোমার laptop-এর `node_modules` দরকার নেই। Copy করলে শুধু size বাড়বে এবং wrong platform-এর binary যেতে পারে।
- `.env` — কখনো secret image-এ ঢুকিও না। Image share হলে secret ফাঁস হয়ে যাবে।
- `.git` — 수백 megabyte-এর git history image-এ দরকার নেই।

---

### Layer Caching — Docker-এর সুপারপাওয়ার

Docker প্রতিটা instruction-কে আলাদা **layer** হিসেবে cache করে। যদি কোনো layer না বদলায়, Docker সেটা আবার build করে না — cache থেকে নেয়।

**ভুল order (slow):**

```dockerfile
COPY . .          # সব কিছু কপি হলো
RUN npm install   # কিন্তু code বদলালেই এটা আবার চলবে!
```

**সঠিক order (fast):**

```dockerfile
COPY package*.json ./   # শুধু package.json কপি (কম বদলায়)
RUN npm ci              # cache হয়ে থাকে যতদিন package.json না বদলায়
COPY . .                # বাকি code কপি
```

ব্যাখ্যা: `package.json` রোজ বদলায় না। কিন্তু তোমার app code রোজ বদলায়। তাই আগে `package.json` কপি করে `npm install` চালাও — এই layer cache হয়ে থাকবে। পরে code কপি করলে শুধু সেই layer rebuild হবে। এতে build অনেক দ্রুত হয়।

---

### Complete Node.js App Dockerfile

ধরো তোমার `index.js`:

```javascript
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Hello from Docker!"));
app.listen(3000, () => console.log("Running on port 3000"));
```

তোমার `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

---

### docker build — Image তৈরি করো

```bash
$ docker build -t myapp:v1 .
```

- `-t myapp:v1` — tag: `name:version` format-এ image-এর নাম দাও
- `.` — **build context**: মানে current directory। Docker এই directory-র সব file Daemon-এ পাঠায় (`.dockerignore` বাদ দিয়ে)

```bash
$ docker build --no-cache -t myapp:v1 .
```

`--no-cache` দিলে সব layer নতুন করে build হবে — debugging-এর সময় কাজে লাগে।

---

### Build Context কী?

`docker build .` লেখার সময় `.` হলো build context। Docker CLI এই directory-র সব content Docker Daemon-এ upload করে, তারপর Daemon Dockerfile execute করে। তাই `.dockerignore` না থাকলে `node_modules` সহ সব কিছু upload হয় — build slow হয়ে যায়।

---

### Image চালাও এবং Tag দাও

```bash
$ docker run -p 3000:3000 myapp:v1
```

`-p 3000:3000` মানে host-এর port 3000 → container-এর port 3000।

```bash
$ docker tag myapp:v1 myapp:latest
```

একই image-কে নতুন tag দাও। এখন `myapp:v1` আর `myapp:latest` দুটো same image-কে point করে।

## Tool Spotlight

**`docker build`** হলো Dockerfile থেকে Image তৈরির command। সবচেয়ে গুরুত্বপূর্ণ flags: `-t` (tag দাও), `--no-cache` (cache বাদ দিয়ে fresh build), `--build-arg` (build-এর সময় variable pass করো)। Build হওয়ার সময় প্রতিটা step numbered দেখাবে — কোন step-এ কতক্ষণ লাগছে বুঝতে পারবে।

## Real World

**Netlify/Vercel-এর কথা ভাবো:** তারা তোমার repo পেলে নিজেরাই একটা Dockerfile-এর মতো process চালায় — dependencies install, build run, output serve। তুমি manually কিছু করো না। এটা সম্ভব কারণ environment reproducible — ঠিক Dockerfile-এর মতো।

**একটা common ভুল:** অনেক developer প্রথমবার Dockerfile লেখার সময় `.dockerignore` বানাতে ভুলে যায়। ফলে `node_modules` (যেটা হয়তো 500MB+) image-এ ঢুকে যায়, build context upload করতে 5 মিনিট লাগে, এবং image size হয়ে যায় 1GB+। `.dockerignore`-এ `node_modules` যোগ করার পর build context 2 সেকেন্ডে upload হয় আর image 200MB-এ নেমে আসে। এই একটা ফাইলের জন্য CI/CD pipeline 10x দ্রুত হয়।

## মনে রাখো

- **Dockerfile = রেসিপি, Image = রান্না করা খাবার, Container = থালায় পরিবেশিত খাবার** — এই তিনটার পার্থক্য সবসময় মাথায় রাখো।
- **Layer caching-এর জন্য order matters:** `COPY package.json` → `RUN npm install` → `COPY . .` — কম-বদলানো জিনিস আগে, বেশি-বদলানো জিনিস পরে।
- **`.dockerignore` বাধ্যতামূলক:** `node_modules`, `.git`, `.env` কখনো image-এ ঢুকাবে না — image size, security, build speed তিনটাই এর উপর নির্ভর করে।
- **`CMD` exec form ব্যবহার করো:** `CMD ["node", "index.js"]` লেখো, `CMD node index.js` নয় — signal handling ঠিক রাখতে।
- **`EXPOSE` শুধু documentation:** এটা port খোলে না। Real port mapping হয় `docker run -p` দিয়ে — দুটোকে গুলিয়ে ফেলো না।
