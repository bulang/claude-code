<template>
  <div
    class="tree-node"
    :class="{
      'is-folder': node.type === 'folder',
      'is-selected': selectedFileId === node.id
    }"
  >
    <div
      class="node-content"
      :style="{ paddingLeft: `${level * 16 + 12}px` }"
      @click="handleClick"
      @contextmenu.prevent="showContextMenu"
    >
      <span v-if="node.type === 'folder'" class="toggle-icon" @click.stop="toggle">
        <Icon :icon="node.isOpen ? 'carbon:chevron-down' : 'carbon:chevron-right'" />
      </span>
      <span v-else class="toggle-icon placeholder"></span>

      <span class="file-icon">
        <Icon :icon="getFileIcon(node)" />
      </span>

      <template v-if="node.isEditing">
        <input
          ref="inputRef"
          v-model="editingName"
          class="rename-input"
          @blur="finishRename"
          @keyup.enter="finishRename"
          @keyup.esc="cancelRename"
        />
      </template>
      <span v-else class="node-name">{{ node.name }}</span>
    </div>

    <!-- Context Menu -->
    <div v-if="showMenu" class="context-menu" :style="menuStyle" v-click-outside="hideMenu">
      <div class="menu-item" @click="startCreate('file')">
        <Icon icon="carbon:document-add" />
        <span>新建文件</span>
      </div>
      <div class="menu-item" @click="startCreate('folder')">
        <Icon icon="carbon:folder-add" />
        <span>新建文件夹</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="startRename">
        <Icon icon="carbon:edit" />
        <span>重命名</span>
      </div>
      <div class="menu-item delete" @click="startDelete">
        <Icon icon="carbon:trash-can" />
        <span>删除</span>
      </div>
    </div>

    <!-- Children -->
    <div v-if="node.type === 'folder' && node.isOpen" class="children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @create="$emit('create', $event, 'file')"
        @delete="$emit('delete', $event)"
        @rename="$emit('rename', $event, '')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { Icon } from '@iconify/vue';
import type { FileNode } from '@/types';
import { useStore } from '@/stores';

const props = defineProps<{
  node: FileNode;
  level?: number;
}>();

const emit = defineEmits<{
  (e: 'select', node: FileNode): void;
  (e: 'toggle', node: FileNode): void;
  (e: 'create', parentId: string, type: 'file' | 'folder'): void;
  (e: 'delete', node: FileNode): void;
  (e: 'rename', node: FileNode, newName: string): void;
}>();

const store = useStore();
const selectedFileId = computed(() => store.selectedFileId);

const level = props.level ?? 0;
const showMenu = ref(false);
const menuStyle = ref<Record<string, string>>({});
const inputRef = ref<HTMLInputElement>();
const editingName = ref('');

function getFileIcon(node: FileNode): string {
  if (node.type === 'folder') {
    return node.isOpen ? 'carbon:folder-open' : 'carbon:folder';
  }
  if (node.name.endsWith('.vue')) return 'carbon:logo-vue';
  if (node.name.endsWith('.ts')) return 'carbon:typescript';
  if (node.name.endsWith('.js')) return 'carbon:logo-javascript';
  if (node.name.endsWith('.css')) return 'carbon:css';
  if (node.name.endsWith('.html')) return 'carbon:html';
  if (node.name.endsWith('.json')) return 'carbon:json';
  return 'carbon:document';
}

function handleClick() {
  emit('select', props.node);
}

function toggle() {
  emit('toggle', props.node);
}

function showContextMenu(e: MouseEvent) {
  showMenu.value = true;
  menuStyle.value = {
    position: 'fixed',
    left: `${e.clientX}px`,
    top: `${e.clientY}px`
  };
}

function hideMenu() {
  showMenu.value = false;
}

function startCreate(type: 'file' | 'folder') {
  hideMenu();
  emit('create', props.node.id, type);
}

function startDelete() {
  hideMenu();
  emit('delete', props.node);
}

function startRename() {
  hideMenu();
  editingName.value = props.node.name;
  props.node.isEditing = true;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
}

function finishRename() {
  if (editingName.value && editingName.value !== props.node.name) {
    emit('rename', props.node, editingName.value);
  } else {
    props.node.isEditing = false;
  }
}

function cancelRename() {
  props.node.isEditing = false;
  editingName.value = props.node.name;
}
</script>

<script lang="ts">
// Click outside directive
const clickOutside = {
  mounted(el: HTMLElement, binding: any) {
    (el as any)._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) {
        binding.value();
      }
    };
    document.addEventListener('click', (el as any)._clickOutside);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside);
  }
};

export default {
  directives: {
    'click-outside': clickOutside
  }
};
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  height: 28px;
  cursor: pointer;
  gap: 4px;
  position: relative;
}

.node-content:hover {
  background: var(--bg-hover);
}

.tree-node.is-selected > .node-content {
  background: var(--bg-active);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.toggle-icon.placeholder {
  visibility: hidden;
}

.file-icon {
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.tree-node.is-selected .file-icon {
  color: var(--accent-color);
}

.node-name {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rename-input {
  flex: 1;
  min-width: 0;
  padding: 2px 6px;
  border: 1px solid var(--accent-color);
  border-radius: 3px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.context-menu {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px;
  min-width: 140px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-primary);
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.delete:hover {
  background: rgba(220, 68, 70, 0.2);
  color: #dc4446;
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

.children {
  /* Recursive styling handled by component */
}
</style>
