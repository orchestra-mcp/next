import type { McpEvent } from '../types/events';
import { parseMcpResponse, extractToolName } from './parseMcpResponse';
import { TaskDetailCard } from './TaskDetailCard';
import { EpicCard } from './EpicCard';
import { StoryCard } from './StoryCard';
import { ProjectStatusCard } from './ProjectStatusCard';
import { ProjectTreeCard } from './ProjectTreeCard';
import { SprintCard } from './SprintCard';
import { BurndownChartCard } from './BurndownChartCard';
import { VelocityCard } from './VelocityCard';
import { StandupCard } from './StandupCard';
import { McpCard } from './McpCard';
import { PRDSessionCard } from './PRDSessionCard';
import { MemoryCard } from './MemoryCard';
import { SessionCard } from './SessionCard';
import { GitHubPRCard } from './GitHubPRCard';
import { GitHubIssueCard } from './GitHubIssueCard';
import { CIStatusCard } from './CIStatusCard';
import { GateCard } from './GateCard';
import { WorkflowStatusCard } from './WorkflowStatusCard';
import { PreviewCard } from './PreviewCard';
import { FigmaCard } from './FigmaCard';
import { ListCard } from './ListCard';
import { SearchCard } from './SearchCard';
import { WipLimitCard } from './WipLimitCard';
import { ConfirmationCard } from './ConfirmationCard';
import { NoteCard } from './NoteCard';
import { TeamCard } from './TeamCard';
import { DependencyGraphCard } from './DependencyGraphCard';
import { HookEventCard } from './HookEventCard';
import { UsageCard } from './UsageCard';
import { PrdContentCard } from './PrdContentCard';
import { AgentBriefingCard } from './AgentBriefingCard';
import { PrdPhasesCard } from './PrdPhasesCard';
import { PrdValidationCard } from './PrdValidationCard';

export interface McpCardRouterProps {
  event: McpEvent;
  className?: string;
  onFileClick?: (path: string, line?: number) => void;
  onOpenInWindow?: (event: McpEvent) => void;
}

/**
 * Routes MCP events to specialized card components based on tool name
 * and parsed response type. Falls back to the generic McpCard for
 * unmapped tools.
 */
export const McpCardRouter = ({
  event,
  className,
}: McpCardRouterProps) => {
  // Only attempt routing when we have a result to parse
  if (!event.result) {
    return <McpCard event={event} className={className} />;
  }

  const shortName = extractToolName(event.toolName);
  const parsed = parseMcpResponse(event.toolName, event.result);

  // Route by parsed result type
  switch (parsed.type) {
    case 'task':
      return <TaskDetailCard data={parsed.data} className={className} />;

    case 'epic':
      return <EpicCard data={parsed.data as any} className={className} />;

    case 'story':
      return <StoryCard data={parsed.data as any} className={className} />;

    case 'project':
      // get_project_status returns project-level data
      return <ProjectStatusCard data={parsed.data as any} className={className} />;

    case 'sprint':
      return <SprintCard data={parsed.data} className={className} />;

    case 'burndown':
      return <BurndownChartCard data={parsed.data} className={className} />;

    case 'velocity':
      return <VelocityCard data={parsed.data} className={className} />;

    case 'standup':
      return <StandupCard data={parsed.data} className={className} />;

    case 'prd_session':
      return <PRDSessionCard data={parsed.data} className={className} />;

    case 'github_pr':
      return <GitHubPRCard data={parsed.data} className={className} />;

    case 'github_issue':
      return <GitHubIssueCard data={parsed.data} className={className} />;

    case 'memory':
      return <MemoryCard data={parsed.data} className={className} />;

    case 'session':
      return <SessionCard data={parsed.data} className={className} />;

    case 'ci_status':
      return <CIStatusCard data={parsed.data} className={className} />;

    case 'gate':
      return <GateCard data={parsed.data} className={className} />;

    case 'workflow':
      return <WorkflowStatusCard data={parsed.data} className={className} />;

    case 'preview':
      return <PreviewCard data={parsed.data} className={className} />;

    case 'figma_embed':
      return <FigmaCard data={parsed.data} className={className} />;

    case 'list':
      return <ListCard data={parsed.data} className={className} />;

    case 'search':
      return <SearchCard data={parsed.data} className={className} />;

    case 'wip_limit':
      return <WipLimitCard data={parsed.data} className={className} />;

    case 'confirmation':
      return <ConfirmationCard data={parsed.data} className={className} />;

    case 'note':
      return <NoteCard data={parsed.data} className={className} />;

    case 'team':
      return <TeamCard data={parsed.data} className={className} />;

    case 'dependency_graph':
      return <DependencyGraphCard data={parsed.data} className={className} />;

    case 'hook_events':
      return <HookEventCard data={parsed.data} className={className} />;

    case 'usage':
      return <UsageCard data={parsed.data} className={className} />;

    case 'prd_content':
      return <PrdContentCard data={parsed.data} className={className} />;

    case 'agent_briefing':
      return <AgentBriefingCard data={parsed.data} className={className} />;

    case 'prd_phases':
      return <PrdPhasesCard data={parsed.data} className={className} />;

    case 'prd_validation':
      return <PrdValidationCard data={parsed.data} className={className} />;

    default:
      break;
  }

  // Tool-name based routing for tools that don't parse into typed results
  if (shortName === 'get_project_tree') {
    try {
      const treeData = typeof event.result === 'string'
        ? JSON.parse(event.result)
        : event.result;
      if (treeData && treeData.epics) {
        return <ProjectTreeCard data={treeData} className={className} />;
      }
    } catch { /* fall through */ }
  }

  // Fallback: generic MCP card
  return <McpCard event={event} className={className} />;
};
