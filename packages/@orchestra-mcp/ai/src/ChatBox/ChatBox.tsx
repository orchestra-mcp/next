"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { ChatBody } from '../ChatBody';
import { ChatMessage as ChatMsgBubble } from '../ChatMessage';
import { ChatTypingIndicator } from '../ChatTypingIndicator';
import { ChatInput } from '../ChatInput';
import { ChatStartupPrompts } from '../ChatStartupPrompts';
import { MentionPopup } from '../MentionPopup';
import type { MentionItem } from '../MentionPopup';
import { CommandPalette } from '../CommandPalette';
import type { CommandItem } from '../CommandPalette';
import { useMentionTrigger } from '../hooks/useMentionTrigger';
import { useCommandTrigger } from '../hooks/useCommandTrigger';
import { useMentionTokens } from '../hooks/useMentionTokens';
import { useMentionSearch } from '../hooks/useMentionSearch';
import { useAttachments } from '../hooks/useAttachments';
import { useScreenshot } from '../hooks/useScreenshot';
import { FilePreview } from '../FilePreview';
import { CHAT_MODES } from '../types/models';
import { Modal, Tooltip } from '@orchestra-mcp/ui';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { ChatBoxProps, ChatBoxMentionItem } from './ChatBox.types';
import './ChatBox.css';

export type { ChatBoxProps };
export type { ChatMessage } from './ChatBox.types';

const DEFAULT_LOADING_MESSAGES = [
  'Analyzing your codebase structure',
  'Reading project context and dependencies',
  'Mapping file relationships',
  'Understanding your architecture',
  'Evaluating possible approaches',
  'Checking for edge cases',
  'Reviewing best practices',
  'Reasoning about implementation',
  'Considering performance implications',
  'Scanning relevant source files',
  'Cross-referencing documentation',
  'Building a detailed response',
  'Validating solution correctness',
  'Preparing code suggestions',
];

export const ChatBox = ({
  messages,
  onSend,
  placeholder,
  disabled = false,
  typing = false,
  typingStatus,
  sending = false,
  title,
  onClose,
  onMinimize,
  onStop,
  models,
  selectedModelId,
  onModelChange,
  mode,
  onModeChange,
  showThinking,
  onThinkingToggle,
  quickActions,
  startupPrompts,
  loadingMessages,
  messageActions,
  userName = 'You',
  assistantName = 'Assistant',
  userAvatar,
  assistantAvatar,
  footer,
  onFileClick,
  onOpenInWindow,
  onQuestionAnswer,
  hasMoreMessages,
  onLoadMore,
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  loading = false,
  contextActions,
  onContextAction,
  onNewChat,
  replyQuote,
  onReplyQuoteConsumed,
  mentionItems,
  screenAwareness,
  onScreenAwarenessToggle,
  browserAwareness,
  onBrowserAwarenessToggle,
  windowMode,
  onWindowModeChange,
  activeView,
  onViewChange,
  commandItems,
  project,
  className,
  voiceButton,
  voiceTrayOverlay,
  autoApprove,
  onAutoApproveChange,
}: ChatBoxProps) => {
  const msgs = loadingMessages?.length ? loadingMessages : DEFAULT_LOADING_MESSAGES;
  const [input, setInput] = useState('');
  const isEmpty = messages.length === 0 && !typing;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention trigger detection
  const mention = useMentionTrigger({
    value: input,
    textareaRef,
    enabled: !!(mentionItems && mentionItems.length > 0) || !!project,
  });

  // Filter mentionItems to content-only groups (exclude agents/skills — those go to / commands)
  const contentMentionItems = useMemo(
    () => (mentionItems || []).filter((m): m is MentionItem => m.group !== 'agents' && m.group !== 'skills'),
    [mentionItems],
  );

  // Backend mention search (tasks, epics) merged with static content items (files, sessions)
  const mentionSearch = useMentionSearch({
    query: mention.query,
    open: mention.open,
    staticItems: contentMentionItems,
    project,
  });

  // Mention token tracking
  const mentionTokens = useMentionTokens();

  // File attachment management
  const attachments = useAttachments();

  // Screenshot capture
  const screenshot = useScreenshot();

  // When a mention item is selected, replace @query with @label in the input
  const handleMentionSelect = useCallback(
    (item: MentionItem) => {
      const textarea = textareaRef.current;
      const cursorPos = textarea ? textarea.selectionStart : input.length;
      // Calculate where the @ is in the current value
      let atIndex = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        if (input[i] === '@') { atIndex = i; break; }
        if (input[i] === ' ' || input[i] === '\n') break;
      }

      const newValue = mention.accept(item.label);
      // The mention text is "@label " — starts at atIndex, ends at atIndex + 1 + label.length
      if (atIndex >= 0) {
        const start = atIndex;
        const end = atIndex + 1 + item.label.length; // @label (no trailing space in the highlight)
        mentionTokens.adjustForChange(input, newValue);
        mentionTokens.addMention(
          { id: item.id, label: item.label, group: item.group },
          start,
          end,
        );
      }
      setInput(newValue);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [mention, input, textareaRef, mentionTokens],
  );

  // Merge quickActions + startupPrompts into commandItems for / palette
  // Note: agents/skills already come through commandItems from useAgentRegistry — don't add them again
  const mergedCommandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = commandItems ? [...commandItems] : [];

    // Add quick actions
    for (const a of quickActions || []) {
      items.push({ id: `qa-${a.id}`, label: a.label, description: a.prompt.slice(0, 60), icon: 'bx-bolt-circle', group: 'quick-actions' });
    }

    // Add startup prompts
    for (const p of startupPrompts || []) {
      items.push({ id: `prompt-${p.id}`, label: p.title, description: p.description || p.prompt.slice(0, 60), icon: 'bx-grid-alt', group: 'prompts' });
    }

    return items;
  }, [commandItems, quickActions, startupPrompts]);

  // Command trigger detection (/ commands — uses merged items including agents, skills, quick actions, prompts)
  const command = useCommandTrigger({
    value: input,
    textareaRef,
    enabled: mergedCommandItems.length > 0 && !mention.open,
  });

  // When a command item is selected:
  // - For quick-actions/prompts: dismiss and send the prompt directly
  // - For agents: prepend @agentName to the input
  // - For skills/commands: replace /query with /label in the input
  const handleCommandSelect = useCallback(
    (item: CommandItem) => {
      if (item.group === 'quick-actions') {
        command.dismiss();
        const action = (quickActions || []).find(a => `qa-${a.id}` === item.id);
        if (action) setTimeout(() => onSend(action.prompt), 0);
        return;
      }
      if (item.group === 'prompts') {
        command.dismiss();
        const prompt = (startupPrompts || []).find(p => `prompt-${p.id}` === item.id);
        if (prompt) setTimeout(() => onSend(prompt.prompt), 0);
        return;
      }
      if (item.group === 'agents') {
        command.dismiss();
        const prefix = `@${item.label} `;
        setInput((prev) => {
          // Remove any leading /query text
          const slashIdx = prev.lastIndexOf('/');
          const before = slashIdx >= 0 ? prev.slice(0, slashIdx) : prev;
          return prefix + before;
        });
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }
      const newValue = command.accept(item.label);
      setInput(newValue);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [command, textareaRef, quickActions, startupPrompts, onSend],
  );

  // Keyboard interceptor: when mention or command popup is open, let the popup handle certain keys
  const handleInterceptKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): boolean => {
      const isPopupOpen = mention.open || command.open;
      if (!isPopupOpen) return false;
      // These keys are handled by the popup's document-level keydown listener
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Enter' ||
        e.key === 'Tab' ||
        e.key === 'Escape'
      ) {
        return true; // Tell ChatInput to skip its own handling
      }
      return false;
    },
    [mention.open, command.open],
  );

  // Apply reply quote when it changes
  useEffect(() => {
    if (replyQuote) {
      setInput(replyQuote);
      mentionTokens.clearMentions();
      onReplyQuoteConsumed?.();
    }
  }, [replyQuote, onReplyQuoteConsumed, mentionTokens]);

  // Startup prompts modal (lives here so it survives empty→non-empty transition)
  const [promptsModalOpen, setPromptsModalOpen] = useState(false);
  const [promptsSearch, setPromptsSearch] = useState('');

  // Derived: selected model name
  const selectedModelName = useMemo(() => {
    if (!models || !selectedModelId) return undefined;
    return models.find(m => m.id === selectedModelId)?.name;
  }, [models, selectedModelId]);

  // Model dropdown open state (for status bar)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    if (!startupPrompts?.length) return [];
    if (!promptsSearch.trim()) return startupPrompts;
    const q = promptsSearch.toLowerCase();
    return startupPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.prompt.toLowerCase().includes(q),
    );
  }, [startupPrompts, promptsSearch]);

  // Wrap setInput to also adjust mention positions
  const handleInputChange = useCallback(
    (newValue: string) => {
      mentionTokens.adjustForChange(input, newValue);
      setInput(newValue);
    },
    [input, mentionTokens],
  );

  // Remove a mention chip and strip its text from the input
  const handleMentionRemove = useCallback(
    (id: string) => {
      const ref = mentionTokens.mentions.find((m) => m.id === id);
      if (ref) {
        const before = input.slice(0, ref.startIndex);
        const after = input.slice(ref.endIndex);
        // Remove trailing space if present after the mention
        const newValue = after.startsWith(' ') ? before + after.slice(1) : before + after;
        mentionTokens.removeMention(id);
        mentionTokens.adjustForChange(input, newValue);
        setInput(newValue);
      }
    },
    [input, mentionTokens],
  );

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    const mentionRefs = mentionTokens.mentions.length > 0 ? [...mentionTokens.mentions] : undefined;
    const attached = attachments.files.length > 0 ? [...attachments.files] : undefined;
    onSend(text, mentionRefs, attached);
    setInput('');
    mentionTokens.clearMentions();
    attachments.clearFiles();
  };

  const handlePromptSelect = useCallback((prompt: string) => {
    if (!prompt) return;
    setPromptsModalOpen(false);
    setPromptsSearch('');
    // Defer send to next tick so modal portal fully unmounts first
    setTimeout(() => onSend(prompt), 0);
  }, [onSend]);

  const handleShowMore = useCallback(() => {
    setPromptsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setPromptsModalOpen(false);
    setPromptsSearch('');
  }, []);

  // Screenshot handler
  const handleScreenshot = useCallback(async () => {
    const file = await screenshot.captureScreenshot();
    if (file) {
      attachments.addFiles([file]);
    }
  }, [screenshot, attachments]);

  // Status bar feature flags
  const hasMode = mode !== undefined && onModeChange;
  const hasThinking = showThinking !== undefined && onThinkingToggle;
  const hasModel = models && models.length > 0 && selectedModelId && onModelChange;
  const hasScreenshot = screenshot.supported;
  const hasScreenAwareness = onScreenAwarenessToggle !== undefined;
  const hasBrowserAwareness = onBrowserAwarenessToggle !== undefined;
  const hasStatusBar = hasMode || hasThinking || hasModel || hasScreenshot || hasScreenAwareness || hasBrowserAwareness;

  // Elapsed timer for typing indicator
  const timerRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!typing) {
      setElapsed(0);
      return;
    }
    timerRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timerRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [typing]);

  // Rotating loading messages when typing and no explicit typingStatus
  const [rotatingMessage, setRotatingMessage] = useState(msgs[0]);
  const msgIndexRef = useRef(0);

  useEffect(() => {
    if (!typing) {
      setRotatingMessage(msgs[0]);
      msgIndexRef.current = 0;
      return;
    }
    // Only rotate when there is no explicit typingStatus
    if (typingStatus) return;

    const interval = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % msgs.length;
      setRotatingMessage(msgs[msgIndexRef.current]);
    }, 4500);
    return () => clearInterval(interval);
  }, [typing, typingStatus, msgs]);

  const displayedStatus = typingStatus || rotatingMessage;

  const cls = ['chatbox', className].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={cls} data-testid="chatbox">
        <div className="chatbox-skeleton" data-testid="chatbox-skeleton">
          {/* Header skeleton */}
          <div className="chatbox-skeleton__header">
            <div className="chatbox-skeleton__pill chatbox-skeleton__pill--title" />
            <div className="chatbox-skeleton__spacer" />
            <div className="chatbox-skeleton__pill chatbox-skeleton__pill--action" />
            <div className="chatbox-skeleton__pill chatbox-skeleton__pill--action" />
          </div>

          {/* Body skeleton — fake message bubbles */}
          <div className="chatbox-skeleton__body">
            {/* Assistant message */}
            <div className="chatbox-skeleton__msg chatbox-skeleton__msg--left">
              <div className="chatbox-skeleton__avatar" />
              <div className="chatbox-skeleton__bubble">
                <div className="chatbox-skeleton__line chatbox-skeleton__line--full" />
                <div className="chatbox-skeleton__line chatbox-skeleton__line--3q" />
                <div className="chatbox-skeleton__line chatbox-skeleton__line--half" />
              </div>
            </div>

            {/* User message */}
            <div className="chatbox-skeleton__msg chatbox-skeleton__msg--right">
              <div className="chatbox-skeleton__bubble chatbox-skeleton__bubble--user">
                <div className="chatbox-skeleton__line chatbox-skeleton__line--3q" />
              </div>
            </div>

            {/* Assistant message */}
            <div className="chatbox-skeleton__msg chatbox-skeleton__msg--left">
              <div className="chatbox-skeleton__avatar" />
              <div className="chatbox-skeleton__bubble">
                <div className="chatbox-skeleton__line chatbox-skeleton__line--full" />
                <div className="chatbox-skeleton__line chatbox-skeleton__line--full" />
                <div className="chatbox-skeleton__line chatbox-skeleton__line--half" />
              </div>
            </div>
          </div>

          {/* Input skeleton */}
          <div className="chatbox-skeleton__input">
            <div className="chatbox-skeleton__textarea" />
            <div className="chatbox-skeleton__send" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cls} data-testid="chatbox">
      <ChatBody
        isEmpty={isEmpty}
        hasMoreMessages={hasMoreMessages}
        onLoadMore={onLoadMore}
        scrollKey={activeSessionId}
        emptyContent={
          isEmpty && startupPrompts?.length ? (
            <ChatStartupPrompts
              prompts={startupPrompts}
              onSelect={handlePromptSelect}
              onShowMore={startupPrompts.length > 4 ? handleShowMore : undefined}
            />
          ) : isEmpty ? (
            <div className="chatbox__empty">No messages yet</div>
          ) : undefined
        }
      >
        {messages.map(msg => (
          <ChatMsgBubble
            key={msg.id}
            message={msg}
            senderName={msg.role === 'user' ? userName : msg.role === 'assistant' ? assistantName : undefined}
            avatar={msg.role === 'user' ? userAvatar : msg.role === 'assistant' ? assistantAvatar : undefined}
            actions={messageActions}
            contextActions={contextActions}
            onContextAction={onContextAction}
            onFileClick={onFileClick}
            onOpenInWindow={onOpenInWindow}
            onQuestionAnswer={onQuestionAnswer}
          />
        ))}
        {typing && <ChatTypingIndicator />}
      </ChatBody>

      {typing && (
        <div className="chatbox__status-line" data-testid="chatbox-typing">
          <span className="chatbox__status-star">*</span>
          <span className="chatbox__status-text" key={displayedStatus}>{displayedStatus}</span>
          <span className="chatbox__status-timer">{elapsed}s</span>
        </div>
      )}

      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
        onStop={onStop}
        onFileDrop={attachments.addFiles}
        sending={sending}
        placeholder={placeholder}
        disabled={disabled}
        textareaRef={textareaRef}
        interceptKeyDown={handleInterceptKeyDown}
        filePreview={
          attachments.files.length > 0 ? (
            <FilePreview files={attachments.files} onRemove={attachments.removeFile} />
          ) : undefined
        }
        tray={
          <>
            {/* Mode button — click to cycle */}
            {hasMode && (() => {
              const MODE_ICONS: Record<string, string> = { auto: 'bx-bot', plan: 'bx-map', manual: 'bx-joystick' };
              const idx = CHAT_MODES.findIndex((m) => m.id === mode);
              const current = CHAT_MODES[idx >= 0 ? idx : 0];
              const next = CHAT_MODES[(idx + 1) % CHAT_MODES.length];
              return (
                <Tooltip content={`Mode: ${current.label}`} placement="top" maxWidth="120px">
                  <button
                    type="button"
                    className="chatbox__tray-mode"
                    onClick={() => onModeChange!(next.id)}
                    data-testid="chatbox-sb-mode"
                  >
                    <BoxIcon name={MODE_ICONS[current.id] || 'bx-bot'} size={13} />
                    <span>{current.label}</span>
                  </button>
                </Tooltip>
              );
            })()}

            {/* Model button — click to cycle */}
            {hasModel && (() => {
              const idx = models!.findIndex((m) => m.id === selectedModelId);
              const current = models![idx >= 0 ? idx : 0];
              const next = models![(idx + 1) % models!.length];
              return (
                <Tooltip content={`Model: ${current.name}`} placement="top" maxWidth="150px">
                  <button
                    type="button"
                    className="chatbox__tray-mode"
                    onClick={() => onModelChange!(next.id)}
                    data-testid="chatbox-sb-model"
                  >
                    <BoxIcon name="bx-chip" size={13} />
                    <span>{current.name}</span>
                  </button>
                </Tooltip>
              );
            })()}

            {/* Auto-approve toggle */}
            {onAutoApproveChange && (
              <Tooltip
                content={autoApprove === 'all' ? 'Permissions: Auto' : 'Permissions: Ask'}
                placement="top"
                maxWidth="150px"
              >
                <button
                  type="button"
                  className={`chatbox__tray-mode${autoApprove === 'all' ? ' chatbox__tray-mode--on' : ''}`}
                  onClick={() => onAutoApproveChange(autoApprove === 'all' ? 'none' : 'all')}
                  data-testid="chatbox-sb-auto-approve"
                >
                  <BoxIcon name={autoApprove === 'all' ? 'bx-shield-plus' : 'bx-shield'} size={13} />
                  <span>{autoApprove === 'all' ? 'Auto' : 'Ask'}</span>
                </button>
              </Tooltip>
            )}
          </>
        }
        trayOverlay={voiceTrayOverlay}
        trayTools={
          <>
            {/* Voice input button — leftmost */}
            {voiceButton}

            {/* Thinking toggle */}
            {hasThinking && (
              <Tooltip content="Thinking" placement="top" maxWidth="90px">
                <button
                  type="button"
                  className={`chatbox__tray-toggle${showThinking ? ' chatbox__tray-toggle--on' : ''}`}
                  onClick={() => onThinkingToggle!(!showThinking)}
                  data-testid="chatbox-sb-thinking"
                >
                  <BoxIcon name="bx-bulb" size={13} />
                </button>
              </Tooltip>
            )}

            {/* Screen awareness toggle */}
            {hasScreenAwareness && (
              <Tooltip content="Screen awareness" placement="top" maxWidth="120px">
                <button
                  type="button"
                  className={`chatbox__tray-toggle${screenAwareness ? ' chatbox__tray-toggle--on' : ''}`}
                  onClick={() => onScreenAwarenessToggle!(!screenAwareness)}
                  data-testid="chatbox-sb-awareness"
                >
                  <BoxIcon name="bx-show" size={13} />
                </button>
              </Tooltip>
            )}

            {/* Browser awareness toggle */}
            {hasBrowserAwareness && (
              <Tooltip content="Browser awareness" placement="top" maxWidth="130px">
                <button
                  type="button"
                  className={`chatbox__tray-toggle${browserAwareness ? ' chatbox__tray-toggle--on' : ''}`}
                  onClick={() => onBrowserAwarenessToggle!(!browserAwareness)}
                  data-testid="chatbox-sb-browser"
                >
                  <BoxIcon name="bx-globe" size={13} />
                </button>
              </Tooltip>
            )}

            {/* Screenshot button */}
            {hasScreenshot && (
              <Tooltip content="Screenshot" placement="top" maxWidth="120px">
                <button
                  type="button"
                  className="chatbox__tray-toggle"
                  onClick={handleScreenshot}
                  data-testid="chatbox-sb-screenshot"
                >
                  <BoxIcon name="bx-camera" size={13} />
                </button>
              </Tooltip>
            )}

            {/* View toggle — click to return to chat */}
            {activeView && activeView !== 'chat' && onViewChange && (
              <Tooltip content="Return to Chat" placement="top" maxWidth="120px">
                <button
                  type="button"
                  className="chatbox__tray-toggle chatbox__tray-toggle--on"
                  onClick={() => onViewChange('chat')}
                  data-testid="chatbox-sb-view-toggle"
                >
                  <BoxIcon name="bx-chat" size={13} />
                </button>
              </Tooltip>
            )}
          </>
        }
        statusBar={footer}
        mentionHighlights={mentionTokens.mentions.map((m) => ({
          start: m.startIndex,
          end: m.endIndex,
          label: m.label,
          group: m.group,
          id: m.id,
        }))}
        onMentionRemove={handleMentionRemove}
        mentionPopup={
          mention.open ? (
            <MentionPopup
              items={mentionSearch.items}
              query={mention.query}
              open={mention.open}
              position={mention.position}
              onSelect={handleMentionSelect}
              onDismiss={mention.dismiss}
              loading={mentionSearch.loading}
            />
          ) : command.open && mergedCommandItems.length > 0 ? (
            <CommandPalette
              items={mergedCommandItems}
              query={command.query}
              open={command.open}
              position={command.position}
              onSelect={handleCommandSelect}
              onDismiss={command.dismiss}
            />
          ) : undefined
        }
      />

      {startupPrompts && startupPrompts.length > 0 && (
        <Modal
          isOpen={promptsModalOpen}
          onClose={handleModalClose}
          title="All Prompts"
          size="large"
        >
          <input
            type="text"
            className="startup__modal-search"
            placeholder="Search prompts..."
            value={promptsSearch}
            onChange={(e) => setPromptsSearch(e.target.value)}
            data-testid="startup-modal-search"
            autoFocus
          />
          <div className="startup__modal-grid">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="startup__card"
                  style={p.color ? { '--card-accent': p.color } as React.CSSProperties : undefined}
                  onClick={() => handlePromptSelect(p.prompt)}
                  data-testid={`startup-modal-card-${p.id}`}
                >
                  {p.icon && <span className="startup__card-icon">{p.icon}</span>}
                  <span className="startup__card-title">{p.title}</span>
                  {p.description && (
                    <span className="startup__card-desc">{p.description}</span>
                  )}
                </button>
              ))
            ) : (
              <p className="startup__modal-empty">No prompts match your search.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
