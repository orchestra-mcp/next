// Type declarations for Vite ?worker imports used in monaco-workers.ts.
// These are resolved by Vite at bundle time, but tsc needs to know their shape.
declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}
