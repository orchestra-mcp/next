import type { ReactNode, KeyboardEvent, ClipboardEvent, DragEvent } from 'react';
import { useRef, useState, useCallback, useMemo } from 'react';
import { Tooltip } from '@orchestra-mcp/ui';
import { useAutoResize } from '../hooks/useAutoResize';
import { MentionToken } from '../MentionToken';
import { MentionTokens } from '../MentionTokens';
import type { MentionGroup, MentionRef } from '../types/message';
import './ChatInput.css';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onFileDrop?: (files: File[]) => void;
  sending?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
  leading?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** File preview strip rendered above the input bar */
  filePreview?: ReactNode;
  /** Action tray left side (mode/model buttons) — rendered below textarea */
  tray?: ReactNode;
  /** Full-width overlay rendered between tray and the spacer (e.g. voice waveform). Hides the spacer when set. */
  trayOverlay?: ReactNode;
  /** Extra tool buttons rendered on the right side of the tray (before attach + send) */
  trayTools?: ReactNode;
  /** Status bar content rendered below the action tray */
  statusBar?: ReactNode;
  /** Mention popup content rendered above the input */
  mentionPopup?: ReactNode;
  /** Mention highlights to render as styled chips in the overlay (position-based) */
  mentionHighlights?: Array<{ start: number; end: number; label: string; group: MentionGroup; id: string }>;
  /** Lightweight mention refs for the mirror overlay (text-match-based) */
  mentions?: MentionRef[];
  /** Called when a mention chip remove button is clicked */
  onMentionRemove?: (id: string) => void;
  /** Called on every keystroke with current selectionStart for mention detection */
  onSelectionChange?: (selectionStart: number) => void;
  /** External ref to the textarea element (merged with internal auto-resize ref) */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** Keyboard interceptor — return true to prevent ChatInput from handling the event */
  interceptKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => boolean;
  className?: string;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onStop,
  onFileDrop,
  sending = false,
  placeholder = 'Type a message...',
  disabled = false,
  maxRows = 6,
  leading,
  prefix,
  suffix,
  filePreview,
  tray,
  trayOverlay,
  trayTools,
  statusBar,
  mentionPopup,
  mentionHighlights,
  mentions,
  onMentionRemove,
  onSelectionChange,
  textareaRef,
  interceptKeyDown,
  className,
}: ChatInputProps) => {
  const { ref: autoResizeRef, resize } = useAutoResize({ maxRows });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  // Callback ref that merges the internal auto-resize ref with the external textareaRef
  const mergedRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      // Assign to internal useAutoResize ref
      (autoResizeRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      // Assign to external textareaRef if provided
      if (textareaRef) {
        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      }
    },
    [autoResizeRef, textareaRef],
  );

  // Notify parent of selection changes after a microtask so selectionStart is up to date
  const notifySelection = useCallback(() => {
    if (!onSelectionChange) return;
    setTimeout(() => {
      const el = autoResizeRef.current;
      if (el) onSelectionChange(el.selectionStart);
    }, 0);
  }, [onSelectionChange, autoResizeRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Let the interceptor handle the event first (e.g., mention popup open)
    if (interceptKeyDown && interceptKeyDown(e)) return;

    if (e.key === 'Escape' && sending && onStop) {
      e.preventDefault();
      onStop();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
    notifySelection();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    resize();
    notifySelection();
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length > 0 && onFileDrop) {
        onFileDrop(fileArray);
      }
    },
    [onFileDrop],
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.types.includes('Files')) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setDragOver(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardFiles = e.clipboardData?.files;
    if (clipboardFiles && clipboardFiles.length > 0) {
      e.preventDefault();
      handleFiles(clipboardFiles);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Build highlight segments: interleave plain text with mention tokens
  const highlightSegments = useMemo(() => {
    if (!mentionHighlights || mentionHighlights.length === 0) return null;
    // Sort by start index
    const sorted = [...mentionHighlights].sort((a, b) => a.start - b.start);
    const segments: Array<{ type: 'text'; text: string } | { type: 'mention'; label: string; group: MentionGroup; id: string }> = [];
    let cursor = 0;
    for (const hl of sorted) {
      if (hl.start > cursor) {
        segments.push({ type: 'text', text: value.slice(cursor, hl.start) });
      }
      segments.push({ type: 'mention', label: hl.label, group: hl.group, id: hl.id });
      cursor = hl.end;
    }
    if (cursor < value.length) {
      segments.push({ type: 'text', text: value.slice(cursor) });
    }
    return segments;
  }, [value, mentionHighlights]);

  const hasHighlightOverlay = highlightSegments !== null;
  const hasMentionTokensOverlay = !hasHighlightOverlay && !!mentions && mentions.length > 0;
  const hasMentions = hasHighlightOverlay || hasMentionTokensOverlay;

  const canSend = value.trim().length > 0 && !disabled;
  const cls = [
    'chat-input',
    dragOver && 'chat-input--drag-over',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      data-testid="chat-input"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {prefix && (
        <div className="chat-input__prefix" data-testid="chat-input-prefix">
          {prefix}
        </div>
      )}

      {filePreview && (
        <div className="chat-input__files" data-testid="chat-input-files">
          {filePreview}
        </div>
      )}

      <div className="chat-input__bar">
        {leading && <div className="chat-input__leading">{leading}</div>}
        <div className="chat-input__field">
          {hasHighlightOverlay && (
            <div className="chat-input__highlights" aria-hidden="true" data-testid="chat-input-highlights">
              {highlightSegments.map((seg, i) =>
                seg.type === 'text' ? (
                  <span key={i}>{seg.text}</span>
                ) : (
                  <MentionToken
                    key={seg.id}
                    label={seg.label}
                    group={seg.group}
                    onRemove={onMentionRemove ? () => onMentionRemove(seg.id) : undefined}
                  />
                ),
              )}
            </div>
          )}
          {hasMentionTokensOverlay && (
            <MentionTokens value={value} mentions={mentions} />
          )}
          <textarea
            ref={mergedRef}
            className={`chat-input__textarea${hasMentions ? ' chat-input__textarea--has-mentions' : ''}`}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            data-testid="chat-input-textarea"
          />
        </div>

      </div>

      {/* ── Tray: left (mode/model) | right (tools + attach + send/stop) ── */}
      <div className="chat-input__tray">
        {tray}
        {trayOverlay}
        {!trayOverlay && <span className="chat-input__tray-spacer" />}

        {trayTools}

        {suffix && (
          <div className="chat-input__suffix">{suffix}</div>
        )}

        {onFileDrop && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              data-testid="chat-input-file"
            />
            <Tooltip content="Attach" placement="top" maxWidth="100px">
              <button
                type="button"
                className="chat-input__attach"
                onClick={handleAttachClick}
                aria-label="Attach files"
                data-testid="chat-input-attach"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M15.75 8.625l-6.879 6.879a3.75 3.75 0 01-5.303-5.303l6.879-6.879a2.5 2.5 0 013.535 3.536l-6.886 6.879a1.25 1.25 0 01-1.768-1.768l6.38-6.372"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Tooltip>
          </>
        )}

        {sending && onStop ? (
          <Tooltip content="Stop" placement="top" maxWidth="80px">
            <button
              type="button"
              className="chat-input__stop"
              onClick={onStop}
              aria-label="Stop generation"
              data-testid="chat-input-stop"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <rect x="2" y="2" width="10" height="10" rx="2" />
              </svg>
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Send" placement="top" maxWidth="80px">
            <button
              type="button"
              className="chat-input__send"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send message"
              data-testid="chat-input-send"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 13V3m0 0L4 7m4-4l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Status bar: separate row below the action tray ── */}
      {statusBar && (
        <div className="chat-input__status">{statusBar}</div>
      )}

      {mentionPopup}
    </div>
  );
};
