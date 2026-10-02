# Telegram Message Helper (`msg`)

The `msg` object is automatically provided in bot commands and update handlers for incoming messages (`update.message`) and Telegram Business messages (`update.business_message`).

It contains **all native Telegram Message properties** (such as `msg.text`, `msg.chat`, `msg.from`, `msg.message_id`, `msg.photo`, etc.) plus high-level helper methods and short aliases for replying, editing, reacting, and inspecting messages.

All reply methods automatically route to the correct `chat_id`, target message (`reply_to_message_id`), forum topic (`message_thread_id`), and business connection (`business_connection_id`).

---

## Quick Reference Table

| Category | Method | Aliases | Description |
| :--- | :--- | :--- | :--- |
| **Send / Reply** | `msg.reply(text, [options])` | `r` | Send text reply |
| | `msg.replyPhoto(photo, [options])` | `photo` | Send photo reply |
| | `msg.replyVideo(video, [options])` | `video` | Send video reply |
| | `msg.replyAudio(audio, [options])` | `audio` | Send audio file reply |
| | `msg.replyVoice(voice, [options])` | `voice` | Send voice note reply |
| | `msg.replyDocument(document, [options])` | `document`, `doc` | Send document reply |
| | `msg.replySticker(sticker, [options])` | `sticker` | Send sticker reply |
| | `msg.replyAnimation(animation, [options])` | `animation`, `gif` | Send GIF/Animation reply |
| | `msg.replyLocation(lat, lon, [options])` | `location` | Send location reply |
| | `msg.replyVenue(lat, lon, title, addr)` | `venue` | Send venue reply |
| | `msg.replyContact(phone, firstName)` | `contact` | Send contact reply |
| | `msg.replyPoll(question, options)` | `poll` | Send poll / quiz reply |
| | `msg.replyDice([emoji], [options])` | `dice` | Send dice / animated emoji reply |
| | `msg.replyPaidMedia(stars, media)` | `paidMedia`, `replyPaid` | Send Telegram Stars paid media |
| | `msg.replyMediaGroup(media, [options])` | `mediaGroup`, `album` | Send photo/video album (2–10 items) |
| | `msg.replyRichMessage(richMessage)` | `rich`, `replyRich` | Send structured rich message |
| | `msg.replyDraft(text, [options])` | `draft`, `sendDraft` | Stream partial text draft |
| | `msg.replyRichDraft(richMessage)` | `richDraft` | Stream rich message draft |
| | `msg.replyInvoice(invoice)` | `invoice` | Send payment invoice reply |
| | `msg.replyGame(gameShortName)` | `game` | Send Telegram game reply |
| | `msg.replyChecklist(checklist)` | `checklist` | Send interactive business checklist |
| **Edit** | `msg.editText(text, [options])` | `edit` | Edit message text |
| | `msg.editRichText(richMessage)` | `editRich` | Edit message with rich text |
| | `msg.editCaption(caption, [options])` | `editCap`, `editCaptionText` | Edit media caption |
| | `msg.editMedia(media, [options])` | `editMessageMedia` | Edit media attached to message |
| | `msg.editReplyMarkup(markup)` | `editMarkup`, `editKeyboard` | Edit inline keyboard markup |
| | `msg.editChecklist(checklist)` | `editMessageChecklist` | Edit message checklist |
| | `msg.editLiveLocation(lat, lon)` | `editLocation` | Update live location |
| | `msg.stopLiveLocation([options])` | `stopLocation` | Stop live location stream |
| | `msg.stopPoll([options])` | `endPoll` | Stop active poll |
| **Reactions & Action** | `msg.react(emoji, [isBig])` | `reaction` | Add emoji reaction |
| | `msg.removeReaction([options])` | `unreact` | Remove reaction |
| | `msg.clearReactions([options])` | `deleteAllReactions`, `unreactAll` | Delete all reactions on message |
| | `msg.sendChatAction(action)` | `action`, `typing` | Send chat action (typing, upload_photo) |
| **Chat Management** | `msg.delete([messageId])` | `del`, `remove` | Delete message |
| | `msg.pin([disableNotification])` | - | Pin message in chat |
| | `msg.unpin([messageId])` | - | Unpin message in chat |
| | `msg.forward(toChatId, [options])` | `fwd`, `forwardTo` | Forward message to another chat |
| | `msg.copy(toChatId, [options])` | `cp`, `copyTo` | Copy message to another chat |
| | `msg.read([options])` | `markRead`, `markAsRead` | Mark business message as read |
| **Ephemeral Messages** | `msg.editEphemeralText(text)` | `editEphemeral` | Edit ephemeral message text |
| | `msg.editEphemeralCaption(caption)` | `editEphemeralCap` | Edit ephemeral media caption |
| | `msg.editEphemeralMedia(media)` | `editEphemeralMessageMedia` | Edit ephemeral media |
| | `msg.editEphemeralReplyMarkup(markup)` | `editEphemeralMarkup` | Edit ephemeral reply markup |
| | `msg.deleteEphemeral()` | `delEphemeral` | Delete ephemeral message |
| **Getters & Inspection** | `msg.getMessageId()` | `id`, `messageId` | Get message ID |
| | `msg.getChatId()` | `chatId` | Get chat ID |
| | `msg.getThreadId()` | `threadId`, `messageThreadId` | Get forum topic / thread ID |
| | `msg.isTopicMessage()` | `isTopic` | Check if inside a topic thread |
| | `msg.getBusinessConnectionId()` | `businessConnectionId` | Get business connection ID |
| | `msg.isBusiness()` | `isBusinessMessage` | Check if business message |
| | `msg.isEphemeral()` | `isEphemeralMessage` | Check if ephemeral message |
| | `msg.getReceiverUser()` | `receiverUser` | Get ephemeral receiver user |
| | `msg.getEphemeralMessageId()` | `ephemeralMessageId` | Get ephemeral message ID |
| | `msg.isGuest()` | `isGuestMessage` | Check if guest bot query |
| | `msg.getGuestQueryId()` | `guestQueryId` | Get guest query ID |
| | `msg.getSenderTag()` | `senderTag` | Get custom member / admin tag |
| | `msg.getText()` | - | Get text or caption string |
| | `msg.hasText()` | - | Check if text or caption exists |
| | `msg.hasMedia()` | - | Check if message has any media |
| | `msg.getMediaType()` | `mediaType` | Get media type name |
| | `msg.getMedia()` | - | Get attached media object/array |
| | `msg.isForwarded()` | `isForward` | Check if message was forwarded |
| | `msg.getReplyToMessage()` | `getReplyMessage`, `replyToMessage` | Get replied-to message object |
| | `msg.getReplyMessageId()` | `replyMessageId` | Get replied-to message ID |
| | `msg.getQuote()` | `quote` | Get quote object if replied with quote |

---

## Detailed Usage & Examples

### 1. Sending Replies

All reply methods automatically target the incoming message (`reply_to_message_id`), current chat (`chat_id`), forum topic (`message_thread_id`), and business connection (`business_connection_id`).

#### Text Reply
```js
// Standard syntax
await msg.reply('Hello there!');

// Short alias
await msg.r('Welcome to our bot!');

// With options (HTML, buttons)
await msg.r('Click below:', {
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [[{ text: 'Visit Website', url: 'https://example.com' }]]
  }
});

// Full options object
await msg.reply({
  text: '*Bold message*',
  parse_mode: 'MarkdownV2'
});
```

#### Media Replies (Photo, Video, Audio, Voice, Document, Sticker, GIF)
```js
// Send photo (file_id, URL, or local path)
await msg.replyPhoto('https://picsum.photos/400/300', { caption: 'Here is your photo' });
await msg.photo('AgACAgIAAxkBAAI...');

// Send video
await msg.replyVideo('https://example.com/video.mp4', { caption: 'Tutorial Video' });
await msg.video('BAACAgIAAxkBAAI...');

// Send audio
await msg.replyAudio('https://example.com/song.mp3', { performer: 'Artist', title: 'Song' });
await msg.audio('CQACAgIAAxkBAAI...');

// Send voice note
await msg.replyVoice('AwACAgIAAxkBAAI...', { caption: 'Listen to this' });
await msg.voice('AwACAgIAAxkBAAI...');

// Send document
await msg.replyDocument('https://example.com/file.pdf', { caption: 'Invoice PDF' });
await msg.doc('BQACAgIAAxkBAAI...');

// Send sticker
await msg.replySticker('CAACAgIAAxkBAAI...');
await msg.sticker('CAACAgIAAxkBAAI...');

// Send GIF / Animation
await msg.replyAnimation('https://media.giphy.com/media/xxx/giphy.gif');
await msg.gif('CgACAgIAAxkBAAI...');
```

#### Location, Venue & Contact
```js
// Send Location
await msg.replyLocation(37.7749, -122.4194);
await msg.location(40.7128, -74.0060);

// Send Venue
await msg.replyVenue(37.7749, -122.4194, 'Moscone Center', '747 Howard St, San Francisco');
await msg.venue(40.7128, -74.0060, 'Central Park', 'New York, NY');

// Send Contact
await msg.replyContact('+1234567890', 'John Doe');
await msg.contact('+1234567890', 'Jane', { last_name: 'Smith' });
```

#### Polls & Dice
```js
// Regular Poll
await msg.replyPoll('What is your favorite color?', ['Red', 'Blue', 'Green']);

// Quiz Poll
await msg.poll('What is 2 + 2?', ['3', '4', '5'], {
  type: 'quiz',
  correct_option_id: 1,
  explanation: 'Basic math!'
});

// Dice (defaults to 🎲)
await msg.replyDice();
await msg.dice('🎯'); // 🎯, 🏀, ⚽, 🎰, 🎳
```

#### Paid Media & Media Group (Albums)
```js
// Send Paid Media (Telegram Stars)
await msg.replyPaidMedia(10, [
  { type: 'photo', media: 'https://example.com/premium.jpg' }
]);
await msg.paidMedia(50, [
  { type: 'video', media: 'https://example.com/premium_video.mp4' }
]);

// Send Media Group (Album of 2-10 items)
await msg.replyMediaGroup([
  { type: 'photo', media: 'https://picsum.photos/400/300?1', caption: 'Photo 1' },
  { type: 'photo', media: 'https://picsum.photos/400/300?2' }
]);
await msg.album([
  { type: 'video', media: 'https://example.com/v1.mp4' },
  { type: 'video', media: 'https://example.com/v2.mp4' }
]);
```

#### Rich Messages & AI Streaming Drafts
```js
// Send Rich Message
await msg.replyRichMessage({
  blocks: [
    { type: 'section_heading', text: 'Welcome' },
    { type: 'paragraph', text: 'This is a rich message format.' }
  ]
});
await msg.rich({ blocks: [...] });

// Stream partial text draft
await msg.replyDraft('Thinking...');
await msg.draft('Generating answer...', { draft_id: 1 });

// Stream rich message draft
await msg.replyRichDraft({ blocks: [...] });
await msg.richDraft({ blocks: [...] });
```

---

### 2. Editing & Modifying Messages

```js
// Edit text of current message
await msg.editText('New updated text');
await msg.edit('Updated text with Markdown', { parse_mode: 'Markdown' });

// Edit rich text
await msg.editRichText({ blocks: [...] });
await msg.editRich({ blocks: [...] });

// Edit media caption
await msg.editCaption('New caption here');
await msg.editCap('New caption with buttons', {
  reply_markup: {
    inline_keyboard: [[{ text: 'Next', callback_data: 'next' }]]
  }
});

// Edit media
await msg.editMedia({
  type: 'photo',
  media: 'https://picsum.photos/400/300?new'
});

// Edit Inline Keyboard Markup
await msg.editReplyMarkup({
  inline_keyboard: [
    [{ text: 'Option A', callback_data: 'opt_a' }],
    [{ text: 'Option B', callback_data: 'opt_b' }]
  ]
});
await msg.editKeyboard({ inline_keyboard: [...] });

// Stop Live Location & Polls
await msg.stopLiveLocation();
await msg.stopPoll();
```

---

### 3. Reactions & Chat Actions

```js
// Add emoji reaction
await msg.react('👍');
await msg.react('🔥', true); // isBig = true (large animated reaction)
await msg.reaction('❤️');

// Remove bot reaction
await msg.removeReaction();
await msg.unreact();

// Clear all reactions on message
await msg.clearReactions();
await msg.deleteAllReactions();

// Send Chat Action (typing indicator / upload indicator)
await msg.sendChatAction('typing');
await msg.action('upload_photo');
await msg.typing(); // alias for sendChatAction('typing')
```

---

### 4. Chat Operations & Management

```js
// Delete current message
await msg.delete();
await msg.del();

// Delete a specific message by ID
await msg.delete(12345);

// Pin message
await msg.pin(); // notifies chat
await msg.pin(true); // silent pin (disableNotification = true)

// Unpin message
await msg.unpin();

// Forward message to another chat
await msg.forward('@target_channel');
await msg.fwd(123456789);

// Copy message to another chat
await msg.copy('@target_channel');
await msg.cp(123456789, { caption: 'Copied with new caption' });

// Mark business message as read (Business bots only)
if (msg.isBusiness()) {
  await msg.read();
  await msg.markRead();
}
```

---

### 5. Ephemeral Messages

```js
// Edit ephemeral text
await msg.editEphemeralText('Updated ephemeral text');
await msg.editEphemeral('New text');

// Edit ephemeral caption
await msg.editEphemeralCaption('New ephemeral caption');

// Edit ephemeral media
await msg.editEphemeralMedia({ type: 'photo', media: 'https://picsum.photos/400/300' });

// Edit ephemeral markup
await msg.editEphemeralReplyMarkup({ inline_keyboard: [...] });

// Delete ephemeral message
await msg.deleteEphemeral();
```

---

### 6. Message Inspection & Helper Methods

```js
// Identity & Context
const msgId = msg.getMessageId();         // e.g. 42
const chatId = msg.getChatId();           // e.g. 100200300
const threadId = msg.getThreadId();       // topic thread ID (or null)
const isTopic = msg.isTopicMessage();     // true if message is in forum topic

// Business & Ephemeral
const isBiz = msg.isBusiness();           // true if Telegram Business message
const bizId = msg.getBusinessConnectionId();
const isEphem = msg.isEphemeral();        // true if ephemeral
const recUser = msg.getReceiverUser();    // User object of receiver
const ephemId = msg.getEphemeralMessageId();

// Guest Mode & Admin Tag
const isGuest = msg.isGuest();            // true if guest mode query
const guestId = msg.getGuestQueryId();
const senderTag = msg.getSenderTag();     // custom admin tag

// Text & Media Content
const text = msg.getText();               // returns text OR caption
const hasText = msg.hasText();            // boolean
const hasMedia = msg.hasMedia();          // true if photo, video, doc, voice, etc.
const mediaType = msg.getMediaType();     // 'photo', 'video', 'document', etc.
const mediaObj = msg.getMedia();          // returns raw photo/video/doc data

// Forward & Reply Context
const isForward = msg.isForwarded();      // boolean
const replyMsg = msg.getReplyToMessage(); // replied message object (or null)
const replyId = msg.getReplyMessageId();  // replied message ID (or null)
const quote = msg.getQuote();             // quote object if quote reply
```
