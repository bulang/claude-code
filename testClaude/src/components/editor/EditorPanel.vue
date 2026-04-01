<template>
  <div class="editor-panel">
    <TabBar />
    <div class="editor-container">
      <MonacoEditor
        v-if="activeFile"
        :value="activeFile.content || ''"
        :language="getLanguage(activeFile.name)"
        :theme="editorTheme"
        @change="handleChange"
      />
      <div v-else class="empty-state">
        <Icon icon="carbon:code" class="empty-icon" />
        <p>选择一个文件开始编辑</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import TabBar from './TabBar.vue';
import MonacoEditor from './MonacoEditor.vue';

const store = useStore();
const { activeFile, theme } = storeToRefs(store);

const editorTheme = computed(() => theme.value === 'dark' ? 'vs-dark' : 'vs');

function getLanguage(filename: string): string {
  if (filename.endsWith('.vue')) return 'vue';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.json')) return 'json';
  return 'plaintext';
}

let debounceTimer: number | null = null;

function handleChange(value: string) {
  if (!activeFile.value) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    store.updateFileContent(activeFile.value!.id, value);
  }, 300);
}
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.editor-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
</style>
