---
id: wd0l3
world: wd0
order: 3
title: "Docker Images — স্তরে স্তরে কেক"
titleEn: "Docker Images — The Layer Cake"
estMinutes: 30
type: lesson
---

## গল্প

ঈদের আগের রাতে নানির বাড়িতে পাটিসাপটা বানানো হচ্ছে। প্রথমে চালের গুঁড়ার পাতলা একটা স্তর — ঠান্ডা হলে তার উপর নারকেল আর গুড়ের পুর, তার উপর আরেকটু ভাঁজ, তারপর সাজানো ট্রেতে সাজিয়ে রাখা। একটা স্তর বানানো হয়ে গেলে সেটা শক্ত হয়ে যায় — আর পরিবর্তন হয় না। নতুন স্বাদ যোগ করতে হলে উপরে নতুন স্তর দিতে হবে। ঠিক এভাবেই Docker image বানানো হয় — স্তরে স্তরে, layer by layer।

ভাবো: নিচের স্তরটা Ubuntu OS (পাটিসাপটার চালের বেস), তার উপর Node.js রানটাইম (নারকেলের পুর), তার উপর তোমার app-এর code (উপরের চিনির প্রলেপ)। প্রতিটা স্তর আলাদাভাবে বানানো এবং আলাদাভাবে সংরক্ষিত। এখন ধরো তোমার app-এর code পরিবর্তন হলো — পুরো কেক নতুন করে বানাতে হবে না! শুধু উপরের স্তরটা বদলে দাও। Docker ঠিক এটাই করে — শুধু বদলানো layer-টা আবার download বা build করে, বাকিগুলো আগেরটা রেখে দেয়।

এই চালাক ব্যবস্থার নাম **Union Filesystem** — বিশেষত overlay2 driver। তুমি যখন `docker pull node:18-alpine` চালাও আর দেখো কিছু layer-এর পাশে "Already exists" লেখা, সেটা হলো layer cache hit। মানে সেই স্তরটা তোমার machine-এ আগেই আছে — আর নামাতে হবে না। ঠিক যেমন নানি বলেন, "চালের গুঁড়া তো আগেই ভিজানো আছে, শুধু নারকেলের পুরটা করতে হবে!" — ঠিক এভাবেই Docker images কাজ করে!

## Concept

### Image Layer কীভাবে কাজ করে?

Docker image আসলে কয়েকটা **read-only layer**-এর stack। প্রতিটা layer হলো একটা নির্দিষ্ট পরিবর্তনের snapshot। তুমি যখন container চালাও, Docker উপরে একটা **পাতলা writable layer** যোগ করে — শুধু সেই container চলার সময়কার পরিবর্তনগুলো ওখানে লেখা হয়। Image-এর মূল layer-গুলো কখনো বদলায় না।

```
┌─────────────────────────────┐  ← Container layer (writable, temporary)
├─────────────────────────────┤  ← Your app code (read-only layer)
├─────────────────────────────┤  ← Node.js runtime (read-only layer)
├─────────────────────────────┤  ← Alpine Linux base (read-only layer)
└─────────────────────────────┘
```

এই কারণেই একই image থেকে ১০টা container চালালে সবাই একই base layer share করে — আলাদা আলাদা কপি হয় না। Disk space বাঁচে, memory বাঁচে।

### Image নামের structure

Docker image-এর নাম একটা নির্দিষ্ট format মেনে চলে:

```
registry/username/name:tag

উদাহরণ:
docker.io/library/node:18-alpine      ← Docker Hub-এর official image
docker.io/mycompany/myapp:v2.1.0     ← নিজের image
ghcr.io/myuser/backend:latest        ← GitHub Container Registry
```

- **registry**: কোথায় stored? (default: `docker.io` = Docker Hub)
- **username/organization**: কার image?
- **name**: image-এর নাম
- **tag**: কোন version? (`:latest` মানে সবচেয়ে নতুন — কিন্তু এটা production-এ avoid করা ভালো!)

### node:18 vs node:18-alpine — আকাশ পাতাল ফারাক

| Image            | Size    | কী আছে                              | কখন ব্যবহার করবে                    |
| ---------------- | ------- | ----------------------------------- | ----------------------------------- |
| `node:18`        | ~1 GB   | Full Debian Linux + সব system tools | Development-এ, debugging দরকার হলে  |
| `node:18-slim`   | ~250 MB | Minimal Debian, কিছু tools বাদ      | মাঝামাঝি পরিস্থিতিতে                |
| `node:18-alpine` | ~180 MB | Alpine Linux — super minimal        | Production-এ, fast deployment চাইলে |

**Alpine Linux কী?** এটা একটা মিনিমাল Linux distro — মাত্র দরকারি জিনিসগুলো আছে, বাকি সব বাদ। Production-এ `node:18-alpine` use করলে image size ~5-6x ছোট হয়, মানে:

- Docker Hub থেকে download হয় অনেক দ্রুত
- Deploy করতে কম সময় লাগে
- Server-এ কম জায়গা নেয়
- Security surface area কমে (কম software = কম vulnerability)

### দরকারি Commands

**Image নামিয়ে আনো:**

```bash
$ docker pull node:18-alpine
```

উপরে দেখবে:

```
18-alpine: Pulling from library/node
c926b61bad3b: Already exists        ← cache hit! এই layer আগেই আছে
b9b4e02e5f44: Pull complete         ← নতুন layer নামছে
Digest: sha256:abc123...
Status: Downloaded newer image for node:18-alpine
```

**কোন কোন image আছে দেখো:**

```bash
$ docker images
```

```
REPOSITORY   TAG          IMAGE ID       CREATED        SIZE
node         18-alpine    abc123def456   2 weeks ago    182MB
node         18           xyz789ghi012   2 weeks ago    999MB
```

**Image-এর layer history দেখো:**

```bash
$ docker history node:18-alpine
```

```
IMAGE          CREATED       CREATED BY                                SIZE
abc123def456   2 weeks ago   CMD ["node"]                              0B
<missing>      2 weeks ago   ENV NODE_VERSION=18.20.4                  0B
<missing>      2 weeks ago   RUN /bin/sh -c apk add --no-cache ...    42.3MB
<missing>      2 weeks ago   ADD alpine-minirootfs.tar.gz /           7.34MB
```

প্রতিটা লাইন একটা layer — কোন command থেকে তৈরি আর কত বড়।

**Image-এর বিস্তারিত তথ্য:**

```bash
$ docker image inspect node:18-alpine
```

এটা JSON output দেয় — architecture, OS, environment variables, exposed ports, layer digests সব কিছু।

**পুরনো/অব্যবহৃত image মুছো:**

```bash
$ docker image prune
```

এটা "dangling" images মুছে — মানে যেসব image-এর কোনো নাম বা tag নেই (build করতে গিয়ে পুরনো হয়ে গেছে)। সব unused image মুছতে: `docker image prune -a`

### Docker Hub vs Private Registry

|             | Docker Hub                         | Private Registry                               |
| ----------- | ---------------------------------- | ---------------------------------------------- |
| **কী**      | Docker-এর official public registry | নিজের বা cloud provider-এর                     |
| **উদাহরণ**  | `docker.io`                        | AWS ECR, GCP Artifact Registry, GitHub ghcr.io |
| **ব্যবহার** | Open source, public images         | Company-এর private images                      |
| **দাম**     | Free (public), paid (private)      | Cloud cost অনুযায়ী                            |

### Layer Caching — কেন Dockerfile instruction-এর order গুরুত্বপূর্ণ

Docker build করার সময়, যদি কোনো layer বদলায় — তার নিচের সব layer cache থেকে নেওয়া হলেও, বদলানো layer থেকে উপরের সব layer **আবার build** হয়। এই কারণে:

```dockerfile
# ভুল order — package.json আর source code একসাথে copy করলে
# code বদলালেই npm install আবার চলবে (slow!)
COPY . .
RUN npm install

# সঠিক order — dependencies আগে install করো
COPY package.json package-lock.json ./
RUN npm install          ← এটা cache হয়ে থাকে যতক্ষণ package.json না বদলায়
COPY . .                 ← শুধু এই layer বদলায় প্রতিবার
```

এই concept পরের lesson-এ Dockerfile লেখায় বিস্তারিত শিখবে।

### Parent Image — FROM কার উপর দাঁড়িয়ে?

প্রতিটা image একটা **parent image** থেকে শুরু হয়:

```
scratch          ← একদম খালি, কিছুই নেই
  └── alpine     ← Alpine Linux base
        └── node:18-alpine  ← Node.js added
              └── তোমার app  ← তোমার code added
```

`FROM ubuntu` লিখলে Ubuntu image-এর উপর দাঁড়াচ্ছ। `FROM node:18-alpine` লিখলে Alpine Linux + Node.js — দুটো একসাথে পাচ্ছ। Smart!

## Tool Spotlight

**`docker history`** হলো image-এর X-ray machine। এই command চালালে দেখতে পাবে কোন Dockerfile instruction কত বড় layer তৈরি করেছে। যদি দেখো কোনো একটা layer অনেক বড়, সেখানে optimization করার সুযোগ আছে। `docker history --no-trunc node:18-alpine` দিলে সম্পূর্ণ command দেখাবে, কাটছাঁট ছাড়া।

## Real World

**"আমার machine-এ কাজ করে, server-এ করে না" — এর সমাধান alpine-এ লুকানো আছে।** একজন developer `node:18` দিয়ে locally develop করছিলেন, production-এ `node:18-alpine` deploy করেছিলেন। Alpine-এ `glibc` নেই, `musl libc` আছে। তার একটা npm package (`sharp` — image processing) `glibc`-এর উপর depend করতো। Result: production-এ crash! সমাধান হলো হয় development-এও alpine use করো (environment match করো), নয়তো alpine-এ `glibc` manually install করো। শিক্ষা: dev আর prod environment একই base image use করা উচিত।

**Layer cache-এর চমক:** একটা বড় Bangladeshi startup deploy করার সময় প্রতিটা deploy-এ পুরো 1GB node image নামাচ্ছিল — প্রতি deploy 8-10 মিনিট লাগছিল। `node:18-alpine` (180MB)-তে switch করে আর Dockerfile-এর instruction order ঠিক করে তারা deploy time 90 সেকেন্ডে নামিয়ে এনেছিল। CI/CD pipeline-এ layer cache hit হওয়ায় পরের deploy আরো দ্রুত।

## মনে রাখো

- Docker image = স্তরে স্তরে সাজানো read-only layer-এর stack; container চালালে উপরে একটা পাতলা writable layer যোগ হয়।
- Image নামের format: `registry/username/name:tag` — tag বাদ দিলে default `:latest` ধরে নেয়।
- `node:18-alpine` (180MB) vs `node:18` (1GB) — production-এ সবসময় alpine বা slim prefer করো।
- `docker pull` করার সময় "Already exists" = layer cache hit — সেই layer আবার নামাতে হচ্ছে না।
- Layer caching-এর জন্য Dockerfile-এ কম বদলানো জিনিস আগে রাখো, বেশি বদলানো জিনিস শেষে — পরের lesson-এ বিস্তারিত!
- `docker image prune` দিয়ে dangling images পরিষ্কার করো, নাহলে disk ভরে যাবে।
