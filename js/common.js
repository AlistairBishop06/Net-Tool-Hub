const toolRoutes = [
  { name: "Subnet Calculator", path: "/tools/subnet.html", keywords: ["subnet", "cidr", "network"] },
  { name: "JSON Formatter", path: "/tools/json.html", keywords: ["json", "formatter", "validator"] },
  { name: "Base64 Encoder / Decoder", path: "/tools/base64.html", keywords: ["base64", "encode", "decode"] },
  { name: "Password Generator", path: "/tools/password.html", keywords: ["password", "strength", "generator"] },
  { name: "Hash Generator", path: "/tools/hash.html", keywords: ["hash", "md5", "sha-1", "sha-256"] },
  { name: "URL Encoder / Decoder", path: "/tools/url.html", keywords: ["url", "encode", "decode"] },
  { name: "Timestamp Converter", path: "/tools/timestamp.html", keywords: ["timestamp", "unix", "date", "time"] },
  { name: "UUID Generator", path: "/tools/uuid.html", keywords: ["uuid", "guid", "v4"] },
  { name: "QR Code Generator", path: "/tools/qr.html", keywords: ["qr", "code", "qr code"] },
  { name: "Colour Converter + Picker", path: "/tools/color.html", keywords: ["color", "colour", "hex", "rgb", "hsl", "hsv"] },
  { name: "Text Case Converter", path: "/tools/case.html", keywords: ["case", "uppercase", "lowercase", "title", "camel", "snake"] },
  { name: "Word & Character Counter", path: "/tools/counter.html", keywords: ["word", "character", "counter", "reading time"] },
  { name: "Random Generator Suite", path: "/tools/random.html", keywords: ["random", "number", "name", "password"] },
];

const normalize = (value) => value.toLowerCase().trim();

const resolveToolPath = (query) => {
  if (!query) return null;
  const q = normalize(query);
  const direct = toolRoutes.find((tool) => normalize(tool.name) === q);
  if (direct) return direct.path;
  const partial = toolRoutes.find(
    (tool) =>
      normalize(tool.name).includes(q) ||
      tool.keywords.some((keyword) => keyword.includes(q))
  );
  return partial ? partial.path : null;
};

window.ToolHub = {
  toolRoutes,
  resolveToolPath,
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      const target = window.ToolHub.resolveToolPath(input.value);
      if (target) window.location.href = target;
    });
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.getAttribute("data-copy-target");
      const target = document.querySelector(`[data-result="${key}"]`);
      if (!target) return;
      const text = target.textContent.trim();
      if (!text || text === "—") return;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
      } catch (error) {
        button.textContent = "Copy failed";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
      }
    });
  });
});
