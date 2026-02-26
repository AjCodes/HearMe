import { SWATCH_COLORS, BG_COLORS, FRAME_IMAGES, RADIO_PRESETS, MASCOT_GIFS, SHELF_PRESETS, PROFILE_STICKERS } from "./params.js";
import { state } from "./state.js";

// ─── Page visibility ──────────────────────────────────────────────────────────
const ALL_PAGES = [
    "room", "playlist-name", "playlist-color", "playlist-songs",
    "bg-picker", "radio-picker", "frame-picker", "shelf-picker",
];

export function renderPage(page) {
    ALL_PAGES.forEach((id) => {
        const el = document.getElementById(`page-${id}`);
        if (!el) return;
        el.hidden = id !== page;
        el.style.display = id === page ? "" : "none";
    });
    window.scrollTo({ top: 0, behavior: "instant" });
}

// ─── Room view ────────────────────────────────────────────────────────────────
export function renderRoom() {
    // Background
    document.body.style.background =
        state.bgImage
            ? `url(${state.bgImage}) center/cover no-repeat`
            : state.bgColor;

    // Shelf
    renderShelf();

    // Profile board
    const nameEl = document.getElementById("profile-name-display");
    const genreEl = document.getElementById("profile-genre-display");
    const bioEl = document.getElementById("profile-bio-display");
    if (nameEl) nameEl.textContent = state.profile.name || "Name";
    if (genreEl) genreEl.textContent = state.profile.genre || "Favourite genre";
    if (bioEl) bioEl.textContent = state.profile.bio || "Bio";

    // Frame image
    const frameImg = document.getElementById("profile-frame-img");
    if (frameImg) {
        const frameFile = FRAME_IMAGES[state.profile.frame] || FRAME_IMAGES[0];
        frameImg.src = `./photos/frames/${frameFile}`;
    }

    // Profile photo
    const photoSlot = document.getElementById("profile-photo-btn");
    if (photoSlot && state.profile.photo) {
        photoSlot.style.backgroundImage = `url(${state.profile.photo})`;
        photoSlot.style.backgroundSize = "cover";
        photoSlot.style.backgroundPosition = "center";
        photoSlot.innerHTML = "";
    }

    // Radio colors
    const boombox = document.getElementById("boombox");
    if (boombox && state.radioColors) {
        boombox.style.setProperty("--radio-body", state.radioColors.body);
        boombox.style.setProperty("--radio-speaker", state.radioColors.speaker);
        boombox.style.setProperty("--radio-handle", state.radioColors.handle);
        boombox.style.setProperty("--radio-buttons", state.radioColors.buttons);
        boombox.style.setProperty("--radio-detail", state.radioColors.detail);
    }

    // Shelf styling — apply all 4 custom properties
    const shelf = document.querySelector(".shelf");
    if (shelf) {
        if (state.shelfColor) shelf.style.setProperty("--shelf-wood", state.shelfColor);
        if (state.shelfInterior) shelf.style.setProperty("--shelf-interior", state.shelfInterior);
        if (state.shelfOutline) shelf.style.setProperty("--shelf-outline", state.shelfOutline);
        if (state.shelfPlank) shelf.style.setProperty("--shelf-plank", state.shelfPlank);
    }

    // Shelf contents
    renderShelf();
    // Shelf mascot beside the radio
    renderShelfMascot();

    // Draggable stickers
    renderStickers();

    // Poster
    renderPoster();
}

function renderShelf() {
    const container = document.getElementById("playlist-spines");
    if (!container) return;
    container.innerHTML = "";

    state.playlists.forEach((pl, index) => {
        const spine = document.createElement("div");
        spine.className = "playlist-spine";
        spine.style.background = pl.color;
        spine.textContent = pl.name;
        spine.dataset.playlistId = pl.id;
        spine.dataset.playlistIndex = index;
        spine.title = `Open ${pl.name}`;
        container.appendChild(spine);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "btn-add-playlist";
    addBtn.textContent = "+";
    addBtn.id = "btn-add-playlist";
    container.appendChild(addBtn);
}


function renderShelfMascot() {
    const display = document.getElementById("shelf-mascot-display");
    if (!display) return;
    display.innerHTML = "";

    if (!state.shelfMascot) return;
    const mascot = MASCOT_GIFS.find((m) => m.id === state.shelfMascot);
    if (!mascot) return;

    const img = document.createElement("img");
    img.className = "shelf-mascot-gif";
    img.src = mascot.src;
    img.alt = mascot.label;
    img.title = mascot.label;
    img.dataset.mascotId = mascot.id;
    img.onerror = () => { display.innerHTML = ""; };
    display.appendChild(img);
}

function renderStickers() {
    const canvas = document.getElementById("stickers-canvas");
    if (!canvas) return;
    canvas.innerHTML = "";

    (state.placedStickers || []).forEach((sticker, index) => {
        const def = PROFILE_STICKERS.find((s) => s.id === sticker.id);
        if (!def) return;
        const el = document.createElement("span");
        el.className = "placed-sticker";
        el.textContent = def.emoji;
        el.style.left = `${sticker.x}px`;
        el.style.top = `${sticker.y}px`;
        el.dataset.stickerIndex = index;
        el.title = `${def.label} (drag to move)`;
        canvas.appendChild(el);
    });
}

function renderPoster() {
    const area = document.getElementById("poster-area");
    if (!area) return;
    if (state.posterImage) {
        area.style.backgroundImage = `url(${state.posterImage})`;
        area.style.backgroundSize = "cover";
        area.style.backgroundPosition = "center";
        const span = area.querySelector("span");
        if (span) span.style.display = "none";
    }
}

// ─── Wizard sidebar label ─────────────────────────────────────────────────────
export function updateWizardLabels(name) {
    ["wizard-sidebar-label", "wizard-color-label", "wizard-songs-label"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = name || "New Playlist";
    });
}

export function updateWizardColor(color) {
    ["wizard-sidebar-label", "wizard-color-label", "wizard-songs-label"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.background = color || "#f4a0a0";
    });
}

// ─── Colour swatch grids ─────────────────────────────────────────────────────
export function renderPlaylistColorGrid(selectedColor) {
    _renderSwatchGrid("playlist-color-grid", SWATCH_COLORS, selectedColor, "playlist-swatch");
}

export function renderBgColorGrid(selectedColor) {
    _renderSwatchGrid("bg-color-grid", BG_COLORS, selectedColor, "bg-swatch");
}

function _renderSwatchGrid(containerId, colors, selected, dataAttr) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";
    colors.forEach((color) => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch" + (color === selected ? " selected" : "");
        swatch.style.background = color;
        swatch.dataset[dataAttr === "playlist-swatch" ? "playlistColor" : "bgColor"] = color;
        grid.appendChild(swatch);
    });
}

// ─── Radio customizer ─────────────────────────────────────────────────────────
export function renderRadioCustomizer() {
    const ids = { body: "radio-color-body", speaker: "radio-color-speaker", handle: "radio-color-handle", buttons: "radio-color-buttons", detail: "radio-color-detail" };
    for (const [key, id] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.value = state.radioColors[key];
    }

    const presetRow = document.getElementById("radio-presets");
    if (presetRow) {
        presetRow.innerHTML = "";
        RADIO_PRESETS.forEach((preset, i) => {
            const chip = document.createElement("div");
            chip.className = "preset-chip";
            chip.dataset.presetIndex = i;
            chip.innerHTML = `<div class="preset-dot" style="background:${preset.body}"></div><div class="preset-dot" style="background:${preset.speaker}"></div><span>${preset.name}</span>`;
            presetRow.appendChild(chip);
        });
    }
}

// ─── Shelf customizer ─────────────────────────────────────────────────────────
export function renderShelfCustomizer() {
    // Sync color inputs
    const mainEl = document.getElementById("shelf-color-main");
    if (mainEl) mainEl.value = state.shelfColor;

    const intEl = document.getElementById("shelf-color-interior");
    if (intEl) intEl.value = state.shelfInterior;

    const outEl = document.getElementById("shelf-color-outline");
    if (outEl) outEl.value = state.shelfOutline;

    const plankEl = document.getElementById("shelf-color-plank");
    if (plankEl) plankEl.value = state.shelfPlank;

    // Render shelf presets
    const presetRow = document.getElementById("shelf-presets");
    if (presetRow) {
        presetRow.innerHTML = "";
        SHELF_PRESETS.forEach((preset, i) => {
            const chip = document.createElement("div");
            chip.className = "preset-chip";
            chip.dataset.shelfPresetIndex = i;
            chip.innerHTML = `<div class="preset-dot" style="background:${preset.wood}"></div><div class="preset-dot" style="background:${preset.interior}"></div><span>${preset.name}</span>`;
            presetRow.appendChild(chip);
        });
    }

    // Render mascot picker (single select)
    const mascotGrid = document.getElementById("shelf-mascot-grid");
    if (mascotGrid) {
        mascotGrid.innerHTML = "";
        MASCOT_GIFS.forEach((mascot) => {
            const card = document.createElement("div");
            card.className = "shelf-mascot-card" + (state.shelfMascot === mascot.id ? " selected" : "");
            card.dataset.shelfMascot = mascot.id;
            card.innerHTML = `<img src="${mascot.src}" alt="${mascot.label}" /><span>${mascot.label}</span>`;
            mascotGrid.appendChild(card);
        });
    }
}

// ─── Background picker — sticker picker is here ──────────────────────────────
export function renderBgPicker() {
    renderBgColorGrid(state.bgColor);
    renderStickerPicker();
}

function renderStickerPicker() {
    const grid = document.getElementById("sticker-picker-grid");
    if (!grid) return;
    grid.innerHTML = "";

    PROFILE_STICKERS.forEach((sticker) => {
        const card = document.createElement("div");
        card.className = "decoration-card";
        card.dataset.addSticker = sticker.id;
        card.innerHTML = `<span class="deco-emoji">${sticker.emoji}</span><span>${sticker.label}</span>`;
        card.title = "Click to place on room";
        grid.appendChild(card);
    });
}

// ─── Frame picker ─────────────────────────────────────────────────────────────
export function renderFramePicker() {
    const grid = document.getElementById("frame-picker-grid");
    if (!grid) return;
    grid.innerHTML = "";

    FRAME_IMAGES.forEach((file, i) => {
        const card = document.createElement("div");
        card.className = "picker-card" + (i === state.profile.frame ? " selected" : "");
        card.dataset.frameIndex = i;

        const img = document.createElement("img");
        img.src = `./photos/frames/${file}`;
        img.alt = `Frame style ${i + 1}`;

        card.appendChild(img);
        grid.appendChild(card);
    });
}

// ─── Song search results ──────────────────────────────────────────────────────
export function renderSongSearch(query, songLibrary = []) {
    const results = document.getElementById("song-search-results");
    if (!results) return;
    results.innerHTML = "";

    const q = query.trim().toLowerCase();
    const filtered = q
        ? songLibrary.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q)
        )
        : songLibrary;

    filtered.forEach((song) => {
        results.appendChild(_buildSongItem(song));
    });
}

function _buildSongItem(song) {
    const item = document.createElement("div");
    item.className = "song-item";

    const thumb = document.createElement("div");
    thumb.className = "song-thumb";
    if (song.cover) {
        thumb.style.backgroundImage = `url(${song.cover})`;
        thumb.style.backgroundSize = "cover";
        thumb.style.backgroundPosition = "center";
    } else {
        thumb.style.background = song.color;
    }

    const info = document.createElement("div");
    info.className = "song-info";
    info.innerHTML = `<div class="song-name">${song.name}</div><div class="song-artist">${song.artist}</div>`;

    const btn = document.createElement("button");
    btn.className = "btn-add-song";
    btn.textContent = "+";
    btn.dataset.songId = song.id;
    btn.title = `Add ${song.name}`;

    item.appendChild(thumb);
    item.appendChild(info);
    item.appendChild(btn);
    return item;
}

// ─── Edit playlist panel ──────────────────────────────────────────────────────
export function renderEditPlaylist() {
    const list = document.getElementById("edit-playlist-list");
    if (!list) return;
    list.innerHTML = "";

    // Apply draft playlist color to the edit panel
    const panel = list.closest(".edit-panel");
    if (panel && state.draft?.color) {
        const c = state.draft.color;
        // Create a lighter tint for the panel background
        panel.style.setProperty("--playlist-panel-color", `${c}30`);
    }

    const songs = state.draft?.songs ?? [];
    if (songs.length === 0) {
        list.innerHTML = '<p style="font-size:0.8rem;color:#666;padding:0.5rem;">No songs yet — add some!</p>';
        return;
    }

    songs.forEach((song) => {
        const item = document.createElement("div");
        item.className = "edit-item";

        const minusBtn = document.createElement("button");
        minusBtn.className = "btn-remove-song";
        minusBtn.textContent = "−";
        minusBtn.dataset.removeSongId = song.id;

        const thumb = document.createElement("div");
        thumb.className = "edit-thumb";
        if (song.cover) {
            thumb.style.backgroundImage = `url(${song.cover})`;
            thumb.style.backgroundSize = "cover";
            thumb.style.backgroundPosition = "center";
        } else {
            thumb.style.background = song.color;
        }

        const info = document.createElement("div");
        info.className = "edit-info";
        info.innerHTML = `<div class="song-name">${song.name}</div><div class="song-artist">${song.artist}</div>`;

        const handle = document.createElement("span");
        handle.className = "drag-handle";
        handle.textContent = "≡";

        item.appendChild(minusBtn);
        item.appendChild(thumb);
        item.appendChild(info);
        item.appendChild(handle);
        list.appendChild(item);
    });
}
