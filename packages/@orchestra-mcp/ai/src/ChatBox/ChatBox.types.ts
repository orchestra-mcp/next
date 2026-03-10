import type { ReactNode } from 'react';
import type { AttachedFile, ChatMessage, MessageAction, QuickAction, StartupPrompt, MentionRef } from '../types/message';
import type { AIModel, ChatMode } from '../types/models';
import type { ClaudeCodeEvent } from '../types/events';
import type { ChatSession } from '../ChatHeader/ChatHeader';
import type { ContextMenuAction } from '../ChatMessageContextMenu';
import type { MentionItem as PopupMentionItem } from '../MentionPopup';
import type { CommandItem } from '../CommandPalette';
import type { WindowMode } from '../ModeToggle/ModeToggle';

/** Extended mention item — ChatBox receives all groups (including agents/skills) then routes them */
export interface ChatBoxMentionItem extends Omit<PopupMentionItem, 'group'> {
  group: PopupMentionItem['group'] | 'agents' | 'skills';
}

export interface ChatBoxProps {
  /** Messages to display */
  messages: ChatMessage[];
  /** Called when user sends a message (mentions and file attachments included if any exist) */
  onSend: (text: string, mentions?: MentionRef[], attachments?: AttachedFile[]) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Disable input */
  disabled?: boolean;
  /** Show typing indicator */
  typing?: boolean;
  /** Status text shown during typing (e.g., "Analyzing project~") */
  typingStatus?: string;
  /** Whether currently sending/streaming */
  sending?: boolean;
  /** Header title (fallback when no sessions) */
  title?: string;
  /** Close callback (shows X button) */
  onClose?: () => void;
  /** Minimize callback (shows - button) */
  onMinimize?: () => void;
  /** Stop generation callback */
  onStop?: () => void;
  /** Available models */
  models?: AIModel[];
  /** Currently selected model */
  selectedModelId?: string;
  /** Model change callback */
  onModelChange?: (modelId: string) => void;
  /** Current chat mode */
  mode?: ChatMode;
  /** Mode change callback */
  onModeChange?: (mode: ChatMode) => void;
  /** Thinking toggle state */
  showThinking?: boolean;
  /** Thinking toggle callback */
  onThinkingToggle?: (enabled: boolean) => void;
  /** Quick action chips */
  quickActions?: QuickAction[];
  /** Startup prompts for empty state */
  startupPrompts?: StartupPrompt[];
  /** Loading messages shown in the status line while the agent is working */
  loadingMessages?: string[];
  /** Hover actions for messages */
  messageActions?: MessageAction[];
  /** Display name for user */
  userName?: string;
  /** Display name for assistant */
  assistantName?: string;
  /** Avatar for user messages */
  userAvatar?: ReactNode;
  /** Avatar for assistant messages */
  assistantAvatar?: ReactNode;
  /** Footer slot (status bar) */
  footer?: ReactNode;
  /** File click handler for event cards */
  onFileClick?: (filePath: string, line?: number) => void;
  /** Open event in a separate window */
  onOpenInWindow?: (event: ClaudeCodeEvent) => void;
  /** Called when user submits answers to an inline AskUserQuestion card */
  onQuestionAnswer?: (requestId: string, answers: Record<string, string>) => void;
  /** Called when user approves or denies a permission request */
  onPermissionDecision?: (requestId: string, decision: 'approve' | 'deny') => void;
  /** Whether there are more messages to load */
  hasMoreMessages?: boolean;
  /** Callback when user scrolls to top and more messages should be loaded */
  onLoadMore?: () => void;
  /** Session list for header dropdown */
  sessions?: ChatSession[];
  /** Currently active session ID */
  activeSessionId?: string | null;
  /** Called when user picks a different session */
  onSessionSelect?: (id: string) => void;
  /** Called when user deletes a session from the dropdown */
  onSessionDelete?: (id: string) => void;
  /** Context menu actions shown on right-click of each message */
  contextActions?: ContextMenuAction[];
  /** Called when a context menu action is clicked */
  onContextAction?: (actionId: string, messageId: string) => void;
  /** Called when user clicks the + new chat button */
  onNewChat?: () => void;
  /** Pre-fill input with a reply quote (set to trigger, cleared by ChatBox) */
  replyQuote?: string | null;
  /** Called after replyQuote is consumed */
  onReplyQuoteConsumed?: () => void;
  /** Show shimmer loading skeleton (initial load) */
  loading?: boolean;
  /** Items available for @mention autocomplete (includes all groups — ChatBox routes agents/skills to / commands) */
  mentionItems?: ChatBoxMentionItem[];
  /** Items available for /command autocomplete */
  commandItems?: CommandItem[];
  /** Project slug used for backend mention search (tasks, epics) */
  project?: string;
  /** Whether screen awareness (auto-capture) is enabled */
  screenAwareness?: boolean;
  /** Toggle screen awareness on/off */
  onScreenAwarenessToggle?: (enabled: boolean) => void;
  /** Whether browser awareness (include current web page) is enabled */
  browserAwareness?: boolean;
  /** Toggle browser awareness on/off */
  onBrowserAwarenessToggle?: (enabled: boolean) => void;
  /** Current auto-approve mode ('all' | 'none') */
  autoApprove?: 'all' | 'none';
  /** Called when user changes auto-approve from the tray */
  onAutoApproveChange?: (value: 'all' | 'none') => void;
  /** Current window mode (embedded/floating/bubble) */
  windowMode?: WindowMode;
  /** Window mode change callback */
  onWindowModeChange?: (mode: WindowMode) => void;
  /** Current active view (for view toggle button) */
  activeView?: 'chat' | 'projects' | 'search' | 'extensions' | 'notes' | 'devtools' | 'integrations' | 'settings';
  /** View change callback (for view toggle button) */
  onViewChange?: (view: 'chat' | 'projects' | 'search' | 'extensions' | 'notes' | 'devtools' | 'integrations' | 'settings') => void;
  /** Additional CSS class */
  className?: string;
  /** Voice input button rendered in the tray tools row (right side, before attach + send) */
  voiceButton?: ReactNode;
  /** Full-width voice overlay rendered between tray and spacer — hides the spacer when set */
  voiceTrayOverlay?: ReactNode;
}

export type { ChatMessage, ChatSession };
