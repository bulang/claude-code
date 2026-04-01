<template>
  <div class="app-container" :data-theme="theme">
    <HeaderBar />
    <div class="main-content">
      <splitpanes class="default-theme">
        <pane size="20" min-size="15" max-size="40">
          <FileExplorer />
        </pane>
        <pane size="40" min-size="20">
          <EditorPanel />
        </pane>
        <pane size="40" min-size="20">
          <PreviewPanel />
        </pane>
      </splitpanes>
    </div>
    <DependencyModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import HeaderBar from './HeaderBar.vue';
import FileExplorer from '../file-tree/FileExplorer.vue';
import EditorPanel from '../editor/EditorPanel.vue';
import PreviewPanel from '../preview/PreviewPanel.vue';
import DependencyModal from './DependencyModal.vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';

const store = useStore();
const { theme } = storeToRefs(store);

onMounted(() => {
  store.loadTheme();
  store.loadDependencies();
  // Open App.vue by default
  const appFile = store.allFiles.find(f => f.name === 'App.vue');
  if (appFile) {
    store.openFile(appFile.id);
  }
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  overflow: hidden;
}

:deep(.splitpanes) {
  background: var(--bg-secondary);
}

:deep(.splitpanes__pane) {
  background: var(--bg-primary);
  overflow: auto;
}

:deep(.splitpanes__splitter) {
  background: var(--border-color);
  position: relative;
}

:deep(.splitpanes__splitter:before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.splitpanes__splitter:hover:before) {
  opacity: 0.2;
}
</style>
