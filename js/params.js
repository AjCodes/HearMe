// ─── PALETTE for colour swatches ─────────────────────────────────────────────
export const SWATCH_COLORS = [
    "#f4a0a0", "#8b2020", "#4caf50", "#b2f0e8", "#c0524e",
    "#7c5cad", "#f4c842", "#f4872a", "#4a90d9", "#aaaaaa",
    "#d4a0d4", "#3a7a3a", "#f08080", "#5c5c8a", "#e8d5a3",
    "#2e8b8b", "#a0c4f4", "#c4a0f4",
];

// ─── BACKGROUND colours ───────────────────────────────────────────────────────
export const BG_COLORS = [
    "#c8e8ed", "#f4a0a0", "#b2e8b2", "#f4e8a0", "#c8b2f0",
    "#f4c8a0", "#a0c8f4", "#f4a0d4", "#aaaaaa", "#d4c8b2",
    "#8b2020", "#4caf50", "#2e6b9e", "#7c5cad", "#c0524e",
    "#b5813b", "#3a7a3a", "#f08080",
];

// ─── Frame images (photos/frames/) ────────────────────────────────────────────
export const FRAME_IMAGES = [
    "Group 27.png",
    "image-removebg-preview (1) 1.png",
    "image-removebg-preview (2) 1.png",
    "image-removebg-preview 1.png",
    "image_2026-02-12_132945066-removebg-preview 1.png",
    "image_2026-02-12_133121176-removebg-preview 1.png",
];

// ─── Radio colour presets ─────────────────────────────────────────────────────
export const RADIO_PRESETS = [
    { name: "Classic Red", body: "#e74c3c", speaker: "#2c3e50", handle: "#7f8c8d", buttons: "#f39c12", detail: "#ecf0f1" },
    { name: "Ocean Blue", body: "#2980b9", speaker: "#1a252f", handle: "#95a5a6", buttons: "#e67e22", detail: "#ecf0f1" },
    { name: "Purple Haze", body: "#8e44ad", speaker: "#2c2c54", handle: "#a0a0a0", buttons: "#e74c3c", detail: "#f5f5f5" },
    { name: "Mint Fresh", body: "#1abc9c", speaker: "#2d3436", handle: "#b2bec3", buttons: "#fdcb6e", detail: "#ffffff" },
    { name: "Sunset", body: "#e67e22", speaker: "#34495e", handle: "#bdc3c7", buttons: "#c0392b", detail: "#fef9ef" },
    { name: "Midnight", body: "#2c3e50", speaker: "#1a1a2e", handle: "#636e72", buttons: "#00cec9", detail: "#dfe6e9" },
    { name: "Bubblegum", body: "#fd79a8", speaker: "#6c5ce7", handle: "#b2bec3", buttons: "#fdcb6e", detail: "#ffffff" },
    { name: "Forest", body: "#27ae60", speaker: "#2d3436", handle: "#6c5ce7", buttons: "#f39c12", detail: "#dfe6e9" },
];

// ─── Shelf color presets ──────────────────────────────────────────────────────
export const SHELF_PRESETS = [
    { name: "Oak", wood: "#b5813b", interior: "#c9a96e", outline: "#8a5e22", plank: "#8a5e22" },
    { name: "Walnut", wood: "#5c3d2e", interior: "#7a5a47", outline: "#3e2a1e", plank: "#4a3428" },
    { name: "White", wood: "#e8e0d4", interior: "#f5f0e8", outline: "#c8bfb0", plank: "#d5cdc0" },
    { name: "Cherry", wood: "#8b3a3a", interior: "#a85555", outline: "#6b2222", plank: "#7a3030" },
    { name: "Ebony", wood: "#2c2c2c", interior: "#3d3d3d", outline: "#1a1a1a", plank: "#252525" },
    { name: "Pine", wood: "#d4a85c", interior: "#e5c888", outline: "#b08430", plank: "#c09540" },
    { name: "Bamboo", wood: "#c8b560", interior: "#ddd08a", outline: "#a8953a", plank: "#b8a550" },
    { name: "Rose", wood: "#9e6b6b", interior: "#b88888", outline: "#7a4e4e", plank: "#8a5e5e" },
];

// ─── Shelf decorative objects (large items beside the radio) ──────────────────
export const SHELF_OBJECTS = [
    { id: "plant", svg: "🪴", label: "Plant", size: "3.5rem" },
    { id: "lamp", svg: "🛋️", label: "Lamp", size: "3.5rem" },
    { id: "books", svg: "📚", label: "Books", size: "3rem" },
    { id: "coffee", svg: "☕", label: "Coffee", size: "3rem" },
    { id: "globe", svg: "🌍", label: "Globe", size: "3rem" },
    { id: "teddy", svg: "🧸", label: "Teddy", size: "3.5rem" },
    { id: "candle", svg: "🕯️", label: "Candle", size: "3rem" },
    { id: "clock", svg: "🕰️", label: "Clock", size: "3rem" },
    { id: "camera", svg: "📷", label: "Camera", size: "3rem" },
    { id: "trophy", svg: "🏆", label: "Trophy", size: "3rem" },
    { id: "vinyl", svg: "💿", label: "Vinyl", size: "3rem" },
    { id: "headphones", svg: "🎧", label: "Headphones", size: "3rem" },
];

// ─── Profile stickers (draggable on the room) ────────────────────────────────
export const PROFILE_STICKERS = [
    { id: "star", emoji: "⭐", label: "Star" },
    { id: "heart", emoji: "❤️", label: "Heart" },
    { id: "fire", emoji: "🔥", label: "Fire" },
    { id: "rainbow", emoji: "🌈", label: "Rainbow" },
    { id: "music", emoji: "🎵", label: "Music" },
    { id: "butterfly", emoji: "🦋", label: "Butterfly" },
    { id: "sparkles", emoji: "✨", label: "Sparkles" },
    { id: "flower", emoji: "🌸", label: "Flower" },
    { id: "lightning", emoji: "⚡", label: "Lightning" },
    { id: "peace", emoji: "✌️", label: "Peace" },
    { id: "smiley", emoji: "😎", label: "Cool" },
    { id: "alien", emoji: "👽", label: "Alien" },
];

export const DEFAULT_RADIO_COLORS = {
    body: "#e74c3c",
    speaker: "#2c3e50",
    handle: "#7f8c8d",
    buttons: "#f39c12",
    detail: "#ecf0f1",
};

export const DEFAULT_PLAYLIST = {
    id: "default",
    name: "Playlist #1",
    color: "#f4a0a0",
    songs: [],
};

export const DEFAULT_STATE = {
    page: "room",
    bgColor: "#c8e8ed",
    bgImage: null,
    playlists: [{ ...DEFAULT_PLAYLIST }],
    activePlaylist: null, // id of playlist being edited in wizard
    profile: { name: "", genre: "", bio: "", photo: null, frame: 0 },
    radioColors: { ...DEFAULT_RADIO_COLORS },
    // Shelf color system
    shelfColor: "#b5813b", // Main wood color
    shelfInterior: "#c9a96e", // interior/bay color
    shelfOutline: "#8a5e22", // outline/border color
    shelfPlank: "#8a5e22", // middle plank color
    // Profile decorations
    profileStickers: [], // available sticker IDs (legacy, kept for compat)
    placedStickers: [], // array of { id, x, y } for draggable stickers
    posterImage: null, // data URL for uploaded poster image
    // Shelf objects (large items beside radio)
    shelfObjects: [],
};

// Deep-clone the default state
export function getInitialState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export const PAGES = [
    "room", "playlist-name", "playlist-color", "playlist-songs",
    "bg-picker", "radio-picker", "frame-picker", "shelf-picker",
];

export function sanitizePage(page) {
    return PAGES.includes(page) ? page : "room";
}
