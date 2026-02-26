// Script to fetch Deezer album art for all songs in songs.json
const fs = require("fs");
const path = require("path");

const SONGS_PATH = path.join(__dirname, "songs.json");

async function fetchCover(name, artist) {
    const query = encodeURIComponent(`${name} ${artist}`);
    const url = `https://api.deezer.com/search?q=${query}&limit=1`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
            const track = data.data[0];
            return {
                cover: track.album?.cover_medium || track.album?.cover_small || null,
                preview: track.preview || null,
            };
        }
    } catch (err) {
        console.warn(`  Failed for "${name}": ${err.message}`);
    }
    return { cover: null, preview: null };
}

async function main() {
    const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf-8"));
    console.log(`Fetching covers for ${songs.length} songs...\n`);

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        process.stdout.write(`[${i + 1}/${songs.length}] ${song.name} - ${song.artist}...`);
        const { cover, preview } = await fetchCover(song.name, song.artist);
        if (cover) {
            song.cover = cover;
            process.stdout.write(` cover found`);
        } else {
            process.stdout.write(` no cover`);
        }
        if (preview) {
            song.preview = preview;
            process.stdout.write(` preview found`);
        }
        console.log();
        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 300));
    }

    fs.writeFileSync(SONGS_PATH, JSON.stringify(songs, null, 4));
    console.log(`\nUpdated ${SONGS_PATH}`);
}

main();
