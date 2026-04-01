const timestampInput = document.getElementById("timestamp-input");
const dateInput = document.getElementById("date-input");
const timezoneSelect = document.getElementById("timezone-select");
const validation = document.querySelector("[data-validation]");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value || "—";
};

const formatInZone = (date, timeZone) => {
  if (timeZone === "local") {
    return date.toLocaleString();
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const toLocalInputValue = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

const updateFromTimestamp = () => {
  const value = Number(timestampInput.value);
  if (Number.isNaN(value)) {
    validation.textContent = "Enter a valid Unix timestamp.";
    return;
  }
  if (!timestampInput.value) {
    validation.textContent = "";
    setResult("readable", "—");
    setResult("iso", "—");
    return;
  }

  validation.textContent = "";
  const date = new Date(value * 1000);
  dateInput.value = toLocalInputValue(date);
  setResult("readable", formatInZone(date, timezoneSelect.value));
  setResult("iso", date.toISOString());

  const params = new URLSearchParams({
    ts: timestampInput.value,
    tz: timezoneSelect.value,
  });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

const updateFromDate = () => {
  if (!dateInput.value) return;
  const localDate = new Date(dateInput.value);
  if (Number.isNaN(localDate.getTime())) {
    validation.textContent = "Enter a valid date.";
    return;
  }

  const timestamp = Math.floor(localDate.getTime() / 1000);
  timestampInput.value = timestamp.toString();
  updateFromTimestamp();
};

timestampInput.addEventListener("input", updateFromTimestamp);
dateInput.addEventListener("change", updateFromDate);
timezoneSelect.addEventListener("change", updateFromTimestamp);

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const ts = params.get("ts");
  const tz = params.get("tz");
  if (tz) timezoneSelect.value = tz;
  if (ts) {
    timestampInput.value = ts;
    updateFromTimestamp();
  }
};

initFromUrl();
