const STORAGE_KEY = "wealth-tracker-v2";
const LEGACY_STORAGE_KEYS = ["wealth-tracker-v1"];

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Save Error:", err);
  }
}

export function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return null;

    return JSON.parse(data);
  } catch (err) {
    console.error("Load Error:", err);
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
