---
id: wn0l1
world: wn0
order: 1
title: "Python-এ প্রথম দিন — print, variable, f-string"
titleEn: "Day One in Python"
estMinutes: 30
type: lesson
---

## 🎬 HOOK — নতুন দেশে প্রথম দিন

ধরো, ৫ বছর ধরে ঢাকায় গাড়ি চালানো একজন driver হঠাৎ London-এ নামলো। প্রথম ধাক্কা — গাড়ি রাস্তার **অন্য পাশে** চলে! Steering wheel-টা ডানদিকে, gear-টা বাঁ হাতে। প্রথম ৫ মিনিট মনে হবে, "আমি তো কিছুই জানি না!"

কিন্তু ১০ মিনিট পরে সে বুঝে যায় — accelerator চাপলে গাড়ি এগোয়, brake চাপলে থামে, mirror দেখে lane change করতে হয়। **Driving সে জানে। শুধু rules গুলো একটু ঘুরে গেছে।**

তুমি ঠিক সেই driver। ৫ বছর ধরে JavaScript লিখছো — variable, function, loop, API — সব তোমার মাথায় গাঁথা। আজ তুমি Python নামের নতুন দেশে নামছো। এখানে `{}` নেই, `;` নেই, `let/const` নেই, `console.log` নেই। প্রথম দেখায় মনে হবে সব অচেনা।

কিন্তু আজকের lesson শেষে তুমি দেখবে — **ভাষাটা নতুন, কিন্তু মানুষগুলো চেনা।** Variable এখানেও variable, string এখানেও string। তুমি নতুন কিছু শিখছো না, তুমি শুধু **অনুবাদ** শিখছো। আর অনুবাদ শেখা, নতুন ভাষা শেখার চেয়ে ১০ গুণ দ্রুত হয়।

---

## 🤔 WHY — DSA course-এ Python কেন, JS কেন না?

Fair question — তুমি JS-এ expert, তাহলে NeetCode 150 JS-এ করলেই তো হয়?

করা যায়। কিন্তু Python শেখার তিনটা মোক্ষম কারণ আছে:

**১. Interview-এর lingua franca।** LeetCode-এর discussion, YouTube-এর solution video, NeetCode-এর নিজের সব explanation — ৯০% Python-এ। Python না জানলে তুমি পৃথিবীর সবচেয়ে বড় solution library থেকে নিজেকে বাদ দিয়ে রাখছো।

**২. কম typing, বেশি thinking।** Interview-তে তোমার হাতে ৩০-৪৫ মিনিট। JS-এ যে কাজে ৫ লাইন লাগে, Python-এ সেটা প্রায়ই ১ লাইন। String reverse করতে JS-এ `str.split('').reverse().join('')` — Python-এ শুধু `s[::-1]`। Interview-তে প্রতিটা বাঁচানো second তোমার thinking-এ যায়।

**৩. Built-in অস্ত্রাগার।** JS-এ heap বা counter নিজে লিখতে হয়। Python-এ `heapq`, `Counter`, `deque` — সব built-in। DSA-র জন্য Python-টা আসলে একটা loaded toolbox।

আর সবচেয়ে বড় কথা — তোমার শেখার cost খুবই কম। Python আর JavaScript দুটোই **dynamically typed, interpreted** ভাষা। দুটোরই আত্মা এক। আজকের ৩০ মিনিটে তুমি Python-এ প্রথম program লিখে ফেলবে, promise।

---

## 🧭 CONCEPT JOURNEY

### Step 0: Zero setup — install নিয়ে সময় নষ্ট করবে না

Node.js install করার দিনের কথা মনে আছে? nvm, version conflict, PATH ঝামেলা? আজ ওসব কিছুই লাগবে না। তিনটা রাস্তা, তিনটাই free:

1. **LeetCode Playground** — leetcode.com-এ ঢুকে যেকোনো problem খোলো, language dropdown থেকে **Python3** select করো। ব্যস, browser-এই code চলে। যেহেতু এই course-এর গন্তব্যই LeetCode, এটাই best অভ্যাস।
2. **replit.com** — browser-এ full Python environment। নিজের মতো experiment করার জন্য।
3. **Terminal** — Mac/Linux-এ Python আগে থেকেই থাকে। Terminal খুলে লেখো:

```bash
python3
```

একটা `>>>` prompt আসবে — এটা Python-এর **REPL**, ঠিক Node-এর `node` লিখলে যে REPL আসে সেটার মতো। বের হতে `exit()` লেখো।

> **Analogy:** REPL হলো রেস্টুরেন্টের টেস্টিং কাউন্টার। পুরো রান্না (file) না করেই এক চামচ চেখে দেখা যায়। আজকের সব experiment এখানেই চলবে।

আজ থেকে rule: **setup-এ ০ মিনিট, coding-এ ৩০ মিনিট।**

---

### Step 1: `print()` — তোমার নতুন `console.log`

JS-এ তোমার সবচেয়ে পুরনো বন্ধু `console.log`। Python-এ তার নাম `print` — ছোট, মিষ্টি, কোনো `console.` prefix নেই।

```python
print("Hello, Python!")
# Output: Hello, Python!
```

JS-এর মতোই comma দিয়ে একাধিক জিনিস দেওয়া যায়, Python নিজেই মাঝে space বসিয়ে দেয়:

```python
print("Score:", 99)
# Output: Score: 99
```

আর একটা লক্ষ্য করো — লাইনের শেষে **semicolon নেই**। Python-এ `;` লেখা যায়, কিন্তু কেউ লেখে না। Newline-ই statement-এর শেষ। তোমার ডান হাতের কড়ে আঙুল আজ থেকে ছুটি পেলো।

---

### Step 2: Indentation-ই হলো `{}` — Python-এর সবচেয়ে বড় cultural shock

JS-এ block বোঝাতে তুমি `{}` লেখো, আর indentation দাও শুধু সৌন্দর্যের জন্য। Prettier ঠিক করে দেয়, ভুল indentation-এও code চলে।

Python-এ ব্যাপারটা **উল্টো**: `{}` নেই, **indentation-ই syntax**। কোন লাইন কোন block-এর ভেতরে, সেটা Python বোঝে শুধু কতটা space দিয়ে ভেতরে ঢোকানো হয়েছে তা দেখে।

```python
# JS: if (x > 5) { console.log("big"); }
x = 10
if x > 5:
    print("big")      # 4 space ভেতরে = if block-এর অংশ
    print("really!")  # এটাও if-এর ভেতরে
print("done")         # indentation নেই = if-এর বাইরে
```

খেয়াল করো তিনটা জিনিস:

- `if`-এর লাইন শেষ হয় `:` (colon) দিয়ে — এটাই JS-এর `{`-এর জায়গা নিয়েছে
- Block-এর ভেতরের লাইনগুলো **৪ space** ভেতরে (এটাই Python-এর convention)
- Block শেষ মানে indentation আগের জায়গায় ফিরে আসা — কোনো `}` লাগে না

> **Analogy:** বাংলা রচনায় নতুন paragraph বোঝাতে আমরা লাইন ছেড়ে ভেতর থেকে শুরু করি — আলাদা কোনো চিহ্ন লাগে না। Python-ও block বোঝে ওই "ভেতর থেকে শুরু" দেখেই।

Indentation ভুল হলে code **চলবেই না** — `IndentationError` ছুড়ে দেবে। প্রথম প্রথম বিরক্ত লাগবে, কিন্তু এক সপ্তাহ পরে দেখবে সবার Python code দেখতে একরকম সুন্দর — কারণ ভাষাটাই এলোমেলো code লিখতে দেয় না।

---

### Step 3: Variable — `let`/`const`/`var` কিছুই নেই

JS-এ variable বানাতে keyword লাগে। Python-এ শুধু নাম লিখে `=` বসাও, হয়ে গেল:

```python
# JS: let name = "Rafi";  const age = 30;
name = "Rafi"
age = 30
```

কোনো declaration keyword নেই। প্রথমবার assign করলেই variable-টা জন্মায়।

নিচের animation-এ Play চেপে দেখো ভেতরে কী ঘটছে — Python-এ (JS-এর মতোই) variable মানে **বাক্স না, লেবেল**। Value-টা memory-তে থাকে, variable শুধু তার গায়ে লাগানো একটা স্টিকার:

```animation
{"type":"vars","title":"score — লেবেল কীভাবে বাক্সে বাক্সে ওড়ে","steps":[
 {"boxes":[{"id":"b1","value":"10"}],"labels":[{"name":"score","box":"b1"}],"note":"score = 10 — memory-তে 10-এর একটা বাক্স তৈরি হলো, আর score লেবেলটা লাগলো তার গায়ে"},
 {"boxes":[{"id":"b1","value":"10"},{"id":"b2","value":"15"}],"labels":[{"name":"score","box":"b1"}],"note":"score = score + 5 — ডান পাশ আগে হিসাব হয়: পুরনো 10 দিয়ে 15-এর নতুন বাক্স তৈরি হলো, লেবেল কিন্তু এখনো পুরনো জায়গায়"},
 {"boxes":[{"id":"b1","value":"10"},{"id":"b2","value":"15"}],"labels":[{"name":"score","box":"b2"}],"note":"এবার লেবেলটা উড়ে গেল 15-এর বাক্সে — 10-এর বাক্সের দিকে আর কেউ তাকিয়ে নেই, garbage collector ওটা নিয়ে যাবে"},
 {"boxes":[{"id":"b2","value":"15"},{"id":"b3","value":"\"high\""}],"labels":[{"name":"score","box":"b2"}],"note":"score = \"high\" — এবার memory-তে একটা string-এর বাক্স তৈরি হলো; নিয়ম একই, ডান পাশ আগে"},
 {"boxes":[{"id":"b2","value":"15"},{"id":"b3","value":"\"high\""}],"labels":[{"name":"score","box":"b3"}],"note":"লেবেলটা string-এর গায়ে চলে গেল! একই variable একটু আগে int ছিল, এখন str — এটাই dynamic typing"}
]}
```

শেষ step-টা দেখে চমকালে? Python **dynamically typed** — একই variable আজ number, কাল string হতে পারে। JS-এর `let`-এর মতোই spirit। TypeScript-এর মতো compile-time পাহারাদার এখানে নেই (type hints আছে, কিন্তু সেটা পরের গল্প)।

**তাহলে `const` কোথায়?** নেই। Python-এ constant বোঝাতে convention হলো ALL_CAPS নাম — `MAX_SIZE = 100`। ভাষা তোমাকে আটকাবে না, কিন্তু ALL_CAPS দেখলে কোনো Python developer ওটা বদলায় না। Trust-based system!

---

### Step 4: Naming — camelCase-কে বিদায়, snake_case-কে স্বাগতম

JS-এ তুমি লেখো `userName`, `totalPrice`, `isActive`। Python community লেখে সব ছোট হাতের, শব্দের মাঝে underscore:

```python
# JS:     let userName = "Rafi";  let isActive = true;
user_name = "Rafi"
is_active = True
total_price = 99.5
```

এটা syntax error না — `userName` লিখলেও চলবে। কিন্তু Python-এর official style guide (**PEP 8**) বলে snake_case, আর interview-তে বা কারো codebase-এ camelCase Python দেখলে সেটা চোখে লাগে — অনেকটা পাঞ্জাবির সাথে sneakers পরার মতো। চলে, কিন্তু সবাই একবার তাকায়।

---

### Step 5: f-string — template literal-এর যমজ ভাই

JS-এর template literal তোমার নিঃশ্বাসের মতো সহজ: `` `Hello ${name}` ``। Python-এ ঠিক একই জিনিসের নাম **f-string** — string-এর আগে একটা `f` বসাও, ভেতরে `{}` দিয়ে variable ঢোকাও:

```python
name = "Rafi"
age = 30

# JS: console.log(`Hello ${name}, you are ${age}`);
print(f"Hello {name}, you are {age}")
# Output: Hello Rafi, you are 30
```

পার্থক্য শুধু দুটো:

- JS-এ backtick `` ` ``, Python-এ সাধারণ quote-এর আগে `f`
- JS-এ `${...}`, Python-এ শুধু `{...}` — dollar sign নেই

`{}`-এর ভেতরে expression-ও চলে, ঠিক JS-এর মতো:

```python
price = 250
qty = 3
print(f"Total: {price * qty} taka")
# Output: Total: 750 taka
```

⚠️ একটাই ফাঁদ: string-এর আগের `f`-টা ভুলে গেলে error হবে না — Python literally `{name}` টাই print করে দেবে। JS-এ backtick-এর বদলে quote দিলে যেমন `${name}` ছাপা হয়, হুবহু সেই ভুল।

---

### Step 6: Comment — `//` এখন `#`

```python
# এটা একটা comment — JS-এর // এর জায়গায় #
price = 100  # লাইনের শেষেও চলে, JS-এর মতোই
```

Multi-line comment-এর জন্য JS-এর `/* */`-এর মতো আলাদা কিছু নেই — প্রতি লাইনে `#` দাও, অথবা triple-quoted string (`"""..."""`) ব্যবহার হয় docstring হিসেবে। আপাতত `#` দিয়েই জীবন চলবে।

---

### Step 7: `type()` আর basic types — চেনা মুখ, নতুন নাম

JS-এ type দেখতে `typeof x` লেখো। Python-এ সেটা একটা function — `type(x)`:

```python
print(type(10))       # <class 'int'>
print(type(10.5))     # <class 'float'>
print(type("hi"))     # <class 'str'>
print(type(True))     # <class 'bool'>
```

আজকের চার মূল type:

| Type    | কী                       | JS-এ যা ছিল          |
| ------- | ------------------------ | -------------------- |
| `int`   | পূর্ণ সংখ্যা: `10`, `-3` | `number`-এর একটা অংশ |
| `float` | দশমিক: `10.5`, `3.14`    | `number`-এর বাকি অংশ |
| `str`   | string: `"hi"`, `'hi'`   | `string`             |
| `bool`  | `True` / `False`         | `boolean`            |

দুটো surprise লুকিয়ে আছে এখানে:

**Surprise 1: `number` ভেঙে দুই ভাগ।** JS-এ `10` আর `10.5` দুটোই `number`। Python এদের আলাদা করে — `int` আর `float`। ভালো খবর: Python-এর `int`-এর কোনো size limit নেই। JS-এ `Number.MAX_SAFE_INTEGER` পার হলে যে বিপদ, Python-এ `10**100`-ও নির্ভুল হিসাব হয়। DSA-তে এটা একটা লুকানো superpower।

**Surprise 2: `True`/`False` — capital T, capital F!** JS-এর `true`/`false` ছোট হাতের। Python-এ প্রথম অক্ষর বড় হাতের। `true` লিখলে Python ভাববে ওটা একটা variable-এর নাম, আর `NameError: name 'true' is not defined` দেবে। JS developer-দের Python-এ **সবচেয়ে common প্রথম দিনের ভুল** এটাই।

---

### Step 8: `None` — দুই ভূতের জায়গায় এক ভূত

JS-এ "কিছু নেই" বোঝাতে **দুটো** জিনিস — `null` (ইচ্ছা করে খালি রাখা) আর `undefined` (assign-ই হয়নি)। এই দুটোর পার্থক্য নিয়ে কত bug, কত interview question, `==` vs `===`-এর কত নাটক!

Python এই নাটক পুরোটাই বাদ দিয়েছে। "কিছু নেই" মানে একটাই জিনিস: **`None`** (হ্যাঁ, এটারও প্রথম অক্ষর capital)।

```python
result = None

if result is None:
    print("এখনো কোনো value নেই")
```

খেয়াল করো — `None` check করতে `==` না, **`is`** ব্যবহার করা হয়। কেন `is`, সেটা memory model-এর week-এ বিস্তারিত আসবে; আপাতত মুখস্থ: `is None` লেখাটাই Python-এর সঠিক ভঙ্গি।

আর `undefined`-এর জায়গায়? Assign না করা variable Python-এ ব্যবহার করলেই সরাসরি `NameError` — চুপচাপ `undefined` ঘুরে বেড়ানোর সুযোগই নেই। কম ভূত, কম bug।

---

## ⚡ CODE — HANDS ON

এবার হাত নোংরা করার পালা। LeetCode playground বা replit খোলো।

### তোমার প্রথম Python program

```python
# আমার প্রথম Python program — একটা mini profile card
name = "Rafi"
years_of_js = 5
knows_python = False

print(f"{name} — {years_of_js} বছরের JS developer")
print(f"Python জানে? {knows_python}")

knows_python = True  # এই lesson-এর পরে!
print(f"এখন Python জানে? {knows_python}")
```

Output:

```
Rafi — 5 বছরের JS developer
Python জানে? False
এখন Python জানে? True
```

লাইনগুলো আরেকবার দেখো — কোথাও `let` নেই, `;` নেই, `${}`-এর dollar নেই। অথচ পুরোটাই তুমি পড়ে বুঝে ফেলেছো। এটাই অনুবাদের শক্তি।

### 🧪 নিজে চেষ্টা করো #1 — আগে predict, পরে run

নিচের code-টা **না চালিয়ে** খাতায় লেখো output কী হবে। তারপর button চেপে মিলাও।

```reveal
{"prompt":"তিন লাইনের output কী হবে? আগে নিজে ভাবো","code":"x = 7\ny = 2\nprint(f\"{x} + {y} = {x + y}\")\nprint(type(x + y))\nprint(type(x / y))","answer":"7 + 2 = 9\n<class 'int'>\n<class 'float'>","explanation":"শেষ লাইনটাই twist: Python-এ / (division) সবসময় float ফেরত দেয় — এমনকি 8 / 2-ও হয় 4.0। JS-এ সব number এক জাতের বলে এটা কখনো ভাবতে হয়নি; Python-এ int আর float আলাদা জাত, আর division করলেই ফলাফল float জাতে চলে যায়। (ভাগফল int চাইলে // আছে — সেটা পরের lesson-এ।)"}
```

### 🧪 নিজে চেষ্টা করো #2 — bug ধরো

এই code-এ **দুটো** bug আছে। চালানোর আগে খুঁজে বের করো, তারপর button চেপে মিলাও।

```reveal
{"prompt":"দুটো bug কোথায়? আর চালালে আসলে কী হবে?","code":"user_name = \"Nadia\"\nis_admin = true\nprint(f\"User: {user_name}, Admin: {is_admin}\");","answer":"NameError: name 'true' is not defined","explanation":"Bug 1: true → হতে হবে True (capital T)। ছোট হাতের true মানে Python-এর কাছে এক অচেনা variable, তাই line 2-তেই NameError। Bug 2: লাইনের শেষের ; — এটা আসলে error না, code চলবে! কিন্তু এটা \"JS accent\"-এ Python বলা; PEP 8 অনুযায়ী semicolon বাদ। (তাই বলা ভালো: ১টা real bug, ১টা style crime।)"}
```

---

## 🔬 TRACING — লাইন ধরে ধরে execution

DSA course-এ tracing হবে তোমার প্রধান অস্ত্র — code-কে মাথার ভেতরে চালানো। আজ থেকেই অভ্যাসটা শুরু। নিচের animation-এ Play চেপে দেখো প্রতিটা লাইন চলার **পরে** memory-র অবস্থা:

```animation
{"type":"trace","title":"লাইন ধরে ধরে — label, f-string, None","code":["greeting = \"Hello\"","count = 1","count = count + 1","greeting = f\"{greeting} x{count}\"","print(greeting)","count = None"],"steps":[
 {"line":1,"vars":{"greeting":"\"Hello\""},"note":"greeting জন্মালো — count এখনো জন্মায়নি, এখন ওকে ব্যবহার করলে সোজা NameError"},
 {"line":2,"vars":{"count":"1"},"note":"count জন্মালো, value 1 — Python-এ প্রথম assignment-ই variable তৈরি করে"},
 {"line":3,"vars":{"count":"2"},"note":"ডান পাশ (count + 1) আগে হিসাব হয় পুরনো value দিয়ে, তারপর label-টা নতুন 2-তে সরে — JS-এও তাই ছিল"},
 {"line":4,"vars":{"greeting":"\"Hello x2\""},"note":"f-string তৈরি হওয়ার মুহূর্তে count-এর তখনকার value বসে গেল — এটা কোনো live binding না"},
 {"line":5,"out":"Hello x2","note":"print console-এ ছাপলো greeting-এর এখনকার value"},
 {"line":6,"vars":{"count":"None"},"note":"count মুছে যায়নি — সে বেঁচে আছে, শুধু এখন \"কিছু নেই\" (None) ধরে আছে"}
]}
```

তিনটা observation:

- **Line 3:** ডান পাশ (`count + 1`) আগে হিসাব হয় পুরনো value দিয়ে, তারপর label-টা নতুন value-তে সরে। JS-এও তাই ছিল।
- **Line 4:** f-string তৈরি হওয়ার **মুহূর্তে** variable-এর তখনকার value বসে যায়। পরে `count` বদলালেও `greeting` আর বদলাবে না — f-string কোনো live binding না, JS-এর template literal-ও ছিল না।
- **Line 6:** `count`-এ `None` বসানো মানে variable মুছে যায়নি — সে বেঁচে আছে, শুধু "কিছু নেই" ধরে আছে।

এখন উল্টো খেলা — animation ছাড়া, নিজেই মাথায় trace করে predict করো।

```reveal
{"prompt":"শেষ লাইনে কী print হবে? আগে খাতায় trace করো","code":"a = 10\nb = a\na = 99\nprint(f\"a={a}, b={b}\")","answer":"a=99, b=10","explanation":"Line 2-তে b label-টা লাগে 10-এর গায়ে, a নামের গায়ে না। Line 3-এ a সরে গেলেও b তার জায়গায় থাকে। Number-এর ক্ষেত্রে JS-ও ঠিক এভাবেই behave করতো — চেনা মানুষ, নতুন দেশ।"}
```

---

## 🚫 COMMON MISTAKES — JS developer-এর প্রথম দিনের ফাঁদ

❌ **ভুল:** `true` / `false` / `null` লেখা।
✅ **আসল কথা:** Python-এ `True`, `False`, `None` — তিনটাই capital দিয়ে শুরু। ছোট হাতের লিখলে `NameError`। প্রথম সপ্তাহে দিনে অন্তত একবার এই ভুল হবেই — হলে হাসো, ঠিক করো, এগোও।

❌ **ভুল:** Indentation-কে "just formatting" ভাবা — "Prettier পরে ঠিক করে দেবে।"
✅ **আসল কথা:** Python-এ indentation-ই block syntax। এক block-এর ভেতরে কোনো লাইন ২ space, কোনোটা ৪ space হলে `IndentationError`। নিয়ম একটাই: **সবসময় ৪ space**, আর tab-space মেশাবে না।

❌ **ভুল:** f-string-এর `f` ভুলে যাওয়া: `print("Hello {name}")`।
✅ **আসল কথা:** Error আসবে না, output আসবে literally `Hello {name}`। Output-এ curly brace দেখলেই প্রথমে check করো — `f` টা আছে তো?

❌ **ভুল:** `console.log(...)` বা `typeof x` লিখে ফেলা muscle memory থেকে।
✅ **আসল কথা:** `print(...)` আর `type(x)`। প্রথম কয়েকদিন আঙুল নিজে নিজে `console.` টাইপ করবে — এটা তোমার ৫ বছরের অভিজ্ঞতার প্রমাণ, লজ্জার কিছু না।

---

## 📋 আজকের JS ↔ Python cheat-table

দেয়ালে টাঙিয়ে রাখার মতো করে আজকের সবকিছু এক টেবিলে:

| কাজ                  | JavaScript                    | Python                        |
| -------------------- | ----------------------------- | ----------------------------- |
| Output               | `console.log("hi")`           | `print("hi")`                 |
| Variable             | `let x = 5;` / `const y = 6;` | `x = 5` (keyword নেই)         |
| Constant             | `const MAX = 100;`            | `MAX = 100` (convention only) |
| Block                | `if (x > 5) { ... }`          | `if x > 5:` + indentation     |
| Statement শেষ        | `;`                           | শুধু newline                  |
| Naming               | `userName` (camelCase)        | `user_name` (snake_case)      |
| String interpolation | `` `Hi ${name}` ``            | `f"Hi {name}"`                |
| Comment              | `// টীকা`                     | `# টীকা`                      |
| Type দেখা            | `typeof x`                    | `type(x)`                     |
| Boolean              | `true` / `false`              | `True` / `False`              |
| "কিছু নেই"           | `null` **এবং** `undefined`    | শুধু `None`                   |
| Number               | `number` (এক type)            | `int` আর `float` (দুই type)   |

---

## 🎯 Key Takeaways

- Python-এ setup লাগে না — **LeetCode playground / replit / terminal-এ `python3`** দিয়েই শুরু
- `console.log` → **`print()`**; লাইনের শেষে **semicolon নেই**
- **Indentation-ই block syntax** — `{}` নেই, block শুরু হয় `:` দিয়ে, ভেতরের লাইন ৪ space indent
- Variable-এ **`let`/`const`/`var` লাগে না** — শুধু `x = 5`; typing হয় **dynamic**, JS-এর মতোই
- Naming convention **snake_case** (`user_name`), constant বোঝাতে ALL_CAPS
- Template literal `` `Hi ${name}` `` → **f-string** `f"Hi {name}"` — `f` ভুলে গেলে `{name}` literally ছাপা হয়
- `True`, `False`, `None` — **তিনটাই capital**; JS-এর `null` + `undefined`-এর জায়গায় Python-এ শুধু `None`
- Type দেখতে **`type(x)`**; মূল type চারটা: `int`, `float`, `str`, `bool`

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: "তুমি তো JS developer — Python-এ interview দিচ্ছো কেন?"**
A: "Python-এ DSA code সবচেয়ে concise — কম boilerplate, তাই সময়টা syntax-এ না গিয়ে problem-solving-এ যায়। আর দুটো ভাষাই dynamically typed, তাই আমার JS-এর mental model প্রায় পুরোটাই Python-এ transfer হয়েছে — শুধু syntax-টা অনুবাদ করেছি।"

**Q: "Python-এ variable declare করতে keyword লাগে না — এটা কীভাবে কাজ করে?"**
A: "Python-এ প্রথম assignment-ই variable তৈরি করে। Variable আসলে value-র গায়ে লাগানো একটা name/label — `x = 5` মানে `5` object-টার সাথে `x` নামটা bind হলো। Re-assign করলে label-টা নতুন object-এ সরে যায়, type-ও বদলাতে পারে, কারণ Python dynamically typed।"

**Q: "Python-এর `None` আর JS-এর `null`/`undefined`-এর পার্থক্য কী?"**
A: "JS-এ absence-এর দুটো রূপ — ইচ্ছাকৃত খালি মানে `null`, আর assign-ই-হয়নি মানে `undefined`। Python-এ একটাই — `None`। Un-assigned variable ব্যবহার করলে Python চুপচাপ `undefined` না দিয়ে সরাসরি `NameError` ছোড়ে, তাই এক শ্রেণীর silent bug এখানে হয়ই না। আর `None` check করার idiomatic উপায় `is None`, `== None` না।"

---

## ➡️ WHAT'S NEXT?

তুমি এখন Python-এ কথা বলা শুরু করেছো — print করতে পারো, variable বানাতে পারো, f-string দিয়ে সাজাতে পারো। কিন্তু program মানে তো শুধু কথা বলা না — **সিদ্ধান্ত নেওয়া**। Next lesson-এ আসছে `if/elif/else`, আর সেখানে অপেক্ষা করছে এই course-এর প্রথম আসল চমক: JS-এ `[]` ছিল truthy, Python-এ `[]` **falsy!** তোমার ৫ বছরের truthiness-এর ধারণা যেখানে প্রথমবার ধাক্কা খাবে — মিস করো না।
