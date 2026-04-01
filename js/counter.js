const counterInput = document.getElementById("counter-input");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value;
};

const updateCounts = () => {
  const text = counterInput.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));

  setResult("words", words.toString());
  setResult("chars", chars.toString());
  setResult("time", `${minutes} min`);

  const params = new URLSearchParams({ text });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

counterInput.addEventListener("input", updateCounts);

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  if (text) {
    counterInput.value = text;
    updateCounts();
  }
};

initFromUrl();
