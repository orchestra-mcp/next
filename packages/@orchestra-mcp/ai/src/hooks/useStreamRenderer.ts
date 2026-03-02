"use client";

import { useState, useCallback } from 'react';
import type { ChatMessage, MessageRole, StreamChunk } from '../types/message';
import type { ClaudeCodeEvent } from '../types/events';

export function useStreamRenderer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const appendChunk = useCallback((chunk: StreamChunk) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== chunk.messageId) return msg;
        if (chunk.isThinking) {
          return {
            ...msg,
            thinking: (msg.thinking ?? '') + chunk.delta,
            thinkingStreaming: !chunk.done,
          };
        }
        return {
          ...msg,
          content: msg.content + chunk.delta,
          streaming: !chunk.done,
          // Close thinking loading when text starts arriving
          thinkingStreaming: false,
        };
      }),
    );
  }, []);

  const startMessage = useCallback(
    (id: string, role: MessageRole = 'assistant', model?: string) => {
      const msg: ChatMessage = {
        id,
        role,
        content: '',
        streaming: true,
        markdown: true,
        model,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, msg]);
    },
    [],
  );

  const addUserMessage = useCallback((id: string, content: string) => {
    const msg: ChatMessage = { id, role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
  }, []);

  const appendEvent = useCallback((messageId: string, event: ClaudeCodeEvent) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg;
        return { ...msg, events: [...(msg.events ?? []), event] };
      }),
    );
  }, []);

  const updateEvent = useCallback((messageId: string, toolUseId: string, updates: Record<string, unknown>) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg;
        if (!msg.events) return msg;
        return {
          ...msg,
          events: msg.events.map(ev =>
            ev.toolUseId === toolUseId ? { ...ev, ...updates } as typeof ev : ev,
          ),
        };
      }),
    );
  }, []);

  /** Mark all events with status="running" in a message as "done" */
  const stopRunningEvents = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId || !msg.events) return msg;
        return {
          ...msg,
          events: msg.events.map(ev =>
            (ev as { status?: string }).status === 'running'
              ? { ...ev, status: 'done' } as typeof ev
              : ev,
          ),
        };
      }),
    );
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, setMessages, appendChunk, startMessage, addUserMessage, appendEvent, updateEvent, stopRunningEvents, clear };
}
