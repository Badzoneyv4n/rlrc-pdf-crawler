# 🕷️ RLRC Rwanda Laws PDF Crawler

This Tampermonkey-based automation script crawls the [Rwanda Law Reform Commission (RLRC)](https://www.rlrc.gov.rw/mandate/laws-of-rwanda) website and **automatically downloads all active law PDFs**.

It recursively navigates the site’s folder structure, skips deprecated sections (like "Laws not in force"), and downloads available PDFs one by one. Once complete, it shows a confirmation modal and plays a success sound.

> ✅ **Tested and working on Chrome (with Tampermonkey extension)**.  
> ⚠️ Keep the page in **focus** during the crawl — Chrome may pause background tabs and interrupt downloads.

---

## ✨ Features

- 🔁 Fully **recursive folder crawler**
- 📥 Auto-downloads every PDF found
- 🚫 **Skips ignored folders** like “Laws not in force”
- 📍 Uses breadcrumb + internal stack to **track navigation**
- ✅ Shows a **completion modal** on finish
- 🔔 Plays a **sound notification** when done
- 💾 Pure client-side script — no server or API needed

---

## ⚙️ How It Works

1. The script starts on the root RLRC laws page.
2. It:
   - Downloads all PDFs in the current folder
   - Stores subfolder links in a **stack**
   - Visits each folder one by one (depth-first)
   - Goes back after finishing each
3. When everything is done:
   - It plays a “ding” sound
   - Pops a “✅ Done retrieving PDFs” modal in the center of the screen

---

## 🚀 How To Use

### 1. Install Tampermonkey
Install [Tampermonkey](https://www.tampermonkey.net/) extension for your browser (Chrome recommended).

### 2. Add the Script
- Create a new Tampermonkey script
- Paste the contents of [`rlrc-crawler.user.js`](./rlrc-crawler.user.js)
- Save

### 3. Visit the Website
Go to:  
[`https://www.rlrc.gov.rw/mandate/laws-of-rwanda`](https://www.rlrc.gov.rw/mandate/laws-of-rwanda)

### 4. Let It Run
- It will begin crawling and downloading PDFs
- Keep the tab active (don’t switch tabs)
- On completion, a modal will appear and a sound will play

---

## 🛠 Configuration

You can update this array to skip more folders:

```js
const IGNORED_FOLDERS = ["Laws not in force"];
```

## 📁 File Structure
rlrc-pdf-crawler/
├── rlrc-crawler.user.js   # Tampermonkey script
├── README.md              # This file
└── LICENSE                # MIT license

## 🧪 Tested Environment
✅ Browser: Chrome v115+
✅ Extension: Tampermonkey v5+
✅ Site: https://www.rlrc.gov.rw/mandate/laws-of-rwanda
✅ Focus Requirement: ✔ Keep tab visible during crawl

## 🧠 Code Explanation (Simplified)

crawl(): Main function that handles folder parsing and navigation

GM_download(): Used to download each PDF

GM_setValue() / GM_getValue(): Keeps track of navigation stack

showCompletionModal(): Creates a centered popup on finish

playNotificationSound(): Plays a sound using a simple .ogg URL

The script acts like a recursive depth-first crawler inside the browser itself — no external libraries, no scraping needed, all native DOM traversal.

## 📄 License
MIT License — use it, remix it, profit from it — just credit Badzone 🔥
See [`LICENSE`](./LICENSE) for full details.

