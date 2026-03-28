const jsonInput = document.getElementById("json-input");
const validation = document.querySelector("[data-validation]");
const formattedOutput = document.querySelector('[data-result="formatted"]');

const updateOutput = (value) => {
  formattedOutput.textContent = value || "—";
};

const setValidation = (message, isError = true) => {
  validation.textContent = message;
  validation.style.color = isError ? "#ff8a8a" : "#7ee787";
};

const parseJson = (text) => {
  if (!text.trim()) {
    setValidation("");
    updateOutput("—");
    return null;
  }
  try {
    const parsed = JSON.parse(text);
    setValidation("Valid JSON", false);
    return parsed;
  } catch (error) {
    setValidation(`Invalid JSON: ${error.message}`, true);
    updateOutput("—");
    return null;
  }
};

const formatJson = () => {
  const parsed = parseJson(jsonInput.value);
  if (!parsed) return;
  updateOutput(JSON.stringify(parsed, null, 2));
};

const minifyJson = () => {
  const parsed = parseJson(jsonInput.value);
  if (!parsed) return;
  updateOutput(JSON.stringify(parsed));
};

const handleAction = (action) => {
  if (action === "format") formatJson();
  if (action === "minify") minifyJson();
  if (action === "clear") {
    jsonInput.value = "";
    setValidation("");
    updateOutput("—");
  }
};

jsonInput.addEventListener("input", () => {
  const parsed = parseJson(jsonInput.value);
  if (parsed) updateOutput(JSON.stringify(parsed, null, 2));

  const params = new URLSearchParams({ json: jsonInput.value });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    handleAction(button.getAttribute("data-action"));
  });
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const json = params.get("json");
  if (json) {
    jsonInput.value = json;
    formatJson();
  }
};

initFromUrl();
