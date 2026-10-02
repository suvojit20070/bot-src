# TBL Real Bot Examples & Recipes

> A curated, copy-paste-ready collection of **real TBL (Tele Bot Language) bot codes** for TeleBotHost.
> Each recipe shows the **command name(s)**, the **TBL code** in a fenced block, and a short note on what it does and how to use it.
>
> Reminder on the model: one update → one matching command. Put group/channel/system logic in `*` (or a `/handle_{update_type}` command). `await` only when you need the result. Always define a `!` error-handler command in production.

## Table of Contents

**Group & Channel**
1. [Welcome New Members](#1-welcome-new-members)
2. [Goodbye Leaving Members](#2-goodbye-leaving-members)
3. [Join/Leave Message Hider](#3-joinleave-message-hider)
4. [Join/Leave Alerts to Admin](#4-joinleave-alerts-to-admin)
5. [Auto-Accept Join Requests + DM Welcome](#5-auto-accept-join-requests--dm-welcome)
6. [Bot-Token Leak Guard](#6-bot-token-leak-guard)
7. [Channel Auto-Caption / Footer](#7-channel-auto-caption--footer)
8. [Force-Join (Subscription Gate)](#8-force-join-subscription-gate)

**User Tools & Utilities**
9. [Advanced User Info](#9-advanced-user-info)
10. [Weather Checker](#10-weather-checker)
11. [Country Info](#11-country-info)
12. [Link Shortener](#12-link-shortener)
13. [Premium / Custom Emoji ID Getter](#13-premium--custom-emoji-id-getter)
14. [Custom Emoji Formatter](#14-custom-emoji-formatter)

**Economy & Engagement**
15. [Redeem Code Generator & Redeemer](#15-redeem-code-generator--redeemer)

**UI / Platform Tricks**
16. [Message Chaining (edit / delete)](#16-message-chaining-edit--delete)
17. [Send a File from a Buffer](#17-send-a-file-from-a-buffer)
18. [Progress Bar Animation](#18-progress-bar-animation)
19. [Emoji (Message) Effects](#19-emoji-message-effects)
20. [Colored Buttons & Icon Buttons](#20-colored-buttons--icon-buttons)
21. [Set Group Photo from a URL (InputFile trick)](#21-set-group-photo-from-a-url-inputfile-trick)
22. [Clone & Transfer a Bot](#22-clone--transfer-a-bot)
23. [Admin Contact / PM Forwarder Bot](#23-admin-contact--pm-forwarder-bot)
24. [Guest Mode (`!info`) Example](#24-guest-mode-info-example)

**More Real Bots (new)**
25. [Echo Bot](#25-echo-bot)
26. [Menu Bot with Inline Callbacks](#26-menu-bot-with-inline-callbacks)
27. [Broadcast to All Users (Admin)](#27-broadcast-to-all-users-admin)
28. [Group Moderation: Ban / Kick / Mute](#28-group-moderation-ban--kick--mute)
29. [Daily Reward with Cooldown](#29-daily-reward-with-cooldown)
30. [Referral System Bot](#30-referral-system-bot)
31. [Per-User To-Do List](#31-per-user-to-do-list)
32. [QR Code Generator](#32-qr-code-generator)
33. [Crypto Price Checker](#33-crypto-price-checker)
34. [Translate Bot (Multi-language)](#34-translate-bot-multi-language)
35. [Inline Query Search Bot](#35-inline-query-search-bot)
36. [Anti-Link / Spam Filter](#36-anti-link--spam-filter)
37. [Sticker & File ID Getter](#37-sticker--file-id-getter)
38. [Coin Flip / Dice Game](#38-coin-flip--dice-game)
39. [Password Hashing Demo (bcrypt)](#39-password-hashing-demo-bcrypt)
40. [Global Error Handler](#40-global-error-handler)

**Bot API 10.1 — Rich Messages**
41. [Rich Message: Mathematical Expressions](#41-rich-message-mathematical-expressions)
42. [Send a Rich Message (`sendRichMessage`)](#42-send-a-rich-message-sendrichmessage)
43. [Stream an AI Reply (`sendRichMessageDraft`)](#43-stream-an-ai-reply-sendrichmessagedraft)
44. [Edit a Message into a Rich Message](#44-edit-a-message-into-a-rich-message)

**TBL Sandbox & Core Mechanics**
45. [Variable Sharing via `@` (Combined Scope)](#45-variable-sharing-via--combined-scope)
46. [Advanced Answer Field (Conditional Languages)](#46-advanced-answer-field-conditional-languages)
47. [Modern Asynchronous Database Storage (`db.user` & `db.bot`)](#47-modern-asynchronous-database-storage-dbuser--dbbot)
48. [HTTP Streaming (Server-Sent Events / Live Logs)](#48-http-streaming-server-sent-events--live-logs)
49. [Secure Webhook with Expiration](#49-secure-webhook-with-expiration)
50. [Custom HTML Render Endpoint (`res.render`)](#50-custom-html-render-endpoint-resrender)
51. [Economy Balance with ResourcesLibv2](#51-economy-balance-with-resourceslibv2)

---

## Group & Channel

### 1. Welcome New Members

**Command:** `*`

```js
if (msg && msg.new_chat_members) {
  let newMembers = msg.new_chat_members;
  let welcomeText = "";

  newMembers.forEach(member => {
    welcomeText += `👋 Hello <b>${member.first_name}</b>, welcome to <b>${chat.title}</b>! 🎉\n\n`;
  });

  welcomeText += `✨ We're <i>excited</i> to have you here!\n` +
                 `💬 Feel free to <b>introduce yourself</b> and explore the group.\n` +
                 `🚀 Let's make this community awesome together!`;

  Api.sendMessage({
    chat_id: chat.id,
    text: welcomeText,
    parse_mode: "HTML"
  });
}
```

Greets every new member when they join the group. Add it to the `*` (wildcard) command so it catches the `new_chat_members` service message.

---

### 2. Goodbye Leaving Members

**Command:** `*`

```js
if (msg && msg.left_chat_member) {
  let member = msg.left_chat_member;

  let goodbyeText = `👋 Goodbye <b>${member.first_name}</b>! 💔\n\n` +
                    `We're sad to see you leave <b>${chat.title}</b>.\n` +
                    `✨ Wishing you all the best on your journey ahead! 🌟`;

  Api.sendMessage({
    chat_id: chat.id,
    text: goodbyeText,
    parse_mode: "HTML"
  });
}
```

Sends a farewell when someone leaves the group.

---

### 3. Join/Leave Message Hider

**Command:** `*`

```js
if (update.message) {
  const ms = update.message;

  // A new member joined → delete the "X joined" service message
  if (ms.new_chat_members) {
    Api.deleteMessage({ chat_id: ms.chat.id, message_id: ms.message_id });
  }

  // Someone left → delete the "X left" service message
  if (ms.left_chat_member) {
    Api.deleteMessage({ chat_id: ms.chat.id, message_id: ms.message_id });
  }
}
```

Keeps the chat clean by deleting Telegram's join/leave service messages. The bot needs delete-message admin rights.

---

### 4. Join/Leave Alerts to Admin

**Command:** `*`

```js
if (update.chat_member) {
  const cm = request; // in this command, request === update.chat_member
  const member = cm.new_chat_member?.user || cm.old_chat_member?.user;
  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
  const username = member.username ? `@${member.username}` : 'N/A';
  const chatTitle = cm.chat?.title || 'Unknown Chat';
  const chatId = cm.chat?.id;
  const oldStatus = cm.old_chat_member?.status;
  const newStatus = cm.new_chat_member?.status;

  let action = '';
  if (oldStatus === 'left' && newStatus === 'member') action = 'joined';
  else if (oldStatus === 'member' && newStatus === 'left') action = 'left';

  if (action) {
    Api.sendMessage({
      chat_id: 5723455420, // 🔴 your admin ID
      text:
        `📥 User ${action}:\n\n` +
        `👤 Name: ${fullName}\n` +
        `🔗 Username: ${username}\n` +
        `🆔 ID: ${member.id}\n` +
        `🏷 Chat: ${chatTitle}\n` +
        `🆔 Chat ID: ${chatId}\n` +
        `⏱ Time: ${new Date(cm.date * 1000).toLocaleString()}`
    });
  }
}
```

DMs the admin whenever a user joins or leaves. Works for all [Telegram update types](https://core.telegram.org/bots/api#update). (You can also move this into `/handle_chat_member`.)

---

### 5. Auto-Accept Join Requests + DM Welcome

**Command:** `/handle_chat_join_request`

```js
if (update.chat_join_request) {
  try {
    let req = update.chat_join_request;

    Api.approveChatJoinRequest({
      chat_id: req.chat.id,
      user_id: req.from.id
    });

    let mention = `<a href="tg://user?id=${req.from.id}">${req.from.first_name || "User"}</a>`;

    Api.sendMessage({
      chat_id: req.from.id,
      text: `👋 Hey ${mention}!\n\n✅ You've been <b>approved</b> to join <b>${req.chat.title}</b> 🎉\n\nWelcome aboard, enjoy your stay! 😄`,
      parse_mode: "HTML"
    });
  } catch (e) {
    Api.sendMessage({
      chat_id: update.chat_join_request.chat.id,
      text: `❌ <b>Approval failed:</b> ${e.message}`,
      parse_mode: "HTML"
    });
  }
}
```

Automatically approves channel/group join requests and welcomes the user in DM. The dynamic handler `/handle_chat_join_request` runs on `chat_join_request` updates.

---

### 6. Bot-Token Leak Guard

**Command:** `*`

```js
if (!msg || !msg.text) return;

if (message && message.match(/[0-9]{8,10}:[a-zA-Z0-9_-]{35}/)) {
  let potentialToken = message.match(/[0-9]{8,10}:[a-zA-Z0-9_-]{35}/)[0];

  // Verify it's a real, live bot token
  let botCheck = await HTTP.get({
    url: "https://api.telegram.org/bot" + potentialToken + "/getMe"
  });

  if (botCheck.ok && botCheck.data.ok) {
    Api.deleteMessage({ chat_id: chat.id, message_id: request.message_id });

    let tag = Libs.tgutil.getUserMention(user, { parseMode: 'html', showId: false });

    let warningMsg = await Api.sendMessage({
      text:
`⚠️ <b>Warning!</b>

${tag}, you just shared a <b>bot token</b>!

🔒 <i>Bot tokens should never be shared publicly.</i>
🚫 Anyone with it can control your bot.

Please <b>revoke this token immediately</b> from <a href="https://t.me/BotFather">@BotFather</a>.

🕒 This message will self-destruct in <b>10 seconds</b>.`,
      parse_mode: "HTML"
    });

    await sleep(10000); // max 10s (10000ms), must be awaited
    warningMsg.delete();
  }
}
```

Detects valid bot tokens posted in chat, deletes them, and warns the user (the warning self-destructs after 10s).

---

### 7. Channel Auto-Caption / Footer

**Command:** `*`

```js
function escapeHTML(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let post = request;

if (!post || !post.message_id) return;
if (post.chat.type !== "channel") return;

let footer =
  "\n\n━━━━━━━━━━━━━━\n" +
  "📢 <b>Follow us for more updates!</b>\n" +
  "🔗 <a href='https://t.me/bizft'>Join our channel</a>";

let checkText = (post.caption || post.text || "");
if (checkText.includes("Join our channel")) return; // avoid double-footer

// Media posts → edit caption
if (post.photo || post.video || post.document || post.audio) {
  let baseCaption = escapeHTML(post.caption ? post.caption.trim() : "");
  let finalCaption = baseCaption ? (baseCaption + footer) : footer.trim();

  if (finalCaption.length > 1024) {
    finalCaption = finalCaption.substring(0, 900) + "..." + footer;
  }

  Api.editMessageCaption({
    chat_id: post.chat.id,
    message_id: post.message_id,
    caption: finalCaption,
    parse_mode: "HTML"
  });
  return;
}

// Text posts → edit text
if (post.text) {
  let finalText = escapeHTML(post.text.trim()) + footer;
  Api.editMessageText({
    chat_id: post.chat.id,
    message_id: post.message_id,
    text: finalText,
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
  return;
}
```

Automatically appends a follow/footer to every new channel post (text or media). Add the bot as a channel admin with edit rights.

---

### 8. Force-Join (Subscription Gate)

**Commands:** `@`, `/start`, `check_join`

```js
/* Command: @  (init — runs before every command) */
const channels = ["@Mrnull9"]; // your required channels
```

```js
/* Command: /start */
const ik = [];

for (const c of channels) {
  ik.push([{ text: "Join " + c, url: "tg://resolve?domain=" + c.slice(1) }]);
}
ik.push([{ text: "✅ I Joined", callback_data: "check_join" }]);

Api.sendMessage({
  text: "*Please join our channel to continue.*\n\n_Join first, then tap \"I Joined\"._",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: ik }
});
```

```js
/* Command: check_join  (triggered by the callback_data button) */
const res = await Libs.mcl.check(user.id, channels);
const allJoined = res.all_joined;

const text = allJoined
  ? "*Verification Complete!*\n\n_You may continue now._"
  : "*You have not joined yet.*\n\n_Please join first, then tap \"Check Again\"._";

const ik = [];
for (const c of channels) {
  ik.push([{ text: "Join " + c, url: "tg://resolve?domain=" + c.slice(1) }]);
}
ik.push([{ text: "🔄 Check Again", callback_data: "check_join" }]);

Api.editMessageText({
  text,
  message_id: request?.message?.message_id,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: !allJoined ? ik : undefined }
});
```

Classic "join our channel to use the bot" gate. `@` defines the shared `channels` list; `/start` shows join buttons; `check_join` verifies membership with `Libs.mcl.check` and updates the same message.

---

## User Tools & Utilities

### 9. Advanced User Info

**Command:** `/info`

```js
if (!msg) return;

let u = user;
let c = chat;

let isPrivate = c.type == "private";
let firstName = u.first_name || "Unknown";
let username = u.username ? "@" + u.username : "Not Set";
let premium = u.is_premium ? "Yes" : "No";
let userId = u.id;
let chatId = c.id;
let permalink = `<a href="tg://user?id=${userId}">Click Here</a>`;

// Determine group role
let status = "Private Chat";
if (!isPrivate) {
  try {
    let res = await Api.getChatMember({ chat_id: chatId, user_id: userId });
    let member = res.result;
    if (member.status == "creator") status = "Owner 👑";
    else if (member.status == "administrator") status = "Admin 🛡️";
    else status = "Member";
  } catch (e) {
    status = "Unknown";
  }
}

let infoText = `<b>「 User Information 」</b>
━━━━━━•❅•°•❈•°•❅•━━━━━━
👤 <b>Name:</b> ${firstName}
🔤 <b>Username:</b> ${username}
🆔 <b>User ID:</b> <code>${userId}</code>
🔗 <b>Permanent Link:</b> ${permalink}
⭐ <b>Premium:</b> ${premium}
🛡️ <b>Status:</b> ${status}
━━━━━━•❅•°•❈•°•❅•━━━━━━`;

let btn = [[{ text: "View Profile", url: `tg://user?id=${userId}` }]];

// Send with profile photo if available, else text only
try {
  let photos = await Api.getUserProfilePhotos({ user_id: userId, limit: 1 });

  if (photos.ok && photos.result.total_count > 0) {
    let fileId = photos.result.photos[0][0].file_id;
    await msg.replyPhoto(fileId, {
      caption: infoText,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: btn }
    });
  } else {
    await msg.reply(infoText, { parse_mode: "HTML", reply_markup: { inline_keyboard: btn } });
  }
} catch (e) {
  await msg.reply(infoText, { parse_mode: "HTML", reply_markup: { inline_keyboard: btn } });
}
```

Shows a rich profile card (name, username, ID, premium status, group role) with the user's profile photo when available.

---

### 10. Weather Checker

**Command:** `/weather`  ·  **Usage:** `/weather <city>`

```js
let city = params;

if (!city) {
  Bot.sendMessage(
    "🌍 *Weather Checker* 🌍\n\nPlease specify a city:\n\n`/weather London`\n`/weather New York`\n`/weather Tokyo`",
    { parse_mode: "Markdown" }
  );
  return;
}

let url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

try {
  let response = await HTTP.get({ url: url, timeout: 10000 });

  if (response.ok && response.data) {
    let data = response.data;
    let current = data.current_condition[0];
    let area = data.nearest_area[0];

    let weatherMessage = `🌤 *Weather in ${area.areaName[0].value}, ${area.country[0].value}*

📊 *Current Conditions*:
${getWeatherEmoji(current.weatherCode)} ${current.weatherDesc[0].value}
🌡 *Temperature*: ${current.temp_C}°C (${current.temp_F}°F)
💭 *Feels like*: ${current.FeelsLikeC}°C
💧 *Humidity*: ${current.humidity}%
💨 *Wind*: ${current.windspeedKmph} km/h
🌅 *Pressure*: ${current.pressure} mb
👁 *Visibility*: ${current.visibility} km

📍 *Observation Time*: ${current.localObsDateTime || current.observation_time}`;

    Bot.sendMessage(weatherMessage, { parse_mode: "Markdown" });
  } else {
    Bot.sendMessage(`❌ Could not fetch weather for "${city}".\nPlease check the city name and try again.`);
  }
} catch (error) {
  Bot.sendMessage(`❌ Error: ${error.message || "Unable to fetch weather data"}`);
}

function getWeatherEmoji(code) {
  if (code === "113") return "☀️";
  if (code === "116") return "⛅️";
  if (["119", "122"].includes(code)) return "☁️";
  if (["143", "248", "260"].includes(code)) return "🌫";
  if (["176", "263", "266", "293", "296"].includes(code)) return "🌦";
  if (["179","182","185","281","284","311","314","317","320","323","326","329","332","335","338","350","353","356","359","362","365","368","371","374","377"].includes(code)) return "❄️";
  if (["200", "386", "389"].includes(code)) return "⛈";
  if (["227", "230"].includes(code)) return "💨";
  if (["299", "302", "305", "308"].includes(code)) return "🌧";
  return "🌤";
}
```

Free weather via `wttr.in` (no API key). Reads the city from `params`.

---

### 11. Country Info

**Commands:** `/details`, `/onCountryResponse`  ·  **Usage:** `/details <country>`

```js
/* Command: /details */
let country = params ? params.trim() : "";
if (!country) {
  return Bot.sendMessage("⚠️ *Usage:* `/details country_name`\n\nExample: `/details India`", { parse_mode: "Markdown" });
}
let apiUrl = "https://restcountries.com/v3.1/name/" + encodeURIComponent(country);
HTTP.get({ url: apiUrl, success: "/onCountryResponse" });
```

```js
/* Command: /onCountryResponse */
let data = JSON.parse(content);
if (!data || data.status == 404) {
  return Bot.sendMessage("❌ *Country Not Found!*\nPlease enter a valid country name.", { parse_mode: "Markdown" });
}

let country = data[0];
let name = country.name.common;
let capital = country.capital ? country.capital[0] : "Not Available";
let population = country.population.toLocaleString();
let area = country.area.toLocaleString() + " km²";
let currency = Object.values(country.currencies)[0].name + " (" + Object.keys(country.currencies)[0] + ")";
let flag = country.flags.png;

let message =
  "🌍 *Country Details*\n" +
  "━━━━━━━━━━━━━━━━\n" +
  "🏷 *Name:* `" + name + "`\n" +
  "🏛 *Capital:* `" + capital + "`\n" +
  "👥 *Population:* `" + population + "`\n" +
  "📏 *Area:* `" + area + "`\n" +
  "💰 *Currency:* `" + currency + "`\n" +
  "━━━━━━━━━━━━━━━━";

Api.sendPhoto({
  chat_id: chat.id,
  photo: flag,
  caption: message,
  parse_mode: "Markdown"
});
```

Uses the HTTP `success` callback pattern: `/details` fires the request, `/onCountryResponse` receives the body in `content` and replies with the flag + details.

---

### 12. Link Shortener

**Command:** `/short`  ·  **Usage:** `/short <long_link>`  ·  Powered by [TinyURL](https://tinyurl.com/)

```js
if (!params) {
  Api.sendMessage({
    chat_id: chat.id,
    text:
      "❌ <b>Missing URL</b>\n\n" +
      "👉 <b>Usage:</b>\n<code>/short https://example.com</code>\n\n" +
      "Please send a valid long link.",
    parse_mode: "HTML"
  });
  return;
}

let longUrl = params.trim();

if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
  Api.sendMessage({
    chat_id: chat.id,
    text: "❌ <b>Invalid URL</b>\n\nURL must start with:\n<code>http://</code> or <code>https://</code>",
    parse_mode: "HTML"
  });
  return;
}

Api.sendChatAction({ chat_id: chat.id, action: "typing" });

let res = await HTTP.get({
  url: "https://tinyurl.com/api-create.php",
  query: { url: longUrl }
});

if (!res || !res.content) {
  Api.sendMessage({ chat_id: chat.id, text: "⚠️ <b>Failed to shorten the link</b>\nPlease try again later.", parse_mode: "HTML" });
  return;
}

Api.sendMessage({
  chat_id: chat.id,
  text:
    "✨ <b>URL Shortened Successfully!</b>\n\n" +
    "🔗 <b>Short Link:</b>\n<code>" + res.content + "</code>\n\n" +
    "🚀 Powered by <b>TinyURL</b>",
  parse_mode: "HTML"
});
```

Shortens a long URL via TinyURL's keyless API. The short URL comes back as plain text in `res.content`.

---

### 13. Premium / Custom Emoji ID Getter

**Command:** `/emojiid`  ·  **Usage:** reply/include a premium emoji

```js
if (!params) {
  Api.sendMessage({
    text: "❗ <b>Usage</b>:\n<code>/emojiid &lt;message with premium emoji&gt;</code>",
    parse_mode: "HTML"
  });
  return;
}

let text = "❌ No premium/custom emojis found.";

if (request.entities && Array.isArray(request.entities)) {
  let ids = [];

  for (const entity of request.entities) {
    if (entity.type === "custom_emoji" && entity.custom_emoji_id) {
      ids.push(entity.custom_emoji_id);
    }
  }

  if (ids.length > 0) {
    text = "🆔 <b>Premium Emoji IDs</b>:\n\n";
    ids.forEach(id => {
      text += `<tg-emoji emoji-id="${id}"></tg-emoji>  <code>${id}</code>\n`;
    });
    text += "\n📌 <b>Usage</b>:\n";
    text += "<b>HTML:</b>\n";
    text += `<code>&lt;tg-emoji emoji-id="EMOJI_ID"&gt;&lt;/tg-emoji&gt;</code>\n\n`;
    text += "<b>MarkdownV2:</b>\n";
    text += `<code>![emoji](tg://emoji?id=EMOJI_ID)</code>`;
  }
}

Api.sendMessage({ text: text, parse_mode: "HTML" });
```

Extracts `custom_emoji_id`s from premium emojis in the message entities so you can reuse them.

---

### 14. Custom Emoji Formatter

**Command:** `*`  (private chats only)

```js
/* command: *  ·  need_reply: false */

if (!msg || !msg.text) return;
if (chat.type != "private") return;

function escapeHTML(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let text = msg.text;
let entities = msg.entities || [];

let result = "";
let lastIndex = 0;
let hasCustomEmoji = false;

for (let i = 0; i < entities.length; i++) {
  let e = entities[i];
  if (e.type == "custom_emoji") {
    hasCustomEmoji = true;
    result += text.slice(lastIndex, e.offset);
    let emojiChar = text.substr(e.offset, e.length);
    result += "![" + emojiChar + "](tg://emoji?id=" + e.custom_emoji_id + ")";
    lastIndex = e.offset + e.length;
  }
}
result += text.slice(lastIndex);

let out = hasCustomEmoji ? result : text;
out = escapeHTML(out);
out = "<code>" + out + "</code>";

// Split long output to stay under Telegram limits
let max = 3800;
for (let i = 0; i < out.length; i += max) {
  Api.sendMessage({ chat_id: chat.id, text: out.slice(i, i + max), parse_mode: "HTML" });
}
```

Converts Telegram custom emojis in a user's message into safe `tg://emoji?id=` references wrapped in `<code>` (like @AdsMarkdownBot).

---

## Economy & Engagement

### 15. Redeem Code Generator & Redeemer

**Commands:** `/gen` (admin), `/redeem` (needs reply)

```js
/* Command: /gen  (admin only) */
if (user.telegramid != 8478834931) { // 🔴 Replace with your Telegram ID
  return Bot.sendMessage("❌ Only admin can generate codes!");
}

let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let code = "";
for (let i = 0; i < 8; i++) {
  code += characters.charAt(Math.floor(Math.random() * characters.length));
}

let amount = 10; // reward amount
Bot.set("REDEEM_" + code, amount, "number");

Bot.sendMessage("✅ New Redeem Code Generated: `" + code + "`\nAmount: " + amount + " coins", { parse_mode: "Markdown" });
```

```js
/* Command: /redeem  ·  Answer: "Enter your redeem code."  ·  need_reply: true */
let code = message;
let amount = Bot.get("REDEEM_" + code);

if (!amount) {
  return Bot.sendMessage("❌ Invalid or Expired Code!");
}

// NOTE: For existing bots, continue using User.get/set to avoid data loss.
// For new bots, use: let balance = await db.user.get("balance", 0)
let balance = User.get("balance") || 0;
balance += amount;
User.set("balance", balance, "number");

Bot.sendMessage("✅ Redeem Successful!\n🎉 You received " + amount + " coins!");

Bot.del("REDEEM_" + code); // one-time use — delete after redeeming
```

Admin generates one-time redeem codes (stored in bot-level storage); users redeem them with `/redeem` to top up their per-user `balance`.

---

## UI / Platform Tricks

### 16. Message Chaining (edit / delete)

```js
// Send a message, then edit it
let initMes = await Api.sendMessage({ text: "This message is going to be edited" });
initMes.editText("Hey, this is the edited message");
```

```js
// Multi-step chain: send → edit → delete
let initMes = await Api.sendMessage({ text: "This message is going to be edited" });

let editMes = await initMes.editText("Edited — now it will be deleted");
editMes.delete(); // auto-detects message_id
```

Awaiting a send/edit returns a chainable object (`editText`, `delete`, `pin`, `react`, `reply`, …) — no need to track `message_id`. Works with `Bot.sendMessage` too. See [chaining docs](https://telebothost.com/docs/#api-chained).

---

### 17. Send a File from a Buffer

```js
let content = "Hello World! This is a test file.";
let buffer = Buffer.from(content, "utf8");

Api.sendDocument({
  document: buffer,
  filename: "test.txt",
  caption: "✅ File from buffer"
});
```

TBL supports direct file sending as a `Buffer` — generate file contents in code and send them without any URL.

---

### 18. Progress Bar Animation

```js
/* Style 1 — segments */
let progress = 0;

function bar(p) {
  const filled = Math.floor(p / 12.5); // 8 segments
  return "▰".repeat(filled) + "▱".repeat(8 - filled);
}

const mes = await Api.sendMessage({ text: `${bar(progress)} ${progress}%` });

while (progress < 100) {
  const step = Math.floor(Math.random() * 10) + 6; // +6–15%
  progress = Math.min(progress + step, 100);
  await sleep(80 + Math.random() * 70);            // 80–150ms
  await mes.editText(`${bar(progress)} ${progress}%`);
}

await mes.editText("✅ Done!");
```

```js
/* Style 2 — bracketed bar */
let progress = 0;

function bar(p) {
  const filled = Math.floor(p / 12.5);
  return `[${"▓".repeat(filled)}${"░".repeat(8 - filled)}]`;
}

const mes = await Api.sendMessage({ text: `${bar(progress)} ${progress}%` });

while (progress < 100) {
  const step = Math.floor(Math.random() * 10) + 6;
  progress = Math.min(progress + step, 100);
  await sleep(80 + Math.random() * 70);
  await mes.editText(`${bar(progress)} ${progress}%`);
}

await mes.editText("✅ Done!");
```

Animates a progress bar by editing the same message in a loop. Keep total `sleep` time within the execution timeout.

---

### 19. Emoji (Message) Effects

**Command:** `/start`

```js
Api.sendMessage({
  chat_id: user.telegramid,
  text: "🎉 Celebration effect message",
  parse_mode: "Markdown",
  message_effect_id: "5046509860389126442"
});
```

Known effect IDs:

```
🔥  5104841245755180586
👍  5107584321108051014
🎉  5046509860389126442
👎  5104858069142078462
❤️  5044134455711629726
```

Adds Telegram's full-screen message effects via `message_effect_id`.

---

### 20. Colored Buttons & Icon Buttons

```js
// custom emoji ID for icon buttons
const EMOJI_ID = "5474667187258006816";

// ---------- INLINE KEYBOARD ----------
//adding colors in button
Api.sendMessage({
  text: "<b>🔥 New Button UI</b>\n\nInline + Keyboard colors & icons",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [ { text: "Normal", callback_data: "*" },
        { text: "Primary", callback_data: "*", style: "primary" } ], //blue color
      [ { text: "Success", callback_data: "*", style: "success" }, //green color
        { text: "Danger", callback_data: "*", style: "danger" } ], //red color
      [ { text: "Icon Button", callback_data: "*", icon_custom_emoji_id: EMOJI_ID } ] // no color , custom emoji in button
    ]
  }
});

// ---------- REPLY KEYBOARD ----------
Api.sendMessage({
  chat_id: chat.id,
  text: "⌨️ Keyboard Button Test",
  reply_markup: {
    keyboard: [
      [ { text: "Normal KB" }, { text: "Primary KB", style: "primary" } ],
      [ { text: "Success KB", style: "success" }, { text: "Danger KB", style: "danger" } ],
      [ { text: "Icon KB", icon_custom_emoji_id: EMOJI_ID } ]
    ],
    resize_keyboard: true
  }
});
```

**Colored & icon buttons are real** — added in **Telegram Bot API 9.4 (Feb 9, 2026)**, not a TBH-only trick:

- `style`: `"primary"` (blue), `"success"` (green), `"danger"` (red); omit for the default look. Works on both `inline_keyboard` and `keyboard` buttons.
- `icon_custom_emoji_id`: shows a custom emoji on the button (requires the bot owner to have **Telegram Premium** so the bot may use custom emoji in the message).

Caveats: these only **render** on Telegram apps updated to Bot API 9.4+; older clients silently ignore the fields and show a normal button. For a graceful fallback you can also prefix the text with a colored circle (🟢 🔴 🔵). So if another AI says "Telegram has no real button colors," it's working from pre-9.4 knowledge — check the [Bot API changelog](https://core.telegram.org/bots/api-changelog). `EMOJI_ID` above is a placeholder; replace it with a real custom-emoji ID string.

---

### 21. Set Group Photo from a URL (InputFile trick)

```js
let res = await HTTP.get(
  "https://telebothost.com/logo.png",
  { headers: { "x-response-type": "buffer" } }
);

const buffer = res.data;

Api.setChatPhoto({
  // chat_id: "id",  // default is current chat
  photo: buffer
});
```

Download a file as a buffer (`x-response-type: buffer`) and pass it to any method needing an [InputFile](https://core.telegram.org/bots/api#inputfile) — here `setChatPhoto`.

---

### 22. Clone & Transfer a Bot

```js
/* Clone a bot */
const res = TBL.clone({
  bot_id: bot.id,            // required: bot to clone
  start_now: true,           // optional: clone and start immediately
  bot_token: "12345:abc",    // required if start_now = true
  all_prop: true,            // optional: copy all bot properties
  bot_props: {               // optional: custom props (auto type-detected)
    theme: "dark",
    welcome: "Welcome to my new bot!"
  }
});

Bot.inspect(res);
/*
{
  ok: true,
  result: { bot_id: 544xxxxx, bot_name: 'Tbl Test', owner: 'mymail@telebothost.com', commands_count: 9 }
}
*/
```

```js
/* Transfer a bot to another account */
const result = TBL.transfer({
  bot_id: bot.id,
  to_mail: "newuser@telebothost.com"
});
```

`TBL.clone` and `TBL.transfer` are **synchronous** (no `await` needed) and block ~4–5s while the server completes the operation. [TBL class docs](https://telebothost.com/docs/#class-tbl).

---

### 23. Admin Contact / PM Forwarder Bot

**Commands:** `@`, `*`

```js
/* Command: @  (init) */
let ADMIN_ID = 5723455420; // 🔴 your admin ID
```

```js
/* Command: *  (handles all updates) */
const ADMIN_ID = 5723455420; // 🔴 your admin ID

function getOriginalUserIdByMessageId(messageId) {
  return Bot.get("pvt" + messageId);
}

if (!msg) return;
if (chat.type != "private") return;

// User → Admin: forward the user's message
if (chat.id != ADMIN_ID) {
  let forwardResult = await Api.forwardMessage({
    chat_id: ADMIN_ID,
    from_chat_id: chat.id,
    message_id: msg.message_id
  });

  // If the user has privacy mode (hidden_user), store a mapping so admin can still reply
  if (forwardResult?.result?.forward_origin?.type == "hidden_user") {
    Bot.set("pvt" + forwardResult?.result?.message_id, user.id);
  }

  msg.reply("✅ *Message successfully sent to Admin*");
}

// Admin → User: reply to a forwarded message to answer the user
if (chat.id == ADMIN_ID && request?.reply_to_message) {
  let originalChatId = request.reply_to_message?.forward_from?.id ||
                       getOriginalUserIdByMessageId(request.reply_to_message.message_id);

  Api.copyMessage({
    chat_id: originalChatId,
    from_chat_id: ADMIN_ID,
    message_id: msg.message_id
  });
}
```

A two-way support bridge: users DM the bot → messages forward to the admin; the admin replies to a forwarded message → the reply is copied back to the original user. Includes a fallback for users with forwarding privacy enabled (`hidden_user`).

---

### 24. Guest Mode (`!info`) Example

**Command:** `*`  ·  trigger query: `!info`

```js
if (!update.guest_message) return;

let guest = update.guest_message;
let text = (guest.text || "").toLowerCase();

let target = guest.from;
let message = "@Durov";

// !info trigger
if (text.includes("!info")) {
  // info of the replied user (if any)
  if (guest.reply_to_message) {
    let replied = guest.reply_to_message;
    if (replied.guest_bot_caller_user) target = replied.guest_bot_caller_user;
    else if (replied.from) target = replied.from;
  }

  let name = target.first_name || "—";
  let username = target.username ? "@" + target.username : "—";
  let userid = target.id || "—";

  message = `👤 ${name}\n🆔 ${userid}\n🔗 ${username}`;
}

// Reply to the guest query
Api.call("answerGuestQuery", {
  guest_query_id: guest.guest_query_id,
  result: {
    type: "article",
    id: "reply",
    title: "Reply",
    description: "@Durov",
    input_message_content: { message_text: message }
  }
});
```

TBL guest-mode example. Type `!info` (optionally as a reply) to get yours or another user's info. Uses `Api.call` for the `answerGuestQuery` method.

---

## More Real Bots (new)

### 25. Echo Bot

**Command:** `*`

```js
if (!msg || !msg.text) return;        // ignore non-text updates
if (msg.text.startsWith("/")) return; // let real commands handle slash commands

Bot.sendMessage("🗣 You said: " + msg.text);
```

The simplest possible bot: repeats back whatever text the user sends.

---

### 26. Menu Bot with Inline Callbacks

**Commands:** `/start`, `menu_help`, `menu_about`, `menu_back`

```js
/* Command: /start */
Api.sendMessage({
  text: "<b>Main Menu</b>\nPick an option:",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [ { text: "ℹ️ Help", callback_data: "menu_help" },
        { text: "🤖 About", callback_data: "menu_about" } ]
    ]
  }
});
```

```js
/* Command: menu_help  (triggered by the callback button) */
Api.answerCallbackQuery({ callback_query_id: update.callback_query.id });
Api.editMessageText({
  chat_id: chat.id,
  message_id: update.callback_query.message.message_id,
  text: "ℹ️ <b>Help</b>\nUse the buttons to navigate. Tap Back to return.",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: [[{ text: "⬅️ Back", callback_data: "menu_back" }]] }
});
```

```js
/* Command: menu_about */
Api.answerCallbackQuery({ callback_query_id: update.callback_query.id });
Api.editMessageText({
  chat_id: chat.id,
  message_id: update.callback_query.message.message_id,
  text: "🤖 <b>About</b>\nA demo menu bot built with TBL.",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: [[{ text: "⬅️ Back", callback_data: "menu_back" }]] }
});
```

```js
/* Command: menu_back */
Api.answerCallbackQuery({ callback_query_id: update.callback_query.id });
Api.editMessageText({
  chat_id: chat.id,
  message_id: update.callback_query.message.message_id,
  text: "<b>Main Menu</b>\nPick an option:",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [ { text: "ℹ️ Help", callback_data: "menu_help" },
        { text: "🤖 About", callback_data: "menu_about" } ]
    ]
  }
});
```

A single message that morphs between Menu → Help/About → Back, instead of stacking new messages. Each `callback_data` value matches a command name.

---

### 27. Broadcast to All Users (Admin)

**Command:** `/broadcast`  ·  **Usage:** `/broadcast <message>`

```js
const ADMIN_ID = 5723455420; // 🔴 your admin ID

if (user.id != ADMIN_ID) return Bot.sendMessage("❌ Admins only.");
if (!params) return Bot.sendMessage("Usage: /broadcast <message>");

// Use the high-performance Bot.broadcast distributed system instead of a manual slow loop
let job = await Bot.broadcast({
  method: "sendMessage",
  body: { 
    text: params,
    parse_mode: "HTML"
  },
  filters: { chatType: "private" }
});

Bot.sendMessage(
  `📣 Broadcast job queued successfully!\n` +
  `🆔 Job ID: <code>${job.broadcastId}</code>\n` +
  `👥 Target Chats: ${job.totalTargetChats}\n` +
  `📦 Total Batches: ${job.totalBatches}`,
  { parse_mode: "HTML" }
);
```

Sends a high-performance broadcast to all private chat users. Using `Bot.broadcast` offloads rate-limiting, chunking, and timeouts to the platform background, making it highly superior to manual loops.

---

### 28. Group Moderation: Ban / Kick / Mute

**Commands:** `/ban`, `/kick`, `/mute`  ·  reply to the target user's message

```js
/* Shared helper — paste at the top of each command, or export via require */
async function isAdmin(uid) {
  let r = await Api.getChatMember({ chat_id: chat.id, user_id: uid });
  let s = r?.result?.status;
  return s === "creator" || s === "administrator";
}
```

```js
/* Command: /ban */
if (chat.type === "private") return Bot.sendMessage("Use this in a group.");
if (!(await isAdmin(user.id))) return Bot.sendMessage("❌ You are not an admin.");
if (!request.reply_to_message) return Bot.sendMessage("↩️ Reply to the user you want to ban.");

let target = request.reply_to_message.from;
let res = await Api.banChatMember({ chat_id: chat.id, user_id: target.id });
Bot.sendMessage(res.ok ? `🔨 Banned ${target.first_name}.` : "❌ Could not ban (check my admin rights).");
```

```js
/* Command: /kick  (ban then unban = remove without permanent ban) */
if (!(await isAdmin(user.id))) return Bot.sendMessage("❌ You are not an admin.");
if (!request.reply_to_message) return Bot.sendMessage("↩️ Reply to the user you want to kick.");

let target = request.reply_to_message.from;
await Api.banChatMember({ chat_id: chat.id, user_id: target.id });
await Api.unbanChatMember({ chat_id: chat.id, user_id: target.id });
Bot.sendMessage(`👢 Kicked ${target.first_name}.`);
```

```js
/* Command: /mute */
if (!(await isAdmin(user.id))) return Bot.sendMessage("❌ You are not an admin.");
if (!request.reply_to_message) return Bot.sendMessage("↩️ Reply to the user you want to mute.");

let target = request.reply_to_message.from;
let res = await Api.restrictChatMember({
  chat_id: chat.id,
  user_id: target.id,
  permissions: { can_send_messages: false }
});
Bot.sendMessage(res.ok ? `🔇 Muted ${target.first_name}.` : "❌ Could not mute.");
```

Admin-gated moderation. Each command checks the caller is an admin, then acts on the replied-to user. The bot must be an admin with the relevant rights.

---

### 29. Daily Reward with Cooldown

**Command:** `/daily`

```js
const DAY_MS = 24 * 60 * 60 * 1000;
// NOTE: For new bots, migrate to: let last = await db.user.get("last_daily", 0)
let last = User.get("last_daily") || 0;
let now = Date.now();

if (now - last < DAY_MS) {
  let leftMs = DAY_MS - (now - last);
  let readable = modules.humanizeDuration(leftMs, { round: true, largest: 2 });
  return Bot.sendMessage(`⏳ Already claimed!\nCome back in ${readable}.`);
}

let reward = Libs.random.randomInt(10, 50);
let coins = Libs.ResourcesLib.userRes("coins");
coins.add(reward);

User.set("last_daily", now, "number");
Bot.sendMessage(`🎁 Daily reward: <b>+${reward}</b> coins!\n💰 Balance: <b>${coins.value()}</b>`, { parse_mode: "HTML" });
```

A once-per-24h reward. Uses a stored timestamp for the cooldown, `humanizeDuration` for the wait text, `random` for the amount, and `ResourcesLib` for the persistent balance.

---

### 30. Referral System Bot

**Commands:** `/start`, `/mylink`, `/leaderboard`

```js
/* Command: /start — track referrals on start (Async) */
let trackRes = await Libs.refLib.track({
  prefixes: ["ref"],
  onJoin: async ({ referrer, count }) => {
    Api.sendMessage({
      chat_id: referrer.id,
      text: `🔥 ${user.first_name} joined using your link! You now have ${count} referrals.`
    });
  },
  onSelf: async () => {
    Bot.sendMessage("🔄 That's your own link — share it with friends instead!");
  }
});

Bot.sendMessage(`👋 Welcome! Invite friends and earn rewards.\nUse /mylink to get your referral link.`);
```

```js
/* Command: /mylink */
let url = await Libs.refLib.register({ prefix: "ref" });
let count = await Libs.refLib.count();

Bot.sendMessage(
  `🔗 Your referral link:\n${url}\n\n👥 You have ${count} referrals.`
);
```

```js
/* Command: /leaderboard */
let leaders = await Libs.refLib.leaderboard(10);
const top10 = leaders
  .map(r => `${r.rank}. User ${r.userId} — ${r.count} referrals`)
  .join("\n");

Bot.sendMessage("🏆 Top Referrers:\n" + (top10 || "No referrals yet."));
```

A full referral program using `Libs.refLib`: `@` tracks invites, `/mylink` gives the user their link + count, and `/leaderboard` ranks top referrers.

---

### 31. Per-User To-Do List

**Commands:** `/add`, `/list`, `/done`

```js
/* Command: /add  ·  Usage: /add buy milk */
if (!params) return Bot.sendMessage("Usage: /add <task>");

// NOTE: For new bots, use: let todos = await db.user.get("todos", [])
let todos = User.get("todos") || [];
todos.push(params.trim());
// For new bots: await db.user.set("todos", todos)
User.set("todos", todos, "json");

Bot.sendMessage(`✅ Added: ${params.trim()}\nYou now have ${todos.length} task(s).`);
```

```js
/* Command: /list */
let todos = User.get("todos") || [];
if (todos.length === 0) return Bot.sendMessage("📭 Your to-do list is empty.");

let text = "📝 *Your Tasks*\n\n" + todos.map((t, i) => `${i + 1}. ${t}`).join("\n");
Bot.sendMessage(text, { parse_mode: "Markdown" });
```

```js
/* Command: /done  ·  Usage: /done 2 */
let todos = User.get("todos") || [];
let n = parseInt(params);

if (!n || n < 1 || n > todos.length) return Bot.sendMessage("Usage: /done <task number>");

let removed = todos.splice(n - 1, 1)[0];
User.set("todos", todos, "json");
Bot.sendMessage(`✔️ Completed & removed: ${removed}`);
```

A private to-do list stored per user with `User` storage (`json` type for the array).

---

### 32. QR Code Generator

**Command:** `/qr`  ·  **Usage:** `/qr <text or link>`

```js
if (!params) return Bot.sendMessage("Usage: /qr <text or link>");

let data = encodeURIComponent(params.trim());
let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${data}`;

Api.sendPhoto({
  chat_id: chat.id,
  photo: qrUrl,
  caption: "✅ Here's your QR code"
});
```

Generates a QR code image for any text/URL using a free keyless API and sends it as a photo.

---

### 33. Crypto Price Checker

**Command:** `/price`  ·  **Usage:** `/price bitcoin`

```js
let coin = (params || "bitcoin").trim().toLowerCase();

let res = await HTTP.get({
  url: "https://api.coingecko.com/api/v3/simple/price",
  query: { ids: coin, vs_currencies: "usd" },
  timeout: 10000
});

if (!res.ok || !res.data || !res.data[coin]) {
  return Bot.sendMessage(`❌ Couldn't find price for "${coin}".\nTry: /price ethereum`);
}

let usd = res.data[coin].usd;
Bot.sendMessage(`💰 *${coin.toUpperCase()}*\nPrice: *$${usd.toLocaleString()}*`, { parse_mode: "Markdown" });
```

Fetches live crypto prices from CoinGecko. Reads the coin id from `params` (defaults to bitcoin).

---

### 34. Translate Bot (Multi-language)

**Commands:** `/setlang`, `*`

```js
/* Command: /setlang  ·  Usage: /setlang es */
if (!params) {
  let langs = Libs.TranslateLib.getSupportedLanguages();
  let list = Object.entries(langs).map(([code, name]) => `\`${code}\` — ${name}`).join("\n");
  return Bot.sendMessage("🌍 *Set your language:*\n`/setlang <code>`\n\n" + list, { parse_mode: "Markdown" });
}

try {
  Libs.TranslateLib.setUserLang(user.id, params.trim());
  Bot.sendMessage("✅ Language set to " + Libs.TranslateLib.languages[params.trim()]);
} catch (e) {
  Bot.sendMessage("❌ " + e.message);
}
```

```js
/* Command: *  (auto-translate any text into the user's language) */
if (!msg || !msg.text || msg.text.startsWith("/")) return;

try {
  let translated = await Libs.TranslateLib.autoTranslate(msg.text);
  Bot.sendMessage("🌐 " + translated);
} catch (e) {
  Bot.sendMessage("⚠️ Translation failed: " + e.message);
}
```

`/setlang` saves the user's preferred language; the `*` command auto-translates any text they send into it (`TranslateLib.autoTranslate` must be awaited).

---

### 35. Inline Query Search Bot

**Command:** `/inline_query`  (type `@yourbot <query>` in any chat)

```js
let q = (request.query || "").trim();

let items = [
  { name: "TeleBotHost", url: "https://telebothost.com" },
  { name: "Telegram Bot API", url: "https://core.telegram.org/bots/api" },
  { name: "Support Group", url: "https://t.me/update_chat" }
];

let matches = q ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase())) : items;

let results = matches.map((i, idx) => ({
  type: "article",
  id: String(idx),
  title: i.name,
  description: i.url,
  input_message_content: { message_text: `${i.name}\n${i.url}` }
}));

Api.answerInlineQuery({
  inline_query_id: request.id,
  results: results,
  cache_time: 10
});
```

Handles Telegram inline mode. The `/inline_query` command reads `request.query`, filters results, and replies with `answerInlineQuery`. (Enable inline mode for your bot in @BotFather.)

---

### 36. Anti-Link / Spam Filter

**Command:** `*`  (groups)

```js
if (!msg || !msg.text) return;
if (chat.type === "private") return;

// Allow admins to post links
let m = await Api.getChatMember({ chat_id: chat.id, user_id: user.id });
let s = m?.result?.status;
if (s === "creator" || s === "administrator") return;

// Detect links / @usernames / t.me invites
let linkPattern = /(https?:\/\/|www\.|t\.me\/|@[a-zA-Z0-9_]{4,})/i;
if (linkPattern.test(msg.text)) {
  Api.deleteMessage({ chat_id: chat.id, message_id: msg.message_id });
  let tag = Libs.tgutil.getUserMention(user, { parseMode: "html" });
  Api.sendMessage({
    chat_id: chat.id,
    text: `🚫 ${tag}, links are not allowed here.`,
    parse_mode: "HTML"
  });
}
```

Deletes messages containing links/usernames from non-admins and warns the sender. Requires delete-message admin rights.

---

### 37. Sticker & File ID Getter

**Command:** `*`

```js
if (!msg) return;

let info = null;

if (msg.sticker)        info = "🎟 Sticker file_id:\n`" + msg.sticker.file_id + "`";
else if (msg.photo)     info = "🖼 Photo file_id:\n`" + msg.photo[msg.photo.length - 1].file_id + "`";
else if (msg.document)  info = "📄 Document file_id:\n`" + msg.document.file_id + "`";
else if (msg.video)     info = "🎬 Video file_id:\n`" + msg.video.file_id + "`";
else if (msg.animation) info = "🎞 Animation file_id:\n`" + msg.animation.file_id + "`";

if (info) Bot.sendMessage(info, { parse_mode: "Markdown" });
```

Send any sticker/photo/file and the bot replies with its `file_id` — handy for reusing media in your bot (production sends should use `file_id` instead of URLs).

---

### 38. Coin Flip / Dice Game

**Commands:** `/flip`, `/roll`

```js
/* Command: /flip */
let result = Libs.random.randomBoolean() ? "🪙 Heads" : "🪙 Tails";
Bot.sendMessage(result);
```

```js
/* Command: /roll */
let n = Libs.random.randomInt(1, 6);
Bot.sendMessage(`🎲 You rolled a ${n}!`);

// Or use Telegram's animated dice:
// Api.sendDice({ chat_id: chat.id, emoji: "🎲" });
```

Tiny games using `Libs.random`. The commented line shows Telegram's native animated dice.

---

### 39. Password Hashing Demo (bcrypt)

**Commands:** `/setpass` (needs reply), `/checkpass` (needs reply)

```js
/* Command: /setpass  ·  Answer: "Send a password to store (hashed)."  ·  need_reply: true */
let hash = await modules.bcrypt.hash(message, 10);
User.set("pass_hash", hash, "String");
Bot.sendMessage("🔐 Password stored securely (hashed). Use /checkpass to verify.");
```

```js
/* Command: /checkpass  ·  Answer: "Send your password to verify."  ·  need_reply: true */
let hash = User.get("pass_hash");
if (!hash) return Bot.sendMessage("No password set yet. Use /setpass first.");

let match = await modules.bcrypt.compare(message, hash);
Bot.sendMessage(match ? "✅ Correct password!" : "❌ Wrong password.");
```

Demonstrates secure password storage: never store raw passwords — store the bcrypt hash and compare with `bcrypt.compare` (both are async, so `await`).

---

### 40. Global Error Handler

**Command:** `!`

```js
// `error` holds details about the runtime error that was thrown.
Bot.sendMessage("⚠️ Oops, something went wrong. Please try again.");

// Optional: notify the admin with details for debugging
Api.sendMessage({
  chat_id: 5723455420, // 🔴 your admin ID
  text: "🐞 Error: " + (error?.message || "unknown") + "\nUpdate type: " + update_type
});
```

The `!` command runs whenever a command throws a runtime error. Always define one in production so users see a friendly message instead of silence — and optionally log details to yourself.

---

## Bot API 10.1 — Rich Messages

> **Rich Messages** (Bot API **10.1**, June 11, 2026) let bots send highly structured, richly formatted content — headings, lists, tables, block quotes, math expressions, media blocks — and **stream** AI-generated replies that fill in progressively. TBL reaches them through `Api.call(...)`:
> - `sendRichMessage` — send a complete rich message.
> - `sendRichMessageDraft` — stream a partial rich message that you keep updating (great for LLM output).
> - `editMessageText` with a `rich_message` param — turn/replace a message with rich content.
>
> The simplest input form is `rich_message: { html: "<...>" }`, using rich HTML tags such as `<h1>`–`<h3>`, `<p>`, `<hr/>`, `<tg-math>` (inline math) and `<tg-math-block>` (block math), `<tg-emoji emoji-id="...">`, `<footer>`, etc. **Renders only on Telegram clients that support Bot API 10.1+.** Inside a TBL template string, remember to **escape backslashes** in LaTeX (`\\frac`, `\\sqrt`, …).

### 41. Rich Message: Mathematical Expressions

**Command:** handles a callback (e.g. `/richMath`) and edits the current message into a rich math page.

```js
const html = `
<h1>Mathematical Expressions</h1>

<p>This page demonstrates mathematical expressions introduced in Bot API 10.1.</p>

<hr/>

<h3>Inline Mathematical Expressions</h3>
<p><tg-math>x^2 + y^2 = z^2</tg-math></p>
<p><tg-math>E = mc^2</tg-math></p>
<p><tg-math>\\frac{a+b}{2}</tg-math></p>
<p><tg-math>\\sqrt{x}</tg-math></p>

<hr/>

<h3>Block Mathematical Expressions</h3>
<tg-math-block>x^2 + y^2 = z^2</tg-math-block>
<tg-math-block>E = mc^2</tg-math-block>
<tg-math-block>\\int_0^1 x^2\\,dx</tg-math-block>
<tg-math-block>\\sum_{n=1}^{10} n</tg-math-block>

<hr/>

<h3>Algebra Examples</h3>
<tg-math-block>x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}</tg-math-block>
<tg-math-block>(a+b)^2 = a^2 + 2ab + b^2</tg-math-block>

<hr/>

<h3>Calculus Examples</h3>
<tg-math-block>\\frac{d}{dx}(x^2)=2x</tg-math-block>
<tg-math-block>\\int x^2\\,dx = \\frac{x^3}{3}+C</tg-math-block>

<hr/>

<h3>Greek Symbols</h3>
<p><tg-math>\\alpha + \\beta = \\gamma</tg-math></p>
<p><tg-math>\\pi \\approx 3.14159</tg-math></p>
<p><tg-math>\\theta = 90^{\\circ}</tg-math></p>

<hr/>

<h3>Large Formula (Scrollable)</h3>
<p>Large formulas automatically become horizontally scrollable when needed.</p>
<tg-math-block>f(x)=a_0+\\sum_{n=1}^{50}\\left(a_n\\cos\\left(\\frac{2\\pi nx}{L}\\right)+b_n\\sin\\left(\\frac{2\\pi nx}{L}\\right)\\right)+\\frac{\\sqrt{x^4+2x^2+1}}{\\sqrt{x^8+x^4+1}}+\\prod_{k=1}^{20}\\left(1+\\frac{1}{k^2}\\right)</tg-math-block>

<footer>Bot API 10.1 • Mathematical Expressions Demo</footer>
`;

Api.call("editMessageText", {
  chat_id: chat.chatid,
  message_id: update.callback_query.message.message_id,
  rich_message: { html: html },
  reply_markup: {
    inline_keyboard: [
      [
        { text: "« Date & Time", callback_data: "/richDateTime" },
        { text: "Home", callback_data: "/start" },
        { text: "Layout »", callback_data: "/richLayout" }
      ]
    ]
  }
});
```

Edits the message the button belongs to into a rich math page. Note `\\frac`, `\\sqrt`, `\\int`, `\\sum`, `\\prod` — backslashes are doubled because this is a JS template string. `<tg-math>` is inline; `<tg-math-block>` is a centered block that becomes horizontally scrollable when too wide.

### 42. Send a Rich Message (`sendRichMessage`)

**Command:** `/rich`

```js
const html = `
<h1>📊 Weekly Report</h1>
<p>Here's your structured summary.</p>
<hr/>
<h3>Highlights</h3>
<ul>
  <li>Users grew by <b>12%</b></li>
  <li>Revenue: <tg-math>1200 \\times 1.12</tg-math></li>
</ul>
<blockquote>Great momentum — keep it up!</blockquote>
<footer>Generated by your bot • Bot API 10.1</footer>
`;

let res = await Api.call("sendRichMessage", {
  chat_id: chat.id,
  rich_message: { html: html }
});

if (!res.ok) Bot.sendMessage("This client may not support Rich Messages yet.");
```

Sends a brand-new rich message. `await` + `res.ok` lets you gracefully fall back for older clients.

### 43. Stream an AI Reply (`sendRichMessageDraft`)

**Command:** `/ask` (usage: `/ask explain gravity`)

```js
const prompt = params;
if (!prompt) return Bot.sendMessage("Usage: /ask <your question>");

// 1) Start a draft (a partial rich message that streams in)
let draft = await Api.call("sendRichMessageDraft", {
  chat_id: chat.id,
  rich_message: { html: "<p>✍️ Thinking…</p>" }
});

// 2) Call your LLM (example: OpenAI-compatible endpoint)
let ai = await HTTP.post({
  url: "https://api.openai.com/v1/chat/completions",
  headers: { Authorization: "Bearer " + process.env.OPENAI_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  })
});

let answer = ai.data?.choices?.[0]?.message?.content || "No answer.";

// 3) Replace the draft with the finished rich message
Api.call("editMessageText", {
  chat_id: chat.id,
  message_id: draft.result.message_id,
  rich_message: { html: "<h3>Answer</h3><p>" + answer + "</p>" }
});
```

`sendRichMessageDraft` posts a placeholder that streams; once your LLM responds, finalize it with `editMessageText` + `rich_message`. Store the API key in **ENV** (`process.env.OPENAI_KEY`), never inline.

### 44. Edit a Message into a Rich Message

**Command:** handles callback `/richLayout`

```js
const html = `
<h1>Layout Blocks</h1>
<h3>Lists</h3>
<ul><li>First</li><li>Second</li><li>Third</li></ul>
<h3>Quote</h3>
<blockquote>Telegram Rich Messages support structured blocks.</blockquote>
<hr/>
<footer>Bot API 10.1 • Layout Demo</footer>
`;

Api.call("editMessageText", {
  chat_id: chat.id,
  message_id: update.callback_query.message.message_id,
  rich_message: { html: html },
  reply_markup: {
    inline_keyboard: [[ { text: "« Back", callback_data: "/richMath" }, { text: "Home", callback_data: "/start" } ]]
  }
});

// Acknowledge the tap so the loading spinner stops
Api.answerCallbackQuery({ callback_query_id: update.callback_query.id });
```

Swaps a normal message for rich content in place, keeps a nav keyboard, and answers the callback query so the button stops spinning.

---

## TBL Sandbox & Core Mechanics

### 45. Variable Sharing via `@` (Combined Scope)

**Command:** `@` (Initialization)
```js
// Inside the Logic field of `@` command:
// Load shared configuration and cache user profile to avoid redundant database reads
const config = {
  maintenance: false,
  version: "2.1.0",
  adminId: 123456789
};

const userProfile = await db.user.get("profile") || { name: "Guest", role: "user" };
```

**Command:** `/status`
```js
// Inside the Logic field of `/status`:
// Variables config and userProfile declared in `@` are fully shared and accessible here!
if (config.maintenance && userProfile.role !== "admin") {
  Bot.sendMessage("⚠️ The bot is currently undergoing maintenance. Please try again later.");
  return;
}

Bot.sendMessage(
  `👤 <b>User:</b> ${userProfile.name}\n` +
  `🔑 <b>Role:</b> ${userProfile.role}\n` +
  `🤖 <b>Bot Version:</b> ${config.version}`,
  { parse_mode: "HTML" }
);
```

Shows how variables declared with `const` or `let` in the `@` command are automatically accessible in subsequent matched commands due to TBL's single concatenated execution block.

---

### 46. Advanced Answer Field (Conditional Languages)

**Command:** `/greet`

**Answer:**
```js
if (user.language_code == "es") {
  answer("¡Hola {{user.first_name}}! Bienvenido al bot. Su ID de usuario es {{user.id}}.");
} else if (user.language_code == "fr") {
  answer("Bonjour {{user.first_name}}! Bienvenue sur le bot. Votre identifiant est {{user.id}}.");
} else {
  answer("Hello {{user.first_name}}! Welcome to the bot. Your user ID is {{user.id}}.");
}
```

Demonstrates **Advanced JS-like Syntax Mode** in the **Answer** field. Writing `answer(` anywhere in the Answer field upgrades it to evaluate JS code with auto-escaping for placeholders.

---

### 47. Modern Asynchronous Database Storage (`db.user` & `db.bot`)

**Command:** `/balance`
```js
// NOTE: For existing bots, continue using User.get("balance") to avoid data loss.
// For new bots, use the modern db.user API below which supports up to 20MB-100MB of storage.
let balance = await db.user.get("balance", 0);
Bot.sendMessage(`💰 Your current balance is: <b>${balance}</b> credits.`, { parse_mode: "HTML" });
```

**Command:** `/earn`
```js
// Atomic increment prevents race conditions
let newBalance = await db.user.incr("balance", 50);
Bot.sendMessage(`🎉 You earned 50 credits! New balance: <b>${newBalance}</b>.`, { parse_mode: "HTML" });
```

Shows how to safely write and read asynchronously using the new plan-based `db` instance (isolated from deprecated `User` properties).

---

### 48. HTTP Streaming (Server-Sent Events / Live Logs)

**Command:** `/stream`
```js
Bot.sendMessage("⏳ Starting live stream connection...");

let res = await HTTP.get("https://api.example.com/live-events", {
  responseType: "stream",
  timeout: 15000
});

if (res.ok) {
  // Read chunk by chunk as they arrive in real-time
  for await (const chunk of res.stream) {
    Bot.sendMessage(`📡 Stream chunk: ${chunk}`);
    
    // Terminate stream connection early if stop condition met
    if (chunk.includes("CLOSE")) {
      await res.stream.cancel();
      break;
    }
  }
  Bot.sendMessage("✅ Stream completed.");
} else {
  Bot.sendMessage("❌ Failed to connect to stream.");
}
```

Queries external streaming sources chunk-by-chunk under plan stream lifetimes and timeout limits.

---

### 49. Secure Webhook with Expiration

**Command:** `/getlink`
```js
// Generate a cryptographically signed webhook link that is only valid for 10 minutes (600s)
let secureUrl = Webhook.getUrl("processCallback", {
  options: { transactionId: "tx_998877" },
  expiresIn: 600
});

Bot.sendMessage(`🔗 Click this link to confirm (expires in 10 mins):\n${secureUrl}`);
```

Generates a secure signed URL with auto-enforced `expires` signature checks that reject invalid/expired requests.

---

### 50. Custom HTML Render Endpoint (`res.render`)

**Command:** `profile.html` (is_web = 0, Webapp command)
```js
// Fetch data asynchronously from db
let profile = await db.user.get("profile") || { name: "Guest", wins: 0 };

// Render a template command named "profile_template.html" with custom options
res.render("profile_template.html", {
  data: {
    name: profile.name,
    wins: profile.wins
  }
});
```

Webapp command rendering another file template with contextual data payloads.

---

### 51. Economy Balance with ResourcesLibv2

**Command:** `/farm`
```js
// Access user's resource engine
let energy = Libs.ResourcesLibv2.userRes("energy");
let currentEnergy = await energy.value();

if (currentEnergy < 10) {
  Bot.sendMessage("❌ Not enough energy to farm. Energy auto-generates over time.");
  return;
}

// Subtract energy and add gold
await energy.add(-10);
let gold = Libs.ResourcesLibv2.userRes("gold");
await gold.add(100);

Bot.sendMessage(`🌾 You farmed the land!\n⚡ Energy: ${currentEnergy - 10}\n🪙 Gold: ${await gold.value()}`);
```

Modern economy logic powered by atomic increments of scoped resources inside `db.bot`.

---

> **More:** see `TBL-KNOWLEDGE-BASE.md` in this folder for the full language/API reference behind every example here.




