const toolRoutes = [
  { name: "Subnet Calculator", path: "/tools/subnet.html", keywords: ["subnet", "cidr", "network"] },
  { name: "JSON Formatter", path: "/tools/json.html", keywords: ["json", "formatter", "validator"] },
  { name: "Base64 Encoder / Decoder", path: "/tools/base64.html", keywords: ["base64", "encode", "decode"] },
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
