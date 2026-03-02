/** Convert "file_path" to "File Path", "old_string" to "Old String" */
export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
