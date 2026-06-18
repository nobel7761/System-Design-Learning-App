---
id: wa0l1
world: wa0
order: 1
title: "S01 — LLM আসলে কী? Tokens, Weights ও Inference"
titleEn: "S01 — What is an LLM? Tokens, Weights & Inference"
estMinutes: 60
type: lesson
---

## এই Session এ কি শিখবো?

- LLM (Large Language Model) আসলে কি জিনিস?
- Token কি এবং কিভাবে কাজ করে?
- Weight এবং Parameter কি?
- Inference মানে কি?
- Ollama দিয়ে নিজের computer এ LLM চালানো
- Mental model তৈরি করা — ভেতরে কি হচ্ছে বোঝা

---

## PART 1: LLM কি? — একটা মজার গল্প

### LLM কী? — বাস্তব জীবনের গল্প দিয়ে সহজ ব্যাখ্যা

ধরো, তুমি একটা ছোট বাচ্চাকে বাংলা শেখাচ্ছো। প্রথম দিন তুমি তাকে শিখালে:

- আমি ভাত \_\_\_
- পাখি \_\_\_ উড়ে
- বাংলাদেশের রাজধানী \_\_\_

কয়েকদিন পর বাচ্চাটা বুঝতে শুরু করলো:

- "আমি ভাত" এর পরে সাধারণত "খাই" আসে।
- "পাখি" এর পরে "আকাশে" আসতে পারে।
- "বাংলাদেশের রাজধানী" এর পরে "ঢাকা" আসে।

এখন তুমি নতুন একটা বাক্য দিলে: "আজকে খুব গরম, তাই আমি এক গ্লাস ঠান্ডা \_\_\_"

বাচ্চা আগে কখনও এই বাক্যটা না দেখলেও আন্দাজ করতে পারবে যে এখানে "পানি" আসার সম্ভাবনা বেশি। LLM ঠিক এই কাজটাই করে, তবে মানুষের চেয়ে হাজার-লাখ গুণ বেশি ডেটা দেখে।

### LLM আসলে কী?

**LLM = Large Language Model**

- **Large** → বিশাল আকারের
- **Language** → ভাষা নিয়ে কাজ করে
- **Model** → একটি mathematical system

এটা মূলত এমন একটি AI, যেটা কোটি কোটি বাক্য পড়ে শিখেছে কোন শব্দের পরে কোন শব্দ আসার সম্ভাবনা বেশি।

### মূল কাজ: Next Word Prediction

LLM-এর সবচেয়ে গুরুত্বপূর্ণ কাজ হলো: **"পরের শব্দ কী হতে পারে?"**

উদাহরণ:

তুমি লিখলে: `আমি সকালে ঘুম থেকে উঠে এক কাপ`

LLM ভাবে:

- চা → 60%
- কফি → 25%
- পানি → 10%
- জুস → 5%

তাই সে "চা" লিখে দেয়।

### কিন্তু ChatGPT তো শুধু শব্দ আন্দাজ করে না!

এখানেই মজাটা। যদি ChatGPT শুধু পরের শব্দ আন্দাজ করে, তাহলে এত বুদ্ধিমান মনে হয় কেন? কারণ সে কয়েক ট্রিলিয়ন শব্দ দেখেছে। ধরো তুমি ২০ বছর ধরে প্রতিদিন বই, সংবাদপত্র, Stack Overflow, Wikipedia, ব্লগ, গবেষণাপত্র — সবকিছু পড়ছো। তাহলে তোমার মাথায় অনেক pattern জমা হবে। LLM-এর ক্ষেত্রেও একই ঘটনা।

### PUBG উদাহরণ

ধরো তুমি PUBG খেলো। শুরুতে Aim খারাপ, Movement খারাপ, Map চেনো না।

কিন্তু ২০০০ ম্যাচ খেলার পরে:

- Enemy কোথায় থাকতে পারে বুঝতে পারো
- Safe zone আন্দাজ করতে পারো
- Loot কোথায় পাওয়া যাবে জানো

কেন? কারণ তুমি অনেক pattern দেখেছো। LLM-ও ট্রিলিয়ন শব্দ দেখে একইভাবে pattern শিখে।

### "Large" কেন বলা হয়?

LLM-এর ভিতরে থাকে **Parameters** — ছোট ছোট settings বা knowledge holder।

- GPT-2 → প্রায় 1.5 Billion Parameters
- GPT-3 → প্রায় 175 Billion Parameters

Training-এর সময় AI এই knob গুলো adjust করে শেখে।

### LLM কি সত্যিই সবকিছু বোঝে?

|           |                     |
| --------- | ------------------- |
| **মানুষ** | অর্থ (Meaning) বুঝে |
| **LLM**   | Pattern বুঝে        |

তুমি লিখলে: "মাছ পানিতে থাকে।" — LLM জানে এই বাক্যটি সাধারণত সত্য, কারণ সে অনেকবার এটা দেখেছে। কিন্তু মাছকে সে কখনও দেখেনি। সে text pattern থেকে জানে।

**এক লাইনে LLM:** LLM হলো এমন একটি বিশাল AI system, যেটা কোটি-কোটি-ট্রিলিয়ন শব্দ থেকে pattern শিখে পরের শব্দ predict করতে করতে মানুষের মতো লেখা, প্রশ্নের উত্তর, কোড, ব্যাখ্যা এবং আলোচনা করতে পারে।

---

## PART 2: Token কী? — LEGO, শব্দ আর কম্পিউটারের ভাষা

LLM শব্দ (word) নিয়ে কাজ করে না। **LLM Token নিয়ে কাজ করে।**

### LEGO ব্লকের গল্প

তুমি LEGO দিয়ে বাড়ি বানাবে। তুমি পুরো বাড়িটা একবারে কিনো না। তুমি ছোট ছোট LEGO pieces কিনো এবং সেগুলো জোড়া লাগিয়ে বানাও।

একইভাবে:

- Paragraph → Sentence দিয়ে
- Sentence → Word দিয়ে
- Word → **Token** দিয়ে

**Token হলো ভাষার LEGO Block।**

### Computer-এর সমস্যা

Computer বাংলা জানে না, English-ও জানে না। Computer শুধু বোঝে: `0` আর `1` — মানে Number।

তাই Computer-এর জন্য ভাষাকে Number-এ রূপান্তর করতে হয়। **Tokenizer** ঠিক এই কাজটাই করে।

### উদাহরণ

তুমি লিখলে: `Hello world`

Tokenizer এটাকে ভাঙতে পারে:

```
["Hello", " world"]
```

এরপর Number দেয়:

```
"Hello"  → 15496
" world" → 995
```

LLM আসলে দেখে: `[15496, 995]`

**LLM কখনো "Hello" দেখে না। সে শুধু Number দেখে।**

### Token কি সবসময় Word?

না। এটাই সবচেয়ে মজার বিষয়।

| শব্দ         | Tokens                             |
| ------------ | ---------------------------------- |
| Cat          | ["Cat"] → 1 Token                  |
| Unbelievable | ["Un", "believ", "able"] → 3 Token |
| Programming  | ["Program", "ming"] → 2 Token      |
| বাংলাদেশ     | ["বাংলা", "দেশ"] → 2 Token         |

### Token-এর সাথে খরচের সম্পর্ক

OpenAI, Anthropic, Google — সবাই প্রায় Token অনুযায়ী টাকা নেয়।

```
Input = 1,000 Token
Output = 500 Token
মোট: 1,500 Token এর জন্য Bill হবে।
```

### Context Window কী?

ধরো তোমার ডেস্কে ১০০টা কাগজ রাখার জায়গা আছে। LLM-এরও একই ব্যাপার।

**Context Window = একসাথে কত Token মনে রাখতে পারবে।**

উদাহরণ: GPT-4 = 128,000 Tokens = প্রায় কয়েকশো পৃষ্ঠার বইয়ের সমপরিমাণ লেখা।

**Practical facts:**

- GPT-4 একবারে সর্বোচ্চ 128,000 token process করতে পারে
- ১ token ≈ ৪টা English character
- API তে টাকা লাগে token হিসেবে (input tokens + output tokens)
- তুমি যত বেশি context দেবে, তত বেশি token, তত বেশি cost

**এক লাইনে Token:** Token হলো ভাষার LEGO Block। মানুষের লেখা শব্দ, বাক্য ও অনুচ্ছেদকে ছোট ছোট টুকরো (Token) এবং পরে Number-এ রূপান্তর করা হয়, যাতে Computer সেগুলো বুঝতে ও প্রক্রিয়া করতে পারে।

---

## PART 3: Weight এবং Parameter — LLM-এর "মস্তিষ্কের সেটিংস"

অনেকেই ভাবে: "ChatGPT-এর ভিতরে কি কোটি কোটি প্রশ্ন-উত্তর লিখে রাখা আছে?"

উত্তর হলো: **না।** ChatGPT-এর ভিতরে Wikipedia বা Stack Overflow-এর কপি নেই। বরং আছে কোটি-কোটি **Parameter।**

### Weight মানে কী?

Weight মানে হলো: কোন তথ্য বা Pattern কতটা গুরুত্বপূর্ণ, তার একটা সংখ্যা।

ধরো তুমি চাকরির জন্য লোক নিচ্ছো:

| বিষয়         | Importance (Weight) |
| ------------- | ------------------- |
| Skill         | 50%                 |
| Experience    | 30%                 |
| Communication | 20%                 |

LLM-এর ভেতরেও এমন কোটি কোটি weight আছে।

### Exam Hall Analogy

প্রশ্ন: বাংলাদেশের রাজধানী কী?

| উত্তর     | Confidence |
| --------- | ---------- |
| ঢাকা      | 95%        |
| চট্টগ্রাম | 3%         |
| সিলেট     | 2%         |

তুমি "ঢাকা" বলবে কারণ তোমার মস্তিষ্কে "ঢাকা"র confidence বা weight সবচেয়ে বেশি। LLM-ও একই কাজ করে।

### Parameter আসলে কী?

সহজ ভাষায়: **Parameter = Weight = Learned Number**

উদাহরণ:

```
0.234
-0.874
1.245
0.009
```

এগুলো দেখতে সাধারণ decimal number। কিন্তু এই সংখ্যাগুলোর মধ্যেই মডেলের শেখা জ্ঞান লুকানো থাকে।

### Knowledge কোথায় থাকে?

**"বাংলাদেশের রাজধানী ঢাকা"** — এই তথ্যটা একটা Parameter-এ থাকে না। লক্ষ-কোটি Parameter মিলে এই জ্ঞান তৈরি করে।

রান্নার উদাহরণ: বিরিয়ানির স্বাদ শুধু লবণ থেকে না, শুধু মরিচ থেকে না — সবকিছু মিলে। LLM-এও একই।

### GPT-4 এর 1.8 Trillion Parameter মানে কী?

ধরো একটা Excel Sheet আছে। প্রতিটা Cell-এ একটা Number:

```
0.12
-0.56
1.43
0.89
...
```

এমন **1.8 Trillion Cell।** এই সংখ্যাগুলোর সমষ্টিই GPT-4-এর শেখা Pattern। এটা কোনো Dictionary না। এটা এক বিশাল Mathematical Machine।

### Training শেষ হলে কী হয়?

- Training-এর সময়: Parameter পরিবর্তন হয়
- Training শেষ: Parameter **Freeze** হয়ে যায়

তাই যদি আজ কোনো নতুন ঘটনা ঘটে, Training শেষ হওয়া মডেল সেটা নিজে থেকে জানতে পারবে না।

**Parameter হলো LLM-এর শেখা সংখ্যা (learned numbers)। Training-এর সময় এই সংখ্যাগুলো বারবার পরিবর্তিত হয়, আর Training শেষ হলে এগুলোই মডেলের জ্ঞানের ভিত্তি হয়ে যায়।**

---

## PART 4: Inference — ChatGPT আসলে কীভাবে উত্তর তৈরি করে?

**Inference = শেখা জ্ঞান ব্যবহার করে নতুন প্রশ্নের উত্তর তৈরি করা।**

- Training হলো "পড়াশোনা"
- Inference হলো "পরীক্ষা দেওয়া"

### Training vs Inference

| Training               | Inference                 |
| ---------------------- | ------------------------- |
| শেখে                   | উত্তর দেয়                |
| Parameter পরিবর্তন হয় | Parameter পরিবর্তন হয় না |
| অনেক GPU লাগে          | তুলনামূলক কম GPU লাগে     |
| মাসের পর মাস চলতে পারে | কয়েক সেকেন্ডে শেষ হয়    |
| Error থেকে শেখে        | শেখে না                   |

### ChatGPT-তে Inference কীভাবে কাজ করে?

ধরো তুমি লিখলে: `বাংলাদেশের রাজধানী হলো`

**Step 1: Tokenization**

```
["বাংলাদেশের", " রাজধানী", " হলো"]
```

**Step 2: Number Conversion**

```
"বাংলাদেশের" → 7211
" রাজধানী"   → 932
" হলো"        → 411
```

**Step 3: Numbers যায় Model-এর ভিতরে**

Billions of Parameters-এর মধ্য দিয়ে যায়।

**Step 4: Probability Calculation**

| সম্ভাব্য Token | Probability |
| -------------- | ----------- |
| ঢাকা           | 97%         |
| চট্টগ্রাম      | 2%          |
| সিলেট          | 1%          |

**Step 5: Token Selection → আবার Calculation → আবার Token...**

### সবচেয়ে গুরুত্বপূর্ণ ব্যাপার

অনেকেই ভাবে: "ChatGPT পুরো উত্তর একবারে লিখে ফেলে।"

**আসলে না।** ChatGPT একবারে মাত্র **একটা Token** তৈরি করে।

Movie-র মতো: Frame 1 → Frame 2 → Frame 3 → ... → Movie দেখা যায়।
ChatGPT-ও: Token 1 → Token 2 → Token 3 → ... → পুরো উত্তর।

### Inference-এর সময় Model কী শেখে?

❌ Parameter Update হয় না  
❌ নতুন Knowledge যোগ হয় না  
✅ Learned Parameters ব্যবহার হয়  
✅ Calculation হয়  
✅ Output তৈরি হয়

**এক লাইনে:** Training = শেখা। Inference = শেখা জ্ঞান ব্যবহার করে উত্তর দেওয়া।

---

## PART 5: Popular LLM গুলো কী কী?

অনেকেই মনে করে: **ChatGPT = AI**। আসলে ChatGPT শুধু একটি Application।

### Car Company vs Car Model Analogy

| Company    | Model                      |
| ---------- | -------------------------- |
| OpenAI     | GPT-4o, GPT-4.1, GPT-5     |
| Anthropic  | Claude Sonnet, Claude Opus |
| Google     | Gemini 1.5, Gemini 2.x     |
| Meta       | LLaMA 3, LLaMA 4           |
| xAI        | Grok                       |
| Alibaba    | Qwen Series                |
| Microsoft  | Phi-3, Phi-4               |
| Mistral AI | Mistral Large/Medium/Small |
| DeepSeek   | DeepSeek-V3, R1            |

### Frontier Models কী?

Frontier Model মানে: বর্তমানে সবচেয়ে শক্তিশালী model। এগুলো বানাতে লাগে হাজার হাজার GPU, শত কোটি ডলার এবং বিশাল Dataset। তাই সাধারণত এগুলো Closed Source।

### Open Source Models কী?

Frontier Models = 🏎️ Ferrari  
Open Source Models = 🔧 DIY Racing Car

তুমি নিজে Modify করতে পারবে, নিজের Server-এ চালাতে পারবে, নিজের Data দিয়ে Fine-tune করতে পারবে।

### কোনটা কখন ব্যবহার করবো?

| ক্ষেত্র                | Model                          |
| ---------------------- | ------------------------------ |
| ChatGPT ব্যবহার করলে   | GPT Family                     |
| Coding বেশি            | GPT, Claude, DeepSeek          |
| Open Source চালাতে চাও | LLaMA, DeepSeek, Qwen, Mistral |
| Laptop-এ Local AI      | Phi, Qwen, LLaMA (ছোট ভার্সন)  |

---

## PART 6: Ollama দিয়ে Local LLM চালাও

Ollama হলো একটা tool যেটা দিয়ে তুমি নিজের computer-এ **free-তে** LLM চালাতে পারবে।

### Step 1: Install করো

Windows/Mac: [ollama.com](https://ollama.com) থেকে download করো

Linux:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Model Download করো

```bash
ollama pull llama3.2
```

(~2GB download হবে, একবারই করতে হবে)

### Step 3: Chat করো

```bash
ollama run llama3.2
```

### Step 4: TypeScript দিয়ে Call করো

Ollama একটা local server চালায় port 11434-এ। OpenAI-এর মতো করেই call করতে পারবে:

```typescript
// npm install openai
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // যেকোনো string দাও, Ollama চেক করে না
});

async function askOllama(question: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama3.2",
    messages: [{ role: "user", content: question }],
  });
  return response.choices[0].message.content || "";
}

const answer = await askOllama("বাংলাদেশের রাজধানী কি?");
console.log(answer);
```

### Step 5: System Prompt দাও

```typescript
async function askWithPersonality(question: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama3.2",
    messages: [
      {
        role: "system",
        content:
          "তুমি একজন helpful Bangla assistant। সবসময় বাংলায় উত্তর দাও।",
      },
      { role: "user", content: question },
    ],
  });
  return response.choices[0].message.content || "";
}
```

---

## PART 7: Complete Mental Model

এখন সব কিছু একসাথে মাথায় রাখো:

তুমি টাইপ করলে: `"আমাকে একটা NestJS API বানাতে সাহায্য করো"`

```
↓ Tokenization
["আমাকে", " একটা", " NestJS", " API", " বানাতে", " সাহায্য", " করো"]

↓ Number conversion
[23456, 789, 15234, 890, ...]

↓ Billions of parameters এর মধ্য দিয়ে যায়

↓ প্রতিটা পরবর্তী token এর probability calculate হয়

↓ Token by token উত্তর তৈরি হয়

"অবশ্যই! প্রথমে NestJS install করো..."
```

এটাই LLM-এর সম্পূর্ণ কাজের ধারা।

---

## মনে রাখো

✅ LLM = অনেক data দেখে trained একটা "পরের শব্দ predict করার মেশিন"  
✅ Token = ভাষার ছোট টুকরো যেটা number-এ convert হয়  
✅ Parameter/Weight = LLM-এর জ্ঞান যেটা training-এ তৈরি হয়  
✅ Inference = trained model-কে দিয়ে কাজ করানো  
✅ Ollama = free-তে local-এ LLM চালানোর tool  
✅ API cost = token হিসেবে গণনা হয়

---

## Homework

1. Ollama install করো এবং llama3.2 দিয়ে কথা বলো
2. উপরের TypeScript code টা নিজে type করো (copy-paste না!)
3. নিজের একটা প্রশ্ন করো Ollama-কে
4. Interview দেওয়ার আগে এই পুরো article টা আরেকবার পড়ো

---

## Interview Preparation — এই প্রশ্নগুলো আসতে পারে

1. "LLM কিভাবে text generate করে — step by step বলো"
2. "Token কি? ১ token কত character এর সমান?"
3. "Parameter আর Weight এর মধ্যে পার্থক্য কি?"
4. "Training আর Inference এর পার্থক্য কি?"
5. "Context window বলতে কি বোঝায়?"
