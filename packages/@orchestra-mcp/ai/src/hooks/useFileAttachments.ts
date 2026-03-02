import { useState, useCallback, useEffect, useRef } from 'react';
import type { FilePreviewItem } from '../FilePreview';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export interface UseFileAttachmentsResult {
  files: FilePreviewItem[];
  /** Add files (generates preview URLs for images) */
  addFiles: (files: File[]) => void;
  /** Remove a file by ID */
  removeFile: (id: string) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Get raw File objects array for sending */
  getFiles: () => File[];
}

export function useFileAttachments(): UseFileAttachmentsResult {
  const [files, setFiles] = useState<FilePreviewItem[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;

      const toAdd: FilePreviewItem[] = [];

      for (const file of incoming) {
        if (toAdd.length >= remaining) break;
        if (file.size > MAX_FILE_SIZE) continue;

        const id = crypto.randomUUID();
        const isImage = file.type.startsWith('image/');

        if (isImage) {
          // Add with loading state, generate preview async
          toAdd.push({ id, file, loading: true });

          const reader = new FileReader();
          reader.onload = () => {
            if (!mountedRef.current) return;
            setFiles((current) =>
              current.map((f) =>
                f.id === id
                  ? { ...f, previewUrl: reader.result as string, loading: false }
                  : f,
              ),
            );
          };
          reader.onerror = () => {
            if (!mountedRef.current) return;
            setFiles((current) =>
              current.map((f) =>
                f.id === id ? { ...f, loading: false } : f,
              ),
            );
          };
          reader.readAsDataURL(file);
        } else {
          toAdd.push({ id, file });
        }
      }

      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const getFiles = useCallback((): File[] => {
    return files.map((f) => f.file);
  }, [files]);

  return { files, addFiles, removeFile, clearFiles, getFiles };
}
