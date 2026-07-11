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
> আজ টার্মিনাল লাগবে না — আজ মাথার কাজ। পরের সেশনে (🔧 LAB: Linux User and Group Management) সব নিজের আঙুলে চালাবে।

---

## 🎬 HOOK — ২০০টা সার্ভার, একজন নতুন employee

Instructor ক্লাসটা শুরুই করলেন এই দৃশ্য দিয়ে: ধরো তোমার কোম্পানির on-premises-এ **১০০-২০০টা সার্ভার** চলছে। আজ সকালে দুটো ঘটনা ঘটলো —

1. **নতুন একজন engineer জয়েন করলো।** তাকে ২০-৩০টা সার্ভারে ঢোকার অনুমতি দিতে হবে — কিন্তু সবগুলোতে না, আর সব ফোল্ডারে তো না-ই।
2. **একজন পুরনো employee চাকরি ছেড়ে দিলো।** আজকের মধ্যে তার সব access **revoke** করতে হবে — একটা সার্ভারেও যেন সে আর ঢুকতে না পারে।

এখন ভাবো — ২০০টা সার্ভারে একে একে ঢুকে হাতে হাতে অনুমতি দেওয়া/কাড়া সম্ভব? আর ভুল করে একটা সার্ভারে access রয়ে গেলে? সেটা একটা **security দুর্ঘটনার অপেক্ষা।**

Linux এই সমস্যাটা সমাধান করে তিনটা শব্দ দিয়ে: **User, Group, Permission।** আজ প্রথম দুটো — কে কে আছে (user), আর কারা কোন দলে (group)। বিল্ডিং তুমি আগের লেসনে চিনেছো; আজ শিখবে **বিল্ডিংয়ের চাবি কার হাতে কয়টা।** 🔑

---

## 🤔 WHY — এটা DevOps-এর নাকি HR-এর কাজ?

দুটোই! আর সেজন্যই এটা এত দামি স্কিল:

- **Onboarding/offboarding automation:** নতুন developer এলে এক script-এ user + group + permission — এটা DevOps-এরই রোজকার কাজ
- **Docker security:** Instructor আগেই ইঙ্গিত দিলেন — Dockerfile-এ প্রায়ই লেখা থাকে "একটা user বানাও, সে শুধু এই কাজটুকুই করতে পারবে।" Container-এর ভেতরের user যেন নিজের ঘর ছেড়ে অন্য কোথাও **traverse করতে না পারে** — এই চিন্তাটাই আজকের ক্লাসের মূল দর্শন
- **Interview:** "একটা কোম্পানির ৩টা department-এর জন্য access management design করো" — instructor বললেন এটা কমন প্রশ্ন, আর উত্তরটা আজকের লেসনেই

---

## 🧭 CONCEPT JOURNEY

### Step 1: User আর Group — সবাই আসলে সংখ্যা

Linux মানুষ চেনে না, **সংখ্যা চেনে:**

| জিনিস | পরিচয়             | উদাহরণ                                    |
| ----- | ------------------ | ----------------------------------------- |
| User  | **UID** (User ID)  | root-এর UID = 0, প্রথম সাধারণ user ≈ 1000 |
| Group | **GID** (Group ID) | প্রতিটা group-এর নিজের নম্বর              |

> **Analogy:** অফিসের ID কার্ড। তোমার নাম যা-ই হোক, দরজার লক চেনে কার্ডের নম্বরটা। `shajal` নামটা মানুষের সুবিধার জন্য — Linux ভেতরে ভেতরে UID দিয়েই সব হিসাব করে।

### Step 2: Primary vs Supplementary Group — instructor-এর junior engineer

প্রতিটা user-এর **দুই ধরনের দল** থাকে — এটা আজকের এক নম্বর কনসেপ্ট:

- **Primary group** — তার মূল দল, **একটাই।** Instructor-এর ভাষায়: নতুন junior engineer জয়েন করলে কিছু common access সবাইকেই দিতে হয় — company-তে ঢুকলেই যে দলে পড়ো, সেটাই primary।
- **Supplementary group** — primary-র **বাইরে** আরও যত দলের সদস্য সে। যেমন সেই junior-কে পরে `devops` টিমেও নেওয়া হলো — `devops` তখন তার supplementary group।

এই supplementary group-এর তথ্যগুলো কোথায় থাকে? একটা ফাইলে: **`/etc/group`** — মনে আছে তো, Linux-এ সবই ফাইল!

### Step 3: বানাও আর বাঁধো — instructor-এর minions দল 😄

Instructor বোর্ডে লাইভ যা করলেন — একটা group, চারজন user:

```bash
sudo groupadd minions                # দল তৈরি
sudo useradd shajal                  # user তৈরি (basic — home directory নেই!)
sudo useradd minhaz
sudo useradd -m yasin                # -m দিলে /home/yasin-ও তৈরি হয়
```

দুটো জিনিস আলাদা করে ধরো:

1. **`useradd` কাজ করে user-space-এ, `groupadd` কাজ করে group-space-এ** — দুটো আলাদা জগত। বানালেই কিন্তু **bind হয় না!** দল আছে, মানুষ আছে — কিন্তু কে কোন দলে, সেটা এখনো বলা হয়নি।
2. **`-m` ছাড়া `useradd` = গৃহহীন user।** `-m` মানে make home — `/home/<নাম>` ফোল্ডারটাও বানিয়ে দাও।

এবার **bind** — আর এখানেই সবচেয়ে বড় ফাঁদটা লুকিয়ে আছে:

```bash
sudo usermod -g minions shajal       # -g (ছোট হাতের) = PRIMARY group সেট/বদল
sudo usermod -aG devops shajal       # -aG = supplementary হিসেবে ADD (devops group আগে বানাতে হবে)
```

- `usermod` = user-কে modify করছি
- `-g` = **primary** group বদলাচ্ছি
- `-aG` = **a**ppend + **G**roups — আগের দলগুলো **রেখে** নতুন দলে যোগ

⚠️ **Instructor-এর সাবধানবাণী দুটো মুখস্থ করো:**

- shajal ইতিমধ্যে minions-এ (primary) আছে। devops-এ যোগ করার সময় ভুল করে `-aG`-র জায়গায় `-g` দিলে? **primary-টাই minions থেকে সরে devops হয়ে যাবে!**
- আর `-a` ছাড়া শুধু `-G devops` দিলে? আগের সব supplementary group **মুছে গিয়ে** শুধু devops থাকবে। Production-এ এই ভুলে মানুষের sudo access উড়ে যাওয়া নিয়মিত ঘটনা।

### Step 4: পরিদর্শন — কে কোথায় আছে দেখো

```bash
id shajal          # uid=1001(shajal) gid=1002(minions) groups=1002(minions),1003(devops)
groups shajal      # shajal : minions devops
cat /etc/passwd    # সব user-এর খাতা
cat /etc/group     # সব group-এর খাতা
```

`id`-র output পড়তে শেখো: `uid` = তার নম্বর, `gid` = **primary** group, `groups` = primary + সব supplementary।

আর `cat /etc/passwd` নিয়ে instructor-এর মোক্ষম observation: **passwd এখানে directory না, ফাইল** — tree-র ভাষায় **terminal node** (যার child নেই)। আগের লেসনের সেই tree-চিন্তা এখানেও:

```
/
├── etc                    ← directory (child আছে)
│   ├── passwd             ← file: সব user-এর তথ্য
│   ├── group              ← file: সব group + supplementary তথ্য
│   ├── shadow             ← file: encrypted password
│   └── sudoers            ← file: কে superpower পাবে
└── home
    └── yasin              ← -m দিয়ে বানানো home
```

`/etc/passwd`-র এক লাইন ভেঙে পড়ো:

```
shajal:x:1001:1002:comment:/home/shajal:/bin/bash
  ↑    ↑   ↑    ↑             ↑           ↑
 নাম password UID GID(primary) home      shell
      (x = আসলটা /etc/shadow-তে encrypted)
```

আর এজন্যই instructor বললেন: **`/etc` হলো সার্ভারের সবচেয়ে খতরনাক path** — কেউ এটা penetrate করতে পারলেই সব শেষ। user, group, password, sudo — সব চাবি এই এক ফোল্ডারে।

### Step 5: চুটিতে গেলে Lock — মোছা না

Instructor-এর scenario: একজন user ৩ মাসের ছুটিতে গেলো। account **মুছে দেবে?** না! ফিরে এসে তার সব ফাইল লাগবে। সমাধান — **তালা:**

```bash
sudo usermod -L shajal     # Lock — ঢুকতে পারবে না, কিন্তু কোনো data হারাবে না
sudo usermod -U shajal     # Unlock — ফিরে এলে তালা খোলো
```

মুছতে চাইলে তবেই `userdel shajal` (home রেখে) বা `userdel -r shajal` (home-সহ)।

### Step 6: root আর sudo — সবচেয়ে বড় চাবির গোছা

Instructor এখানে সিস্টেমটার ভিত খুলে দেখালেন:

- **User-জগতে একজন default থাকে: `root`** — super admin, UID 0। সে tree-র **যেকোনো node-এ traverse করতে পারে, যেকোনো operation চালাতে পারে**
- **Group-জগতে একটা default থাকে: `sudo` group** — এই group-ই সবচেয়ে খতরনাক। root নিজে এই group-এর সদস্য
- তার মানে সূত্রটা সোজা: **কাউকে `sudo` group-এ ঢোকালেই সে root-এর মতো ক্ষমতা পেয়ে যায়:**

```bash
sudo usermod -aG sudo shajal    # shajal এখন super user-দের দলে
```

আর কে কে এই superpower পাবে তার খাতা: **`/etc/sudoers`** ফাইল — এখানে যার নাম, সে যেকোনো node-এ যেকোনো কিছু।

### Step 7: serviceop — পুরো চাবির গোছা না, একটা চাবি

কিন্তু সবাইকে sudo দিলে তো disaster! Instructor-এর সমাধান — **সীমানা এঁকে দাও।** ধরো একটা user দরকার যে **শুধু nginx restart দিতে পারবে**, আর কিছু না:

```bash
sudo groupadd superadmin                 # নিজের classification বানাও
sudo useradd -G superadmin -m serviceop  # user-কে জন্মের সময়ই দলে ঢোকাও
```

তারপর `/etc/sudoers.d/serviceop` ফাইলে লিখে দাও সে ঠিক **কোন কোন command** চালাতে পারবে — যেমন শুধু `systemctl restart nginx`। ব্যাস — সেই user-এর boundary সংজ্ঞায়িত।

**কেন এত কষ্ট?** Instructor-এর উত্তরটা সোনার মতো: আমাদের প্রায়ই **automation script** লিখতে হয়। Script-এর হাতে সব permission থাকলে একটা bug-ই disaster। তাই প্রতিটা service user-এর হাতে **ঠিক যতটুকু দরকার, ততটুকুই** — এর নামই serviceop চিন্তা। (বড় দুনিয়ায় একে বলে _principle of least privilege_।)

চিন্তার ছবিটা instructor এভাবে আঁকলেন:

```
📁 File System (tree)  →  👥 Group  →  👤 User
   tree-র একটা node        সেই node-এর       group-এর
   (ভেতরে ১০০টা ফাইল       access কোন        সদস্য কারা?
   থাকুক, matter করে না)    group-এর কাছে?
```

**এই তিনটা প্রশ্ন দিয়েই Linux-এর পুরো access দুনিয়া চলে।**

### Step 8: /etc/skel — user-দের blueprint

শেষ কনসেপ্ট, আর তোমার OOP-মাথার জন্য instructor-এর analogy টা perfect: **class লিখে রাখো, object তৈরি হয় সেই ছাঁচে।** Linux-এ user-দের সেই class হলো **`/etc/skel`** (skeleton = কঙ্কাল/টেমপ্লেট):

```bash
ls -la /etc/skel      # .bashrc  .profile  .bash_logout — নতুন user-এর welcome kit
```

`useradd -m test` চালালেই `/etc/skel`-এর **সব ফাইল হুবহু কপি** হয়ে যায় `/home/test`-এ।

**বাস্তবে কোথায় লাগে?** Instructor-এর bastion server গল্পটা: একটা bastion server-এ ১২ জন DevOps engineer ঢুকে কাজ করে। Company-র নিয়ম — **প্রতিটা user কী কী command চালাচ্ছে তার log যেতে হবে log server-এ।** এখন ১২ জনের ঘরে হাতে হাতে logging script বসাবে? না — script-টা `/etc/skel`-এ রেখে দাও। এরপর যে user-ই তৈরি হবে, logging script **জন্ম থেকেই** তার ঘরে — automatic। **User-এর চেহারা কেমন হবে, skel দিয়েই shape করা যায়।**

---

## 🔬 TRACING — instructor-এর পুরো ফ্লো, লাইন ধরে ধরে

Play চেপে দেখো — minions থেকে devops পর্যন্ত, প্রতি ধাপে shajal-এর অবস্থা:

```animation
{"type":"trace","title":"group বানাও → user বানাও → bind করো → পরিদর্শন","code":["sudo groupadd minions","sudo useradd shajal","id shajal","sudo usermod -g minions shajal","sudo groupadd devops","sudo usermod -aG devops shajal","id shajal","groups shajal"],"steps":[
 {"line":1,"vars":{"groups":"minions"},"note":"group-space-এ minions জন্মালো — কিন্তু এখনো ফাঁকা দল, কোনো সদস্য নেই"},
 {"line":2,"vars":{"users":"shajal"},"note":"user-space-এ shajal জন্মালো — খেয়াল করো, minions-এর সাথে এখনো কোনো সম্পর্ক নেই! বানানো আর bind করা আলাদা"},
 {"line":3,"out":"uid=1001(shajal) gid=1001(shajal) groups=1001(shajal)","note":"id দেখাচ্ছে: primary group এখনো shajal-ই (useradd নিজের নামে একটা private group বানিয়ে দেয়)"},
 {"line":4,"vars":{"shajal_primary":"minions"},"note":"-g (ছোট হাতের) = primary group বদল — এখন shajal-এর মূল দল minions"},
 {"line":5,"vars":{"groups":"minions, devops"},"note":"আরেকটা দল — devops"},
 {"line":6,"vars":{"shajal_groups":"minions + devops"},"note":"-aG = append + Groups — আগের দল (minions) অক্ষত রেখে devops-এ যোগ। এখানে -g দিলে primary-টাই সরে যেত!"},
 {"line":7,"out":"uid=1001(shajal) gid=1002(minions) groups=1002(minions),1003(devops)","note":"gid = primary (minions), groups-এ দুটোই — ছবিটা পরিষ্কার"},
 {"line":8,"out":"shajal : minions devops","note":"groups কমান্ড এক লাইনে একই উত্তর দেয় — আগে primary, পরে supplementary"}
]}
```

### 🧪 নিজে চেষ্টা করো — ফাঁদটা ধরো

```reveal
{"prompt":"shajal-এর অবস্থা: primary=minions, supplementary=devops। এখন কেউ চালালো: sudo usermod -G sudo shajal (খেয়াল করো: -a নেই!)। এরপর shajal কোন কোন group-এ?","code":"sudo usermod -G sudo shajal\ngroups shajal   # কী আসবে?","answer":"shajal : minions sudo — devops উড়ে গেছে!","explanation":"-a ছাড়া -G মানে replace: আগের সব supplementary মুছে শুধু নতুন list-টা বসে। primary (minions) থাকে, কিন্তু devops হারিয়ে গেলো। এজন্যই মন্ত্র: supplementary যোগ করতে সবসময় -aG।"}
```

```reveal
{"prompt":"instructor-এর প্রশ্ন: superadmin group বানিয়ে serviceop আর rootuser-কে তাতে add করলাম। তারা কি এখন full access পাবে?","code":"sudo groupadd superadmin\nsudo useradd -G superadmin -m serviceop","answer":"না! superadmin শুধু একটা নাম — তার definition-ই এখনো দেওয়া হয়নি।","explanation":"group বানানো মানে শুধু 'এই নামে একটা দল আছে' ঘোষণা। ক্ষমতা আসে দুইভাবে: /etc/sudoers-এ group-টার এন্ট্রি থাকলে, বা group-টাকে sudo group-এর সাথে যুক্ত করলে। classification আগে, ক্ষমতা পরে।"}
```

---

## 🚫 COMMON MISTAKES — production-এ যেগুলো রক্তচাপ বাড়ায়

**১. `-G` লিখে `-a` ভুলে যাওয়া** — আগের সব supplementary group মুছে যায়। মন্ত্র: **যোগ করতে হলে `-aG`।**

**২. supplementary দিতে গিয়ে `-g` চেপে দেওয়া** — primary group-টাই বদলে যায়। ছোট g = primary, বড় G = supplementary।

**৩. `useradd` দিয়ে বানিয়ে অবাক হওয়া "home কই?"** — plain `useradd` home বানায় না; মানুষের জন্য user বানালে `-m` দাও।

**৪. ছুটিতে যাওয়া employee-র account `userdel` করে দেওয়া** — data-ও গেল! সাময়িক বিদায় = `usermod -L` (lock), স্থায়ী বিদায় হলে তবেই `userdel`।

**৫. `/etc/sudoers` সরাসরি nano/vim দিয়ে খোলা** — syntax ভুল হলে **সব sudo access ভেঙে যায়**, নিজেও ঢুকতে পারবে না। সবসময় `visudo` (সে save-এর আগে syntax check করে), আর নিজের নিয়ম রাখো আলাদা ফাইলে: `/etc/sudoers.d/`।

---

## 📋 আজকের cheat-table

| কাজ                   | কমান্ড                        | মনে রাখো                |
| --------------------- | ----------------------------- | ----------------------- |
| দল বানাও              | `groupadd <নাম>`              | group-space             |
| user বানাও (home-সহ)  | `useradd -m <নাম>`            | -m = make home          |
| জন্মেই দলে ঢোকাও      | `useradd -G <দল> -m <নাম>`    |                         |
| primary group সেট     | `usermod -g <দল> <user>`      | ছোট g = primary         |
| দলে যোগ (আগেরটা রেখে) | `usermod -aG <দল> <user>`     | **a না দিলে replace!**  |
| superpower দাও        | `usermod -aG sudo <user>`     | sudo group = root-তুল্য |
| তালা / খোলা           | `usermod -L` / `usermod -U`   | data হারায় না          |
| মুছে ফেলো             | `userdel [-r] <user>`         | -r = home-সহ            |
| কে, কোন দলে           | `id <user>` / `groups <user>` | gid = primary           |
| user-দের খাতা         | `cat /etc/passwd`             | file, directory না!     |
| দলের খাতা             | `cat /etc/group`              | supplementary এখানেই    |
| superpower-এর খাতা    | `/etc/sudoers` (+ `.d/`)      | শুধু visudo দিয়ে       |
| নতুন user-এর ছাঁচ     | `/etc/skel`                   | OOP-র class             |

---

## 🎯 Key Takeaways

1. Linux user/group চেনে **সংখ্যায়** — UID/GID; root-এর UID 0।
2. প্রতি user-এর **এক primary** (`-g`) + যত খুশি **supplementary** (`-aG`) group — আর `-a` ভুললে replace-দুর্ঘটনা।
3. বানানো ≠ bind করা: `useradd`/`groupadd` আলাদা জগতে কাজ করে, সম্পর্ক হয় `usermod`-এ।
4. সাময়িক বিদায় = **lock** (`-L`/`-U`), data অক্ষত; `/etc` হলো সার্ভারের সবচেয়ে স্পর্শকাতর জায়গা।
5. **sudo group-এ ঢোকা = root হয়ে যাওয়া** — তাই serviceop চিন্তা: group বানাও → সীমিত ক্ষমতা দাও (`/etc/sudoers.d/`) → user-কে দলে ঢোকাও। আর নতুন user-দের চেহারা বানায় `/etc/skel`।

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: একটা কোম্পানিতে ৩টা department (dept1, dept2, dept3) — access management কীভাবে design করবে?**

> User-দের সরাসরি permission দেব না — **department-প্রতি একটা group** বানাবো। File system-এ প্রতি department-এর নিজের directory (node) থাকবে, আর সেই node-এর access থাকবে শুধু সেই group-এর কাছে। নতুন employee এলে শুধু তার department-এর group-এ add (`usermod -aG dept2 user`) — permission আপনাআপনি। কেউ ছাড়লে group থেকে বাদ বা account lock। যত নিচের দিকে (গভীর node), access তত সংকীর্ণ — DevOps-দের মতো cross-cutting role-এর জন্য আলাদা group, আর privileged কাজের জন্য `/etc/sudoers.d/`-এ command-level সীমানা।

**Q: `usermod -g` আর `usermod -aG`-র পার্থক্য?**

> `-g` primary group **বদলায়** (একটাই থাকে); `-aG` supplementary group-এ **যোগ করে**, আগেরগুলো রেখে। `-a` ছাড়া `-G` দিলে আগের supplementary list মুছে replace হয় — এটা কমন production ভুল।

---

## ➡️ WHAT'S NEXT?

কুইজ দাও (১৫টা প্রশ্ন, ৯৫% = pass)। তারপর পরের সেশন: **🔧 LAB — Linux User and Group Management** — minions দল, shajal-minhaz-yasin, bind, lock, সব **তোমার নিজের হাতে**, লাইভ ভিজ্যুয়ালসহ। 🐧
