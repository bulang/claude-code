<template>
  <div class="preview-panel">
    <div class="preview-toolbar">
      <div class="title">
        <Icon icon="carbon:screen" />
        <span>预览</span>
      </div>
      <div class="actions">
        <button class="btn" @click="refresh" title="刷新">
          <Icon icon="carbon:renew" />
        </button>
        <button class="btn" @click="toggleFullscreen" title="全屏">
          <Icon :icon="isFullscreen ? 'carbon:minimize' : 'carbon:maximize'" />
        </button>
      </div>
    </div>
    <div class="preview-content" :class="{ fullscreen: isFullscreen }">
      <div ref="previewContainer" class="preview-container">
        <PreviewRenderer
          :files="fileMap"
          :dependencies="dependencies"
          :key="refreshKey"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import PreviewRenderer from './PreviewRenderer.vue';

const store = useStore();
const { allFiles, dependencies } = storeToRefs(store);

const refreshKey = ref(0);
const isFullscreen = ref(false);
const previewContainer = ref<HTMLElement>();

const fileMap = computed(() => {
  const map: Record<string, string> = {};
  allFiles.value.forEach(file => {
    if (file.type === 'file') {
      map[`/src/${file.name}`] = file.content || '';
    }
  });
  return map;
});

function refresh() {
  refreshKey.value++;
}

function toggleFullscreen() {
  if (!previewContainer.value) return;

  if (!isFullscreen.value) {
    previewContainer.value.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch(err => {
      console.error('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    });
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 4px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.preview-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: var(--bg-primary);
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-container:fullscreen {
  background: white;
}
</style>
