import { useState, useCallback } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { TreeNode } from './TreeNode';
import './FileTree.css';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  icon?: ReactNode;
  modified?: boolean;
}

export interface FileTreeProps {
  /** Array of root-level file/folder nodes */
  items: FileNode[];
  /** Called when a node is selected */
  onSelect?: (node: FileNode) => void;
  /** Called when a folder is expanded/collapsed */
  onExpand?: (node: FileNode) => void;
  /** ID of the currently selected node */
  selectedId?: string;
  /** IDs of folders expanded by default */
  defaultExpanded?: string[];
}

export const FileTree = ({
  items,
  onSelect,
  onExpand,
  selectedId,
  defaultExpanded = [],
}: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded),
  );

  const toggleExpand = useCallback(
    (node: FileNode) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
      onExpand?.(node);
    },
    [onExpand],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, node: FileNode) => {
      if (e.key === 'Enter') {
        if (node.type === 'folder') {
          toggleExpand(node);
        }
        onSelect?.(node);
      }
    },
    [onSelect, toggleExpand],
  );

  return (
    <div className="file-tree" role="tree">
      {items.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          selectedId={selectedId}
          onSelect={onSelect}
          onToggle={toggleExpand}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
};
