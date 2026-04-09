export function formatName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function isNameValid(value: string): boolean {
  return /^[\p{L}\s]+$/u.test(value.trim());
}
