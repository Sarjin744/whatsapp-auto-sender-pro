# WhatsApp Auto-Sender Pro 🚀

An advanced, feature-rich Google Chrome Extension designed for WhatsApp Web. It provides automated message sending capabilities (both single-chat spamming and bulk sending to multiple phone numbers) integrated directly into the WhatsApp Web interface with a sleek dark glassmorphism GUI.

Includes built-in **anti-ban safety features** like Spintax, randomized delays, and configurable cooldown breaks to mimic human behavior and protect accounts from spam-detection filters.

---

## ✨ Features

- **Double Sending Modes**:
  - **Single Chat Mode:** Automates sending multiple messages to the currently open chat.
  - **Bulk Send Mode:** Accepts a list of numbers or CSV format (`phone,name`), automatically navigating between chats to deliver personalized messages.
- **Dynamic Personalization:** Use the `{name}` variable in bulk mode to automatically substitute the recipient's name (e.g., *"Hi {name}!"*).
- **Anti-Ban Safety Suite:**
  - **Spintax Support:** Randomizes message content using brackets (e.g., `Hello {buddy|friend|mate}!`) to avoid sending duplicate signatures.
  - **Randomized Delays:** Set a speed range (minimum/maximum delay) to trigger varying time spaces between messages.
  - **Smart Cooldowns:** Automatically pause operations for a specified duration after sending a configured block of messages (e.g., pause 60s after every 20 messages).
- **Background Execution:** Unlike Python GUI keyboard-simulators, this extension runs in the background. You can use your mouse and keyboard, open other apps, or switch tabs while it works.
- **Glassmorphism Terminal Console:** Sleek sliding control panel with a live logging console, status progress bars, and start/pause/stop functionality.

---

## 🛠️ Installation Guide

Loading the extension into Google Chrome takes under a minute:

1. Open **Google Chrome**.
2. Navigate to **`chrome://extensions/`** in the address bar.
3. Turn **ON** **"Developer mode"** in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select this folder (**`whatsapp-extension`**) from your directory.
6. Click **Select Folder**. The extension is now successfully installed!

---

## 📖 How to Use

1. Go to **[WhatsApp Web](https://web.whatsapp.com/)** and log in.
2. Look for the floating **Green Paper Plane button** in the top-right corner. Click it to open the control panel.
3. **Choose Mode:**
   - **Single Chat:** Type your message template and set the repeat count. Open a chat and click **Start**.
   - **Bulk Send:** Paste your list of numbers/names (one per line, e.g. `919876543210, John`). Write a message using `{name}` and click **Start** (the page will automatically navigate and process each contact).
4. Monitor active logs, counts, and estimated delays live in the **Activity Console**.

---

## 💡 Anti-Ban Best Practices

To safeguard your WhatsApp account from being flagged:
1. **Use Spintax:** Always define variations in your text. Identical messages sent in sequence are the #1 trigger for spam filters.
2. **Increase Delays:** Use a minimum delay of `0.5s` to `1.5s` or higher.
3. **Turn on Cooldowns:** For larger bulk lists (50+ numbers), configure a cooldown break of at least `60 seconds` for every `15-20` messages.
4. **Use Established Accounts:** Avoid running large campaigns on brand new SIM cards or recently activated WhatsApp accounts.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ⚖️ Legal Disclaimer

**Please read this carefully before usage:**

This tool is created for **educational purposes** and personal utility. It is not affiliated with, authorized, maintained, or endorsed by WhatsApp, Meta, or any of its affiliates. 

Automating messages on WhatsApp Web violates WhatsApp's Terms of Service. Usage of this extension may lead to temporary or permanent bans on your WhatsApp account. The developers take no responsibility for account bans, data losses, or any other damages resulting from using this software. **Use it at your own risk.**
