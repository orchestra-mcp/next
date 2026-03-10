import React, { lazy, Suspense, type ComponentType } from 'react';
import type { EditorProps, DiffEditorProps } from '@monaco-editor/react';
import './CodeEditor.css';

// Lazy-load the Editor and DiffEditor components for code splitting
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.Editor })),
) as React.LazyExoticComponent<ComponentType<EditorProps>>;

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor })),
) as React.LazyExoticComponent<ComponentType<DiffEditorProps>>;

function DefaultLoading() {
  return (
    <div className="code-editor__loading">
      <div className="code-editor__loading-shimmer" />
    </div>
  );
}

interface MonacoSuspenseProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
}

export function MonacoSuspense({ children, loading }: MonacoSuspenseProps) {
  return (
    <Suspense fallback={loading ?? <DefaultLoading />}>
      {children}
    </Suspense>
  );
}

export { MonacoEditor, MonacoDiffEditor };
