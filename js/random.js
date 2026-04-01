const minInput = document.getElementById("random-min");
const maxInput = document.getElementById("random-max");
const namesInput = document.getElementById("names-input");
const lengthInput = document.getElementById("basic-length");
const typeSelect = document.getElementById("basic-type");

const validationNumber = document.querySelector('[data-validation="number"]');
const validationName = document.querySelector('[data-validation="name"]');
const validationPassword = document.querySelector('[data-validation="password"]');

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value || "—";
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateNumber = () => {
  const min = Number(minInput.value);
  const max = Number(maxInput.value);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
    validationNumber.textContent = "Enter a valid min and max.";
    return;
  }
  validationNumber.textContent = "";
  setResult("number", randomInt(min, max).toString());
};

const pickName = () => {
  const names = namesInput.value
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
  if (!names.length) {
    validationName.textContent = "Add at least one name.";
    return;
  }
  validationName.textContent = "";
  const picked = names[randomInt(0, names.length - 1)];
  setResult("name", picked);
};

const generateBasicPassword = () => {
  const length = Number(lengthInput.value);
  if (Number.isNaN(length) || length < 6 || length > 32) {
    validationPassword.textContent = "Length must be 6-32.";
    return;
  }
  const sets = {
    alnum: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    letters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
  };
  const pool = sets[typeSelect.value];
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += pool[Math.floor(Math.random() * pool.length)];
  }
  validationPassword.textContent = "";
  setResult("password-basic", password);
};

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.getAttribute("data-action");
    if (action === "number") generateNumber();
    if (action === "name") pickName();
    if (action === "password") generateBasicPassword();
  });
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const min = params.get("min");
  const max = params.get("max");
  if (min) minInput.value = min;
  if (max) maxInput.value = max;
  if (min || max) generateNumber();
};

initFromUrl();
