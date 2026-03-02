import React, { useCallback, useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import { FileIcon } from './FileIcon';
import { getFileIcon as resolveIcon } from './fileIconService';
import type { SessionContentProps } from '../types';
import './FileExplorerSession.css';

// Lazy-load Monaco editor — heavy dependency, only needed when a file is open
const CodeEditor = lazy(() =>
  import('@orchestra-mcp/editor').then((mod) => ({ default: mod.CodeEditor })),
);

/* ── Types ────────────────────────────────────────────────── */

interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modTime: string;
}

interface TreeNode extends FileItem {
  children?: TreeNode[];
  expanded?: boolean;
  depth: number;
  loading?: boolean;
}

interface WsInMessage {
  msgType: string;
  data: any;
}

/* ── File templates ───────────────────────────────────────── */

const FILE_TEMPLATES: { name: string; ext: string; content: string }[] = [
  { name: 'TypeScript', ext: '.ts', content: '' },
  { name: 'React Component', ext: '.tsx', content: "import React from 'react';\n\nexport function Component() {\n  return <div />;\n}\n" },
  { name: 'CSS Module', ext: '.module.css', content: '' },
  { name: 'JSON', ext: '.json', content: '{\n  \n}\n' },
  { name: 'Markdown', ext: '.md', content: '# Title\n\n' },
  { name: 'Go File', ext: '.go', content: 'package main\n\n' },
  { name: 'Shell Script', ext: '.sh', content: '#!/bin/bash\n\n' },
];

/* ── Component ────────────────────────────────────────────── */

export const FileExplorerSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState } = props;

  const [rootDir, setRootDir] = useState<string>(
    (session.connectionConfig?.root_dir as string) ?? '',
  );

  useEffect(() => {
    const configRootDir = (session.connectionConfig?.root_dir as string) ?? '';
    if (configRootDir && configRootDir !== rootDir) setRootDir(configRootDir);
  }, [session.connectionConfig, rootDir]);

  // Tree state: path → children map
  const [treeData, setTreeData] = useState<Map<string, FileItem[]>>(new Map());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());

  // Inline creation state
  const [creating, setCreating] = useState<{
    parentPath: string;
    isDir: boolean;
    template?: typeof FILE_TEMPLATES[number];
  } | null>(null);
  const [createName, setCreateName] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);

  // Inline rename state
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; item: FileItem;
  } | null>(null);
  const [templateMenu, setTemplateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Editor: currently open file
  const [openFile, setOpenFile] = useState<{ path: string; content: string } | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const editorValueRef = useRef('');
  const pendingReadPath = useRef<string | null>(null);

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  /* ── Pending list request queue ─────────────────────────── */
  const pendingListQueue = useRef<string[]>([]);
  const needsInitialList = useRef(false);
  const sendRef = useRef<(data: unknown) => void>(() => {});

  /* ── List directory via WebSocket ──────────────────────── */
  const listDir = useCallback((path: string) => {
    pendingListQueue.current.push(path);
    setLoadingPaths((prev) => new Set(prev).add(path));
    sendRef.current({ msgType: 'list', data: { path } });
  }, []);

  /* ── Refresh all expanded folders ─────────────────────── */
  const refreshExpanded = useCallback(() => {
    listDir('.');
    expanded.forEach((p) => {
      if (p !== '.') listDir(p);
    });
  }, [expanded, listDir]);

  /* ── WebSocket message handler ──────────────────────────── */
  const handleMessage = useCallback((data: unknown) => {
    const msg = data as WsInMessage;
    if (msg.msgType === 'connected') {
      // Backend confirms connection is ready — send initial listing.
      // Always use "." because backend resolves paths relative to rootDir.
      if (needsInitialList.current) {
        needsInitialList.current = false;
        pendingListQueue.current.push('.');
        setLoadingPaths((prev) => new Set(prev).add('.'));
        sendRef.current({ msgType: 'list', data: { path: '.' } });
      }
    } else if (msg.msgType === 'list') {
      const items = (msg.data as FileItem[]) ?? [];
      const path = pendingListQueue.current.shift() ?? '.';
      setTreeData((prev) => {
        const next = new Map(prev);
        next.set(path, items);
        return next;
      });
      setLoadingPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } else if (msg.msgType === 'read') {
      const readPath = pendingReadPath.current;
      pendingReadPath.current = null;
      if (readPath && msg.data?.data) {
        try {
          const content = atob(msg.data.data);
          editorValueRef.current = content;
          setOpenFile({ path: readPath, content });
          setEditorDirty(false);
        } catch {
          // binary file — ignore
        }
      }
    } else if (msg.msgType === 'write' || msg.msgType === 'delete' || msg.msgType === 'move') {
      refreshExpanded();
    } else if (msg.msgType === 'error') {
      onUpdateState({
        sessionData: {
          ...session.sessionData,
          lastError: typeof msg.data === 'string' ? msg.data : 'Unknown error',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateState, session.sessionData, refreshExpanded]);

  const { connect, disconnect, send } = useSessionWorker(props, {
    sessionType: 'file-explorer',
    onMessage: handleMessage,
  });

  // Keep sendRef in sync so listDir and handleMessage can use it
  sendRef.current = send;

  /* ── Connect ────────────────────────────────────────────── */
  const handleConnect = useCallback(() => {
    onUpdateState({ connectionConfig: { root_dir: rootDir } });
    needsInitialList.current = true;
    setExpanded(new Set(['.']));
    connect();
  }, [rootDir, onUpdateState, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setTreeData(new Map());
    setExpanded(new Set());
    setSelectedPath(null);
    pendingListQueue.current = [];
  }, [disconnect]);

  // Auto-connect on mount. Also handles tab-switch-back: the useSessionWorker
  // cleanup disconnects the WS on unmount, but the parent session.state stays
  // 'connected' (stale). On remount we must re-establish the WS + re-list.
  const didReconnect = useRef(false);
  useEffect(() => {
    if (!rootDir) return;

    if (!isConnected && !isConnecting && session.state === 'idle') {
      handleConnect();
      return;
    }

    // Stale 'connected' state after tab switch — WS was torn down on unmount
    if (session.state === 'connected' && !didReconnect.current) {
      didReconnect.current = true;
      needsInitialList.current = true;
      setExpanded(new Set(['.']));
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Toggle folder expand/collapse ─────────────────────── */
  const toggleFolder = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        if (!treeData.has(path)) listDir(path);
      }
      return next;
    });
  }, [treeData, listDir]);

  /* ── Build flat tree from nested data ──────────────────── */
  const flatTree = useMemo(() => {
    const result: TreeNode[] = [];
    const rootItems = treeData.get('.') ?? [];

    const buildLevel = (items: FileItem[], depth: number) => {
      // Sort: dirs first, then alpha
      const sorted = [...items].sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      // Filter by search
      const filtered = searchQuery
        ? sorted.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : sorted;

      for (const item of filtered) {
        const isExpanded = expanded.has(item.path);
        const isLoading = loadingPaths.has(item.path);
        result.push({ ...item, depth, expanded: isExpanded, loading: isLoading });
        if (item.isDir && isExpanded) {
          const children = treeData.get(item.path);
          if (children) buildLevel(children, depth + 1);
        }
      }
    };

    buildLevel(rootItems, 0);
    return result;
  }, [treeData, expanded, loadingPaths, searchQuery]);

  /* ── Context menu ──────────────────────────────────────── */
  const handleContextMenu = useCallback((e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
    setTemplateMenu(false);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  /* ── Inline create ─────────────────────────────────────── */
  const startCreate = useCallback((parentPath: string, isDir: boolean, template?: typeof FILE_TEMPLATES[number]) => {
    setCreating({ parentPath, isDir, template });
    setCreateName(template ? `NewFile${template.ext}` : '');
    setContextMenu(null);
    if (!expanded.has(parentPath)) {
      setExpanded((prev) => new Set(prev).add(parentPath));
      if (!treeData.has(parentPath)) listDir(parentPath);
    }
    setTimeout(() => {
      createInputRef.current?.focus();
      createInputRef.current?.select();
    }, 50);
  }, [expanded, treeData, listDir]);

  const commitCreate = useCallback(() => {
    if (!creating || !createName.trim()) { setCreating(null); return; }
    const parent = creating.parentPath === '.' ? '' : creating.parentPath;
    const path = parent
      ? `${parent}/${createName.trim()}`
      : createName.trim();
    if (creating.isDir) {
      send({ msgType: 'mkdir', data: { path } });
    } else {
      const content = creating.template?.content
        ? btoa(creating.template.content)
        : '';
      send({ msgType: 'write', data: { path, data: content } });
    }
    setCreating(null);
    setCreateName('');
    // Backend write/mkdir returns nil — refresh manually after a short delay
    setTimeout(() => refreshExpanded(), 300);
  }, [creating, createName, send, refreshExpanded]);

  /* ── Inline rename ─────────────────────────────────────── */
  const startRename = useCallback((item: FileItem) => {
    setRenamingPath(item.path);
    setRenameValue(item.name);
    setContextMenu(null);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingPath || !renameValue.trim()) { setRenamingPath(null); return; }
    const parentDir = renamingPath.substring(0, renamingPath.lastIndexOf('/'));
    const newPath = parentDir ? `${parentDir}/${renameValue.trim()}` : renameValue.trim();
    if (newPath !== renamingPath) {
      send({ msgType: 'move', data: { from: renamingPath, to: newPath } });
      setTimeout(() => refreshExpanded(), 300);
    }
    setRenamingPath(null);
  }, [renamingPath, renameValue, send, refreshExpanded]);

  /* ── Delete ────────────────────────────────────────────── */
  const handleDelete = useCallback((item: FileItem) => {
    send({ msgType: 'delete', data: { path: item.path } });
    if (selectedPath === item.path) setSelectedPath(null);
    setContextMenu(null);
    setTimeout(() => refreshExpanded(), 300);
  }, [send, selectedPath, refreshExpanded]);

  /* ── Handle tree background context menu ────────────────── */
  const handleTreeContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item: { name: '', path: '.', isDir: true, size: 0, modTime: '' } });
    setTemplateMenu(false);
  }, []);

  /* ── Item click ─────────────────────────────────────────── */
  const handleItemClick = useCallback((item: FileItem) => {
    setSelectedPath(item.path);
    if (item.isDir) {
      toggleFolder(item.path);
    } else {
      // Open file in editor — send read request
      pendingReadPath.current = item.path;
      send({ msgType: 'read', data: { path: item.path } });
    }
  }, [toggleFolder, send]);

  /* ── Editor change + save ────────────────────────────────── */
  const handleEditorChange = useCallback((val: string) => {
    editorValueRef.current = val;
    setEditorDirty(true);
  }, []);

  const saveFile = useCallback(() => {
    if (!openFile) return;
    const data = btoa(editorValueRef.current);
    send({ msgType: 'write', data: { path: openFile.path, data } });
    setOpenFile({ ...openFile, content: editorValueRef.current });
    setEditorDirty(false);
  }, [openFile, send]);

  const closeFile = useCallback(() => {
    setOpenFile(null);
    setEditorDirty(false);
  }, []);

  /* ── Keyboard shortcuts (Cmd+F search, Cmd+S save) ─────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [saveFile]);

  /* ── Form submit ────────────────────────────────────────── */
  const handleConnectSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleConnect();
  }, [handleConnect]);

  /* ── LSP URL derived from open file extension ───────────── */
  const lspUrl = useMemo(() => {
    if (!openFile) return undefined;
    const fileName = openFile.path.split('/').pop() ?? '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      php: 'php', phtml: 'php',
      ts: 'typescript', tsx: 'typescript', js: 'typescript', jsx: 'typescript', mjs: 'typescript',
      go: 'go',
      py: 'python',
      rs: 'rust',
      html: 'html', htm: 'html',
      css: 'css', scss: 'css', less: 'css',
      json: 'json', jsonc: 'json',
    };
    const lang = ext ? langMap[ext] : undefined;
    if (!lang) return undefined;
    return `ws://localhost:19191/ws/lsp/${lang}`;
  }, [openFile]);

  /* ── Status dot class ───────────────────────────────────── */
  const statusDotCls = [
    'fe__status-dot',
    isConnected ? 'fe__status-dot--connected' : '',
    isConnecting ? 'fe__status-dot--connecting' : '',
    session.state === 'error' ? 'fe__status-dot--error' : '',
  ].filter(Boolean).join(' ');

  /* ── Render: connection form ────────────────────────────── */
  if (!isConnected && !isConnecting) {
    return (
      <div className="fe">
        <form className="fe__connect-form" onSubmit={handleConnectSubmit}>
          <div className="fe__connect-icon">
            <FileIcon name="project" type="directory" isOpen size={32} />
          </div>
          <h3 className="fe__connect-title">Open Folder</h3>
          <p className="fe__connect-desc">Enter the path to a directory to browse its contents.</p>
          <input
            className="fe__connect-input"
            type="text"
            value={rootDir}
            onChange={(e) => setRootDir(e.target.value)}
            placeholder="/path/to/project"
          />
          <button className="fe__connect-btn" type="submit">
            <FileIcon name="project" type="directory" isOpen size={14} />
            Open
          </button>
          {session.state === 'error' && (
            <div className="fe__connect-error">Connection failed. Check the path and try again.</div>
          )}
        </form>
      </div>
    );
  }

  /* ── Render: tree view ──────────────────────────────────── */
  const rootName = rootDir ? rootDir.split('/').pop() : 'root';
  const contextItem = contextMenu?.item;

  const openFileName = openFile ? openFile.path.split('/').pop() ?? '' : '';

  return (
    <div className={`fe${openFile ? ' fe--split' : ''}`}>
      {/* ── Sidebar (tree panel) ──────────────────────────────── */}
      <div className="fe__sidebar">
        {/* Header */}
        <div className="fe__header">
          <span className="fe__header-title">
            <FileIcon name={rootName ?? 'root'} type="directory" isOpen size={14} />
            {rootName}
          </span>
          <div className="fe__header-actions">
            <button
              className="fe__header-btn"
              title="New File"
              onClick={() => startCreate('.', false)}
              type="button"
            >
              <BoxIcon name="bx-file-blank" size={14} />
            </button>
            <button
              className="fe__header-btn"
              title="New Folder"
              onClick={() => startCreate('.', true)}
              type="button"
            >
              <BoxIcon name="bx-folder-plus" size={14} />
            </button>
            <button
              className="fe__header-btn"
              title="Refresh"
              onClick={refreshExpanded}
              type="button"
            >
              <BoxIcon name="bx-refresh" size={14} />
            </button>
            <button
              className="fe__header-btn"
              title="Search (Cmd+F)"
              onClick={() => { setSearchOpen((p) => !p); setTimeout(() => searchRef.current?.focus(), 50); }}
              type="button"
            >
              <BoxIcon name="bx-search" size={14} />
            </button>
            <button
              className="fe__header-btn fe__header-btn--disconnect"
              title="Disconnect"
              onClick={handleDisconnect}
              type="button"
            >
              <BoxIcon name="bx-power-off" size={14} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="fe__search">
            <BoxIcon name="bx-search" size={14} />
            <input
              ref={searchRef}
              className="fe__search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
            />
            {searchQuery && (
              <button
                className="fe__search-clear"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <BoxIcon name="bx-x" size={14} />
              </button>
            )}
          </div>
        )}

        {/* Tree */}
        <div className="fe__tree" onContextMenu={handleTreeContextMenu}>
          {flatTree.length === 0 && (
            <div className="fe__empty">
              <FileIcon name="empty" type="directory" isOpen size={24} />
              <span>Empty directory</span>
            </div>
          )}

          {flatTree.map((node) => {
            const isSelected = selectedPath === node.path;
            const isRenaming = renamingPath === node.path;

            return (
              <div
                key={node.path}
                className={`fe__node${isSelected ? ' fe__node--selected' : ''}`}
                style={{ paddingLeft: `${12 + node.depth * 16}px` }}
                onClick={() => handleItemClick(node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
                role="treeitem"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(node); }}
                aria-expanded={node.isDir ? node.expanded : undefined}
                aria-selected={isSelected}
              >
                <span className={`fe__chevron${node.isDir ? '' : ' fe__chevron--hidden'}`}>
                  {node.loading ? (
                    <BoxIcon name="bx-loader-alt" size={12} />
                  ) : node.isDir ? (
                    <BoxIcon name={node.expanded ? 'bx-chevron-down' : 'bx-chevron-right'} size={12} />
                  ) : null}
                </span>

                <span className="fe__icon">
                  <FileIcon
                    name={node.name}
                    type={node.isDir ? 'directory' : 'file'}
                    isOpen={node.expanded}
                    size={16}
                  />
                </span>

                {isRenaming ? (
                  <input
                    ref={renameInputRef}
                    className="fe__inline-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setRenamingPath(null);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className={`fe__name${node.isDir ? ' fe__name--dir' : ''}`}>
                    {node.name}
                  </span>
                )}
              </div>
            );
          })}

          {creating && (
            <div
              className="fe__node fe__node--creating"
              style={{
                paddingLeft: `${12 + (creating.parentPath === '.' ? 0 : 1) * 16}px`,
              }}
            >
              <span className="fe__chevron fe__chevron--hidden" />
              <span className="fe__icon">
                <FileIcon
                  name={createName || (creating.isDir ? 'folder' : 'file')}
                  type={creating.isDir ? 'directory' : 'file'}
                  size={16}
                />
              </span>
              <input
                ref={createInputRef}
                className="fe__inline-input"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onBlur={commitCreate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitCreate();
                  if (e.key === 'Escape') setCreating(null);
                  e.stopPropagation();
                }}
                placeholder={creating.isDir ? 'folder name...' : 'file name...'}
              />
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="fe__statusbar">
          <span className={statusDotCls} />
          <span className="fe__statusbar-count">
            {flatTree.length} item{flatTree.length !== 1 ? 's' : ''}
          </span>
          <span className="fe__statusbar-path">{rootDir || '/'}</span>
        </div>
      </div>

      {/* ── Editor panel ──────────────────────────────────────── */}
      {openFile && (
        <div className="fe__editor">
          <div className="fe__editor-tab">
            <FileIcon name={openFileName} type="file" size={14} />
            <span className="fe__editor-tab-name">
              {openFileName}
              {editorDirty && <span className="fe__editor-dot" />}
            </span>
            <div className="fe__editor-tab-actions">
              <button
                className="fe__header-btn"
                title="Save (Cmd+S)"
                onClick={saveFile}
                disabled={!editorDirty}
                type="button"
              >
                <BoxIcon name="bx-save" size={14} />
              </button>
              <button
                className="fe__header-btn"
                title="Close"
                onClick={closeFile}
                type="button"
              >
                <BoxIcon name="bx-x" size={14} />
              </button>
            </div>
          </div>
          <div className="fe__editor-body">
            <Suspense fallback={<div className="fe__editor-loading">Loading editor...</div>}>
              <CodeEditor
                value={openFile.content}
                fileName={openFileName}
                height="100%"
                onChange={handleEditorChange}
                minimap
                lineNumbers
                fontSize={13}
                tabSize={2}
                lspUrl={lspUrl}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && contextItem && (
        <div
          ref={menuRef}
          className="fe__menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextItem.isDir && (
            <>
              <button
                className="fe__menu-item"
                onClick={() => startCreate(contextItem.path, false)}
                type="button"
              >
                <BoxIcon name="bx-file-blank" size={14} /> New File
              </button>
              <button
                className="fe__menu-item"
                onClick={() => startCreate(contextItem.path, true)}
                type="button"
              >
                <BoxIcon name="bx-folder-plus" size={14} /> New Folder
              </button>
              <div
                className="fe__menu-parent"
                onMouseEnter={() => setTemplateMenu(true)}
                onMouseLeave={() => setTemplateMenu(false)}
              >
                <button className="fe__menu-item" type="button">
                  <BoxIcon name="bx-file" size={14} /> New from Template
                  <span className="fe__menu-chevron">
                    <BoxIcon name="bx-chevron-right" size={12} />
                  </span>
                </button>
                {templateMenu && (
                  <div className="fe__submenu">
                    {FILE_TEMPLATES.map((t) => {
                      const tIcon = resolveIcon(`x${t.ext}`, 'file');
                      return (
                        <button
                          key={t.ext}
                          className="fe__menu-item"
                          onClick={() => startCreate(contextItem.path, false, t)}
                          type="button"
                        >
                          <span className="fe__menu-icon" style={{ color: tIcon.color }}>
                            <FileIcon name={`x${t.ext}`} type="file" size={14} />
                          </span>
                          {t.name} ({t.ext})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="fe__menu-sep" />
            </>
          )}
          {contextItem.name && (
            <>
              <button
                className="fe__menu-item"
                onClick={() => startRename(contextItem)}
                type="button"
              >
                <BoxIcon name="bx-edit-alt" size={14} /> Rename
              </button>
              <button
                className="fe__menu-item"
                onClick={() => {
                  navigator.clipboard.writeText(contextItem.path);
                  setContextMenu(null);
                }}
                type="button"
              >
                <BoxIcon name="bx-copy-alt" size={14} /> Copy Path
              </button>
              <button
                className="fe__menu-item fe__menu-item--danger"
                onClick={() => handleDelete(contextItem)}
                type="button"
              >
                <BoxIcon name="bx-trash" size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
