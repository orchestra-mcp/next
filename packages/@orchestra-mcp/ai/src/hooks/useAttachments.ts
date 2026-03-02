import { useState, useCallback, useRef, useEffect } from 'react';
import type { AttachedFile } from '../types/message';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_COUNT = 5;

let fileIdCounter = 0;
const nextId = () => `attach-${Date.now()}-${++fileIdCounter}`;

export interface UseAttachmentsResult {
  files: AttachedFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

export function useAttachments(): UseAttachmentsResult {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const revokeUrl = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  }, []);

  // Clean up all object URLs on unmount
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const remaining = MAX_FILE_COUNT - prev.length;
      if (remaining <= 0) return prev;

      const toAdd: AttachedFile[] = [];
      for (const file of incoming) {
        if (toAdd.length >= remaining) break;
        if (file.size > MAX_FILE_SIZE) continue;

        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
          previewUrlsRef.current.add(preview);
        }

        toAdd.push({ id: nextId(), name: file.name, size: file.size, type: file.type, preview, file });
      }

      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id);
        if (target?.preview) revokeUrl(target.preview);
        return prev.filter((f) => f.id !== id);
      });
    },
    [revokeUrl],
  );

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      for (const f of prev) {
        if (f.preview) revokeUrl(f.preview);
      }
      return [];
    });
  }, [revokeUrl]);

  return { files, addFiles, removeFile, clearFiles };
}
