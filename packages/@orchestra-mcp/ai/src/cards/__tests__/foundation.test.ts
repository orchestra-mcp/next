// ---------------------------------------------------------------------------
// foundation.test.ts
// Unit tests for CardRegistry, parseMcpResponse, and RawCard.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';

// ---------- Module 1: CardRegistry ------------------------------------------

import {
  CardRegistry,
  extractMcpToolName,
  isMcpTool,
} from '../CardRegistry';
import type { CardRegistration } from '../CardRegistry';

// ---------- Module 2: parseMcpResponse --------------------------------------

import {
  parseMcpResponse,
  extractToolName,
} from '../parseMcpResponse';

// ---------- Module 3: RawCard -----------------------------------------------

import { RawCard } from '../RawCard';
import type { RawCardProps } from '../RawCard';

// ===========================================================================
// 1. CardRegistry
// ===========================================================================

describe('CardRegistry', () => {
  // The registry is a module-level singleton. We cannot clear it between tests
  // because it does not expose a reset method. We use unique tool names per test
  // to avoid cross-contamination.

  const makeDummyRegistration = (
    category: CardRegistration['category'] = 'mcp',
    label = 'Test',
  ): CardRegistration => ({
    component: () => null,
    category,
    label,
  });

  it('register() then get() returns the registration', () => {
    const reg = makeDummyRegistration('mcp', 'Get Task');
    CardRegistry.register('__test_get_task', reg);

    const retrieved = CardRegistry.get('__test_get_task');
    expect(retrieved).toBe(reg);
    expect(retrieved?.label).toBe('Get Task');
    expect(retrieved?.category).toBe('mcp');
  });

  it('has() returns true for a registered tool name', () => {
    CardRegistry.register('__test_has_true', makeDummyRegistration());
    expect(CardRegistry.has('__test_has_true')).toBe(true);
  });

  it('has() returns false for an unknown tool name', () => {
    expect(CardRegistry.has('__test_nonexistent_tool_xyz')).toBe(false);
  });

  it('getByCategory() filters correctly', () => {
    CardRegistry.register('__test_cat_file_1', makeDummyRegistration('file', 'F1'));
    CardRegistry.register('__test_cat_file_2', makeDummyRegistration('file', 'F2'));
    CardRegistry.register('__test_cat_terminal_1', makeDummyRegistration('terminal', 'T1'));

    const fileCards = CardRegistry.getByCategory('file');
    const fileToolNames = fileCards.map((c) => c.toolName);

    expect(fileToolNames).toContain('__test_cat_file_1');
    expect(fileToolNames).toContain('__test_cat_file_2');
    expect(fileToolNames).not.toContain('__test_cat_terminal_1');
  });
});

describe('extractMcpToolName', () => {
  it('extracts tool name from fully-qualified MCP name', () => {
    expect(extractMcpToolName('mcp__orchestra-mcp__get_task')).toBe('get_task');
  });

  it('returns the name as-is when it is already short', () => {
    expect(extractMcpToolName('get_task')).toBe('get_task');
  });

  it('handles tool names with extra double-underscore segments', () => {
    expect(extractMcpToolName('mcp__orchestra-mcp__get_workflow_status')).toBe(
      'get_workflow_status',
    );
  });
});

describe('isMcpTool', () => {
  it('returns true for an MCP-prefixed tool name', () => {
    expect(isMcpTool('mcp__orchestra-mcp__get_task')).toBe(true);
  });

  it('returns false for a non-MCP tool name', () => {
    expect(isMcpTool('Bash')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isMcpTool('')).toBe(false);
  });
});

// ===========================================================================
// 2. parseMcpResponse
// ===========================================================================

describe('parseMcpResponse', () => {
  it('parses a task response', () => {
    const raw = JSON.stringify({
      id: 'T-1',
      title: 'Test task',
      type: 'task',
      status: 'done',
    });
    const result = parseMcpResponse('mcp__orchestra-mcp__get_task', raw);

    expect(result.type).toBe('task');
    expect(result.data).toMatchObject({
      id: 'T-1',
      title: 'Test task',
      type: 'task',
      status: 'done',
    });
  });

  it('parses an epic response', () => {
    const raw = JSON.stringify({
      id: 'E-1',
      title: 'Epic One',
      type: 'epic',
      status: 'active',
    });
    const result = parseMcpResponse('mcp__orchestra-mcp__get_epic', raw);

    expect(result.type).toBe('epic');
    expect(result.data).toMatchObject({
      id: 'E-1',
      title: 'Epic One',
      type: 'epic',
      status: 'active',
    });
  });

  it('parses a story response', () => {
    const raw = JSON.stringify({
      id: 'S-1',
      title: 'Story One',
      type: 'story',
      status: 'in-progress',
    });
    const result = parseMcpResponse('mcp__orchestra-mcp__get_story', raw);

    expect(result.type).toBe('story');
    expect(result.data).toMatchObject({
      id: 'S-1',
      title: 'Story One',
    });
  });

  it('parses an array as a list', () => {
    const raw = JSON.stringify([{ id: 'E-1' }, { id: 'E-2' }]);
    const result = parseMcpResponse('mcp__orchestra-mcp__list_epics', raw);

    expect(result.type).toBe('list');
    if (result.type === 'list') {
      expect(result.data.items).toHaveLength(2);
      expect(result.data.type).toBe('epics');
    }
  });

  it('parses workflow status', () => {
    const raw = JSON.stringify({ backlog: 5, done: 3, 'in-progress': 2 });
    const result = parseMcpResponse(
      'mcp__orchestra-mcp__get_workflow_status',
      raw,
    );

    expect(result.type).toBe('workflow');
    if (result.type === 'workflow') {
      expect(result.data.backlog).toBe(5);
      expect(result.data.done).toBe(3);
    }
  });

  it('parses a sprint response', () => {
    const raw = JSON.stringify({
      id: 'SP-1',
      name: 'Sprint 1',
      status: 'active',
      goal: 'Ship it',
    });
    const result = parseMcpResponse(
      'mcp__orchestra-mcp__get_sprint',
      raw,
    );

    expect(result.type).toBe('sprint');
    if (result.type === 'sprint') {
      expect(result.data.name).toBe('Sprint 1');
    }
  });

  it('handles malformed JSON gracefully and returns generic', () => {
    const result = parseMcpResponse(
      'mcp__orchestra-mcp__get_task',
      '{ invalid json !!!',
    );

    expect(result.type).toBe('generic');
    if (result.type === 'generic') {
      expect(result.data.raw).toBe('{ invalid json !!!');
      expect(result.data.keys).toEqual([]);
    }
  });

  it('handles null input and returns generic', () => {
    const result = parseMcpResponse('mcp__orchestra-mcp__get_task', null);

    expect(result.type).toBe('generic');
  });

  it('handles a numeric primitive and returns generic', () => {
    const result = parseMcpResponse('mcp__orchestra-mcp__get_task', '42');

    expect(result.type).toBe('generic');
  });

  it('returns generic for an unrecognised object shape', () => {
    const raw = JSON.stringify({ foo: 'bar', baz: 123 });
    const result = parseMcpResponse('mcp__orchestra-mcp__get_task', raw);

    // get_task heuristic requires id + title + type; this object lacks them
    expect(result.type).toBe('generic');
    if (result.type === 'generic') {
      expect(result.data.keys).toContain('foo');
      expect(result.data.keys).toContain('baz');
    }
  });
});

describe('extractToolName (from parseMcpResponse module)', () => {
  it('extracts the short tool name', () => {
    expect(extractToolName('mcp__orchestra-mcp__get_task')).toBe('get_task');
  });

  it('returns as-is for short names', () => {
    expect(extractToolName('get_task')).toBe('get_task');
  });
});

// ===========================================================================
// 3. RawCard (React component)
// ===========================================================================

describe('RawCard', () => {
  const baseBashEvent = {
    id: 'test-1',
    type: 'bash' as const,
    status: 'done',
    command: 'ls -la',
    output: 'total 42',
  };

  it('renders with a simple event and shows the title', () => {
    render(createElement(RawCard, { event: baseBashEvent }));

    // The humanized type "bash" => "Bash" is used as the title
    expect(screen.getByText('Bash')).toBeInTheDocument();
  });

  it('renders a custom title when provided', () => {
    render(
      createElement(RawCard, { event: baseBashEvent, title: 'My Custom Title' }),
    );

    expect(screen.getByText('My Custom Title')).toBeInTheDocument();
  });

  it('shows key-value pairs for simple string/number data', () => {
    // Expand the card first (defaultCollapsed is true, so we click the header)
    render(createElement(RawCard, { event: baseBashEvent }));

    // The header button expands the body
    const header = screen.getByRole('button', { name: /Bash/i });
    fireEvent.click(header);

    // After destructuring {id, type, timestamp, toolUseId, status, ...data},
    // the remaining data keys are "command" and "output".
    // humanizeKey("command") => "Command", humanizeKey("output") => "Output"
    expect(screen.getByText('Command')).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('total 42')).toBeInTheDocument();
  });

  it('toggle button switches to raw JSON view', () => {
    render(createElement(RawCard, { event: baseBashEvent }));

    // The toggle button shows "< >" initially (formatted mode)
    const toggleBtn = screen.getByTitle('Show raw JSON');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn.textContent).toBe('< >');

    // Click the toggle to switch to raw JSON
    fireEvent.click(toggleBtn);

    // Now it should show "{ }" (raw mode)
    expect(toggleBtn.textContent).toBe('{ }');
    expect(toggleBtn.title).toBe('Show formatted');
  });

  it('handles empty data gracefully', () => {
    const minimalEvent = {
      id: 'test-empty',
      type: 'bash' as const,
      status: 'done',
    };

    render(createElement(RawCard, { event: minimalEvent }));

    // Should render without crashing
    expect(screen.getByText('Bash')).toBeInTheDocument();

    // Expand and verify no key-value pairs crash the render
    const header = screen.getByRole('button', { name: /Bash/i });
    fireEvent.click(header);

    // With no extra data entries, the pairs div should be empty or show the
    // raw JSON view (empty object). Either way, it should not throw.
    expect(screen.getByTestId('card-base')).toBeInTheDocument();
  });

  it('displays the badge with the event type', () => {
    render(createElement(RawCard, { event: baseBashEvent }));

    // CardBase receives badge={type} which is "bash"
    const badges = screen.getAllByText('bash');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
