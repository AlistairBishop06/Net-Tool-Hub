const hexInput = document.getElementById("hex-input");
const rgbInput = document.getElementById("rgb-input");
const hslInput = document.getElementById("hsl-input");
const hsvInput = document.getElementById("hsv-input");
const colorPicker = document.getElementById("color-picker");
const preview = document.getElementById("color-preview");
const validation = document.querySelector("[data-validation]");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = `${key.toUpperCase()}: ${value}`;
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const rgbToHex = (r, g, b) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const hexToRgb = (hex) => {
  const cleaned = hex.replace("#", "").trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const full = cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned;
  const int = parseInt(full, 16);
  if (Number.isNaN(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(max * 100),
  };
};

const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const hsvToRgb = (h, s, v) => {
  h /= 360;
  s /= 100;
  v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const rgb = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][mod];
  return { r: Math.round(rgb[0] * 255), g: Math.round(rgb[1] * 255), b: Math.round(rgb[2] * 255) };
};

const parseTriplet = (value) => {
  const parts = value.split(",").map((part) => part.trim().replace("%", ""));
  if (parts.length < 3) return null;
  const nums = parts.map((part) => Number(part));
  if (nums.some((num) => Number.isNaN(num))) return null;
  return nums;
};

let isUpdating = false;

const updateAll = (r, g, b) => {
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);

  hexInput.value = hex;
  rgbInput.value = `${r}, ${g}, ${b}`;
  hslInput.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
  hsvInput.value = `${hsv.h}, ${hsv.s}%, ${hsv.v}%`;
  colorPicker.value = hex;
  preview.style.background = hex;

  setResult("hex", hex);
  setResult("rgb", `rgb(${r}, ${g}, ${b})`);
  setResult("hsl", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
  setResult("hsv", `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`);

  const params = new URLSearchParams({ hex });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

const handleHex = () => {
  const rgb = hexToRgb(hexInput.value);
  if (!rgb) {
    validation.textContent = "Enter a valid HEX value.";
    return;
  }
  validation.textContent = "";
  updateAll(rgb.r, rgb.g, rgb.b);
};

const handleRgb = () => {
  const nums = parseTriplet(rgbInput.value);
  if (!nums) {
    validation.textContent = "Enter RGB as: 255, 255, 255.";
    return;
  }
  const [r, g, b] = nums.map((val) => clamp(val, 0, 255));
  validation.textContent = "";
  updateAll(r, g, b);
};

const handleHsl = () => {
  const nums = parseTriplet(hslInput.value);
  if (!nums) {
    validation.textContent = "Enter HSL as: 200, 70%, 50%.";
    return;
  }
  const [h, s, l] = nums;
  validation.textContent = "";
  const rgb = hslToRgb(clamp(h, 0, 360), clamp(s, 0, 100), clamp(l, 0, 100));
  updateAll(rgb.r, rgb.g, rgb.b);
};

const handleHsv = () => {
  const nums = parseTriplet(hsvInput.value);
  if (!nums) {
    validation.textContent = "Enter HSV as: 200, 70%, 100%.";
    return;
  }
  const [h, s, v] = nums;
  validation.textContent = "";
  const rgb = hsvToRgb(clamp(h, 0, 360), clamp(s, 0, 100), clamp(v, 0, 100));
  updateAll(rgb.r, rgb.g, rgb.b);
};

const withLock = (fn) => {
  if (isUpdating) return;
  isUpdating = true;
  fn();
  isUpdating = false;
};

hexInput.addEventListener("input", () => withLock(handleHex));
rgbInput.addEventListener("input", () => withLock(handleRgb));
hslInput.addEventListener("input", () => withLock(handleHsl));
hsvInput.addEventListener("input", () => withLock(handleHsv));
colorPicker.addEventListener("input", () => withLock(handleHex));

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const hex = params.get("hex");
  if (hex) {
    hexInput.value = hex;
    handleHex();
  } else {
    handleHex();
  }
};

initFromUrl();
