import { BoxIcon } from '@orchestra-mcp/icons';
import './FilePreview.css';

export interface FilePreviewItem {
  id: string;
  file: File;
  /** Data URL for image preview (generated via FileReader) */
  previewUrl?: string;
  /** True while preview is loading */
  loading?: boolean;
}

export interface FilePreviewProps {
  files: FilePreviewItem[];
  onRemove: (id: string) => void;
  className?: string;
}

const SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

/** Format bytes into a human-readable size string */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FilePreview = ({ files, onRemove, className }: FilePreviewProps) => {
  if (files.length === 0) return null;

  const cls = ['file-preview', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="file-preview">
      {files.map((item) => {
        const isImage = item.file.type.startsWith('image/');
        const isLarge = item.file.size > SIZE_LIMIT;

        return (
          <div key={item.id} className="file-preview__item" data-testid="file-preview-item">
            {isImage && item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="file-preview__thumb"
                draggable={false}
              />
            ) : isImage && item.loading ? (
              <div className="file-preview__icon file-preview__icon--loading">
                <BoxIcon name="bx-image" size={20} />
              </div>
            ) : (
              <div className="file-preview__icon">
                <BoxIcon name="bx-file" size={20} />
              </div>
            )}

            <div className="file-preview__info">
              <span className="file-preview__name" title={item.file.name}>
                {item.file.name}
              </span>
              <span
                className={`file-preview__size${isLarge ? ' file-preview__size--large' : ''}`}
              >
                {formatFileSize(item.file.size)}
              </span>
            </div>

            <button
              type="button"
              className="file-preview__remove"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.file.name}`}
              data-testid="file-preview-remove"
            >
              <BoxIcon name="bx-x" size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
