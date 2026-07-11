---
id: wn0l2
world: wn0
order: 2
title: "সিদ্ধান্ত — if/elif/else ও truthiness-এর ফাঁদ"
titleEn: "Conditionals & Truthiness Traps"
estMinutes: 30
type: lesson
---

## 🎬 HOOK

গল্পটা তোমার চেনা লাগতে পারে। এক senior JS developer — ৫ বছরের experience, ঠিক তোমার মতো — একটা interview-তে বসেছে। Question সহজ: "user-এর order list খালি হলে একটা message দেখাও।" সে confident হাতে লিখল:

```javascript
if (orders) {
  showOrders(orders);
} else {
  showMessage("কোনো order নেই");
}
```

Interviewer মুচকি হাসলেন: "orders যদি `[]` হয় — খালি array — তাহলে কী হবে?"

সেই মুহূর্তে developer-এর মেরুদণ্ড দিয়ে ঠান্ডা স্রোত নেমে গেল। কারণ JS-এ `[]` হলো **truthy**। খালি array-ও `if`-এর চোখে "সত্য"। তাই user-কে দেখানো হবে একটা খালি order page — message না। Classic JS bug, production-এ লাখবার ঘটেছে।

এখন Python মঞ্চে ঢোকে, আর শান্ত গলায় বলে: **"আমার এখানে খালি বাক্স মানেই মিথ্যা।"** খালি list, খালি dict, খালি string — সব falsy। যে জিনিসটা JS-এ bug ছিল, Python-এ সেটা design। কিন্তু সাবধান — এই উল্টো নিয়মটাই এখন _তোমার_ জন্য নতুন ফাঁদ। আজকের lesson সেই ফাঁদগুলো চেনার।

---

## 🤔 WHY SHOULD I CARE?

তুমি NeetCode 150-এর পথে নেমেছ। সেই ১৫০টা problem-এর প্রায় প্রতিটাতে তুমি লিখবে — "array খালি কি না check করো", "value `None` কি না দেখো", "index range-এর মধ্যে আছে কি না যাচাই করো"। মানে: **conditional logic হলো DSA-র শ্বাস-প্রশ্বাস।**

সমস্যা হলো, তোমার আঙুলে ৫ বছরের JS muscle memory। তুমি reflex-এ `&&` লিখবে, `===` খুঁজবে, আর ভাববে `[]` truthy। Python-এ এই তিনটা reflex-ই ভুল। Truthiness-এর পার্থক্যটা সবচেয়ে বিপজ্জনক, কারণ code **error দেবে না** — চুপচাপ ভুল branch-এ চলে যাবে। LeetCode-এ এর মানে: ৯৮টা test case pass, ২টা edge case fail, আর তুমি আধঘণ্টা মাথা চুলকাচ্ছ।

আজ ৩০ মিনিটে তুমি শিখবে Python-এর decision-making — JS-এর সাথে line-by-line তুলনা করে। শেষে তোমার হাতে থাকবে এমন একটা idiom (`if not arr:`) যেটা তুমি সামনের ১৫০টা problem-এ বারবার লিখবে।

---

## 🧭 CONCEPT JOURNEY

### ১. if/elif/else — বন্ধনী ঝেড়ে ফেলো

আগের lesson-এ শিখেছিলে Python-এ `{}`-এর বদলে **indentation** দিয়ে block হয়। Conditional-ও সেই একই নিয়ম। পাশাপাশি দেখো:

```javascript
// JavaScript — তোমার পুরনো জগত
if (score >= 80) {
  console.log("A grade");
} else if (score >= 60) {
  console.log("B grade");
} else {
  console.log("আরো পড়ো");
}
```

```python
# Python — নতুন জগত
if score >= 80:
    print("A grade")
elif score >= 60:
    print("B grade")
else:
    print("আরো পড়ো")
```

তিনটা পরিবর্তন খেয়াল করো:

1. **Condition-এর চারপাশে parentheses নেই।** `if (score >= 80)` লিখলে error হবে না, কিন্তু Python-এ এটা beginner-এর লক্ষণ। শুধু `if score >= 80:` লেখো।
2. **`else if` নয়, `elif`।** Python এটাকে এক শব্দে ছোট করেছে। `else if` লিখলে `SyntaxError`।
3. **Line-এর শেষে colon (`:`)।** এই colon-টা Python-কে বলে "এরপর একটা indented block আসছে।" Colon ভুলে যাওয়া হলো JS developer-দের সবচেয়ে common প্রথম-সপ্তাহের error।

> **Analogy:** JS-এর `{ }` হলো দেয়াল দেওয়া ঘর — কোথায় ঘর শুরু আর শেষ, দেয়াল বলে দেয়। Python-এর indentation হলো খোলা অফিসের floor marking — মেঝেতে দাগ টেনে বলা "এই জায়গাটা এই team-এর।" দেয়াল নেই, কিন্তু সীমানা পরিষ্কার। আর colon হলো দরজার সাইনবোর্ড: "ভেতরে ঢুকছ, প্রস্তুত হও।"

Python কীভাবে branch বেছে নেয়, Play চেপে step-by-step দেখো — `score = 72` হলে কোন প্রশ্নের পর কোন প্রশ্ন আসে:

```animation
{"type":"trace","title":"if/elif/else — Python কোন branch-এ ঢুকবে?","code":["score = 72","if score >= 80:","    print(\"A grade\")","elif score >= 60:","    print(\"B grade\")","else:","    print(\"আরো পড়ো\")"],"steps":[
 {"line":1,"vars":{"score":"72"},"note":"score-এ 72 রাখা হলো — এবার Python উপর থেকে এক এক করে প্রশ্ন করবে"},
 {"line":2,"note":"প্রথম প্রশ্ন: 72 >= 80? → False। এই block-এ ঢোকা হবে না"},
 {"line":4,"note":"পরের প্রশ্ন (elif): 72 >= 60? → True! এই branch-টাই নেওয়া হলো"},
 {"line":5,"out":"B grade","note":"indented block চললো — console-এ B grade ছাপা হলো"},
 {"line":6,"note":"else পর্যন্ত পৌঁছানোই হয়নি — প্রথম True match পাওয়ামাত্র বাকি chain skip"}
]}
```

### ২. and / or / not — শব্দ দিয়ে logic

JS-এ symbol, Python-এ শব্দ। ব্যস, এটাই পার্থক্য:

| JavaScript | Python    | পড়তে যেমন লাগে |
| ---------- | --------- | --------------- |
| `a && b`   | `a and b` | "a এবং b"       |
| `a \|\| b` | `a or b`  | "a অথবা b"      |
| `!a`       | `not a`   | "a নয়"         |

```python
age = 25
has_ticket = True

if age >= 18 and has_ticket:
    print("ঢুকতে পারো")

if not has_ticket:
    print("আগে ticket কাটো")
```

লক্ষ করো Python code-টা প্রায় ইংরেজি বাক্যের মতো পড়া যায়: "if age is at least 18 **and** has ticket"। এটা Python-এর design philosophy — code যেন মানুষের ভাষার কাছাকাছি হয়। Short-circuit behaviour JS-এর মতোই: `and`-এ প্রথমটা falsy হলে দ্বিতীয়টা evaluate-ই হয় না, `or`-এ প্রথমটা truthy হলে সেখানেই থামে।

### ৩. Comparison — যেখানে Python-এর `==` sane

JS-এ তোমাকে শেখানো হয়েছিল: "কখনো `==` ব্যবহার কোরো না, সবসময় `===`।" কেন? কারণ JS-এর `==` type coercion করে — চুপিচুপি type বদলে তারপর তুলনা করে:

```javascript
// JavaScript-এর পাগলামি
"5" == 5; // true  (string-কে number বানিয়ে ফেলল!)
0 == ""; // true  (দুটোকেই কোনোভাবে সমান ভাবল)
null == undefined; // true
```

Python-এ এই পাগলামি নেই। **`==` কোনো type coercion করে না।** ভিন্ন type মানেই সাধারণত অসমান:

```python
# Python-এর সুস্থতা
'5' == 5      # False — string আর int কখনোই সমান না
0 == ''       # False
'' == ' '     # False — খালি string আর space আলাদা
5 == 5.0      # True — ব্যতিক্রম: int আর float সংখ্যা হিসেবে তুলনা হয়
```

মানে: **Python-এ `===`-এর দরকারই নেই, কারণ `==`-ই সেই কাজ করে।** `!==`-এর জায়গায় শুধু `!=`। বাকি operator-গুলো (`<`, `>`, `<=`, `>=`) দুই ভাষায় একই।

> **Analogy:** JS-এর `==` হলো সেই অতি-উৎসাহী দোকানদার যে তুমি ৫০০ টাকার নোট দিলে নিজে থেকেই ভাংতি করে, জিনিস বদলে দেয়, আর শেষে বলে "সমান সমান!" Python-এর `==` হলো ব্যাংকের cashier — যা দিয়েছ ঠিক তা-ই গোনে, নিজে থেকে কিছু বদলায় না।

### ৪. Chained comparison — JS-এর bug, Python-এর feature

এবার একটা মজার জিনিস। ধরো check করতে চাও `x` কি ১ আর ১০-এর মাঝে। গণিতে আমরা লিখি `1 < x < 10`। JS-এ এটা লিখলে কী হয়, Play চেপে step-by-step দেখো:

```animation
{"type":"trace","title":"JavaScript-এ 1 < x < 10 — silent bug-এর জন্ম","code":["let x = 50;","let result = 1 < x < 10;","console.log(result);"],"steps":[
 {"line":1,"vars":{"x":"50"},"note":"x = 50 — range-এর অনেক বাইরে। উত্তর false হওয়াই উচিত, তাই না?"},
 {"line":2,"note":"JS বাম থেকে ডানে evaluate করে: আগে 1 < 50 → true"},
 {"line":2,"note":"এবার true < 10 — boolean বনাম number! JS coercion করে: true → 1"},
 {"line":2,"vars":{"result":"true"},"note":"1 < 10 → true। ভুল উত্তর জন্ম নিলো, কোনো error ছাড়াই"},
 {"line":3,"out":"true","note":"x = 50 range-এর বাইরে, তবু true ছাপলো — এটাই silent bug"}
]}
```

Python-এ ঠিক একই লেখাটা অন্যভাবে কাজ করে — Play চেপে পার্থক্যটা দেখো:

```animation
{"type":"trace","title":"Python-এ 1 < x < 10 — সঠিক উত্তর","code":["x = 50","if 1 < x < 10:","    print(\"range-এর মধ্যে\")","else:","    print(\"range-এর বাইরে\")"],"steps":[
 {"line":1,"vars":{"x":"50"},"note":"একই x = 50 — এবার Python-এর পালা"},
 {"line":2,"note":"Python ভেতরে ভেতরে ভেঙে নেয়: (1 < x) and (x < 10)"},
 {"line":2,"note":"প্রথম টুকরা: 1 < 50 → True। দ্বিতীয় টুকরা: 50 < 10 → False"},
 {"line":2,"note":"True and False → False — পুরো condition False"},
 {"line":5,"out":"range-এর বাইরে","note":"তাই else branch চললো — যেমনটা হওয়ার কথা"}
]}
```

JS-এ যে syntax silent bug, Python-এ সেটাই readable feature। DSA-তে এটা দারুণ কাজে লাগে — যেমন index bounds check: `if 0 <= i < len(arr):` — এক লাইনে দুই দিকের সীমানা।

### ৫. Truthiness — আজকের lesson-এর হৃদয়

এবার সেই জায়গা যেখানে তোমার JS instinct তোমার বিরুদ্ধে কাজ করবে। মন দিয়ে দেখো এই টেবিলটা — **এটা মুখস্থ করার মতো গুরুত্বপূর্ণ:**

| Value                       | JavaScript-এ  | Python-এ                            |
| --------------------------- | ------------- | ----------------------------------- |
| `0`                         | falsy         | falsy                               |
| `""` (খালি string)          | falsy         | falsy                               |
| `null` / `None`             | falsy         | falsy                               |
| `NaN`                       | falsy         | _(Python-এ `float('nan')` truthy!)_ |
| **`[]` (খালি array/list)**  | **truthy** ⚠️ | **falsy** ⚠️                        |
| **`{}` (খালি object/dict)** | **truthy** ⚠️ | **falsy** ⚠️                        |
| `set()` (খালি set)          | —             | falsy                               |
| `()` (খালি tuple)           | —             | falsy                               |
| `[0]` (একটা 0 থাকা list)    | truthy        | truthy                              |
| `"false"` (string)          | truthy        | truthy                              |

⚠️ চিহ্নিত দুটো লাইন হলো ফাঁদ। **JS-এ খালি container truthy, Python-এ falsy।** Python-এর নিয়মটা আসলে একটাই বাক্য:

> **শূন্য জিনিস মানে মিথ্যা।** সংখ্যা শূন্য (`0`, `0.0`), খালি collection (`[]`, `{}`, `""`, `set()`, `()`), আর "কিছু না" (`None`) — সব falsy। বাকি সব truthy।

> **Analogy:** Python-কে ভাবো এক সৎ tiffin-বাক্স checker। বাক্স খুলে ভেতরে খাবার থাকলে বলে "আছে" (True), খালি থাকলে বলে "নেই" (False)। JS checker শুধু দেখে _বাক্সটা আছে কি না_ — ভেতরে কী আছে তা দেখেই না। খালি বাক্স হাতে নিয়েও বলে "খাবার আছে!" — আর সেখান থেকেই তোমার সেই interview bug।

এই নিয়ম থেকেই জন্ম নেয় Python-এর সবচেয়ে দরকারি idiom — যেটা তুমি সামনের ১৫০টা problem-এ লিখবে:

```python
# খালি list check — এটাই Pythonic উপায়
if not arr:
    return 0        # arr খালি: এখানেই কাজ শেষ

# ভরা list check
if arr:
    process(arr)
```

`if not arr:` পড়ো এভাবে: "যদি arr-এ কিছু না থাকে।" JS-এ তোমাকে লিখতে হতো `if (arr.length === 0)` — Python-এ `len(arr) == 0` লেখাও চলে, কিন্তু community-র চোখে `if not arr:` -ই সঠিক style। LeetCode-এর প্রায় প্রতিটা Python solution-এর প্রথম লাইন এটা।

### ৬. None check — `is None`, `== None` নয়

Python-এর `None` হলো JS-এর `null`-এর ভাই (Python-এ `undefined` বলে কিছু নেই — সেটা পরের lesson-এর গল্প)। JS-এ null check করতে তুমি লিখতে `x === null`। Python-এ এর জন্য special operator আছে — `is`:

```python
result = None

if result is None:
    print("এখনো কোনো result নেই")

if result is not None:
    print("result পাওয়া গেছে")
```

কেন `== None` না লিখে `is None`? কারণ `is` check করে **identity** — "এটা কি ঠিক ওই একই object?" `None` পুরো program-এ একটাই থাকে, তাই identity check-ই সঠিক আর নিরাপদ। `== None` বেশিরভাগ সময় কাজ করলেও, কোনো class নিজের `==` behaviour বদলে দিতে পারে — তখন ভুল উত্তর আসতে পারে। নিয়ম সহজ: **None-এর জন্য সবসময় `is None` / `is not None`।**

আরেকটা সূক্ষ্ম কিন্তু জরুরি কথা — truthiness দিয়ে None check কোরো না যখন `0` বা `""` valid value হতে পারে:

```python
count = 0
if not count:          # বিপদ! count = 0 হলেও এটা True হয়ে যায়
    print("count নেই")

if count is None:      # নিরাপদ — শুধু None হলেই True
    print("count নেই")
```

`if not x:` জিজ্ঞেস করে "x কি খালি/শূন্য/None — যেকোনোটা?" আর `if x is None:` জিজ্ঞেস করে শুধু "x কি None?" DSA-তে দুটোই লাগবে — কোনটা কখন, সেটা বোঝাই দক্ষতা।

### ৭. Ternary — উল্টো করে পড়ো

JS-এর `cond ? x : y` Python-এ আছে, কিন্তু শব্দের order উল্টো — **value আগে, condition মাঝখানে:**

```javascript
// JavaScript: আগে প্রশ্ন, পরে উত্তর
const status = score >= 60 ? "pass" : "fail";
```

```python
# Python: আগে উত্তর, মাঝে প্রশ্ন
status = "pass" if score >= 60 else "fail"
```

পড়ো ইংরেজি বাক্যের মতো: _"status হবে pass, যদি score ৬০+ হয়, নইলে fail।"_ প্রথম কয়েকদিন অস্বস্তি লাগবে, তারপর দেখবে এটা আসলে বেশি natural।

### ৮. match-case — Python-এরও switch আছে (এক ঝলক)

Python 3.10 থেকে `match-case` এসেছে — JS-এর `switch`-এর আধুনিক ভাই:

```python
match command:
    case "start":
        print("চালু হচ্ছে")
    case "stop":
        print("বন্ধ হচ্ছে")
    case _:                    # JS-এর default-এর মতো
        print("অচেনা command")
```

`break` লাগে না — fall-through নেই। আপাতত শুধু জেনে রাখো এটা আছে; DSA-তে ৯৯% সময় `if/elif/else`-ই যথেষ্ট।

---

## ⚡ CODE — HANDS ON

এবার হাত চালানোর পালা। প্রতিটা exercise-এ **আগে নিজে output predict করো** — খাতায় বা মনে মনে — তারপর Reveal চেপে মিলিয়ে দেখো। Prediction ছাড়া পড়ে গেলে শেখাটা আটকে যায় না।

### নিজে চেষ্টা করো #১ — truthiness পরীক্ষা

(`for` loop পরের lesson-এ আসবে — আপাতত জেনে রাখো এটা প্রতিটা value-র উপর ঘুরছে। `!r` মানে value-টা quote-সহ raw আকারে দেখাও।)

```reveal
{"prompt":"৮টা value-র কোনগুলো truthy, কোনগুলো falsy? বিশেষ করে [], [0] আর {} নিয়ে ভাবো — আগে নিজে লিখে ফেলো","code":"values = [0, 1, \"\", \"hello\", [], [0], {}, None]\n\nfor v in values:\n    if v:\n        print(f\"{v!r} → truthy\")\n    else:\n        print(f\"{v!r} → falsy\")","answer":"0 → falsy\n1 → truthy\n'' → falsy\n'hello' → truthy\n[] → falsy\n[0] → truthy\n{} → falsy\nNone → falsy","explanation":"[] আর {} — JS হলে দুটোই truthy হতো, Python-এ falsy। সবচেয়ে সূক্ষ্ম line-টা হলো [0]: list-টার ভেতরের value falsy, কিন্তু list-টা নিজে খালি না, তাই truthy। Python বাক্সের ভেতরে ঢুকে বিচার করে না — শুধু দেখে বাক্সে কিছু আছে কি না।"}
```

### নিজে চেষ্টা করো #২ — JS reflex-এর ফাঁদ

```reveal
{"prompt":"A, B, নাকি C? JS-এর == হলে কী হতো, আর Python-এ কী হবে — আগে নিজে ভাবো","code":"x = \"5\"\n\nif x == 5:\n    print(\"A\")\nelif x == \"5\":\n    print(\"B\")\nelse:\n    print(\"C\")","answer":"B","explanation":"প্রথম condition \"5\" == 5 — string বনাম int, কোনো coercion নেই, তাই False। JS-এর == হলে এটা true হয়ে A ছাপত। Python-এ == মানেই JS-এর ===-এর মতো কঠোর — তাই দ্বিতীয় condition \"5\" == \"5\"-তে গিয়ে মেলে।"}
```

### নিজে চেষ্টা করো #৩ — DSA-র বাস্তব ছবি

এটা একটা real LeetCode-ঘরানার helper — দুটো sorted list merge করার আগে edge case guard:

```reveal
{"prompt":"তিনটা print-এ কী কী ছাপবে? তৃতীয়টা নিয়ে সাবধানে ভাবো","code":"def first_element(arr):\n    # খালি list হলে None ফেরত দাও, নইলে প্রথম element\n    return None if not arr else arr[0]\n\nprint(first_element([10, 20]))\nprint(first_element([]))\nprint(first_element([0]))","answer":"10\nNone\n0","explanation":"তৃতীয় call-এ arr = [0] — খালি না, তাই not arr হলো False, ফেরত আসে arr[0] মানে 0। এখানেই ternary + truthiness একসাথে কাজ করছে: None if not arr else arr[0] পড়ো — \"None দাও যদি arr খালি হয়, নইলে প্রথম element।\""}
```

---

## 🔬 TRACING

Code চোখে পড়া আর মাথায় চালানো — দুটো আলাদা skill। এবার আমরা computer সাজব। প্রথমে নিজে খাতায় ভাবো `arr = []` আর `target = 0` হলে কী ছাপবে, তারপর Play চেপে line-by-line মিলিয়ে দেখো:

```animation
{"type":"trace","title":"elif chain trace — arr = [] হলে কী হয়?","code":["arr = []","target = 0","","if not arr:","    result = \"empty\"","elif target in arr:","    result = \"found\"","elif 0 <= target < 5:","    result = \"in range\"","else:","    result = \"not found\"","print(result)"],"steps":[
 {"line":1,"vars":{"arr":"[]"},"note":"arr হলো খালি list — মনে রাখো, Python-এ [] falsy"},
 {"line":2,"vars":{"target":"0"},"note":"target = 0 — এবার elif chain-এ ঢোকার পালা"},
 {"line":4,"note":"not arr → not [] — [] falsy, তাই not-এ উল্টে True!"},
 {"line":5,"vars":{"result":"\"empty\""},"note":"if-block-এ ঢুকে result = \"empty\" বসলো"},
 {"line":12,"out":"empty","note":"সোজা print-এ লাফ — মাঝের কোনো elif/else আর ছোঁয়াই হয়নি"}
]}
```

খেয়াল করো: **line 6, 8, 10 কখনো evaluate-ই হয়নি।** প্রথম `True` condition পাওয়ামাত্র Python বাকি সব `elif`/`else` skip করে সোজা block-এর পরে চলে যায় — JS-এর `else if` chain-এর মতোই।

এবার একই code, শুধু line 1 বদলে `arr = [3, 7]` করো, আর নিজে খাতায় trace করো। মিলিয়ে নাও: `not [3, 7]` → `False` (skip), `0 in [3, 7]` → `False` (skip), `0 <= target < 5` → `(0 <= 0) and (0 < 5)` → `True` — তাই result = `"in range"`, সেটাই ছাপে। Chained comparison-টা কীভাবে দুটো টুকরায় ভেঙে `and` হলো — সেটা আরেকবার দেখো। এই হাতে-trace করার অভ্যাসটা সামনে recursion শেখার সময় তোমার প্রাণ বাঁচাবে।

(Bonus: `in` operator — `0 in [3, 7]` মানে "০ কি এই list-এ আছে?" JS-এর `arr.includes(0)`-এর Python রূপ। Lesson 5-এ বিস্তারিত।)

---

## 🚫 COMMON MISTAKES

❌ **ভুল ধারণা:** "খালি array check করতে `if (arr)` যথেষ্ট না, তাই Python-এও `len(arr) == 0` লিখতে হবে।"
✅ **আসল কথা:** Python-এ `[]` falsy, তাই `if not arr:` -ই perfect এবং Pythonic। `len(arr) == 0` ভুল না, কিন্তু অকারণে লম্বা — interview-তে `if not arr:` লিখলে বোঝা যায় তুমি Python জানো।

❌ **ভুল ধারণা:** "`&&` আর `||` Python-এও চলবে, নাহয় error দেখলেই বুঝব।"
✅ **আসল কথা:** Error দেবে ঠিকই (`SyntaxError`), কিন্তু আসল বিপদ `!`-এ: `x != y` valid Python, তাই `if x != None` type-এর code চুপচাপ চলে যাবে — অথচ ওখানে হওয়া উচিত ছিল `if x is not None`। Symbol নয়, শব্দ: `and`, `or`, `not`।

❌ **ভুল ধারণা:** "`== None` আর `is None` তো একই জিনিস।"
✅ **আসল কথা:** বেশিরভাগ সময় ফলাফল এক, কিন্তু `==` object-এর নিজের বানানো তুলনার নিয়ম মানে (override হতে পারে), আর `is` মানে identity — কখনো ধোঁকা দেয় না। None check মানেই `is None`। এটা style guide (PEP 8)-এরও নির্দেশ।

❌ **ভুল ধারণা:** "Condition-এর শেষে colon না দিলে Python বুঝে নেবে।"
✅ **আসল কথা:** নেবে না — `SyntaxError: expected ':'`। প্রথম সপ্তাহে এটা তোমার সবচেয়ে ঘনঘন error হবে। আঙুলকে শেখাও: `if`, `elif`, `else` — লাইনের শেষে সবসময় `:`।

❌ **ভুল ধারণা:** "`if not count:` দিয়ে None check করা যায়।"
✅ **আসল কথা:** `count = 0` হলেও `not count` হলো `True` — অথচ `0` হয়তো তোমার valid data! "Value নেই" check করতে `is None`, "value খালি/শূন্য" check করতে `not` — দুটো আলাদা প্রশ্ন, আলাদা tool।

---

## 🎯 KEY TAKEAWAYS

- Python-এ `else if` নয় — **`elif`**; condition-এ parentheses লাগে না, কিন্তু শেষে **colon (`:`)** বাধ্যতামূলক
- `&&` / `||` / `!` -এর জায়গায় **`and` / `or` / `not`** — short-circuit behaviour JS-এর মতোই
- Python-এর **`==` type coercion করে না** — `'5' == 5` হলো `False`, তাই `===`-এর দরকার নেই
- **Chained comparison** (`1 < x < 10`) Python-এ সঠিকভাবে কাজ করে — ভেতরে `(1 < x) and (x < 10)` হয়ে যায়; JS-এ এটা silent bug
- **`[]`, `{}`, `""`, `0`, `None`, `set()` — সব falsy**; JS-এ `[]` আর `{}` truthy ছিল — এটাই সবচেয়ে বড় ফাঁদ
- খালি list check-এর idiom: **`if not arr:`** — NeetCode 150-এ বারবার লিখবে
- None check মানেই **`is None` / `is not None`** — `== None` নয়
- Ternary উল্টো order-এ: **`x if cond else y`** (value আগে, condition মাঝে)

---

## 🎤 INTERVIEW-এ যদি জিজ্ঞেস করে...

**Q: "Python-এ `===` নেই কেন? তাহলে strict equality কীভাবে হয়?"**
A: "Python-এর `==` কখনো type coercion করে না — `'5' == 5` সরাসরি `False`। JS-এ `===` দরকার হয়েছিল `==`-এর coercion থেকে বাঁচতে; Python-এ সেই রোগটাই নেই, তাই ওষুধও লাগে না। আলাদাভাবে `is` operator আছে, কিন্তু সেটা equality না — identity, মানে দুটো নাম একই object-কে point করছে কি না। Practical নিয়ম: value তুলনায় `==`, আর `None` check-এ `is None`।"

**Q: "JS আর Python-এর truthiness-এর মূল পার্থক্য কী?"**
A: "JS-এ falsy মানে হাতে-গোনা কয়েকটা primitive — `0`, `''`, `null`, `undefined`, `NaN`, `false`; সব object truthy, এমনকি খালি `[]` আর `{}`-ও। Python-এর নিয়ম ধারণাগত: 'শূন্যতা মানেই falsy' — সংখ্যা শূন্য, খালি collection (`[]`, `{}`, `''`, `set()`), আর `None`। এজন্য Python-এ `if not arr:` দিয়ে empty check করা idiomatic, কিন্তু JS-এ `if (!arr)` empty array ধরতেই পারে না — `arr.length` check করতে হয়।"

**Q: "`if x:` আর `if x is not None:` — কখন কোনটা?"**
A: "`if x:` জিজ্ঞেস করে 'x কি truthy?' — `0`, `''`, `[]`, `None` সবগুলোতে `False`। `if x is not None:` জিজ্ঞেস করে শুধু 'x কি None নয়?' যদি `0` বা খালি string তোমার কাছে valid data হয় — যেমন score গণনা বা index — তাহলে truthiness check bug তৈরি করবে; তখন `is not None` লাগবে। আর যদি 'খালি বা কিছু-নেই' সবই এক অর্থ বহন করে, তাহলে `if x:` -ই cleaner।"

---

## ➡️ WHAT'S NEXT?

তুমি এখন Python-কে সিদ্ধান্ত নেওয়াতে পারো — কোন পথে যাবে, কোন branch-এ ঢুকবে। কিন্তু DSA-র আসল শক্তি সিদ্ধান্তে না, **পুনরাবৃত্তিতে** — একই কাজ হাজারবার করা। JS-এ তোমার হাতে ছিল তিন রকম `for` (classic, `for...of`, `for...in`) আর `forEach`; Python এসে বলবে "একটাই যথেষ্ট।" Next lesson-এ দেখবে `for x in range(n)`, `enumerate` -এর জাদু, আর `while` — যে loop দিয়ে তুমি লিখবে তোমার প্রথম আসল algorithm। আজকের `if not arr:` idiom-টা সাথে রেখো — loop-এর ভেতরে ওটাই বারবার ফিরে আসবে।
