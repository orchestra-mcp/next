import type { ClaudeCodeEvent, QuestionEvent, PermissionEvent } from '../types/events';
import { CardRegistry } from './CardRegistry';
import { RawCard } from './RawCard';
import { CardErrorBoundary } from './CardErrorBoundary';
import { registerBuiltinCards } from './registerCards';

// Ensure built-in cards are registered on first import
registerBuiltinCards();

export interface EventCardRendererProps {
  event: ClaudeCodeEvent;
  onFileClick?: (filePath: string, line?: number) => void;
  onOpenInWindow?: (event: ClaudeCodeEvent) => void;
  /** Called when the user submits answers to an inline QuestionCard. */
  onQuestionAnswer?: (requestId: string, answers: Record<string, string>) => void;
  /** Called when the user approves or denies a permission request. */
  onPermissionDecision?: (requestId: string, decision: 'approve' | 'deny') => void;
  className?: string;
}

export const EventCardRenderer = ({
  event,
  onFileClick,
  onOpenInWindow,
  onQuestionAnswer,
  onPermissionDecision,
  className,
}: EventCardRendererProps) => {
  const registration = CardRegistry.get(event.type);

  if (!registration) {
    return (
      <CardErrorBoundary>
        <RawCard event={event} className={className} />
      </CardErrorBoundary>
    );
  }

  const CardComponent = registration.component;

  // Build extra props for specific card types
  const extraProps: Record<string, unknown> = {};

  if (event.type === 'question' && onQuestionAnswer) {
    extraProps.onAnswer = (requestId: string, answers: Record<string, string>) =>
      onQuestionAnswer(requestId, answers);
  }

  if (event.type === 'permission' && onPermissionDecision) {
    extraProps.onDecision = (requestId: string, decision: 'approve' | 'deny') =>
      onPermissionDecision(requestId, decision);
  }

  // BashCard uses onOpenTerminal instead of the generic onOpenInWindow
  if (event.type === 'bash' && onOpenInWindow) {
    extraProps.onOpenTerminal = () => onOpenInWindow(event);
  }

  return (
    <CardErrorBoundary>
      <CardComponent
        event={event}
        className={className}
        onFileClick={onFileClick}
        onOpenInWindow={onOpenInWindow ? () => onOpenInWindow(event) : undefined}
        {...extraProps}
      />
    </CardErrorBoundary>
  );
};
