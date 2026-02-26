import { RADIO_PRESETS, SHELF_PRESETS, PROFILE_STICKERS } from "./params.js";
import { navigateTo, onPopState, encodeRoomToURL, decodeRoomFromURL } from "./router.js";
import {
    state,
    setPage,
    startNewPlaylist,
    commitDraft,
    addSongToDraft,
    removeSongFromDraft,
    setBgColor,
    setBgImage,
    setProfile,
    setRadioColors,
    setFrame,
    setShelfColor,
    setShelfInterior,
    setShelfOutline,
    setShelfPlank,
    toggleShelfObject,
    toggleProfileSticker,
    hydrateState,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
} from "./state.js";
import {
    renderPage,
    renderRoom,
    renderPlaylistColorGrid,
    renderBgColorGrid,
    renderSongSearch,
    renderEditPlaylist,
    updateWizardLabels,
    updateWizardColor,
    renderRadioCustomizer,
    renderFramePicker,
    renderShelfCustomizer,
    renderBgPicker,
} from "./render.js";

// ─── Song library (loaded from songs.json) ─────────────────────────────────────
let SONG_LIBRARY = [];

async function loadSongs() {
    try {
        const res = await fetch("./songs.json");
        SONG_LIBRARY = await res.json();
    } catch (e) {
        console.warn("Could not load songs.json, using fallback", e);
        SONG_LIBRARY = [
            { id: "s1", name: "Espresso", artist: "Sabrina Carpenter", color: "#d4a474" },
            { id: "s2", name: "APT.", artist: "ROSÉ & Bruno Mars", color: "#f4a0b8" },
            { id: "s3", name: "Birds of a Feather", artist: "Billie Eilish", color: "#a0d4f4" },
        ];
    }
}

// ─── Audio playback (fetches fresh Deezer preview on each play) ───────────────
let audioPlayer = null;

async function fetchFreshPreviewUrl(songName, artist) {
    try {
        const query = encodeURIComponent(`${songName} ${artist}`);
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://api.deezer.com/search?q=${query}&limit=1`)}`);
        const data = await res.json();
        if (data.data && data.data.length > 0 && data.data[0].preview) {
            return data.data[0].preview;
        }
    } catch (err) {
        console.warn("Fresh preview fetch failed:", err);
    }
    return null;
}

async function startPlayback(song) {
    stopPlayback();
    // Try fresh URL first, fall back to stored
    let previewUrl = await fetchFreshPreviewUrl(song.name, song.artist);
    if (!previewUrl) previewUrl = song.preview;
    if (previewUrl) {
        audioPlayer = new Audio(previewUrl);
        audioPlayer.volume = 0.5;
        audioPlayer.play().catch(() => { });
        audioPlayer.addEventListener("ended", () => {
            playNext();
            updatePlaybackUI();
        });
    }
}

function stopPlayback() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
        audioPlayer = null;
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function goTo(page) {
    const safe = navigateTo(page);
    setPage(safe);
    renderAll();
}

function renderAll() {
    renderPage(state.page);
    if (state.draft && state.draft.color) {
        updateWizardColor(state.draft.color);
    }

    if (state.page === "room") {
        renderRoom();
    } else if (state.page === "playlist-color") {
        renderPlaylistColorGrid(state.draft?.color ?? "#f4a0a0");
    } else if (state.page === "playlist-songs") {
        renderSongSearch("", SONG_LIBRARY);
        renderEditPlaylist();
    } else if (state.page === "bg-picker") {
        renderBgPicker();
    } else if (state.page === "radio-picker") {
        renderRadioCustomizer();
    } else if (state.page === "frame-picker") {
        renderFramePicker();
    } else if (state.page === "shelf-picker") {
        renderShelfCustomizer();
    }
    updatePlaybackUI();
}

// ─── Playback UI updates ───────────────────────────────────────────────────────
let currentlyPlayingSongId = null;

function updatePlaybackUI() {
    const song = state.player.currentSong;
    const isPlaying = state.player.isPlaying;

    const npSong = document.getElementById("now-playing-song");
    const npArtist = document.getElementById("now-playing-artist");
    if (npSong) npSong.textContent = song ? song.name : "No song playing";
    if (npArtist) npArtist.textContent = song ? song.artist : "";

    const pbBtn = document.getElementById("btn-play-pause");
    if (pbBtn) pbBtn.textContent = isPlaying ? "⏸" : "▶";

    // Handle audio — restart if song changed, pause/resume if same song
    if (song && isPlaying) {
        if (currentlyPlayingSongId !== song.id) {
            // New song — start fresh
            currentlyPlayingSongId = song.id;
            startPlayback(song);
        } else if (audioPlayer && audioPlayer.paused) {
            // Same song, was paused — resume
            audioPlayer.play().catch(() => { });
        }
    } else if (song && !isPlaying) {
        // Paused
        if (audioPlayer) audioPlayer.pause();
    } else {
        stopPlayback();
        currentlyPlayingSongId = null;
    }

    // Toggle speaker animation
    const boombox = document.querySelector(".boombox-wrapper");
    if (boombox) {
        if (song && isPlaying) {
            boombox.classList.add("playing");
        } else {
            boombox.classList.remove("playing");
        }
    }
}

// ─── Apply radio colors live ───────────────────────────────────────────────────
function applyRadioColors() {
    const boombox = document.getElementById("boombox");
    if (!boombox) return;
    boombox.style.setProperty("--radio-body", state.radioColors.body);
    boombox.style.setProperty("--radio-speaker", state.radioColors.speaker);
    boombox.style.setProperty("--radio-handle", state.radioColors.handle);
    boombox.style.setProperty("--radio-buttons", state.radioColors.buttons);
    boombox.style.setProperty("--radio-detail", state.radioColors.detail);
}

// ─── Playlist viewer ──────────────────────────────────────────────────────────
function openPlaylistViewer(playlistIndex) {
    const pl = state.playlists[playlistIndex];
    if (!pl) return;

    const viewer = document.getElementById("playlist-viewer");
    const title = document.getElementById("playlist-viewer-title");
    const songsList = document.getElementById("playlist-viewer-songs");
    if (!viewer || !title || !songsList) return;

    title.textContent = pl.name;
    title.style.color = pl.color;

    if (!pl.songs.length) {
        songsList.innerHTML = `<div class="viewer-empty">No songs in this playlist yet</div>`;
    } else {
        songsList.innerHTML = pl.songs.map((song, si) => `
            <div class="viewer-song" data-viewer-play-pl="${playlistIndex}" data-viewer-play-si="${si}">
                <div class="viewer-song-color" style="${song.cover ? `background-image:url(${song.cover});background-size:cover;background-position:center` : `background:${song.color || pl.color}`}"></div>
                <div class="viewer-song-info">
                    <div class="viewer-song-name">${song.name}</div>
                    <div class="viewer-song-artist">${song.artist}</div>
                </div>
                <button class="viewer-song-play" title="Play">▶</button>
            </div>
        `).join("");
    }

    viewer.hidden = false;
}

// ─── Inline profile editing ────────────────────────────────────────────────────
function startEditingField(el) {
    const field = el.dataset.profileField;
    const currentValue = state.profile[field] || "";
    const placeholder = el.dataset.placeholder || "";

    if (field === "bio") {
        const textarea = document.createElement("textarea");
        textarea.className = "profile-field-editing";
        textarea.value = currentValue;
        textarea.placeholder = placeholder;
        textarea.rows = 2;
        textarea.style.resize = "none";
        el.replaceWith(textarea);
        textarea.focus();

        textarea.addEventListener("blur", () => {
            setProfile({ [field]: textarea.value });
            const newEl = document.createElement("div");
            newEl.className = el.className;
            newEl.id = el.id;
            newEl.dataset.profileField = field;
            newEl.dataset.placeholder = placeholder;
            newEl.textContent = textarea.value || placeholder;
            textarea.replaceWith(newEl);
        });
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "profile-field-editing";
        input.value = currentValue;
        input.placeholder = placeholder;
        el.replaceWith(input);
        input.focus();

        const doBlur = () => {
            setProfile({ [field]: input.value });
            const newEl = document.createElement("div");
            newEl.className = el.className;
            newEl.id = el.id;
            newEl.dataset.profileField = field;
            newEl.dataset.placeholder = placeholder;
            newEl.textContent = input.value || placeholder;
            input.replaceWith(newEl);
        };

        input.addEventListener("blur", doBlur);
        input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") input.blur();
        });
    }
}

// ─── Draggable sticker logic ──────────────────────────────────────────────────
let draggingSticker = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function initStickerDrag() {
    const canvas = document.getElementById("stickers-canvas");
    if (!canvas) return;

    canvas.addEventListener("pointerdown", (e) => {
        const sticker = e.target.closest(".placed-sticker");
        if (!sticker) return;
        e.preventDefault();
        sticker.setPointerCapture(e.pointerId);
        draggingSticker = sticker;
        const rect = sticker.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!draggingSticker) return;
        e.preventDefault();
        const canvasRect = canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left - dragOffsetX;
        const y = e.clientY - canvasRect.top - dragOffsetY;
        draggingSticker.style.left = `${x}px`;
        draggingSticker.style.top = `${y}px`;
    });

    canvas.addEventListener("pointerup", (e) => {
        if (!draggingSticker) return;
        const index = parseInt(draggingSticker.dataset.stickerIndex, 10);
        const canvasRect = canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left - dragOffsetX;
        const y = e.clientY - canvasRect.top - dragOffsetY;

        // Update state
        if (state.placedStickers && state.placedStickers[index]) {
            state.placedStickers[index].x = Math.max(0, x);
            state.placedStickers[index].y = Math.max(0, y);
        }
        draggingSticker = null;
    });
}

// ─── Global click delegation ───────────────────────────────────────────────────
document.addEventListener("click", (e) => {

    // ── Nav buttons ───────────────────────────────────────────────────────────
    const navEl = e.target.closest("[data-nav]");
    if (navEl) {
        e.preventDefault();
        const target = navEl.dataset.nav;
        if (target === "playlist-name") {
            startNewPlaylist();
            updateWizardLabels("New Playlist");
            goTo("playlist-name");
            return;
        }
        goTo(target);
        return;
    }

    // ── Playback controls ─────────────────────────────────────────────────────
    if (e.target.id === "btn-play-pause" || e.target.closest("#btn-play-pause")) {
        e.stopPropagation();
        togglePlayPause();
        updatePlaybackUI();
        return;
    }

    if (e.target.id === "btn-next" || e.target.closest("#btn-next")) {
        e.stopPropagation();
        playNext();
        updatePlaybackUI();
        return;
    }

    if (e.target.id === "btn-prev" || e.target.closest("#btn-prev")) {
        e.stopPropagation();
        playPrev();
        updatePlaybackUI();
        return;
    }

    // ── Playlist viewer — play a song ─────────────────────────────────────────
    const viewerSong = e.target.closest("[data-viewer-play-pl]");
    if (viewerSong) {
        const pi = parseInt(viewerSong.dataset.viewerPlayPl, 10);
        const si = parseInt(viewerSong.dataset.viewerPlaySi, 10);
        const pl = state.playlists[pi];
        if (pl && pl.songs[si]) {
            playSong(pl.songs[si], pi, si);
            updatePlaybackUI();
        }
        return;
    }

    // ── Close playlist viewer ─────────────────────────────────────────────────
    if (e.target.id === "btn-close-viewer" || e.target.id === "playlist-viewer") {
        const viewer = document.getElementById("playlist-viewer");
        if (viewer) viewer.hidden = true;
        return;
    }

    // ── Share button ──────────────────────────────────────────────────────────
    if (e.target.id === "btn-share" || e.target.closest("#btn-share")) {
        const url = encodeRoomToURL(state);
        const shareInput = document.getElementById("share-url-input");
        const modal = document.getElementById("share-modal");
        if (shareInput) shareInput.value = url;
        if (modal) modal.hidden = false;
        return;
    }

    // ── Floating Edit Menu Toggle ─────────────────────────────────────────────
    if (e.target.id === "btn-edit-toggle" || e.target.closest("#btn-edit-toggle")) {
        const menuItems = document.getElementById("edit-menu-items");
        if (menuItems) menuItems.classList.toggle("hidden");
        return;
    }

    // Close edit menu on outside click
    const editMenu = document.getElementById("edit-menu");
    const menuItemsObj = document.getElementById("edit-menu-items");
    if (editMenu && menuItemsObj && !editMenu.contains(e.target)) {
        menuItemsObj.classList.add("hidden");
    }

    // ── Copy share URL ────────────────────────────────────────────────────────
    if (e.target.id === "btn-copy-share" || e.target.closest("#btn-copy-share")) {
        const shareInput = document.getElementById("share-url-input");
        if (shareInput) {
            navigator.clipboard.writeText(shareInput.value).then(() => {
                const btn = document.getElementById("btn-copy-share");
                if (btn) {
                    btn.textContent = "✅ Copied!";
                    setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
                }
            });
        }
        return;
    }

    // ── Close share modal ─────────────────────────────────────────────────────
    if (e.target.id === "btn-close-share" || e.target.id === "share-modal") {
        const modal = document.getElementById("share-modal");
        if (modal) modal.hidden = true;
        return;
    }

    // ── Customize radio ───────────────────────────────────────────────────────
    if (e.target.id === "btn-customize-radio" || e.target.closest("#btn-customize-radio")) {
        e.stopPropagation();
        goTo("radio-picker");
        return;
    }

    // ── Radio presets ─────────────────────────────────────────────────────────
    const presetChip = e.target.closest("[data-preset-index]");
    if (presetChip) {
        const idx = parseInt(presetChip.dataset.presetIndex, 10);
        const preset = RADIO_PRESETS[idx];
        if (preset) {
            setRadioColors({
                body: preset.body,
                speaker: preset.speaker,
                handle: preset.handle,
                buttons: preset.buttons,
                detail: preset.detail,
            });
            renderRadioCustomizer();
            applyRadioColors();
        }
        return;
    }

    // ── Add playlist ──────────────────────────────────────────────────────────
    if (e.target.id === "btn-add-playlist" || e.target.closest("#btn-add-playlist")) {
        startNewPlaylist();
        updateWizardLabels("New Playlist");
        goTo("playlist-name");
        return;
    }

    // ── Playlist spine → viewer ───────────────────────────────────────────────
    const spine = e.target.closest(".playlist-spine");
    if (spine && spine.dataset.playlistIndex !== undefined) {
        openPlaylistViewer(parseInt(spine.dataset.playlistIndex, 10));
        return;
    }

    // ── Wizard steps ──────────────────────────────────────────────────────────
    if (e.target.id === "btn-name-next") {
        const nameInput = document.getElementById("input-playlist-name");
        const name = nameInput?.value.trim() || "New Playlist";
        if (state.draft) state.draft.name = name;
        updateWizardLabels(name);
        goTo("playlist-color");
        return;
    }

    const colorSwatch = e.target.closest("[data-playlist-color]");
    if (colorSwatch) {
        const color = colorSwatch.dataset.playlistColor;
        if (state.draft) state.draft.color = color;
        renderPlaylistColorGrid(color);
        const sidebar = document.getElementById("wizard-color-label");
        if (sidebar) sidebar.style.background = color;
        return;
    }

    if (e.target.id === "btn-color-next") {
        goTo("playlist-songs");
        return;
    }

    const addSongBtn = e.target.closest("[data-song-id]");
    if (addSongBtn) {
        const songId = addSongBtn.dataset.songId;
        const song = SONG_LIBRARY.find((s) => s.id === songId);
        if (song) {
            addSongToDraft(song);
            renderEditPlaylist();
        }
        return;
    }

    const removeSongBtn = e.target.closest("[data-remove-song-id]");
    if (removeSongBtn) {
        removeSongFromDraft(removeSongBtn.dataset.removeSongId);
        renderEditPlaylist();
        return;
    }

    if (e.target.id === "btn-songs-done") {
        commitDraft();
        goTo("room");
        return;
    }

    // ── BG colour swatch ──────────────────────────────────────────────────────
    const bgSwatch = e.target.closest("[data-bg-color]");
    if (bgSwatch) {
        setBgColor(bgSwatch.dataset.bgColor);
        renderBgColorGrid(state.bgColor);
        document.body.style.background = state.bgColor;
        return;
    }

    // ── Poster area click → upload poster image ───────────────────────────────
    if (e.target.id === "poster-area" || e.target.closest("#poster-area")) {
        document.getElementById("poster-input")?.click();
        return;
    }

    // ── Profile photo ─────────────────────────────────────────────────────────
    if (e.target.id === "profile-photo-btn" || e.target.closest("#profile-photo-btn")) {
        document.getElementById("profile-photo-input")?.click();
        return;
    }

    // ── Profile field inline edit ─────────────────────────────────────────────
    const profileField = e.target.closest("[data-profile-field]");
    if (profileField && profileField.tagName !== "INPUT" && profileField.tagName !== "TEXTAREA") {
        startEditingField(profileField);
        return;
    }

    // ── Frame picker ──────────────────────────────────────────────────────────
    if (e.target.id === "btn-change-frame" || e.target.closest("#btn-change-frame")) {
        goTo("frame-picker");
        return;
    }

    const frameCard = e.target.closest("[data-frame-index]");
    if (frameCard) {
        setFrame(parseInt(frameCard.dataset.frameIndex, 10));
        renderFramePicker();
        return;
    }


    // ── Shelf object picker ───────────────────────────────────────────────────
    const shelfObjCard = e.target.closest("[data-shelf-object]");
    if (shelfObjCard) {
        toggleShelfObject(shelfObjCard.dataset.shelfObject);
        renderShelfCustomizer();
        return;
    }

    // ── Shelf presets ─────────────────────────────────────────────────────────
    const shelfPresetChip = e.target.closest("[data-shelf-preset-index]");
    if (shelfPresetChip) {
        const idx = parseInt(shelfPresetChip.dataset.shelfPresetIndex, 10);
        const preset = SHELF_PRESETS[idx];
        if (preset) {
            setShelfColor(preset.wood);
            setShelfInterior(preset.interior);
            setShelfOutline(preset.outline);
            setShelfPlank(preset.plank);
            renderShelfCustomizer();
        }
        return;
    }

    // ── Sticker picker — add sticker to room at default position ──────────────
    const stickerCard = e.target.closest("[data-add-sticker]");
    if (stickerCard) {
        const stickerId = stickerCard.dataset.addSticker;
        // Initialize placedStickers if needed
        if (!state.placedStickers) state.placedStickers = [];
        // Place sticker at a random position in the upper portion of the room
        const x = 150 + Math.random() * 400;
        const y = 50 + Math.random() * 200;
        state.placedStickers.push({ id: stickerId, x, y });
        // Re-render sticker picker to show feedback (optional: could add visual feedback)
        return;
    }

    // ── Double-click sticker to remove ────────────────────────────────────────
    // (handled via dblclick below)
});

// ── Double-click to remove stickers ───────────────────────────────────────────
document.addEventListener("dblclick", (e) => {
    const sticker = e.target.closest(".placed-sticker");
    if (sticker && state.placedStickers) {
        const index = parseInt(sticker.dataset.stickerIndex, 10);
        state.placedStickers.splice(index, 1);
        renderRoom();
    }
});

// ─── Input events ─────────────────────────────────────────────────────────────
document.addEventListener("input", (e) => {
    if (e.target.id === "input-playlist-name") {
        const name = e.target.value || "New Playlist";
        if (state.draft) state.draft.name = name;
        updateWizardLabels(name);
        return;
    }

    if (e.target.id === "song-search-input") {
        renderSongSearch(e.target.value, SONG_LIBRARY);
        return;
    }

    // Radio color inputs
    const colorMap = {
        "radio-color-body": "body",
        "radio-color-speaker": "speaker",
        "radio-color-handle": "handle",
        "radio-color-buttons": "buttons",
        "radio-color-detail": "detail",
    };
    if (colorMap[e.target.id]) {
        setRadioColors({ [colorMap[e.target.id]]: e.target.value });
        applyRadioColors();
        return;
    }

    // Shelf color inputs
    if (e.target.id === "shelf-color-main") {
        setShelfColor(e.target.value);
        renderRoom();
        return;
    }
    if (e.target.id === "shelf-color-interior") {
        setShelfInterior(e.target.value);
        renderRoom();
        return;
    }
    if (e.target.id === "shelf-color-outline") {
        setShelfOutline(e.target.value);
        renderRoom();
        return;
    }
    if (e.target.id === "shelf-color-plank") {
        setShelfPlank(e.target.value);
        renderRoom();
        return;
    }
});

// ─── File inputs ───────────────────────────────────────────────────────────────
document.getElementById("bg-image-input")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        setBgImage(ev.target.result);
        document.body.style.background = `url(${ev.target.result}) center/cover no-repeat`;
    };
    reader.readAsDataURL(file);
});

document.getElementById("poster-input")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.posterImage = ev.target.result;
        const area = document.getElementById("poster-area");
        if (area) {
            area.style.backgroundImage = `url(${ev.target.result})`;
            area.style.backgroundSize = "cover";
            area.style.backgroundPosition = "center";
            const span = area.querySelector("span");
            if (span) span.style.display = "none";
        }
    };
    reader.readAsDataURL(file);
});

document.getElementById("profile-photo-input")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const slot = document.getElementById("profile-photo-btn");
        if (slot) {
            slot.style.backgroundImage = `url(${ev.target.result})`;
            slot.style.backgroundSize = "cover";
            slot.style.backgroundPosition = "center";
            slot.innerHTML = "";
        }
        setProfile({ photo: ev.target.result });
    };
    reader.readAsDataURL(file);
});

// ─── Pop state ─────────────────────────────────────────────────────────────────
onPopState(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(params.get("page") ?? "room");
    renderAll();
});

// ─── Boot ──────────────────────────────────────────────────────────────────────
async function init() {
    await loadSongs();

    const shared = decodeRoomFromURL();
    if (shared) hydrateState(shared);

    // Initialize placedStickers array if not present
    if (!state.placedStickers) state.placedStickers = [];

    setPage("room");
    renderAll();

    // Set up sticker drag after DOM is ready
    initStickerDrag();
}

init();
