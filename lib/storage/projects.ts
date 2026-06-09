import { get, set, del, keys } from 'idb-keyval';

export interface ProjectFile {
  name: string;
  content: string;
}

export interface ProjectSnapshot {
  id: string;
  createdAt: number;
  files: ProjectFile[];
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
  snapshots: ProjectSnapshot[];
}

const KEY_PREFIX = 'ondevai_project_';

function projectKey(id: string) {
  return KEY_PREFIX + id;
}

export async function saveProject(project: Project): Promise<void> {
  await set(projectKey(project.id), { ...project, updatedAt: Date.now() });
}

export async function loadProject(id: string): Promise<Project | null> {
  return (await get(projectKey(id))) ?? null;
}

export async function listProjects(): Promise<Project[]> {
  const allKeys = await keys();
  const projectKeys = (allKeys as string[]).filter(k => typeof k === 'string' && k.startsWith(KEY_PREFIX));
  const projects = await Promise.all(projectKeys.map(k => get(k)));
  return (projects.filter(Boolean) as Project[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProject(id: string): Promise<void> {
  await del(projectKey(id));
}

export async function renameProject(id: string, name: string): Promise<void> {
  const project = await loadProject(id);
  if (project) await saveProject({ ...project, name });
}

export async function saveSnapshot(projectId: string, files: ProjectFile[]): Promise<void> {
  const project = await loadProject(projectId);
  if (!project) return;
  const snapshot: ProjectSnapshot = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    files: [...files],
  };
  const snapshots = [...(project.snapshots ?? []), snapshot].slice(-10); // keep last 10
  await saveProject({ ...project, snapshots });
}

export function createProject(prompt: string, files: ProjectFile[]): Project {
  return {
    id: Date.now().toString(),
    name: prompt.slice(0, 40) || 'Untitled',
    prompt,
    files,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    snapshots: [],
  };
}
