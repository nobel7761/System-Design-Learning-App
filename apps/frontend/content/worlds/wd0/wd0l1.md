---
id: wd0l1
world: wd0
order: 1
title: "Docker কী? Container vs VM"
titleEn: "What is Docker? Container vs VM"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি প্রতিদিন অফিসে tiffin বক্স নিয়ে যাও। সেই tiffin বক্সের মধ্যে কী আছে? ভাত, তরকারি, চামচ, এমনকি একটা ছোট্ট ন্যাপকিন — সব কিছু একসাথে, sealed করা। তুমি বাসায় বাক্স বন্ধ করো, অফিসে গিয়ে খোলো — সব হুবহু একই থাকে। রান্নাঘর কোথায় ছিল, গরম না ঠান্ডা, কিছুই ব্যাপার না। Container ঠিক এরকম — তোমার app, তার dependencies, configuration, সব কিছু একটা sealed বাক্সে বন্ধ। তুমি যেকোনো machine-এ সেই বাক্স খোলো, app হুবহু একইভাবে চলবে।

এখন ভাবো, VM মানে কী? VM মানে হলো পুরো রান্নাঘর তুলে নিয়ে যাওয়া — চুলা, ফ্রিজ, কাউন্টার, এমনকি রান্নাঘরের দেওয়াল পর্যন্ত! তুমি অফিসে যেতে চাও, কিন্তু সাথে নিয়ে যাচ্ছো পুরো রান্নাঘর। এটা physically কতটা কঠিন, ভাবো একটু। VM-এ পুরো একটা OS উঠে — Windows-এর মধ্যে আরেকটা Linux, সেই Linux-এর নিজের kernel, driver, সব কিছু। এটা boot হতে মিনিট লাগে, জায়গা নেয় GB-তে। Container শুধু tiffin বক্স — host machine-এর রান্নাঘর (OS kernel) ব্যবহার করে, শুধু নিজের খাবারটুকু নিয়ে আসে। Boot হয় সেকেন্ডে, জায়গা নেয় MB-তে।

এই tiffin বক্সের idea থেকেই Docker-এর জন্ম। তুমি কি কখনো বলেছো বা শুনেছো — "আমার machine-এ তো ঠিকঠাক চলছিল!"? এই classic সমস্যাটাই Docker চিরতরে শেষ করে দেয়। তোমার machine-এ যা চলে, production server-এ ঠিক তাই চলবে, teammate-এর laptop-এ ঠিক তাই চলবে। ঠিক এভাবেই Docker কাজ করে!

---

## Concept

### Container vs Virtual Machine: আসল পার্থক্য

প্রথমে একটা comparison table দেখো —

| বিষয়        | Virtual Machine (VM)            | Container                   |
| ------------ | ------------------------------- | --------------------------- |
| OS           | নিজস্ব পুরো OS (kernel সহ)      | Host OS-এর kernel share করে |
| Size         | কয়েক GB                        | কয়েক MB থেকে কয়েকশো MB    |
| Startup time | ১–৫ মিনিট                       | ১–৫ সেকেন্ড                 |
| Isolation    | সম্পূর্ণ আলাদা (hardware level) | Process-level isolation     |
| Performance  | কিছুটা slow (overhead বেশি)     | প্রায় native speed         |
| Use case     | সম্পূর্ণ আলাদা OS দরকার হলে     | App packaging ও deployment  |

**VM কীভাবে কাজ করে?**

VM-এ একটা software থাকে যাকে বলে **Hypervisor** (যেমন VirtualBox, VMware)। এই hypervisor তোমার physical hardware-এর উপরে বসে এবং multiple "virtual hardware" তৈরি করে। প্রতিটা VM মনে করে সে একটা আলাদা physical computer — তার নিজের virtual CPU, RAM, disk আছে। তারপর সেই VM-এর মধ্যে একটা পূর্ণ OS install হয়। এই কারণে VM অনেক ভারী।

```
Physical Hardware
      ↓
  Hypervisor
  ↙       ↘
VM 1       VM 2
(Full OS)  (Full OS)
  App        App
```

**Container কীভাবে কাজ করে?**

Container-এ কোনো আলাদা OS নেই। সব container একই host OS-এর kernel share করে। Linux-এর দুটো feature দিয়ে এটা সম্ভব — **namespaces** (প্রতিটা container-কে মনে করায় সে একা আছে) এবং **cgroups** (CPU/RAM limit করে)। Docker Engine এই দুটো feature ব্যবহার করে isolation তৈরি করে।

```
Physical Hardware
      ↓
   Host OS (Linux kernel)
      ↓
  Docker Engine
  ↙    ↓    ↘
C1    C2    C3   (Containers — শুধু App + dependencies)
```

---

### Docker Architecture: ভেতরে কী আছে?

Docker তিনটা মূল অংশ নিয়ে তৈরি —

**1. Docker Daemon (dockerd)**
এটা background-এ চলা একটা service — একটা engine যে সব কাজ করে। Container তৈরি করা, চালানো, বন্ধ করা — সব কিছু। তুমি সরাসরি daemon-এর সাথে কথা বলো না।

**2. Docker CLI**
তুমি terminal-এ যে `docker` command লেখো, সেটা হলো CLI। CLI তোমার instruction নিয়ে daemon-কে বলে — "এই container চালাও", "এই image download করো"। CLI আর daemon REST API দিয়ে কথা বলে।

**3. Docker Desktop**
Mac বা Windows-এ যারা কাজ করো, তাদের জন্য Docker Desktop একটা GUI app যেটা daemon চালায়, resource দেখায়, এবং container manage করতে দেয়। Linux-এ সরাসরি Docker Engine install করা যায়।

```
তুমি → docker CLI → Docker Daemon (dockerd) → Containers/Images
                         ↕
                    Docker Hub (Registry)
```

---

### Image vs Container: Recipe vs রান্না

এটা বোঝার সবচেয়ে সহজ উপায় হলো OOP-এর analogy —

- **Image** = Class (blueprint, recipe)
- **Container** = Object (running instance, actual রান্না)

একটা image থেকে তুমি যতগুলো চাও container চালাতে পারো। Image নিজে কখনো চলে না — সে শুধু blueprint। Container হলো সেই blueprint থেকে তৈরি, চলমান instance।

আরেকটা analogy: Image হলো রান্নার recipe card। Container হলো সেই recipe দিয়ে রান্না করা খাবার। একই recipe দিয়ে তুমি ১০টা পাতিল রান্না করতে পারো — ১০টা container!

Image-এর মধ্যে থাকে:

- App-এর code
- Runtime (Node.js, Python, Java — যা লাগে)
- Dependencies (npm packages, pip packages ইত্যাদি)
- Configuration files
- Environment variables

---

### Docker Hub: Public Registry

Docker Hub (hub.docker.com) হলো images-এর ভান্ডার — GitHub যেমন code-এর, Docker Hub তেমন images-এর। তুমি এখানে থেকে official images download করতে পারো: `ubuntu`, `node`, `python`, `mysql`, `nginx` — হাজার হাজার ready-made image আছে।

```bash
# Docker Hub থেকে ubuntu image নামিয়ে একটা container চালাও
$ docker run -it ubuntu bash

# hello-world image দিয়ে Docker ঠিকঠাক কাজ করছে কিনা check করো
$ docker run hello-world
```

---

### Core Commands: প্রথম দিনের toolkit

**চলমান container দেখো:**

```bash
$ docker ps
```

এটা দেখাবে কোন কোন container এখন running আছে। Output-এ থাকবে: CONTAINER ID, IMAGE, COMMAND, CREATED, STATUS, PORTS, NAMES।

**সব container দেখো (বন্ধ হয়ে যাওয়াগুলো সহ):**

```bash
$ docker ps -a
```

`-a` মানে "all" — stopped container-গুলোও দেখাবে।

**তোমার কাছে থাকা সব image দেখো:**

```bash
$ docker images
```

এটা দেখাবে: REPOSITORY, TAG, IMAGE ID, CREATED, SIZE।

**একটা container চালাও:**

```bash
$ docker run hello-world
```

Docker প্রথমে locally `hello-world` image খুঁজবে। না পেলে Docker Hub থেকে download (pull) করবে। তারপর সেই image থেকে একটা container তৈরি করে চালাবে।

**Interactive container চালাও (bash terminal সহ):**

```bash
$ docker run -it ubuntu bash
```

`-i` = interactive (stdin খোলা রাখো), `-t` = tty (terminal দাও)। এটা চালালে তুমি সরাসরি ubuntu container-এর ভেতরে ঢুকে যাবে! `exit` লিখলে বের হয়ে আসবে।

---

## Tool Spotlight

**`docker run`** হলো সবচেয়ে বেশি ব্যবহৃত command। এটা একসাথে তিনটা কাজ করে: image না থাকলে **pull** করে, সেটা থেকে container **create** করে, তারপর **start** করে। পরে আলাদাভাবে `docker pull`, `docker create`, `docker start` শিখবে।

---

## Real World

**Netflix এবং 100,000+ Containers**

Netflix-এ প্রতিদিন কোটি কোটি মানুষ stream করে। তাদের platform চালায় 100,000-এরও বেশি container। Docker আসার আগে Netflix-এ একটা নতুন microservice deploy করতে লাগত কয়েকদিন — team-কে manually server configure করতে হতো, OS install করতে হতো, dependencies set up করতে হতো। এখন একটা Docker image build করো, deploy করো — কয়েক মিনিটে হয়ে যায়।

**"Works on My Machine" সমস্যা**

বাংলাদেশের অনেক dev team-এ এই সমস্যা চেনা: developer বলছে "আমার laptop-এ চলছে", কিন্তু production server-এ crash করছে। কারণ? Developer-এর machine-এ Node.js 18, server-এ Node.js 16। অথবা developer Mac-এ, server Linux-এ, আর কোনো dependency-র behaviour আলাদা। Docker এই সমস্যা permanently solve করে — কারণ environment টা নিজেই ship করা হয়। "It works on my machine" → "Then we'll ship your machine (as a container)."

---

## মনে রাখো

- Container, VM-এর মতো পুরো OS চালায় না — host kernel share করে, তাই অনেক হালকা ও দ্রুত
- Image হলো blueprint (recipe), Container হলো সেই blueprint থেকে তৈরি running instance — OOP-এ যেমন class vs object
- `docker run` একাই তিনটা কাজ করে: pull + create + start
- `docker ps` শুধু running container দেখায়; `docker ps -a` বন্ধ হয়ে যাওয়াগুলোও দেখায়
- Docker solve করে "works on my machine" সমস্যা — environment টা app-এর সাথেই package হয়ে যায়
