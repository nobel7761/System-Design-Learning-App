---
id: wd0l6
world: wd0
order: 6
title: "Docker Networks — Container কীভাবে কথা বলে?"
titleEn: "Docker Networks — How Containers Communicate"
estMinutes: 30
type: lesson
---

## গল্প

ঢাকার কথা চিন্তা করো — Gulshan-এ একটা গেটেড পাড়া। পাড়ার ভেতরে যে বাড়িগুলো আছে, তারা একে অপরকে সরাসরি ডাকতে পারে: "আরে রহিম ভাই, একটু আসো তো!" — নাম ধরে ডাকলেই হয়। গেটের security জানে সবাইকে, পাড়ার রাস্তা ধরে হেঁটেই যাওয়া যায়। কিন্তু বনানীর অন্য পাড়ার করিম সাহেবের সাথে কথা বলতে হলে? তখন মূল রাস্তায়, গেটের বাইরে বের হতে হবে, অথবা ফোন করতে হবে একটা নির্দিষ্ট নম্বরে — সরাসরি গেট টপকে যাওয়ার কোনো উপায় নেই।

Docker network ঠিক এই গেটেড পাড়ার মতো। প্রতিটা `docker network create` মানে একটা নতুন গেটেড পাড়া বানানো। সেই পাড়ায় যে container-গুলো রাখো, তারা নিজেদের মধ্যে শুধু নাম ধরে কথা বলতে পারে — কোনো ফোন নম্বর (IP address) লাগে না, port mapping লাগে না। `web` container সরাসরি বলতে পারে "আমি `db`-র সাথে কথা বলবো", আর Docker-এর নিজস্ব DNS সেই নাম চিনে নেয় মুহূর্তেই। এটা যেন পাড়ার ভেতরের দারোয়ান জানে কোন বাড়িতে কে থাকে।

আর বাইরের জগৎ, মানে তোমার browser বা বাইরের কোনো user, এই পাড়ার ভেতরে সরাসরি ঢুকতে পারে না। তার জন্য গেটে একটা নির্দিষ্ট দরজা খুলে দিতে হয় — সেটাই `-p 3000:3000` port mapping। তুমি বলছো: "আমার পাড়ার `web` বাড়ির ৩০০০ নম্বর ঘরে যেতে হলে, বাইরের রাস্তার ৩০০০ নম্বর গেট দিয়ে আসো।" কিন্তু পাড়ার ভেতরে `web` আর `db` নিজেদের মধ্যে কথা বলতে এই গেটের কোনো দরকারই নেই। ঠিক এভাবেই Docker Networks কাজ করে!

## Concept

### Docker Network কী এবং কেন?

Container-গুলো by default একে অপরের থেকে isolated। কিন্তু real-world app-এ web server-কে database-এর সাথে কথা বলতে হবে, cache-এর সাথে কথা বলতে হবে। Docker network এই যোগাযোগের রাস্তা বানিয়ে দেয় — নিরাপদে, নিয়ন্ত্রিতভাবে।

### তিন ধরনের Network Driver

| Driver   | কাজ                                                            | কখন ব্যবহার                                                       |
| -------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `bridge` | Default। একই host-এ container-দের মধ্যে virtual network বানায় | ৯৯% use case — local dev, production container comms              |
| `host`   | Container আর host একই network share করে, আলাদা কোনো layer নেই  | Linux-only। Ultra-low latency দরকার হলে                           |
| `none`   | কোনো network নেই — সম্পূর্ণ isolated                           | Security-sensitive batch job, যেটার network access-ই থাকা উচিত না |

**Host driver সতর্কতা:** `host` driver macOS বা Windows-এ কাজ করে না — শুধু Linux। Production-এ Linux server-এ চলে, তাই সেখানে valid। কিন্তু local dev-এ (Mac/Windows) ব্যবহার করতে গেলে container চলবে কিন্তু port কাজ করবে না।

### Default Bridge vs User-Defined Bridge — সবচেয়ে গুরুত্বপূর্ণ পার্থক্য

এখানে একটা **মহা ফাঁদ** আছে যেখানে নতুনরা প্রায়ই পড়ে:

| বিষয়            | Default Bridge (`docker0`)      | User-Defined Bridge                       |
| ---------------- | ------------------------------- | ----------------------------------------- |
| Container DNS    | নেই! শুধু IP দিয়ে কথা বলতে হয় | আছে! Container name দিয়েই reach করা যায় |
| Isolation        | সব container এক জায়গায়        | আলাদা network = আলাদা পাড়া               |
| Dynamic connect  | ঝামেলা আছে                      | `docker network connect` দিয়ে সহজে       |
| Production-ready | না                              | হ্যাঁ                                     |

`docker run` করলে কোনো `--network` না দিলে container যায় default bridge-এ। সেখানে দুটো container-এর মধ্যে কথা বলাতে হলে IP address জানতে হবে, আর container restart করলে IP বদলায়! তাই সবসময় user-defined network বানাও।

### Command-গুলো হাতে-কলমে

**Network বানাও:**

```bash
$ docker network create mynet
```

এটা একটা user-defined bridge network বানাবে `mynet` নামে।

**সব network দেখো:**

```bash
$ docker network ls
```

Output দেখতে এরকম:

```
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5f6   bridge    bridge    local
7g8h9i0j1k2l   host      host      local
3m4n5o6p7q8r   mynet     bridge    local
9s0t1u2v3w4x   none      null      local
```

**Network-এর ভেতরে কী আছে দেখো:**

```bash
$ docker network inspect mynet
```

এটা JSON output দেবে — কোন container-গুলো এই network-এ আছে, তাদের IP কী, subnet কী — সব।

**Container চালাও নির্দিষ্ট network-এ:**

```bash
$ docker run --network mynet --name db mongo
$ docker run --network mynet --name web -p 3000:3000 myapp
```

এখন `web` container থেকে database connect করতে URL হবে:

```
mongodb://db:27017
```

`db` মানে container-এর নাম — কোনো IP না, কোনো localhost না। Docker-এর built-in DNS এই নাম resolve করে দেয় automatically!

**Running container-কে network-এ জোড়াও/বিচ্ছিন্ন করো:**

```bash
$ docker network connect mynet mycontainer
$ docker network disconnect mynet mycontainer
```

### Port Mapping (-p) — বাইরের জন্য দরজা

```bash
$ docker run -p 3000:3000 myapp
```

এখানে format হলো `-p <host_port>:<container_port>`।

- **Container port:** Container-এর ভেতরে app যে port-এ চলছে (3000)
- **Host port:** তোমার laptop বা server-এর যে port-এ বাইরে থেকে access করা যাবে (3000)

**গুরুত্বপূর্ণ:** Port mapping শুধু বাইরে থেকে access-এর জন্য। একই network-এর দুটো container একে অপরের সাথে কথা বলতে `-p` লাগে না — container name দিয়েই হয়।

```bash
# ভুল ধারণা: db-কে expose করতে হবে বলে -p দিলাম
$ docker run --network mynet --name db -p 27017:27017 mongo  # শুধু দরকার যদি host থেকে access চাও

# সঠিক: internal communication-এ -p দরকার নেই
$ docker run --network mynet --name db mongo  # web container এই db-কে চিনবে নাম দিয়েই
```

### Container DNS কীভাবে কাজ করে?

User-defined bridge network-এ Docker একটা built-in DNS server চালায়। যখন `web` container থেকে `db` নামে request যায়, Docker এই DNS server সেই নাম-কে `db` container-এর internal IP-তে translate করে দেয়। Container restart হলে IP বদলাতে পারে, কিন্তু নামটা একই থাকে — তাই DNS-based communication সবসময় কাজ করে।

## Tool Spotlight

**`docker network inspect`** হলো সবচেয়ে দরকারী debugging tool। Connection কাজ না করলে এই command দিয়ে দেখো কোন container কোন network-এ আছে, তাদের IP কী। `docker network inspect mynet` run করলে JSON-এ `"Containers"` section-এ দেখবে কারা এই network-এ আছে এবং কী IP পেয়েছে।

## Real World

**ঘটনা ১ — "Localhost ফাঁদ":** এটা এত common ভুল যে প্রায় প্রতিটা নতুন Docker user এতে পড়ে। কেউ তার Node.js app-এ database URL দিলো `mongodb://localhost:27017`। Local machine-এ (Docker ছাড়া) চলতো ঠিকঠাক। Docker-এ দুটো container-এ চালানোর পর? `connection refused`। কারণটা সহজ — container-এর ভেতরে `localhost` মানে সেই container নিজেই, অন্য container না! `db` container-কে reach করতে হলে URL হতে হবে `mongodb://db:27017` — container name দিয়ে। এই ভুলটা fix করতে stack overflow-এ ঘণ্টার পর ঘণ্টা নষ্ট হয়।

**ঘটনা ২ — Docker Compose-এ automatic network:** Production-এ Docker Compose ব্যবহার করলে সুখবর হলো এই network বানানোর কাজটা Compose নিজেই করে। `docker-compose.yml`-এ define করা সব service automatically একটা default network-এ থাকে, আর service name দিয়েই একে অপরকে reach করতে পারে। এই কারণেই Compose files-এ `db`, `redis`, `web` নাম দিয়ে কাজ হয়ে যায় — Docker Networks-এর শক্তিটা আড়ালে কাজ করছে।

## মনে রাখো

- User-defined bridge network বানাও সবসময় — default bridge-এ container DNS কাজ করে না।
- একই network-এ থাকলে container name দিয়েই reach করো — `http://db:5432`, `mongodb://db:27017`। কোনো IP বা localhost না।
- Port mapping (`-p`) শুধু বাইরের জগৎ থেকে access-এর জন্য — internal container communication-এ লাগে না।
- `localhost` container-এর ভেতরে মানে সেই container নিজেই — এই ভুলটা মনে গেঁথে রাখো।
- `docker network inspect <name>` দিয়ে যেকোনো networking সমস্যা debug শুরু করো — কোন container কোথায় আছে দেখাবে।
