document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("[data-home-search] input");
  const cards = Array.from(document.querySelectorAll("[data-tool]"));

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      cards.forEach((card) => {
        const title = card.getAttribute("data-title").toLowerCase();
        const match = title.includes(query);
        card.style.display = match ? "flex" : "none";
      });
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const target = window.ToolHub.resolveToolPath(searchInput.value);
        if (target) window.location.href = target;
      }
    });
  }
});
