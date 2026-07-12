---
id: wv0l4
world: wv0
order: 3
title: "Linux User Management — চাবি কার হাতে কয়টা"
titleEn: "Linux User Management"
estMinutes: 30
type: lesson
---

> **📖 SESSION 1 of 2 — পড়ো, বোঝো, কুইজ দাও (৩০ মিনিট)**
> আজ টার্মিনাল লাগবে না — আজ একটা **গল্প**। এক সপ্তাহের গল্প, যার প্রতিটা দিন তোমাকে একটা করে কনসেপ্ট শেখাবে। পরের সেশনে (🔧 LAB) পুরো গল্পটা নিজের হাতে ঘটাবে।

---

## 🎬 HOOK — সোমবার সকালের বিপদ

ধরো তুমি **"GolpoTech"** নামের একটা কোম্পানিতে সদ্য জয়েন করা junior DevOps engineer। কোম্পানির on-premises-এ **২০০টা সার্ভার** চলে। সোমবার সকালে অফিসে ঢুকতেই তোমার team lead তিনটা কাগজ ধরিয়ে দিলো:

1. **"আজ চারজন নতুন engineer জয়েন করছে** — shajal, minhaz, yasin, fazlul। ওদের সার্ভারে ঢোকার ব্যবস্থা করো।"
2. **"রাফি ভাই ৩ মাসের ছুটিতে যাচ্ছেন** — ওনার access আজই বন্ধ করো। কিন্তু সাবধান, ওনার কোনো ফাইল যেন না হারায়, ফিরে এসে লাগবে।"
3. **"গত মাসে যে চলে গেছে, তার account এখনো active!** Security audit-এ ধরা পড়েছে — আজই ব্যবস্থা নাও।"

তুমি ভাবলে — আচ্ছা, ২০০টা সার্ভারে ঢুকে ঢুকে একটা একটা করে ঠিক করি... **সপ্তাহ শেষ হয়ে যাবে।** আর তৃতীয় কাগজটাই প্রমাণ যে হাতে-হাতে করলে ভুল হয়, আর সেই ভুল মানে — **একজন প্রাক্তন employee এখনো তোমার সার্ভারে ঢুকতে পারে।** 😨

Linux এই পুরো সমস্যাটার জন্য একটা গোছানো ব্যবস্থা বানিয়ে রেখেছে — মাত্র তিনটা ধারণা দিয়ে: **User** (কে কে আছে), **Group** (কারা কোন দলে), **Permission** (কোন দল কী পারে)। আজ প্রথম দুটো। আগের লেসনে তুমি বিল্ডিংটা চিনেছো (file system-এর গাছ) — আজ চিনবে **বিল্ডিংয়ের মানুষগুলোকে, আর কার হাতে কোন চাবি।** 🔑

গল্পটা চলবে ছয় দিন ধরে — সোমবার থেকে শনিবার। চলো।

---

## 🤔 WHY — এই গল্পটা তোমার কেন লাগবে

তুমি ৫ বছরের MERN developer — হয়তো ভাবছো "user বানানো তো IT department-এর কাজ!" তিনটা কারণে এটা **তোমারই** কাজ:

1. **Deploy মানেই সার্ভার, সার্ভার মানেই user।** তোমার Node app টা production-এ কোন user হিসেবে চলবে? সে কি root? (হলে বিপদ!) — এই প্রশ্নের উত্তর জানা মানেই আজকের লেসন।

   > **উদাহরণ:** ধরো তোমার Express app-এর কোনো একটা npm package-এ vulnerability আছে (হয়েই থাকে — এটা বাস্তব ঘটনা, `event-stream`, `ua-parser-js` সহ বহু নামকরা package-এ হয়েছে)। কেউ সেই vulnerability দিয়ে তোমার app-এর ভেতরে একটা কমান্ড চালানোর সুযোগ পেলো (RCE)। এখন — app যদি **root** হিসেবে চলে, সেই attacker সাথে সাথে গোটা সার্ভারের মালিক: `/etc/shadow` পড়তে পারে, backdoor বসাতে পারে, অন্য app-এর ডেটা মুছতে পারে। কিন্তু app যদি একটা সীমিত-ক্ষমতার `appuser`-এর নামে চলে (আজকের `useradd`), attacker সর্বোচ্চ ওই app-এর নিজের ফোল্ডারটুকু নাড়াচাড়া করতে পারবে — বাকি সার্ভার অক্ষত। **damage-এর সীমানা user-এর ক্ষমতা দিয়েই আঁকা হয়।**

2. **Docker-এর ভেতরেও এই একই জগত।** Dockerfile-এ `USER appuser` লাইনটা দেখেছো? Container-এর ভেতরে user বানিয়ে তাকে খাঁচায় আটকানো হয় — instructor বারবার এই সংযোগটা টেনেছেন। Docker module-এ পৌঁছানোর আগে এটা আয়ত্তে চাই।

   > **উদাহরণ:** একটা সাধারণ Dockerfile-এ যদি `USER` লাইনটাই না থাকে, container-এর ভেতরে তোমার app **ডিফল্টভাবে root** হিসেবে চলে — এমনকি হোস্ট মেশিনেও অনেক সময় সেই root-এর প্রভাব ছড়াতে পারে (container escape হলে)। তাই ভালো Dockerfile-এ লেখা থাকে:
   >
   > ```dockerfile
   > RUN useradd -m appuser
   > USER appuser
   > ```
   >
   > ঠিক আজকের `useradd -m` — শুধু জায়গাটা এখন একটা সার্ভারের বদলে একটা container image।

3. **Interview-র প্রিয় প্রশ্ন:** _"একটা কোম্পানির ৩টা department-এর access management design করো"_ — instructor নিজে বলেছেন এটা কমন প্রশ্ন। আজকের গল্পটাই তার উত্তর (লেসনের একদম শেষে পুরো উত্তরটা লেখা আছে)।

---

## 🧭 CONCEPT JOURNEY — এক সপ্তাহের গল্প

### 📅 সোমবার সকাল: Linux আসলে মানুষ চেনে না — সংখ্যা চেনে

কাজ শুরুর আগে একটা গোপন কথা জেনে নাও। তুমি যখন বলো "shajal-কে access দাও", Linux ভেতরে ভেতরে shajal নামটা ব্যবহারই করে না। সে ব্যবহার করে একটা **নম্বর।**

> **🏠 Analogy — NID কার্ড:** তোমার নাম "নোবেল" — কিন্তু সরকারের খাতায় তুমি আসলে একটা **NID নম্বর।** নাম বদলাতে পারো, নম্বর সেই একটাই। Linux-এও তাই:

| জিনিস | নম্বরের নাম        | নিয়ম                                                    |
| ----- | ------------------ | -------------------------------------------------------- |
| User  | **UID** (User ID)  | root-এর UID = **0**; সাধারণ মানুষ শুরু হয় **1000** থেকে |
| Group | **GID** (Group ID) | প্রতিটা দলের নিজের নম্বর                                 |

এটা এখনই জানা দরকার, কারণ একটু পরে `id` কমান্ডের output-এ এই নম্বরগুলোই ভেসে উঠবে — তখন যেন ভয় না লাগে। 😄

### 📅 সোমবার দুপুর: চারজনের জন্ম — `useradd`

প্রথম কাগজের কাজ। নতুন user বানানোর কমান্ড `useradd`:

```bash
sudo useradd shajal
```

> **🔑 থামো — শুরুতেই এই `sudo` জিনিসটা কী, কেন লাগলো?** `useradd` কমান্ডটা `/etc/passwd`-এর মতো সিস্টেম-খাতায় সরাসরি নতুন লাইন লেখে — ভুল হলে পুরো সার্ভারের user-ব্যবস্থা এলোমেলো হয়ে যেতে পারে। তাই Linux এই ধরনের স্পর্শকাতর কাজ সাধারণ user-কে সরাসরি করতে দেয় না — **শুধু root পারে।**
>
> কিন্তু তুমি (এই টার্মিনালে যে account দিয়ে বসে আছ) যদি সবসময় root-ই হয়ে বসে থাকো, সেটাও বিপজ্জনক — ভুল করে একটা destructive কমান্ড টাইপ করলে সাথে সাথে পুরো ক্ষমতা নিয়ে কার্যকর হয়ে যাবে, কেউ আটকাবে না। `sudo` (**s**uper**u**ser **do**) এই দুই বিপদের মাঝের রাস্তা: _"এই একটা কমান্ডের জন্য মাত্র আমাকে সাময়িক root বানাও — কমান্ড শেষ, ক্ষমতাও শেষ, আমি আবার সাধারণ user।"_
>
> `sudo` ছাড়া চালালে কী হতো, দেখো:
>
> ```bash
> useradd shajal
> ```
>
> ```
> useradd: Permission denied.
> useradd: cannot lock /etc/passwd; try again later.
> ```
>
> সিস্টেম নিজেই আটকে দিলো — "তোমার এই খাতায় লেখার অনুমতি নেই।"
>
> **🏠 Analogy:** তুমি অফিসের সাধারণ কর্মী — নিজের কার্ডে নিজের ডেস্কে ঢোকা যায়, কিন্তু সার্ভার রুমে না। `sudo` মানে ম্যানেজারকে ডেকে "এই একটা কাজের জন্য" সাময়িক চাবি ধার নেওয়া — কাজ শেষ, চাবি সাথে সাথে ফেরত। সবসময় ম্যানেজারের চাবি নিজের পকেটে রাখা (root হয়ে বসে থাকা) বিপজ্জনক অভ্যাস।
>
> (কে কে এই `sudo` চালাতে পারবে, সেটাই শুক্রবারের গল্প — `sudo` নামের **group**, আর `/etc/sudoers` ফাইল। আজকের একদম শেষে `usermod -aG sudo shajal`-এ এই দুটো নাম আবার দেখা হবে — একটা কমান্ড, একটা group, দুটোরই নাম কাকতালীয়ভাবে "sudo"।)

কোনো output নেই — Linux-এ **নীরবতাই সাফল্য।** কিন্তু ভেতরে কী ঘটলো? চলো প্রমাণ দেখি:

```bash
id shajal
```

```
uid=1001(shajal) gid=1001(shajal) groups=1001(shajal)
```

এই এক লাইনে **তিনটা তথ্য** — ডান থেকে বামে পড়ো:

- `uid=1001(shajal)` — shajal-এর NID হলো 1001
- `gid=1001(shajal)` — তার **primary group**... দাঁড়াও, group? আমরা তো কোনো দলে ঢোকাইনি! আসলে `useradd` নিজে থেকেই **shajal-এর নামে একটা এক-সদস্যের private দল** বানিয়ে দিয়েছে — একদম একা থাকার ঘরের মতো। দল না দেওয়া পর্যন্ত সে নিজের দলে নিজেই।
- `groups=1001(shajal)` — মোট যত দলে আছে — আপাতত ওই একটাই

> **🔍 এই তিনটা লাইনে যে প্রশ্নটা মাথায় ঘুরপাক খায়:** "আমি তো group বানাতে বলিইনি — GID/groups এলো কোত্থেকে?"
>
> Linux-এর একটা নিয়ম **কখনো ভাঙে না: প্রতিটা user-এর একটা primary group থাকতেই হবে, খালি রাখা চলবে না।** creation-এর সময় group বেছে না দিলে, `useradd` নিজে থেকেই সমাধান করে — **shajal নামেই** একটা নতুন group বানায় (এর টেকনিক্যাল নাম **User Private Group / UPG**), shajal-কে তার একমাত্র সদস্য বানায়, আর সেটাকেই তার primary ধরে নেয়। এই দলে shajal ছাড়া আর কখনো কেউ থাকবে না — এটা সত্যিকারের অর্থেই তার ব্যক্তিগত লকার।
>
> তাহলে `gid=1001`-এর 1001 সংখ্যাটা কী? — ঠিক ধরেছ: এটাই সেই নতুন বানানো "shajal" নামের group-এর **নিজের GID।** এখানে UID আর GID দুটোই কাকতালীয়ভাবে 1001 — কারণ `useradd` সাধারণত user আর তার private group-কে পাশাপাশি নম্বর দেয় (পরের user, যেমন minhaz, UID 1002 পেলে তার private group-ও GID 1002-ই পাবে)। সংখ্যা মিলে যাওয়া সুবিধা মাত্র, নিয়ম না — পরে যদি `usermod -g` দিয়ে group বদলাও, UID অপরিবর্তিত থাকবে, কিন্তু GID বদলে যাবে।
>
> আর `groups=` লাইন উত্তর দেয় "shajal মোট কয়টা দলের সদস্য, আর কোনগুলো" — এই মুহূর্তে শুধু তার private group (1001), কারণ আমরা তাকে এখনো devops-জাতীয় কোনো দলে ঢোকাইনি। মঙ্গলবার যখন devops-এ ঢোকাবে, `groups=`-এ **দুটো** entry দেখবে। **primary সবসময় একটাই থাকে, supplementary যতগুলো ইচ্ছা — `groups=` তাদের সবগুলোর যোগফল দেখায়।**
>
> **🏠 Analogy:** অফিসে জয়েন করার দিনই তোমার নিজের নামে একটা লকার (private group) বরাদ্দ হলো — চাবিটা শুধু তোমার। পরে তোমাকে "Marketing Team" (supplementary)-এও ঢোকানো হলো — এখন তুমি দুই জায়গার সদস্য: নিজের লকার + Marketing-এর শেয়ার্ড ক্যাবিনেট। `gid=` মানে "তোমার নিজের লকার নম্বর", `groups=` মানে "তুমি মোট কোন কোন জায়গার চাবি পাও, সব মিলিয়ে"।

কিন্তু একটা **ফাঁদ** আছে। চালাও:

```bash
ls /home
```

```
(ফাঁকা!)
```

shajal-এর **কোনো ঘরই তৈরি হয়নি!** `useradd` একা চালালে শুধু খাতায় নাম ওঠে — থাকার জায়গা হয় না। ঘরসহ বানাতে লাগে `-m` (**m**ake home):

```bash
sudo useradd -m yasin
ls /home
```

```
yasin
```

> **🏠 Analogy:** `useradd` = HR-এর খাতায় নাম তোলা। `useradd -m` = খাতায় নাম **+ একটা ডেস্ক বরাদ্দ।** খাতায় নাম থাকলেই অফিসে ঢোকা যায়, কিন্তু বসবে কোথায়? তাই মানুষের জন্য user বানালে **সবসময় `-m`।** (script/bot-দের জন্য ডেস্ক লাগে না — তখন `-m` ছাড়া।)

চাইলে জন্মের সময়ই আরও সব ঠিক করে দেওয়া যায়:

```bash
sudo useradd -m -s /bin/bash -c "Shajal Ahmed, DevOps" shajal
#            ↑         ↑                ↑
#          ঘরসহ    কোন shell     খাতায় পুরো নাম
```

প্রতিটা অংশ আলাদা করে দেখি:

- **`-m`** — make home: `/home/shajal` তৈরি করো (আগেই দেখেছ, না দিলে ঘরই নেই)
- **`-s /bin/bash`** — shell: login করলে shajal-এর প্রতিটা কমান্ড কোন প্রোগ্রাম receive করবে, বুঝবে, চালাবে (এই ⑦ নম্বর জিনিসটার পুরো ব্যাখ্যা একটু পরেই `/etc/passwd` পড়ার সময় আসছে) — না দিলে distro-র default shell বসে
- **`-c "Shajal Ahmed, DevOps"`** — comment/GECOS ফিল্ড: পুরো নাম বা বর্ণনা, শুধু **মানুষ পড়ার জন্য** (`finger`, কিছু `ls -l` ভ্যারিয়েন্ট দেখায়) — Linux নিজে এর মানে বোঝে না, কোনো প্রোগ্রাম এটার উপর নির্ভর করে সিদ্ধান্ত নেয় না
- একদম শেষে **`shajal`** — আসল username, যার নামে বাকি সব (UID, home path, private group) তৈরি হয়

> **🏠 Analogy:** এটা একটাই ফর্মে সব তথ্য পূরণ করে জমা দেওয়ার মতো — নাম (`shajal`), ডেস্ক/ঘর চাও কিনা (`-m`), কোন ভাষায় কথা বলবে (`-s`), আর পরিচয়পত্রে কী লেখা থাকবে (`-c`) — সব একবারে, এক জমাতেই।

### 📅 মঙ্গলবার: দল গঠন — `groupadd`, আর বাঁধার খেলা

চারজন তো এলো। কিন্তু চারজনকে **আলাদা আলাদা** করে ২০০ সার্ভারের permission দেওয়া? পাগলামি। Team lead বললো: _"দল বানাও। দলকে permission দাও। মানুষকে দলে ঢোকাও।"_ — **এই তিন লাইনই আজকের লেসনের হৃদয়।**

Instructor ক্লাসে মজা করে দলের নাম দিলেন **minions** 😄:

```bash
sudo groupadd minions
```

আবার নীরবতা = সাফল্য। এখন **সবচেয়ে গুরুত্বপূর্ণ কথাটা:** minions দল আছে, shajal-ও আছে — কিন্তু **ওদের মধ্যে এখনো কোনো সম্পর্কই নেই!**

> **🏠 Analogy:** ক্লাবঘর বানানো (groupadd) আর মেম্বারশিপ কার্ড দেওয়া — দুটো আলাদা কাজ। ক্লাব বানালেই পাড়ার সবাই মেম্বার হয়ে যায় না!

সম্পর্ক তৈরির কমান্ড `usermod` (user **mod**ify)। আর এখানেই এই ক্লাসের **সবচেয়ে সূক্ষ্ম — এবং সবচেয়ে বিপজ্জনক** — জায়গা। মন দিয়ে দেখো, দুটো প্রায় একই রকম flag, সম্পূর্ণ আলাদা কাজ:

```bash
sudo usermod -g minions shajal     # ছোট g → PRIMARY group বদলাও
sudo usermod -aG devops shajal     # -aG   → supplementary হিসেবে ADD করো
```

**Primary আর supplementary — ব্যাপারটা কী?** Instructor-এর নিজের উদাহরণে:

> নতুন junior engineer জয়েন করলে কিছু **common access সবাইকেই** দিতে হয় — সেটার জন্য যে দল, সেটা তার **primary group** (একটাই থাকে, এটাই তার "মূল পরিচয়")। পরে তাকে **devops টিমেও** নেওয়া হলো — সেটা **supplementary** (primary-র বাইরে বাড়তি সদস্যপদ — যত খুশি থাকতে পারে)।

এখন প্রমাণ দেখো — bind করার পরে shajal-এর পরিচয় কেমন বদলালো:

```bash
id shajal
```

```
uid=1001(shajal) gid=1002(minions) groups=1002(minions),1003(devops)
#      ↑                ↑                    ↑
#   নম্বর এক-ই     primary এখন minions    সব দল: minions + devops
```

```bash
groups shajal
```

```
shajal : minions devops
#          ↑        ↑
#       primary   supplementary (ক্রমটা খেয়াল করো — আগে primary)
```

**⚠️ এবার দুটো ফাঁদ — production-এ যে দুটো ভুলে মানুষের চাকরি টলে:**

**ফাঁদ ১:** shajal-কে devops-এ _যোগ_ করতে গিয়ে কেউ লিখলো `usermod -g devops shajal` (ছোট g)। ফল? যোগ তো হলোই না — **তার primary group-টাই minions থেকে উপড়ে devops হয়ে গেল!** ছোট g সবসময় primary-তে হাত দেয়।

**ফাঁদ ২:** কেউ লিখলো `usermod -G sudo shajal` — `-a` ছাড়া। ফল? sudo যোগ হলো ঠিকই, কিন্তু **আগের সব supplementary দল (devops!) মুছে গেল।** `-a` মানে **a**ppend — "আগেরগুলো রেখো।" `-a` ছাড়া `-G` মানে "পুরনো তালিকা ফেলে এই নতুন তালিকা বসাও।"

> **মুখস্থ করার মন্ত্র:** _supplementary যোগ করতে সবসময় জোড়া অক্ষর — `-aG`। ছোট `-g` ছোঁবে শুধু primary বদলাতে চাইলে।_

### 📅 বুধবার: খাতাগুলো কোথায় — `/etc`-র ভেতরে উঁকি

তুমি এতক্ষণ user বানালে, দলে ঢোকালে — কিন্তু এই তথ্যগুলো Linux **রাখছে কোথায়?** আগের লেসনের সবচেয়ে বড় সত্যটা মনে করো: _Linux-এ সবকিছুই ফাইল।_ তাহলে user-দের তথ্যও নিশ্চয়ই কোনো ফাইলে!

```bash
cat /etc/passwd
```

```
root:x:0:0:root:/root:/bin/bash
shajal:x:1001:1002:Shajal Ahmed,DevOps:/home/shajal:/bin/bash
yasin:x:1003:1003::/home/yasin:/bin/bash
...
```

Instructor এখানে থেমে একটা চমৎকার observation দিলেন: খেয়াল করো, **passwd এখানে কোনো directory না — এটা একটা ফাইল।** আগের লেসনের tree-ভাষায়: `/etc` হলো ডালওয়ালা node (directory), আর `passwd` হলো **terminal node** — যার কোনো child নেই, শুধু ভেতরে data। দুই লেসন এক বিন্দুতে মিললো!

এবার shajal-এর লাইনটা **টুকরো টুকরো করে** পড়ি — কোলন (`:`) দিয়ে ভাগ করা ৭টা ঘর:

```
shajal : x : 1001 : 1002 : Shajal Ahmed,DevOps : /home/shajal : /bin/bash
  ①     ②    ③      ④           ⑤                   ⑥             ⑦

① নাম          ② password? না! (রহস্য নিচে)   ③ UID
④ primary GID   ⑤ comment (পুরো নাম)          ⑥ home    ⑦ shell
```

> **⑦ নম্বর ঘর — `/bin/bash` আসলে কী জিনিস?** এটা কোনো বিশেষ কোড না — সোজা একটা **প্রোগ্রামের path**, ঠিক যেমন `/etc/passwd` একটা ফাইলের path। `bash` (Bourne Again SHell) হলো সেই প্রোগ্রাম যেটা login করার সাথে সাথে চালু হয়, তোমার প্রতিটা কমান্ড (`ls`, `cd`, `useradd`...) receive করে, বুঝে, চালায়। shajal login করলে Linux তার এই ৭ নম্বর ঘরে লেখা path-টাই চালু করে দেয় — `/bin/bash`।
>
> এই ঘরে অন্য কিছুও বসতে পারে:
>
> - `/bin/sh` — bash-এর হালকা, পুরনো ভাই — script-এ বেশি দেখা যায়
> - `/usr/sbin/nologin` বা `/bin/false` — **"শুধু login বন্ধ করে দাও"** — service account-দের (যেমন `www-data`, `mysql`) জন্য, যাদের কোনোদিন নিজে টার্মিনালে বসার কথাই না। কেউ এই account দিয়ে login করার চেষ্টা করলেও connection সাথে সাথে কেটে যায়
>
> **🏠 Analogy:** shell হলো তোমার আর কম্পিউটারের মধ্যে **অনুবাদক** — তুমি কমান্ড বললে, সে সেটা কম্পিউটারের বোধগম্য ভাষায় অনুবাদ করে কাজ করায়। কোন অনুবাদক পাবে (bash/sh) সেটা এই ৭ নম্বর ঘরে লেখা থাকে; আর `nologin` মানে "এই account-এর জন্য কোনো অনুবাদকই বরাদ্দ নেই — কথাই বলা যাবে না।"

**② নম্বর ঘরের রহস্য:** সেখানে লেখা শুধু `x`। আসল password কোথায়? আরেকটা ফাইলে — `/etc/shadow` — **encrypted** আকারে, আর সেই ফাইল **শুধু root পড়তে পারে।** কেন এই ভাগাভাগি? কারণ `/etc/passwd` সবাইকে পড়তে দিতেই হয় (নানা প্রোগ্রামের দরকার হয়) — কিন্তু password-এর hash সবার চোখে পড়লে কেউ সেটা ভাঙার চেষ্টা করতে পারে। তাই দুই খাতা: **পরিচয়ের খাতা সবার জন্য, গোপন খাতা শুধু root-এর।**

আর দলের খাতা? `/etc/group`:

```bash
cat /etc/group
```

```
sudo:x:27:yasin
minions:x:1002:
devops:x:1003:shajal,minhaz
#  ↑       ↑        ↑
# নাম     GID    supplementary সদস্যরা
```

একটা ধাঁধা দেখছো? devops-এর লাইনে shajal আছে, কিন্তু **minions-এর লাইনে shajal নেই** — অথচ minions-ই তো তার primary! এটা bug না — **দুই খাতার ভাগাভাগি:** primary সম্পর্কটা লেখা থাকে `/etc/passwd`-র ৪ নম্বর ঘরে (GID 1002), আর `/etc/group`-এর সদস্য-তালিকায় থাকে শুধু **supplementary-রা।** দুটো মিলিয়ে পড়লে তবেই পুরো ছবি।

আর এই সব খাতা এক ফোল্ডারে বলেই instructor-এর সেই হুঁশিয়ারি: **`/etc` হলো সার্ভারের সবচেয়ে খতরনাক জায়গা।** user, group, password, sudo — সব চাবি এক ড্রয়ারে। কেউ `/etc` দখল করতে পারলে খেলা শেষ।

### 📅 বৃহস্পতিবার: রাফি ভাইয়ের ছুটি — `lock`, মোছা না

দ্বিতীয় কাগজের কাজ। রাফি ভাই ৩ মাসের ছুটিতে। প্রথম প্রবৃত্তি হয়তো: `userdel rafi` — মুছে দিই!

**থামো।** মুছলে কী হারাবে ভাবো: তার লেখা script, config, নোট — ফিরে এসে সে সব চাইবে। আর তোমার তৃতীয় কাগজটাও মনে করো — মুছতে **ভুলে গেলে** সমস্যা, আবার **ভুল করে মুছলেও** সমস্যা। Linux-এর সমাধান দুই স্তরের:

```bash
sudo usermod -L rafi     # L = Lock — দরজায় তালা
```

Lock মানে: রাফি ভাই **login করতে পারবেন না** — কিন্তু তার ফাইল, দল-সদস্যপদ, সেটিংস **সব হুবহু অক্ষত।** (ভেতরে যা ঘটে: `/etc/shadow`-তে তার password hash-এর সামনে একটা `!` বসে যায় — চাবিটা সাময়িক অচল, ফেলা হয়নি।)

```bash
sudo usermod -U rafi     # U = Unlock — ৩ মাস পরে তালা খোলো, সব আগের মতো
```

আর যে **সত্যিই চলে গেছে** (তৃতীয় কাগজ)? তখন:

```bash
sudo userdel joker       # খাতা থেকে নাম কাটো, home রেখে দাও
sudo userdel -r joker    # home-সহ সব মুছো — data রাখার নীতি বুঝে!
```

> **🏠 Analogy:** ছুটি = লকারে **তালা** (জিনিস ভেতরেই থাকে)। resignation = লকার **খালি করে** পরের জনকে দেওয়া। কোনটা কখন — এটা ভুল করা মানে হয় security ফুটো, নয় কারো ৩ বছরের কাজ গায়েব।

### 📅 শুক্রবার: সবচেয়ে বড় চাবির গোছা — `root`, `sudo` আর সীমানা আঁকা

সপ্তাহের সবচেয়ে গভীর দিন। এতক্ষণ দল বানালে — কিন্তু **ক্ষমতা** আসে কোথা থেকে? Instructor সিস্টেমের ভিতটা তিনটা বাক্যে খুলে দিলেন:

1. **User-জগতে একজন জন্ম থেকে থাকে: `root`** (UID 0) — super admin। সে গাছের **যেকোনো node-এ যেতে পারে, যেকোনো operation চালাতে পারে।** কোনো তালা তাকে আটকায় না।
2. **Group-জগতে একটা দল জন্ম থেকে থাকে: `sudo` group** — আর এটাই **সবচেয়ে খতরনাক দল**, কারণ এই দলের সদস্যরা root-এর ক্ষমতা ধার করতে পারে।
3. কে কে এই ক্ষমতা পাবে, তার খাতা: **`/etc/sudoers`** ফাইল।

তার মানে সূত্রটা ভয়ংকর রকম সোজা:

```bash
sudo usermod -aG sudo shajal
# ব্যস — shajal এখন কার্যত root!
```

> **🏥 Analogy — হাসপাতাল:** root হলো **head surgeon** — operation theater-এর সব দরজা খোলা। sudo group হলো **senior doctor-দের তালিকা** — তারাও operation করতে পারে। আর বাকি সবাই? দাঁড়াও, nurse-দের গল্পটাই তো আসল...

**কিন্তু** — সবাইকে senior doctor বানালে হাসপাতাল চলে? তোমার automation script-টার কি _সব_ ক্ষমতা লাগে? Instructor-এর যুক্তিটা এখানে সোনার মতো দামি:

> _"আমাদের প্রায়ই automation script লিখতে হয়। script-এর হাতে সব permission থাকলে — একটা bug, একটা হ্যাক — **disaster।** তাই user-কে define করে দাও তার **boundary।**"_

এই চিন্তার নাম তিনি দিলেন **serviceop** — service operation-এর user। বানানো তিন ধাপে:

```bash
# ধাপ ১: নিজের একটা classification (দল) বানাও
sudo groupadd superadmin

# ধাপ ২: user-কে জন্মের সময়ই সেই দলে ঢোকাও
sudo useradd -G superadmin -m serviceop

# ধাপ ৩: /etc/sudoers.d/serviceop ফাইলে সীমানা লেখো:
serviceop ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

ধাপ ২-এর লাইনটা নিয়ে দুটো প্রশ্ন প্রায়ই আসে:

> **`-m` মানে কী এখানে?** ঠিক সোমবারেরই make home — `serviceop`-এর জন্যও `/home/serviceop` বানানো হলো। service account হলেও, নিজের script/config রাখার একটা ঘর দরকার বলে এখানে `-m` রাখা হয়েছে (সব service account-এর home লাগে না — কিন্তু এই lab-এ serviceop-এর ক্ষেত্রে instructor `-m` রেখেছেন)।
>
> **`-G superadmin` — এখানে `-a` নেই কেন? এটা কি মঙ্গলবারের ফাঁদ ২ না?** না — কারণ এটা **`useradd`** (creation), **`usermod`** (modification) না। নতুন user তখনো একদম কোরা — তার কোনো supplementary group-ই নেই, তাই "replace করার মতো" পুরনো কিছুই নেই, `-a` লাগেই না। **নিয়মটা মনে রাখো: `-a` শুধু `usermod`-এর সাথে দরকার, existing supplementary তালিকা বাঁচাতে। `useradd`-এ `-a` বলে কিছু হয়ই না — সেখানে `-G` মানেই "এই দলগুলো দিয়েই শুরু করো।"**
>
> তাহলে হ্যাঁ, তোমার ধারণাটা ঠিক — এই এক লাইনেই তিনটা কাজ একসাথে: **serviceop নামে user তৈরি + একই মুহূর্তে superadmin group-এর সদস্য বানানো + home directory বানানো।**

তৃতীয় লাইনটা টুকরো করে পড়ি — `serviceop ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx`:

- `serviceop` — নিয়মটা কার জন্য
- প্রথম `ALL` — কোন **host/সার্ভার** থেকে এটা কার্যকর (ALL = যেকোনো সার্ভার থেকে লগইন করলেই প্রযোজ্য — একই sudoers ফাইল একাধিক সার্ভারে share হলে এটা কাজে লাগে)
- `(ALL)` — কোন **user-এর পরিচয়ে** কমান্ডটা চালাতে পারবে (ALL = root-সহ যে কারো পরিচয়ে; চাইলে `(nginx)` লিখে শুধু nginx user-এর পরিচয়েই সীমিত করা যেত)
- `NOPASSWD:` — sudo চালানোর সময় নিজের password চাইবে না (না থাকলে প্রতিবার password টাইপ করতে হতো)
- `/usr/bin/systemctl restart nginx` — **হুবহু** এই কমান্ডটাই, আর কিছু না

তোমার ধারণাটাই ঠিক — serviceop **সত্যিই খালি এই একটা কাজই** করতে পারবে। `systemctl status nginx`-ও আটকে যাবে (path হুবহু না মিললে sudoers কিছুই ধরে নেয় না), `systemctl restart apache2`-ও আটকাবে, `/etc/passwd` ছোঁয়া তো দূরের কথা।

**দ্বিতীয় প্রশ্ন — একই কাজের জন্য (শুধু nginx restart) আরও user লাগলে?** দুইভাবে করা যায়:

১. **(খারাপ উপায়, স্কেল করে না):** প্রতি user-এর জন্য আলাদা লাইন —

```
serviceop  ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
serviceop2 ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
serviceop3 ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

১০ জন হলে ১০ লাইন, নতুন কেউ এলে আবার একটা লাইন লিখতে ভুলে যাওয়ার ঝুঁকি — ঠিক শনিবারের "১২ জনের কিট" সমস্যার পুনরাবৃত্তি!

২. **(ঠিক উপায় — এই লেসনের মূলমন্ত্রেরই প্রয়োগ: group-কে ক্ষমতা দাও, user-কে না):**

```bash
sudo groupadd nginx-operators
sudo usermod -aG nginx-operators serviceop
sudo usermod -aG nginx-operators serviceop2
```

আর `/etc/sudoers.d/nginx-operators` ফাইলে (group নামের আগে `%` বসে):

```
%nginx-operators ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

এখন নতুন কেউ এই ক্ষমতা পেতে চাইলে খালি এক লাইন: `usermod -aG nginx-operators <নতুন-user>` — sudoers ফাইল আর কক্ষনো ছুঁতে হবে না।

> **🏥 Analogy সম্পূর্ণ হলো:** serviceop হলো সেই **nurse** — যাকে বলা আছে "তুমি ইনজেকশন দিতে পারবে, অপারেশন না।" হাসপাতাল নিরাপদ থাকে ঠিক এই তালিকাগুলোর জোরেই। (DevOps-এর ভাষায় এর নাম **Principle of Least Privilege** — যতটুকু দরকার, ঠিক ততটুকুই।)

আর দুটো ছোট নিয়ম যেগুলো কখনো ভুলবে না:

- `/etc/sudoers` **কখনো সরাসরি editor দিয়ে খুলবে না** — একটা syntax ভুলে পুরো sudo সিস্টেম অচল (নিজেও আর ঢুকতে পারবে না!)। সবসময় `visudo` — সে save-এর আগে যাচাই করে।
- নিজের নিয়ম রাখো **আলাদা ফাইলে** `/etc/sudoers.d/` ফোল্ডারে — ভুল হলে শুধু ওই ফাইলটা মুছলেই মুক্তি।

**উদাহরণ দিয়ে বুঝি কেন এত সাবধানতা।** ধরো তুমি `sudo nano /etc/sudoers` দিয়ে সরাসরি ফাইলটা খুললে, আর একটা bracket বাদ পড়ে গেল:

```
%sudo ALL=(ALL ALL     ← বন্ধ bracket ")" লিখতে ভুলে গেছ
```

Save করে বেরিয়ে এলে। এবার তুমি নিজে যদি আবার sudo চালাতে চাও — এমনকি এই ভুলটা ঠিক করার জন্যও:

```bash
sudo nano /etc/sudoers
```

```
sudo: /etc/sudoers: syntax error near line 28
sudo: no valid sudoers sources found, quitting
```

**sudo নিজেই আর কাজ করছে না** — আর ঠিক করতে তো sudo-ই লাগে! এখন পুরোপুরি আটকে গেলে। (উপায় থাকে — সার্ভারের সরাসরি console/single-user mode দিয়ে ঢুকে হাতে ঠিক করা — কিন্তু cloud সার্ভারে এটা বিরাট ঝামেলা, অনেক সময় পুরো instance-ই নতুন করে বানানো লাগে।)

`visudo` ঠিক এই বিপদ থেকে বাঁচায়: সে ফাইলটা একটা **temporary কপিতে** edit করতে দেয়, আর তুমি save করতে চাইলেই আগে সিনট্যাক্স যাচাই করে। ভুল থাকলে save-ই হতে দেয় না — বলে "এখানে ভুল আছে, ঠিক করো বা বাতিল করো।" ভুল ফাইল কখনো আসল `/etc/sudoers`-এ পৌঁছায়ই না।

আর `/etc/sudoers.d/`-তে নিজের নিয়ম আলাদা রাখার সুবিধা: main `/etc/sudoers` ফাইলটা distro-র নিজের, ভালোভাবে পরীক্ষিত — সেটা তুমি কখনোই ছোঁও না। তোমার নিজের নিয়ম (`serviceop`, `nginx-operators`) থাকে ছোট আলাদা ফাইলে (`/etc/sudoers.d/serviceop`), যেটা `visudo -f /etc/sudoers.d/serviceop` দিয়ে খোলো — এখানেও সেভের আগে একই যাচাই হয়। কোনো কারণে গণ্ডগোল হলে খুঁজতে হবে একটা ছোট ফাইলে, বিশাল main ফাইল ঘাঁটতে হয় না — আর যদি অন্য কোনোভাবে root access থাকে (যেমন আগে থেকে খোলা আরেকটা root session), শুধু ওই ছোট ফাইলটা মুছে দিলেই (`rm /etc/sudoers.d/serviceop`) মুক্তি, distro-র main ফাইল অক্ষত থেকে যায়।

**এখন পুরো ছবিটা এক ফ্রেমে** — instructor বোর্ডে যা এঁকেছিলেন, এখানে আজকের গল্পের নাম দিয়েই আবার সাজানো হলো:

| কে                           | কোন resource/operation ছুঁতে পারে                                                                 | ক্ষমতাটা কীভাবে পেল                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **root**                     | পুরো গাছের **যেকোনো** node — `/etc/shadow`, সবার home, সব — সব                                    | জন্ম থেকেই, কোনো group লাগেই না                                               |
| **shajal** (devops-এর সদস্য) | শুধু সেই resource, যা `devops` group-কে দেওয়া আছে (permission lesson-এ বিস্তারিত)                | নিজে সরাসরি না — **devops group**-এর member হয়ে, পরোক্ষভাবে                  |
| **serviceop**                | শুধু **একটা নির্দিষ্ট কমান্ড**: `systemctl restart nginx` — `/etc/sudoers.d/serviceop`-এ লেখা বলে | file system-এর কোনো node না — root-এর ক্ষমতার এক চিলতে ধার, **অপারেশন-স্তরে** |

তিন সারি মিলিয়ে একটাই প্যাটার্ন বেরোয়:

```
resource/operation  ⟶  কোন group/নিয়মে দেওয়া আছে  ⟶  সেই group-এ কে কে আছে
```

shajal নিজে কখনো "আমাকে ওই resource-এ access দাও" বলে সরাসরি অনুমতি পায় না — সে devops group-এ ঢোকে (মঙ্গলবারের `usermod -aG`), আর devops group-কে আগে থেকেই সেই resource-এর অনুমতি দেওয়া থাকে। ঠিক একইভাবে serviceop নিজে "আমাকে nginx restart করতে দাও" বলে না — sudoers-এর একটা লাইনে তার নামে (বা তাকে কোনো group-এ রেখে সেই group-এর নামে) একটা নির্দিষ্ট অপারেশনের অনুমতি লেখা থাকে।

**এক বাক্যে পুরো শুক্রবার:** _User নিজে ক্ষমতা রাখে না — group বা sudoers-এর নিয়মের মধ্য দিয়ে ক্ষমতা তার কাছে পৌঁছায়। root এই নিয়মের একমাত্র exception।_

### 📅 শনিবার: ১২ জনের অফিস-কিট — `/etc/skel`

শেষ দিনের গল্পটা instructor-এর নিজের অভিজ্ঞতা থেকে। GolpoTech-এর একটা **bastion server** আছে (যে সার্ভার দিয়ে বাকি সব সার্ভারে ঢোকা হয়)। সেখানে **১২ জন DevOps engineer** কাজ করে। কোম্পানির নিয়ম: _প্রতিটা user টার্মিনালে যা যা কমান্ড চালায়, সব একটা log server-এ জমা হতে হবে_ (audit-এর জন্য)।

তার মানে প্রত্যেক user-এর ঘরে একটা logging script বসাতে হবে। ১২ জনের ঘরে ঢুকে ১২ বার copy-paste? আর **১৩ নম্বর জন জয়েন করলে?** আবার মনে করে বসাতে হবে — আর মনে না থাকলে সেই user-এর কোনো log-ই নেই। 😱

Linux-এর উত্তর: **`/etc/skel`** (skeleton = কঙ্কাল/ছাঁচ)।

```bash
ls -la /etc/skel
```

```
.bashrc  .profile  .bash_logout
```

**কমান্ডটা ভেঙে পড়ি:**

- **`-a`** (all) — **হিডেন ফাইলও দেখাও।** Linux-এ যে ফাইলের নাম **টেলা (`.`)** দিয়ে শুরু, সেটা ডিফল্ট `ls`-এ লুকানো থাকে (নিজের config ফাইল দিয়ে সাধারণ লিস্টিং এলোমেলো না হওয়ার convention)। `/etc/skel`-এর সবগুলো ফাইলই `.` দিয়ে শুরু — তাই `-a` ছাড়া `ls /etc/skel` চালালে **কিচ্ছু দেখাবে না**, মনে হবে ফোল্ডারটা ফাঁকা!
- **`-l`** (long) — প্রতিটার permission, owner, সাইজ, তারিখ — বিস্তারিত এক লাইনে।

তিনটা ফাইলের মানে:

- **`.bashrc`** — bash চালু হওয়ার **প্রতিবার** (প্রতিটা নতুন terminal/session-এ) যা চলবে: alias (`ll`, `myinfo`), custom prompt, শর্টকাট। তুমি যখনই নতুন terminal খোলো, এই ফাইলটাই আগে execute হয়ে তোমার পরিবেশ সাজায়।
- **`.profile`** — শুধু **login**-এর সময় (প্রথমবার শেল ঢোকার মুহূর্তে) **একবার** চলে — environment variable (`PATH`, `EDITOR`) সেট করার জায়গা; বারবার চালানোর দরকার নেই এমন জিনিস এখানে থাকে।
- **`.bash_logout`** — উল্টো দিক: **logout করার মুহূর্তে একবার** চলে — যেমন স্ক্রিন clear করা, temp ফাইল মুছে ফেলা — "বিদায়ের আগে ঘর গুছিয়ে যাওয়া।"

> **🏠 Analogy:** `.profile` হলো সকালে অফিসে ঢুকে ID card swipe করার মুহূর্তে যা যা সেট-আপ হয় (ডেস্কের লাইট, কম্পিউটার লগইন) — একবারই। `.bashrc` হলো প্রতিবার নিজের ডেস্কে ফিরে বসলে যা রেডি পাও (পছন্দের mug, keyboard shortcut) — বারবার। `.bash_logout` হলো বের হওয়ার সময় লাইট বন্ধ করে যাওয়া।

নিয়মটা এক লাইনের: **`useradd -m` চালানোর মুহূর্তে `/etc/skel`-এর ভেতরের সবকিছু হুবহু কপি হয়ে যায় নতুন user-এর home-এ।** তাহলে সমাধান? logging script-টা **একবার** `/etc/skel`-এ রেখে দাও — এরপর যে-ই জন্মাবে, script **জন্ম থেকেই** তার ঘরে। ১৩, ১৪, ১০০ নম্বর engineer — কারো জন্য আর হাত লাগবে না।

> **🏠 Analogy — তোমার OOP মাথার জন্য (instructor-এর নিজের উপমা):** `/etc/skel` হলো **Class**, প্রতিটা নতুন user-এর home হলো সেই class-এর **Object।** Class-এ একটা property যোগ করো — এরপরের সব object সেটা নিয়েই জন্মাবে। (আগের object-রা পাবে না — কপি তো জন্মের সময় হয়েছিল! এটাও interview-প্রশ্ন হয়।)
>
> **বিকল্প উপমা:** নতুন employee-র **welcome kit** — HR আগে থেকে ব্যাগ গুছিয়ে রাখে (ল্যাপটপ, ID কার্ড, নোটবুক); যে-ই জয়েন করে, একই ব্যাগ পায়।

---

## 🔬 TRACING — পুরো সপ্তাহটা ৮ লাইনে

Play চেপে দেখো — সোমবার থেকে মঙ্গলবারের ঘটনাগুলো, প্রতি ধাপে shajal-এর পরিচয় কীভাবে বদলায়। **প্রতিটা লাইনের আগে নিজে predict করো** `id` কী দেখাবে:

```animation
{"type":"trace","title":"দল বানাও → মানুষ বানাও → bind করো → পরিদর্শন","code":["sudo groupadd minions","sudo useradd shajal","id shajal","sudo usermod -g minions shajal","sudo groupadd devops","sudo usermod -aG devops shajal","id shajal","groups shajal"],"steps":[
 {"line":1,"vars":{"দল":"minions (ফাঁকা)"},"note":"ক্লাবঘর উঠলো — কিন্তু মেম্বার শূন্য। groupadd শুধু দল বানায়, কাউকে ঢোকায় না"},
 {"line":2,"vars":{"user":"shajal"},"note":"খাতায় নাম উঠলো। খেয়াল করো: minions-এর সাথে এখনো কোনো সম্পর্কই হয়নি — বানানো আর বাঁধা আলাদা কাজ"},
 {"line":3,"out":"uid=1001(shajal) gid=1001(shajal) groups=1001(shajal)","note":"প্রমাণ: primary group এখনো তার নিজের নামের একলা-দল — useradd নিজেই বানিয়ে দেয়"},
 {"line":4,"vars":{"shajal-র primary":"minions"},"note":"ছোট -g = primary বদল। একলা-দল থেকে minions-এ উঠে এলো তার মূল পরিচয়"},
 {"line":5,"vars":{"দল":"minions, devops"},"note":"দ্বিতীয় ক্লাবঘর — devops"},
 {"line":6,"vars":{"shajal-র দলগুলো":"minions + devops"},"note":"-aG = append+Groups: minions (primary) অক্ষত রেখে devops-এ বাড়তি সদস্যপদ। এখানে -g চাপলে primary-ই বদলে যেত — ফাঁদ ১!"},
 {"line":7,"out":"uid=1001(shajal) gid=1002(minions) groups=1002(minions),1003(devops)","note":"পড়ো: gid= বলছে primary (minions), groups= বলছে সব দল। এই এক লাইন পড়তে পারা মানেই আজকের অর্ধেক লেসন"},
 {"line":8,"out":"shajal : minions devops","note":"groups-এর সংক্ষিপ্ত উত্তর — আগে primary, পরে supplementary-রা"}
]}
```

### 🧪 নিজে চেষ্টা করো — ফাঁদ দুটো সত্যিই বুঝেছো?

```reveal
{"prompt":"shajal-এর অবস্থা: primary=minions, supplementary=devops। কেউ চালালো: sudo usermod -G sudo shajal (লক্ষ্য করো — -a নেই!)। এখন groups shajal কী দেখাবে?","code":"sudo usermod -G sudo shajal\ngroups shajal","answer":"shajal : minions sudo — devops উধাও!","explanation":"-a ছাড়া -G মানে replace: পুরনো supplementary তালিকা (devops) মুছে নতুন তালিকা (sudo) বসলো। primary (minions) বেঁচে গেছে — সে -g-র এলাকা। production-এ এই ভুলে মানুষ টিমের access হারায় — মন্ত্রটা আবার: যোগ করতে সবসময় -aG।"}
```

```reveal
{"prompt":"Instructor-এর ক্লাসের প্রশ্ন: superadmin নামে group বানিয়ে serviceop আর rootuser-কে ঢোকালাম — ওরা কি এখন সিস্টেমের full access পেয়ে গেছে?","code":"sudo groupadd superadmin\nsudo useradd -G superadmin -m serviceop\nsudo useradd -G superadmin -m rootuser","answer":"না! superadmin এখনো শুধু একটা নাম — ক্ষমতাশূন্য।","explanation":"group বানানো মানে শুধু ঘোষণা: 'এই নামে একটা দল আছে।' ক্ষমতা আসে /etc/sudoers থেকে — সেখানে %superadmin-এর entry দিলে (বা দলটাকে sudo group-এর ক্ষমতা দিলে) তবেই সদস্যরা শক্তি পাবে। আগে classification, তারপর ক্ষমতার সংজ্ঞা — এই ক্রমটাই design-চিন্তা।"}
```

```reveal
{"prompt":"বৃহস্পতিবারের সিদ্ধান্ত: রাফি ভাই ৩ মাসের ছুটিতে। junior-টা বললো 'userdel -r rafi চালিয়ে দিই?' — তুমি কী বলবে, আর সঠিক কমান্ড কী?","code":"# junior-র প্রস্তাব:\nsudo userdel -r rafi   # ???","answer":"না!! -r দিলে home-সহ তার ৩ বছরের সব কাজ চিরতরে মুছে যাবে। সঠিক: sudo usermod -L rafi — ফিরে এলে -U।","explanation":"ছুটি = তালা (data অক্ষত, login বন্ধ)। delete শুধু স্থায়ী বিদায়ে — এবং তখনও -r দেওয়ার আগে data-রাখার নীতি চেক। এক অক্ষরের সিদ্ধান্তে কারো বছরের কাজ ঝুলে থাকে।"}
```

---

## 🚫 COMMON MISTAKES — এই পাঁচটা ভুলে সার্ভার কাঁদে

**১. `-G` লিখে `-a` ভুলে যাওয়া** → আগের সব supplementary মুছে replace। _যোগ করতে হলে `-aG` — জোড়া অক্ষর।_

**২. supplementary দিতে গিয়ে ছোট `-g` চাপা** → primary group-টাই বদলে যায়। _ছোট g = primary, বড় G = supplementary।_

**৩. `useradd` চালিয়ে অবাক: "home কই?"** → plain useradd ঘর বানায় না। _মানুষ = `-m`, bot/script = `-m` ছাড়া।_

**৪. ছুটির মানুষকে `userdel`** → data চিরতরে শেষ। _সাময়িক = `-L` তালা, স্থায়ী = তবেই delete।_

**৫. `/etc/sudoers` সরাসরি nano-তে খোলা** → এক syntax ভুলে **sudo-ই অচল**, আর ঠিক করারও পথ বন্ধ (ঠিক করতেও তো sudo লাগে!)। _সবসময় `visudo`, নিজের নিয়ম `/etc/sudoers.d/`-তে।_

---

## 📋 আজকের cheat-table

| কাজ                   | কমান্ড                     | মনে রাখো                    |
| --------------------- | -------------------------- | --------------------------- |
| দল বানাও              | `groupadd <নাম>`           | ক্লাবঘর — মেম্বার আলাদা ধাপ |
| user বানাও (ঘরসহ)     | `useradd -m <নাম>`         | -m নাই = ডেস্ক নাই          |
| জন্মেই দলে            | `useradd -G <দল> -m <নাম>` |                             |
| মূল পরিচয় (primary)  | `usermod -g <দল> <user>`   | **ছোট g**                   |
| দলে যোগ (আগেরটা রেখে) | `usermod -aG <দল> <user>`  | **-a ভুললে replace!**       |
| superpower            | `usermod -aG sudo <user>`  | = কার্যত root               |
| তালা / খোলা           | `usermod -L` / `-U`        | data অক্ষত                  |
| বিদায়                | `userdel [-r] <user>`      | -r = ঘরসহ                   |
| পরিচয়পত্র            | `id <user>`                | gid = primary               |
| দলের তালিকা           | `groups <user>`            | আগে primary                 |
| user-দের খাতা         | `cat /etc/passwd`          | ৭ ঘর, x = shadow-তে         |
| দলের খাতা             | `cat /etc/group`           | supplementary এখানে         |
| ক্ষমতার খাতা          | `/etc/sudoers` (+ `.d/`)   | শুধু `visudo`               |
| নতুন user-এর ছাঁচ     | `/etc/skel`                | Class → Object              |

---

## 🎯 Key Takeaways — সপ্তাহের সারাংশ

1. **সোমবার:** Linux মানুষ চেনে নম্বরে (UID/GID, root=0)। `useradd -m` = খাতায় নাম + ঘর; `-m` ছাড়া = শুধু নাম।
2. **মঙ্গলবার:** বানানো ≠ বাঁধা। primary একটাই (`-g`), supplementary যত খুশি (`-aG`) — আর `-a` ভুললে replace-দুর্ঘটনা।
3. **বুধবার:** সব তথ্য ফাইলে — `/etc/passwd` (পরিচয়, ৭ ঘর), `/etc/shadow` (গোপন, root-only), `/etc/group` (দল) — তাই `/etc`-ই সবচেয়ে স্পর্শকাতর জায়গা।
4. **বৃহস্পতিবার:** ছুটি = `-L` তালা (data বাঁচে), বিদায় = `userdel` — দুটো গুলিয়ো না।
5. **শুক্র-শনি:** sudo group-এ ঢোকা = root হওয়া; তাই serviceop-চিন্তা — দল বানাও, `/etc/sudoers.d/`-তে সীমানা লেখো, user-কে দলে ঢোকাও। আর `/etc/skel` = user-দের Class, যা দিয়ে ১২ জনের অফিস-কিট এক জায়গা থেকে আসে। **মূলমন্ত্র: user ক্ষমতা পায় group-এর মাধ্যমে, সরাসরি না।**

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: একটা কোম্পানির ৩টা department (dept1/2/3) — access management design করো।**

> সরাসরি user-কে কিছু দেব না। **প্রতি department = একটা group;** file system-এ প্রতি department-এর নিজের directory, আর সেই directory-র access শুধু সেই group-এর। নতুন employee এলে এক লাইন: `usermod -aG dept2 user` — permission নিজে নিজেই follow করে। ছুটিতে গেলে `-L`, ছাড়লে group থেকে বাদ/`userdel`। cross-cutting টিমের (DevOps) জন্য আলাদা group; privileged operation-এর জন্য `/etc/sudoers.d/`-তে command-level সীমানা (least privilege); আর সব নতুন user-এর baseline setup (logging, aliases) `/etc/skel`-এ। ফলে মানুষ বদলায়, নিয়ম বদলায় না।

**Q: `usermod -g` আর `usermod -aG`-র পার্থক্য?**

> `-g` primary group **বদলায়** (একটাই থাকে); `-aG` supplementary-তে **যোগ করে** আগেরগুলো রেখে। `-a` ছাড়া `-G` supplementary তালিকা **replace** করে — কমন production ভুল, এতে মানুষ হুট করে sudo/team access হারায়।

**Q: user lock আর delete-এর তফাত, কখন কোনটা?**

> `-L` শুধু authentication বন্ধ করে (shadow-র hash-এ `!`), data-membership সব থাকে — offboarding-এর আগে বা ছুটিতে এটাই। `userdel [-r]` স্থায়ী — data-retention নীতি নিশ্চিত হয়ে তবেই, বিশেষত `-r`।

---

## ➡️ WHAT'S NEXT?

কুইজ দাও (১৫টা, ৯৫% = pass)। তারপর **🔧 LAB: Linux User and Group Management** — এই পুরো সপ্তাহের গল্পটা তোমার নিজের টার্মিনালে: minions গড়বে, shajal-minhaz-yasin-দের জন্ম দেবে, বাঁধবে, তালা দেবে — আর ডানের 👥 প্যানেলে প্রতিটা সদস্যপদ সবুজ হতে দেখবে। 🐧
