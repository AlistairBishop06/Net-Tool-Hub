const urlInput = document.getElementById("url-input");
const urlMode = document.getElementById("url-mode");
const validation = document.querySelector("[data-validation]");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value || "—";
};

const diffPreview = (input, output) => {
  if (!input || !output) return "—";
  let result = "";
  for (let i = 0; i < Math.max(input.length, output.length); i += 1) {
    const a = input[i] || "";
    const b = output[i] || "";
    result += a === b ? b : `[${b || " "}]`;
  }
  return result;
};

const run = () => {
  const text = urlInput.value;
  if (!text.trim()) {
    validation.textContent = "";
    setResult("result", "—");
    setResult("diff", "—");
    return;
  }

  try {
    const output =
      urlMode.value === "encode" ? encodeURIComponent(text) : decodeURIComponent(text);
    validation.textContent = "";
    setResult("result", output);
    setResult("diff", diffPreview(text, output));
    const params = new URLSearchParams({ text, mode: urlMode.value });
    history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
  } catch (error) {
    validation.textContent = "Unable to decode this URL. Check the input.";
    setResult("result", "—");
    setResult("diff", "—");
  }
};

urlInput.addEventListener("input", run);
urlMode.addEventListener("change", run);

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  const mode = params.get("mode");
  if (text) urlInput.value = text;
  if (mode && (mode === "encode" || mode === "decode")) urlMode.value = mode;
  if (text || mode) run();
};

initFromUrl();
