import express from "express";
import fs from "fs";
import cors from "cors";
import YTMusic from "ytmusic-api";

const app = express();
const ytm = new YTMusic();

app.use(express.json());
app.use(cors({origin: true, credentials: false}));
app.use((req, res, next) => {
    if (req.method === "OPTIONS") return res.sendStatus(204);

    next();
});

// GET /test
app.get("/test", (req, res) => res.send("fiu"));

// POST /url
app.post("/url", async (req, res) => {
    await ytm.initialize();

    const {url} = req.body || {};
    const videoId = new URL(url).searchParams.get("v");
    const vData = await ytm.getSong(videoId);

    const title = vData.name + ' - ' + vData.artist.name;
    const lyrics = await ytm.getLyrics(videoId);
    const path = "lyrics/" + title + ".txt";

    const md = `# ${title}

![thumbnail](${vData.thumbnails[1].url})
    
### Lyrics
${lyrics.map(i => ">" + i).join("\\\n")}
    `;

    fs.writeFileSync("markdown/" + title + ".md", md);
    fs.writeFileSync(path, lyrics.join('\n'));
    res.json({ok: true});
});

app.listen(8787, () => {
    console.log("Listening on :8787");
});
