const api = typeof browser !== "undefined" ? browser : chrome;
const ENDPOINT = "http://127.0.0.1:8787/url";
const lastSent = new Map();
const pending = new Map();

function isYtmUrl(url) {
    return typeof url === "string" && url.startsWith("https://music.youtube.com/");
}

async function postUrl(tabId, url) {
    if (!isYtmUrl(url)) return;

    const prev = lastSent.get(tabId);
    if (prev === url) return;

    lastSent.set(tabId, url);

    try {
        await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({url}),
        });
    } catch (e) {
        console.warn("POST failed:", e && e.message ? e.message : e);
    }
}

function scheduleSend(tabId, url, delayMs = 200) {
    if (!isYtmUrl(url)) return;

    const old = pending.get(tabId);
    if (old) clearTimeout(old);

    const t = setTimeout(() => {
        pending.delete(tabId);
        postUrl(tabId, url);
    }, delayMs);

    pending.set(tabId, t);
}

api.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
        scheduleSend(details.tabId, details.url, 150);
    },
    {url: [{hostEquals: "music.youtube.com"}]}
);

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = changeInfo.url || (tab && tab.url);
    if (!url) return;

    if (changeInfo.status === "complete" || changeInfo.url) {
        scheduleSend(tabId, url, 150);
    }
});

api.tabs.onActivated.addListener(async ({tabId}) => {
    try {
        const tab = await api.tabs.get(tabId);
        if (tab && tab.url) scheduleSend(tabId, tab.url, 50);
    } catch {
    }
});

api.tabs.onRemoved.addListener((tabId) => {
    lastSent.delete(tabId);
    const t = pending.get(tabId);
    if (t) clearTimeout(t);
    pending.delete(tabId);
});
