import type { ReactNode } from 'react';
import type { ClaudeCodeEvent } from './events';

/** A file attached to a chat message (pending upload or already sent) */
export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  /** MIME type */
  type: string;
  /** Data URL for image previews */
  preview?: string;
  /** The raw File object (not persisted) */
  file: File;
}

export type MessageRole = 'user' | 'assistant' | 'system';

/** Mention group categories (duplicated from MentionPopup to avoid circular deps) */
export type MentionGroup = 'files' | 'tasks' | 'sessions' | 'epics' | 'agents' | 'skills';

/** A resolved @mention reference within a message (includes positional data) */
export interface MentionReference {
  id: string;
  label: string;
  group: MentionGroup;
  /** Start index of @label in the message content string */
  startIndex: number;
  /** End index (exclusive) */
  endIndex: number;
}

/** A lightweight @mention reference (no positional data — used for input tracking) */
export interface MentionRef {
  /** The label as it appears in text (after @) */
  label: string;
  /** The entity's unique ID */
  id: string;
  /** What type of entity */
  group: MentionGroup;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  /** If true, message is still streaming */
  streaming?: boolean;
  /** Thinking/reasoning content (collapsible) */
  thinking?: string;
  /** Whether thinking is still streaming */
  thinkingStreaming?: boolean;
  /** Claude Code tool events embedded in this message */
  events?: ClaudeCodeEvent[];
  /** Model that generated this message */
  model?: string;
  /** Token usage */
  tokensIn?: number;
  tokensOut?: number;
  /** Cost in USD */
  cost?: number;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Whether content is markdown (assistant messages default true) */
  markdown?: boolean;
  /** Whether this message is starred */
  starred?: boolean;
  /** Whether this message is pinned */
  pinned?: boolean;
  /** Metadata when this message was forwarded from another session */
  forwardedFrom?: {
    sessionId: string;
    messageId: string;
    forwardedAt: string;
  };
  /** Structured mention references in this message */
  mentions?: MentionReference[];
  /** Files attached to this message */
  attachments?: Array<{ name: string; size: number; type: string; preview?: string }>;
}

export interface StreamChunk {
  /** Message ID this chunk belongs to */
  messageId: string;
  /** Text delta to append */
  delta: string;
  /** Whether this chunk is for the thinking section */
  isThinking?: boolean;
  /** Whether streaming is complete */
  done?: boolean;
}

export interface MessageAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: (messageId: string) => void;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  prompt: string;
  /** Accent color for hover border */
  color?: string;
}

export interface StartupPrompt {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  icon?: ReactNode;
  /** Accent color for hover border and icon */
  color?: string;
}
