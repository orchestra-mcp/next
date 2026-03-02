import { render, screen, fireEvent } from '@testing-library/react';
import { ChatBox } from './ChatBox';
import type { ChatMessage } from './ChatBox.types';

// jsdom doesn't implement scrollTo/scrollIntoView
Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// Mock @orchestra-mcp/editor (Vite ?worker imports fail in test env)
vi.mock('@orchestra-mcp/editor', () => ({
  CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre>,
  CodeEditor: () => <div data-testid="code-editor" />,
  MarkdownRenderer: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));

// Mock sub-components that have complex dependencies
vi.mock('../hooks/useMentionTrigger', () => ({
  useMentionTrigger: () => ({ open: false, query: '', position: { x: 0, y: 0 }, accept: vi.fn(), dismiss: vi.fn() }),
}));
vi.mock('../hooks/useCommandTrigger', () => ({
  useCommandTrigger: () => ({ open: false, query: '', position: { x: 0, y: 0 }, accept: vi.fn(), dismiss: vi.fn() }),
}));
vi.mock('../hooks/useMentionTokens', () => ({
  useMentionTokens: () => ({ mentions: [], addMention: vi.fn(), removeMention: vi.fn(), adjustForChange: vi.fn(), clearMentions: vi.fn() }),
}));
vi.mock('../hooks/useMentionSearch', () => ({
  useMentionSearch: () => ({ items: [], loading: false }),
}));
vi.mock('../hooks/useAttachments', () => ({
  useAttachments: () => ({ files: [], addFiles: vi.fn(), removeFile: vi.fn(), clearFiles: vi.fn() }),
}));
vi.mock('../hooks/useScreenshot', () => ({
  useScreenshot: () => ({ supported: false, captureScreenshot: vi.fn() }),
}));

const sampleMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello there' },
  { id: '2', role: 'assistant', content: 'Hi! How can I help?' },
  { id: '3', role: 'system', content: 'Session started' },
];

describe('ChatBox', () => {
  it('renders messages', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument();
  });

  it('renders message elements with correct role attributes', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} />);
    const messageDivs = screen.getAllByTestId('chat-message');
    expect(messageDivs.length).toBe(3);
    expect(messageDivs[0]).toHaveAttribute('data-role', 'user');
    expect(messageDivs[1]).toHaveAttribute('data-role', 'assistant');
    expect(messageDivs[2]).toHaveAttribute('data-role', 'system');
  });

  it('user messages have user role class', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} />);
    const messageDivs = screen.getAllByTestId('chat-message');
    expect(messageDivs[0]).toHaveClass('chat-msg--user');
  });

  it('assistant messages have assistant role class', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} />);
    const messageDivs = screen.getAllByTestId('chat-message');
    expect(messageDivs[1]).toHaveClass('chat-msg--assistant');
  });

  it('system messages have system role class', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} />);
    const messageDivs = screen.getAllByTestId('chat-message');
    expect(messageDivs[2]).toHaveClass('chat-msg--system');
  });

  it('fires onSend when send button is clicked', () => {
    const handleSend = vi.fn();
    render(<ChatBox messages={[]} onSend={handleSend} />);
    const input = screen.getByTestId('chat-input-textarea');
    fireEvent.change(input, { target: { value: 'Test message' } });
    const sendBtn = screen.getByTestId('chat-input-send');
    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalledWith('Test message', undefined, undefined);
  });

  it('fires onSend when Enter key is pressed', () => {
    const handleSend = vi.fn();
    render(<ChatBox messages={[]} onSend={handleSend} />);
    const input = screen.getByTestId('chat-input-textarea');
    fireEvent.change(input, { target: { value: 'Enter test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSend).toHaveBeenCalledWith('Enter test', undefined, undefined);
  });

  it('disables input when disabled', () => {
    render(<ChatBox messages={[]} onSend={vi.fn()} disabled />);
    const input = screen.getByTestId('chat-input-textarea');
    expect(input).toBeDisabled();
  });

  it('shows typing indicator when typing is true', () => {
    render(<ChatBox messages={sampleMessages} onSend={vi.fn()} typing />);
    expect(screen.getByTestId('chatbox-typing')).toBeInTheDocument();
  });

  it('renders placeholder text in input', () => {
    render(
      <ChatBox messages={[]} onSend={vi.fn()} placeholder="Ask anything..." />,
    );
    const input = screen.getByTestId('chat-input-textarea');
    expect(input).toHaveAttribute('placeholder', 'Ask anything...');
  });

  it('shows empty state when no messages', () => {
    render(<ChatBox messages={[]} onSend={vi.fn()} />);
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('clears input after sending', () => {
    render(<ChatBox messages={[]} onSend={vi.fn()} />);
    const input = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Will clear' } });
    fireEvent.click(screen.getByTestId('chat-input-send'));
    expect(input.value).toBe('');
  });

  it('has chatbox root element', () => {
    render(<ChatBox messages={[]} onSend={vi.fn()} />);
    expect(screen.getByTestId('chatbox')).toBeInTheDocument();
  });
});
