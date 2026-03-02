const MCP_API = 'http://127.0.0.1:19191';

/**
 * Call an MCP tool via the REST bridge.
 * The REST endpoint returns ToolResult: { content: [{ type, text }], isError }.
 * This helper extracts and parses the JSON from the first text block.
 */
export async function mcpCall<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const resp = await fetch(`${MCP_API}/api/mcp/tools/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, arguments: args }),
  });
  if (!resp.ok) throw new Error(`MCP call ${name} failed: ${resp.status}`);
  const raw = await resp.json();
  const text = raw?.content?.[0]?.text;
  if (typeof text === 'string') {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }
  return raw as T;
}
