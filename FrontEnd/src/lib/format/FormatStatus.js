export function formatStatus(status) {
  if (status === null || status === undefined || status === "") return "Unknown";
  return String(status)
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}