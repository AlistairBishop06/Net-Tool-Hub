const caseInput = document.getElementById("case-input");
const validation = document.querySelector("[data-validation]");

const setResult = (value) => {
  const target = document.querySelector('[data-result="case"]');
  target.textContent = value || "—";
};

const toTitleCase = (text) =>
  text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toCamelCase = (text) => {
  const words = text
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/);
  if (!words.length) return "";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  );
};

const toSnakeCase = (text) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const actions = {
  lower: (text) => text.toLowerCase(),
  upper: (text) => text.toUpperCase(),
  title: (text) => toTitleCase(text),
  camel: (text) => toCamelCase(text),
  snake: (text) => toSnakeCase(text),
};

const applyAction = (action) => {
  const text = caseInput.value;
  if (!text.trim()) {
    validation.textContent = "Enter some text to convert.";
    setResult("—");
    return;
  }
  validation.textContent = "";
  const result = actions[action](text);
  setResult(result);

  const params = new URLSearchParams({ text, mode: action });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    applyAction(button.getAttribute("data-action"));
  });
});

caseInput.addEventListener("input", () => {
  validation.textContent = "";
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  const mode = params.get("mode");
  if (text) caseInput.value = text;
  if (text && mode && actions[mode]) applyAction(mode);
};

initFromUrl();
