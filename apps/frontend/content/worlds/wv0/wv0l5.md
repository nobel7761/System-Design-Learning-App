---
id: wv0l5
world: wv0
order: 5
title: "🔧 LAB EXAM: Linux User and Group Management"
titleEn: "LAB: Linux User and Group Management"
estMinutes: 30
type: workshop
---

> **🔧 SESSION 2 of 2 — LAB EXAM (৩০ মিনিট)**
> আগের লেসনে instructor-এর minions-দল আর shajal-minhaz-yasin-দের গল্পটা পড়েছো — এবার **পুরোটা তোমার নিজের হাতে।** নিচের টার্মিনালে user বানাবে, দলে ঢোকাবে, তালা দেবে — আর ডানে **লাইভ দেখবে কে কোন দলে ঢুকছে।**
> প্রথম চেষ্টায় সঠিক = পুরো নম্বর। **৯৫% = PASSED।**

---

## 🎮 এবারের ভিজ্যুয়ালটা নতুন

- ডানে এবার ফাইলের গাছ না — **👥 Groups & Users প্যানেল:** প্রতিটা group একটা বাক্স, ভেতরে user-দের চিপ
- user তৈরি করলে চিপটা **হলুদ** হবে (আছে, কিন্তু দলে ঢোকেনি) → দলে bind করলেই **সবুজ** ✅
- **1°** ব্যাজ মানে সেটা তার **primary** group, **🔒 মানে locked**
- `id`, `groups`, `cat /etc/passwd` — সব আসল Linux-এর মতোই কাজ করে; এমনকি `-a` ছাড়া `-G` দেওয়ার সেই বিখ্যাত ভুলটাও এখানে **সত্যি সত্যি ঘটবে** — সাবধান 😉

## 📖 শুরুর আগে

- Session 1 (Linux User Management লেসন) পড়া শেষ তো? ⌨️ Commands প্যানেলটা ঝালিয়ে নাও — exam-এর সময় আর দেখা যাবে না
- `sudo` লেখো বা না লেখো দুটোই চলবে (তুমি root হিসেবেই আছো, Poridhi ল্যাবের মতো)

নিচে exam। শেষ করে ১৫-প্রশ্নের কুইজ — দুটো মিলিয়ে লেসন complete। 🐧
