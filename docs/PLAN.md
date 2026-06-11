# System Design Academy — Full Product & Build Plan

> A strict, gamified, single-user learning platform that teaches system design to the owner
> (a software developer, treated as a complete beginner) in 30-minute sessions, 4 days/week.
> Content synthesized from 7 GitHub repos — see `docs/research/github-repos-research.md`.
> All lesson content must be ORIGINAL writing (ByteByteGo repo is CC BY-NC-ND).

---

## 1. Core Product Principles

1. **Zero decisions on login.** The dashboard always answers one question: _"আজ আমি কী শিখবো?"_
   One big "Start Today's Session" button. The app decides everything else.
2. **ELI5 teaching.** Every lesson opens with a real-life story/analogy (post office = message queue,
   restaurant waiter = load balancer), then the concept, then the real tool (Redis, Kafka…), then a
   real company example, then games.
3. **Strict progression.** Linear, locked path. No skipping. Quiz gate ≥ 80% to complete a lesson.
   Boss exam ≥ 75% to unlock the next World. Review queue must be cleared before a new lesson opens.
4. **Everything visible.** Full syllabus, what's done, what's current, what's locked, % progress,
   streak, time invested — all one click away, always.
5. **30-minute session contract.** Every session is designed to fit exactly ~30 minutes.

---

## 2. The 30-Minute Daily Session Loop

| Phase             | Time   | What happens                                                                                                |
| ----------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| 1. Warm-up Review | 5 min  | SRS flashcards due today (SM-2 algorithm). MUST be cleared to proceed.                                      |
| 2. Lesson         | 15 min | Story/analogy → concept (ELI5) → tool deep-dive → real company example → diagram                            |
| 3. Game/Quiz      | 8 min  | 6–10 questions, mixed game formats + mixed difficulty (see §5). Pass ≥ 80% or retry with shuffled variants. |
| 4. Wrap-up        | 2 min  | XP awarded, streak updated, "next session preview" teaser, new flashcards auto-added to SRS deck            |

Design Dojo sessions (Worlds 5–7) replace phases 2–3 with guided design steps (see §4).

---

## 3. Curriculum: 8 Worlds, ~120 sessions, ~30 weeks (4 sessions/week)

Narrative frame: **"Tumi ekta startup banaccho"** — the learner grows an imaginary app
(call it "GolpoGram") from 1 user to millions, mirroring primer's `scaling_aws` solution.
Each World = a stage of the startup's growth.

### World 0 — ইন্টারনেটের গল্প (Internet Fundamentals) — 8 sessions

1. Internet asole ki? (packets, ISP, routers — postal system analogy)
2. DNS — internet er phonebook
3. IP, TCP vs UDP (registered post vs throwing letters analogy)
4. HTTP — web er bhasha (methods, status codes)
5. HTTPS, SSL handshake (sealed envelope analogy)
6. Cookies, Sessions, JWT (movie ticket / hand-stamp analogy)
7. API & REST — restaurant menu analogy
8. **BOSS: "What happens when you type google.com?"** — full sequencing exam

- Sources: ByteByteGo Computer Fundamentals + Security sections; primer Communication section

### World 1 — প্রথম Server (Building Blocks) — 8 sessions

1. Client-server, GolpoGram launches on 1 server (vertical vs horizontal scaling)
2. Load Balancer (restaurant host analogy) + L4 vs L7 + algorithms; **Tool: Nginx**
3. Reverse Proxy vs API Gateway vs LB
4. CDN — push vs pull (warehouse-near-customer analogy)
5. Caching fundamentals (fridge vs bazaar analogy); **Tool: Redis deep-dive part 1**
6. Caching strategies: cache-aside, write-through, write-behind, refresh-ahead; **Redis part 2**
7. Cache eviction (LRU/LFU/TTL) + cache problems (stampede, miss attack); **Tool: Memcached vs Redis**
8. **BOSS: GolpoGram hits 10K users** — architecture assembly exam

- Sources: primer CDN/LB/cache sections; ByteByteGo Caching & API sections

### World 2 — Database রাজ্য — 10 sessions

1. RDBMS & ACID (bank vault analogy); **Tool: PostgreSQL**
2. Indexing & B-trees (boi er index analogy)
3. NoSQL types: KV, document, wide-column, graph; **Tools: MongoDB, Cassandra, Neo4j overview**
4. SQL vs NoSQL — kobe konta? (BASE vs ACID)
5. Replication: master-slave, master-master, sync vs async, failover, split brain
6. Sharding & partitioning (library shelf analogy), hot spots
7. Consistent Hashing (round dinner table analogy)
8. LSM-tree vs B-tree, SSTables, Bloom filters (DDIA ch 3)
9. Transactions & isolation levels (dirty reads, phantom reads — DDIA ch 7, simplified)
10. **BOSS: GolpoGram's database melts at 100K users** — fix-the-architecture exam

- Sources: DDIA ch 1–7 notes; primer Database section; ByteByteGo Database section

### World 3 — Distributed দুনিয়া — 10 sessions

1. CAP theorem (3 friends promise analogy) + PACELC intro
2. Consistency patterns: strong vs eventual (bank vs Facebook likes)
3. Message Queues (post office analogy); **Tool: RabbitMQ**
4. **Tool: Kafka deep-dive part 1** (log, topics, partitions, why fast)
5. **Kafka part 2** (consumer groups, offsets, delivery semantics, can it lose messages?)
6. Pub/Sub vs queues, fan-out, push vs pull
7. Idempotency & exactly-once (double payment problem)
8. CDC & Event Sourcing (bank ledger analogy)
9. Consensus, quorum, leader election (village panchayat analogy); **Tools: ZooKeeper, etcd, Raft visual**
10. **BOSS: GolpoGram goes multi-region, 1M users** — distributed exam

- Sources: DDIA ch 5–9, 11; ByteByteGo Database/Cloud sections; awesome-scalability messaging links

### World 4 — Reliability & আন্দাজের খেলা (Estimation) — 8 sessions

1. Availability: the nines, SLA/SLO, failover patterns
2. Rate Limiting (token bucket — bus ticket counter analogy)
3. Circuit Breakers, timeouts, retries with backoff (electrical fuse analogy)
4. Monitoring & observability: logging, tracing, metrics; **Tools: ELK, Prometheus/Grafana concept**
5. Latency numbers every programmer should know — estimation game session
6. Back-of-the-envelope math: powers of 2, QPS, storage estimation drills
7. Resiliency patterns recap + chaos engineering story (Netflix Chaos Monkey)
8. **BOSS: Estimation exam + outage simulation** (GolpoGram survives a viral spike)

- Sources: primer appendix tables; awesome-scalability Availability/Stability; ashishps1 concepts

### World 5 — Design Dojo: Easy — 20 sessions (10 problems × 2)

Problems (ashishps1 Easy tier): URL Shortener · Autocomplete · Load Balancer ·
CDN design · Parking Garage · Vending Machine · Distributed KV Store · Distributed Cache ·
Auth System · Notification basics

- Session A (guided): requirements → estimation → API → data model → high-level diagram, step-by-step with hints
- Session B (compare & quiz): model solution reveal, diff vs learner's choices, trade-off quiz
- Uses the 4-step primer framework throughout

### World 6 — Design Dojo: Medium — 24 sessions (12 problems × 2)

Picked from ashishps1 Medium tier: WhatsApp · Instagram · Twitter feed · YouTube/Netflix ·
Spotify · Rate Limiter · Notification Service · Job Scheduler · Kafka-like queue ·
Payment System · E-commerce (Amazon) · Google Search basics

- Same A/B format + each problem pairs with a real company case study
  ("EVCache at Netflix", "Discord stores trillions of messages") from awesome-scalability

### World 7 — Hard Mode + Mock Interviews — ~20 sessions

- 6 hard problems × 2 sessions: Uber · Google Docs · Google Maps · Dropbox · Web Crawler · S3
- 8 timed mock interview sessions (30-min adapted format from weeeBox template):
  5 min requirements → 10 min high-level → 12 min deep dive → 3 min self-grade via Signal Checklist
- Final graduation exam

**Total: ~118 sessions ≈ 30 weeks ≈ 7.5 months at 4 days/week.**

---

## 4. Dashboard (post-login home) — the "zero decision" screen

```
┌──────────────────────────────────────────────────────────────────┐
│  🔥 Streak: 12   ⭐ Level 7 (2,340 XP)   📅 Week 3/4   👋 Last     │
│                                          login: Tue 9:12 PM      │
├──────────────────────────────────────────────────────────────────┤
│  আজকের Session  —  World 2 · Lesson 6                             │
│  "Sharding & Partitioning — library shelf analogy"                │
│  ⏱ ~30 min   |   📇 7 flashcards due first                        │
│            [ ▶  START TODAY'S SESSION ]                           │
├───────────────────────────┬──────────────────────────────────────┤
│  World Map (progress)     │  This Week        Mon ✅ Tue ✅       │
│  W0 ✅ W1 ✅ W2 ▓▓▓░ 60%   │                   Wed ✅ Thu ⬜       │
│  W3 🔒 W4 🔒 W5 🔒 ...      │  Total: 38/118 sessions (32%)       │
├───────────────────────────┼──────────────────────────────────────┤
│  📈 Analytics snapshot     │  🗓 Activity Heatmap (GitHub-style)   │
│  Avg quiz: 84%            │  ▪▪▪▫▪▪▫▪▪▪▪▫▪▪ (last 12 weeks)      │
│  Hardest topic: Sharding  │  Total time: 19h 30m                 │
│  E 92% · M 81% · H 64%    │  Logins: 41 · Missed days: 3         │
├───────────────────────────┴──────────────────────────────────────┤
│  📝 Recent Notes (2)      📖 Dictionary (search…)    🏆 Badges    │
│  📚 Full Syllabus         📇 Review Deck (7 due)     ⚔ Boss Log   │
└──────────────────────────────────────────────────────────────────┘
```

Dashboard widgets (everything visible on login):

- **Today card** — today's lesson + flashcards due + START button (the hero)
- **Streak / Level / XP / weekly 4-day tracker**
- **Login & activity tracking** — last login, total logins, GitHub-style activity heatmap, total time invested, missed days
- **Analytics snapshot** — avg quiz score, accuracy by difficulty (Easy/Medium/Hard), weakest topics (from wrong answers), XP curve sparkline
- **World map** with % per world
- **Recent notes** (last 2-3, click to open notebook)
- **Dictionary quick-search** bar
- **Badges + boss history** shortcuts

Key screens:

- `/` Dashboard (above)
- `/syllabus` — all 8 worlds expanded: every lesson with ✅ done / ▶ current / 🔒 locked, est. time, score earned
- `/session` — the daily 4-phase player (review → lesson → game → wrap-up)
- `/review` — standalone SRS deck (optional extra practice, doesn't unlock anything)
- `/dictionary` — glossary of all terms (see §6.1)
- `/notes` — Notion-style notebook (see §6.2)
- `/dojo/[problemId]` — design problem player with step-by-step canvas
- `/mock` — timed mock interview mode with phase countdown + signal checklist
- `/progress` — full analytics: sessions/week, XP curve, accuracy by difficulty over time, weakest topics, time invested, login history
- `/badges` — achievements

---

## 5. Gamification System

**XP & Levels:** lesson complete = 50 XP · perfect quiz = +20 · boss win = 200 · streak bonus ×1.5 after 7 days.
Levels titled by narrative: "Intern" → "Junior Engineer" → … → "Distinguished Architect".

**Question difficulty system:** every question in a lesson's bank is tagged `easy | medium | hard`.

- XP per correct answer scales: easy = 5, medium = 10, hard = 20
- Lesson quiz mix shifts as the course progresses: Worlds 0–1 → 50% E / 35% M / 15% H;
  Worlds 2–4 → 35% E / 40% M / 25% H; Dojo worlds → 20% E / 45% M / 35% H
- Boss exams: medium + hard only
- Adaptive nudge: 3 corrects in a row at a difficulty → next question steps up; a miss steps down
- Analytics tracks accuracy per difficulty (E/M/H) so the dashboard can show "Hard questions accuracy: 64%"
- Wrong hard questions generate flashcards at higher review priority

**Game formats (rotate per session):**

1. **Quick-fire MCQ** — classic, with explanation after each answer
2. **Sequence Puzzle** — drag steps into order ("how HTTPS works", "VISA swipe flow", "google.com flow")
3. **Matching Pairs** — concept↔analogy, company↔technology ("Discord → Cassandra", "Twitter → Manhattan")
4. **This-or-That** — rapid trade-off rounds (CP or AP? SQL or NoSQL? push or pull CDN?) with scenario text
5. **Estimation Slider** — guess latency numbers / QPS within tolerance (World 4 specialty)
6. **Architecture Builder** — drag components (LB, cache, DB, queue) onto a canvas to satisfy a scenario; rule-based validation (boss exams + dojo)
7. **Bug Hunt** — shown a flawed architecture, click the problem ("no LB = SPOF!")
8. **True/False speed round** — 60-second myth-busting

**Strict rules engine:**

- Review queue due → new lesson locked until cleared
- Quiz < 80% → lesson incomplete; retry serves shuffled/alternate questions
- Boss < 75% → next world locked; boss retake available next session (not same day)
- Wrong answers auto-generate extra flashcards into the SRS deck
- Streak: counts study days; goal = 4/week; 1 "freeze" token earned per perfect week
- Session > ~35 min → gentle "shesh koro" nudge (timebox respected, never punished)

**Badges (samples):** First Blood (lesson 1) · Cache Money (World 1 boss) · Shard Lord (World 2) ·
Kafkaesque (Kafka lessons perfect) · The Estimator (latency game 100%) · Unbreakable (30-day streak) ·
Architect (graduation).

---

## 6. Knowledge Tools

### 6.1 Dictionary (অভিধান) — `/dictionary`

A glossary of every system design term, pre-seeded AND user-extendable.

- **Pre-seeded entries** (authored with the content, ~300+ terms): every term from the lessons'
  "Mone Rakho" sections + research file (CAP, quorum, write skew, bloom filter, p99, backpressure…)
- Entry shape: term · ELI5 definition (Bengali-friendly) · real-life analogy · example ·
  related terms (linked) · which lesson teaches it (deep link) · external "go deeper" link
- **Save from lesson:** any highlighted keyword inside a lesson shows a "📖 Save to Dictionary" popover —
  one tap bookmarks it (or creates a personal entry if it's not pre-seeded)
- **Personal entries:** user can add their own terms/definitions, and add personal notes on any
  pre-seeded entry
- Search-as-you-type, A–Z browse, filter by world/topic, "My saved words" tab
- Any entry → "Make flashcard" button (feeds the SRS deck)

### 6.2 Notes — `/notes` (Notion + Google Docs style)

- Block-based rich text editor (**Tiptap**): headings, lists, todo checkboxes, code blocks, tables,
  images, callouts — Notion-like slash (`/`) commands
- Two kinds of notes:
  1. **Lesson notes** — a notes panel can be opened side-by-side _inside any lesson/session_;
     auto-linked to that lesson, resurfaces whenever the lesson or its review cards appear
  2. **Free notebooks** — standalone pages organized in folders (Google Docs style doc list:
     title, last edited, search)
- `@`-mention linking: type `@sharding` to link a dictionary term or lesson inside a note
- Full-text search across all notes; recent notes widget on dashboard
- Autosave; export a note as Markdown

## 7. Content Model

Each lesson is an MDX/JSON content file:

```
content/
  worlds/<world>/<lesson>.mdx        # frontmatter: id, title, world, order, estMinutes, flashcards[], quiz[]
  problems/<problem>.json            # dojo steps, hints, model solution, rubric
  decks/                             # seed flashcards per world
```

Lesson MDX structure (every lesson, enforced):

1. `## Golpo` — real-life analogy story (2-3 paragraphs, Bengali-friendly)
2. `## Concept` — ELI5 explanation with original Mermaid/SVG diagram
3. `## Tool Spotlight` — when applicable: what the tool is, why it exists, 1 config/code taste, who uses it
4. `## Real World` — 1-2 company case studies (linked to engineering blogs from awesome-scalability)
5. `## Mone Rakho` — 3-5 bullet summary (becomes flashcards + dictionary seed terms)
6. Quiz bank: 12-18 questions, each tagged by game format AND difficulty (`easy|medium|hard`);
   only 6-10 served per attempt following the world's difficulty mix → retries differ

Language: Bengali narrative + English technical terms (matching how the user communicates).
All content original (license-safe); deep-dive links point out to the source repos/blogs.

---

## 8. Tech Stack, Hosting & Architecture

**The existing Turborepo monorepo IS the app** (decided 2026-06-12 — do not scaffold anything new):

```
apps/frontend   Next.js 14 (App Router) + TS + Tailwind v4 + shadcn (src/components/shared)
apps/backend    NestJS 10 + Mongoose → MongoDB Atlas (already connected via MONGODB_URI)
turbo.json      pnpm workspaces + turborepo task pipeline, husky + lint-staged
```

- **Backend: NestJS** (`apps/backend`) — all business logic lives here: auth, quiz grading,
  SM-2 scheduling, XP/streak/locking rules engine, analytics aggregation, notes/dictionary CRUD.
  Follow the `nestjs-best-practices` skill strictly; the existing `users` module is the
  structural pattern (module/controller/service/dto/schemas).
- **Database: MongoDB Atlas + Mongoose** (already wired). Documents fit this domain well
  (lesson progress, flashcards, Tiptap JSON notes).
- **Frontend: Next.js 14** (`apps/frontend`) — UI only; talks to NestJS via axios
  (`NEXT_PUBLIC_API_URL`, existing `src/lib/api` + `src/hooks/api` patterns).
  Follow `shared-ui-components` (everything from `src/components/shared`, shadcn primitives in
  `shared/shadcn`) and `thin-page-files` (route files only compose components).
- **Auth:** NestJS JWT (passport-jwt) — single user; login endpoint issues JWT, frontend axios
  interceptor attaches it; `LoginLog` recorded server-side for the activity tracker.
- **Hosting:**
  - Frontend → **Vercel** (user's plan, perfect fit)
  - Backend → NestJS is a long-running server, so it deploys to **Railway or Render** (free tier),
    NOT Vercel; frontend points `NEXT_PUBLIC_API_URL` at it. CORS configured for the Vercel domain.
  - Database → MongoDB Atlas free tier (already provisioned)
- **Content:** lesson MDX files live in `apps/frontend/content/`, compiled/rendered by Next.js;
  quiz banks, flashcard seeds, and dictionary seed terms live as JSON and are upserted into Mongo
  by a backend seed script (runs idempotently on deploy).
- **Content delivery pipeline:** Claude authors MDX/JSON → commit → push → Vercel auto-deploys
  frontend, Railway/Render auto-deploys backend (seed upserts new terms). User progress lives in
  Atlas and is never touched by deploys. The user never has to write or push anything.
- **Notes editor:** Tiptap (block-based, Notion-style); documents stored as Tiptap JSON in Mongo
- **SRS:** SM-2 implemented in a NestJS service
- **Diagrams:** Mermaid (rendered client-side) + hand-made SVGs
- **Architecture Builder game:** React DnD on an SVG canvas; scenario validators run in the backend

### Data model (Mongoose collections, one schema file per NestJS module)

```
users            (name, email, passwordHash, createdAt)
login_logs       (loggedInAt, userAgent)                          -- powers login/activity tracking
lesson_progress  (lessonId, status: locked|available|done, bestScore, completedAt, timeSpentSec)
session_logs     (date, lessonId, phaseTimes, xpEarned)
quiz_attempts    (lessonId, score, wrongQuestionIds[], perDifficulty{e,m,h}, attemptNo, createdAt)
flashcards       (front, back, lessonId, easeFactor, intervalDays, dueDate, lapses, priority)
dictionary       (term, definition, analogy, lessonId?, isSeeded, isSaved, personalNote, createdAt)
notes            (title, contentJSON, lessonId?, folderId?, updatedAt)      -- Tiptap JSON
note_folders     (name, order)
boss_attempts    (worldId, score, passed, createdAt)
streaks          (currentCount, longestCount, freezeTokens, lastStudyDate)
badges           (key, earnedAt)
```

NestJS modules: `auth`, `curriculum` (lesson/world definitions + locking), `sessions` (daily loop),
`quiz`, `srs` (flashcards), `dictionary`, `notes`, `gamification` (XP/streak/badges/boss),
`analytics`. Lesson/world definitions live in content files (source of truth for ordering/locking);
Mongo stores user state + seeded quiz/dictionary data.

---

## 9. Build Phases

### Phase 1 — MVP "I can study today" (build first)

- Backend: auth module (JWT), curriculum/sessions/quiz modules, Mongoose schemas, seed script
- Frontend: login page, Dashboard v1 (Today card + streak + week tracker + login tracking),
  syllabus page (all worlds, lock states), session player (MDX renderer + MCQ quiz with
  E/M/H difficulty mix + 80% gate + XP) — all UI via `src/components/shared`
- Deploy: frontend → Vercel, backend → Railway/Render, CORS + env wiring
- Content: World 0 complete (8 lessons fully written, quiz banks difficulty-tagged)
- Progress persistence + basic stats

### Phase 2 — Memory & knowledge tools

- SM-2 flashcard engine + review-first gate; wrong-answer → flashcard pipeline
- **Dictionary**: seeded glossary + save-from-lesson + personal entries + make-flashcard
- **Notes**: Tiptap editor, lesson side-panel notes + free notebooks, @-mentions, search
- Quiz variant shuffling, boss exam mode (World 0 boss)
- Streak freezes, weekly report card
- Content: Worlds 1-2 (+ their dictionary terms)

### Phase 3 — Games, narrative & analytics

- Sequence puzzle, matching, this-or-that, estimation slider, bug hunt
- Adaptive difficulty stepping; accuracy-by-difficulty analytics
- Dashboard v2: activity heatmap, analytics snapshot, recent notes, dictionary quick-search
- GolpoGram narrative threading + world map visual; badges system
- Content: Worlds 3-4

### Phase 4 — Design Dojo & Mock mode

- Dojo step player (guided 4-step framework with hints + model solution diff)
- Architecture Builder canvas game
- Mock interview timer mode + signal checklist rubric
- Content: Worlds 5-7 (problems authored progressively — stays ahead of the learner)
- Full analytics page: weakest-topic detection, difficulty trends, time reports

> **Content authoring strategy (hybrid):** Worlds 0–2 (26 lessons ≈ 7 weeks of study) are fully
> written at launch. Afterwards Claude stays ≥2 worlds ahead of the learner, tuning new content
> using quiz analytics (weak topics get extra reinforcement). Update flow: user asks Claude in a
> session → Claude writes MDX + commits + pushes → Vercel auto-deploys in minutes → new world
> appears (locked) in the live app. User progress lives in Neon and is never touched by deploys.
> The user never has to write or push anything themselves.
