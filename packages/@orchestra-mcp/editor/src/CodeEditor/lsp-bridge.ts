import type * as monacoNs from 'monaco-editor';

export interface LspConnection {
  dispose: () => void;
}

type JsonRpcMessage = { jsonrpc: '2.0'; id?: number; method?: string; params?: unknown; result?: unknown; error?: unknown };

let _requestId = 1;

/**
 * Minimal LSP-over-WebSocket bridge that does NOT require @codingame/monaco-vscode-api.
 * Handles hover, completion, diagnostics via raw JSON-RPC without MonacoLanguageClient.
 */
export async function connectLanguageServer(
  monaco: typeof monacoNs,
  editor: monacoNs.editor.IStandaloneCodeEditor,
  languageId: string,
  wsUrl: string,
): Promise<LspConnection> {
  const ws = new WebSocket(wsUrl);
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();
  const disposables: monacoNs.IDisposable[] = [];

  function send(msg: object) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  function request(method: string, params: unknown): Promise<unknown> {
    const id = _requestId++;
    send({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  function notify(method: string, params: unknown) {
    send({ jsonrpc: '2.0', method, params });
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`LSP server not reachable at ${wsUrl}`));
    }, 5000);

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`LSP WebSocket error for ${languageId}`));
    };

    ws.onmessage = (event) => {
      try {
        const msg: JsonRpcMessage = JSON.parse(event.data as string);
        if (msg.id !== undefined && pending.has(msg.id)) {
          const p = pending.get(msg.id)!;
          pending.delete(msg.id);
          if (msg.error) p.reject(msg.error);
          else p.resolve(msg.result);
        } else if (msg.method === 'textDocument/publishDiagnostics') {
          // Diagnostics handled below
          const params = msg.params as { uri: string; diagnostics: unknown[] } | undefined;
          if (params) handleDiagnostics(monaco, params.uri, params.diagnostics);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onopen = async () => {
      clearTimeout(timeout);

      // Initialize handshake
      await request('initialize', {
        processId: null,
        clientInfo: { name: 'orchestra-mcp', version: '1.0' },
        capabilities: {
          textDocument: {
            hover: { contentFormat: ['markdown', 'plaintext'] },
            completion: { completionItem: { snippetSupport: true } },
            publishDiagnostics: {},
          },
        },
        rootUri: null,
      });
      notify('initialized', {});

      // Sync current model content
      const model = editor.getModel();
      if (model) {
        notify('textDocument/didOpen', {
          textDocument: {
            uri: model.uri.toString(),
            languageId,
            version: model.getVersionId(),
            text: model.getValue(),
          },
        });

        // Keep server in sync on changes
        const changeDisposable = model.onDidChangeContent((e) => {
          notify('textDocument/didChange', {
            textDocument: { uri: model.uri.toString(), version: model.getVersionId() },
            contentChanges: e.changes.map((c) => ({
              range: c.range,
              rangeLength: c.rangeLength,
              text: c.text,
            })),
          });
        });
        disposables.push(changeDisposable);

        // Hover provider
        const hoverDisposable = monaco.languages.registerHoverProvider(languageId, {
          provideHover: async (_m, position) => {
            try {
              const result = await request('textDocument/hover', {
                textDocument: { uri: model.uri.toString() },
                position: { line: position.lineNumber - 1, character: position.column - 1 },
              }) as { contents?: unknown } | null;
              if (!result?.contents) return null;
              const contents = Array.isArray(result.contents)
                ? result.contents.map((c: unknown) => (typeof c === 'string' ? { value: c } : c))
                : [typeof result.contents === 'string' ? { value: result.contents } : result.contents];
              return { contents } as monacoNs.languages.Hover;
            } catch {
              return null;
            }
          },
        });
        disposables.push(hoverDisposable);

        // Completion provider
        const completionDisposable = monaco.languages.registerCompletionItemProvider(languageId, {
          provideCompletionItems: async (_m, position) => {
            try {
              const result = await request('textDocument/completion', {
                textDocument: { uri: model.uri.toString() },
                position: { line: position.lineNumber - 1, character: position.column - 1 },
              }) as { items?: monacoNs.languages.CompletionItem[] } | monacoNs.languages.CompletionItem[] | null;
              const items = Array.isArray(result) ? result : result?.items ?? [];
              return { suggestions: items };
            } catch {
              return { suggestions: [] };
            }
          },
        });
        disposables.push(completionDisposable);
      }

      resolve({
        dispose: () => {
          const model = editor.getModel();
          if (model) {
            notify('textDocument/didClose', {
              textDocument: { uri: model.uri.toString() },
            });
          }
          disposables.forEach((d) => d.dispose());
          ws.close();
        },
      });
    };
  });
}

function handleDiagnostics(
  monaco: typeof monacoNs,
  uri: string,
  diagnostics: unknown[],
) {
  const model = monaco.editor.getModels().find((m) => m.uri.toString() === uri);
  if (!model) return;

  const markers = (diagnostics as Array<{
    range: { start: { line: number; character: number }; end: { line: number; character: number } };
    severity?: number;
    message: string;
    source?: string;
  }>).map((d) => ({
    startLineNumber: d.range.start.line + 1,
    startColumn: d.range.start.character + 1,
    endLineNumber: d.range.end.line + 1,
    endColumn: d.range.end.character + 1,
    severity: d.severity === 1
      ? monaco.MarkerSeverity.Error
      : d.severity === 2
        ? monaco.MarkerSeverity.Warning
        : monaco.MarkerSeverity.Info,
    message: d.message,
    source: d.source,
  }));

  monaco.editor.setModelMarkers(model, 'lsp', markers);
}
