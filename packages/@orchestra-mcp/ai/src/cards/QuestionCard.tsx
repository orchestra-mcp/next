"use client";

import { useState, useCallback } from 'react';
import type { QuestionEvent, QuestionItem } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './QuestionCard.css';

export interface QuestionCardProps {
  event: QuestionEvent;
  defaultCollapsed?: boolean;
  className?: string;
  /** Called when the user submits answers. Returns the answers record. */
  onAnswer?: (requestId: string, answers: Record<string, string>, customAnswers: Record<string, string>) => void;
}

interface QuestionFormProps {
  question: QuestionItem;
  index: number;
  selectedOptions: string[];
  customText: string;
  showCustom: boolean;
  answered: boolean;
  onToggleOption: (label: string) => void;
  onCustomChange: (text: string) => void;
  onToggleCustom: () => void;
}

function QuestionForm({
  question,
  index,
  selectedOptions,
  customText,
  showCustom,
  answered,
  onToggleOption,
  onCustomChange,
  onToggleCustom,
}: QuestionFormProps) {
  return (
    <div className={`question-card__question${answered ? ' question-card__question--answered' : ''}`}>
      {question.header && (
        <span className="question-card__header-label">{question.header}</span>
      )}
      <p className="question-card__question-text">
        <span className="question-card__question-num">{index + 1}.</span>
        {question.question}
      </p>
      <div className="question-card__options">
        {question.options.map((opt) => {
          const selected = selectedOptions.includes(opt.label);
          return (
            <button
              key={opt.label}
              type="button"
              className={`question-card__option${selected ? ' question-card__option--selected' : ''}`}
              onClick={() => !answered && onToggleOption(opt.label)}
              disabled={answered}
              title={opt.description}
            >
              <span className={`question-card__option-dot${selected ? ' question-card__option-dot--selected' : ''}`} />
              <span className="question-card__option-label">{opt.label}</span>
              {opt.description && (
                <span className="question-card__option-desc">{opt.description}</span>
              )}
            </button>
          );
        })}
        {/* Always show "Other" option */}
        <button
          type="button"
          className={`question-card__option question-card__option--other${showCustom ? ' question-card__option--selected' : ''}`}
          onClick={() => !answered && onToggleCustom()}
          disabled={answered}
        >
          <span className={`question-card__option-dot${showCustom ? ' question-card__option-dot--selected' : ''}`} />
          <span className="question-card__option-label">Other</span>
          <span className="question-card__option-desc">Write a custom answer</span>
        </button>
      </div>
      {showCustom && !answered && (
        <textarea
          className="question-card__custom-input"
          placeholder="Type your custom answer..."
          value={customText}
          onChange={(e) => onCustomChange(e.target.value)}
          rows={3}
          autoFocus
        />
      )}
    </div>
  );
}

export const QuestionCard = ({
  event,
  defaultCollapsed = false,
  className,
  onAnswer,
}: QuestionCardProps) => {
  const answered = !!event.answers;

  // Per-question state: selected option labels
  const [selections, setSelections] = useState<Record<number, string[]>>(() => {
    if (event.answers) {
      // Pre-populate from already submitted answers
      const init: Record<number, string[]> = {};
      event.questions.forEach((q, i) => {
        const val = event.answers![q.question];
        if (val) init[i] = [val];
      });
      return init;
    }
    return {};
  });

  // Per-question custom text
  const [customTexts, setCustomTexts] = useState<Record<number, string>>({});
  const [showCustom, setShowCustom] = useState<Record<number, boolean>>({});

  const handleToggleOption = useCallback((qIdx: number, label: string, multiSelect?: boolean) => {
    setSelections((prev) => {
      const current = prev[qIdx] ?? [];
      if (multiSelect) {
        return {
          ...prev,
          [qIdx]: current.includes(label)
            ? current.filter((l) => l !== label)
            : [...current, label],
        };
      }
      return { ...prev, [qIdx]: current.includes(label) ? [] : [label] };
    });
    // Deselect "Other" when a real option is chosen
    setShowCustom((prev) => ({ ...prev, [qIdx]: false }));
  }, []);

  const handleToggleCustom = useCallback((qIdx: number) => {
    setShowCustom((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
    // Deselect other options when "Other" is chosen
    setSelections((prev) => ({ ...prev, [qIdx]: [] }));
  }, []);

  const handleCustomChange = useCallback((qIdx: number, text: string) => {
    setCustomTexts((prev) => ({ ...prev, [qIdx]: text }));
  }, []);

  const handleSubmit = useCallback(() => {
    const answers: Record<string, string> = {};
    const customAnswers: Record<string, string> = {};

    event.questions.forEach((q, i) => {
      const selected = selections[i] ?? [];
      const isOther = showCustom[i];
      const customText = customTexts[i] ?? '';

      if (isOther && customText.trim()) {
        answers[q.question] = customText.trim();
        customAnswers[q.question] = customText.trim();
      } else if (selected.length > 0) {
        answers[q.question] = selected.join(', ');
      }
    });

    onAnswer?.(event.requestId, answers, customAnswers);
  }, [event.questions, event.requestId, selections, showCustom, customTexts, onAnswer]);

  const canSubmit = !answered && event.questions.every((q, i) => {
    const hasOption = (selections[i] ?? []).length > 0;
    const hasCustom = showCustom[i] && (customTexts[i] ?? '').trim().length > 0;
    return hasOption || hasCustom;
  });

  const submittedAnswers = event.answers;

  return (
    <CardBase
      title="Question"
      icon={<BoxIcon name="bx-question-mark" size={16} />}
      badge={answered ? 'Answered' : 'Waiting'}
      badgeColor={answered ? 'success' : 'warning'}
      status={answered ? 'done' : 'running'}
      defaultCollapsed={defaultCollapsed}
      className={`question-card${className ? ` ${className}` : ''}`}
    >
      <div className="question-card__body">
        {event.questions.map((q, i) => {
          const qAnswered = !!submittedAnswers;
          if (qAnswered && submittedAnswers) {
            const answer = submittedAnswers[q.question];
            return (
              <div key={i} className="question-card__question question-card__question--answered">
                {q.header && (
                  <span className="question-card__header-label">{q.header}</span>
                )}
                <p className="question-card__question-text">
                  <span className="question-card__question-num">{i + 1}.</span>
                  {q.question}
                </p>
                {answer && (
                  <div className="question-card__answer">
                    <BoxIcon name="bx-check-circle" size={14} />
                    <span>{answer}</span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <QuestionForm
              key={i}
              question={q}
              index={i}
              selectedOptions={selections[i] ?? []}
              customText={customTexts[i] ?? ''}
              showCustom={showCustom[i] ?? false}
              answered={answered}
              onToggleOption={(label) => handleToggleOption(i, label, q.multiSelect)}
              onCustomChange={(text) => handleCustomChange(i, text)}
              onToggleCustom={() => handleToggleCustom(i)}
            />
          );
        })}

        {!answered && (
          <div className="question-card__footer">
            <button
              type="button"
              className={`question-card__submit${canSubmit ? '' : ' question-card__submit--disabled'}`}
              onClick={canSubmit ? handleSubmit : undefined}
              disabled={!canSubmit}
            >
              <BoxIcon name="bx-send" size={14} />
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </CardBase>
  );
};
