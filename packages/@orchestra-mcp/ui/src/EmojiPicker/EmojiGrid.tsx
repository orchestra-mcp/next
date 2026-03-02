export interface EmojiGridProps {
  emojis: string[];
  columns: number;
  onSelect: (emoji: string) => void;
}

export const EmojiGrid = ({ emojis, columns, onSelect }: EmojiGridProps) => {
  if (emojis.length === 0) {
    return <div className="emoji-picker__empty">No emojis found</div>;
  }

  return (
    <div
      className="emoji-picker__grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      role="grid"
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="emoji-picker__emoji"
          type="button"
          onClick={() => onSelect(emoji)}
          aria-label={`Emoji ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
