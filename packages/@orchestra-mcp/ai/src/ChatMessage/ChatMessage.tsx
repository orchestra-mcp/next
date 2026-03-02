"use client";

import type { ReactNode } from 'react';
import { useState, useRef, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, MessageAction } from '../types/message';
import type { ClaudeCodeEvent } from '../types/events';
import type { ContextMenuAction } from '../ChatMessageContextMenu';
import { ChatMarkdown } from '../ChatMarkdown';
import { ChatStreamMessage } from '../ChatStreamMessage';
import { ChatThinkingMessage } from '../ChatThinkingMessage';
import { ChatMessageActions } from '../ChatMessageActions';
import { ChatMessageContextMenu } from '../ChatMessageContextMenu';
import { EventCardRenderer } from '../cards';
import { TimelineLayout } from '../TimelineLayout';
import { TimelineNode } from '../TimelineLayout';
import type { CardStatus } from '../types/events';
import './ChatMessage.css';

export interface ChatMessageProps {
  message: ChatMessageType;
  senderName?: string;
  avatar?: ReactNode;
  renderMarkdown?: boolean;
  actions?: MessageAction[];
  contextActions?: ContextMenuAction[];
  onContextAction?: (actionId: string, messageId: string) => void;
  onFileClick?: (filePath: string, line?: number) => void;
  onOpenInWindow?: (event: ClaudeCodeEvent) => void;
  onQuestionAnswer?: (requestId: string, answers: Record<string, string>) => void;
  className?: string;
}

export const ChatMessage = ({
  message,
  senderName,
  avatar,
  renderMarkdown,
  actions = [],
  contextActions,
  onContextAction,
  onFileClick,
  onOpenInWindow,
  onQuestionAnswer,
  className,
}: ChatMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { role, content, streaming, thinking, thinkingStreaming, events, timestamp, attachments } = message;

  // Track if this message ever streamed — keep ChatStreamMessage mounted so it
  // can finish its char-by-char animation even after streaming flips to false
  const wasStreamingRef = useRef(false);
  if (streaming) wasStreamingRef.current = true;
  const useStreamRenderer = role === 'assistant' && wasStreamingRef.current;

  // Glow border is only active while streaming is live — stops as soon as session ends
  const handleStreamComplete = useCallback(() => {}, []);
  const showGlow = !!streaming;

  const handleCtxAction = useCallback((actionId: string) => {
    onContextAction?.(actionId, message.id);
  }, [onContextAction, message.id]);

  const shouldRenderMarkdown = renderMarkdown ?? (role === 'assistant');

  // Hide bubble when content + thinking are empty (events-only or waiting for first chunk)
  const hasTextContent = content.length > 0;
  const hasThinking = Boolean(thinking);
  const showBubble = hasTextContent || hasThinking || role !== 'assistant';

  const cls = [
    'chat-msg',
    `chat-msg--${role}`,
    className,
  ].filter(Boolean).join(' ');

  // Events-only message (no bubble, just cards) — e.g. tool calls before text arrives
  const hasEvents = events && events.length > 0;
  if (!showBubble && !hasEvents && streaming) return null;

  const messageContent = (
    <div
      className={cls}
      data-testid="chat-message"
      data-role={role}
      data-message-id={message.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {role !== 'system' && avatar && (
        <div className="chat-msg__avatar">{avatar}</div>
      )}

      <div className="chat-msg__body-col">
        {role !== 'system' && senderName && (
          <span className="chat-msg__sender">{senderName}</span>
        )}

        {message.forwardedFrom && (
          <div className="chat-msg__forwarded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l7 7h-4v6h-6v-6H5l7-7z" transform="rotate(90 12 12)"/></svg>
            <span>Forwarded</span>
          </div>
        )}

        {hasThinking && (
          <div className="chat-msg__thinking">
            <ChatThinkingMessage
              content={thinking!}
              streaming={thinkingStreaming}
            />
          </div>
        )}

        {hasEvents && (
          <div className="chat-msg__events">
            <TimelineLayout>
              {events.map((event) => (
                <TimelineNode
                  key={event.id}
                  status={(event.status as CardStatus) || 'done'}
                  nodeType="tool"
                >
                  <EventCardRenderer
                    event={event}
                    onFileClick={onFileClick}
                    onOpenInWindow={onOpenInWindow}
                    onQuestionAnswer={onQuestionAnswer}
                  />
                </TimelineNode>
              ))}
            </TimelineLayout>
          </div>
        )}

        {showBubble && (
          <div className="chat-msg__bubble" data-streaming={showGlow ? 'true' : undefined}>
            <div className="chat-msg__content">
              {useStreamRenderer ? (
                <ChatStreamMessage
                  content={content}
                  streaming={!!streaming}
                  renderMarkdown={shouldRenderMarkdown}
                  onStreamComplete={handleStreamComplete}
                />
              ) : shouldRenderMarkdown ? (
                <ChatMarkdown content={content} />
              ) : (
                <span className="chat-msg__text">{content}</span>
              )}
            </div>

            {attachments && attachments.length > 0 && (
              <div className="chat-msg__attachments">
                {attachments.map((att, i) => (
                  <div key={i} className="chat-msg__attachment">
                    {att.type.startsWith('image/') && att.preview ? (
                      <img src={att.preview} alt={att.name} className="chat-msg__attachment-img" draggable={false} />
                    ) : (
                      <div className="chat-msg__attachment-file">
                        <span className="chat-msg__attachment-name">{att.name}</span>
                        <span className="chat-msg__attachment-size">{formatBytes(att.size)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {actions.length > 0 && (
              <ChatMessageActions
                messageId={message.id}
                actions={actions}
                visible={isHovered}
              />
            )}
          </div>
        )}

        {timestamp && !streaming && (
          <div className="chat-msg__meta">
            {(message.starred || message.pinned) && (
              <div className="chat-msg__badges">
                {message.pinned && (
                  <span className="chat-msg__badge chat-msg__badge--pin" title="Pinned">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2H8L6 7l2 4-3 7h4v4l1 2 1-2v-4h4l-3-7 2-4z"/></svg>
                  </span>
                )}
                {message.starred && (
                  <span className="chat-msg__badge chat-msg__badge--star" title="Starred">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </span>
                )}
              </div>
            )}
            <time className="chat-msg__time" dateTime={timestamp}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </time>
          </div>
        )}
      </div>
    </div>
  );

  if (contextActions?.length && onContextAction) {
    return (
      <ChatMessageContextMenu actions={contextActions} onAction={handleCtxAction}>
        {messageContent}
      </ChatMessageContextMenu>
    );
  }

  return messageContent;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
