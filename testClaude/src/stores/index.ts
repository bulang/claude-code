import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FileNode, Dependency, Tab, Theme } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultFiles: FileNode[] = [
  {
    id: 'root',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: generateId(),
        name: 'components',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: generateId(),
            name: 'HelloWorld.vue',
            type: 'file',
            content: `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="hello">
    <h1>Hello Vue!</h1>
    <p>点击按钮计数: {{ count }}</p>
    <button @click="count++">+1</button>
  </div>
</template>

<style scoped>
.hello {
  text-align: center;
  padding: 20px;
}
h1 {
  color: #42b883;
}
button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #3aa876;
}
</style>
`
          }
        ]
      },
      {
        id: generateId(),
        name: 'App.vue',
        type: 'file',
        content: `<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div id="app">
    <HelloWorld />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
`
      },
      {
        id: generateId(),
        name: 'main.ts',
        type: 'file',
        content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`
      }
    ]
  }
];

const defaultDependencies: Dependency[] = [];

export const useStore = defineStore('main', () => {
  // State
  const files = ref<FileNode[]>(defaultFiles);
  const openTabs = ref<Tab[]>([]);
  const activeTabId = ref<string>('');
  const theme = ref<Theme>('light');
  const dependencies = ref<Dependency[]>(defaultDependencies);
  const selectedFileId = ref<string>('');

  // Getters
  const activeFile = computed(() => {
    if (!activeTabId.value) return null;
    return findFileById(files.value, activeTabId.value);
  });

  const allFiles = computed(() => {
    const result: FileNode[] = [];
    const traverse = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          result.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(files.value);
    return result;
  });

  // Actions
  function findFileById(nodes: FileNode[], id: string): FileNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function findParentFolder(nodes: FileNode[], childId: string, parent: FileNode | null = null): FileNode | null {
    for (const node of nodes) {
      if (node.id === childId) return parent;
      if (node.children) {
        const found = findParentFolder(node.children, childId, node);
        if (found) return found;
      }
    }
    return null;
  }

  function openFile(fileId: string) {
    const file = findFileById(files.value, fileId);
    if (!file || file.type !== 'file') return;

    const existingTab = openTabs.value.find(tab => tab.fileId === fileId);
    if (existingTab) {
      activeTabId.value = existingTab.id;
    } else {
      const newTab: Tab = {
        id: generateId(),
        name: file.name,
        fileId: fileId,
        isModified: false
      };
      openTabs.value.push(newTab);
      activeTabId.value = newTab.id;
    }
    selectedFileId.value = fileId;
  }

  function closeTab(tabId: string) {
    const index = openTabs.value.findIndex(tab => tab.id === tabId);
    if (index === -1) return;

    openTabs.value.splice(index, 1);

    if (activeTabId.value === tabId) {
      if (openTabs.value.length > 0) {
        const newIndex = Math.min(index, openTabs.value.length - 1);
        activeTabId.value = openTabs.value[newIndex].id;
        selectedFileId.value = openTabs.value[newIndex].fileId;
      } else {
        activeTabId.value = '';
        selectedFileId.value = '';
      }
    }
  }

  function updateFileContent(fileId: string, content: string) {
    const file = findFileById(files.value, fileId);
    if (file && file.type === 'file') {
      file.content = content;
      const tab = openTabs.value.find(t => t.fileId === fileId);
      if (tab) {
        tab.isModified = true;
      }
    }
  }

  function saveFile(fileId: string) {
    const tab = openTabs.value.find(t => t.fileId === fileId);
    if (tab) {
      tab.isModified = false;
    }
  }

  function createFile(parentId: string, name: string, type: 'file' | 'folder') {
    const parent = findFileById(files.value, parentId);
    if (!parent || parent.type !== 'folder') return;

    if (!parent.children) {
      parent.children = [];
    }

    const newNode: FileNode = {
      id: generateId(),
      name,
      type,
      isNew: true,
      isEditing: true,
      ...(type === 'folder' ? { isOpen: true, children: [] } : { content: '' })
    };

    parent.children.push(newNode);
    parent.isOpen = true;

    if (type === 'file') {
      openFile(newNode.id);
    }
  }

  function deleteFile(fileId: string) {
    const parent = findParentFolder(files.value, fileId);
    if (parent && parent.children) {
      const index = parent.children.findIndex(child => child.id === fileId);
      if (index !== -1) {
        const fileName = parent.children[index].name;
        console.log('Deleting file:', fileName);
        parent.children.splice(index, 1);

        // Close tab if open
        const tab = openTabs.value.find(t => t.fileId === fileId);
        if (tab) {
          closeTab(tab.id);
        }
      }
    }
  }

  function renameFile(fileId: string, newName: string) {
    const file = findFileById(files.value, fileId);
    if (file) {
      file.name = newName;
      file.isEditing = false;
      file.isNew = false;

      // Update tab name
      const tab = openTabs.value.find(t => t.fileId === fileId);
      if (tab) {
        tab.name = newName;
      }
    }
  }

  function toggleFolder(folderId: string) {
    const folder = findFileById(files.value, folderId);
    if (folder && folder.type === 'folder') {
      folder.isOpen = !folder.isOpen;
    }
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      theme.value = saved;
      document.documentElement.setAttribute('data-theme', saved);
    }
  }

  function addDependency(dep: Omit<Dependency, 'id'>) {
    dependencies.value.push({
      ...dep,
      id: generateId()
    });
    saveDependencies();
  }

  function removeDependency(id: string) {
    const index = dependencies.value.findIndex(d => d.id === id);
    if (index !== -1) {
      dependencies.value.splice(index, 1);
      saveDependencies();
    }
  }

  function saveDependencies() {
    localStorage.setItem('dependencies', JSON.stringify(dependencies.value));
  }

  function loadDependencies() {
    const saved = localStorage.getItem('dependencies');
    if (saved) {
      dependencies.value = JSON.parse(saved);
    }
  }

  function exportProject(): Record<string, string> {
    const result: Record<string, string> = {};
    const traverse = (nodes: FileNode[], path: string) => {
      nodes.forEach(node => {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        if (node.type === 'file') {
          result[fullPath] = node.content || '';
        } else if (node.children) {
          traverse(node.children, fullPath);
        }
      });
    };
    traverse(files.value, '');
    return result;
  }

  return {
    files,
    openTabs,
    activeTabId,
    theme,
    dependencies,
    selectedFileId,
    activeFile,
    allFiles,
    findFileById,
    openFile,
    closeTab,
    updateFileContent,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    toggleFolder,
    setTheme,
    loadTheme,
    addDependency,
    removeDependency,
    loadDependencies,
    exportProject
  };
});
