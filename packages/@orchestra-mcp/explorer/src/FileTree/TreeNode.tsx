import type { KeyboardEvent } from 'react';
import type { FileNode } from './FileTree';

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  selectedId?: string;
  onSelect?: (node: FileNode) => void;
  onToggle: (node: FileNode) => void;
  onKeyDown: (e: KeyboardEvent, node: FileNode) => void;
}

export const TreeNode = ({
  node,
  depth,
  expanded,
  selectedId,
  onSelect,
  onToggle,
  onKeyDown,
}: TreeNodeProps) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (isFolder) {
      onToggle(node);
    }
    onSelect?.(node);
  };

  return (
    <div role="treeitem" aria-expanded={isFolder ? isExpanded : undefined}>
      <div
        className={`file-tree__row ${isSelected ? 'file-tree__row--selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        onKeyDown={(e) => onKeyDown(e, node)}
        tabIndex={0}
      >
        {isFolder && (
          <span
            className={`file-tree__chevron ${isExpanded ? 'file-tree__chevron--open' : ''}`}
            data-testid={`chevron-${node.id}`}
          >
            &#9654;
          </span>
        )}
        {!isFolder && <span className="file-tree__spacer" />}
        {node.icon && <span className="file-tree__icon">{node.icon}</span>}
        <span className="file-tree__name">{node.name}</span>
        {node.modified && (
          <span className="file-tree__modified" data-testid={`modified-${node.id}`}>
            &#9679;
          </span>
        )}
      </div>
      {isFolder && isExpanded && node.children && (
        <div className="file-tree__children" role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
};
