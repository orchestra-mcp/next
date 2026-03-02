/**
 * SidebarActionRegistration mirrors the Go SidebarActionDef struct.
 * Defines a header action button on a sidebar view.
 */
export interface SidebarActionRegistration {
  id: string;
  icon: string;
  tooltip: string;
  action: string;
}

/**
 * SidebarViewRegistration mirrors the Go SidebarViewDef struct.
 * Contributed by plugins via the UIManifest at boot.
 */
export interface SidebarViewRegistration {
  id: string;
  title: string;
  icon: string;
  route: string;
  order: number;
  visible: boolean;
  badge?: string;
  actions?: SidebarActionRegistration[];
  hasSearch?: boolean;
}

class SidebarRegistry {
  private views: Map<string, SidebarViewRegistration> = new Map();

  /** Register a sidebar view */
  register(view: SidebarViewRegistration): void {
    if (this.views.has(view.id)) {
      console.warn(`Sidebar view already registered: ${view.id}`);
      return;
    }
    this.views.set(view.id, view);
  }

  /** Unregister a sidebar view by id */
  unregister(id: string): void {
    this.views.delete(id);
  }

  /** Get a sidebar view by id */
  get(id: string): SidebarViewRegistration | undefined {
    return this.views.get(id);
  }

  /** Get all registered sidebar views sorted by order */
  getAll(): SidebarViewRegistration[] {
    return Array.from(this.views.values()).sort((a, b) => a.order - b.order);
  }

  /** Get only visible sidebar views sorted by order */
  getVisible(): SidebarViewRegistration[] {
    return this.getAll().filter((v) => v.visible);
  }

  /** Check if a view is registered */
  has(id: string): boolean {
    return this.views.has(id);
  }

  /** Clear all registrations */
  clear(): void {
    this.views.clear();
  }

  /** Get view count */
  count(): number {
    return this.views.size;
  }
}

// Singleton instance
export const sidebarRegistry = new SidebarRegistry();
