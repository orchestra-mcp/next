/**
 * Configure Monaco web workers for Vite ESM builds.
 * Must be called before any Monaco editor instance is created.
 *
 * Monaco uses web workers for language services (TypeScript, JSON, CSS, HTML).
 * When using the ESM build via `loader.config({ monaco })`, we need to
 * manually configure the worker URLs using Vite's `?worker` import.
 */
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string): Worker {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new htmlWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new cssWorker();
      default:
        return new editorWorker();
    }
  },
};
