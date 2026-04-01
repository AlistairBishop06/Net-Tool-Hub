const countInput = document.getElementById("uuid-count");
const formatSelect = document.getElementById("uuid-format");
const output = document.querySelector('[data-result="uuid"]');
const validation = document.querySelector("[data-validation]");
const generateButton = document.querySelector("[data-generate]");

const generateUuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
};

const run = () => {
  const count = Number(countInput.value);
  if (Number.isNaN(count) || count < 1 || count > 200) {
    validation.textContent = "Enter a count between 1 and 200.";
    return;
  }

  validation.textContent = "";
  const uuids = Array.from({ length: count }, () => generateUuid());
  const formatted =
    formatSelect.value === "upper" ? uuids.map((u) => u.toUpperCase()) : uuids;
  output.textContent = formatted.join("\n");

  const params = new URLSearchParams({
    count: count.toString(),
    format: formatSelect.value,
  });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

generateButton.addEventListener("click", run);
countInput.addEventListener("input", run);
formatSelect.addEventListener("change", run);

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.getAttribute("data-action") === "clear") {
      output.textContent = "—";
      validation.textContent = "";
    }
  });
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const count = params.get("count");
  const format = params.get("format");
  if (count) countInput.value = count;
  if (format && (format === "upper" || format === "lower")) {
    formatSelect.value = format;
  }
  if (count || format) run();
};

initFromUrl();
