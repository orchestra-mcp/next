"use client";

import { useRef, useEffect, useState, type ReactNode } from 'react';
import './Checkbox.css';

export type CheckboxColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  color?: CheckboxColor;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = ({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  error,
  color,
  onChange,
  className,
}: CheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const stateClass = indeterminate
    ? 'checkbox--indeterminate'
    : checked
      ? 'checkbox--checked'
      : '';

  const classes = [
    'checkbox',
    stateClass,
    disabled ? 'checkbox--disabled' : '',
    error ? 'checkbox--error' : '',
    color ? `checkbox--${color}` : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label className="checkbox__wrapper">
        <input
          ref={inputRef}
          type="checkbox"
          className="checkbox__input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-invalid={!!error}
        />
        <span className="checkbox__box" />
        {label && <span className="checkbox__label">{label}</span>}
      </label>
      {error && <span className="checkbox__error">{error}</span>}
    </div>
  );
};

export interface CheckboxCardProps {
  checked?: boolean;
  disabled?: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  color?: CheckboxColor;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const CheckboxCard = ({
  checked = false,
  disabled = false,
  title,
  description,
  icon,
  color,
  onChange,
  className,
}: CheckboxCardProps) => {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const classes = [
    'checkbox-card',
    checked ? 'checkbox-card--checked' : '',
    disabled ? 'checkbox-card--disabled' : '',
    color ? `checkbox-card--${color}` : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={handleClick} role="group" aria-label={title}>
      {icon && <div className="checkbox-card__icon">{icon}</div>}
      <div className="checkbox-card__text">
        <span className="checkbox-card__title">{title}</span>
        {description && <span className="checkbox-card__desc">{description}</span>}
      </div>
      <Checkbox checked={checked} disabled={disabled} color={color} onChange={onChange} />
    </div>
  );
};

export interface TreeCheckboxNode {
  id: string;
  label: string;
  children?: TreeCheckboxNode[];
}

export interface TreeCheckboxProps {
  nodes: TreeCheckboxNode[];
  selected: string[];
  color?: CheckboxColor;
  disabled?: boolean;
  onChange: (selected: string[]) => void;
  className?: string;
}

function getAllIds(node: TreeCheckboxNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllIds(child));
    }
  }
  return ids;
}

function TreeNode({
  node,
  selected,
  color,
  disabled,
  onChange,
  depth = 0,
}: {
  node: TreeCheckboxNode;
  selected: string[];
  color?: CheckboxColor;
  disabled?: boolean;
  onChange: (selected: string[]) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const allIds = getAllIds(node);
  const leafIds = hasChildren ? allIds.filter((id) => id !== node.id) : [node.id];
  const checkedCount = leafIds.filter((id) => selected.includes(id)).length;
  const isChecked = checkedCount === leafIds.length;
  const isIndeterminate = checkedCount > 0 && checkedCount < leafIds.length;

  const handleToggle = () => {
    if (disabled) return;
    if (isChecked) {
      onChange(selected.filter((id) => !allIds.includes(id)));
    } else {
      const newSelected = [...selected];
      for (const id of allIds) {
        if (!newSelected.includes(id)) newSelected.push(id);
      }
      onChange(newSelected);
    }
  };

  return (
    <div className="tree-checkbox__node">
      <div className="tree-checkbox__row" style={{ paddingLeft: depth * 20 }}>
        {hasChildren ? (
          <button
            type="button"
            className={`tree-checkbox__toggle ${expanded ? 'tree-checkbox__toggle--open' : ''}`}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : (
          <span className="tree-checkbox__spacer" />
        )}
        <Checkbox
          checked={isChecked}
          indeterminate={isIndeterminate}
          disabled={disabled}
          label={node.label}
          color={color}
          onChange={handleToggle}
        />
      </div>
      {hasChildren && expanded && (
        <div className="tree-checkbox__children">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selected={selected}
              color={color}
              disabled={disabled}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const TreeCheckbox = ({
  nodes,
  selected,
  color,
  disabled,
  onChange,
  className,
}: TreeCheckboxProps) => {
  const classes = ['tree-checkbox', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tree">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selected={selected}
          color={color}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
    </div>
  );
};
