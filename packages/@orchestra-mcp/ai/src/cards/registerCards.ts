import { CardRegistry } from './CardRegistry';
import { BashCard } from './BashCard';
import { GrepCard } from './GrepCard';
import { ReadCard } from './ReadCard';
import { GlobCard } from './GlobCard';
import { TaskCard } from './TaskCard';
import { TodoListCard } from './TodoListCard';
import { McpCardRouter } from './McpCardRouter';
import { OrchestraCard } from './OrchestraCard';
import { EditCard } from './EditCard';
import { CreateCard } from './CreateCard';
import { SubAgentCard } from './SubAgentCard';
import { PlanCard } from './PlanCard';
import { SkillCard } from './SkillCard';
import { AgentSwitchCard } from './AgentSwitchCard';
import { WebSearchCard } from './WebSearchCard';
import { WebFetchCard } from './WebFetchCard';
import { registerPreviewCard } from './PreviewCard';
import { registerFigmaCard } from './FigmaCard';
import { SmartComponentCard } from './SmartComponentCard';
import { ExportCard } from './ExportCard';
import { QuestionCard } from './QuestionCard';

let registered = false;

/** Register all built-in cards. Safe to call multiple times. */
export function registerBuiltinCards(): void {
  if (registered) return;
  registered = true;

  CardRegistry.register('bash', {
    component: BashCard as any,
    category: 'terminal',
    label: 'Bash',
  });

  CardRegistry.register('grep', {
    component: GrepCard as any,
    category: 'search',
    label: 'Grep',
  });

  CardRegistry.register('read', {
    component: ReadCard as any,
    category: 'file',
    label: 'Read File',
  });

  CardRegistry.register('glob', {
    component: GlobCard as any,
    category: 'search',
    label: 'Glob',
  });

  CardRegistry.register('task', {
    component: TaskCard as any,
    category: 'orchestra',
    label: 'Task',
  });

  CardRegistry.register('todo_list', {
    component: TodoListCard as any,
    category: 'todo',
    label: 'Todo List',
  });

  CardRegistry.register('mcp', {
    component: McpCardRouter as any,
    category: 'mcp',
    label: 'MCP Tool',
  });

  CardRegistry.register('orchestra', {
    component: OrchestraCard as any,
    category: 'orchestra',
    label: 'Orchestra',
  });

  CardRegistry.register('edit', {
    component: EditCard as any,
    category: 'file',
    label: 'Edit File',
  });

  CardRegistry.register('create', {
    component: CreateCard as any,
    category: 'file',
    label: 'Create File',
  });

  CardRegistry.register('sub_agent', {
    component: SubAgentCard as any,
    category: 'subagent',
    label: 'Sub Agent',
  });

  CardRegistry.register('plan', {
    component: PlanCard as any,
    category: 'plan',
    label: 'Plan',
  });

  CardRegistry.register('skill', {
    component: SkillCard as any,
    category: 'skill',
    label: 'Skill',
  });

  CardRegistry.register('agent_switch', {
    component: AgentSwitchCard as any,
    category: 'agent',
    label: 'Agent Switch',
  });

  CardRegistry.register('web_search', {
    component: WebSearchCard as any,
    category: 'web',
    label: 'Web Search',
  });

  CardRegistry.register('web_fetch', {
    component: WebFetchCard as any,
    category: 'web',
    label: 'Web Fetch',
  });

  registerPreviewCard();
  registerFigmaCard();

  CardRegistry.register('save_component', {
    component: SmartComponentCard as any,
    category: 'design' as any,
    label: 'Smart Component',
  });

  CardRegistry.register('list_components', {
    component: SmartComponentCard as any,
    category: 'design' as any,
    label: 'Component Library',
  });

  CardRegistry.register('export_component', {
    component: ExportCard as any,
    category: 'design' as any,
    label: 'Component Export',
  });

  CardRegistry.register('question', {
    component: QuestionCard as any,
    category: 'mcp',
    label: 'Question',
  });
}
