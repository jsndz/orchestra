

## 1. 🧩 **Data Model / Domain Model (most accurate)**

You are creating a **model of a real-world thing** in your code.

👉 In your case:

* “Terminal session” = real concept
* `TerminalInstance` = its model

---

## 2. 📦 **Wrapper Object**

Because you’re wrapping another object:

* `Terminal` → wrapped inside `TerminalInstance`

Used when:

> you want to **extend functionality without modifying original object**

---

## 3. 🏗️ **Abstraction**

You’re hiding complexity:

Instead of thinking:

* terminal + process + state

You think:

* `TerminalInstance`

---

## 4. 🧱 **Entity (very important in larger systems)**

In system design:

> An **entity** = something with identity + state

Example:

* User
* Order
* Terminal session

👉 Your `id` makes it an entity

---

# 🧠 So the best name?

👉 In general:

> **Domain Model (Entity)**

👉 In casual dev talk:

> **Wrapper / Structured Object**

---

# 🚀 When to use it (general rule)

Use this pattern when you're modeling something that is:

---

## 1. 🧍 Has identity

If it has an `id`:

```ts
id → something
```

👉 That “something” should usually be an object

---

## 2. 📊 Has multiple properties

Instead of:

```ts
userNames[id]
userAges[id]
userStatus[id]
```

👉 Do:

```ts
User {
  name,
  age,
  status
}
```

---

## 3. 🔄 Changes over time (stateful)

If it can:

* start / stop
* active / inactive
* loading / done

👉 You need a model

---

## 4. 🔗 Connects multiple systems

Example:

* UI + backend + state

👉 Wrap them together

---

## 5. 🧠 Represents a real-world concept

Ask:

> “Can I describe this as a noun?”

* User ✅
* Order ✅
* Terminal session ✅

👉 Create a model

---

# ❌ When NOT to use it

Avoid this pattern when:

---

## 1. Just passing data

```ts
function sum(a: number, b: number)
```

No need:

```ts
{ a, b }
```

---

## 2. No identity

If there’s no `id` and no tracking → keep simple

---

## 3. Temporary values

Short-lived variables don’t need modeling

---

# 💡 Simple mental shortcut

👉 If you can say:

> “This thing exists in my system”

Then → create a model

---

### Examples

| Concept            | Use Model? |
| ------------------ | ---------- |
| User               | ✅          |
| WebSocket client   | ✅          |
| Terminal session   | ✅          |
| Button click value | ❌          |
| Loop counter       | ❌          |

---

# 🔥 Final takeaway

What you’re doing is:

> **Turning raw objects into meaningful system entities**

That’s a **huge step toward real software engineering**

