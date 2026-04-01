<template>
  <div class="file-explorer">
    <div class="toolbar">
      <span class="title">文件</span>
      <div class="actions">
        <button class="btn-icon" @click="createItem('file')" title="新建文件">
          <Icon icon="carbon:document-add" />
        </button>
        <button class="btn-icon" @click="createItem('folder')" title="新建文件夹">
          <Icon icon="carbon:folder-add" />
        </button>
      </div>
    </div>
    <div class="tree">
      <FileTreeNode
        v-for="node in files"
        :key="node.id"
        :node="node"
        @select="selectFile"
        @toggle="toggleFolder"
        @create="createFileInFolder"
        @delete="deleteFile"
        @rename="renameFile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import FileTreeNode from './FileTreeNode.vue';
import type { FileNode } from '@/types';

const store = useStore();
const { files } = storeToRefs(store);

function selectFile(node: FileNode) {
  if (node.type === 'file') {
    store.openFile(node.id);
  }
}

function toggleFolder(node: FileNode) {
  store.toggleFolder(node.id);
}

function createItem(type: 'file' | 'folder') {
  // Create in root (src folder)
  const root = files.value[0];
  if (root) {
    const name = type === 'file' ? 'NewFile.vue' : 'NewFolder';
    store.createFile(root.id, name, type);
  }
}

function createFileInFolder(parentId: string, type: 'file' | 'folder') {
  const name = type === 'file' ? 'NewFile.vue' : 'NewFolder';
  store.createFile(parentId, name, type);
}

function deleteFile(node: FileNode) {
  if (confirm(`确定要删除 "${node.name}" 吗？`)) {
    store.deleteFile(node.id);
  }
}

function renameFile(node: FileNode, newName: string) {
  store.renameFile(node.id, newName);
}
</script>

<style scoped>
.file-explorer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tree {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}
</style>
