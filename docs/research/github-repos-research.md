# GitHub Repos Research — System Design Learning Platform

> Research date: 2026-06-12. Source: 7 repos from a LinkedIn article. All repos were located,
> read, and summarized below. This file is the raw material for the learning platform syllabus & plan.

---

## Repo 1: System Design Primer — `donnemartin/system-design-primer` (~350K ⭐)

URL: https://github.com/donnemartin/system-design-primer

**The core textbook.** Every topic = summary + pros/cons + source links ("everything is a trade-off").

### Full topic index

- Start here: Harvard CS75 scalability lecture → "Scalability for Dummies" article (Clones, Databases, Caches, Asynchronism)
- Performance vs scalability · Latency vs throughput
- Availability vs consistency: CAP theorem (CP vs AP)
- Consistency patterns: weak / eventual / strong
- Availability patterns: failover (active-passive, active-active), replication, availability in numbers (99.9% vs 99.99%)
- DNS · CDN (push vs pull) · Load balancer (L4 vs L7, active-active/passive) · Reverse proxy
- Application layer: microservices, service discovery
- Database:
  - RDBMS (ACID): master-slave, master-master, federation, sharding, denormalization, SQL tuning
  - NoSQL (BASE): key-value, document, wide-column, graph
  - SQL vs NoSQL decision criteria
- Cache: client/CDN/web-server/database/application caching; cache-aside, write-through, write-behind, refresh-ahead
- Asynchronism: message queues, task queues, back pressure
- Communication: TCP, UDP, RPC, REST
- Security basics
- Appendix: powers-of-two table, latency numbers every programmer should know

### 4-step interview method (universal framework)

1. Outline use cases, constraints, assumptions (users, volume, QPS, read/write ratio)
2. High-level design (components + connections)
3. Design core components (schema, APIs, hashing, collisions)
4. Scale the design (bottlenecks → LB, caching, sharding) — discuss trade-offs

### Study guide

Timeline-based: short (breadth + some questions) / medium (breadth+depth, many questions) / long (most questions + OO design).

### 8 solved design questions (full solutions with diagrams + Python code)

1. Pastebin / Bit.ly
2. Twitter timeline & search
3. Web crawler
4. Mint.com
5. Social network data structures (shortest path)
6. Key-value store for search engine (query cache)
7. Amazon sales ranking
8. Scaling to millions of users on AWS (1 user → millions, stage by stage — **great narrative "campaign" structure**)

### ~24 unsolved questions (appendix, with reference links)

Dropbox, Google search, web crawler, Google Docs, Redis-like KV store, Memcached-like cache, recommendation system, TinyURL, WhatsApp, Instagram, FB news feed/timeline/chat/graph search, CDN, trending topics, Snowflake ID generation, top-k, multi-datacenter, multiplayer card game, garbage collection, rate limiter, stock exchange.

### OO design questions (Jupyter notebooks)

Hash map, LRU cache, call center, deck of cards, parking lot, chat server.

### Gamifiable assets

- 3 Anki decks (System Design, System Design Exercises, OO Design) → SRS/flashcard mechanic
- Powers-of-two + latency numbers → numeric estimation games
- Trade-off framing → compare/contrast quizzes (CP vs AP, push vs pull CDN, L4 vs L7, SQL vs NoSQL, 4 cache patterns)
- scaling_aws solution → level-based "grow your system" game loop

---

## Repo 2: ByteByteGo — `ByteByteGoHq/system-design-101` (~83K ⭐)

URL: https://github.com/ByteByteGoHq/system-design-101

**The visual layer.** Every topic = one annotated diagram/infographic + short plain-English explanation. Has literal "explained to a 10-year-old" entries (JWT, Firewall).

⚠️ **License: CC BY-NC-ND 4.0** — no commercial reuse/derivatives of images. Use topics/structure as inspiration; write original content + own diagrams.

### 15 sections (~350 topics)

1. API & Web Development (~50): polling vs SSE vs WebSocket, gRPC, HTTP/1→2→3, REST vs GraphQL vs SOAP vs RPC, API gateway vs LB vs reverse proxy, pagination, idempotency, webhooks, URL components, API security
2. Real-World Case Studies (~33): Figma Postgres 100X, Discord trillions of messages, Netflix (caching, databases, CI/CD, overall architecture, push messaging), Airbnb 0→1.5B guests, Twitter 2012 vs 2022, Uber tech stack, McDonald's event-driven, Slack message journey, YouTube video uploads
3. AI & ML (8): How ChatGPT works, AI agents, data pipelines
4. Database & Storage (~47): B-tree vs LSM-tree, isolation levels, optimistic vs pessimistic locking, Kafka 101 / why Kafka is fast, CDC, event sourcing, delivery semantics, sharding algorithms (top 4), consistent hashing, CAP, ACID, database selection cheat sheets
5. Technical Interviews (5): "What happens when you type google.com", SQL joins, how to ace system design interviews
6. Caching & Performance (~30): Redis 101, why Redis is fast, cache eviction (top 8), caching strategies (top 5), CDN beginner guide, cache miss attack, latency numbers, ELK
7. Payment & Fintech (20): payment system, UPI, VISA flow, double-payment avoidance, reconciliation, wallets
8. Software Architecture (~24): microservices best practices, DDD terms, design patterns cheat sheet, MVC/MVP/MVVM, architectural patterns
9. DevTools (20): git internals, diagram-as-code
10. Software Development (~28): load balancing algorithms (top 6), concurrency vs parallelism, data structures in databases
11. Cloud & Distributed Systems (~49): scalability strategies (8), resiliency patterns, unique ID generators, 12-factor app, retry strategies, distributed locks, idempotency cases, system design cheat sheet/blueprint
12. How it Works? (18 mini design problems): Design Gmail, Google Docs, Google Maps, Stock Exchange, chat app, proximity service, notifications, S3 upload, live streaming, quadtree, i18n
13. DevOps & CI/CD (27): Docker, Kubernetes, deployment strategies, logging/tracing/metrics
14. Security (35): HTTPS/SSL handshake, JWT explained-to-a-kid, OAuth 2.0 flows, SSO, password storage, cookies vs sessions vs JWT, Google Authenticator, VPN, SSH
15. Computer Fundamentals (12): DNS lookup, OSI model, TCP vs UDP, IPv4 vs IPv6, process vs thread, deadlock, SQL query visualization

### Quiz value

- "X vs Y" entries → multiple-choice questions
- "Top N" listicles → flashcards/matching games
- Numbered step-flows (how HTTPS works, VISA swipe, google.com) → **ordering/sequencing puzzle games**
- Natural progression: Fundamentals → API/Web → Caching → DB → Distributed → Case Studies → Design Problems

---

## Repo 3: DDIA Notes — `keyvanakbary/learning-notes` (~6.4K ⭐)

URL: https://github.com/keyvanakbary/learning-notes/blob/master/books/designing-data-intensive-applications.md

**The theory track.** Chapter-by-chapter bullet summaries of Kleppmann's DDIA. Concise definitional bullets, maps ~1:1 to interview vocabulary.

### 12 chapters (natural difficulty progression)

1. **Reliable, Scalable, Maintainable Apps** — faults vs failures, percentiles (p50/p95/p99), SLOs/SLAs, vertical vs horizontal scaling
2. **Data Models & Query Languages** — relational vs document, schema-on-read vs write, graph models
3. **Storage & Retrieval** — append-only logs, hash indexes, SSTables, LSM-trees, Bloom filters, B-trees, WAL, OLTP vs OLAP, column storage, star schema
4. **Encoding & Evolution** — JSON/Protobuf/Avro, forward/backward compatibility, schema evolution
5. **Replication** — leader-based, sync vs async, failover, split brain, replication log types
6. **Partitioning** — range vs hash, consistent hashing, hot spots, local vs global secondary indexes, rebalancing, request routing
7. **Transactions** — ACID, isolation levels, dirty reads, phantom reads, write skew, 2PL, SSI
8. **Trouble with Distributed Systems** — partial failures, unreliable networks/clocks, Byzantine faults
9. **Consistency & Consensus** — linearizability, CAP, causal ordering, 2PC, Raft/Paxos, quorums
10. **Batch Processing** — Unix pipelines, MapReduce, HDFS, dataflow engines (Spark)
11. **Stream Processing** — Kafka, partitioned logs, CDC, event sourcing, windows, watermarks
12. **Future of Data Systems** — lambda vs kappa, unbundling, exactly-once, idempotence, ethics

Part I (ch 1–4) = single-node foundations → Part II (ch 5–9) = distributed data (hardest: 8–9) → Part III (ch 10–12) = derived data.

---

## Repo 4: Interview Questions — `ashishps1/awesome-system-design-resources` (~38.6K ⭐)

URL: https://github.com/ashishps1/awesome-system-design-resources

**The practice track.** 45 questions, difficulty-tiered, each linking to a detailed breakdown (blog/YouTube).

### Concept sections (each links to a free in-depth article)

Core concepts (scalability, availability, CAP, consistent hashing, SPOF) · Networking (OSI, DNS, proxies, TCP/UDP, LB) · API (gateway, REST vs GraphQL, WebSockets, webhooks, idempotency, rate limiting) · Database (ACID, SQL vs NoSQL, indexes, sharding, replication, Bloom filters) · Caching (strategies, eviction, distributed, CDN) · Async (pub/sub, queues, CDC) · Distributed systems (heartbeats, service discovery, consensus, distributed locking, gossip, circuit breaker, tracing) · Architectural patterns · **Top 15 trade-offs**

### 45 questions by difficulty

**Easy (10):** URL Shortener · Autocomplete · Load Balancer · CDN · Parking Garage · Vending Machine · Distributed KV Store · Distributed Cache · Authentication System · UPI

**Medium (23):** WhatsApp · Spotify · Instagram · Notification Service · Job Scheduler · Tinder · Facebook · Twitter · Reddit · Netflix · YouTube · Google Search · Amazon · TikTok · Shopify · Airbnb · Rate Limiter · Kafka (message queue) · Flight Booking · Online Code Editor · Analytics Platform · Payment System · Digital Wallet

**Hard (12):** Yelp (location-based) · Uber · DoorDash · Google Docs · Google Maps · Zoom · Dropbox · BookMyShow · Web Crawler · Code Deployment · S3 (cloud storage) · Distributed Locking Service

### Framework section

"How to Answer a System Design Interview Problem": requirements → capacity estimation → API design → data model → high-level design → deep dives → bottlenecks/trade-offs.

### Concept→question mapping (for unlock logic)

Consistent hashing + caching → Distributed Cache/KV Store · Pub/Sub → Notification Service, Kafka · CDC + replication → Analytics · Geo-indexing → Yelp/Uber/Maps · CAP/quorums → S3, Distributed Locking.

---

## Repo 5: Awesome Scalability — `binhnguyennus/awesome-scalability` (~71.7K ⭐, MIT)

URL: https://github.com/binhnguyennus/awesome-scalability

**The depth/case-study layer.** Pure curated link list — thousands of "Pattern at Company" engineering blog links. Expert-level; use as "go deeper" links per lesson + scenario quiz source.

### Sections (= natural difficulty progression)

Principle → Scalability (microservices, caching, locking, tracing, scheduling, monitoring, messaging/Kafka, logging, search, storage, RDBMS, NoSQL, time-series, CI/CD) → Availability (resilience, failover, LB, rate limiting, autoscaling) → Stability (circuit breaker, timeouts, bulkheads, throttling) → Performance → Intelligence (big data, ML) → Architecture (full company case studies) → Interview → Organization → Talk → Book

### Principle section = ready-made intermediate syllabus

CAP → ACID/BASE → SQL vs NoSQL → sharding → consistent hashing → eventual consistency (Werner Vogels) → caching → latency numbers → common bottlenecks → 12-factor app → chaos engineering.

### Signature "Pattern at Company" pairs (teach concept via real company)

- Caching → EVCache at Netflix; photo caching at Facebook; Redis at Twitter/Instagram/Slack
- Sharding → MySQL at Pinterest; Postgres at Notion/Figma; "Sharding & IDs at Instagram"
- Microservices → Domain-Oriented at Uber; Conductor at Netflix; Medium
- Queues/streaming → Kafka at LinkedIn/Pinterest/NYT/Yelp; dead-letter queues at Uber
- KV stores → Manhattan at Twitter; messages in Cassandra at Discord; TAO at Facebook
- Storage → Magic Pocket at Dropbox
- LB → Katran at Facebook (1.3B users); Zuul 2 at Netflix
- Rate limiting → Cloudflare (millions of domains); Stripe
- Free books listed: Google SRE book, Distributed Systems for Fun and Profit, DDIA

---

## Repo 6: Real-World Architectures — covered by `awesome-scalability` (Architecture section) + `InterviewReady/system-design-resources` (~18.2K ⭐) + `kilimchoi/engineering-blogs` (~38.3K ⭐)

- awesome-scalability Architecture section: Netflix, Spotify (microservice testing, Heroic TSDB), Airbnb (Chronos, MySQL financial reporting, services evolution), Uber, Twitter (Zipkin, Manhattan, FlockDB), Instagram (search, sharding & IDs, Postgres), Pinterest, Stripe, Shopify, Discord, LINE, League of Legends (chat for 70M players), 100+ companies
- InterviewReady/system-design-resources: 42 topic sections; Netflix video encoding, DynamoDB internals, S3 performance, Facebook Messenger, Airbnb payment idempotency
- kilimchoi/engineering-blogs: A–Z directory of company blogs + **OPML file** → can power an in-app "engineering blog feed" (RSS)
- system-design-primer appendix: company architectures (Instagram 14M users, Twitter 10000% faster, WhatsApp 1M+ users, Netflix "What happens when you press Play", Uber 1000 microservices, Tumblr 15B page views)

---

## Repo 7: Mock Interview Templates — `weeeBox/mobile-system-design` (~5.7K ⭐) + primer's 4-step framework

URL: https://github.com/weeeBox/mobile-system-design (ships literal TEMPLATE.md + per-step timers)

### Timed mock interview structure (45–60 min total) — build as countdown phases

1. Introductions — 2–5 min
2. Requirements clarification — 5 min (functional: pick 3–5 features; non-functional: performance, security, reliability; explicit "out of scope")
3. High-level design / diagram — 10–15 min
4. Deep dives — 20–30 min (API design, data storage, sync, caching, pagination)
5. Wrap-up — 5 min

### TEMPLATE.md structure (fill-in template)

- Requirement gathering: users (DAU), geography, platform, top 3–5 features, non-functional reqs, out-of-scope
- High-level diagram
- Deep dives: A) API design B) Data storage C) Sync/offline D) Media
- **Signal checklist** (self-grading rubric): trade-offs mentioned? edge cases? assumptions verified? → reusable as platform scoring rubric

### checkcheckzz/system-design-interview (~23.3K ⭐) 3-phase process

Clarify requirements (QPS, data/sec) → high-level architecture → component design (APIs, schemas).

---

## Cross-repo synthesis (for the platform plan)

### Layered content model

| Layer                  | Source repo                                             | Role in platform                                             |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| Visual/beginner lesson | ByteByteGo system-design-101                            | ELI5 diagrams + analogies (inspiration only — NC-ND license) |
| Core textbook          | system-design-primer                                    | Topic explanations, trade-offs, 4-step method                |
| Theory depth           | DDIA notes                                              | Chapter concepts, vocabulary, flashcards                     |
| Practice problems      | ashishps1 (45 Qs, Easy→Medium→Hard) + primer's 8 solved | Graded challenges                                            |
| Real-world depth       | awesome-scalability + InterviewReady                    | "Go deeper" links, company case studies, scenario quizzes    |
| Mock interview         | weeeBox template + primer 4-step                        | Timed practice mode with rubric                              |

### Synthesized beginner ordering (merged from all repos)

1. Computer fundamentals: DNS, TCP/UDP, OSI, HTTP, what-happens-when-you-type-google.com
2. How the web works: HTTPS, cookies/sessions/JWT, REST/APIs
3. Building blocks: load balancer, proxy/reverse proxy, API gateway, CDN, cache
4. Databases: SQL vs NoSQL, ACID/BASE, indexing, replication, sharding, consistent hashing
5. Distributed systems: CAP, queues/Kafka, pub/sub, idempotency, CDC, consensus
6. Reliability: circuit breakers, rate limiting, failover, timeouts, monitoring
7. Estimation: powers of two, latency numbers, back-of-envelope drills
8. Design problems: Easy 10 → Medium 23 → Hard 12 (ashishps1 ladder) + primer's 8 solved as guided walkthroughs
9. Real-world case studies: Netflix, Uber, Discord, Instagram, Airbnb…
10. Mock interviews: timed 45-min format with signal checklist

### Gamification raw material found in repos

- Anki decks (primer) → spaced-repetition flashcards
- Latency numbers / powers of two → estimation guessing game
- Step-flow diagrams (HTTPS, VISA, google.com) → drag-to-order sequencing puzzles
- X vs Y comparisons → quick-fire MCQ battles
- "Kafka at 7 companies" pattern → company-matching trivia
- scaling_aws (1 user → millions) → narrative level-up campaign
- Concept→question unlock mapping (ashishps1) → skill-tree prerequisites
- Signal checklist (weeeBox) → mock interview scoring rubric

### License notes

- system-design-101: CC BY-NC-ND — **do not copy images/text**; write original content
- awesome-scalability: MIT · primer: CC BY 4.0 (attribution) · others: link out, don't republish
