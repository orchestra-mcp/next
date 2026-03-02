// @orchestra-mcp/ai — AI interaction components

// Types
export type {
  AttachedFile,
  MessageRole,
  MentionGroup as MentionGroupType,
  MentionReference,
  MentionRef,
  ChatMessage,
  StreamChunk,
  MessageAction,
  QuickAction,
  StartupPrompt,
} from './types/message';

export type {
  ClaudeCodeEventType,
  BaseEvent,
  BashEvent,
  GrepMatch,
  GrepEvent,
  TaskEvent,
  TodoItem,
  TodoListEvent,
  McpEvent,
  OrchestraEvent,
  EditEvent,
  CreateEvent,
  ReadEvent,
  GlobEvent,
  SubAgentActivity,
  SubAgentEvent,
  PlanEvent,
  WebSearchResult,
  WebSearchEvent,
  WebFetchEvent,
  SkillEvent,
  AgentSwitchEvent,
  GateEvent,
  TerminalEvent,
  McpRoutedEvent,
  PreviewCodePayload,
  PreviewEvent,
  CardStatus,
  CardCategory,
  ClaudeCodeEvent,
} from './types/events';

export type { AIModel, ChatMode } from './types/models';
export { CHAT_MODES, DEFAULT_MODELS } from './types/models';

// Hooks
export { useDragPosition } from './hooks/useDragPosition';
export { useAutoResize } from './hooks/useAutoResize';
export { useAutoScroll } from './hooks/useAutoScroll';
export { useStreamRenderer } from './hooks/useStreamRenderer';
export { useMentionTrigger } from './hooks/useMentionTrigger';
export type { UseMentionTriggerOptions, UseMentionTriggerResult } from './hooks/useMentionTrigger';
export { useMentionTokens } from './hooks/useMentionTokens';
export type { UseMentionTokensResult, MentionTokenItem } from './hooks/useMentionTokens';
export { useCommandTrigger } from './hooks/useCommandTrigger';
export type { UseCommandTriggerOptions, UseCommandTriggerResult } from './hooks/useCommandTrigger';
export { useAttachments } from './hooks/useAttachments';
export type { UseAttachmentsResult } from './hooks/useAttachments';
export { useMentionSearch } from './hooks/useMentionSearch';
export type { UseMentionSearchOptions, UseMentionSearchResult } from './hooks/useMentionSearch';
export { useScreenshot } from './hooks/useScreenshot';
export type { UseScreenshotResult } from './hooks/useScreenshot';
export { useTodoPin } from './hooks/useTodoPin';
export type { UseTodoPinResult } from './hooks/useTodoPin';
export { useTerminalSessions } from './hooks/useTerminalSessions';
export type { UseTerminalSessionsResult, TerminalSession } from './hooks/useTerminalSessions';

// ChatBox (orchestrator)
export { ChatBox } from './ChatBox';
export type { ChatBoxProps, ChatBoxMentionItem } from './ChatBox/ChatBox.types';

// Chat sub-components
export { ChatHeader } from './ChatHeader';
export type { ChatHeaderProps, ChatSession } from './ChatHeader';

export { ChatBody } from './ChatBody';
export type { ChatBodyProps } from './ChatBody';

export { ChatMessage as ChatMessageBubble } from './ChatMessage';
export type { ChatMessageProps } from './ChatMessage';

export { ChatInput } from './ChatInput';
export type { ChatInputProps } from './ChatInput';

export { ChatMarkdown } from './ChatMarkdown';
export type { ChatMarkdownProps } from './ChatMarkdown';

export { ChatStreamMessage } from './ChatStreamMessage';
export type { ChatStreamMessageProps } from './ChatStreamMessage';

export { ChatThinkingMessage } from './ChatThinkingMessage';
export type { ChatThinkingMessageProps } from './ChatThinkingMessage';

export { ChatTypingIndicator } from './ChatTypingIndicator';
export type { ChatTypingIndicatorProps } from './ChatTypingIndicator';

export { ChatMessageActions } from './ChatMessageActions';
export type { ChatMessageActionsProps } from './ChatMessageActions';

export { ChatQuickActions } from './ChatQuickActions';
export type { ChatQuickActionsProps } from './ChatQuickActions';

export { ChatStartupPrompts } from './ChatStartupPrompts';
export type { ChatStartupPromptsProps } from './ChatStartupPrompts';

export { ChatModelSelector } from './ChatModelSelector';
export type { ChatModelSelectorProps } from './ChatModelSelector';

export { ChatModeSelector } from './ChatModeSelector';
export type { ChatModeSelectorProps } from './ChatModeSelector';

export { ChatThinkingToggle } from './ChatThinkingToggle';
export type { ChatThinkingToggleProps } from './ChatThinkingToggle';

// ChatMessageContextMenu (per-message right-click menu)
export { ChatMessageContextMenu } from './ChatMessageContextMenu';
export type { ChatMessageContextMenuProps, ContextMenuAction } from './ChatMessageContextMenu';

// SessionPickerDialog (for message forwarding)
export { SessionPickerDialog } from './SessionPickerDialog';
export type { SessionPickerDialogProps, SessionPickerSession } from './SessionPickerDialog';

// AgentSelectorGrid (grid popup for agent selection)
export { AgentSelectorGrid } from './AgentSelectorGrid';
export type { AgentSelectorGridProps, AgentGridItem } from './AgentSelectorGrid';

// MentionPopup (@ mention autocomplete)
export { MentionPopup } from './MentionPopup';
export type { MentionPopupProps, MentionItem, MentionGroup } from './MentionPopup';

// CommandPalette (/ command autocomplete)
export { CommandPalette } from './CommandPalette';
export type { CommandPaletteProps, CommandItem, CommandGroup } from './CommandPalette';

// FilePreview (attached file thumbnails strip)
export { FilePreview } from './FilePreview';
export type { FilePreviewProps, FilePreviewItem } from './FilePreview';

// File attachment hook (preview generation, limits, cleanup)
export { useFileAttachments } from './hooks/useFileAttachments';
export type { UseFileAttachmentsResult } from './hooks/useFileAttachments';

// MentionToken (inline chip for @mentions)
export { MentionToken } from './MentionToken';
export type { MentionTokenProps } from './MentionToken';

// MentionTokens (mirror overlay for textarea)
export { MentionTokens } from './MentionTokens';
export type { MentionTokensProps } from './MentionTokens';

// PromptCardEditor
export { PromptCardEditor } from './PromptCardEditor';
export type { PromptCardEditorProps, PromptCard, PromptCardField } from './PromptCardEditor';

// FilesChangedPanel (Codex-style split-pane file preview)
export { FilesChangedPanel } from './FilesChangedPanel';
export type { FilesChangedPanelProps, FileChange } from './FilesChangedPanel';

// ModeToggle (window mode: embedded/floating/bubble)
export { ModeToggle } from './ModeToggle/ModeToggle';
export type { WindowMode, ModeToggleProps } from './ModeToggle/ModeToggle';

// BubbleButton
export { BubbleButton } from './BubbleButton';
export type { BubbleButtonProps, BubbleAction } from './BubbleButton';

// Event cards
export {
  CardBase,
  BashCard,
  GrepCard,
  TaskCard,
  TodoListCard,
  McpCard,
  McpCardRouter,
  OrchestraCard,
  EditCard,
  CreateCard,
  SubAgentCard,
  PlanCard,
  SkillCard,
  AgentSwitchCard,
  SprintCard,
  BurndownChartCard,
  VelocityCard,
  StandupCard,
  RetrospectiveCard,
  WipLimitCard,
  PRDSessionCard,
  PRDPreviewCard,
  PRDQuestionCard,
  MemoryCard,
  SessionCard,
  GitHubPRCard,
  GitHubIssueCard,
  CIStatusCard,
  WebSearchCard,
  WebFetchCard,
  GateCard,
  WorkflowStatusCard,
  RawCard,
  EventCardRenderer,
  CardErrorBoundary,
  CardRegistry,
  extractMcpToolName,
  isMcpTool,
  registerBuiltinCards,
  humanizeKey,
  parseMcpResponse,
  extractToolName,
} from './cards';

export type {
  CardBaseProps,
  BashCardProps,
  GrepCardProps,
  TaskCardProps,
  TodoListCardProps,
  McpCardProps,
  McpCardRouterProps,
  OrchestraCardProps,
  EditCardProps,
  CreateCardProps,
  SubAgentCardProps,
  PlanCardProps,
  SkillCardProps,
  AgentSwitchCardProps,
  SprintCardProps,
  BurndownChartCardProps,
  VelocityCardProps,
  StandupCardProps,
  RetrospectiveCardProps,
  RetroData,
  WipLimitCardProps,
  WipLimitData,
  PRDSessionCardProps,
  PRDPreviewCardProps,
  PrdPreviewData,
  PRDQuestionCardProps,
  MemoryCardProps,
  MemorySearchData,
  SessionCardProps,
  SessionData,
  GitHubPRCardProps,
  GitHubIssueCardProps,
  CIStatusCardProps,
  CIStatusData,
  WebSearchCardProps,
  WebFetchCardProps,
  GateCardProps,
  GateTransitionData,
  WorkflowStatusCardProps,
  RawCardProps,
  EventCardRendererProps,
  CardRegistration,
  McpParsedResult,
} from './cards';

// Timeline Layout
export { TimelineLayout } from './TimelineLayout';
export type { TimelineLayoutProps } from './TimelineLayout';
export { TimelineNode } from './TimelineLayout';
export type { TimelineNodeProps } from './TimelineLayout';

// SubAgentPage (full-page agent conversation view)
export { SubAgentPage } from './SubAgentPage';
export type { SubAgentPageProps } from './SubAgentPage';

// TerminalPage (full-page terminal session view)
export { TerminalPage } from './TerminalPage';
export type { TerminalPageProps } from './TerminalPage';

// FileEditorPage (full-page Monaco editor with tabs)
export { FileEditorPage } from './FileEditorPage';
export type { FileEditorPageProps, FileTab } from './FileEditorPage';

// Preview system (sandboxed iframe renderer + WebSocket sync)
export { PreviewFrame, PreviewViewportToolbar, buildSrcdoc, usePreviewSession } from './Preview';
export type {
  PreviewCode,
  PreviewViewport,
  PreviewFrameProps,
  PreviewViewportToolbarProps,
  UsePreviewSessionOptions,
  UsePreviewSessionReturn,
} from './Preview';

export { PreviewCard, registerPreviewCard } from './cards/PreviewCard';
export type { PreviewCardData, PreviewCardProps } from './cards/PreviewCard';
