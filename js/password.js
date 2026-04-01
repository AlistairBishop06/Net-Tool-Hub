const lengthInput = document.getElementById("length-input");
const optionButtons = Array.from(document.querySelectorAll("[data-option]"));
const output = document.querySelector('[data-result="password"]');
const validation = document.querySelector("[data-validation]");
const strengthBar = document.querySelector("[data-strength-bar]");
const strengthLabel = document.querySelector("[data-strength-label]");
const generateButton = document.querySelector("[data-generate]");

const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*()_+{}[]<>?/-=",
};

const getActiveOptions = () =>
  optionButtons
    .filter((btn) => btn.classList.contains("active"))
    .map((btn) => btn.getAttribute("data-option"));

const computeStrength = (password, options) => {
  if (!password) return { score: 0, label: "—", color: "#ff8a8a" };
  const lengthScore = Math.min(password.length / 20, 1) * 60;
  const varietyScore = Math.min(options.length / 4, 1) * 40;
  const score = Math.round(lengthScore + varietyScore);
  if (score >= 80) return { score, label: "Strong", color: "#7ee787" };
  if (score >= 50) return { score, label: "Good", color: "#ffd166" };
  return { score, label: "Weak", color: "#ff8a8a" };
};

const randomChar = (set) => set[Math.floor(Math.random() * set.length)];

const generatePassword = () => {
  const length = Number(lengthInput.value);
  const options = getActiveOptions();

  if (Number.isNaN(length) || length < 6 || length > 64) {
    validation.textContent = "Length must be between 6 and 64.";
    return;
  }

  if (!options.length) {
    validation.textContent = "Select at least one character set.";
    return;
  }

  validation.textContent = "";
  let pool = "";
  options.forEach((key) => {
    pool += sets[key];
  });

  let result = "";
  options.forEach((key) => {
    result += randomChar(sets[key]);
  });
  for (let i = result.length; i < length; i += 1) {
    result += randomChar(pool);
  }

  result = result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  output.textContent = result;
  updateStrength(result, options);

  const params = new URLSearchParams({
    length: length.toString(),
    options: options.join(","),
    password: result,
  });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

const updateStrength = (password, options) => {
  const { score, label, color } = computeStrength(password, options);
  strengthBar.style.width = `${score}%`;
  strengthBar.style.background = color;
  strengthLabel.textContent = `Strength: ${label}`;
};

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");
    const options = getActiveOptions();
    updateStrength(output.textContent === "—" ? "" : output.textContent, options);
  });
});

generateButton.addEventListener("click", generatePassword);

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.getAttribute("data-action") === "clear") {
      output.textContent = "—";
      validation.textContent = "";
      strengthBar.style.width = "0%";
      strengthLabel.textContent = "Strength: —";
    }
  });
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const length = params.get("length");
  const options = params.get("options");
  const password = params.get("password");
  if (length) lengthInput.value = length;
  if (options) {
    const list = options.split(",");
    optionButtons.forEach((button) => {
      button.classList.toggle("active", list.includes(button.getAttribute("data-option")));
    });
  }
  if (password) {
    output.textContent = password;
    updateStrength(password, getActiveOptions());
  } else if (length || options) {
    generatePassword();
  }
};

initFromUrl();
