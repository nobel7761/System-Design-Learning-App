---
id: wn0l3
world: wn0
order: 3
title: "Loop — তিনটার জায়গায় একটা for"
titleEn: "Loops: One for to Rule Them All"
estMinutes: 30
type: lesson
---

## 🎬 HOOK

রাত ১১টা। তুমি একটা code review করছ। Junior developer-এর PR-এ চোখ বুলাতে বুলাতে তুমি নিজের ৫ বছরের career-টা এক ঝলকে দেখে ফেললে —

```javascript
for (let i = 0; i < arr.length; i++) { ... }   // classic, index দরকার হলে
for (const x of arr) { ... }                    // value দরকার হলে
for (const key in obj) { ... }                  // object-এর key-র জন্য... সাবধানে!
arr.forEach((x, i) => { ... });                 // callback style, break করা যায় না
```

চারটা আলাদা অস্ত্র। প্রতিবার নতুন কাউকে শেখাতে হয় — "না না, array-তে `for...in` দিও না, ওটা index-কে string বানিয়ে দেয়!" "না, `forEach`-এর ভেতরে `break` চলে না!" "না, `for...of`-এ index পাবে না!" পাঁচ বছর ধরে তুমি এই নিয়মগুলো মুখস্থ রেখেছ, interview-তে বলেছ, blog post পড়েছ — "which for loop should you use in JavaScript?"

আজ Python তোমার কাঁধে হাত রেখে বলবে — "ভাই, একটাই আছে। `for x in iterable`। বেছে নেওয়ার যন্ত্রণা শেষ।"

শুনতে যত সহজ লাগছে, ব্যাপারটা তার চেয়েও সহজ। কিন্তু এই এক লাইনের ভেতরে দু-একটা trap লুকিয়ে আছে, আর একটা superpower — যেটা আজ আমরা খুলে দেখব।

---

## 🤔 WHY — এটা না জানলে কী হবে?

সোজা কথা: **DSA মানেই loop।** NeetCode-এর ১৫০টা problem-এর মধ্যে এমন একটাও নেই যেখানে loop নেই। Array traverse করা, string-এর character গোনা, two pointer চালানো, matrix ঘোরা — সব loop।

কিন্তু আরও বড় কথা আছে। Interview-তে সবচেয়ে বেশি মানুষ ধরা খায় **off-by-one error**-এ — loop একবার বেশি চলল, বা একবার কম। আর এর ৯০% আসে Python-এর `range()`-এর একটা নিয়ম না বোঝা থেকে: **stop is exclusive**। আজকের lesson-এ এই trap-টা আমরা এমনভাবে মাথায় গেঁথে নেব যে ভুল হওয়ার আর সুযোগ থাকবে না।

আর তৃতীয় কারণটা একটা অভ্যাস — **loop trace করা।** যেকোনো loop দেখে কাগজে iteration-by-iteration টেবিল আঁকতে পারা হলো DSA-র সবচেয়ে underrated skill। Debugger ছাড়া, `print` ছাড়া, শুধু মাথা দিয়ে বলা — "তৃতীয় iteration-এ `i` কত?" এই lesson-টা সেই অভ্যাস তৈরির জন্য perfect জায়গা, কারণ loop ছোট, state কম, আর ফলাফল সাথে সাথে check করা যায়। পরে যখন recursion আর dynamic programming আসবে, এই tracing-এর অভ্যাসটাই তোমাকে বাঁচাবে।

---

## 🧭 CONCEPT JOURNEY

### একটাই for: `for x in iterable`

Python-এর for loop দেখতে JS-এর `for...of`-এর মতোই —

```python
fruits = ["আম", "কাঁঠাল", "লিচু"]

for fruit in fruits:
    print(fruit)
```

```javascript
// JS-এ যেটা লিখতে
for (const fruit of fruits) {
  console.log(fruit);
}
```

পার্থক্য শুধু cosmetics: `of`-এর জায়গায় `in`, parentheses নেই, `{}`-এর জায়গায় `:` আর indentation (wn0l1-এ শিখেছ — indentation-ই Python-এর `{}`)।

> **Analogy:** JS-এর loop গুলো হলো রান্নাঘরের চার রকম ছুরি — সবজির, মাছের, রুটির, ফলের। Python দিয়েছে একটা ভালো chef's knife — সব কাটে। Array কাটো, string কাটো, dict কাটো — হাত বদলাতে হয় না।

এখানেই প্রশ্ন আসে: তাহলে JS-এর classic `for (let i = 0; i < n; i++)` — যেখানে শুধু একটা সংখ্যা গুনতে হয় — সেটা Python-এ কীভাবে?

### range(): সংখ্যা গোনার মেশিন

```python
for i in range(5):
    print(i)
# Output: 0 1 2 3 4
```

`range(5)` মানে — ০ থেকে শুরু করে ৫-এর **আগ পর্যন্ত**। এটাই JS-এর `for (let i = 0; i < 5; i++)`-এর হুবহু অনুবাদ। খেয়াল করো: JS-এ condition-টা `i < 5` (`<=` না) — Python-এর `range(5)`-ও ঠিক তাই। **৫ নিজে কখনো আসে না।**

`range()`-এর তিনটা রূপ আছে, JS-এর `for(;;)`-এর তিনটা অংশের মতোই —

```python
range(5)          # 0, 1, 2, 3, 4          → for (i = 0; i < 5; i++)
range(2, 7)       # 2, 3, 4, 5, 6          → for (i = 2; i < 7; i++)
range(0, 10, 2)   # 0, 2, 4, 6, 8          → for (i = 0; i < 10; i += 2)
```

অর্থাৎ `range(start, stop, step)` — start থেকে শুরু, stop-এর **আগে** থামা, step করে লাফানো।

**এখানেই সেই classic trap: stop is EXCLUSIVE.**

> **Analogy:** `range(2, 7)` হলো বাসের টিকিটের মতো — "গুলিস্তান থেকে ফার্মগেট"। তুমি গুলিস্তানে (start) উঠবে, কিন্তু ফার্মগেটে (stop) নামবে — ফার্মগেট পার হবে না। Start-এ পা রাখো, stop-এ থামো, stop-কে ছুঁয়ে দেখা হয় না।

১ থেকে ৫ পর্যন্ত (৫ সহ) print করতে চাইলে লিখতে হবে `range(1, 6)` — যেমন JS-এ লিখতে `i <= 5`, আর Python-এ সেটা হয়ে যায় `stop = 6`।

Play চেপে দেখো — `for i in range(3): print(i)` চলার সময় ভেতরে কী হচ্ছে:

```animation
{"type":"array","title":"range(3) — সংখ্যা-বিলি করার মেশিন","array":[0,1,2],"steps":[
 {"pointers":{"i":0},"note":"Loop শুরু। range হলো টিকিট কাউন্টার — প্রতি iteration-এ একটা করে সংখ্যা বিলি করে।"},
 {"pointers":{"i":0},"highlight":[0],"note":"range বলল \"নাও 0\" → i = 0 → print(0)"},
 {"pointers":{"i":1},"highlight":[1],"note":"range বলল \"নাও 1\" → i = 1 → print(1)"},
 {"pointers":{"i":2},"highlight":[2],"note":"range বলল \"নাও 2\" → i = 2 → print(2)"},
 {"pointers":{"i":2},"note":"range বলল \"শেষ, আর নেই\" → loop থামল। খেয়াল করো — 3 কখনো আসেনি! Stop is exclusive."}
]}
```

### `++` নেই — মন খারাপ কোরো না

একটা খবর আগেই দিয়ে রাখি: Python-এ `i++` বা `++i` **নেই। একদমই নেই।** `i++` লিখলে `SyntaxError`। বাড়াতে চাইলে লেখো `i += 1`, কমাতে চাইলে `i -= 1`। কেন নেই? Python-এর দর্শন — এক কাজ করার একটাই সুস্পষ্ট উপায় থাকা উচিত। `i += 1` আছে, তাহলে `i++` কেন লাগবে? আর মজার ব্যাপার — `for i in range(n)` থাকায় ৯০% ক্ষেত্রে হাতে increment করারই দরকার পড়ে না।

### Index দরকার? enumerate()

JS-এ index আর value দুটোই লাগলে তুমি লিখতে —

```javascript
arr.forEach((x, i) => console.log(i, x));
// অথবা
for (const [i, x] of arr.entries()) { ... }
```

Python-এর জবাব: `enumerate()` —

```python
langs = ["JS", "Python", "Go"]

for i, lang in enumerate(langs):
    print(i, lang)
# Output:
# 0 JS
# 1 Python
# 2 Go
```

`enumerate(arr)` প্রতিটা item-কে `(index, value)` জোড়া বানিয়ে দেয় — ঠিক `arr.entries()`-এর মতো। `for i, lang in` অংশটা সেই জোড়াকে দুটো variable-এ খুলে নেয় (JS-এর destructuring `[i, x]`-এর মতোই)। Play চেপে দেখো enumerate কীভাবে জোড়া বিলি করে:

```animation
{"type":"array","title":"enumerate(langs) — index আর value একসাথে","array":["JS","Python","Go"],"steps":[
 {"pointers":{"i":0},"highlight":[0],"note":"প্রথম জোড়া (0, \"JS\") → unpack হয়ে i = 0, lang = \"JS\""},
 {"pointers":{"i":1},"highlight":[1],"note":"দ্বিতীয় জোড়া (1, \"Python\") → i = 1, lang = \"Python\""},
 {"pointers":{"i":2},"highlight":[2],"note":"তৃতীয় জোড়া (2, \"Go\") → i = 2, lang = \"Go\""},
 {"pointers":{"i":2},"note":"List শেষ, enumerate-ও শেষ। Index-টা তুমি গোনোনি — enumerate নিজেই গুনে দিয়েছে।"}
]}
```

**ভুলেও এটা কোরো না:**

```python
# ❌ JS অভ্যাস — কাজ করে, কিন্তু un-Pythonic
for i in range(len(arr)):
    print(i, arr[i])

# ✅ Pythonic
for i, x in enumerate(arr):
    print(i, x)
```

`range(len(arr))` technically চলে, কিন্তু Python community-তে এটা দেখলেই বোঝা যায় "এ লোক JS/C থেকে এসেছে"। শুধু index লাগলে (value লাগবে না) তখনই `range(len(arr))` ঠিক আছে।

### String-এর উপর সরাসরি loop

JS-এ string iterate করা যেত `for...of` দিয়ে। Python-এও একই — কোনো `split('')` লাগে না:

```python
for ch in "dhaka":
    print(ch)
# Output: d h a k a (আলাদা লাইনে)
```

DSA-তে এটা সারাক্ষণ লাগবে — palindrome check, character গোনা, anagram — সব জায়গায় `for ch in s`।

### zip(): দুটো list পাশাপাশি হাঁটা

দুটো array একসাথে iterate করতে JS-এ index-এর সাহায্য নিতে হতো —

```javascript
for (let i = 0; i < names.length; i++) {
  console.log(names[i], ages[i]);
}
```

Python বলে — index-এর দরকারই নেই:

```python
names = ["রহিম", "করিম", "সালমা"]
ages = [25, 30, 28]

for name, age in zip(names, ages):
    print(name, age)
# রহিম 25
# করিম 30
# সালমা 28
```

> **Analogy:** `zip` মানে জামার চেইন (zipper)। দুই পাশের দাঁতগুলো এক এক করে জোড়া লাগে — প্রথমটার সাথে প্রথমটা, দ্বিতীয়টার সাথে দ্বিতীয়টা। এক পাশ ছোট হলে? চেইন যেখানে শেষ, সেখানেই থামা — **ছোট list শেষ হলেই zip থেমে যায়।**

### while: পুরনো বন্ধু, প্রায় অবিকল

`while` JS থেকে প্রায় copy-paste — শুধু parentheses ফেলে দাও, `:` বসাও:

```python
count = 0
while count < 3:
    print(count)
    count += 1      # মনে আছে? count++ নেই!
# Output: 0 1 2
```

কবে `for`, কবে `while`? নিয়মটা JS-এর মতোই: **কতবার চলবে জানা থাকলে `for`, শর্ত মেলা পর্যন্ত চালাতে হলে `while`।** Binary search, two pointer, linked list traverse — এগুলোতে `while` রাজত্ব করে।

### break আর continue — কোনো পরিবর্তন নেই

সুখবর: `break` (loop থেকে বেরিয়ে যাও) আর `continue` (এই iteration বাদ, পরেরটায় যাও) — হুবহু JS-এর মতো কাজ করে:

```python
for i in range(10):
    if i == 5:
        break       # 5 পেলেই থামো
    if i % 2 == 0:
        continue    # জোড় সংখ্যা বাদ
    print(i)
# Output: 1 3
```

আর মনে আছে JS-এর `forEach`-এ `break` করা যেত না বলে কত কষ্ট? Python-এ সেই সমস্যাই নেই — loop একটাই, আর তাতে `break` সবসময় চলে।

### উল্টো দিকে গোনা: range(n-1, -1, -1)

এবার সেই pattern যেটা DSA-তে তোমার মুখস্থ থাকা **বাধ্যতামূলক** — array-র শেষ থেকে শুরুর দিকে হাঁটা। JS-এ লিখতে `for (let i = n - 1; i >= 0; i--)`। Python-এ:

```python
arr = [10, 20, 30, 40]
n = len(arr)

for i in range(n - 1, -1, -1):
    print(i, arr[i])
# 3 40
# 2 30
# 1 20
# 0 10
```

তিনটা argument ভেঙে দেখো: start = `n - 1` (শেষ index), stop = `-1` (0-এর আগে থামো), step = `-1` (পেছন দিকে এক ঘর করে)। Play চেপে দেখো pointer-টা কীভাবে ডান থেকে বামে হাঁটে:

```animation
{"type":"array","title":"range(n-1, -1, -1) — উল্টো দিকে হাঁটা","array":[10,20,30,40],"steps":[
 {"pointers":{"i":3},"highlight":[3],"note":"start = n-1 = 3 → শেষ ঘর থেকে যাত্রা শুরু: arr[3] = 40"},
 {"pointers":{"i":2},"highlight":[2],"note":"step = -1, তাই পেছনে এক ঘর → i = 2, arr[2] = 30"},
 {"pointers":{"i":1},"highlight":[1],"note":"আরও এক ঘর পেছনে → i = 1, arr[1] = 20"},
 {"pointers":{"i":0},"highlight":[0],"note":"i = 0, arr[0] = 10 — প্রথম ঘরটাও পাওয়া গেল, বাদ পড়েনি"},
 {"pointers":{"i":0},"note":"পরের ডাক হতো -1, কিন্তু stop = -1 exclusive সীমানা → loop থামল। 0 সহ সব ঘর ঘোরা শেষ।"}
]}
```

Stop এখানে `-1` কেন? কারণ stop **exclusive** — তুমি `0` পর্যন্ত যেতে চাও (0 সহ), তাই থামার সীমানা তার এক ঘর পরে: `-1`। ঠিক যেমন সামনের দিকে `0` থেকে `n-1` পর্যন্ত যেতে stop দিতে `n`। Reverse iteration লাগবে — string উল্টানো, array-র শেষ থেকে খোঁজা, DP-র bottom-up টেবিল ভরা — সবখানে। নিজে একবার হাতে মিলিয়ে দেখো: `s = "abc"` নিয়ে `for i in range(len(s) - 1, -1, -1): print(s[i], end="")` চালালে output `cba` — একই মন্ত্রে string উল্টে গেল। (পরের lesson-এ শিখবে `s[::-1]` — এক লাইনে একই কাজ। কিন্তু loop দিয়ে পারাটা আগে জরুরি।)

---

## ⚡ CODE — HANDS ON

চলো এবার হাত নোংরা করি। প্রতিটা exercise-এর নিয়ম একটাই: **আগে নিজে output predict করো, তারপর button চেপে মিলাও।** ভুল হলে উৎসব করো — কারণ প্রতিটা ভুল prediction মানে একটা trap তুমি interview-র আগেই চিনে ফেললে।

### নিজে চেষ্টা করো #১ — range trap

```reveal
{"prompt":"Output কী হবে? `8` কি আসবে? আগে নিজে predict করো।","code":"for i in range(2, 8, 2):\n    print(i, end=\" \")","answer":"2 4 6","explanation":"Start = 2, তারপর 2 করে লাফ: 2, 4, 6। পরের লাফ 8 — কিন্তু stop = 8 exclusive, তাই 8 আসে না। বাস ফার্মগেটে থামে, পার হয় না। (আর end=\" \" মানে print নতুন লাইনের বদলে space দেবে — output এক লাইনে।)"}
```

### নিজে চেষ্টা করো #২ — enumerate + break

```reveal
{"prompt":"Prediction লেখো — কয়টা লাইন print হবে?","code":"nums = [4, 7, 0, 9]\n\nfor i, x in enumerate(nums):\n    if x == 0:\n        print(\"Zero found at index\", i)\n        break\n    print(x)","answer":"4\n7\nZero found at index 2","explanation":"তিন লাইন। i=0, x=4 → print 4। i=1, x=7 → print 7। i=2, x=0 → condition true → message print করে break — 9 পর্যন্ত loop পৌঁছায়ইনি।"}
```

### while + continue — একটা সূক্ষ্ম ফাঁদ

আর একটা জিনিস হাতে চালিয়ে দেখার মতো:

```python
i = 0
while i < 6:
    i += 1
    if i % 2 == 0:
        continue
    print(i, end=" ")
# Output: 1 3 5
```

খেয়াল করো `i += 1` টা `continue`-এর **আগে** — প্রতি iteration-এ আগে `i` বাড়ে, তারপর জোড় হলে skip। `i += 1` যদি `continue`-এর **পরে** থাকত, তাহলে `i=2` হওয়া মাত্র `continue` — `i` আর বাড়ত না — **infinite loop!** While + continue-এর এই ফাঁদটা JS-এও ছিল, Python-এও আছে।

---

## 🔬 TRACING — কাগজ-কলমের superpower

এবার সেই অভ্যাসটা, যেটা এই lesson-এর আসল উপহার। নিয়মটা শেখো:

> **যে loop-এর output নিয়ে এক সেকেন্ডও সন্দেহ হয়, সেটা কাগজে trace করো।** একটা টেবিল আঁকো — প্রতিটা row একটা iteration, প্রতিটা column একটা variable/condition। Loop যা করে, তুমি হাতে হাতে তাই করো।

### Trace টেবিল কেমন দেখতে?

```python
total = 0
for i in range(1, 5):
    total += i
```

| Iteration | i   | total (আগে) | total += i                    | total (পরে) |
| --------- | --- | ----------- | ----------------------------- | ----------- |
| 1         | 1   | 0           | 0 + 1                         | 1           |
| 2         | 2   | 1           | 1 + 2                         | 3           |
| 3         | 3   | 3           | 3 + 3                         | 6           |
| 4         | 4   | 6           | 6 + 4                         | 10          |
| —         | 5?  | —           | range থামল (stop=5 exclusive) | **10**      |

শেষ row-টা খেয়াল করো — trace টেবিলে সবসময় লেখো **loop কোথায় থামল এবং কেন**। Off-by-one bug ধরা পড়ে ঠিক ওই শেষ লাইনে।

### Nested loop trace: 2D pattern

DSA-তে matrix, grid, pair comparison — সবখানে nested loop। এটা trace করতে না পারলে 2D problem-এ অন্ধের মতো হাতড়াতে হবে। বাইরের loop হলো ঘড়ির ঘণ্টার কাঁটা, ভেতরের loop মিনিটের কাঁটা — ঘণ্টার কাঁটা এক ঘর নড়ে, আর মিনিটের কাঁটা পুরো এক পাক ঘোরে। Play চেপে trace-টা নিজের চোখে ঘটতে দেখো:

```animation
{"type":"trace","title":"Nested loop — star pattern trace","code":["for i in range(1, 4):","    for j in range(i):","        print(\"*\", end=\"\")","    print()"],"steps":[
 {"line":1,"vars":{"i":"1"},"note":"বাইরের loop শুরু — ঘণ্টার কাঁটা i = 1"},
 {"line":2,"vars":{"j":"0"},"note":"ভেতরের loop: range(1) মানে j শুধু 0 — এক পাকেই শেষ"},
 {"line":4,"out":"*","note":"একটা star ছাপা হলো, তারপর print() দিল newline → প্রথম row: *"},
 {"line":1,"vars":{"i":"2"},"note":"ভেতরের loop পুরো শেষ, তবেই ঘণ্টার কাঁটা নড়ল → i = 2"},
 {"line":3,"vars":{"j":"1"},"note":"এবার range(2): j = 0, তারপর j = 1 — মিনিটের কাঁটা দুই ঘর ঘুরল"},
 {"line":4,"out":"**","note":"দুটো star, তারপর newline → দ্বিতীয় row: **"},
 {"line":3,"vars":{"i":"3","j":"2"},"note":"i = 3, ভেতরে range(3): j = 0, 1, 2 — তিনবার star"},
 {"line":4,"out":"***","note":"তৃতীয় row: *** । এরপর range(1, 4) শেষ (4 exclusive!) — পুরো loop থামল"}
]}
```

মূল সূত্র: **ভেতরের loop পুরোটা শেষ না হলে বাইরের loop এক পা-ও নড়ে না।** মোট কাজ = বাইরের iteration × ভেতরের iteration — এখান থেকেই পরে O(n²)-এর গল্প শুরু হবে (Phase 1-এ)।

### নিজে চেষ্টা করো #৩ — trace না করে উত্তর দেওয়া নিষেধ

```reveal
{"prompt":"কাগজে টেবিল আঁকো: iteration → i → j → condition j > i → output। তারপর মিলাও।","code":"for i in range(3):\n    for j in range(3):\n        if j > i:\n            break\n        print(i, j)","answer":"0 0\n1 0\n1 1\n2 0\n2 1\n2 2","explanation":"break শুধু ভেতরের loop ভাঙে — বাইরেরটা চলতেই থাকে। i=0: j=0 print, j=1-এ 1>0 → break। i=1: j=0,1 print, j=2-এ break। i=2: তিনটাই print। এই \"break কোন loop ভাঙল\" প্রশ্নটা interview-র প্রিয় trap।"}
```

---

## 🚫 COMMON MISTAKES

❌ **ভুল ধারণা:** "`range(5)` মানে ১ থেকে ৫।"
✅ **আসল কথা:** ০ থেকে ৪। Start default ০, আর stop (৫) exclusive। ১ থেকে ৫ চাইলে `range(1, 6)`।

❌ **ভুল ধারণা:** "`i++` লিখলেই হবে, Python নিশ্চয়ই বুঝে নেবে।"
✅ **আসল কথা:** Python-এ `++` operator-ই নেই — `SyntaxError`। লেখো `i += 1`। (মজার fact: `++i` চুপচাপ চলে যায়, কারণ Python ওটাকে "plus plus i" — দুবার positive sign — হিসেবে পড়ে। বাড়ায় না কিছুই!)

❌ **ভুল ধারণা:** "Index লাগলে `for i in range(len(arr))` — এটাই নিয়ম।"
✅ **আসল কথা:** Index + value দুটো লাগলে `for i, x in enumerate(arr)` — cleaner, Pythonic, আর `arr[i]` বারবার লেখার typo-র ঝুঁকি নেই।

❌ **ভুল ধারণা:** "Reverse loop মানে `range(n, 0, -1)`।"
✅ **আসল কথা:** এটা `n` থেকে `1` পর্যন্ত দেবে — **index 0 বাদ পড়ে যাবে**, আর `arr[n]` দিয়ে শুরু করলে IndexError! সঠিকটা: `range(n - 1, -1, -1)`। Stop exclusive বলেই 0 পেতে হলে সীমানা `-1`।

❌ **ভুল ধারণা:** "`while` loop-এ `continue` করলেই পরের iteration — নিরাপদ।"
✅ **আসল কথা:** `continue`-এর আগে counter update না হলে infinite loop। `for` + `range` এই বিপদ থেকে মুক্ত — তাই সংখ্যা গোনার কাজে `for`-ই আগে ভাবো।

---

## 🎯 Key Takeaways

- JS-এর ৪ রকম loop (for;;, for...of, for...in, forEach)-এর জায়গায় Python-এ **একটাই**: `for x in iterable`
- `range(start, stop, step)` — **stop সবসময় exclusive**; `range(5)` = 0,1,2,3,4
- Index + value একসাথে লাগলে **`enumerate(arr)`** — JS-এর `arr.entries()`-এর ভাই
- দুই list পাশাপাশি চালাতে **`zip(a, b)`** — ছোটটা শেষ হলেই থামে
- উল্টো গোনার মন্ত্র: **`range(n - 1, -1, -1)`** — শেষ index থেকে 0 পর্যন্ত
- Python-এ `++` **নেই** — `i += 1` লেখো; `break`/`continue` হুবহু JS-এর মতো
- সন্দেহ হলেই **trace টেবিল** আঁকো: iteration → variable → condition → output; nested loop-এ ভেতরেরটা পুরো শেষ হলে তবেই বাইরেরটা নড়ে

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: "Python-এ array-র index আর value দুটোই লাগলে কী করবে?"**
A: "`for i, x in enumerate(arr)` — enumerate প্রতিটা element-কে (index, value) tuple বানিয়ে দেয়, যেটা loop-এর মাথায় unpack হয়ে যায়। `range(len(arr))` দিয়ে করা যায়, কিন্তু enumerate cleaner এবং idiomatic — JS-এর `arr.entries()` বা `forEach`-এর দ্বিতীয় argument-এর মতোই।"

**Q: "`range(1, 10, 2)` কী দেবে? আর 10 কি আসবে?"**
A: "1, 3, 5, 7, 9। Stop exclusive, তাই 10 কখনোই আসবে না — এমনিতেও step-এর হিসাবে পরের সংখ্যা 11 হতো। `range` হলো JS-এর `for (i = start; i < stop; i += step)`-এর সরাসরি অনুবাদ — খেয়াল করো condition-টা `<`, `<=` না।"

**Q: "Array-টা শেষ থেকে traverse করতে হবে — Python-এ loop-টা লেখো।"**
A: "`for i in range(len(arr) - 1, -1, -1)` — start শেষ index, stop `-1` কারণ 0 পর্যন্ত (inclusive) যেতে হবে আর stop exclusive, step `-1` মানে পেছনদিকে। এটা JS-এর `for (let i = arr.length - 1; i >= 0; i--)`-এর equivalent।"

---

## ➡️ WHAT'S NEXT?

তুমি এখন Python-এ হাঁটতে পারো — সোজা, উল্টো, জোড়ায় জোড়ায়, nested-ভাবে। কিন্তু এখন পর্যন্ত সব code ছড়ানো-ছিটানো — reusable কিছু নেই। Next lesson-এ আসছে **function**: `def` দিয়ে function লেখা, default argument, আর একটা জিনিস যেটা দেখে তোমার JS মন এক মুহূর্তের জন্য থমকে যাবে — `return a, b`। হ্যাঁ, Python function **একসাথে একাধিক value return করতে পারে**। আর `null` vs `undefined`-এর দুই যন্ত্রণার জায়গায় Python-এর এক শান্ত উত্তর: `None`। দেখা হচ্ছে wn0l4-এ।
