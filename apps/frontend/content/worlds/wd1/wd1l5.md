---
id: wd1l5
world: wd1
order: 5
title: "Next.js Frontend Dockerize করা"
titleEn: "Dockerize the Next.js Frontend"
estMinutes: 30
type: lesson
---

## গল্প

ধরো তুমি একটা বিশাল printing press-এ কাজ করো। সেখানে আছে মস্ত মস্ত machine, রঙের ড্রাম, কাগজের স্তূপ — সব মিলিয়ে একটা factory। এখন তোমার boss বললো, "এই পোস্টারটা ঢাকার বাইরে চট্টগ্রামে পাঠাতে হবে।" তুমি কি পুরো printing press তুলে ট্রাকে তুলবে? নাকি শুধু ছাপা পোস্টারটা নিয়ে যাবে? অবশ্যই শুধু পোস্টার! Next.js-এর `standalone` output ঠিক এই কাজটাই করে — পুরো `node_modules` factory নিয়ে না গিয়ে, শুধু যা দরকার তাই bundle করে একটা self-contained package বানায়। ফলাফল? ~1GB-এর জায়গায় মাত্র ~200MB-এর একটা চকচকে image।

এখন আরেকটু ভাবো — এই পোস্টারটা কিন্তু ছাপার সময় রঙ বেছে নেওয়া হয়েছিল। ছাপা হয়ে যাওয়ার পর কেউ যদি বলে "আরে, লাল রঙটা নীল করো" — সেটা কি সম্ভব? না! পোস্টার তো ইতিমধ্যে ছাপা হয়ে গেছে। Next.js-এর `NEXT_PUBLIC_` environment variables ঠিক এরকম — এগুলো **build time**-এ ছাপা হয়ে যায়। পরে `docker run -e NEXT_PUBLIC_API_URL=...` দিলে কিছু হবে না, কারণ সেই রঙ আগেই bake হয়ে গেছে! এটা অনেক developer-এর মাথা ঘুরিয়ে দেয়।

Multi-stage build হলো এই পোস্টার তৈরির পুরো process-কে ধাপে ধাপে সাজানো। Stage 1: কারখানায় কাঁচামাল আনো (dependencies install)। Stage 2: কারখানায় কাজ করো, পোস্টার ছাপো (build করো)। Stage 3: শুধু ছাপা পোস্টারটা ব্যাগে ভরে নিয়ে চলো (standalone output দিয়ে পাতলা image)। কারখানার ময়লা, কাটা কাগজের টুকরো — কিছুই সাথে নাও না। ঠিক এভাবেই Docker Next.js কে production-ready করে!

---

## Concept

### Next.js Standalone Output কী?

সাধারণভাবে Next.js build করলে তোমার `node_modules` folder লাগে — এবং সেটা প্রায়ই শত শত MB। কিন্তু `next.config.js`-এ একটা ছোট্ট option যোগ করলে Next.js নিজেই বিশ্লেষণ করে বের করে ঠিক কোন কোন module আসলে লাগবে, এবং সেগুলো `.next/standalone/` folder-এ copy করে।

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

Build করার পর তৈরি হয়:

```
.next/
  standalone/        ← এটাই আমরা Docker-এ নেব
    node_modules/    ← শুধু প্রয়োজনীয় modules (বিশাল node_modules নয়!)
    server.js        ← সরাসরি `node server.js` দিয়ে চালানো যাবে
  static/            ← CSS, JS chunks, images (এটাও লাগবে)
public/              ← Static assets (এটাও লাগবে)
```

|                  | Without Standalone | With Standalone      |
| ---------------- | ------------------ | -------------------- |
| Image size       | ~1 GB              | ~150-250 MB          |
| node_modules     | পুরোটা copy        | শুধু প্রয়োজনীয়     |
| Start command    | `next start`       | `node server.js`     |
| Production ready | হ্যাঁ, কিন্তু ভারী | হ্যাঁ, হালকা ও দ্রুত |

---

### Next.js Dockerfile: তিনটা Stage

```dockerfile
# apps/frontend/Dockerfile

# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# package.json এবং lock file কপি করো
COPY package.json package-lock.json* ./

# শুধু production dependencies install করো (dev dependencies বাদ)
RUN npm ci

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Stage 1 থেকে node_modules নিয়ে আসো
COPY --from=deps /app/node_modules ./node_modules

# সব source code কপি করো
COPY . .

# NEXT_PUBLIC_ variables build time-এ দিতে হবে — এখানেই!
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build করো (standalone output তৈরি হবে)
RUN npm run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user তৈরি করো (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output কপি করো
COPY --from=builder /app/.next/standalone ./

# Static files কপি করো (CSS, JS chunks)
COPY --from=builder /app/.next/static ./.next/static

# Public folder কপি করো (images, fonts, etc.)
COPY --from=builder /app/public ./public

# nextjs user হিসেবে চালাও (root নয়!)
USER nextjs

EXPOSE 3000

# node server.js দিয়ে সরাসরি চালাও — next start নয়!
CMD ["node", "server.js"]
```

প্রতিটা Stage কেন আলাদা?

- **deps stage**: শুধু `package.json` আর `package-lock.json` copy করে install করে। Source code change হলেও এই layer cache থেকে আসবে — build অনেক দ্রুত হবে।
- **builder stage**: সব source code copy করে build করে। `ARG`/`ENV` দিয়ে `NEXT_PUBLIC_` variable inject করে।
- **runner stage**: মাত্র `.next/standalone`, `.next/static`, আর `public` — বাকি সব বাদ! Final image হবে সবচেয়ে ছোট।

---

### NEXT*PUBLIC* Variables: সবচেয়ে Common ভুল

এটা খুব ভালো করে বোঝো কারণ এই ভুল অনেক experienced developer-ও করে।

**Next.js-এর দুই ধরনের environment variable:**

| Type            | Example               | কখন available  | কোথায় কাজ করে                                    |
| --------------- | --------------------- | -------------- | ------------------------------------------------- |
| Server-only     | `DATABASE_URL`        | Runtime        | শুধু server-side (getServerSideProps, API routes) |
| Public (client) | `NEXT_PUBLIC_API_URL` | **Build time** | Browser-এও, Server-এও                             |

`NEXT_PUBLIC_` prefix থাকলে Next.js সেই value-টা build করার সময় JavaScript bundle-এর মধ্যে **hardcode** করে দেয়। Browser-এ পাঠানো JS file-এর ভেতরে সেই value বসিয়ে দেয়।

```
// Build এর আগে তোমার code:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`)

// Build এর পরে browser-এ যা যায়:
fetch("http://localhost:3001/api/lessons")  ← value টা direct bake হয়ে গেছে!
```

**ভুল পদ্ধতি (কাজ করবে না!):**

```bash
# এটা runtime-এ দিলে NEXT_PUBLIC_ variable-এ কোনো effect নেই!
$ docker run -e NEXT_PUBLIC_API_URL=http://production-api.com learning-platform-frontend
```

**সঠিক পদ্ধতি (build time-এ দিতে হবে):**

```bash
$ docker build \
  -f apps/frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://production-api.com \
  -t learning-platform-frontend \
  .
```

---

### এই Platform-এর Frontend Build ও Run করা

**Step 1: Build করো**

Project root থেকে চালাও:

```bash
$ docker build -f apps/frontend/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 -t learning-platform-frontend .
```

Flag গুলো কী করছে:

- `-f apps/frontend/Dockerfile` — কোন Dockerfile ব্যবহার করবে
- `--build-arg NEXT_PUBLIC_API_URL=http://localhost:3001` — build time variable inject করছে
- `-t learning-platform-frontend` — image-এর নাম দিচ্ছে
- `.` — build context (পুরো project root)

**Step 2: চালাও**

```bash
$ docker run -p 3000:3000 learning-platform-frontend
```

এখন `http://localhost:3000` খোলো — frontend চলছে!

**PORT variable:**

Next.js-এ `PORT` environment variable runtime-এ দেওয়া যায় (এটা `NEXT_PUBLIC_` নয়, তাই runtime-এ কাজ করে):

```bash
$ docker run -p 8080:4000 -e PORT=4000 learning-platform-frontend
```

---

### `.dockerignore` — ভুলে যেও না

`apps/frontend/.dockerignore` file তৈরি করো:

```
node_modules
.next
.env*.local
*.md
.git
```

এটা না থাকলে `COPY . .` করার সময় তোমার local `node_modules` (যা GB-তে) Docker build context-এ ঢুকে পড়বে — build অনেক slow হবে!

---

## Tool Spotlight

**`--build-arg`** হলো Dockerfile-এর `ARG` instruction-এ value পাস করার উপায়। Regular `-e` flag শুধু container runtime-এ environment variable দেয়, কিন্তু `--build-arg` দেয় **build process চলাকালীন**। `NEXT_PUBLIC_` variables-এর জন্য এটাই একমাত্র সঠিক উপায়।

---

## Real World

**Vercel বনাম Self-Hosted Docker**

Vercel-এ deploy করলে `NEXT_PUBLIC_` variables Vercel dashboard-এ দেওয়া যায় এবং Vercel নিজেই build করে। কিন্তু তুমি যখন Docker দিয়ে self-host করো (DigitalOcean, AWS EC2, নিজের VPS), তখন build time variable-এর এই behavior অনেকেই জানে না। একটা real incident: একটা Bangladeshi startup-এর developer production deploy করলেন Docker দিয়ে। Frontend লোড হলো, কিন্তু API call কোনোটাই কাজ করছে না। Browser DevTools-এ দেখলেন সব request যাচ্ছে `http://localhost:3001` তে — development URL! কারণ তিনি `docker run -e NEXT_PUBLIC_API_URL=https://api.myapp.com` দিয়েছিলেন, `--build-arg` দেননি। Image rebuild করে `--build-arg NEXT_PUBLIC_API_URL=https://api.myapp.com` দিতেই সব ঠিক হয়ে গেল। দুই ঘণ্টার debugging, একটা flag-এর অজ্ঞতায়!

**Image Size-এর ব্যবধান**

একটা production team standalone output ছাড়া Next.js Dockerize করেছিল — image size ছিল 1.1 GB। Kubernetes cluster-এ নতুন pod deploy হতে লাগত 3-4 মিনিট কারণ প্রতিবার এই বিশাল image pull করতে হতো। `output: "standalone"` যোগ করার পর image নামল 190 MB-তে — deploy time হলো 25 সেকেন্ড। Auto-scaling অনেক দ্রুত হলো, cost কমল।

---

## মনে রাখো

- `next.config.js`-এ `output: "standalone"` দিলে `.next/standalone/` তৈরি হয় — `node server.js` দিয়ে সরাসরি চালানো যায়, আলাদা `node_modules` লাগে না
- `NEXT_PUBLIC_` variables **build time**-এ bake হয়ে যায় — `docker run -e` দিলে কাজ করবে না, `docker build --build-arg` দিতে হবে
- Multi-stage build-এ final `runner` stage-এ শুধু `.next/standalone`, `.next/static`, আর `public` folder copy করো — বাকি সব বাদ
- Standalone output ছাড়া Next.js image ~1 GB, standalone দিয়ে ~150-250 MB — প্রায় 5 গুণ ছোট!
- `.dockerignore`-এ `node_modules` আর `.next` যোগ করতে ভুলো না — নইলে build context বিশাল হয়ে যাবে
