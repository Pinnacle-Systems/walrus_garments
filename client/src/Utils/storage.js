// utils/storage.js
export const safeParseJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse failed for key:", key);
    return null;
  }
};
