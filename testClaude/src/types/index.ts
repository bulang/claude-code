export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
  isEditing?: boolean;
  isNew?: boolean;
}

export interface Dependency {
  id: string;
  name: string;
  url: string;
  type: 'css' | 'js';
}

export interface Tab {
  id: string;
  name: string;
  fileId: string;
  isModified: boolean;
}

export type Theme = 'light' | 'dark';
