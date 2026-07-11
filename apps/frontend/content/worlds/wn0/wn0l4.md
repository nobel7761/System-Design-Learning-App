---
id: wn0l4
world: wn0
order: 4
title: "Function — def, default args, multiple return"
titleEn: "Functions in Python"
estMinutes: 30
type: lesson
---

## 🎬 HOOK

গত ৫ বছরে তুমি কয়টা function লিখেছ? হাজার? দশ হাজার? `const formatDate = (date) => {...}` টাইপ করা তোমার জন্য এখন আর চিন্তার বিষয় না — এটা মাংসপেশির স্মৃতি। ঘুমের মধ্যেও তুমি একটা arrow function লিখে ফেলতে পারবে।

আজকের lesson-এ সেই মাংসপেশি নতুন পোশাক পরবে। `function` আর `=>`-এর জায়গায় আসবে `def`, curly braces-এর জায়গায় colon আর indentation। এটুকু শুনে মনে হতে পারে — "ও, শুধু syntax বদল? তাহলে তো ৫ মিনিটের ব্যাপার।"

কিন্তু দাঁড়াও। Python আজ তোমাকে দুটো উপহার দেবে, যেটা JavaScript ৫ বছরেও দেয়নি।

**উপহার ১:** function call করার সময় argument-এর নাম ধরে ডাকা — `binary_search(arr, target=5)`। JS-এ এটা করতে তোমাকে object destructuring-এর নাটক করতে হতো।

**উপহার ২:** একটা function থেকে একসাথে দুটো, তিনটা, চারটা value return করা — `return index, count` — কোনো array বা object-এ মুড়িয়ে না দিয়ে, সরাসরি। DSA-র জগতে এই দ্বিতীয় উপহারটা তুমি প্রতিদিন ব্যবহার করবে।

আর হ্যাঁ, শেষে একটা কুখ্যাত Python trap-ও দেখাব — যেটাতে পড়ে senior engineer-রাও production bug ship করেছে। চলো শুরু করি।

---

## 🤔 WHY — এটা না জানলে কী মিস করবে?

তুমি হয়তো ভাবছ — "function তো function-ই, নতুন করে শেখার কী আছে?" তিনটা কারণ আছে।

**এক,** NeetCode-এর ১৫০টা problem-এর প্রতিটাই একটা function দিয়ে শুরু হয়। LeetCode তোমাকে দেবে `def twoSum(self, nums, target):` — এই signature-টা পড়তে না পারলে, প্রথম লাইনেই আটকে যাবে।

**দুই,** multiple return হলো DSA-র secret weapon। Binary search-এ index আর comparison count দুটোই ফেরত দিতে চাও? Two pointer-এ left আর right দুটোই? JS-এ তুমি লিখতে `return [left, right]` তারপর destructure করতে। Python-এ `return left, right` — ব্যস। এই pattern এত বেশি আসবে যে আজই এটা আয়ত্তে আনা দরকার।

**তিন,** সামনে recursion আসছে (এই course-এর সবচেয়ে গুরুত্বপূর্ণ অধ্যায়)। Recursion মানে function নিজেকে নিজে ডাকে — আর সেটা বুঝতে হলে আগে পরিষ্কারভাবে জানতে হবে একটা সাধারণ function call-এর সময় ভেতরে ঠিক কী ঘটে: argument কোথায় যায়, local variable কোথায় থাকে, return-এর পরে কী হয়। আজকের tracing section সেই ভিতটা গড়ে দেবে।

তাহলে ঢুকে পড়ি।

---

## 🧭 CONCEPT JOURNEY

### `def` — নতুন পোশাক, পুরনো শরীর

প্রথমে পাশাপাশি দেখো। JS-এ তুমি যেটা লেখো:

```javascript
// JavaScript
function greet(name) {
  return `Hello, ${name}!`;
}
// অথবা arrow:
const greet = (name) => `Hello, ${name}!`;
```

Python-এ ঠিক সেটাই:

```python
def greet(name):
    return f"Hello, {name}!"
```

তিনটা পার্থক্য চোখে পড়ছে?

1. `function` keyword-এর জায়গায় `def` (define-এর সংক্ষেপ)
2. Braces `{}` নেই — parameter list-এর পরে একটা **colon** (`:`), তারপর **indented body**। wn0l2-তে `if`-এর বেলায় যে নিয়ম শিখেছিলে, এখানেও তাই — indentation-ই বলে দেয় function-এর body কোথায় শুরু, কোথায় শেষ
3. f-string — এটা তো wn0l1 থেকেই তোমার চেনা

> **Analogy:** ধরো তুমি ঢাকা থেকে কলকাতা গেলে। রিকশা সেখানেও আছে, চা-ও আছে — শুধু টাকার নোটগুলো দেখতে আলাদা। Function-ও তাই: ধারণাটা হুবহু এক, শুধু নোটের ছাপ বদলেছে।

Call করার নিয়ম একদম এক: `greet("Nobel")`। কোনো চমক নেই।

### `return` — আর না লিখলে `None`

JS-এ একটা function কিছু `return` না করলে সে চুপচাপ `undefined` ফেরত দেয়। Python-এ ফেরত দেয় **`None`**।

```python
def log_message(msg):
    print(f"[LOG] {msg}")
    # কোনো return নেই

result = log_message("server started")
print(result)   # None
```

`None` হলো Python-এর `null` আর `undefined` দুটোর একসাথে করা রূপ — Python-এ "কিছু নেই" বোঝানোর মাত্র একটাই জিনিস আছে, JS-এর মতো দুটো না। তুলনা করার সময় লেখো `if result is None:` — `is` operator দিয়ে, `==` দিয়ে না (কেন, সেটা পরের কোনো lesson-এর গল্প; আপাতত `is None`-টা মুখস্থ pattern হিসেবে নাও)।

একটা জিনিস খেয়াল করো: `print()` নিজেও একটা function, আর সে-ও `None` return করে। তাই `x = print("hi")` লিখলে `x`-এ থাকবে `None`। JS-এ `console.log`-এর বেলায়ও তো তাই — `undefined` পেতে।

### Default arguments — এটা তোমার চেনা

```python
def paginate(items, page_size=10):
    return items[:page_size]
```

JS-এর `function paginate(items, pageSize = 10)` — হুবহু একই ধারণা। Argument না দিলে default বসে, দিলে তোমারটা বসে। এখানে শেখার নতুন কিছু নেই... **শুধু একটা মারাত্মক ব্যতিক্রম ছাড়া**, যেটা COMMON MISTAKES-এ অপেক্ষা করছে। মনে করিয়ে দেব।

### Keyword arguments — প্রথম উপহার 🎁

এবার সেই জিনিস যেটা JS-এ নেই। Python-এ function call করার সময় তুমি parameter-এর **নাম ধরে** value পাঠাতে পারো:

```python
def create_user(name, role="member", active=True):
    return f"{name} ({role}, active={active})"

# তিনভাবেই call করা যায়:
create_user("Nobel")                          # positional
create_user("Nobel", role="admin")            # নাম ধরে
create_user(role="admin", name="Nobel")       # order-ও উল্টে দেওয়া যায়!
```

শেষ লাইনটা আবার দেখো — argument-এর **order বদলে গেছে**, তবু কাজ করছে। কারণ তুমি নাম বলে দিয়েছ, Python আর position গুনছে না।

JS-এ এই সুবিধা language-এ নেই বলে তোমরা কী করতে, মনে আছে? Object destructuring-এর নাটক:

```javascript
// JS-এ keyword args-এর নকল — একটা object পাঠিয়ে destructure
function createUser({ name, role = "member", active = true }) { ... }
createUser({ role: "admin", name: "Nobel" });
```

Python-এ এই boilerplate লাগে না — যেকোনো সাধারণ function-কে এমনিতেই নাম ধরে ডাকা যায়।

> **Analogy:** Positional argument হলো রেস্টুরেন্টে বলা — "১ নম্বর, ৩ নম্বর আইটেম দিন" — menu-র serial মুখস্থ রাখতে হয়। Keyword argument হলো — "ভাত আর ইলিশ দিন" — নাম বললে serial ভুল হওয়ার ভয়ই নেই।

কবে ব্যবহার করবে? যখন function-এর অনেক parameter আছে আর call দেখে বোঝা যাচ্ছে না কোনটা কী। `sorted(arr, reverse=True)` পড়ামাত্র বোঝা যায়; `sorted(arr, True)` হলে বুঝতে documentation খুলতে হতো (আর Python এটা allow-ও করে না — `reverse` কেবল keyword হিসেবেই দেওয়া যায়)।

একটাই নিয়ম মনে রেখো: **positional আগে, keyword পরে।** `f(x=2, 5)` লিখলে `SyntaxError: positional argument follows keyword argument`।

### Multiple return values — দ্বিতীয় উপহার, DSA-র প্রাণ 🎁

এবার আজকের সবচেয়ে গুরুত্বপূর্ণ অংশ। Python-এ একটা function **একসাথে একাধিক value return করতে পারে**:

```python
def min_max(arr):
    return min(arr), max(arr)

low, high = min_max([3, 7, 1, 9, 4])
print(low, high)   # 1 9
```

`return min(arr), max(arr)` — comma দিয়ে আলাদা করে যতগুলো খুশি value। আর নেওয়ার সময় `low, high = ...` — দুটো variable-এ সরাসরি খুলে নেওয়া। এটাকে বলে **tuple unpacking**। ভেতরে ঠিক কী ঘটে, Play চেপে দেখো:

```animation
{"type":"vars","title":"low, high = min_max(...) — tuple unpacking ভেতরে","steps":[
 {"boxes":[{"id":"a","value":"1"},{"id":"b","value":"9"}],"labels":[],"note":"min_max-এর ভেতরে min(arr) দিল 1, max(arr) দিল 9 — দুটো আলাদা value"},
 {"boxes":[{"id":"t","value":"(1, 9)"}],"labels":[],"note":"return min(arr), max(arr) — Python চুপিচুপি দুটোকে একটা tuple-এ মুড়ে caller-এর দিকে পাঠাল"},
 {"boxes":[{"id":"t","value":"(1, 9)"}],"labels":[{"name":"low","box":"t"},{"name":"high","box":"t"}],"note":"বাঁ দিকে low আর high অপেক্ষায় — দুটো লেবেল, tuple-এও দুটো value, সংখ্যা মিলে গেছে"},
 {"boxes":[{"id":"a","value":"1"},{"id":"b","value":"9"}],"labels":[{"name":"low","box":"a"},{"name":"high","box":"b"}],"note":"unpack! low লেবেল বসল 1-এর বাক্সে, high বসল 9-এর বাক্সে — tuple-এর কাজ শেষ"}
]}
```

কথায় বললে: Python value-গুলোকে একটা **tuple**-এ (immutable list — বিস্তারিত wn0l6-এ) মুড়ে পাঠায়, আর unpacking-এ খুলে দেয়। JS-এর সবচেয়ে কাছের জিনিস:

```javascript
// JS: array-তে মুড়িয়ে পাঠাও, destructure করে খোলো
function minMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [low, high] = minMax([3, 7, 1, 9, 4]);
```

দেখতে কাছাকাছি, কিন্তু পার্থক্যটা দর্শনে: JS-এ এটা একটা **কৌশল** — তুমি নিজ দায়িত্বে array বানাও, নিজ দায়িত্বে খোলো, brackets সবখানে। Python-এ এটা **first-class ভাষার feature** — `return a, b` লিখলেই হলো, কোনো bracket নেই, পড়তেও লাগে স্বাভাবিক বাংলা বাক্যের মতো।

DSA-তে এটা কেন সোনার খনি? কয়েকটা বাস্তব দৃশ্য:

```python
# দৃশ্য ১: binary search — index আর পাওয়া গেল কি না, দুটোই
def search(arr, target):
    # ... খোঁজাখুঁজি ...
    return found, index

# দৃশ্য ২: দুটো variable-এর মান অদলবদল (swap) — temp variable ছাড়াই!
a, b = b, a

# দৃশ্য ৩: ভাগফল আর ভাগশেষ একসাথে
q, r = divmod(17, 5)   # q=3, r=2
```

দৃশ্য ২-টা আলাদা করে দেখো — `a, b = b, a`। JS-এ swap করতে হয় `[a, b] = [b, a]` লিখে। Python-এরটা এতই মসৃণ যে two-pointer, sorting, linked list reversal — সবখানে এক লাইনে swap সেরে ফেলবে।

**সাবধানতা একটাই:** বাঁ দিকে যতগুলো variable, ডান দিকে ততগুলো value থাকতে হবে। `x, y = min_max_sum(arr)` লিখলে যদি function তিনটা value দেয়, পাবে `ValueError: too many values to unpack`। JS destructuring এখানে উদার ছিল (বাড়তিগুলো চুপচাপ ফেলে দিত) — Python কড়া শিক্ষকের মতো, ভুল হলে তখনই ধরিয়ে দেয়।

### `*args` আর `**kwargs` — rest/spread-এর জ্ঞাতি ভাই

JS-এর `...rest` চেনো তো? Python-এ তার নাম `*args`:

```python
def total(*args):          # JS: function total(...nums)
    return sum(args)       # args হলো একটা tuple

total(1, 2, 3, 4)          # 10
```

আর `**kwargs` নেয় নাম-না-জানা keyword argument-গুলো, একটা dict হিসেবে (dict = JS object, wn0l6-এ আসছে):

```python
def config(**kwargs):
    print(kwargs)

config(debug=True, port=8000)   # {'debug': True, 'port': 8000}
```

JS-এ keyword argument-ই নেই, তাই `**kwargs`-এর সরাসরি জোড়া নেই — সবচেয়ে কাছে সেই options object pattern। আপাতত এটুকু চেনা থাকলেই চলবে — DSA-তে এদের দেখা কম মেলে, কিন্তু library-র code পড়তে গেলে হরদম চোখে পড়বে।

### `lambda` — arrow function-এর ছোট ভাই

```python
double = lambda x: x * 2       # JS: const double = x => x * 2
double(5)                       # 10
```

মিল স্পষ্ট, কিন্তু একটা বড় সীমাবদ্ধতা আছে: Python-এর lambda-য় **শুধু একটাই expression** থাকতে পারে। কোনো `if` block না, কোনো loop না, একাধিক statement না। JS arrow function-এ তুমি `{}` দিয়ে পুরো body লিখতে পারতে — Python বলে, "বড় কাজ থাকলে ভদ্রভাবে `def` লেখো।"

তাহলে lambda-র আসল কাজ কী? **এক লাইনের ছোট function অন্য function-এর হাতে ধরিয়ে দেওয়া।** সবচেয়ে বিখ্যাত ব্যবহার — sorting-এর key:

```python
users = [("Nobel", 30), ("Rafi", 25), ("Sadia", 28)]
sorted(users, key=lambda u: u[1])   # বয়স অনুযায়ী sort!
```

JS-এ `users.sort((a, b) => a[1] - b[1])` — comparator লিখে দুটোর তুলনা করতে হতো। Python-এ শুধু বলে দাও "কোন জিনিসটা ধরে sort করবে" — বাকিটা Python-এর দায়িত্ব। এই `key=` pattern-এর পুরো গল্প wn0l8-এ; আজ শুধু মুখ চিনে রাখো।

### Function-ও একটা value — তুমি এটা আগে থেকেই জানো

JS-এ ৫ বছর কাটিয়ে তুমি জানো function হলো first-class citizen — variable-এ রাখা যায়, argument হিসেবে পাঠানো যায়, callback বানানো যায়। Python-এও **হুবহু তাই**:

```python
def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

def announce(formatter, msg):     # function-কে argument হিসেবে নিচ্ছে
    print(formatter(msg))

announce(shout, "meeting at 5")     # MEETING AT 5!
announce(whisper, "meeting at 5")   # meeting at 5...
```

খেয়াল করো — `announce(shout, ...)` লেখার সময় `shout`-এর পরে **কোনো parentheses নেই**। `shout` মানে function-টা নিজে (JS-এও তাই ছিল), আর `shout()` মানে এখনই call করো। উপরের `sorted(users, key=lambda...)`-ও তো এই একই ব্যাপার — একটা function আরেকটা function-এর হাতে তুলে দেওয়া।

### Docstring — comment-এর ভদ্র সংস্করণ

শেষ ছোট্ট জিনিস। Python-এ function-এর প্রথম লাইনে একটা string লিখলে সেটা হয় **docstring** — function-এর নিজের documentation:

```python
def binary_search(arr, target):
    """Sorted arr-এ target খোঁজে; পেলে index, না পেলে -1 return করে।"""
    ...
```

JS-এর JSDoc comment-এর (`/** ... */`) মতো, কিন্তু এটা comment না — language-এর অংশ, `help(binary_search)` দিয়ে পড়াও যায়। DSA practice-এ বাধ্যতামূলক না, তবে চোখে পড়লে যেন চিনতে পারো।

---

## ⚡ CODE — HANDS ON

এবার হাত চালাও। সব কটা ধারণা এক জায়গায় — একটা ছোট DSA-ঘেঁষা উদাহরণ:

```python
def analyze(arr, threshold=0):
    """arr-এর মধ্যে threshold-এর বড় সংখ্যা কয়টা, আর তাদের যোগফল কত।"""
    count = 0
    total = 0
    for x in arr:
        if x > threshold:
            count += 1
            total += x
    return count, total    # একসাথে দুটো value!

nums = [4, -2, 7, 0, 9]

c, t = analyze(nums)                 # threshold default 0
print(f"positive: {c}টা, sum={t}")   # positive: 3টা, sum=20

c, t = analyze(nums, threshold=5)    # keyword argument
print(f"বড়: {c}টা, sum={t}")         # বড়: 2টা, sum=16
```

এই ১৫ লাইনে আছে: `def` + colon + indentation, default argument, keyword argument দিয়ে call, multiple return, tuple unpacking, আর wn0l3-এর loop। পুরো lesson-টা এক screen-এ।

### নিজে চেষ্টা করো ১ 🎮

```reveal
{"prompt":"Code চালানোর আগে চারটা লাইনের output কাগজে predict করো, তারপর মেলাও","code":"def mystery(a, b=10):\n    return a + b\n\nprint(mystery(5))\nprint(mystery(5, 20))\nprint(mystery(b=1, a=2))\nprint(mystery(5) == mystery(a=5))","answer":"15\n25\n3\nTrue","explanation":"লাইন ১: b না দেওয়ায় default 10 → 5+10=15। লাইন ২: b=20 positionally → 25। লাইন ৩: keyword-এ order উল্টানো, a=2 আর b=1 → 3। লাইন ৪: দুই call-ই আসলে a=5, b=10 → দুটোই 15, তাই True।"}
```

### নিজে চেষ্টা করো ২ 🎮

```reveal
{"prompt":"এটা একটু ধূর্ত — print(result) কী দেখাবে? আগে নিজে ভাবো","code":"def process(data):\n    data = data * 2\n\nresult = process([1, 2])\nprint(result)","answer":"None","explanation":"ধরা খেলে? process-এর ভেতরে data * 2 হিসাব হয়েছে ঠিকই, কিন্তু return নেই — তাই function None ফেরত দিয়েছে। JS-এ এই ভুলে undefined পেতে, Python-এ None। \"কেন আমার variable-এ None?\" — এই প্রশ্নের উত্তর ৯০% ক্ষেত্রে: return লিখতে ভুলে গেছ।"}
```

---

## 🔬 TRACING — ভেতরে ঢুকে দেখা

এখন সেই অভ্যাসটা শুরু করি যেটা recursion-এর সময় তোমার জীবন বাঁচাবে: **হাতে trace করা**। একটা function call মানে Python-এর call stack-এ একটা নতুন বাক্স (frame) চাপে — সেখানে থাকে argument আর local variable। `return` মানে বাক্সটা সরে যায়, আর value-টা caller-এর হাতে পৌঁছায়।

প্রথমে বড় ছবিটা — `analyze(nums, threshold=5)` call-এ stack-এ frame কীভাবে ওঠে আর নামে, Play চেপে দেখো:

```animation
{"type":"stack","title":"analyze() call — stack-এ frame ওঠা-নামা","steps":[
 {"frames":["main()"],"note":"তোমার script চলছে — stack-এ শুধু main-এর frame, ভেতরে nums বসে আছে"},
 {"frames":["main()","analyze(arr=[4, -2, 7, 0, 9], threshold=5)"],"note":"analyze call হলো — নতুন frame উপরে চাপল, argument-রা সেই frame-এ ঢুকল"},
 {"frames":["main()","analyze(arr=[4, -2, 7, 0, 9], threshold=5)"],"note":"frame-এর ভেতরে count আর total জন্ম নিল, loop চলছে — main নিচে চুপচাপ অপেক্ষায়"},
 {"frames":["main()"],"note":"return count, total — frame pop! (2, 16) tuple-টা বেরিয়ে গেল caller-এর হাতে"},
 {"frames":["main()"],"note":"main-এ unpacking: c=2, t=16 — analyze-এর count/total চিরতরে মুছে গেছে, বাইরে থেকে ছোঁয়ার উপায় নেই"}
]}
```

এবার সেই frame-এর ভেতরে ঢুকে line-by-line trace — ঠিক যেভাবে তুমি কাগজে আঁকবে:

```animation
{"type":"trace","title":"analyze([4, -2, 7, 0, 9], threshold=5) — line-by-line","code":["def analyze(arr, threshold=0):","    count = 0","    total = 0","    for x in arr:","        if x > threshold:","            count += 1","            total += x","    return count, total","","c, t = analyze([4, -2, 7, 0, 9], threshold=5)"],"steps":[
 {"line":10,"vars":{"arr":"[4, -2, 7, 0, 9]","threshold":"5"},"note":"call হলো — arr আর threshold argument হিসেবে নতুন frame-এ ঢুকল"},
 {"line":3,"vars":{"count":"0","total":"0"},"note":"locals জন্ম নিল — count=0, total=0"},
 {"line":5,"vars":{"x":"4"},"note":"x=4 → 4 > 5? না — কিছু হলো না (x=-2 আর x=0-এর বেলায়ও তাই)"},
 {"line":7,"vars":{"x":"7","count":"1","total":"7"},"note":"x=7 → 7 > 5? হ্যাঁ — count=1, total=7"},
 {"line":7,"vars":{"x":"9","count":"2","total":"16"},"note":"x=9 → হ্যাঁ — count=2, total=16; loop শেষ"},
 {"line":8,"note":"return count, total — (2, 16) tuple হয়ে বের হলো, frame মুছে গেল"},
 {"line":10,"vars":{"c":"2","t":"16"},"out":"c=2, t=16","note":"unpacking-এ (2, 16) ভাগ হয়ে c আর t-তে ঢুকল — return value-ই একমাত্র জিনিস যেটা বেঁচে ফিরল"}
]}
```

তিনটা কথা এই দুটো animation থেকে সঙ্গে নাও:

1. **Argument ঢোকে বাক্সে, local variable জন্মায় বাক্সে, return-এ বাক্স মুছে যায়** — `count` আর `total`-কে function-এর বাইরে থেকে ছোঁয়ার কোনো উপায় নেই (JS-এর function scope-এর মতোই)
2. Return value-টাই একমাত্র জিনিস যেটা বাক্স থেকে বেঁচে ফেরে
3. এখানে stack-এ বাক্স ছিল মোটে দুটো। Recursion-এ (Phase 1) একই function-এর ৫-৬টা বাক্স একসাথে stack-এ দাঁড়িয়ে থাকবে — আর তুমি ঠিক এই ছবিটাই আঁকবে, শুধু লম্বা করে। আজকের এই অভ্যাসটাই তখন তোমার superpower।

---

## 🚫 COMMON MISTAKES

### ১. Mutable default argument — Python-এর সবচেয়ে কুখ্যাত trap ⚠️

কথা দিয়েছিলাম, ফিরে আসব। এটা মন দিয়ে পড়ো — এই প্রশ্ন Python interview-তেও আসে।

❌ **ভুল ধারণা:** "`def add_task(task, tasks=[])` লিখলে প্রতি call-এ নতুন খালি list পাব — JS-এর `(task, tasks = [])`-এর মতো।"

✅ **আসল কথা:** Python default value **মাত্র একবার** evaluate করে — function টা define হওয়ার মুহূর্তে। JS করে **প্রতিটা call-এ** নতুন করে। ফলাফল দেখো:

```python
def add_task(task, tasks=[]):
    tasks.append(task)
    return tasks

print(add_task("email"))    # ['email']
print(add_task("deploy"))   # ['email', 'deploy'] 😱 আগেরটা রয়ে গেছে!
```

দ্বিতীয় call-এ নতুন খালি list আসেনি — **সেই একই পুরনো list** আবার এসেছে, আগের `"email"` সমেত! কারণ `[]`-টা তৈরি হয়েছিল একবারই, `def` লাইনটা পড়ার সময়; প্রতিটা call সেই একটাই list-কে ভাগাভাগি করে আর `append` দিয়ে সেটাকেই বদলে (mutate করে) দেয়। Play চেপে নিজের চোখে দেখো — খেয়াল রেখো, বাক্স কিন্তু সারাক্ষণ **একটাই**:

```animation
{"type":"vars","title":"mutable default trap — একটাই list, সব call-এ ভাগাভাগি","steps":[
 {"boxes":[{"id":"d","value":"[]"}],"labels":[{"name":"default","box":"d"}],"note":"def লাইনটা পড়ার মুহূর্তে [] বাক্সটা একবারই তৈরি হলো — function-এর গায়ে default লেবেল দিয়ে সাঁটা"},
 {"boxes":[{"id":"d","value":"[]"}],"labels":[{"name":"default","box":"d"},{"name":"tasks","box":"d"}],"note":"প্রথম call: add_task('email') — tasks argument না দেওয়ায় tasks লেবেল বসল সেই একই বাক্সে"},
 {"boxes":[{"id":"d","value":"['email']"}],"labels":[{"name":"default","box":"d"},{"name":"tasks","box":"d"}],"note":"append('email') — নতুন বাক্স তৈরি হয়নি, এই বাক্সটাই ভেতর থেকে বদলে গেল (mutate)"},
 {"boxes":[{"id":"d","value":"['email']"}],"labels":[{"name":"default","box":"d"},{"name":"tasks","box":"d"}],"note":"দ্বিতীয় call: add_task('deploy') — default লেবেল এখনো সেই পুরনো বাক্সেই দেখাচ্ছে, 'email' সমেত!"},
 {"boxes":[{"id":"d","value":"['email', 'deploy']"}],"labels":[{"name":"default","box":"d"},{"name":"tasks","box":"d"}],"note":"append('deploy') → ['email', 'deploy'] — নতুন খালি list কোনোদিন আসেইনি, দুই call একই বাক্স ভাগ করেছে"},
 {"boxes":[{"id":"d","value":"['email', 'deploy']"},{"id":"n","value":"[]"}],"labels":[{"name":"default","box":"d"},{"name":"tasks","box":"n"}],"note":"সমাধান: default-এ None রেখে ভেতরে tasks = [] — এবার প্রতি call-এ সত্যিই নতুন বাক্স জন্মায়"}
]}
```

সঠিক Python idiom:

```python
def add_task(task, tasks=None):
    if tasks is None:
        tasks = []        # এবার প্রতি call-এ সত্যিই নতুন list
    tasks.append(task)
    return tasks
```

মুখস্থ নিয়ম: **default হিসেবে কখনো `[]` বা `{}` লিখবে না — `None` লিখে ভেতরে বানাবে।** (`limit=10` বা `name="x"`-এর মতো number/string default-এ সমস্যা নেই — ওগুলো mutate করা যায় না।)

### ২. Return ভুলে যাওয়া

❌ **ভুল ধারণা:** "function-এর ভেতরে হিসাব করলেই result বাইরে চলে আসবে।"
✅ **আসল কথা:** `return` না লিখলে পাবে `None`। "নিজে চেষ্টা করো ২"-তে হাতেনাতে দেখেছ। বিশেষ করে `print(x)` আর `return x` গুলিয়ো না — `print` শুধু screen-এ দেখায়, caller-কে কিছুই দেয় না।

### ৩. Keyword-এর পরে positional

❌ **ভুল:** `create_user(role="admin", "Nobel")`
✅ **আসল কথা:** `SyntaxError: positional argument follows keyword argument`। নিয়ম একটাই — positional-রা লাইনের সামনে, keyword-রা পেছনে।

### ৪. Unpacking-এ সংখ্যা না মেলা

❌ **ভুল ধারণা:** "JS destructuring-এর মতো বাড়তি value ফেলে দেবে।"
✅ **আসল কথা:** `x, y = f()` — কিন্তু `f` তিনটা value দিলে `ValueError: too many values to unpack`। বাঁ-ডান সংখ্যা হুবহু মিলতে হবে।

---

## 🎯 KEY TAKEAWAYS

- `def name(params):` + indented body — braces নেই, **colon + indentation**-ই function-এর গঠন
- `return` না থাকলে function **`None`** return করে (JS-এর `undefined`-এর জায়গায়); check করো `is None` দিয়ে
- **Keyword arguments** — `f(limit=5, x=2)` — call-site-এ নাম ধরে ডাকা, order-ও উল্টানো যায়; JS-এ নেই, object destructuring দিয়ে নকল করতে হতো
- **Multiple return:** `return a, b` → `x, y = f()` — ভেতরে tuple, বাইরে unpacking; swap হয় `a, b = b, a` — DSA-তে সারাক্ষণ লাগবে
- `*args` = JS-এর `...rest`; `lambda x: x * 2` = `x => x * 2` কিন্তু **একটাই expression** — মূল কাজ `sorted(..., key=...)`-র মতো জায়গায়
- **Mutable default trap:** `def f(arr=[])` — default **একবারই** evaluate হয়, সব call একই list ভাগ করে; সমাধান `arr=None` + ভেতরে `arr = []`

---

## 🎤 Interview-এ যদি জিজ্ঞেস করে...

**Q: "Python-এ একটা function দুটো value কীভাবে return করে? JS-এর সাথে পার্থক্য কী?"**
A: "`return a, b` লিখলেই হয় — Python ভেতরে একটা tuple বানিয়ে পাঠায়, আর caller `x, y = f()` দিয়ে unpack করে নেয়। JS-এ language-level support নেই — array বা object-এ মুড়িয়ে return করে destructure করতে হয়। Python-এরটা first-class feature, তাই `a, b = b, a` দিয়ে swap-ও এক লাইনে হয়ে যায়।"

**Q: "`def f(items=[])` লিখলে সমস্যা কী?"**
A: "Python default argument function define হওয়ার সময় মাত্র একবার evaluate করে — প্রতি call-এ না। তাই সব call একই list object share করে; একটা call `append` করলে পরের call-ও সেই বদলে যাওয়া list-টাই default হিসেবে পায়। ঠিক করার idiom: `items=None` default রেখে function-এর ভেতরে `if items is None: items = []`।"

**Q: "Python-এর lambda আর JS-এর arrow function কি একই জিনিস?"**
A: "ধারণাগতভাবে হ্যাঁ — দুটোই ছোট anonymous function। কিন্তু Python-এর lambda-য় শুধু একটা expression লেখা যায় — একাধিক statement বা block চলবে না; JS arrow function-এ `{}` দিয়ে পুরো body লেখা যায়। তাই Python-এ lambda মূলত `sorted`-এর `key`-এর মতো এক লাইনের কাজে লাগে; এর বড় কিছু হলেই `def`।"

---

## ➡️ WHAT'S NEXT?

তোমার Python toolkit-এ এখন variables, conditionals, loops, আর functions — অর্থাৎ programming-এর চারটা মূল স্তম্ভই আছে। কিন্তু DSA-র আসল খেলা যেখানে হয় — সেই মাঠটাই এখনো বাকি: **list**। পরের lesson-এ (wn0l5) দেখবে Python-এর list আসলে তোমার চেনা JS array-ই — `append`/`pop` হলো `push`/`pop` — কিন্তু সাথে পাবে এমন এক অস্ত্র যেটা JS-এ কোনোদিন ছিল না: **slicing**। `arr[1:4]`, `arr[::-1]`, `arr[-1]` — এক লাইনে reverse, negative index দিয়ে শেষ থেকে ধরা। LeetCode-এর প্রতিটা array problem-এ আজকের multiple return আর কালকের slicing জুটি বেঁধে নামবে। দেখা হচ্ছে।
