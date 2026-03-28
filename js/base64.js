const base64Input = document.getElementById("base64-input");
const base64Mode = document.getElementById("base64-mode");
const validation = document.querySelector("[data-validation]");
const resultOutput = document.querySelector('[data-result="result"]');

const setValidation = (message, isError = true) => {
  validation.textContent = message;
  validation.style.color = isError ? "#ff8a8a" : "#7ee787";
};

const updateResult = (value) => {
  resultOutput.textContent = value || "—";
};

const encodeBase64 = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    return null;
  }
};

const decodeBase64 = (text) => {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch (error) {
    return null;
  }
};

const run = () => {
  const input = base64Input.value;
  if (!input.trim()) {
    setValidation("");
    updateResult("—");
    return;
  }

  let output = "";
  if (base64Mode.value === "encode") {
    output = encodeBase64(input);
    if (!output) {
      setValidation("Unable to encode the input text.", true);
      updateResult("—");
      return;
    }
    setValidation("Encoded successfully", false);
  } else {
    output = decodeBase64(input.trim());
    if (!output) {
      setValidation("Invalid Base64 input.", true);
      updateResult("—");
      return;
    }
    setValidation("Decoded successfully", false);
  }

  updateResult(output);

  const params = new URLSearchParams({
    text: input,
    mode: base64Mode.value,
  });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

base64Input.addEventListener("input", run);
base64Mode.addEventListener("change", run);

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  const mode = params.get("mode");
  if (text) base64Input.value = text;
  if (mode && (mode === "encode" || mode === "decode")) base64Mode.value = mode;
  if (text || mode) run();
};

initFromUrl();
