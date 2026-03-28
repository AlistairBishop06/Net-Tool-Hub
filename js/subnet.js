const ipInput = document.getElementById("ip-input");
const cidrInput = document.getElementById("cidr-input");
const validation = document.querySelector("[data-validation]");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value || "—";
};

const parseIp = (ip) => {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return parts;
};

const ipToInt = (parts) =>
  (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];

const intToIp = (int) =>
  [int >>> 24, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");

const calcSubnet = () => {
  const ip = ipInput.value.trim();
  const cidr = Number(cidrInput.value);
  const parts = parseIp(ip);

  if (!ip && !cidrInput.value) {
    validation.textContent = "";
    ["network", "broadcast", "range", "hosts"].forEach((key) => setResult(key, "—"));
    return;
  }

  if (!parts || Number.isNaN(cidr) || cidr < 0 || cidr > 32) {
    validation.textContent = "Enter a valid IP address and CIDR (0-32).";
    return;
  }

  validation.textContent = "";
  const ipInt = ipToInt(parts) >>> 0;
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const network = ipInt & mask;
  const broadcast = network | (~mask >>> 0);

  const totalHosts = cidr === 32 ? 1 : Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;

  setResult("network", intToIp(network));
  setResult("broadcast", intToIp(broadcast));

  if (usableHosts > 0) {
    setResult("range", `${intToIp(network + 1)} – ${intToIp(broadcast - 1)}`);
  } else {
    setResult("range", "No usable host range");
  }

  setResult("hosts", usableHosts.toLocaleString());

  const params = new URLSearchParams({ ip, cidr: cidr.toString() });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const ip = params.get("ip");
  const cidr = params.get("cidr");
  if (ip) ipInput.value = ip;
  if (cidr) cidrInput.value = cidr;
  if (ip || cidr) calcSubnet();
};

ipInput.addEventListener("input", calcSubnet);
cidrInput.addEventListener("input", calcSubnet);
initFromUrl();
