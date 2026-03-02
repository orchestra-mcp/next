import { useState } from 'react';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ProjectTreeCard.css';

const TYPE_ICONS: Record<string, string> = {
  epic: '\u26A1',
  story: '\uD83D\uDCD6',
  task: '\u2611',
  bug: '\uD83D\uDC1B',
  hotfix: '\uD83D\uDD25',
};

const ACTIVE_STATUSES = new Set(['in-progress', 'in-testing', 'in-docs', 'in-review']);

function statusDotClass(status: string): string {
  if (status === 'done') return 'project-tree__dot project-tree__dot--done';
  if (ACTIVE_STATUSES.has(status)) return 'project-tree__dot project-tree__dot--active';
  return 'project-tree__dot project-tree__dot--idle';
}

interface TreeTask {
  id: string;
  title: string;
  status: string;
  type: string;
}

interface TreeStory {
  id: string;
  title: string;
  status: string;
  tasks: TreeTask[];
}

interface TreeEpic {
  id: string;
  title: string;
  status: string;
  stories: TreeStory[];
}

export interface ProjectTreeCardProps {
  data: {
    project: string;
    epics: TreeEpic[];
  };
  className?: string;
}

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EpicNode = ({ epic }: { epic: TreeEpic }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="project-tree__epic">
        <button
          type="button"
          className={`project-tree__toggle${open ? ' project-tree__toggle--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <Chevron />
        </button>
        <span className="project-tree__icon">{TYPE_ICONS.epic}</span>
        <span className="project-tree__id">{epic.id}</span>
        <span className="project-tree__title" title={epic.title}>{epic.title}</span>
        <span className={statusDotClass(epic.status)} title={epic.status} />
      </div>
      {open && epic.stories.map((s) => <StoryNode key={s.id} story={s} />)}
    </div>
  );
};

const StoryNode = ({ story }: { story: TreeStory }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="project-tree__story">
        <button
          type="button"
          className={`project-tree__toggle${open ? ' project-tree__toggle--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <Chevron />
        </button>
        <span className="project-tree__icon">{TYPE_ICONS.story}</span>
        <span className="project-tree__id">{story.id}</span>
        <span className="project-tree__title" title={story.title}>{story.title}</span>
        <span className={statusDotClass(story.status)} title={story.status} />
      </div>
      {open && story.tasks.map((t) => (
        <div key={t.id} className="project-tree__task">
          <span className="project-tree__icon">{TYPE_ICONS[t.type] ?? TYPE_ICONS.task}</span>
          <span className="project-tree__id">{t.id}</span>
          <span className="project-tree__title" title={t.title}>{t.title}</span>
          <span className={statusDotClass(t.status)} title={t.status} />
        </div>
      ))}
    </div>
  );
};

export const ProjectTreeCard = ({ data, className }: ProjectTreeCardProps) => (
  <CardBase
    title={`Project Tree: ${data.project}`}
    icon={<BoxIcon name="bx-git-branch" size={16} />}
    badge={`${data.epics.length} epics`}
    badgeColor="info"
    defaultCollapsed={false}
    className={className}
  >
    {data.epics.map((epic) => <EpicNode key={epic.id} epic={epic} />)}
  </CardBase>
);
