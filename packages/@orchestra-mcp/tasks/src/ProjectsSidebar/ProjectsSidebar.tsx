import { useState, useCallback, useMemo } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { EmptyState } from '@orchestra-mcp/ui';
import { ProjectItem } from './ProjectItem';
import './ProjectsSidebar.css';

export interface ProjectSummary {
  slug: string;
  name: string;
  status: string;
  epicCount: number;
  taskCount: number;
  completionPercent: number;
  integrations: ('github' | 'jira' | 'linear')[];
  icon?: string;
  color?: string;
  pinned?: boolean;
}

export interface ProjectsSidebarProps {
  projects: ProjectSummary[];
  activeProject: string | null;
  onProjectClick: (slug: string) => void;
  onCreateProject?: () => void;
  onDeleteProject?: (slug: string) => void;
  onPinProject?: (slug: string) => void;
  onRenameProject?: (slug: string, newName: string) => void;
  onIconChange?: (slug: string, icon: string) => void;
  onColorChange?: (slug: string, color: string) => void;
  onUpdateKey?: (slug: string) => void;
  onIconClick?: (slug: string) => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ProjectsSidebar = ({
  projects,
  activeProject,
  onProjectClick,
  onCreateProject,
  onDeleteProject,
  onPinProject,
  onRenameProject,
  onIconChange,
  onColorChange,
  onUpdateKey,
  onIconClick,
  loading = false,
  searchQuery: controlledQuery,
  onSearchChange: controlledOnChange,
}: ProjectsSidebarProps) => {
  const [internalQuery, setInternalQuery] = useState('');
  const query = controlledQuery ?? internalQuery;
  const setQuery = controlledOnChange ?? setInternalQuery;

  // -- Multi-select state -----------------------------------
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const selectionMode = selectedSlugs.size > 0;

  const handleToggleSelect = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  // -- Filter + sort (pinned first, then by name) -----------
  const sorted = useMemo(() => {
    const filtered = query.trim()
      ? projects.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.slug.toLowerCase().includes(query.toLowerCase())
        )
      : projects;

    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [projects, query]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  return (
    <aside className="projects-sidebar" data-testid="projects-sidebar">
      <div className="projects-sidebar__header">
        <h2 className="projects-sidebar__title">Projects</h2>
        {onCreateProject && (
          <button
            className="projects-sidebar__new-btn"
            data-testid="create-project-btn"
            onClick={onCreateProject}
            aria-label="Create project"
          >
            <BoxIcon name="bx-plus" size={18} />
          </button>
        )}
      </div>

      <div className="projects-sidebar__search">
        <span className="projects-sidebar__search-icon">
          <BoxIcon name="bx-search" size={16} />
        </span>
        <input
          className="projects-sidebar__search-input"
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="projects-sidebar__loading" aria-label="Loading projects">
          <BoxIcon name="bx-loader-alt" size={20} className="projects-sidebar__spinner" />
        </div>
      ) : sorted.length > 0 ? (
        <div className="projects-sidebar__list" data-testid="projects-list">
          {sorted.map((project) => (
            <ProjectItem
              key={project.slug}
              slug={project.slug}
              name={project.name}
              status={project.status}
              taskCount={project.taskCount}
              completionPercent={project.completionPercent}
              active={activeProject === project.slug}
              pinned={project.pinned}
              icon={project.icon}
              color={project.color}
              selected={selectedSlugs.has(project.slug)}
              selectionMode={selectionMode}
              onSelect={onProjectClick}
              onDelete={onDeleteProject}
              onPin={onPinProject}
              onRename={onRenameProject}
              onIconChange={onIconChange}
              onColorChange={onColorChange}
              onUpdateKey={onUpdateKey}
              onToggleSelect={handleToggleSelect}
              onIconClick={onIconClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BoxIcon name="bx-grid-alt" size={40} />}
          title={query.trim() ? 'No matching projects' : 'No projects yet'}
          description={query.trim() ? 'Try a different search term' : 'Create a project to get started'}
        />
      )}
    </aside>
  );
};
