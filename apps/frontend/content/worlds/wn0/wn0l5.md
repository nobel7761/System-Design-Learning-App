---
id: wn0l5
world: wn0
order: 5
title: "List — চেনা array, নতুন জাদু (slicing)"
titleEn: "Lists & Slicing Magic"
estMinutes: 30
type: lesson
---

## 🎬 HOOK

ধরো তুমি নতুন একটা শহরে এসেছ। ভাষা নতুন, রাস্তাঘাট নতুন, সবকিছু অচেনা। হঠাৎ রাস্তায় দেখা তোমার ৫ বছরের পুরনো বন্ধুর সাথে — `array`! সেই একই চেহারা: `[1, 2, 3]`। সেই একই স্বভাব: index দিয়ে ধরো, loop দিয়ে ঘোরো, শেষে জিনিস ঢোকাও। তুমি স্বস্তির নিঃশ্বাস ফেললে — যাক, অন্তত একজন চেনা মানুষ আছে।

কিন্তু কথা বলতে বলতে বন্ধু পকেট থেকে এমন একটা জিনিস বের করল যা তুমি JS-এর জগতে কখনো দেখোনি। তুমি জিজ্ঞেস করলে, "একটা string reverse করবি কীভাবে?" JS-এ তুমি লিখতে `s.split('').reverse().join('')` — তিনটা method chain, প্রতিবার Google করে মনে করতে হয় order-টা। বন্ধু হাসল, আর লিখল:

```python
s[::-1]
```

পাঁচটা অক্ষর। ব্যস। তুমি চোখ কচলে আবার দেখলে — হ্যাঁ, পাঁচটা অক্ষরই। এই জাদুটার নাম **slicing**, আর আজকের lesson-এর নায়ক এ-ই। একই বন্ধু, নতুন শহরে, পকেটে নতুন জাদু।

---

## 🤔 WHY

তুমি হয়তো ভাবছ — "array তো চিনিই, এই lesson skip করলে হয় না?" না, হয় না। তিনটা কারণ:

**এক,** NeetCode 150-এর প্রায় প্রতিটা problem-এ list আছে। Array & Hashing, Two Pointers, Sliding Window, Binary Search — সব list-এর উপর দাঁড়িয়ে। List-এ হাত না চললে DSA-র দরজাই খুলবে না।

**দুই,** slicing না জানলে তুমি Python-এ JS-এর মতো করে লিখবে — ৫ লাইনে যেটা ১ লাইনে হয়। Interview-তে সেটা দেখতে ভালো লাগে না, আর নিজের সময়ও নষ্ট।

**তিন,** সবচেয়ে জরুরি — list-এর ভেতরে দুটো **trap** লুকিয়ে আছে। একটা performance trap (`pop(0)`), আরেকটা reference trap (nested list-এর shallow copy)। দ্বিতীয়টা DSA-র grid problem-এ এমন এক classic bug তৈরি করে যেটা ঘণ্টার পর ঘণ্টা debug করেও ধরা যায় না — কারণ code দেখতে সম্পূর্ণ নির্দোষ। আজ এই দুটো trap আগে থেকেই চিনে রাখবে, যাতে সময় এলে পা না পড়ে।

---

## 🧭 CONCEPT JOURNEY

### List = তোমার চেনা array

প্রথমে সুখবরটা: Python-এর `list` আর JS-এর `array` — literal syntax হুবহু এক।

```python
nums = [10, 20, 30]        # JS: const nums = [10, 20, 30]
mixed = [1, "two", 3.0]    # JS-এর মতোই mixed type চলে
empty = []                 # খালি list
```

Index দিয়ে পড়া, index দিয়ে লেখা — সব একই: `nums[0]` দেয় `10`, `nums[1] = 99` করলে বদলে যায়। এতদূর পর্যন্ত তোমার ৫ বছরের অভিজ্ঞতা হুবহু কাজ করবে।

### Method-এর অনুবাদ টেবিল

নতুন ভাষা শেখা না — অনুবাদ শেখা। এই টেবিলটা তোমার dictionary:

| JavaScript                         | Python                       | মন্তব্য                                               |
| ---------------------------------- | ---------------------------- | ----------------------------------------------------- |
| `arr.push(x)`                      | `arr.append(x)`              | শেষে যোগ, O(1)                                        |
| `arr.pop()`                        | `arr.pop()`                  | শেষ থেকে তোলা, O(1) — নামও এক!                        |
| `arr.length`                       | `len(arr)`                   | property না, **function** — এটাই সবচেয়ে বেশি ভুল হয় |
| `arr.includes(x)`                  | `x in arr`                   | Python-এ operator, method না                          |
| `arr.indexOf(x)`                   | `arr.index(x)`               | সাবধান: না পেলে JS দেয় `-1`, Python **error** ছোড়ে  |
| `arr.splice(i, 0, x)`              | `arr.insert(i, x)`           | মাঝখানে ঢোকানো                                        |
| — (filter দিয়ে করতে)              | `arr.remove(x)`              | প্রথম match-টা value ধরে মুছে দেয়                    |
| `arr.concat(b)` / `arr.push(...b)` | `arr.extend(b)` বা `arr + b` | `extend` in-place, `+` নতুন list                      |

> **Analogy:** এটা অনেকটা ঢাকা থেকে কলকাতা যাওয়ার মতো। ভাষা প্রায় একই, শুধু কিছু শব্দ আলাদা — তুমি বলো "পানি", ওরা বলে "জল"। জিনিস একই, উচ্চারণ আলাদা। `push` আর `append` — দুটোই "শেষে ঢোকাও"।

দুটো জায়গায় বিশেষ নজর দাও। **এক:** `len(arr)` — তোমার আঙুল আগামী এক মাস `arr.length` লিখতে চাইবে, এটা স্বাভাবিক। **দুই:** `x in arr` — JS-এ `includes` একটা method, Python-এ `in` একটা operator, যেটা পড়তে প্রায় ইংরেজি বাক্যের মতো: `if 5 in nums:`।

### `pop(0)` — পুরনো শত্রু নতুন শহরেও আছে

JS-এ তুমি জানো `arr.shift()` ধীর — সামনে থেকে element তুললে বাকি সবাইকে এক ঘর করে এগিয়ে আসতে হয়। Python-এ সেই একই শত্রু, শুধু ছদ্মবেশে: `arr.pop(0)`। সামনে থেকে একটা তুললে বাকি **প্রতিটা** element এক ঘর বামে সরে — নিচে 🔬 TRACING section-এর animation-এ Play চেপে এই সরে-যাওয়াটা নিজের চোখেই দেখবে।

`arr.pop()` (শেষ থেকে) হলো O(1) — কারো নড়তে হয় না। কিন্তু `arr.pop(0)` হলো O(n)। Queue বানাতে গিয়ে `pop(0)` ব্যবহার করলে তোমার solution LeetCode-এ **Time Limit Exceeded** খাবে। সমাধান আছে — `deque` নামের একটা জিনিস, যার `popleft()` হলো O(1)। সেটার গল্প wn0l9-এ। আপাতত মনে রাখো: **সামনে থেকে তোলা = বিপদ।**

### Negative indexing — পেছন থেকে গোনা

এবার প্রথম নতুন জাদু। JS-এ শেষ element পেতে লিখতে `arr[arr.length - 1]`, অথবা আধুনিক JS-এ `arr.at(-1)`। Python-এ negative index **সব জায়গায়, সবসময়** চলে — শুধু `at()`-এর মতো একটা বিশেষ method-এ না। Play চেপে দেখো:

```animation
{"type":"array","title":"একই ঘরের দুটো ঠিকানা — positive ও negative index","array":[10,20,30,40,50],"steps":[
 {"highlight":[0,1,2,3,4],"note":"nums = [10, 20, 30, 40, 50] — উপরের সারিতে চেনা positive index (0 থেকে 4)। কিন্তু প্রতিটা ঘরের একটা দ্বিতীয়, গোপন ঠিকানাও আছে।"},
 {"pointers":{"0":0,"-5":0},"highlight":[0],"note":"প্রথম ঘর: সামনে থেকে গুনলে index 0, পেছন থেকে গুনলে -5। বাসা একটাই, ঠিকানা দুটো।"},
 {"pointers":{"4":4,"-1":4},"highlight":[4],"note":"nums[-1] মানে শেষেরটা — 50। JS-এ লিখতে হতো arr[arr.length - 1], Python-এ মাত্র ৪টা অক্ষর।"},
 {"pointers":{"3":3,"-2":3},"highlight":[3],"note":"nums[-2] মানে শেষের আগেরটা — 40। পেছন থেকে গোনা যেদিক থেকে সুবিধা, সেদিক থেকেই গোনো।"},
 {"pointers":{"2":2,"-3":2},"highlight":[2],"note":"মাঝের ঘরেও একই নিয়ম: nums[2] আর nums[-3] — দুটোই 30। negative index Python-এ সব জায়গায়, সবসময় চলে।"}
]}
```

প্রতিটা ঘরের দুটো ঠিকানা — সামনে থেকে গুনলে একটা, পেছন থেকে গুনলে আরেকটা। `nums[-1]` মানে "শেষেরটা", `nums[-2]` মানে "শেষের আগেরটা"।

> **Analogy:** লম্বা এক লাইনের বাসার সারি ভাবো। "রাস্তার মাথা থেকে ৩ নম্বর বাসা" — এটা positive index। "রাস্তার শেষ থেকে ১ নম্বর বাসা" — এটা negative index। বাসা একটাই, ঠিকানা দুটো। যেদিক থেকে গোনা সুবিধা, সেদিক থেকে গোনো।

```python
nums = [10, 20, 30, 40, 50]
print(nums[-1])   # 50 — JS: nums.at(-1) বা nums[nums.length-1]
print(nums[-2])   # 40
```

### Slicing — আজকের নায়ক

এবার আসল জাদু। Slicing-এর syntax:

```python
arr[start:stop:step]
```

তিনটা নিয়ম মুখস্থ করো:

1. **`stop` exclusive** — stop index-এর element **বাদ**। ঠিক JS-এর `slice(1, 4)`-এর মতো।
2. যেকোনোটা বাদ দেওয়া যায় — `start` বাদ মানে "শুরু থেকে", `stop` বাদ মানে "শেষ পর্যন্ত", `step` বাদ মানে "১ করে"।
3. Slicing সবসময় **নতুন list** (copy) বানায় — original অক্ষত থাকে।

এখন চোখে দেখো। Slice মানে list-এর উপর একটা **window** বসানো। Play চেপে দেখো window-টা কীভাবে সরে, বড় হয়, আর `step` দিলে লাফিয়ে লাফিয়ে চলে:

```animation
{"type":"array","title":"Slice window — nums = [10, 20, 30, 40, 50]","array":[10,20,30,40,50],"steps":[
 {"pointers":{"start":1,"stop":4},"highlight":[1,2,3],"note":"nums[1:4] — start বসল index 1-এ, stop বসল index 4-এ। Window-এ পড়ল index 1, 2, 3 → result [20, 30, 40]। stop-এর ঘরটা (50) বাদ!"},
 {"pointers":{"start":0,"stop":3},"highlight":[0,1,2],"note":"nums[:3] — start বাদ দিলে window-এর বাঁ প্রান্ত একদম শুরুতে সরে যায়। Result [10, 20, 30] — মানে প্রথম ৩টা।"},
 {"pointers":{"start":2},"highlight":[2,3,4],"note":"nums[2:] — stop বাদ দিলে window-এর ডান প্রান্ত একদম শেষ পর্যন্ত বেড়ে যায়। Result [30, 40, 50]।"},
 {"pointers":{"start":3},"highlight":[3,4],"note":"nums[-2:] — negative index-ও slice-এ চলে! start -2 মানে পেছন থেকে ২ নম্বর ঘর → শেষ ২টা: [40, 50]।"},
 {"highlight":[0,2,4],"note":"nums[::2] — step 2 মানে window আর টানা না, ২ ঘর করে লাফায়: index 0, 2, 4 → [10, 30, 50]।"},
 {"highlight":[0,1,2,3,4],"note":"nums[::-1] — step -1 মানে উল্টো দিকে হাঁটো: [50, 40, 30, 20, 10]। পুরো list reversed, এক লাইনে!"}
]}
```

> **Analogy:** Slicing হলো কেকের উপর ছুরি বসানোর মতো। `[1:4]` মানে ১ নম্বর দাগে একটা ছুরি, ৪ নম্বর দাগে আরেকটা — মাঝের টুকরোটা তোমার। ছুরি **দাগের উপর** বসে, টুকরোর উপর না — তাই stop-এর element টুকরোর বাইরে পড়ে। আর টুকরো কেটে নিলে মূল কেক নষ্ট হয় না — slicing-ও copy দেয়, original বদলায় না।

JS-এর সাথে মেলাও:

```python
# Python                    # JavaScript
nums[1:4]                   # nums.slice(1, 4)
nums[:3]                    # nums.slice(0, 3)
nums[2:]                    # nums.slice(2)
nums[-2:]                   # nums.slice(-2)      — শেষ ২টা
nums[::-1]                  # [...nums].reverse() — কিন্তু Python-এরটা ছোট!
nums[::2]                   # JS-এ built-in নেই — filter+index দিয়ে কষ্ট করতে হয়
```

আর সবচেয়ে মধুর খবর: **string-এও slicing চলে।** Python-এ string-ও একটা sequence, তাই:

```python
s = "python"
print(s[0:2])    # "py"
print(s[::-1])   # "nohtyp" — split-reverse-join-এর যন্ত্রণা চিরতরে শেষ
```

Palindrome check এক লাইনে: `s == s[::-1]`। JS-এ যেটা ছিল একটা ছোটখাটো প্রজেক্ট।

### `b = a` কি copy? — পুরনো শহরের পুরনো নিয়ম

এখানে Python আর JS হুবহু একই আচরণ করে। `b = a` লিখলে **copy হয় না** — দুটো নাম একই list-কে দেখায়:

```python
a = [1, 2, 3]
b = a           # copy না! একই list-এর দ্বিতীয় নাম
b.append(4)
print(a)        # [1, 2, 3, 4] — a-ও বদলে গেল!
```

Memory-তে যা ঘটে — Play চেপে লেবেলগুলোর ওড়াউড়ি দেখো:

```animation
{"type":"vars","title":"b = a বনাম c = a[:] — লেবেল আর বাক্সের খেলা","steps":[
 {"boxes":[{"id":"b1","value":"[1, 2, 3]"}],"labels":[{"name":"a","box":"b1"}],"note":"a = [1, 2, 3] — memory-তে একটা বাক্স তৈরি হলো, তাতে a লেবেলটা লাগল।"},
 {"boxes":[{"id":"b1","value":"[1, 2, 3]"}],"labels":[{"name":"a","box":"b1"},{"name":"b","box":"b1"}],"note":"b = a — নতুন বাক্স নয়! b লেবেলটা উড়ে এসে সেই একই বাক্সে বসল। দুই লেবেল, এক বাক্স।"},
 {"boxes":[{"id":"b1","value":"[1, 2, 3, 4]"}],"labels":[{"name":"a","box":"b1"},{"name":"b","box":"b1"}],"note":"b.append(4) — বাক্সটাই বদলে গেল। a-ও এই বাক্সই দেখে, তাই print(a) দেবে [1, 2, 3, 4]।"},
 {"boxes":[{"id":"b1","value":"[1, 2, 3, 4]"},{"id":"b2","value":"[1, 2, 3, 4]"}],"labels":[{"name":"a","box":"b1"},{"name":"b","box":"b1"},{"name":"c","box":"b2"}],"note":"c = a[:] — slicing মানেই copy! এবার সত্যিই একটা আলাদা নতুন বাক্স তৈরি হলো, তাতে c লেবেল।"},
 {"boxes":[{"id":"b1","value":"[1, 2, 3, 4]"},{"id":"b2","value":"[1, 2, 3, 4, 99]"}],"labels":[{"name":"a","box":"b1"},{"name":"b","box":"b1"},{"name":"c","box":"b2"}],"note":"c.append(99) — শুধু c-র বাক্স বদলাল; a আর b-এর বাক্স অক্ষত। এটাই আসল copy-র মানে।"}
]}
```

JS-এ `const b = a` object/array-র ক্ষেত্রে যা করে — ঠিক তাই। আসল copy চাইলে:

```python
b = a[:]        # slicing = copy, মনে আছে? পুরো slice = পুরো copy
b = list(a)     # JS: [...a] বা Array.from(a)
```

খেয়াল রাখো — এগুলো **shallow copy**। JS-এর spread-এর মতোই: ভেতরে nested list থাকলে সেই ভেতরের list-গুলো এখনো shared। এই কথাটা COMMON MISTAKES-এ ভয়ংকর রূপ নিয়ে ফিরে আসবে।

### String immutable — লেখা পাথরে খোদাই

JS-এ `s[0] = 'x'` চুপচাপ fail করে (strict mode-এ error)। Python সরাসরি মুখের উপর error ছোড়ে:

```python
s = "hello"
s[0] = "H"      # TypeError: 'str' object does not support item assignment
```

String বদলানো যায় না — নতুন string বানাতে হয়। অনেকগুলো পরিবর্তন করতে হলে Python-এর idiom হলো: **list বানাও, বদলাও, জোড়া লাগাও:**

```python
chars = list("hello")     # ['h', 'e', 'l', 'l', 'o'] — JS: s.split('')
chars[0] = "H"
result = "".join(chars)   # "Hello" — JS: chars.join('')
```

খেয়াল করো `join`-এর অদ্ভুত দিক: Python-এ separator-এর উপর `join` ডাকা হয় — `"".join(chars)`, JS-এর `chars.join("")`-এর উল্টো। প্রথম কয়েকবার হাত আটকাবে, তারপর সয়ে যাবে।

---

## ⚡ CODE — HANDS ON

### নিজে চেষ্টা করো — আগে prediction, পরে উত্তর

এটাই আজকের simulation। প্রতিটা লাইনের output **আগে কাগজে লেখো**, তারপর button চেপে মিলাও। চুরি করে আগে চেপো না!

```reveal
{"prompt":"প্রথম ৩টা — output কী হবে? আগে কাগজে লেখো","code":"nums = [5, 10, 15, 20, 25, 30]\n\nprint(nums[1:3])\nprint(nums[:2])\nprint(nums[-3:])","answer":"[10, 15]\n[5, 10]\n[20, 25, 30]","explanation":"nums[1:3] → index 1 আর 2, stop(3) বাদ। nums[:2] → প্রথম ২টা। nums[-3:] → শেষ ৩টা — negative index slice-এও চলে।"}
```

```reveal
{"prompt":"এবার কঠিন ৩টা — step, range-এর বাইরে, আর string","code":"nums = [5, 10, 15, 20, 25, 30]\n\nprint(nums[::3])\nprint(nums[4:100])   # index 100 তো নেই! error?\nprint(\"slicing\"[2:5])","answer":"[5, 20]\n[25, 30]\nici","explanation":"nums[::3] → ৩ ঘর করে লাফ, index 0 আর 3। nums[4:100] → error নেই! slice ভদ্রলোক, যা আছে তাই দেয়। আর string-ও sequence, তাই একই নিয়ম — index 2, 3, 4 = ici।"}
```

দ্বিতীয় reveal-এর মাঝেরটা লক্ষ করো — `nums[4:100]` **error দেয় না**। Slicing range-এর বাইরে গেলে চুপচাপ clamp করে। কিন্তু `nums[100]` (সরাসরি index) দিলে `IndexError`। Index কড়া, slice নরম।

কয়টা মিলল? ৬-এ ৬ হলে তুমি slicing-এর জাদু পেয়ে গেছ। ভুল হলে ঠিক কোন নিয়মে হোঁচট খেলে সেটা উপরের slice window animation-এ Play চেপে আবার দেখো — সাধারণত অপরাধী হয় "stop exclusive"।

### Method-গুলো একসাথে

```python
stack = []                 # খালি list
stack.append("a")          # JS: stack.push("a")
stack.append("b")
stack.append("c")
print(len(stack))          # 3 — JS: stack.length
print("b" in stack)        # True — JS: stack.includes("b")
print(stack.index("c"))    # 2 — JS: stack.indexOf("c")

last = stack.pop()         # "c" — শেষ থেকে, O(1)
stack.insert(0, "z")       # JS: stack.splice(0, 0, "z")
stack.remove("a")          # value ধরে মোছা
stack.extend(["x", "y"])   # JS: stack.push(...["x", "y"])
print(stack)               # ['z', 'b', 'x', 'y']
```

---

## 🔬 TRACING

`append` আর `pop` প্রতি step-এ list-টাকে কী অবস্থায় রাখে — Play চেপে হাতে ধরে trace করো। Interview-তে stack-based problem (যেমন Valid Parentheses) solve করার সময় ঠিক এই ছবিটাই মাথায় চলবে:

```python
ops = []
ops.append(10)
ops.append(20)
ops.append(30)
x = ops.pop()
ops.append(40)
y = ops.pop(0)
```

```animation
{"type":"array","title":"append আর pop — প্রতি step-এ list-এর অবস্থা","array":[],"steps":[
 {"note":"ops = [] — খালি list দিয়ে শুরু, stage এখন ফাঁকা।"},
 {"array":[10],"highlight":[0],"note":"ops.append(10) — শেষে ঢুকল। কারো নড়তে হয়নি, O(1)।"},
 {"array":[10,20],"highlight":[1],"note":"ops.append(20) — আবার শেষে। O(1)।"},
 {"array":[10,20,30],"highlight":[2],"note":"ops.append(30) — list এখন [10, 20, 30]। এখনো সব O(1)।"},
 {"array":[10,20],"note":"x = ops.pop() — শেষেরটা (30) উঠে গেল x-এ। কেউ নড়ল না, O(1)। যেটা সবার পরে ঢুকেছিল সেটাই আগে বেরোলো।"},
 {"array":[10,20,40],"highlight":[2],"note":"ops.append(40) — শেষে নতুন সদস্য। O(1)।"},
 {"array":[20,40],"highlight":[0,1],"note":"y = ops.pop(0) — সামনেরটা (10) গেল y-তে, কিন্তু দাম দিতে হলো: 20 আর 40 দুজনকেই এক ঘর বামে সরতে হলো। এটাই O(n)!"}
]}
```

Step 5 দেখো — `pop()` **শেষেরটা** তুলল (30), যেটা সবার পরে ঢুকেছিল। ঢোকে ডানে, বেরোয় ডানে — এটাই stack-এর LIFO (Last In, First Out) স্বভাব, JS-এও যা ছিল।

আর শেষ step-এ `pop(0)` সামনেরটা তুলল, কিন্তু দাম দিতে হলো: 20 আর 40 দুজনকেই এক ঘর বামে সরতে হয়েছে। ৩টা element-এ কিছু টের পাবে না; ১ লাখ element-এর queue-তে প্রতিটা `pop(0)` মানে ১ লাখ সরানো। এই যন্ত্রণার মুক্তি `deque`-তে — wn0l9-এ।

---

## 🚫 COMMON MISTAKES

❌ **ভুল ধারণা ১:** "`arr.length` লিখলেই হবে।"
✅ **আসল কথা:** Python-এ `len(arr)` — function, property না। `arr.length` লিখলে `AttributeError`। এটা প্রথম সপ্তাহের সবচেয়ে common ভুল, এবং সেরে যায়।

❌ **ভুল ধারণা ২:** "`b = a[:]` করেছি, এখন সব আলাদা copy।"
✅ **আসল কথা:** `a[:]` **shallow** copy — বাইরের list নতুন, কিন্তু ভেতরের nested list-গুলো এখনো shared। `a = [[1, 2], [3, 4]]` হলে `b = a[:]`-এর পর `b[0].append(99)` করলে `a[0]`-ও বদলে যাবে। JS-এর `[...arr]`-ও ঠিক এই আচরণ করে — নিয়মটা নতুন না, ভুলে যাওয়াটাই বিপদ।

❌ **ভুল ধারণা ৩ (DSA grid problem-এর classic bug):** "`grid = [[0]*3]*3` দিয়ে ৩×৩ grid বানালাম।"
✅ **আসল কথা:** বাইরের `*3` ভেতরের list-টাকে copy করে না — **একই list-এর ৩টা reference** বানায়। তিনটা row আসলে একটাই row। বিশ্বাস হচ্ছে না? আগে নিজে predict করো:

```reveal
{"prompt":"একটা মাত্র ঘরে 1 বসালাম — print(grid) কী দেখাবে?","code":"grid = [[0]*3]*3\ngrid[0][0] = 1\nprint(grid)","answer":"[[1, 0, 0], [1, 0, 0], [1, 0, 0]]","explanation":"তিন row-ই বদলে গেল! বাইরের *3 ভেতরের list copy করেনি — একই list-এর ৩টা reference বানিয়েছে। একটায় লিখলে তিনটাতেই দেখা যায়।"}
```

কেন এমন হয় — Play চেপে memory-র ভেতরটা দেখো:

```animation
{"type":"vars","title":"[[0]*3]*3 — তিন লেবেল, এক বাক্স","steps":[
 {"boxes":[{"id":"row","value":"[0, 0, 0]"}],"labels":[],"note":"ভেতরের [0]*3 একটা মাত্র list বানায় — memory-তে এই একটাই বাক্স, এখনো নাম-না-দেওয়া।"},
 {"boxes":[{"id":"row","value":"[0, 0, 0]"}],"labels":[{"name":"grid[0]","box":"row"}],"note":"বাইরের *3 কাজ শুরু করল: প্রথম reference — grid[0] লেবেলটা ওই বাক্সেই বসল।"},
 {"boxes":[{"id":"row","value":"[0, 0, 0]"}],"labels":[{"name":"grid[0]","box":"row"},{"name":"grid[1]","box":"row"}],"note":"grid[1] — নতুন row? না! *3 copy বানায় না, তাই দ্বিতীয় লেবেলও সেই একই বাক্সে।"},
 {"boxes":[{"id":"row","value":"[0, 0, 0]"}],"labels":[{"name":"grid[0]","box":"row"},{"name":"grid[1]","box":"row"},{"name":"grid[2]","box":"row"}],"note":"grid[2]-ও তাই। তিনটা row লেবেল, বাক্স একটাই — bug-টা এখানেই লুকিয়ে।"},
 {"boxes":[{"id":"row","value":"[1, 0, 0]"}],"labels":[{"name":"grid[0]","box":"row"},{"name":"grid[1]","box":"row"},{"name":"grid[2]","box":"row"}],"note":"grid[0][0] = 1 — এক বাক্সে লিখলাম, তিন লেবেলই সেই বদল দেখে। তাই output-এ তিন row-ই [1, 0, 0]।"},
 {"boxes":[{"id":"r0","value":"[1, 0, 0]"},{"id":"r1","value":"[0, 0, 0]"},{"id":"r2","value":"[0, 0, 0]"}],"labels":[{"name":"grid[0]","box":"r0"},{"name":"grid[1]","box":"r1"},{"name":"grid[2]","box":"r2"}],"note":"সঠিক মন্ত্র [[0]*3 for _ in range(3)] — প্রতিবার নতুন row, তিনটা আলাদা বাক্স। এবার grid[0][0] = 1 শুধু প্রথম row বদলায়।"}
]}
```

Maze, island, matrix — যেকোনো grid problem-এ এই bug একবার না একবার সবাই খায়। Code দেখতে নির্দোষ, output ভুতুড়ে। সঠিক উপায়:

```python
grid = [[0]*3 for _ in range(3)]   # প্রতিবার নতুন row তৈরি হয়
```

(`for _ in range(3)` চেনো wn0l3 থেকে; এই comprehension syntax-টা পুরোপুরি শিখবে সামনের lesson-গুলোতে — আপাতত এটাকে "grid বানানোর সঠিক মন্ত্র" হিসেবে টুকে রাখো।)

❌ **ভুল ধারণা ৪:** "`arr.index(x)` JS-এর `indexOf`-এর মতো, না পেলে `-1` দেবে।"
✅ **আসল কথা:** না পেলে `ValueError` ছুড়ে program থামিয়ে দেয়। আগে `if x in arr:` দিয়ে check করো, তারপর `index` ডাকো।

---

## 🎯 Key Takeaways

- Python `list` = JS `array` — literal এক, শুধু শব্দ বদলায়: `append`↔`push`, `len(arr)`↔`arr.length`, `x in arr`↔`includes`
- **Negative index** সব জায়গায় চলে: `arr[-1]` = শেষ element (JS-এর `at(-1)` শুধু বিশেষ method, Python-এ এটাই স্বাভাবিক)
- **Slicing** `arr[start:stop:step]` — **stop exclusive**, নতুন (shallow) copy দেয়, string-এও চলে; `s[::-1]` = reverse এক লাইনে
- `b = a` copy **না** — দুই লেবেল, এক বাক্স (JS-এর মতোই); copy চাইলে `a[:]` বা `list(a)`
- `pop()` O(1), কিন্তু `pop(0)` O(n) — JS-এর `shift()` trap-এর যমজ ভাই; queue লাগলে `deque` (wn0l9)
- String **immutable** — বদলাতে হলে `list()` → পরিবর্তন → `"".join()`
- `[[0]*3]*3` = তিন row একই reference — grid বানাও `[[0]*3 for _ in range(3)]` দিয়ে

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: "Python-এ list-এর সামনে থেকে element remove করলে complexity কত? Queue বানাতে list ব্যবহার করবে?"**
A: "`pop(0)` হলো O(n), কারণ বাকি সব element-কে এক ঘর বামে shift করতে হয় — JS-এর `shift()`-এর মতোই। তাই queue-র জন্য list খারাপ choice; `collections.deque` ব্যবহার করব, যার `popleft()` O(1)। Stack-এর জন্য অবশ্য list চমৎকার — `append` আর `pop` দুটোই শেষ প্রান্তে, দুটোই O(1)।"

**Q: "`b = a`, `b = a[:]` আর deep copy-র পার্থক্য কী?"**
A: "`b = a` কোনো copy-ই না — একই list-এর দ্বিতীয় নাম, একটায় লিখলে অন্যটায় দেখা যায়। `b = a[:]` shallow copy — বাইরের list নতুন, কিন্তু ভেতরের nested object/list গুলো এখনো shared। সম্পূর্ণ আলাদা চাইলে deep copy লাগে (`copy.deepcopy`)। JS-এর `=`, spread `[...a]`, আর `structuredClone`-এর সাথে one-to-one মেলে।"

**Q: "`arr[1:4]`-এ index 4-এর element থাকে না কেন — এই design-এর সুবিধা কী?"**
A: "Stop exclusive হওয়ায় `stop - start` = slice-এর length, হিসাব সোজা। আর `arr[:k]` + `arr[k:]` জোড়া দিলে হুবহু পুরো list ফিরে আসে — কোনো element বাদও পড়ে না, double-ও হয় না। JS-এর `slice(1, 4)`-ও একই convention মানে, তাই আমার আগের intuition এখানে সরাসরি কাজে লাগে।"

---

## ➡️ WHAT'S NEXT?

তোমার পুরনো বন্ধু array-র নতুন জাদু এখন তোমার পকেটেও। কিন্তু JS-এ তোমার আরেকটা নিত্যসঙ্গী ছিল — object। `{ name: "Nobel", age: 30 }` লিখে key দিয়ে value ধরা, API response ঘাঁটা — এই কাজ তুমি ৫ বছর ধরে প্রতিদিন করেছ। Python-এ তার নাম `dict`, আর সাথে বোনাস হিসেবে আছে `set` (JS-এর `Set`-এর চেনা মুখ) এবং একেবারে নতুন এক চরিত্র — `tuple`, এমন এক immutable list যেটা dict-এর **key** পর্যন্ত হতে পারে! পরের lesson-এ এই তিন মূর্তির সাথে দেখা হবে — DSA-র hashing জগতের চাবি ওদের হাতেই।
