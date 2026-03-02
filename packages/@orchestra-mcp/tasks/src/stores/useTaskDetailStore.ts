import { create } from 'zustand';

interface SelectedTask {
  taskId: string;
  epicId: string;
  storyId: string;
}

interface TaskDetailState {
  selectedTask: SelectedTask | null;
  selectTask: (task: SelectedTask) => void;
  clearSelection: () => void;
}

export const useTaskDetailStore = create<TaskDetailState>((set) => ({
  selectedTask: null,
  selectTask: (task) => set({ selectedTask: task }),
  clearSelection: () => set({ selectedTask: null }),
}));
