import type { FC } from 'react';
import type { CardCategory, ClaudeCodeEvent } from '../types/events';

export interface CardRegistration {
  component: FC<{
    event: any;
    className?: string;
    onFileClick?: (path: string, line?: number) => void;
    onOpenInWindow?: (event: ClaudeCodeEvent) => void;
  }>;
  category: CardCategory;
  label: string;
  icon?: string;
}

const registry = new Map<string, CardRegistration>();

export const CardRegistry = {
  register(toolName: string, registration: CardRegistration): void {
    registry.set(toolName, registration);
  },

  get(toolName: string): CardRegistration | undefined {
    return registry.get(toolName);
  },

  has(toolName: string): boolean {
    return registry.has(toolName);
  },

  getByCategory(
    category: CardCategory,
  ): Array<{ toolName: string } & CardRegistration> {
    const results: Array<{ toolName: string } & CardRegistration> = [];
    for (const [toolName, reg] of registry) {
      if (reg.category === category) {
        results.push({ toolName, ...reg });
      }
    }
    return results;
  },

  all(): Map<string, CardRegistration> {
    return new Map(registry);
  },
};

/** Convert "mcp__orchestra-mcp__get_workflow_status" to "get_workflow_status" */
export function extractMcpToolName(fullName: string): string {
  const parts = fullName.split('__');
  return parts.length >= 3 ? parts.slice(2).join('__') : parts[parts.length - 1];
}

/** Check if a tool name is an MCP tool */
export function isMcpTool(toolName: string): boolean {
  return toolName.startsWith('mcp__');
}
