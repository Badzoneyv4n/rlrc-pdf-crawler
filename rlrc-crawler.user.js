// ==UserScript==
// @name         RLRC Rwanda Laws PDF Recursive Crawler
// @namespace    http://tampermonkey.net/
// @version      2025-07-17.5.2
// @description  Fully recursive downloader for RLRC Rwanda laws with modal + sound when complete ✅🔊📄🕷️
// @author       Badzone
// @match        https://www.rlrc.gov.rw/mandate/laws-of-rwanda?*
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const STACK_KEY = "nav_stack";
    const IGNORED_FOLDERS = ["Laws not in force"];

    const getBreadcrumb = () =>
        [...document.querySelectorAll("nav.breadcrumb li")]
            .map(li => li.textContent.trim())
            .join(" / ");

    const isPDFLink = (el) => {
        const link = el.querySelectorAll("a")[1];
        if (!link) return false;
        const name = link.textContent.trim();
        return el.querySelector("img[src*='pdf']") || name.includes("8.2.11");
    };

    async function loadStack() {
        const raw = await GM_getValue(STACK_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    async function saveStack(stack) {
        await GM_setValue(STACK_KEY, JSON.stringify(stack));
    }

    async function crawl() {
        console.log("📂 Crawling:", getBreadcrumb());

        const rows = [...document.querySelectorAll("table.table tbody tr")];
        const folders = [];
        const pdfs = [];

        for (let i = 1; i < rows.length; i++) { // Skip ".."
            const row = rows[i];
            const link = row.querySelectorAll("a")[1];
            if (!link) continue;

            const name = link.textContent.trim();
            const href = link.href;

            if (isPDFLink(row)) {
                pdfs.push({ name, url: href });
            } else {
                if (IGNORED_FOLDERS.includes(name)) {
                    console.log("⛔️ Skipping ignored folder:", name);
                    continue;
                }
                folders.push({ name, url: href });
            }
        }

        // Download all PDFs
        for (let pdf of pdfs) {
            console.log("📥 Downloading:", pdf.name);
            GM_download({
                url: pdf.url,
                name: pdf.name,
                onerror: e => console.error("❌ Error downloading:", pdf.name, e)
            });
            await delay(1500);
        }

        // Load and update navigation stack
        let stack = await loadStack();

        if (stack.length === 0) {
            // First entry
            stack.push({
                url: window.location.href,
                folders: folders,
                currentIndex: 0
            });
            await saveStack(stack);
        } else {
            // Update folders if we came back here
            let top = stack[stack.length - 1];
            if (top.url !== window.location.href) {
                // We've entered new folder, push
                stack.push({
                    url: window.location.href,
                    folders: folders,
                    currentIndex: 0
                });
                await saveStack(stack);
            }
        }

        // Now get the top level and go to next unvisited folder
        stack = await loadStack();
        let top = stack[stack.length - 1];

        if (top.currentIndex < top.folders.length) {
            const nextFolder = top.folders[top.currentIndex];
            top.currentIndex += 1;
            stack[stack.length - 1] = top;
            await saveStack(stack);

            console.log("➡️ Navigating into:", nextFolder.name);
            await delay(1500);
            window.location.href = nextFolder.url;
        } else {
            // All folders done here, go back
            console.log("🔙 Going back up a level");
            stack.pop();
            await saveStack(stack);
            if (stack.length > 0) {
                await delay(1500);
                window.location.href = stack[stack.length - 1].url;
            } else {
                console.log("✅ Done! All folders visited.");
                showCompletionModal(); // 👈 call modal
            }
        }
    }

    crawl();

    // === MODAL & SOUND ===
    function showCompletionModal() {
        const modal = document.createElement("div");
        const overlay = document.createElement("div");

        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.6);
            z-index: 9998;
        `;

        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            color: black;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 0 25px rgba(0,0,0,0.3);
            text-align: center;
            font-size: 18px;
            z-index: 9999;
            max-width: 400px;
        `;

        modal.innerHTML = `
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">✅ Done retrieving PDFs</div>
            <button id="close-modal-btn" style="margin-top: 15px; padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        document.getElementById("close-modal-btn").addEventListener("click", () => {
            modal.remove();
            overlay.remove();
        });

        playNotificationSound();
    }

    function playNotificationSound() {
        const audio = document.createElement("audio");
        audio.src = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
        audio.volume = 1;
        audio.autoplay = true;
        document.body.appendChild(audio);
    }
})();
