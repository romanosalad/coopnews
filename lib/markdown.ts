export function markdownToHtml(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("## ")) {
        return `<h2>${escapeHtml(trimmed.replace(/^##\s+/, ""))}</h2>`;
      }

      return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
