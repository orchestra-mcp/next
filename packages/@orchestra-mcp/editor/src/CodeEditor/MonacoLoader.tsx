import { lazy, Suspense } from 'react';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import './monaco-workers';
import './CodeEditor.css';

// Tell @monaco-editor/react to use the locally installed monaco-editor
// instead of loading via CDN/AMD. This works with Vite's ESM bundling.
loader.config({ monaco });

// Lazy-load the Editor and DiffEditor components for code splitting
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.Editor })),
);

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor })),
);

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
